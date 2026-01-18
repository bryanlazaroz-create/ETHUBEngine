import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  /**
   * Create the boot scene instance.
   */
  constructor() {
    super("BootScene");
  }

  /**
   * Preload core assets required by the game scene.
   */
  preload() {
    this.load.image("player", "/assets/sprites/player.svg");
    this.load.image("enemy", "/assets/sprites/enemy.svg");
    this.load.image("tile", "/assets/sprites/tile.svg");
  }

  /**
   * Start the main game scene after assets load.
   */
  create() {
    this.scene.start("GameScene");
  }
}
