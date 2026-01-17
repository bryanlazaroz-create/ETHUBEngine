export const WORLD_BOUNDS = {
  width: 960,
  height: 540,
  padding: 24,
};

export const DEFAULT_PLAYER_SPEED = 220;
export const DEFAULT_ENEMY_SPEED = 160;
export const ENEMY_AWARENESS_RADIUS = 220;
export const CAPTURE_RADIUS = 60;
export const CAPTURE_CONE_DOT = 0.3;
export const TIME_LIMIT = 180;
export const WANDER_INTERVAL = 2.4;

export function createVector(x = 0, y = 0) {
  return { x, y };
}

export function createPlayer(
  position = createVector(WORLD_BOUNDS.width / 2, WORLD_BOUNDS.height / 2)
) {
  return {
    position,
    velocity: createVector(0, 0),
    speed: DEFAULT_PLAYER_SPEED,
    facing: createVector(1, 0),
    isCapturing: false,
  };
}

export function createEnemy(id, position) {
  return {
    id,
    position,
    state: "idle",
    speed: DEFAULT_ENEMY_SPEED,
    awarenessRadius: ENEMY_AWARENESS_RADIUS,
    wanderDirection: createVector(0, 1),
    wanderTimer: WANDER_INTERVAL,
  };
}

export function createInputState(partial = {}) {
  return {
    up: false,
    down: false,
    left: false,
    right: false,
    action: false,
    ...partial,
  };
}
