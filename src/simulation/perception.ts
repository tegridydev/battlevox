import type { SmokeCloud, Vec3 } from '../core/types';
import { clearSegment } from './section-query';
import type { Simulation } from './simulation';
export function smokeRadius(c: SmokeCloud): number {
  return c.life > 0 && c.age >= 0.15 ? c.radius * Math.min(1, c.age / 1.3) : 0;
}
/** Smoke affects observation, never projectile, movement or explosion geometry. */
export function smokeDepth(sim: Simulation, a: Vec3, b: Vec3): number {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    dz = b.z - a.z,
    l2 = dx * dx + dy * dy + dz * dz;
  if (l2 < 1e-8) return 0;
  const length = Math.sqrt(l2);
  let depth = 0;
  for (const c of sim.smokeClouds ?? []) {
    if (c.life <= 0 || c.age < 0.15) continue;
    const radius = smokeRadius(c),
      ox = a.x - c.x,
      oy = a.y - c.y,
      oz = a.z - c.z;
    const proj = -(ox * dx + oy * dy + oz * dz) / l2;
    const perpendicular = ox * ox + oy * oy + oz * oz - proj * proj * l2;
    const disc = radius * radius - perpendicular;
    if (disc <= 0) continue;
    const half = Math.sqrt(disc / l2),
      lo = Math.max(0, proj - half),
      hi = Math.min(1, proj + half);
    if (hi > lo) depth += (hi - lo) * length * Math.min(1, c.life / 2);
  }
  return depth;
}
export function canSee(sim: Simulation, a: Vec3, b: Vec3): boolean {
  return smokeDepth(sim, a, b) < 1.7 && clearSegment(sim, a, b);
}
