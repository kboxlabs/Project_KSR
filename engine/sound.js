import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { getCamera } from './renderer.js';

let listener;
const loops = new Map();
const pendingMedia = new Map();
let audioUnlocked = false;
let unlockBound = false;
const hopSounds = [];

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

async function loadAudioWithFallback(urls) {
  for (const url of urls) {
    const audio = await loadAudio(url).catch(() => null);
    if (audio) return audio;
  }
  return null;
}

async function unlockAudio() {
  if (!listener || audioUnlocked) return;

  try {
    if (listener.context.state === 'suspended') {
      await listener.context.resume();
    }

    for (const media of pendingMedia.values()) {
      try {
        media.currentTime = media.currentTime || 0;
        await media.play();
      } catch (_) {}
    }

    audioUnlocked = true;
  } catch (_) {}
}

function bindAudioUnlock() {
  if (unlockBound) return;
  unlockBound = true;

  const tryUnlock = async () => {
    await unlockAudio();
    if (audioUnlocked) {
      window.removeEventListener('pointerdown', tryUnlock);
      window.removeEventListener('keydown', tryUnlock);
      window.removeEventListener('touchstart', tryUnlock);
    }
  };

  window.addEventListener('pointerdown', tryUnlock, { passive: true });
  window.addEventListener('keydown', tryUnlock);
  window.addEventListener('touchstart', tryUnlock, { passive: true });
}

export async function initSound() {
  try {
    const cam = getCamera();
    listener = new THREE.AudioListener();
    cam.add(listener);
    bindAudioUnlock();

    const hum = await loadAudioWithFallback([
      './assets/sounds/dungeon_hum.ogg',
      './assets/sounds/dungeon_hum.mp3',
    ]);
    if (hum) {
      const audio = new THREE.Audio(listener);
      audio.setLoop(true);
      audio.setVolume(0.15);
      audio.setMediaElementSource(hum);
      pendingMedia.set('dungeon_hum', hum);
      loops.set('dungeon_hum', audio);
    }

    const hopCandidates = [
      ['./assets/sounds/player_hop_1.ogg', './assets/sounds/player_hop_1.mp3'],
      ['./assets/sounds/player_hop_2.ogg', './assets/sounds/player_hop_2.mp3'],
      ['./assets/sounds/player_hop_3.ogg', './assets/sounds/player_hop_3.mp3'],
    ];
    for (let i = 0; i < hopCandidates.length; i++) {
      const hopSound = await loadAudioWithFallback(hopCandidates[i]);
      if (!hopSound) continue;
      hopSound.loop = false;
      hopSound.preload = 'auto';
      hopSounds.push(hopSound);
      pendingMedia.set(`player_hop_${i}`, hopSound);
    }
  } catch (e) {
    console.warn('Sound init failed:', e.message);
  }
}

export function attachTorchSound(torch, cam) {
  loadAudioWithFallback([
    './assets/sounds/torch_crackle.ogg',
    './assets/sounds/torch_crackle.mp3',
  ]).then(media => {
    if (!media) return;
    const crackle = new THREE.PositionalAudio(listener);
    crackle.setLoop(true);
    crackle.setRefDistance(4);
    crackle.setVolume(0.25);
    crackle.setMediaElementSource(media);
    pendingMedia.set('torch', media);
    torch.add(crackle);
    loops.set('torch', crackle);
  }).catch(() => {});
}

export function playHopSound() {
  if (!hopSounds.length || !audioUnlocked) return;
  const hopSound = hopSounds[Math.floor(Math.random() * hopSounds.length)];
  try {
    hopSound.pause();
    hopSound.currentTime = 0;
    void hopSound.play();
  } catch (_) {}
}

export function updateListener(camera) {}
