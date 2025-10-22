// Basic 3D audio using Three.js
import { getCamera } from './renderer.js';

let listener;
const buffers = new Map();
const loops = new Map();

async function loadAudio(url) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.src = url;
    audio.loop = true;
    audio.preload = 'auto';
    audio.addEventListener('canplaythrough', () => resolve(audio), { once: true });
    audio.addEventListener('error', () => reject(new Error('Audio load error for ' + url)), { once: true });
    // start loading
    audio.load();
  });
}

export async function initSound() {
  try {
    // Attach listener to camera
    const cam = getCamera();
    listener = new THREE.AudioListener();
    cam.add(listener);

    // Ambient dungeon hum (non-spatial)
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
  // Positional audio for torch crackle
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

export function updateListener(camera) {
  // Keep listener synced if needed; Three.js handles this via camera.add(listener)
}
