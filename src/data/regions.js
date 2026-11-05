// Simulated map data. Coordinates are on a 100 x 70 grid used by SpookyMap.
// In a real deployment, replace these with live feeds (see README: AWS section).

export const REGIONS = [
  { id: 'hollow', name: 'Hollow Valley', x: 18, y: 22, base: { flood: 62, quake: 18, fire: 12, storm: 40 } },
  { id: 'ravens', name: "Raven's Peak", x: 48, y: 14, base: { flood: 15, quake: 55, fire: 48, storm: 25 } },
  { id: 'cobweb', name: 'Cobweb Creek', x: 78, y: 24, base: { flood: 48, quake: 22, fire: 20, storm: 58 } },
  { id: 'witch', name: "Witch's Marsh", x: 28, y: 50, base: { flood: 70, quake: 10, fire: 8, storm: 45 } },
  { id: 'pumpkin', name: 'Pumpkin Plains', x: 58, y: 46, base: { flood: 25, quake: 30, fire: 65, storm: 35 } },
  { id: 'bonehaven', name: 'Bonehaven Coast', x: 86, y: 56, base: { flood: 52, quake: 20, fire: 10, storm: 72 } },
];

export const SHELTERS = [
  { id: 's1', name: 'Old Mill Chapel', type: 'Chapel', x: 24, y: 28, capacity: 220, occupied: 90 },
  { id: 's2', name: 'Lantern Hill School', type: 'School', x: 40, y: 20, capacity: 400, occupied: 310 },
  { id: 's3', name: 'The Crypt Community Hall', type: 'Hall', x: 70, y: 30, capacity: 300, occupied: 120 },
  { id: 's4', name: 'Moonlit Stadium', type: 'Stadium', x: 36, y: 44, capacity: 1200, occupied: 450 },
  { id: 's5', name: 'Hearthstone Hospital Annex', type: 'Medical', x: 62, y: 40, capacity: 150, occupied: 138 },
  { id: 's6', name: 'Lighthouse Bunker', type: 'Bunker', x: 80, y: 52, capacity: 180, occupied: 60 },
];

export const SHELTER_TYPES = ['All', 'Chapel', 'School', 'Hall', 'Stadium', 'Medical', 'Bunker'];

export const getRegion = (id) => REGIONS.find((r) => r.id === id);

export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// 1 grid unit is treated as ~1.5 km in the demo
export const toKm = (units) => Math.round(units * 1.5 * 10) / 10;
