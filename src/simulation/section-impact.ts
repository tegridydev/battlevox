import type { RubbleBody, Vec3 } from '../core/types';
import { axisBox, orientedBox, sweepObb } from './collision-geometry';
import type { Contact } from './contact';
import { type Quaternion, rotate } from './rotation';
import { pointVelocity, rubbleBounds } from './rubble-shape';
import { intersects, shareSectionTree, visitSection } from './section-tree';

export interface ImpactPose extends Vec3 {
  orientation: Quaternion;
  omega: Vec3;
  vx: number;
  vy: number;
  vz: number;
}

function mixQuaternion(a: Quaternion, b: Quaternion, t: number): Quaternion {
  const sign = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w < 0 ? -1 : 1;
  const q = {
    x: a.x * (1 - t) + b.x * t * sign,
    y: a.y * (1 - t) + b.y * t * sign,
    z: a.z * (1 - t) + b.z * t * sign,
    w: a.w * (1 - t) + b.w * t * sign,
  };
  const length = Math.hypot(q.x, q.y, q.z, q.w);
  return { x: q.x / length, y: q.y / length, z: q.z / length, w: q.w / length };
}

function angularDistance(a: Quaternion, b: Quaternion) {
  return 2 * Math.acos(Math.min(1, Math.abs(a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w)));
}

function sectionRadius(b: RubbleBody) {
  return Math.hypot(
    Math.max(b.centre.x, b.width - b.centre.x),
    Math.max(b.centre.y, b.height - b.centre.y),
    Math.max(b.centre.z, b.depth - b.centre.z),
  );
}

/** Broad-phase bounds include the rotational arc, not only the final orientation. */
export function impactBounds(b: RubbleBody, old: ImpactPose) {
  const before = rubbleBounds({ ...b, orientation: old.orientation }, old),
    after = rubbleBounds(b);
  const margin = sectionRadius(b) * angularDistance(old.orientation, b.orientation);
  return {
    min: {
      x: Math.min(before.min.x, after.min.x) - margin,
      y: Math.min(before.min.y, after.min.y) - margin,
      z: Math.min(before.min.z, after.min.z) - margin,
    },
    max: {
      x: Math.max(before.max.x, after.max.x) + margin,
      y: Math.max(before.max.y, after.max.y) + margin,
      z: Math.max(before.max.z, after.max.z) + margin,
    },
  };
}

/** Sweep occupied voxels in short angular intervals. The maximum arc approximation is
 * below the existing 0.01-unit voxel inset; holes and empty rotated corners stay empty.
 * Runtime motion slices already bound the furthest corner's angular travel to 0.15 units.
 */
export function sectionImpact(
  b: RubbleBody,
  old: ImpactPose,
  target: Vec3,
  radius: number,
  height: number,
): { contact: Contact; speed: number } | null {
  const query = {
    min: { x: target.x - radius, y: target.y, z: target.z - radius },
    max: { x: target.x + radius, y: target.y + height, z: target.z + radius },
  };
  if (!intersects(query, impactBounds(b, old))) return null;
  const angle = angularDistance(old.orientation, b.orientation);
  const steps = Math.max(1, Math.ceil((angle * sectionRadius(b)) / 0.01));
  const pose = { ...b };
  shareSectionTree(b, pose);
  const targetBox = axisBox(query);
  for (let step = 0; step < steps; step++) {
    const t0 = step / steps,
      t1 = (step + 1) / steps,
      tm = (t0 + t1) / 2;
    const q0 = mixQuaternion(old.orientation, b.orientation, t0),
      q1 = mixQuaternion(old.orientation, b.orientation, t1);
    pose.orientation = mixQuaternion(old.orientation, b.orientation, tm);
    pose.x = old.x + (b.x - old.x) * tm;
    pose.y = old.y + (b.y - old.y) * tm;
    pose.z = old.z + (b.z - old.z) * tm;
    const travel = { x: (b.x - old.x) / steps, y: (b.y - old.y) / steps, z: (b.z - old.z) / steps };
    let first: Contact | null = null;
    visitSection(
      pose,
      (bounds) =>
        intersects(query, {
          min: {
            x: bounds.min.x - Math.abs(travel.x) / 2 - 0.01,
            y: bounds.min.y - Math.abs(travel.y) / 2 - 0.01,
            z: bounds.min.z - Math.abs(travel.z) / 2 - 0.01,
          },
          max: {
            x: bounds.max.x + Math.abs(travel.x) / 2 + 0.01,
            y: bounds.max.y + Math.abs(travel.y) / 2 + 0.01,
            z: bounds.max.z + Math.abs(travel.z) / 2 + 0.01,
          },
        }),
      (index) => {
        const v = b.voxels[index],
          local = {
            x: v.x + 0.5 - b.centre.x,
            y: v.y + 0.5 - b.centre.y,
            z: v.z + 0.5 - b.centre.z,
          };
        const p0 = rotate(q0, local),
          p1 = rotate(q1, local),
          mid = rotate(pose.orientation, local);
        const box = orientedBox(
          pose,
          { x: v.x + 0.01, y: v.y + 0.01, z: v.z + 0.01 },
          { x: v.x + 0.99, y: v.y + 0.99, z: v.z + 0.99 },
          {
            x: pose.x - travel.x / 2 + p0.x - mid.x,
            y: pose.y - travel.y / 2 + p0.y - mid.y,
            z: pose.z - travel.z / 2 + p0.z - mid.z,
          },
          index,
        );
        const contact = sweepObb(box, targetBox, {
          x: travel.x + p1.x - p0.x,
          y: travel.y + p1.y - p0.y,
          z: travel.z + p1.z - p0.z,
        });
        if (contact && (!first || contact.fraction < first.fraction)) first = contact;
      },
    );
    // The callback assigns first; keep its type explicit across that boundary.
    const contact = first as Contact | null;
    if (contact) {
      const t = t0 + (t1 - t0) * contact.fraction;
      const velocity = pointVelocity(
        { ...pose, vx: old.vx, vy: old.vy, vz: old.vz, omega: old.omega },
        {
          x: contact.point.x - (old.x + (b.x - old.x) * t + b.centre.x),
          y: contact.point.y - (old.y + (b.y - old.y) * t + b.centre.y),
          z: contact.point.z - (old.z + (b.z - old.z) * t + b.centre.z),
        },
      );
      return { contact, speed: Math.hypot(velocity.x, velocity.y, velocity.z) };
    }
  }
  return null;
}
