import type { RubbleBody, Vec3 } from '../core/types';
import { axisBox, orientedBox, sweepObb } from './collision-geometry';
import { rotate } from './rotation';
import { intersects, rotatedBounds, visitSection } from './section-tree';

/** Matches the instance shader's yaw/pitch/roll transform, around the section centre. */
export function rubbleShape(b: RubbleBody) {
  if (b.shapeYaw === b.yaw && b.shapePitch === b.pitch && b.shapeRoll === b.roll) return b.shape;
  const ex = turnSection(b, { x: 1, y: 0, z: 0 }),
    ey = turnSection(b, { x: 0, y: 1, z: 0 }),
    ez = turnSection(b, { x: 0, y: 0, z: 1 });
  b.extent.x = 0.49 * (Math.abs(ex.x) + Math.abs(ey.x) + Math.abs(ez.x));
  b.extent.y = 0.49 * (Math.abs(ex.y) + Math.abs(ey.y) + Math.abs(ez.y));
  b.extent.z = 0.49 * (Math.abs(ex.z) + Math.abs(ey.z) + Math.abs(ez.z));
  b.voxels.forEach((v, index) => {
    const x = v.x + 0.5 - b.centre.x,
      y = v.y + 0.5 - b.centre.y,
      z = v.z + 0.5 - b.centre.z;
    const point = b.shape[index] ?? (b.shape[index] = { x: 0, y: 0, z: 0, material: v.material });
    point.x = b.centre.x + ex.x * x + ey.x * y + ez.x * z;
    point.y = b.centre.y + ex.y * x + ey.y * y + ez.y * z;
    point.z = b.centre.z + ex.z * x + ey.z * y + ez.z * z;
  });
  b.shapeYaw = b.yaw;
  b.shapePitch = b.pitch;
  b.shapeRoll = b.roll;
  for (const axis of ['x', 'y', 'z'] as const) {
    b.boundsMin[axis] = Infinity;
    b.boundsMax[axis] = -Infinity;
    for (const p of b.shape) {
      b.boundsMin[axis] = Math.min(b.boundsMin[axis], p[axis] - b.extent[axis]);
      b.boundsMax[axis] = Math.max(b.boundsMax[axis], p[axis] + b.extent[axis]);
    }
  }
  return b.shape;
}

export function rubbleBounds(b: RubbleBody, position: Vec3 = b) {
  return rotatedBounds(
    b,
    { x: 0.01, y: 0.01, z: 0.01 },
    { x: b.width - 0.01, y: b.height - 0.01, z: b.depth - 0.01 },
    position,
  );
}

export function turnSection(b: RubbleBody, p: Vec3): Vec3 {
  return rotate(b.orientation, p);
}

export function sectionOverlap(
  b: RubbleBody,
  p: Vec3,
  radius: number,
  height: number,
  old: Vec3 = b,
) {
  const bounds = rubbleBounds(b);
  if (
    p.x + radius < Math.min(bounds.min.x, bounds.min.x + old.x - b.x) ||
    p.x - radius > Math.max(bounds.max.x, bounds.max.x + old.x - b.x) ||
    p.z + radius < Math.min(bounds.min.z, bounds.min.z + old.z - b.z) ||
    p.z - radius > Math.max(bounds.max.z, bounds.max.z + old.z - b.z) ||
    p.y + height < Math.min(bounds.min.y, bounds.min.y + old.y - b.y) ||
    p.y > Math.max(bounds.max.y, bounds.max.y + old.y - b.y)
  )
    return false;
  const query = {
    min: { x: p.x - radius, y: p.y, z: p.z - radius },
    max: { x: p.x + radius, y: p.y + height, z: p.z + radius },
  };
  let hit = false;
  visitSection(
    b,
    (bounds) => {
      for (const axis of ['x', 'y', 'z'] as const) {
        bounds.min[axis] += Math.min(0, old[axis] - b[axis]);
        bounds.max[axis] += Math.max(0, old[axis] - b[axis]);
      }
      return intersects(query, bounds);
    },
    (index) => {
      const v = b.voxels[index];
      const box = orientedBox(
        b,
        { x: v.x + 0.01, y: v.y + 0.01, z: v.z + 0.01 },
        { x: v.x + 0.99, y: v.y + 0.99, z: v.z + 0.99 },
        old,
        index,
      );
      if (sweepObb(box, axisBox(query), { x: b.x - old.x, y: b.y - old.y, z: b.z - old.z })) {
        hit = true;
        return false;
      }
    },
  );
  return hit;
}

/** World angular velocity for the renderer's yaw * pitch * roll convention. */
export function angularVelocity(b: RubbleBody): Vec3 {
  return { ...b.omega };
}

export function pointVelocity(b: RubbleBody, offset: Vec3): Vec3 {
  const w = angularVelocity(b);
  return {
    x: b.vx + w.y * offset.z - w.z * offset.y,
    y: b.vy + w.z * offset.x - w.x * offset.z,
    z: b.vz + w.x * offset.y - w.y * offset.x,
  };
}
