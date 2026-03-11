import { getPlayer, getTorch, isBlockedTile } from './renderer.js';
import { playHopSound } from './sound.js';

let canMove = true;
const stepSize = 1;
const hopDuration = 200;
const moveCooldown = 1000;
let activeHop = null;
let nextMoveAt = 0;

export function initPhysics() {}
export function updatePhysics(dt) {}

export function tryGridMove(dx, dz) {
  if (!canMove || activeHop) return;
  if (performance.now() < nextMoveAt) return;
  const player = getPlayer();
  const newX = Math.round(player.position.x + dx * stepSize);
  const newZ = Math.round(player.position.z + dz * stepSize);
  const blocked = isBlockedTile(newX, newZ);
  if (blocked) return;

  canMove = false;
  playHopSound();
  const startY = player.position.y;
  const jumpPeak = 0.4;
  const startTime = performance.now();
  const duration = hopDuration;
  nextMoveAt = startTime + moveCooldown;
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
      canMove = performance.now() >= nextMoveAt;
      activeHop = null;
      if (!canMove) {
        const wait = Math.max(0, nextMoveAt - performance.now());
        setTimeout(() => { canMove = true; }, wait);
      }
    }
  }
  hop();
}
