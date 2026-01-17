export const createHud = () => {
  const root = document.getElementById("hud");
  const status = document.getElementById("hud-status");
  const captured = document.getElementById("hud-captured");
  const time = document.getElementById("hud-time");
  const score = document.getElementById("hud-score");

  return { root, status, captured, time, score };
};

export const updateHud = (hud, gameState, statusText) => {
  if (!hud) {
    return;
  }

  if (hud.status) {
    hud.status.textContent = statusText;
  }
  if (hud.captured) {
    hud.captured.textContent = String(gameState.capturedCount);
  }
  if (hud.time) {
    hud.time.textContent = gameState.timeElapsed.toFixed(1);
  }
  if (hud.score) {
    hud.score.textContent = String(gameState.score);
  }
};
