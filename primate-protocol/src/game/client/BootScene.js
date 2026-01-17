import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }

  preload() {
    this.load.image("player", "/assets/sprites/player.svg");
    this.load.image("enemy", "/assets/sprites/enemy.svg");
    this.load.image("tile", "/assets/sprites/tile.svg");
  }

  create() {
    this.scene.start("GameScene");
  }
}
