// Main bootstrap
import { initRenderer, renderFrame, getCamera, getTorch, getPlayer, setZoomComputed, getZoomState } from './engine/renderer.js';
import { initInput, updateInput, consumeMoveIntent, getScrollDelta, clearScrollDelta } from './engine/input.js';
import { initPhysics, updatePhysics, tryGridMove } from './engine/physics.js';
import { initSound, updateListener, attachTorchSound } from './engine/sound.js';
import { initUI, updateUI } from './systems/ui.js';

let lastTime = performance.now();
let fps = 0;

async function main() {
  await initRenderer();
  initInput();
  initPhysics();
  initUI();
  await initSound();

  // Attach positional torch crackle to the torch in the scene
  attachTorchSound(getTorch(), getCamera());

  function loop() {
    const now = performance.now();
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    // fps EMA for stability
    const currentFPS = 1 / Math.max(dt, 1e-6);
    fps = fps * 0.9 + currentFPS * 0.1;

    // input
    updateInput();

    // handle scroll-based zoom target
    const scroll = getScrollDelta();
    if (scroll !== 0) {
      // renderer keeps target zoom; we just inform via state
      setZoomComputed(scroll);
      clearScrollDelta();
    }

    // movement intent (cardinal only)
    const intent = consumeMoveIntent();
    if (intent) {
      tryGridMove(intent.dx, intent.dz);
    }

    // physics + render
    updatePhysics(dt);
    updateListener(getCamera()); // keep audio listener with camera
    renderFrame(dt);

    // UI update
    const { zoomLevel } = getZoomState();
    updateUI({ hp: [20, 20], zoom: zoomLevel, fps });

    requestAnimationFrame(loop);
  }

  loop();
}

main();
