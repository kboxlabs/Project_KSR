import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { clamp } from './utils.js';

let scene, camera, renderer;
let dungeonGroup;
let walls = [];
let floors = [];
let dungeonResources;
let currentDungeon = null;
const instanceMatrix = new THREE.Matrix4();
const textureLoader = new THREE.TextureLoader();
let wallTextures = [];
let floorTextures = [];
let playerSpriteTexture;

let player, playerTorch;
let fixedRotation;
let cameraOffset = new THREE.Vector3(0, 5, 7);

let targetCameraPos = new THREE.Vector3();
let zoomLevel = 7;
let targetZoom = 7;
const zoomMin = 3;
const zoomMax = 13;
const zoomLerpSpeed = 0.08;
const cameraAngle = THREE.MathUtils.degToRad(45);

const swayAmount = 0.05;
const swaySpeed = 0.6;

async function loadPixelTexture(path) {
  const texture = await textureLoader.loadAsync(new URL(path, import.meta.url).href);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

async function loadArtTextures() {
  [
    wallTextures[0],
    wallTextures[1],
    wallTextures[2],
    floorTextures[0],
    floorTextures[1],
    floorTextures[2],
    playerSpriteTexture,
  ] = await Promise.all([
    loadPixelTexture('../assets/textures/wall_mildew_a.png'),
    loadPixelTexture('../assets/textures/wall_mildew_b.png'),
    loadPixelTexture('../assets/textures/wall_mildew_c.png'),
    loadPixelTexture('../assets/textures/floor_flagstone_a.png'),
    loadPixelTexture('../assets/textures/floor_flagstone_b.png'),
    loadPixelTexture('../assets/textures/floor_flagstone_c.png'),
    loadPixelTexture('../assets/textures/player_rogue_sprite.png'),
  ]);
}

function createPlayerVisual() {
  const spriteMat = new THREE.MeshBasicMaterial({
    map: playerSpriteTexture,
    transparent: true,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
  });
  const spriteGeo = new THREE.PlaneGeometry(0.95, 1.2);
  const rogue = new THREE.Mesh(spriteGeo, spriteMat);
  rogue.position.y = 0.2;
  return rogue;
}

function tileVariant(x, y, count, salt = 0) {
  const hash = Math.imul(x + salt, 73856093) ^ Math.imul(y + salt * 17, 19349663);
  return (hash >>> 0) % count;
}

export async function initRenderer() {
  await loadArtTextures();

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMappingExposure = 1.6;
  document.body.appendChild(renderer.domElement);

  // Player
  player = createPlayerVisual();
  player.position.set(0, 0.5, 0);
  scene.add(player);

  // Ambient
  scene.add(new THREE.AmbientLight(0x505050));

  // Player torch
  playerTorch = new THREE.PointLight(0xffbb55, 3.84, 14, 2);
  playerTorch.position.set(0, 2.5, 0);
  scene.add(playerTorch);

  // Camera
  camera.position.set(0, 5, 7);
  camera.lookAt(player.position);
  fixedRotation = camera.quaternion.clone();
  targetCameraPos.copy(camera.position);

  dungeonGroup = new THREE.Group();
  scene.add(dungeonGroup);

  window.addEventListener('resize', onResize);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function createDungeonResources() {
  return {
    wallGeom: new THREE.BoxGeometry(1, 1.5, 1),
    floorGeom: new THREE.BoxGeometry(1, 0.1, 1),
    lootGeom: new THREE.BoxGeometry(0.4, 0.4, 0.4),
    torchGeom: new THREE.CylinderGeometry(0.07, 0.07, 0.6, 8),
    wallMats: wallTextures.map(texture => new THREE.MeshStandardMaterial({ map: texture, roughness: 1.0, metalness: 0.0 })),
    floorMats: floorTextures.map(texture => new THREE.MeshStandardMaterial({ map: texture, roughness: 1.0, metalness: 0.0 })),
    doorMat: new THREE.MeshStandardMaterial({ map: floorTextures[1], color: 0x9d9276, roughness: 1.0, metalness: 0.0 }),
    lootMat: new THREE.MeshStandardMaterial({ color: 0xffcc66, emissive: 0xffcc66, emissiveIntensity: 0.35 }),
    torchMat: new THREE.MeshStandardMaterial({ color: 0x664422 }),
  };
}

function disposeDungeonResources(resources) {
  if (!resources) return;
  resources.wallGeom.dispose();
  resources.floorGeom.dispose();
  resources.lootGeom.dispose();
  resources.torchGeom.dispose();
  for (const material of resources.wallMats) material.dispose();
  for (const material of resources.floorMats) material.dispose();
  resources.doorMat.dispose();
  resources.lootMat.dispose();
  resources.torchMat.dispose();
}

function clearDungeonGroup() {
  while (dungeonGroup.children.length) dungeonGroup.remove(dungeonGroup.children[0]);
  walls = [];
  floors = [];
}

function createInstancedMesh(geometry, material, count) {
  const mesh = new THREE.InstancedMesh(geometry, material, Math.max(count, 1));
  mesh.count = count;
  return mesh;
}

function setInstanceAt(mesh, index, x, y, z) {
  instanceMatrix.makeTranslation(x, y, z);
  mesh.setMatrixAt(index, instanceMatrix);
}

export function buildDungeon(dungeon) {
  clearDungeonGroup();
  disposeDungeonResources(dungeonResources);
  dungeonResources = createDungeonResources();
  currentDungeon = dungeon;

  const {
    wallGeom,
    floorGeom,
    lootGeom,
    torchGeom,
    wallMats,
    floorMats,
    doorMat,
    lootMat,
    torchMat,
  } = dungeonResources;

  const TILE = dungeon.TILE;
  const wallCounts = [0, 0, 0];
  const floorCounts = [0, 0, 0];
  let doorCount = 0;
  let lootFloorCount = 0;
  let lootCount = dungeon.items.filter(item => item.kind === 'loot').length;
  let torchCount = dungeon.props.filter(prop => prop.kind === 'torch').length;

  for (let y = 0; y < dungeon.height; y++) {
    for (let x = 0; x < dungeon.width; x++) {
      const tile = dungeon.grid[y][x];
      if (tile === TILE.WALL) wallCounts[tileVariant(x, y, wallMats.length, 11)]++;
      else if (tile === TILE.FLOOR) floorCounts[tileVariant(x, y, floorMats.length, 23)]++;
      else if (tile === TILE.DOOR) doorCount++;
      else if (tile === TILE.LOOT) {
        lootFloorCount++;
        floorCounts[tileVariant(x, y, floorMats.length, 23)]++;
      }
    }
  }

  const wallMeshes = wallMats.map((material, index) => createInstancedMesh(wallGeom, material, wallCounts[index]));
  const floorMeshes = floorMats.map((material, index) => createInstancedMesh(floorGeom, material, floorCounts[index]));
  const doorMesh = createInstancedMesh(floorGeom, doorMat, doorCount);
  const lootMesh = createInstancedMesh(lootGeom, lootMat, lootCount);
  const torchMesh = createInstancedMesh(torchGeom, torchMat, torchCount);

  const wallIndices = [0, 0, 0];
  const floorIndices = [0, 0, 0];
  let doorIndex = 0;

  for (let y = 0; y < dungeon.height; y++) {
    for (let x = 0; x < dungeon.width; x++) {
      const tile = dungeon.grid[y][x];
      if (tile === TILE.WALL) {
        const variant = tileVariant(x, y, wallMeshes.length, 11);
        setInstanceAt(wallMeshes[variant], wallIndices[variant]++, x, 0.75, y);
      } else if (tile === TILE.FLOOR) {
        const variant = tileVariant(x, y, floorMeshes.length, 23);
        setInstanceAt(floorMeshes[variant], floorIndices[variant]++, x, 0.05, y);
      } else if (tile === TILE.DOOR) {
        setInstanceAt(doorMesh, doorIndex++, x, 0.05, y);
      } else if (tile === TILE.LOOT) {
        const variant = tileVariant(x, y, floorMeshes.length, 23);
        setInstanceAt(floorMeshes[variant], floorIndices[variant]++, x, 0.05, y);
      }
    }
  }

  let lootIndex = 0;
  for (const item of dungeon.items) {
    if (item.kind !== 'loot') continue;
    setInstanceAt(lootMesh, lootIndex++, item.x, 0.35, item.y);
  }

  let torchIndex = 0;
  for (const prop of dungeon.props) {
    if (prop.kind !== 'torch') continue;
    setInstanceAt(torchMesh, torchIndex++, prop.x, 0.3, prop.y);
  }

  for (let i = 0; i < wallMeshes.length; i++) {
    if (wallCounts[i]) dungeonGroup.add(wallMeshes[i]);
  }
  for (let i = 0; i < floorMeshes.length; i++) {
    if (floorCounts[i]) dungeonGroup.add(floorMeshes[i]);
  }
  if (doorCount) dungeonGroup.add(doorMesh);
  if (lootCount) dungeonGroup.add(lootMesh);
  if (torchCount) dungeonGroup.add(torchMesh);
}

export function setPlayerTo(x, y) {
  player.position.set(x, 0.5, y);
  playerTorch.position.set(x, 2.5, y);
}

export function renderFrame(dt) {
  const now = performance.now() * 0.001;

  // Player torch flicker only
  playerTorch.intensity = 3.36 + Math.sin(now * 7.0) * 0.36 + Math.sin(now * 13.0) * 0.18;
  playerTorch.color.setHSL(0.08 + Math.sin(now * 0.3) * 0.02, 1, 0.55);

  // smooth zoom
  zoomLevel += (targetZoom - zoomLevel) * zoomLerpSpeed;

  // camera fixed rotation
  camera.quaternion.copy(fixedRotation);

  // Billboard player sprite toward the camera.
  player.quaternion.copy(camera.quaternion);

  // diagonal zoom offsets from angle
  const offsetY = Math.sin(cameraAngle) * zoomLevel;
  const offsetZ = Math.cos(cameraAngle) * zoomLevel;

  targetCameraPos.x = player.position.x + cameraOffset.x;
  targetCameraPos.y = player.position.y + offsetY;
  targetCameraPos.z = player.position.z + offsetZ;

  // inertia
  camera.position.lerp(targetCameraPos, 0.08);

  // breathing sway
  camera.position.x += Math.sin(now * swaySpeed) * swayAmount;
  camera.position.y += Math.sin(now * swaySpeed * 0.7) * swayAmount * 0.4;

  renderer.render(scene, camera);
}

export function setZoomComputed(scrollSteps) {
  targetZoom = clamp(targetZoom + scrollSteps * 0.5, zoomMin, zoomMax);
}

export function getZoomState() { return { zoomLevel, targetZoom }; }
export function getScene() { return scene; }
export function getCamera() { return camera; }
export function getPlayer() { return player; }
export function getTorch() { return playerTorch; }
export function getWalls() { return walls; }
export function getDungeon() { return currentDungeon; }
export function isBlockedTile(x, z) {
  if (!currentDungeon) return false;
  if (x < 0 || z < 0 || x >= currentDungeon.width || z >= currentDungeon.height) return true;
  return currentDungeon.grid[z][x] === currentDungeon.TILE.WALL;
}
