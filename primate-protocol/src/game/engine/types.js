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

/**
 * Create a simple 2D vector object.
 * @param {number} [x=0] - Horizontal component.
 * @param {number} [y=0] - Vertical component.
 * @returns {{x:number,y:number}} Vector object.
 */
export function createVector(x = 0, y = 0) {
  return { x, y };
}

/**
 * Build the default player state.
 * @param {{x:number,y:number}} [position] - Initial position.
 * @returns {{position:{x:number,y:number},velocity:{x:number,y:number},speed:number,facing:{x:number,y:number},isCapturing:boolean}} Player state.
 */
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

/**
 * Build an enemy state record.
 * @param {string} id - Unique enemy identifier.
 * @param {{x:number,y:number}} position - Initial position.
 * @returns {{id:string,position:{x:number,y:number},state:string,speed:number,awarenessRadius:number,wanderDirection:{x:number,y:number},wanderTimer:number}} Enemy state.
 */
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

/**
 * Create a normalized input state for the engine.
 * @param {Partial<{up:boolean,down:boolean,left:boolean,right:boolean,action:boolean}>} [partial] - Overrides.
 * @returns {{up:boolean,down:boolean,left:boolean,right:boolean,action:boolean}} Input state.
 */
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
