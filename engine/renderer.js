import { clamp, lerp } from './utils.js';

let scene, camera, renderer;
let floor, walls = [];
let player, torch;
let fixedRotation;
let cameraOffset = new THREE.Vector3(0, 5, 7);

let targetCameraPos = new THREE.Vector3();
let zoomLevel = 7;      // current smoothed zoom
let targetZoom = 7;     // scroll target
const zoomMin = 3;
const zoomMax = 13;
const zoomLerpSpeed = 0.08;
const cameraAngle = THREE.MathUtils.degToRad(45); // steeper per user

// breathing sway
const swayAmount = 0.05;
const swaySpeed = 0.6;

export async function initRenderer() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMappingExposure = 1.6;
  document.body.appendChild(renderer.domElement);

  // ENV
  floor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
  for (let x = -14; x <= 14; x += 2) {
    for (let z = -14; z <= 14; z += 2) {
      if (Math.random() < 0.08) {
        const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 1), wallMat);
        cube.position.set(x, 1, z);
        scene.add(cube);
        walls.push(cube);
      }
    }
  }

  // PLAYER
  player = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.8, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x99aaff })
  );
  player.position.set(0, 0.5, 0);
  scene.add(player);

  // LIGHTS
  torch = new THREE.PointLight(0xffbb55, 3.2, 14, 2);
  torch.position.set(0, 2.5, 0);
  scene.add(torch);
  scene.add(new THREE.AmbientLight(0x505050));

  // CAMERA
  camera.position.copy(player.position).add(cameraOffset);
  camera.lookAt(player.position);
  fixedRotation = camera.quaternion.clone();
  targetCameraPos.copy(camera.position);

  window.addEventListener('resize', onResize);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function renderFrame(dt) {
  const now = performance.now() * 0.001;

  // torch flicker
  torch.intensity = 2.8 + Math.sin(now * 7.0) * 0.3 + Math.sin(now * 13.0) * 0.15;
  torch.color.setHSL(0.08 + Math.sin(now * 0.3) * 0.02, 1, 0.55);

  // smooth zoom
  zoomLevel += (targetZoom - zoomLevel) * zoomLerpSpeed;

  // fixed rotation (no pitch/yaw/roll changes)
  camera.quaternion.copy(fixedRotation);

  // diagonal zoom offsets from angle
  const offsetY = Math.sin(cameraAngle) * zoomLevel;
  const offsetZ = Math.cos(cameraAngle) * zoomLevel;

  targetCameraPos.x = player.position.x + cameraOffset.x;
  targetCameraPos.y = player.position.y + offsetY;
  targetCameraPos.z = player.position.z + offsetZ;

  // inertia to target
  const lerpSpeed = 0.08;
  camera.position.lerp(targetCameraPos, lerpSpeed);

  // breathing sway
  camera.position.x += Math.sin(now * swaySpeed) * swayAmount;
  camera.position.y += Math.sin(now * swaySpeed * 0.7) * swayAmount * 0.4;

  renderer.render(scene, camera);
}

// Called by main when mouse wheel scrolls
export function setZoomComputed(scrollSteps) {
  targetZoom = clamp(targetZoom + scrollSteps * 0.5, zoomMin, zoomMax);
}

export function getZoomState() { return { zoomLevel, targetZoom }; }

// Accessors for other modules
export function getScene() { return scene; }
export function getCamera() { return camera; }
export function getPlayer() { return player; }
export function getTorch() { return torch; }
export function getWalls() { return walls; }
