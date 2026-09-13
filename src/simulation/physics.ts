import { D, W } from '../core/config';
import { clamp } from '../core/math';
import type { Actor, Body, Vehicle } from '../core/types';
import { sectionBlocked } from './section-query';
import type { Simulation } from './simulation';
export function occupied(
  this: Simulation,
  a: Body,
  x: number,
  y: number,
  z: number,
  r = 0.3,
  height = 1.8,
) {
  if (this.world.blocked(x, y, z, r, height) || sectionBlocked(this, { x, y, z }, r, height))
    return true;
  for (const v of this.vehicles)
    if (
      v !== a &&
      v.alive &&
      a.vehicle !== v &&
      y + height > v.y + 0.05 &&
      y < v.y + v.height - 0.02 &&
      Math.abs(x - v.x) < r + v.radius &&
      Math.abs(z - v.z) < r + v.radius
    )
      return true;
  return false;
}

export function pushInfantry(this: Simulation, v: Vehicle, x: number, y: number, z: number) {
  const moves: [Actor, number, number][] = [];
  for (const a of this.actors) {
    if (!a.alive || a.vehicle || a.y + a.height < y || a.y > y + v.height) continue;
    const rx = v.radius + 0.32 - Math.abs(a.x - x),
      rz = v.radius + 0.32 - Math.abs(a.z - z);
    if (rx <= 0 || rz <= 0) continue;
    const nx = a.x + (rx < rz ? (a.x < x ? -1 : 1) * (rx + 0.015) : 0),
      nz = a.z + (rz <= rx ? (a.z < z ? -1 : 1) * (rz + 0.015) : 0);
    const distance = Math.hypot(nx - a.x, nz - a.z),
      steps = Math.max(1, Math.ceil(distance / 0.2));
    for (let i = 1; i <= steps; i++) {
      const px = a.x + ((nx - a.x) * i) / steps,
        pz = a.z + ((nz - a.z) * i) / steps;
      if (
        this.world.blocked(px, a.y, pz, 0.3, a.height) ||
        sectionBlocked(this, { x: px, y: a.y, z: pz }, 0.3, a.height)
      )
        return false;
    }
    if (
      this.vehicles.some(
        (b) =>
          b !== v &&
          b.alive &&
          Math.abs(nx - b.x) < b.radius + 0.3 &&
          Math.abs(nz - b.z) < b.radius + 0.3 &&
          a.y < b.y + b.height &&
          a.y + a.height > b.y,
      )
    )
      return false;
    moves.push([a, nx, nz]);
  }
  // Validate the complete proposal before moving anyone; no chain pushes or overlapping soldiers.
  const proposed = new Map(moves.map(([actor, x, z]) => [actor, { x, z }]));
  for (const [a, x, z] of moves) {
    for (const other of this.actors) {
      if (
        other === a ||
        !other.alive ||
        other.vehicle ||
        a.y + a.height <= other.y ||
        other.y + other.height <= a.y
      )
        continue;
      const target = proposed.get(other) ?? other;
      if (Math.abs(x - target.x) < 0.6 && Math.abs(z - target.z) < 0.6) return false;
    }
  }
  for (const [a, nx, nz] of moves) {
    a.x = nx;
    a.z = nz;
  }
  return true;
}

export function moveBody(this: Simulation, a: Actor | Vehicle, dt: number, r = 0.3, height = 1.8) {
  // Sweep short increments: explosions and long falls cannot tunnel through voxels.
  for (const [axis, delta] of [
    ['x', (a.vx + (a.ix || 0)) * dt],
    ['z', (a.vz + (a.iz || 0)) * dt],
  ] as const) {
    const steps = Math.max(1, Math.ceil(Math.abs(delta) / 0.22)),
      d = delta / steps;
    for (let i = 0; i < steps; i++) {
      const x = a.x + (axis === 'x' ? d : 0),
        z = a.z + (axis === 'z' ? d : 0);
      let y = a.y;
      if (this.occupied(a, x, y, z, r, height)) {
        if (
          a.onGround &&
          !this.occupied(a, x, y + 1.02, z, r, height) &&
          !this.occupied(a, a.x, y + 1.02, a.z, r, height)
        )
          y += 1.02;
        else break;
      }
      if (a.isVehicle && !this.pushInfantry(a as Vehicle, x, y, z)) break;
      a.x = x;
      a.z = z;
      a.y = y;
    }
  }
  a.vy = Math.max(-40, a.vy - 19 * dt);
  const dy = a.vy * dt,
    steps = Math.max(1, Math.ceil(Math.abs(dy) / 0.2));
  a.onGround = false;
  for (let i = 0; i < steps; i++) {
    const d = dy / steps;
    if (!this.occupied(a, a.x, a.y + d, a.z, r, height)) a.y += d;
    else {
      let low = 0,
        high = 1;
      for (let n = 0; n < 9; n++) {
        const m = (low + high) / 2;
        if (this.occupied(a, a.x, a.y + d * m, a.z, r, height)) high = m;
        else low = m;
      }
      a.y += d * low;
      if (d < 0) {
        a.onGround = true;
        if (!a.isVehicle && a.vy < -13) this.hurt(a, (-a.vy - 13) * 6, null);
      }
      a.vy = 0;
      break;
    }
  }
  a.ix = (a.ix || 0) * Math.exp(-6 * dt);
  a.iz = (a.iz || 0) * Math.exp(-6 * dt);
  a.x = clamp(a.x, r + 1, W - r - 1);
  a.z = clamp(a.z, r + 1, D - r - 1);
}
