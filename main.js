// v3 main
import { initRenderer, renderFrame, getCamera, getTorch, setZoomComputed, getZoomState } from './engine/renderer.js';
import { initInput, updateInput, consumeMoveIntent, getScrollDelta, clearScrollDelta, onTouchHint } from './engine/input.js';
import { initPhysics, updatePhysics, tryGridMove } from './engine/physics.js';
import { initSound, updateListener, attachTorchSound } from './engine/sound.js';
import { initUI, updateUI, showTouchHint } from './systems/ui.js';

let lastTime = performance.now();
let fps = 0;

async function main() {
  await initRenderer();
  initInput();
  initPhysics();
  initUI();
  await initSound();
  attachTorchSound(getTorch(), getCamera());

  onTouchHint(() => showTouchHint());

  function loop() {
    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    const currentFPS = 1 / Math.max(dt, 1e-6);
    fps = fps * 0.9 + currentFPS * 0.1;

    updateInput();

    const scroll = getScrollDelta();
    if (scroll !== 0) {
      setZoomComputed(scroll);
      clearScrollDelta();
    }

    const intent = consumeMoveIntent();
    if (intent) tryGridMove(intent.dx, intent.dz);

    updatePhysics(dt);
    updateListener(getCamera());
    renderFrame(dt);

    const { zoomLevel } = getZoomState();
    updateUI({ hp: [20, 20], zoom: zoomLevel, fps });

    requestAnimationFrame(loop);
  }

  loop();
}

main();
