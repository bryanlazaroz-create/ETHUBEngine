import { describe, expect, it } from "vitest";
import { createInitialGameState, updateGameState } from "./logic.js";
import { createVector } from "./types.js";

describe("engine updateGameState", () => {
  it("moves the player when up is pressed", () => {
    const state = createInitialGameState({ enemyCount: 0 });
    const startY = state.player.position.y;
    const nextState = updateGameState(state, { up: true }, 1);
    expect(nextState.player.position.y).toBeLessThan(startY);
  });

  it("captures an enemy within range and in front of the player", () => {
    const state = createInitialGameState({ enemyCount: 1 });
    state.player.position = createVector(200, 200);
    state.player.facing = createVector(1, 0);
    state.enemies[0].position = createVector(240, 200);
    const nextState = updateGameState(state, { action: true }, 0.016);
    expect(nextState.enemies[0].state).toBe("captured");
    expect(nextState.capturedCount).toBe(1);
  });

  it("ends the game when all enemies are captured", () => {
    const state = createInitialGameState({ enemyCount: 1 });
    state.enemies[0].state = "captured";
    const nextState = updateGameState(state, {}, 0.016);
    expect(nextState.isGameOver).toBe(true);
  });
});
