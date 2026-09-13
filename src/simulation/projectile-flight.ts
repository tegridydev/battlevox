import { D, STEP, W } from '../core/config';
import { projectileSpec } from '../core/projectiles';
import type { Projectile, Vec3 } from '../core/types';
import { sectionBlocked } from './section-query';
import type { Simulation } from './simulation';
/** Shared by the live grenade update and the NPC trajectory predictor. */
export function moveThrown(sim: Simulation, p: Projectile, dt: number): void {
  const next = { x: p.x + p.vx * dt, y: p.y + p.vy * dt, z: p.z + p.vz * dt };
  const blocked = (q: Vec3) => sim.world.solid(q.x, q.y, q.z) || sectionBlocked(sim, q, 0.1, 0.2);
  if (!blocked(next)) {
    Object.assign(p, next);
    return;
  }
  if (blocked({ x: next.x, y: p.y, z: p.z })) p.vx *= -0.48;
  if (blocked({ x: p.x, y: next.y, z: p.z })) {
    p.vy *= -0.42;
    p.vx *= 0.76;
    p.vz *= 0.76;
  }
  if (blocked({ x: p.x, y: p.y, z: next.z })) p.vz *= -0.48;
}
export function predictGrenade(sim: Simulation, origin: Vec3, dir: Vec3): Vec3 | null {
  const spec = projectileSpec.grenade;
  const p: Projectile = {
    x: origin.x + dir.x * 0.35,
    y: origin.y + dir.y * 0.35,
    z: origin.z + dir.z * 0.35,
    vx: dir.x * spec.speed,
    vy: dir.y * spec.speed + spec.lift,
    vz: dir.z * spec.speed,
    source: null,
    type: 'grenade',
    life: spec.fuse,
  };
  for (let n = 0; n < Math.ceil(spec.fuse / STEP); n++) {
    const dt = Math.min(STEP, p.life);
    p.life -= dt;
    p.vy -= spec.gravity * dt;
    const steps = Math.max(1, Math.ceil((Math.hypot(p.vx, p.vy, p.vz) * dt) / 0.4));
    for (let i = 0; i < steps; i++) moveThrown(sim, p, dt / steps);
    if (p.y < -2 || p.x < 1 || p.x > W - 1 || p.z < 1 || p.z > D - 1) return null;
  }
  return { x: p.x, y: p.y, z: p.z };
}
