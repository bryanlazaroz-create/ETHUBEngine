import {
  CAPTURE_CONE_DOT,
  CAPTURE_RADIUS,
  TIME_LIMIT,
  WANDER_INTERVAL,
  WORLD_BOUNDS,
  createEnemy,
  createInputState,
  createPlayer,
  createVector,
} from "./types.js";

const DEFAULT_ENEMY_POSITIONS = [
  createVector(160, 120),
  createVector(760, 140),
  createVector(220, 420),
  createVector(720, 380),
  createVector(480, 260),
];

export function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(vector, scalar) {
  return { x: vector.x * scalar, y: vector.y * scalar };
}

export function length(vector) {
  return Math.hypot(vector.x, vector.y);
}

export function normalize(vector) {
  const size = length(vector);
  if (size === 0) {
    return { x: 0, y: 0 };
  }
  return { x: vector.x / size, y: vector.y / size };
}

export function dot(a, b) {
  return a.x * b.x + a.y * b.y;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clampPosition(position) {
  return {
    x: clamp(
      position.x,
      WORLD_BOUNDS.padding,
      WORLD_BOUNDS.width - WORLD_BOUNDS.padding
    ),
    y: clamp(
      position.y,
      WORLD_BOUNDS.padding,
      WORLD_BOUNDS.height - WORLD_BOUNDS.padding
    ),
  };
}

function safeNumber(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function safeVector(value, fallback) {
  if (
    value &&
    Number.isFinite(value.x) &&
    Number.isFinite(value.y)
  ) {
    return { x: value.x, y: value.y };
  }
  return { x: fallback.x, y: fallback.y };
}

function normalizeDirection(value, fallback) {
  const normalized = normalize(value);
  if (normalized.x === 0 && normalized.y === 0) {
    return { x: fallback.x, y: fallback.y };
  }
  return normalized;
}

function isValidEnemyState(state) {
  return (
    state === "idle" ||
    state === "alert" ||
    state === "fleeing" ||
    state === "captured"
  );
}

export function createInitialGameState(options = {}) {
  const enemyCount = Math.max(
    0,
    Math.floor(safeNumber(options.enemyCount, DEFAULT_ENEMY_POSITIONS.length))
  );
  const enemies = [];
  for (let i = 0; i < enemyCount; i += 1) {
    const spawn =
      DEFAULT_ENEMY_POSITIONS[i % DEFAULT_ENEMY_POSITIONS.length];
    const enemy = createEnemy(`enemy-${i}`, createVector(spawn.x, spawn.y));
    enemy.wanderDirection = normalizeDirection(
      createVector(i % 2 === 0 ? 1 : -1, i % 3 === 0 ? 1 : -1),
      createVector(1, 0)
    );
    enemies.push(enemy);
  }

  return {
    player: createPlayer(),
    enemies,
    capturedCount: 0,
    score: 0,
    timeElapsed: 0,
    isGameOver: false,
  };
}

export function applySavedGameState(saved) {
  if (!saved || typeof saved !== "object") {
    return createInitialGameState();
  }

  const enemyCount = Array.isArray(saved.enemies)
    ? saved.enemies.length
    : undefined;
  const base = createInitialGameState({ enemyCount });

  const player = {
    ...base.player,
    position: clampPosition(
      safeVector(saved.player?.position, base.player.position)
    ),
    velocity: safeVector(saved.player?.velocity, base.player.velocity),
    speed: safeNumber(saved.player?.speed, base.player.speed),
    facing: normalizeDirection(
      safeVector(saved.player?.facing, base.player.facing),
      base.player.facing
    ),
    isCapturing: Boolean(saved.player?.isCapturing),
  };

  const enemiesSource = Array.isArray(saved.enemies)
    ? saved.enemies
    : base.enemies;

  const enemies = enemiesSource.map((enemy, index) => {
    const fallback =
      base.enemies[index] ??
      createEnemy(`enemy-${index}`, createVector(0, 0));
    return {
      ...fallback,
      position: clampPosition(
        safeVector(enemy?.position, fallback.position)
      ),
      state: isValidEnemyState(enemy?.state)
        ? enemy.state
        : fallback.state,
      speed: safeNumber(enemy?.speed, fallback.speed),
      awarenessRadius: safeNumber(
        enemy?.awarenessRadius,
        fallback.awarenessRadius
      ),
      wanderDirection: normalizeDirection(
        safeVector(enemy?.wanderDirection, fallback.wanderDirection),
        fallback.wanderDirection
      ),
      wanderTimer: safeNumber(enemy?.wanderTimer, fallback.wanderTimer),
    };
  });

  const capturedCount = safeNumber(
    saved.capturedCount,
    enemies.filter((enemy) => enemy.state === "captured").length
  );
  const score = safeNumber(saved.score, capturedCount * 100);
  const timeElapsed = safeNumber(saved.timeElapsed, 0);
  const isGameOver =
    Boolean(saved.isGameOver) ||
    enemies.every((enemy) => enemy.state === "captured") ||
    timeElapsed >= TIME_LIMIT;

  return {
    ...base,
    player,
    enemies,
    capturedCount,
    score,
    timeElapsed,
    isGameOver,
  };
}

export function serializeGameState(state) {
  return {
    player: {
      position: { ...state.player.position },
      velocity: { ...state.player.velocity },
      speed: state.player.speed,
      facing: { ...state.player.facing },
      isCapturing: state.player.isCapturing,
    },
    enemies: state.enemies.map((enemy) => ({
      id: enemy.id,
      position: { ...enemy.position },
      state: enemy.state,
      speed: enemy.speed,
      awarenessRadius: enemy.awarenessRadius,
      wanderDirection: { ...enemy.wanderDirection },
      wanderTimer: enemy.wanderTimer,
    })),
    capturedCount: state.capturedCount,
    score: state.score,
    timeElapsed: state.timeElapsed,
    isGameOver: state.isGameOver,
  };
}

function updateEnemy(enemy, player, dt) {
  const next = {
    ...enemy,
    position: { ...enemy.position },
    wanderDirection: { ...enemy.wanderDirection },
    wanderTimer: enemy.wanderTimer,
  };

  if (enemy.state === "captured") {
    return next;
  }

  const toPlayer = sub(player.position, enemy.position);
  const distanceToPlayer = length(toPlayer);
  let speedScale = 0.5;
  let nextState = enemy.state;

  if (distanceToPlayer <= enemy.awarenessRadius) {
    if (distanceToPlayer <= CAPTURE_RADIUS * 1.4) {
      nextState = "fleeing";
      next.wanderDirection = normalizeDirection(
        scale(toPlayer, -1),
        next.wanderDirection
      );
      speedScale = 1.2;
    } else {
      nextState = "alert";
      next.wanderDirection = normalizeDirection(
        toPlayer,
        next.wanderDirection
      );
      speedScale = 1;
    }
    next.wanderTimer = WANDER_INTERVAL;
  } else {
    nextState = "idle";
    next.wanderTimer -= dt;
    if (next.wanderTimer <= 0) {
      const rotated = {
        x: -next.wanderDirection.y,
        y: next.wanderDirection.x,
      };
      next.wanderDirection = normalizeDirection(rotated, createVector(1, 0));
      next.wanderTimer = WANDER_INTERVAL;
    }
  }

  next.state = nextState;
  const velocity = scale(next.wanderDirection, next.speed * speedScale);
  next.position = clampPosition(add(next.position, scale(velocity, dt)));
  return next;
}

export function updateGameState(prevGameState, inputState, dt) {
  const safeDt = Math.max(0, safeNumber(dt, 0));
  const input = createInputState(inputState);

  if (prevGameState.isGameOver) {
    return {
      ...prevGameState,
      player: { ...prevGameState.player },
      enemies: prevGameState.enemies.map((enemy) => ({ ...enemy })),
    };
  }

  const player = {
    ...prevGameState.player,
    position: { ...prevGameState.player.position },
    velocity: { ...prevGameState.player.velocity },
    facing: { ...prevGameState.player.facing },
  };

  const movement = {
    x: (input.right ? 1 : 0) - (input.left ? 1 : 0),
    y: (input.down ? 1 : 0) - (input.up ? 1 : 0),
  };
  const hasMovement = movement.x !== 0 || movement.y !== 0;

  if (hasMovement) {
    const direction = normalize(movement);
    player.velocity = scale(direction, player.speed);
    player.position = clampPosition(
      add(player.position, scale(player.velocity, safeDt))
    );
    player.facing = direction;
  } else {
    player.velocity = createVector(0, 0);
  }

  player.isCapturing = Boolean(input.action);

  const enemies = prevGameState.enemies.map((enemy) =>
    updateEnemy(enemy, player, safeDt)
  );

  if (player.isCapturing) {
    const forward = normalizeDirection(player.facing, createVector(1, 0));
    enemies.forEach((enemy) => {
      if (enemy.state === "captured") {
        return;
      }
      const toEnemy = sub(enemy.position, player.position);
      const distanceToEnemy = length(toEnemy);
      if (distanceToEnemy > CAPTURE_RADIUS) {
        return;
      }
      const alignment = dot(normalizeDirection(toEnemy, forward), forward);
      if (alignment >= CAPTURE_CONE_DOT) {
        enemy.state = "captured";
      }
    });
  }

  const capturedCount = enemies.filter(
    (enemy) => enemy.state === "captured"
  ).length;
  const score = capturedCount * 100;
  const timeElapsed = safeNumber(prevGameState.timeElapsed, 0) + safeDt;
  const isGameOver =
    enemies.length > 0 &&
    (enemies.every((enemy) => enemy.state === "captured") ||
      timeElapsed >= TIME_LIMIT);

  return {
    ...prevGameState,
    player,
    enemies,
    capturedCount,
    score,
    timeElapsed,
    isGameOver,
  };
}
