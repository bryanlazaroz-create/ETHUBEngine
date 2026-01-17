import Phaser from "phaser";
import {
  applySavedGameState,
  createInitialGameState,
  serializeGameState,
  updateGameState,
} from "../engine/logic.js";
import { CAPTURE_RADIUS, TIME_LIMIT, WORLD_BOUNDS } from "../engine/types.js";
import { ensureProfile, hasConvex, loadProgress, saveProgress } from "./saveService.js";

const SAVE_SLOT = 1;
const AUTO_SAVE_INTERVAL = 10000;

export class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.gameState = null;
    this.playerSprite = null;
    this.enemySprites = new Map();
    this.captureRing = null;
    this.scoreText = null;
    this.statusText = null;
    this.lastCapturedCount = 0;
    this.saveTimer = AUTO_SAVE_INTERVAL;
    this.saveInFlight = false;
    this.savedGameOver = false;
  }

  create() {
    this.gameState = createInitialGameState();

    this.add
      .tileSprite(0, 0, WORLD_BOUNDS.width, WORLD_BOUNDS.height, "tile")
      .setOrigin(0, 0);

    this.playerSprite = this.add.sprite(
      this.gameState.player.position.x,
      this.gameState.player.position.y,
      "player"
    );
    this.playerSprite.setDepth(2);

    this.captureRing = this.add
      .circle(
        this.gameState.player.position.x,
        this.gameState.player.position.y,
        CAPTURE_RADIUS,
        0xffffff,
        0.08
      )
      .setStrokeStyle(2, 0xffffff, 0.4)
      .setDepth(1)
      .setVisible(false);

    this.buildEnemySprites();

    this.scoreText = this.add
      .text(16, 16, "", { fontFamily: "Arial", fontSize: "18px", color: "#e2e8f0" })
      .setDepth(3);
    this.statusText = this.add
      .text(16, 40, "", { fontFamily: "Arial", fontSize: "14px", color: "#94a3b8" })
      .setDepth(3);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D,SPACE,E");

    this.updateHud();
    this.bootstrapConvex();
  }

  buildEnemySprites() {
    this.enemySprites.forEach((sprite) => sprite.destroy());
    this.enemySprites.clear();
    this.gameState.enemies.forEach((enemy) => {
      const sprite = this.add.sprite(enemy.position.x, enemy.position.y, "enemy");
      sprite.setDepth(2);
      this.enemySprites.set(enemy.id, sprite);
    });
  }

  async bootstrapConvex() {
    if (!hasConvex()) {
      this.statusText.setText("Convex not configured. Running offline.");
      return;
    }

    await ensureProfile();
    const saved = await loadProgress(SAVE_SLOT);
    if (saved?.data) {
      this.gameState = applySavedGameState(saved.data);
      this.lastCapturedCount = this.gameState.capturedCount;
      this.buildEnemySprites();
      this.syncSprites();
      this.updateHud();
      this.statusText.setText("Save loaded. Secure all targets.");
    } else {
      this.statusText.setText("New mission. Secure all targets.");
    }
  }

  buildInputState() {
    return {
      up: this.cursors.up.isDown || this.keys.W.isDown,
      down: this.cursors.down.isDown || this.keys.S.isDown,
      left: this.cursors.left.isDown || this.keys.A.isDown,
      right: this.cursors.right.isDown || this.keys.D.isDown,
      action: this.keys.SPACE.isDown || this.keys.E.isDown,
    };
  }

  update(_time, delta) {
    if (!this.gameState) {
      return;
    }

    const dt = delta / 1000;
    const inputState = this.buildInputState();

    this.gameState = updateGameState(this.gameState, inputState, dt);
    this.syncSprites();
    this.updateHud();
    this.handleAutosave(delta);
  }

  syncSprites() {
    this.playerSprite.setPosition(
      this.gameState.player.position.x,
      this.gameState.player.position.y
    );
    this.playerSprite.setRotation(
      Math.atan2(this.gameState.player.facing.y, this.gameState.player.facing.x)
    );

    this.captureRing
      .setPosition(
        this.gameState.player.position.x,
        this.gameState.player.position.y
      )
      .setVisible(this.gameState.player.isCapturing);

    this.gameState.enemies.forEach((enemy) => {
      const sprite = this.enemySprites.get(enemy.id);
      if (!sprite) {
        return;
      }
      sprite.setPosition(enemy.position.x, enemy.position.y);
      if (enemy.state === "captured") {
        sprite.setTint(0x4ade80);
        sprite.setAlpha(0.4);
      } else if (enemy.state === "alert") {
        sprite.setTint(0xf97316);
        sprite.setAlpha(1);
      } else if (enemy.state === "fleeing") {
        sprite.setTint(0xef4444);
        sprite.setAlpha(1);
      } else {
        sprite.clearTint();
        sprite.setAlpha(1);
      }
    });
  }

  updateHud() {
    const remaining = this.gameState.enemies.filter(
      (enemy) => enemy.state !== "captured"
    ).length;
    const timeRemaining = Math.max(
      0,
      Math.ceil(TIME_LIMIT - this.gameState.timeElapsed)
    );
    this.scoreText.setText(
      `Captured: ${this.gameState.capturedCount} | Remaining: ${remaining} | Time: ${timeRemaining}s`
    );

    if (this.gameState.isGameOver && !this.savedGameOver) {
      this.statusText.setText("Mission complete. Final data saved.");
    }
  }

  handleAutosave(delta) {
    if (!hasConvex()) {
      return;
    }

    if (this.gameState.capturedCount !== this.lastCapturedCount) {
      this.lastCapturedCount = this.gameState.capturedCount;
      this.saveTimer = Math.min(this.saveTimer, 500);
    }

    if (this.gameState.isGameOver && !this.savedGameOver) {
      this.savedGameOver = true;
      this.persistState("Game over");
      return;
    }

    this.saveTimer -= delta;
    if (this.saveTimer <= 0) {
      this.saveTimer = AUTO_SAVE_INTERVAL;
      this.persistState("Autosave");
    }
  }

  async persistState(reason) {
    if (this.saveInFlight) {
      return;
    }
    this.saveInFlight = true;
    const payload = serializeGameState(this.gameState);
    const success = await saveProgress(SAVE_SLOT, payload);
    this.saveInFlight = false;
    if (success) {
      this.statusText.setText(`${reason}: synced with Convex.`);
    } else {
      this.statusText.setText(`${reason}: save failed (auth required).`);
    }
  }
}
