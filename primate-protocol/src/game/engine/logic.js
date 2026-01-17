import {
  add,
  clamp,
  createEnemy,
  createGameState,
  createPlayer,
  createVector,
  length,
  normalize,
  scale,
  sub,
  WORLD_BOUNDS,
} from "./types.js";

const CAPTURE_RADIUS = 1.4;
const CAPTURE_ARC = Math.cos(Math.PI / 3);
const WANDER_RADIUS = 1.6;

const clampPosition = (position) => ({
  x: clamp(position.x, WORLD_BOUNDS.minX, WORLD_BOUNDS.maxX),
  y: clamp(position.y, WORLD_BOUNDS.minY, WORLD_BOUNDS.maxY),
});

const updatePlayer = (player, inputState, dt) => {
  const moveInput = createVector(
    (inputState.right ? 1 : 0) - (inputState.left ? 1 : 0),
    (inputState.down ? 1 : 0) - (inputState.up ? 1 : 0)
  );
  const moveDir = normalize(moveInput);
  const velocity = scale(moveDir, player.speed);
  const nextPosition = clampPosition(add(player.position, scale(velocity, dt)));
  const nextFacing = length(moveInput) > 0 ? moveDir : player.facing;

  return {
    ...player,
    position: nextPosition,
    velocity,
    facing: nextFacing,
    isCapturing: Boolean(inputState.action),
  };
};

const updateEnemy = (enemy, player, dt) => {
  if (enemy.captured) {
    return enemy;
  }

  const toPlayer = sub(player.position, enemy.position);
  const distance = length(toPlayer);
  let nextState = enemy.state;
  let velocity = createVector(0, 0);

  if (distance < enemy.fleeRadius) {
    nextState = "fleeing";
    velocity = scale(normalize(sub(enemy.position, player.position)), enemy.speed + 1.2);
  } else if (distance < enemy.awarenessRadius) {
    nextState = "alert";
    velocity = scale(normalize(toPlayer), enemy.speed);
  } else {
    nextState = "idle";
    const nextAngle = enemy.wanderAngle + dt * 0.8;
    const offset = createVector(
      Math.cos(nextAngle) * WANDER_RADIUS,
      Math.sin(nextAngle) * WANDER_RADIUS
    );
    const target = add(enemy.spawn, offset);
    velocity = scale(normalize(sub(target, enemy.position)), enemy.speed * 0.5);
    return {
      ...enemy,
      state: nextState,
      wanderAngle: nextAngle,
      position: clampPosition(add(enemy.position, scale(velocity, dt))),
    };
  }

  return {
    ...enemy,
    state: nextState,
    position: clampPosition(add(enemy.position, scale(velocity, dt))),
  };
};

const tryCaptureEnemy = (enemy, player, isAction) => {
  if (!isAction || enemy.captured) {
    return enemy;
  }

  const toEnemy = sub(enemy.position, player.position);
  const distance = length(toEnemy);
  if (distance > CAPTURE_RADIUS) {
    return enemy;
  }

  const direction = normalize(toEnemy);
  const facingDot = player.facing.x * direction.x + player.facing.y * direction.y;
  if (facingDot < CAPTURE_ARC) {
    return enemy;
  }

  return {
    ...enemy,
    state: "captured",
    captured: true,
  };
};

export const createInitialGameState = () => {
  const player = createPlayer(createVector(0, 0));
  const enemies = [
    createEnemy("skitterling-01", createVector(-6, -2), createVector(-6, -2)),
    createEnemy("bark-bouncer-01", createVector(5, -3), createVector(5, -3)),
    createEnemy("inkspawn-01", createVector(3, 4), createVector(3, 4)),
    createEnemy("bolt-runner-01", createVector(-4, 5), createVector(-4, 5)),
  ];

  return createGameState({ player, enemies });
};

export const updateGameState = (prevState, inputState, dt) => {
  if (prevState.isGameOver) {
    return prevState;
  }

  const player = updatePlayer(prevState.player, inputState, dt);
  const enemiesAfterAi = prevState.enemies.map((enemy) =>
    updateEnemy(enemy, player, dt)
  );

  let capturedCount = prevState.capturedCount;
  let score = prevState.score;

  const enemies = enemiesAfterAi.map((enemy) => {
    const nextEnemy = tryCaptureEnemy(enemy, player, inputState.action);
    if (!enemy.captured && nextEnemy.captured) {
      capturedCount += 1;
      score += 120;
    }
    return nextEnemy;
  });

  const allCaptured = enemies.every((enemy) => enemy.captured);
  const timeElapsed = prevState.timeElapsed + dt;

  return {
    ...prevState,
    player,
    enemies,
    capturedCount,
    score,
    timeElapsed,
    isGameOver: allCaptured,
  };
};

export const serializeGameState = (state) => ({
  player: {
    position: state.player.position,
    facing: state.player.facing,
  },
  enemies: state.enemies.map((enemy) => ({
    id: enemy.id,
    position: enemy.position,
    spawn: enemy.spawn,
    state: enemy.state,
    captured: enemy.captured,
    wanderAngle: enemy.wanderAngle,
  })),
  capturedCount: state.capturedCount,
  score: state.score,
  timeElapsed: state.timeElapsed,
});

export const hydrateGameState = (snapshot) => {
  if (!snapshot) {
    return createInitialGameState();
  }

  const player = {
    ...createPlayer(createVector(0, 0)),
    position: snapshot.player?.position ?? createVector(0, 0),
    facing: snapshot.player?.facing ?? createVector(1, 0),
  };

  const enemies = (snapshot.enemies ?? []).map((enemy) => ({
    ...createEnemy(enemy.id, enemy.position, enemy.spawn ?? enemy.position),
    state: enemy.state ?? "idle",
    captured: Boolean(enemy.captured),
    wanderAngle: enemy.wanderAngle ?? 0,
  }));

  return {
    ...createGameState({ player, enemies }),
    capturedCount: snapshot.capturedCount ?? 0,
    score: snapshot.score ?? 0,
    timeElapsed: snapshot.timeElapsed ?? 0,
  };
};
