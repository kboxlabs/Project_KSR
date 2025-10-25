import { getCamera } from './renderer.js';

let listener;
const loops = new Map();

async function loadAudio(url) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.src = url;
    audio.loop = true;
    audio.preload = 'auto';
    audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
    audio.addEventListener('error', () => reject(new Error('Audio load error for ' + url)), { once: true });
    audio.load();
  });
}

export async function initSound() {
  try {
    const cam = getCamera();
    listener = new THREE.AudioListener();
    cam.add(listener);

    const hum = await loadAudio('./assets/sounds/dungeon_hum.ogg').catch(() => null);
    if (hum) {
      const audio = new THREE.Audio(listener);
      audio.setLoop(true);
      audio.setVolume(0.15);
      audio.setMediaElementSource(hum);
      hum.play();
      loops.set('dungeon_hum', audio);
    }
  } catch (e) {
    console.warn('Sound init failed:', e.message);
  }
}

export function attachTorchSound(torch, cam) {
  loadAudio('./assets/sounds/torch_crackle.ogg').then(media => {
    const crackle = new THREE.PositionalAudio(listener);
    crackle.setLoop(true);
    crackle.setRefDistance(4);
    crackle.setVolume(0.25);
    crackle.setMediaElementSource(media);
    media.play();
    torch.add(crackle);
    loops.set('torch', crackle);
  }).catch(() => {});
}

export function updateListener(camera) {}
