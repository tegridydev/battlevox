import { fractureResistance } from '../core/material-physics';
import type { RubbleBody, Vec3 } from '../core/types';
import { segmentBox, visitCollisionBoxes } from './collision-geometry';
import { voxelMass } from './rubble';
import { pointVelocity, rubbleBounds, sectionOverlap, turnSection } from './rubble-shape';
import { nearbySections } from './section-index';
import { removeTreeVoxel, rotatedBounds, visitSection } from './section-tree';
import type { Simulation } from './simulation';
export function sectionBlocked(sim: Simulation, p: Vec3, r = 0.3, height = 1.8) {
  const bounds = {
    min: { x: p.x - r, y: p.y, z: p.z - r },
    max: { x: p.x + r, y: p.y + height, z: p.z + r },
  };
  for (const b of nearbySections(sim, bounds)) if (sectionOverlap(b, p, r, height)) return true;
  return false;
}
export function sectionRay(
  sim: Simulation,
  o: Vec3,
  d: Vec3,
  length: number,
  radius = 0,
): { body: RubbleBody; index: number; t: number } | null {
  let nearest = length,
    hit: { body: RubbleBody; index: number; t: number } | null = null;
  const end = { x: o.x + d.x * length, y: o.y + d.y * length, z: o.z + d.z * length };
  for (const body of nearbySections(sim, {
    min: {
      x: Math.min(o.x, end.x) - radius,
      y: Math.min(o.y, end.y) - radius,
      z: Math.min(o.z, end.z) - radius,
    },
    max: {
      x: Math.max(o.x, end.x) + radius,
      y: Math.max(o.y, end.y) + radius,
      z: Math.max(o.z, end.z) + radius,
    },
  })) {
    const bounds = rubbleBounds(body);
    const t = sim.rayBox(o, d, {
      x: (bounds.min.x + bounds.max.x) / 2,
      y: (bounds.min.y + bounds.max.y) / 2,
      z: (bounds.min.z + bounds.max.z) / 2,
      xr: (bounds.max.x - bounds.min.x) / 2,
      yr: (bounds.max.y - bounds.min.y) / 2,
      zr: (bounds.max.z - bounds.min.z) / 2,
    });
    if (t > nearest && radius === 0) continue;
    const ray = (box: ReturnType<typeof rubbleBounds>) =>
      sim.rayBox(o, d, {
        x: (box.min.x + box.max.x) / 2,
        y: (box.min.y + box.max.y) / 2,
        z: (box.min.z + box.max.z) / 2,
        xr: (box.max.x - box.min.x) / 2,
        yr: (box.max.y - box.min.y) / 2,
        zr: (box.max.z - box.min.z) / 2,
      });
    visitCollisionBoxes(
      body,
      (box) =>
        ray({
          min: { x: box.min.x - radius, y: box.min.y - radius, z: box.min.z - radius },
          max: { x: box.max.x + radius, y: box.max.y + radius, z: box.max.z + radius },
        }) <= nearest,
      (box) => {
        const q = segmentBox(o, d, nearest, box, radius);
        if (q && q.t <= nearest) {
          nearest = q.t;
          // Compound seeds are not necessarily the struck voxel. Resolve through the exact local tree.
          let index = box.index,
            distance = Infinity;
          const p = { x: o.x + d.x * q.t, y: o.y + d.y * q.t, z: o.z + d.z * q.t };
          visitSection(
            body,
            (bounds) =>
              p.x >= bounds.min.x - radius - 0.02 &&
              p.x <= bounds.max.x + radius + 0.02 &&
              p.y >= bounds.min.y - radius - 0.02 &&
              p.y <= bounds.max.y + radius + 0.02 &&
              p.z >= bounds.min.z - radius - 0.02 &&
              p.z <= bounds.max.z + radius + 0.02,
            (i) => {
              const v = body.voxels[i],
                bounds = rotatedBounds(
                  body,
                  { x: v.x, y: v.y, z: v.z },
                  { x: v.x + 1, y: v.y + 1, z: v.z + 1 },
                );
              const dd =
                (p.x - (bounds.min.x + bounds.max.x) / 2) ** 2 +
                (p.y - (bounds.min.y + bounds.max.y) / 2) ** 2 +
                (p.z - (bounds.min.z + bounds.max.z) / 2) ** 2;
              if (dd < distance) {
                distance = dd;
                index = i;
              }
            },
          );
          hit = { body, index, t: q.t };
        }
      },
    );
  }
  return hit;
}
export function damageSection(body: RubbleBody, index: number, amount: number) {
  const v = body.voxels[index];
  if (!v || !Number.isFinite(amount) || amount <= 0) return;
  body.sleeping = false;
  body.restTime = 0;
  body.damage ??= new Map();
  const total = (body.damage.get(v) ?? v.damage ?? 0) + amount;
  if (total < fractureResistance(v.material)) {
    body.damage.set(v, total);
    v.damage = total;
    return;
  }
  body.damage.delete(v);
  for (const key of body.bondWork.keys()) {
    const [a, b] = key.split(':').map(Number);
    if (a === v.id || b === v.id) body.bondWork.delete(key);
  }
  removeTreeVoxel(body, index);
  body.voxels[index] = body.voxels[body.voxels.length - 1];
  body.voxels.pop();
  const removedMass = voxelMass(v.material),
    mass = Math.max(0, body.mass - removedMass);
  if (mass > 0) {
    const r = {
      x: v.x + 0.5 - body.centre.x,
      y: v.y + 0.5 - body.centre.y,
      z: v.z + 0.5 - body.centre.z,
    };
    const delta = {
      x: (-removedMass * r.x) / mass,
      y: (-removedMass * r.y) / mass,
      z: (-removedMass * r.z) / mass,
    };
    const shift = turnSection(body, delta),
      velocity = pointVelocity(body, shift);
    body.x += shift.x - delta.x;
    body.y += shift.y - delta.y;
    body.z += shift.z - delta.z;
    body.centre.x += delta.x;
    body.centre.y += delta.y;
    body.centre.z += delta.z;
    body.vx = velocity.x;
    body.vy = velocity.y;
    body.vz = velocity.z;
    body.inertiaCross[0] += removedMass * r.x * r.y + mass * delta.x * delta.y;
    body.inertiaCross[1] += removedMass * r.x * r.z + mass * delta.x * delta.z;
    body.inertiaCross[2] += removedMass * r.y * r.z + mass * delta.y * delta.z;
    body.inertia.x = Math.max(
      1e-6,
      body.inertia.x -
        removedMass * (r.y ** 2 + r.z ** 2 + 1 / 6) -
        mass * (delta.y ** 2 + delta.z ** 2),
    );
    body.inertia.y = Math.max(
      1e-6,
      body.inertia.y -
        removedMass * (r.x ** 2 + r.z ** 2 + 1 / 6) -
        mass * (delta.x ** 2 + delta.z ** 2),
    );
    body.inertia.z = Math.max(
      1e-6,
      body.inertia.z -
        removedMass * (r.x ** 2 + r.y ** 2 + 1 / 6) -
        mass * (delta.x ** 2 + delta.y ** 2),
    );
  }
  body.mass = mass;
  body.shape = [];
  body.shapeYaw = NaN;
  body.geometryVersion++;
  body.connectivityDirty = true;
}
export function clearSegment(sim: Simulation, from: Vec3, to: Vec3) {
  const distance = Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z);
  if (distance < 1e-6) return true;
  const d = {
    x: (to.x - from.x) / distance,
    y: (to.y - from.y) / distance,
    z: (to.z - from.z) / distance,
  };
  return !sim.world.raycast(from, d, distance) && !sectionRay(sim, from, d, distance);
}
