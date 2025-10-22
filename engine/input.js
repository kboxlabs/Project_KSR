// Input: keyboard + wheel
let keys = Object.create(null);
let moveIntent = null;
let scrollDelta = 0;

export function initInput() {
  window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
  });
  window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
  });
  window.addEventListener('wheel', (e) => {
    const delta = Math.sign(e.deltaY);
    scrollDelta += delta;
  }, { passive: true });
}

export function updateInput() {
  // lock to one intent per frame to preserve turn-like feel
  if (!moveIntent) {
    if (keys['arrowup'] || keys['w']) moveIntent = { dx: 0, dz: -1 };
    else if (keys['arrowdown'] || keys['s']) moveIntent = { dx: 0, dz: 1 };
    else if (keys['arrowleft'] || keys['a']) moveIntent = { dx: -1, dz: 0 };
    else if (keys['arrowright'] || keys['d']) moveIntent = { dx: 1, dz: 0 };
  }
}

export function consumeMoveIntent() {
  const i = moveIntent;
  moveIntent = null;
  return i;
}

export function getScrollDelta() { return scrollDelta; }
export function clearScrollDelta() { scrollDelta = 0; }
