let elHP, elZoom, elFPS, elTouch;
let touchTimer = null;

export function initUI() {
  elHP = document.getElementById('hud-hp');
  elZoom = document.getElementById('hud-zoom');
  elFPS = document.getElementById('hud-fps');
  elTouch = document.getElementById('hud-touch');
}

export function updateUI({ hp=[20,20], zoom=7, fps=0 }) {
  if (elHP) elHP.textContent = `HP: ${hp[0]} / ${hp[1]}`;
  if (elZoom) elZoom.textContent = `Zoom: ${zoom.toFixed(1)}×`;
  if (elFPS) elFPS.textContent = `FPS: ${Math.round(fps)}`;
}

export function showTouchHint() {
  if (!elTouch) return;
  elTouch.classList.add('show');
  clearTimeout(touchTimer);
  touchTimer = setTimeout(() => elTouch.classList.remove('show'), 1500);
}
