import { physicsMaterial } from '../core/material-physics';
import type { RubbleBody, Vec3 } from '../core/types';
import { inverseWorld, kineticEnergy } from './rotation';
import { pointVelocity } from './rubble-shape';
import type { Bounds } from './section-tree';

export interface Contact {
  point: Vec3;
  normal: Vec3;
  fraction: number;
  penetration: number;
  terrain?: number;
  body?: RubbleBody;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}
export type ContactResult =
  | { kind: 'clear' }
  | { kind: 'deferred' }
  | { kind: 'contact'; contacts: Contact[] };
export const clearContact: ContactResult = { kind: 'clear' };
/** Exact slab entry for a translated conservative voxel box. Initial overlaps retain their own normal. */
export function sweepBox(box: Bounds, target: Bounds, delta: Vec3): Contact | null {
  let entry = -Infinity,
    exit = Infinity,
    axis: 'x' | 'y' | 'z' = 'y',
    sign = 1;
  let depth = Infinity,
    overlapAxis: 'x' | 'y' | 'z' = 'y',
    overlapSign = 1,
    overlapping = true;
  for (const a of ['x', 'y', 'z'] as const) {
    const positive = target.max[a] - box.min[a],
      negative = box.max[a] - target.min[a];
    if (positive <= 0 || negative <= 0) overlapping = false;
    if (Math.min(positive, negative) < depth) {
      depth = Math.min(positive, negative);
      overlapAxis = a;
      overlapSign = positive < negative ? 1 : -1;
    }
    if (Math.abs(delta[a]) < 1e-10) {
      if (positive <= 0 || negative <= 0) return null;
      continue;
    }
    const t1 = (target.min[a] - box.max[a]) / delta[a],
      t2 = (target.max[a] - box.min[a]) / delta[a];
    const near = Math.min(t1, t2),
      far = Math.max(t1, t2);
    if (near > entry) {
      entry = near;
      axis = a;
      sign = delta[a] > 0 ? -1 : 1;
    }
    exit = Math.min(exit, far);
  }
  if (!overlapping && (entry > exit || entry < 0 || entry > 1)) return null;
  if (overlapping) {
    axis = overlapAxis;
    sign = overlapSign;
    entry = 0;
  }
  const fraction = Math.max(0, entry),
    normal = { x: 0, y: 0, z: 0 },
    point = { x: 0, y: 0, z: 0 };
  normal[axis] = sign;
  for (const a of ['x', 'y', 'z'] as const)
    point[a] =
      (Math.max(box.min[a] + delta[a] * fraction, target.min[a]) +
        Math.min(box.max[a] + delta[a] * fraction, target.max[a])) /
      2;
  point[axis] = sign > 0 ? target.max[axis] : target.min[axis];
  return {
    point,
    normal,
    fraction,
    penetration: overlapping ? Math.max(0, depth) : 0,
    minX: Math.max(box.min.x + delta.x * fraction, target.min.x),
    maxX: Math.min(box.max.x + delta.x * fraction, target.max.x),
    minZ: Math.max(box.min.z + delta.z * fraction, target.min.z),
    maxZ: Math.min(box.max.z + delta.z * fraction, target.max.z),
  };
}
export function relativePoint(b: RubbleBody, point: Vec3) {
  return {
    x: point.x - b.x - b.centre.x,
    y: point.y - b.y - b.centre.y,
    z: point.z - b.z - b.centre.z,
  };
}
const cross = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});
const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
export function addAngularVelocity(b: RubbleBody, w: Vec3) {
  b.omega.x += w.x;
  b.omega.y += w.y;
  b.omega.z += w.z;
}
export interface ContactResponse {
  closing: number;
  impulse: number;
  effectiveInverseMass: number;
  dissipated: number;
}
const responses = new WeakMap<RubbleBody, ContactResponse>();
export const contactResponse = (b: RubbleBody) => responses.get(b);
export function applyImpulse(b: RubbleBody, impulse: Vec3, point: Vec3) {
  if (b.sleeping) return;
  b.vx += impulse.x / b.mass;
  b.vy += impulse.y / b.mass;
  b.vz += impulse.z / b.mass;
  addAngularVelocity(b, inverseWorld(b, cross(relativePoint(b, point), impulse)));
}
export function effectiveInverse(b: RubbleBody, c: Contact, n: Vec3) {
  let result = 0;
  for (const body of [b, c.body])
    if (body && !body.sleeping) {
      const arm = cross(relativePoint(body, c.point), n);
      result += 1 / body.mass + dot(arm, inverseWorld(body, arm));
    }
  return Math.max(1e-9, result);
}
const relative = (b: RubbleBody, c: Contact) => {
  const v = pointVelocity(b, relativePoint(b, c.point));
  if (c.body) {
    const other = pointVelocity(c.body, relativePoint(c.body, c.point));
    v.x -= other.x;
    v.y -= other.y;
    v.z -= other.z;
  }
  return v;
};
const pair = (b: RubbleBody, c: Contact, n: Vec3, j: number) => {
  const impulse = { x: n.x * j, y: n.y * j, z: n.z * j };
  applyImpulse(b, impulse, c.point);
  if (c.body) applyImpulse(c.body, { x: -impulse.x, y: -impulse.y, z: -impulse.z }, c.point);
};
export function reduceManifold(contacts: Contact[]) {
  const ordered = [...contacts].sort((a, b) => b.penetration - a.penetration),
    chosen: Contact[] = [];
  if (ordered.length) chosen.push(ordered.shift()!);
  while (chosen.length < 4 && ordered.length) {
    let best = -1,
      dist = 0;
    for (let i = 0; i < ordered.length; i++) {
      const p = ordered[i].point,
        d = Math.min(
          ...chosen.map(
            (c) => (p.x - c.point.x) ** 2 + (p.y - c.point.y) ** 2 + (p.z - c.point.z) ** 2,
          ),
        );
      if (d > dist) {
        dist = d;
        best = i;
      }
    }
    if (best < 0 || dist < 0.01) break;
    chosen.push(ordered.splice(best, 1)[0]);
  }
  return chosen;
}
const cache = new WeakMap<
  RubbleBody,
  Map<
    string,
    { version: number; otherVersion: number; normal: number; t1: number; t2: number; step: number }
  >
>();
let solveStep = 0;
export function resolveManifold(
  b: RubbleBody,
  contacts: Contact[],
  restitution = 0.08,
): ContactResponse {
  const selected = reduceManifold(contacts),
    otherBodies = [...new Set(selected.flatMap((c) => (c.body ? [c.body] : [])))],
    before = kineticEnergy(b) + otherBodies.reduce((n, o) => n + kineticEnergy(o), 0);
  let memory = cache.get(b);
  if (!memory) {
    memory = new Map();
    cache.set(b, memory);
  }
  const step = ++solveStep;
  const constraints = selected.map((c) => {
    const axis = Math.abs(c.normal.y) < 0.9 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 },
      t = cross(axis, c.normal),
      len = Math.hypot(t.x, t.y, t.z),
      t1 = { x: t.x / len, y: t.y / len, z: t.z / len },
      t2 = cross(c.normal, t1),
      vn = dot(relative(b, c), c.normal),
      key = `${c.terrain ?? 'd'}:${c.body?.id ?? -1}:${Math.round(c.point.x * 20)}:${Math.round(c.point.y * 20)}:${Math.round(c.point.z * 20)}:${Math.round(c.normal.x * 100)},${Math.round(c.normal.y * 100)},${Math.round(c.normal.z * 100)}`,
      old = memory!.get(key);
    const mu = Math.sqrt(
        physicsMaterial(b.voxels[0]?.material ?? 4).friction *
          physicsMaterial(c.body?.voxels[0]?.material ?? 4).friction,
      ),
      kn = effectiveInverse(b, c, c.normal);
    const valid =
      old &&
      old.version === b.geometryVersion &&
      old.otherVersion === (c.body?.geometryVersion ?? -1) &&
      step - old.step < 128 &&
      Math.abs(vn) < 0.5;
    const state = {
      c,
      t1,
      t2,
      key,
      mu,
      kn,
      kt1: effectiveInverse(b, c, t1),
      kt2: effectiveInverse(b, c, t2),
      closing: Math.max(0, -vn),
      bounce:
        vn < -4
          ? -vn * Math.min(restitution, physicsMaterial(b.voxels[0]?.material ?? 4).restitution)
          : 0,
      jn: valid ? Math.min(old.normal, 0.5 / kn) : 0,
      j1: 0,
      j2: 0,
    };
    if (state.jn) pair(b, c, c.normal, state.jn);
    return state;
  });
  for (let iteration = 0; iteration < 4; iteration++)
    for (const q of constraints) {
      const old = q.jn;
      q.jn = Math.max(0, old + (q.bounce - dot(relative(b, q.c), q.c.normal)) / q.kn);
      pair(b, q.c, q.c.normal, q.jn - old);
      const v = relative(b, q.c),
        j1 = q.j1 - dot(v, q.t1) / q.kt1,
        j2 = q.j2 - dot(v, q.t2) / q.kt2,
        len = Math.hypot(j1, j2),
        scale = Math.min(1, (q.mu * q.jn) / Math.max(1e-9, len)),
        n1 = j1 * scale,
        n2 = j2 * scale;
      pair(b, q.c, q.t1, n1 - q.j1);
      pair(b, q.c, q.t2, n2 - q.j2);
      q.j1 = n1;
      q.j2 = n2;
    }
  let impulse = 0,
    closing = 0,
    inverse = 0;
  for (const q of constraints) {
    impulse += q.jn;
    closing = Math.max(closing, q.closing);
    inverse = Math.max(inverse, q.kn);
    memory.set(q.key, {
      version: b.geometryVersion,
      otherVersion: q.c.body?.geometryVersion ?? -1,
      normal: q.jn,
      t1: q.j1,
      t2: q.j2,
      step,
    });
  }
  if (memory.size > 64)
    for (const [key, value] of memory) if (step - value.step > 8) memory.delete(key);
  const after = kineticEnergy(b) + otherBodies.reduce((n, o) => n + kineticEnergy(o), 0),
    response = {
      closing,
      impulse,
      effectiveInverseMass: inverse,
      dissipated: Math.max(0, before - after),
    };
  responses.set(b, response);
  return response;
}
/** Compatibility wrapper for the per-axis swept movement path. */
export function resolveContact(b: RubbleBody, c: Contact, restitution = 0.08) {
  return resolveManifold(b, [c], restitution).closing;
}
export function energyImpulse(b: RubbleBody, direction: Vec3, energy: number, point: Vec3) {
  if (!(energy > 0) || !Number.isFinite(energy)) return 0;
  const len = Math.hypot(direction.x, direction.y, direction.z);
  if (len < 1e-8) return 0;
  const n = { x: direction.x / len, y: direction.y / len, z: direction.z / len };
  b.sleeping = false;
  b.restTime = 0;
  const c: Contact = {
      normal: n,
      point,
      penetration: 0,
      fraction: 0,
      minX: point.x,
      maxX: point.x,
      minZ: point.z,
      maxZ: point.z,
    },
    k = effectiveInverse(b, c, n),
    v = dot(relative(b, c), n),
    j = Math.max(0, (-v + Math.sqrt(v * v + 2 * k * energy)) / k),
    before = kineticEnergy(b);
  applyImpulse(b, { x: n.x * j, y: n.y * j, z: n.z * j }, point);
  const speed = Math.hypot(b.vx, b.vy, b.vz);
  if (speed > 36) {
    b.vx *= 36 / speed;
    b.vy *= 36 / speed;
    b.vz *= 36 / speed;
  }
  const angular = Math.hypot(b.omega.x, b.omega.y, b.omega.z);
  if (angular > 12) {
    b.omega.x *= 12 / angular;
    b.omega.y *= 12 / angular;
    b.omega.z *= 12 / angular;
  }
  return Math.max(0, kineticEnergy(b) - before);
}
