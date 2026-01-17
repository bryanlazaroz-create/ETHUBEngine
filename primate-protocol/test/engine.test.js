import assert from "node:assert/strict";
import test from "node:test";
import {
  createGameState,
  createInputState,
  createPlayer,
  createEnemy,
} from "../src/game/engine/types.js";
import { updateGameState } from "../src/game/engine/logic.js";

test("player moves up when input is pressed", () => {
  const player = createPlayer({ x: 0, y: 0 });
  const enemy = createEnemy("enemy-01", { x: 4, y: 0 }, { x: 4, y: 0 });
  const state = createGameState({ player, enemies: [enemy] });
  const input = createInputState();
  input.up = true;

  const next = updateGameState(state, input, 1);
  assert.ok(next.player.position.y < state.player.position.y);
});

test("enemy is captured when action is used in range and facing", () => {
  const player = createPlayer({ x: 0, y: 0 });
  player.facing = { x: 1, y: 0 };
  const enemy = createEnemy("enemy-01", { x: 1, y: 0 }, { x: 1, y: 0 });
  const state = createGameState({ player, enemies: [enemy] });
  const input = createInputState();
  input.action = true;

  const next = updateGameState(state, input, 0.016);
  assert.equal(next.enemies[0].captured, true);
  assert.equal(next.capturedCount, 1);
});

test("game ends when all enemies are captured", () => {
  const player = createPlayer({ x: 0, y: 0 });
  player.facing = { x: 1, y: 0 };
  const enemy = createEnemy("enemy-01", { x: 1, y: 0 }, { x: 1, y: 0 });
  const state = createGameState({ player, enemies: [enemy] });
  const input = createInputState();
  input.action = true;

  const next = updateGameState(state, input, 0.016);
  assert.equal(next.isGameOver, true);
});
