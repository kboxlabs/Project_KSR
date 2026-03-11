// v5 main: connected dungeon + golden loot glow (Three r160)
import { initRenderer, renderFrame, getCamera, getTorch, setZoomComputed, getZoomState, buildDungeon, setPlayerTo } from './engine/renderer.js';
import { initInput, updateInput, consumeMoveIntent, getScrollDelta, clearScrollDelta, onTouchHint, onRegenerate } from './engine/input.js';
import { initPhysics, updatePhysics, tryGridMove } from './engine/physics.js';
import { initSound, updateListener, attachTorchSound } from './engine/sound.js';
import { initUI, updateUI, showTouchHint } from './systems/ui.js';
import { generateDungeon } from './world/dungeonGenerator.js';

let lastTime = performance.now();
let fps = 0;
let lastUIUpdate = 0;

function newDungeon() {
  const dungeon = generateDungeon({
    width: 50, height: 42,
    minRooms: 12, maxRooms: 20,
    minRoomSize: 4, maxRoomSize: 10,
    torchChance: 0.08, lootChance: 0.05
  });
  buildDungeon(dungeon);
  if (dungeon.rooms.length) {
    const r = dungeon.rooms[0];
    const cx = Math.floor(r.x + r.w / 2);
    const cy = Math.floor(r.y + r.h / 2);
    setPlayerTo(cx, cy);
  } else {
    setPlayerTo(Math.floor(dungeon.width/2), Math.floor(dungeon.height/2));
  }
}

async function main() {
  await initRenderer();
  initInput();
  initPhysics();
  initUI();
  await initSound();
  attachTorchSound(getTorch(), getCamera());

  newDungeon();

  onTouchHint(() => showTouchHint());
  onRegenerate(() => newDungeon());
  const btn = document.getElementById('btn-gen');
  if (btn) btn.addEventListener('click', () => newDungeon());

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

    if (now - lastUIUpdate >= 250) {
      const { zoomLevel } = getZoomState();
      updateUI({ hp: [20, 20], zoom: zoomLevel, fps });
      lastUIUpdate = now;
    }

    requestAnimationFrame(loop);
  }

  loop();
}

main();
