import type { DamageSource, Vec3 } from '../core/types';
import { axisBox, segmentBox } from './collision-geometry';
import { sectionRay } from './section-query';
import type { Simulation } from './simulation';
export const PROJECTILE_RADIUS = 0.085;
/** Walk the flight segment and test neighbouring cells against the expanded projectile. */
export function terrainSweep(
  sim: Simulation,
  o: Vec3,
  d: Vec3,
  length: number,
  radius = PROJECTILE_RADIUS,
) {
  let hit: { t: number; normal: Vec3 } | null = null;
  if (
    ![length, radius, o.x, o.y, o.z, d.x, d.y, d.z].every(Number.isFinite) ||
    length < 0 ||
    radius < 0
  )
    return null;
  const visited = new Set<number>(),
    steps = Math.max(1, Math.ceil(length));
  for (let i = 0; i < steps; i++) {
    const t0 = (length * i) / steps,
      t1 = (length * (i + 1)) / steps;
    if (hit && t0 > hit.t + 1) break;
    const a = { x: o.x + d.x * t0, y: o.y + d.y * t0, z: o.z + d.z * t0 };
    const b = { x: o.x + d.x * t1, y: o.y + d.y * t1, z: o.z + d.z * t1 };
    for (
      let z = Math.floor(Math.min(a.z, b.z) - radius);
      z <= Math.floor(Math.max(a.z, b.z) + radius);
      z++
    )
      for (
        let y = Math.floor(Math.min(a.y, b.y) - radius);
        y <= Math.floor(Math.max(a.y, b.y) + radius);
        y++
      )
        for (
          let x = Math.floor(Math.min(a.x, b.x) - radius);
          x <= Math.floor(Math.max(a.x, b.x) + radius);
          x++
        ) {
          if (!sim.world.cell(x, y, z)) continue;
          const key = sim.world.index(x, y, z);
          if (visited.has(key)) continue;
          visited.add(key);
          const h = segmentBox(
            o,
            d,
            length,
            axisBox({ min: { x, y, z }, max: { x: x + 1, y: y + 1, z: z + 1 } }),
            radius,
          );
          if (h && (!hit || h.t < hit.t)) hit = h;
        }
  }
  return hit;
}

/** The muzzle is a swept segment, not a teleport past cover or friendly bodies. */
export function muzzleCollision(
  sim: Simulation,
  origin: Vec3,
  muzzle: Vec3,
  source: DamageSource,
): Vec3 | null {
  const delta = { x: muzzle.x - origin.x, y: muzzle.y - origin.y, z: muzzle.z - origin.z };
  const length = Math.hypot(delta.x, delta.y, delta.z);
  const d =
    length > 1e-8
      ? { x: delta.x / length, y: delta.y / length, z: delta.z / length }
      : { x: 0, y: 0, z: 1 };
  const terrain = terrainSweep(sim, origin, d, length),
    section = sectionRay(sim, origin, d, length, PROJECTILE_RADIUS);
  let nearest = Math.min(terrain?.t ?? Infinity, section?.t ?? Infinity);
  const ownVehicle = source && ('driver' in source ? source : source.vehicle);
  for (const a of sim.actors) {
    if (
      a === source ||
      !a.alive ||
      a.vehicle ||
      Math.hypot(a.x - origin.x, a.z - origin.z) > length + 1
    )
      continue;
    nearest = Math.min(
      nearest,
      sim.rayBox(origin, d, {
        x: a.x,
        y: a.y + a.height / 2,
        z: a.z,
        xr: 0.34 + PROJECTILE_RADIUS,
        yr: a.height / 2 + PROJECTILE_RADIUS,
        zr: 0.34 + PROJECTILE_RADIUS,
      }),
    );
  }
  for (const v of sim.vehicles) {
    if (v === ownVehicle || !v.alive) continue;
    nearest = Math.min(
      nearest,
      sim.rayBox(origin, d, {
        x: v.x,
        y: v.y + v.height / 2,
        z: v.z,
        xr: v.radius + PROJECTILE_RADIUS,
        yr: v.height / 2 + PROJECTILE_RADIUS,
        zr: v.radius + PROJECTILE_RADIUS,
      }),
    );
  }
  if (nearest > length) return null;
  const t = Math.max(0, nearest - 0.03);
  return { x: origin.x + d.x * t, y: origin.y + d.y * t, z: origin.z + d.z * t };
}
