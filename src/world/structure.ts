import { fractureResistance, physicsMaterial } from '../core/material-physics';
import type { Building } from '../core/types';
import type { World } from './world';
/** Glass and foliage cannot carry a building, though attached panes remain visible. */
export const bearsLoad = (material: number) =>
  material > 0 && material !== 7 && material !== 11 && material !== 16;
export function recordSupports(world: World, building: Building) {
  const counts = new Float32Array(building.h + 1);
  for (let y = 0; y < counts.length; y++)
    for (let z = 0; z < building.d; z++)
      for (let x = 0; x < building.w; x++)
        if (bearsLoad(world.cell(building.x + x, building.base + y, building.z + z)))
          counts[y] += physicsMaterial(
            world.cell(building.x + x, building.base + y, building.z + z),
          ).compression;
  building.supportBaseline = counts;
}
/** Arcade load capacity: a storey cannot balance the tower on a few remaining pillars. */
export function failedSupportLevel(
  building: Building,
  counts: Uint16Array | Float32Array,
  momentsX: Float32Array,
  momentsZ: Float32Array,
) {
  const baseline = building.supportBaseline;
  if (!baseline) return Infinity;
  for (let y = 0; y < Math.min(counts.length, baseline.length - 1); y++) {
    const original = baseline[y];
    if (original < 8) continue;
    const remaining = counts[y],
      ratio = remaining / original;
    const eccentric =
      remaining > 0 &&
      Math.hypot(
        (momentsX[y] / remaining - (building.w - 1) / 2) / building.w,
        (momentsZ[y] / remaining - (building.d - 1) / 2) / building.d,
      ) > 0.23;
    if (ratio < 0.42 || (ratio < 0.7 && eccentric)) return building.base + y;
  }
  return Infinity;
}

/** Toppling is directed away from the surviving support centroid, toward the damaged side. */
export function collapseDirection(b: Building, count: number, momentX: number, momentZ: number) {
  let x = count ? (b.w - 1) / 2 - momentX / count : 0,
    z = count ? (b.d - 1) / 2 - momentZ / count : 0;
  if (Math.hypot(x, z) < 0.1) {
    // Stable asymmetry for a balanced failure; do not consume the combat RNG.
    const angle = (b.x * 0.73 + b.z * 1.37) % (Math.PI * 2);
    x = Math.sin(angle);
    z = Math.cos(angle);
  }
  const length = Math.hypot(x, z);
  return { x: x / length, y: 0, z: z / length };
}

export function supportCapacity(world: World, x: number, y: number, z: number) {
  const m = world.cell(x, y, z);
  return (
    physicsMaterial(m).compression *
    Math.max(0, 1 - (world.damage.get(world.index(x, y, z)) ?? 0) / fractureResistance(m)) ** 1.3
  );
}
