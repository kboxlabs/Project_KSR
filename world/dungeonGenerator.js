// Kalendale Procedural Dungeon Generator v2 (connected)
export function generateDungeon({
  width = 64,
  height = 48,
  minRooms = 10,
  maxRooms = 18,
  minRoomSize = 4,
  maxRoomSize = 10,
  torchChance = 0.1,
  lootChance = 0.04,
} = {}) {
  const TILE = { EMPTY: 0, FLOOR: 1, WALL: 2, DOOR: 3, LOOT: 4, TORCH: 5 };
  const grid = Array.from({ length: height }, () => Array.from({ length: width }, () => TILE.EMPTY));
  const rooms = [];
  const props = [];
  const items = [];
  const entities = [];
  const spawns = [];
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const inBounds = (x, y) => x >= 1 && y >= 1 && x < width - 1 && y < height - 1;

  // 1) Random room placement with rejection on overlap
  const targetRooms = randInt(minRooms, maxRooms);
  for (let i = 0; i < targetRooms * 8 && rooms.length < targetRooms; i++) {
    const w = randInt(minRoomSize, maxRoomSize);
    const h = randInt(minRoomSize, maxRoomSize);
    const x = randInt(1, width - w - 2);
    const y = randInt(1, height - h - 2);
    const room = { x, y, w, h };

    let overlap = false;
    for (const r of rooms) {
      if (x < r.x + r.w + 1 && x + w + 1 > r.x && y < r.y + r.h + 1 && y + h + 1 > r.y) {
        overlap = true; break;
      }
    }
    if (!overlap) {
      rooms.push(room);
      for (let yy = y; yy < y + h; yy++)
        for (let xx = x; xx < x + w; xx++)
          grid[yy][xx] = TILE.FLOOR;
    }
  }

  if (rooms.length === 0) return { width, height, rooms, grid, TILE, props, items, entities, spawns };

  // 2) Connect rooms (nearest-neighbor chain) to ensure connectivity
  const centerOf = (r) => ({ x: Math.floor(r.x + r.w / 2), y: Math.floor(r.y + r.h / 2) });
  rooms.sort((a, b) => a.x - b.x);
  const carveLine = (x1, y1, x2, y2) => {
    let x = x1, y = y1;
    while (x !== x2) { if (inBounds(x, y)) grid[y][x] = TILE.FLOOR; x += x < x2 ? 1 : -1; }
    while (y !== y2) { if (inBounds(x, y)) grid[y][x] = TILE.FLOOR; y += y < y2 ? 1 : -1; }
    if (inBounds(x, y)) grid[y][x] = TILE.FLOOR;
  };
  for (let i = 0; i < rooms.length - 1; i++) {
    const a = centerOf(rooms[i]), b = centerOf(rooms[i + 1]);
    carveLine(a.x, a.y, b.x, b.y);
  }

  // 3) Build walls around floors
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (grid[y][x] === TILE.EMPTY) {
        if (grid[y-1][x] === TILE.FLOOR || grid[y+1][x] === TILE.FLOOR ||
            grid[y][x-1] === TILE.FLOOR || grid[y][x+1] === TILE.FLOOR) {
          grid[y][x] = TILE.WALL;
        }
      }
    }
  }

  // 4) Loot and torch placement disabled for now.

  for (const room of rooms) {
    spawns.push({
      kind: 'room-center',
      x: Math.floor(room.x + room.w / 2),
      y: Math.floor(room.y + room.h / 2),
    });
  }

  return { width, height, rooms, grid, TILE, props, items, entities, spawns };
}
