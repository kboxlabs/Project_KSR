import { getScene, getPlayer, getWalls, getTorch } from './renderer.js';

let canMove = true;
const stepSize = 1;
const moveDelay = 200;
let activeHop = null;

export function initPhysics() {
  // nothing yet
}

export function updatePhysics(dt) {
  // placeholder if needed
}

export function tryGridMove(dx, dz) {
  if (!canMove || activeHop) return;
  const player = getPlayer();
  const walls = getWalls();
  const newX = player.position.x + dx * stepSize;
  const newZ = player.position.z + dz * stepSize;
  const blocked = walls.some(w => Math.abs(w.position.x - newX) < 0.9 && Math.abs(w.position.z - newZ) < 0.9);
  if (blocked) return;

  canMove = false;
  const startY = player.position.y;
  const jumpPeak = 0.4;
  const startTime = performance.now();
  const duration = moveDelay;
  const startPos = player.position.clone();
  const endPos = startPos.clone(); endPos.x = newX; endPos.z = newZ;
  const torch = getTorch();

  function hop() {
    const elapsed = performance.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    const eased = 0.5 - 0.5 * Math.cos(Math.PI * t);
    player.position.lerpVectors(startPos, endPos, eased);
    player.position.y = startY + Math.sin(Math.PI * t) * jumpPeak;
    torch.position.set(player.position.x, 2.5, player.position.z);
    if (t < 1) {
      activeHop = requestAnimationFrame(hop);
    } else {
      player.position.y = startY;
      canMove = true;
      activeHop = null;
    }
  }
  hop();
}
