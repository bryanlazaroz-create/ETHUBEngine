import {
  ArcRotateCamera,
  Color3,
  Color4,
  FollowCamera,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Vector3,
  Scene,
} from "@babylonjs/core";
import { createInputState } from "../engine/types.js";
import {
  createInitialGameState,
  hydrateGameState,
  serializeGameState,
  updateGameState,
} from "../engine/logic.js";
import {
  createConvexClient,
  loadProgress,
  saveProgress,
  submitScore,
} from "./convexClient.js";
import { createHud, updateHud } from "./hud.js";

const KEY_BINDINGS = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
};

const ACTION_KEY = "Space";
const SAVE_KEY = "KeyP";
const RESET_KEY = "KeyR";
const CAMERA_KEY = "KeyC";
const DEFAULT_SLOT = 1;

const toWorldPosition = (position2d, height = 0.8) =>
  new Vector3(position2d.x, height, position2d.y);

export const createGameScene = async (engine) => {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.03, 0.05, 0.08, 1);

  const light = new HemisphericLight("hemi", new Vector3(0, 1, 0), scene);
  light.intensity = 0.9;

  const ground = MeshBuilder.CreateGround(
    "ground",
    { width: 32, height: 20 },
    scene
  );
  const groundMaterial = new StandardMaterial("ground-mat", scene);
  groundMaterial.diffuseColor = new Color3(0.06, 0.1, 0.13);
  groundMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
  ground.material = groundMaterial;

  const playerMaterial = new StandardMaterial("player-mat", scene);
  playerMaterial.diffuseColor = new Color3(0.2, 0.9, 0.7);

  const enemyMaterials = {
    idle: new StandardMaterial("enemy-idle", scene),
    alert: new StandardMaterial("enemy-alert", scene),
    fleeing: new StandardMaterial("enemy-flee", scene),
    captured: new StandardMaterial("enemy-captured", scene),
  };
  enemyMaterials.idle.diffuseColor = new Color3(0.4, 0.85, 0.4);
  enemyMaterials.alert.diffuseColor = new Color3(0.96, 0.69, 0.25);
  enemyMaterials.fleeing.diffuseColor = new Color3(0.96, 0.35, 0.35);
  enemyMaterials.captured.diffuseColor = new Color3(0.2, 0.2, 0.2);

  const playerMesh = MeshBuilder.CreateCapsule(
    "player",
    { radius: 0.5, height: 1.6 },
    scene
  );
  playerMesh.material = playerMaterial;

  const enemyMeshes = new Map();

  const followCamera = new FollowCamera(
    "follow-camera",
    new Vector3(0, 12, -16),
    scene
  );
  followCamera.radius = 12;
  followCamera.heightOffset = 5;
  followCamera.rotationOffset = 180;
  followCamera.cameraAcceleration = 0.05;
  followCamera.maxCameraSpeed = 12;
  followCamera.lockedTarget = playerMesh;

  const topCamera = new ArcRotateCamera(
    "top-camera",
    Math.PI / 2,
    Math.PI / 2.2,
    22,
    new Vector3(0, 0, 0),
    scene
  );
  topCamera.lowerRadiusLimit = 18;
  topCamera.upperRadiusLimit = 28;
  topCamera.attachControl(true);

  scene.activeCamera = followCamera;

  const inputState = createInputState();
  const hud = createHud();
  const { client, status } = createConvexClient();
  let statusText = status;
  let autosaveTimer = 0;
  let scoreSubmitted = false;

  let gameState = createInitialGameState();
  if (client) {
    const { data, error } = await loadProgress(client, DEFAULT_SLOT);
    if (data?.data) {
      gameState = hydrateGameState(data.data);
      statusText = "Save loaded from Convex.";
    } else if (error) {
      statusText = `Convex: ${error}`;
    } else {
      statusText = "Convex ready. No save found.";
    }
  }

  const syncEnemies = () => {
    gameState.enemies.forEach((enemy) => {
      if (!enemyMeshes.has(enemy.id)) {
        const mesh = MeshBuilder.CreateSphere(enemy.id, { diameter: 1.1 }, scene);
        mesh.material = enemyMaterials.idle;
        enemyMeshes.set(enemy.id, mesh);
      }
      const mesh = enemyMeshes.get(enemy.id);
      mesh.position = toWorldPosition(enemy.position, 0.7);
      mesh.material = enemyMaterials[enemy.state] ?? enemyMaterials.idle;
      mesh.setEnabled(!enemy.captured || enemy.state !== "captured");
    });
  };

  syncEnemies();
  playerMesh.position = toWorldPosition(gameState.player.position, 0.9);
  updateHud(hud, gameState, statusText);

  const requestSave = async (reason) => {
    if (!client) {
      statusText = "Convex not configured. Saves disabled.";
      return;
    }
    const payload = serializeGameState(gameState);
    const result = await saveProgress(client, DEFAULT_SLOT, payload);
    statusText = result.ok
      ? `Saved (${reason}).`
      : `Save failed: ${result.error}`;
  };

  const resetGame = () => {
    gameState = createInitialGameState();
    scoreSubmitted = false;
    autosaveTimer = 0;
    syncEnemies();
    statusText = "New run started.";
  };

  window.addEventListener("keydown", (event) => {
    const bound = KEY_BINDINGS[event.code];
    if (bound) {
      inputState[bound] = true;
      event.preventDefault();
    }
    if (event.code === ACTION_KEY) {
      inputState.action = true;
      event.preventDefault();
    }
    if (event.code === SAVE_KEY) {
      void requestSave("manual");
    }
    if (event.code === RESET_KEY) {
      resetGame();
    }
    if (event.code === CAMERA_KEY) {
      scene.activeCamera =
        scene.activeCamera === followCamera ? topCamera : followCamera;
    }
  });

  window.addEventListener("keyup", (event) => {
    const bound = KEY_BINDINGS[event.code];
    if (bound) {
      inputState[bound] = false;
      event.preventDefault();
    }
    if (event.code === ACTION_KEY) {
      inputState.action = false;
    }
  });

  scene.onBeforeRenderObservable.add(() => {
    const dt = engine.getDeltaTime() / 1000;
    autosaveTimer += dt;

    gameState = updateGameState(gameState, inputState, dt);
    playerMesh.position = toWorldPosition(gameState.player.position, 0.9);
    syncEnemies();

    if (gameState.isGameOver && !scoreSubmitted) {
      statusText = "All captured! Press R to restart.";
      scoreSubmitted = true;
      if (client) {
        void submitScore(client, {
          score: gameState.score,
          capturedCount: gameState.capturedCount,
          timeElapsed: Math.round(gameState.timeElapsed * 10) / 10,
        });
      }
    }

    if (autosaveTimer > 15) {
      autosaveTimer = 0;
      void requestSave("autosave");
    }

    updateHud(hud, gameState, statusText);
    if (inputState.action) {
      inputState.action = false;
    }
  });

  return scene;
};
