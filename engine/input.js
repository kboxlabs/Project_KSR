// Input: keyboard + mouse wheel + mobile swipes + pinch zoom
let keys = Object.create(null);
let moveIntent = null;
let scrollDelta = 0;

let touchStartX = 0, touchStartY = 0;
let touchEndX = 0, touchEndY = 0;
const SWIPE_THRESHOLD = 30;

// Pinch
let pinchStartDist = 0;
let pinchAccumulator = 0;
const PINCH_STEP_PX = 40;

let touchHintCb = null;

export function initInput() {
  window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
  window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

  window.addEventListener('wheel', e => {
    const delta = Math.sign(e.deltaY);
    scrollDelta += delta;
  }, { passive: true });

  window.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      if (touchHintCb) touchHintCb();
    } else if (e.touches.length === 2) {
      pinchStartDist = distance(e.touches[0], e.touches[1]);
    }
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
      const dist = distance(e.touches[0], e.touches[1]);
      const delta = dist - pinchStartDist;
      pinchAccumulator += delta;
      while (Math.abs(pinchAccumulator) >= PINCH_STEP_PX) {
        scrollDelta += (pinchAccumulator > 0) ? -1 : 1; // pinch out => zoom in
        pinchAccumulator += (pinchAccumulator > 0) ? -PINCH_STEP_PX : PINCH_STEP_PX;
      }
      pinchStartDist = dist;
    }
  }, { passive: true });

  window.addEventListener('touchend', e => {
    if (e.touches.length === 0 && e.changedTouches.length === 1) {
      const t = e.changedTouches[0];
      touchEndX = t.clientX;
      touchEndY = t.clientY;
      handleSwipe();
    }
    if (e.touches.length < 2) {
      pinchStartDist = 0;
      pinchAccumulator = 0;
    }
  }, { passive: true });
}

function distance(a, b) {
  const dx = a.clientX - b.clientX;
  const dy = a.clientY - b.clientY;
  return Math.hypot(dx, dy);
}

function handleSwipe() {
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  if (absX < SWIPE_THRESHOLD && absY < SWIPE_THRESHOLD) return;
  if (absX > absY) {
    moveIntent = dx > 0 ? { dx: 1, dz: 0 } : { dx: -1, dz: 0 };
  } else {
    moveIntent = dy > 0 ? { dx: 0, dz: 1 } : { dx: 0, dz: -1 };
  }
}

export function updateInput() {
  if (!moveIntent) {
    if (keys['arrowup'] || keys['w']) moveIntent = { dx: 0, dz: -1 };
    else if (keys['arrowdown'] || keys['s']) moveIntent = { dx: 0, dz: 1 };
    else if (keys['arrowleft'] || keys['a']) moveIntent = { dx: -1, dz: 0 };
    else if (keys['arrowright'] || keys['d']) moveIntent = { dx: 1, dz: 0 };
  }
}

export function consumeMoveIntent() { const i = moveIntent; moveIntent = null; return i; }
export function getScrollDelta() { return scrollDelta; }
export function clearScrollDelta() { scrollDelta = 0; }
export function onTouchHint(cb) { touchHintCb = cb; }
