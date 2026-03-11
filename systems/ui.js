let elHP, elZoom, elFPS, elTouch;
let touchTimer = null;
let lastHPText = '';
let lastZoomText = '';
let lastFPSText = '';

export function initUI() {
  elHP = document.getElementById('hud-hp');
  elZoom = document.getElementById('hud-zoom');
  elFPS = document.getElementById('hud-fps');
  elTouch = document.getElementById('hud-touch');
}

export function updateUI({ hp=[20,20], zoom=7, fps=0 }) {
  const hpText = `HP: ${hp[0]} / ${hp[1]}`;
  const zoomText = `Zoom: ${zoom.toFixed(1)}x`;
  const fpsText = `FPS: ${Math.round(fps)}`;

  if (elHP && hpText !== lastHPText) {
    elHP.textContent = hpText;
    lastHPText = hpText;
  }
  if (elZoom && zoomText !== lastZoomText) {
    elZoom.textContent = zoomText;
    lastZoomText = zoomText;
  }
  if (elFPS && fpsText !== lastFPSText) {
    elFPS.textContent = fpsText;
    lastFPSText = fpsText;
  }
}

export function showTouchHint() {
  if (!elTouch) return;
  elTouch.classList.add('show');
  clearTimeout(touchTimer);
  touchTimer = setTimeout(() => elTouch.classList.remove('show'), 1500);
}
