export const createVector = (x = 0, y = 0) => ({ x, y });

export const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (v, s) => ({ x: v.x * s, y: v.y * s });
export const length = (v) => Math.hypot(v.x, v.y);
export const normalize = (v) => {
  const len = length(v);
  return len > 0 ? { x: v.x / len, y: v.y / len } : { x: 0, y: 0 };
};
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const WORLD_BOUNDS = {
  minX: -14,
  maxX: 14,
  minY: -9,
  maxY: 9,
};

export const createPlayer = (position = createVector(0, 0)) => ({
  position,
  velocity: createVector(0, 0),
  speed: 6,
  facing: createVector(1, 0),
  isCapturing: false,
});

export const createEnemy = (id, position, spawn) => ({
  id,
  position,
  spawn,
  state: "idle",
  speed: 3.2,
  awarenessRadius: 6,
  fleeRadius: 2,
  wanderAngle: 0,
  captured: false,
});

export const createGameState = ({ player, enemies }) => ({
  player,
  enemies,
  capturedCount: 0,
  score: 0,
  timeElapsed: 0,
  isGameOver: false,
});

export const createInputState = () => ({
  up: false,
  down: false,
  left: false,
  right: false,
  action: false,
});
