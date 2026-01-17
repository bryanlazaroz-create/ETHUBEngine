import { Engine } from "@babylonjs/core";
import { createGameScene } from "./GameScene.js";

const canvas = document.getElementById("game-canvas");

if (!canvas) {
  throw new Error("Canvas element not found.");
}

const engine = new Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true,
});

const scene = await createGameScene(engine);

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => {
  engine.resize();
});
