let elHP, elZoom, elFPS;

export function initUI() {
  elHP = document.getElementById('hud-hp');
  elZoom = document.getElementById('hud-zoom');
  elFPS = document.getElementById('hud-fps');
}

export function updateUI({ hp=[20,20], zoom=7, fps=0 }) {
  if (elHP) elHP.textContent = `HP: ${hp[0]} / ${hp[1]}`;
  if (elZoom) elZoom.textContent = `Zoom: ${zoom.toFixed(1)}×`;
  if (elFPS) elFPS.textContent = `FPS: ${Math.round(fps)}`;
}
