import Phaser from "phaser";
import { BootScene } from "./BootScene.js";
import { GameScene } from "./GameScene.js";
import { WORLD_BOUNDS } from "../engine/types.js";

const canvas = document.getElementById("game-canvas");

const config = {
  type: Phaser.AUTO,
  width: WORLD_BOUNDS.width,
  height: WORLD_BOUNDS.height,
  canvas,
  backgroundColor: "#0b1020",
  scene: [BootScene, GameScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
