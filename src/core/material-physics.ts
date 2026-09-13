export interface MaterialPhysics {
  toughness: number;
  density: number;
  compression: number;
  tension: number;
  shear: number;
  friction: number;
  restitution: number;
  grain: number;
}
const make = (
  toughness: number,
  density: number,
  compression: number,
  tension: number,
  shear: number,
  friction = 0.75,
  restitution = 0.08,
  grain = 2,
): MaterialPhysics => ({
  toughness,
  density,
  compression,
  tension,
  shear,
  friction,
  restitution,
  grain,
});
const concrete = make(1, 1, 1, 0.15, 0.3),
  brick = make(0.7, 0.9, 0.7, 0.1, 0.2),
  soil = make(1.2, 0.8, 0.6, 0.02, 0.12, 0.9),
  asphalt = make(1.5, 1.1, 0.8, 0.08, 0.25, 0.85);
export const materialPhysics: readonly MaterialPhysics[] = [
  make(0, 0, 0, 0, 0),
  make(Infinity, 1, Infinity, Infinity, Infinity),
  soil,
  soil,
  concrete,
  brick,
  make(0.35, 0.3, 0.35, 0.25, 0.12, 0.65, 0.06, 3),
  make(0.03, 0.05, 0, 0, 0, 0.6, 0.02, 1),
  asphalt,
  brick,
  concrete,
  make(0.08, 1, 0, 0, 0, 0.45, 0.02, 1),
  make(4, 3.2, 4, 4, 2, 0.6, 0.08, 3),
  concrete,
  asphalt,
  concrete,
  make(0.08, 1, 0, 0, 0, 0.45, 0.02, 1),
];
export const physicsMaterial = (id: number) => materialPhysics[id] ?? concrete;
export const fractureResistance = (id: number) => 100 * physicsMaterial(id).toughness;
export const hash = (n: number) => {
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  return (n ^ (n >>> 16)) >>> 0;
};
export function grainAt(x: number, y: number, z: number, material: number, seed: number) {
  const size = physicsMaterial(material).grain,
    gx = Math.floor(x / size),
    gy = Math.floor(y / size),
    gz = Math.floor(z / size);
  let best = Infinity,
    id = 0;
  for (let dz = -1; dz <= 1; dz++)
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const a = gx + dx,
          b = gy + dy,
          c = gz + dz,
          k = hash(seed ^ Math.imul(a, 73856093) ^ Math.imul(b, 19349663) ^ Math.imul(c, 83492791));
        const d =
          (x - (a + 0.5 + (k / 4294967295 - 0.5) * 0.4) * size) ** 2 +
          (y - (b + 0.5 + (hash(k) / 4294967295 - 0.5) * 0.4) * size) ** 2 +
          (z - (c + 0.5 + (hash(k + 1) / 4294967295 - 0.5) * 0.4) * size) ** 2;
        if (d < best) {
          best = d;
          id = k;
        }
      }
  return id;
}
