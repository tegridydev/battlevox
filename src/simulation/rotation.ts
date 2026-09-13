import type { RubbleBody, Vec3 } from '../core/types';
export interface Quaternion extends Vec3 {
  w: number;
}
export const identity = (): Quaternion => ({ x: 0, y: 0, z: 0, w: 1 });
export function multiply(a: Quaternion, b: Quaternion): Quaternion {
  const q = {
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  };
  const n = Math.hypot(q.x, q.y, q.z, q.w) || 1;
  return { x: q.x / n, y: q.y / n, z: q.z / n, w: q.w / n };
}
export function rotate(q: Quaternion, p: Vec3): Vec3 {
  const tx = 2 * (q.y * p.z - q.z * p.y),
    ty = 2 * (q.z * p.x - q.x * p.z),
    tz = 2 * (q.x * p.y - q.y * p.x);
  return {
    x: p.x + q.w * tx + q.y * tz - q.z * ty,
    y: p.y + q.w * ty + q.z * tx - q.x * tz,
    z: p.z + q.w * tz + q.x * ty - q.y * tx,
  };
}
export const unrotate = (q: Quaternion, p: Vec3) =>
  rotate({ x: -q.x, y: -q.y, z: -q.z, w: q.w }, p);
export function integrateRotation(b: RubbleBody, dt: number) {
  const w = b.omega,
    n = Math.hypot(w.x, w.y, w.z);
  if (n < 1e-12) return;
  const s = Math.sin((n * dt) / 2) / n;
  b.orientation = multiply(
    { x: w.x * s, y: w.y * s, z: w.z * s, w: Math.cos((n * dt) / 2) },
    b.orientation,
  );
}
function angles(b: RubbleBody) {
  const x = rotate(b.orientation, { x: 1, y: 0, z: 0 }),
    y = rotate(b.orientation, { x: 0, y: 1, z: 0 }),
    z = rotate(b.orientation, { x: 0, y: 0, z: 1 });
  return {
    yaw: Math.atan2(z.x, z.z),
    pitch: Math.asin(Math.max(-1, Math.min(1, z.y))),
    roll: Math.atan2(x.y, y.y),
  };
}
/** Compatibility accessors for old fixtures/debugging; physical integration uses quaternion/omega. */
export function withRotation(b: RubbleBody) {
  for (const axis of ['yaw', 'pitch', 'roll'] as const)
    Object.defineProperty(b, axis, {
      enumerable: true,
      configurable: true,
      get: () => angles(b)[axis],
      set: (v: number) => {
        const a = angles(b);
        a[axis] = v;
        const sy = Math.sin(a.yaw / 2),
          cy = Math.cos(a.yaw / 2),
          sp = Math.sin(-a.pitch / 2),
          cp = Math.cos(a.pitch / 2),
          sr = Math.sin(a.roll / 2),
          cr = Math.cos(a.roll / 2);
        b.orientation = multiply(
          multiply({ x: 0, y: sy, z: 0, w: cy }, { x: sp, y: 0, z: 0, w: cp }),
          { x: 0, y: 0, z: sr, w: cr },
        );
      },
    });
  const rates = () => {
    const a = angles(b),
      sy = Math.sin(a.yaw),
      cy = Math.cos(a.yaw),
      cp = Math.cos(a.pitch),
      sp = Math.sin(a.pitch),
      roll = (sy * b.omega.x + cy * b.omega.z) / (Math.abs(cp) < 1e-8 ? 1e-8 : cp);
    return {
      spinRoll: roll,
      spinPitch: -cy * b.omega.x + sy * b.omega.z,
      spinYaw: b.omega.y - sp * roll,
    };
  };
  for (const axis of ['spinRoll', 'spinPitch', 'spinYaw'] as const)
    Object.defineProperty(b, axis, {
      enumerable: true,
      configurable: true,
      get: () => rates()[axis],
      set: (value: number) => {
        const r = rates();
        r[axis] = value;
        const a = angles(b),
          sy = Math.sin(a.yaw),
          cy = Math.cos(a.yaw),
          sp = Math.sin(a.pitch),
          cp = Math.cos(a.pitch);
        b.omega = {
          x: sy * cp * r.spinRoll - cy * r.spinPitch,
          y: sp * r.spinRoll + r.spinYaw,
          z: cy * cp * r.spinRoll + sy * r.spinPitch,
        };
      },
    });
  return b;
}
export function inverseWorld(b: RubbleBody, v: Vec3): Vec3 {
  const p = unrotate(b.orientation, v),
    xx = b.inertia.x,
    yy = b.inertia.y,
    zz = b.inertia.z,
    [xy, xz, yz] = b.inertiaCross;
  const a = yy * zz - yz * yz,
    c = xz * yz - xy * zz,
    d = xy * yz - xz * yy,
    e = xx * zz - xz * xz,
    f = xy * xz - xx * yz,
    g = xx * yy - xy * xy,
    det = xx * a + xy * c + xz * d;
  if (!(det > 1e-12))
    return rotate(b.orientation, {
      x: p.x / Math.max(1e-6, xx),
      y: p.y / Math.max(1e-6, yy),
      z: p.z / Math.max(1e-6, zz),
    });
  return rotate(b.orientation, {
    x: (a * p.x + c * p.y + d * p.z) / det,
    y: (c * p.x + e * p.y + f * p.z) / det,
    z: (d * p.x + f * p.y + g * p.z) / det,
  });
}
export function kineticEnergy(b: RubbleBody) {
  const w = unrotate(b.orientation, b.omega),
    [xy, xz, yz] = b.inertiaCross;
  return (
    0.5 *
    (b.mass * (b.vx * b.vx + b.vy * b.vy + b.vz * b.vz) +
      b.inertia.x * w.x * w.x +
      b.inertia.y * w.y * w.y +
      b.inertia.z * w.z * w.z +
      2 * (xy * w.x * w.y + xz * w.x * w.z + yz * w.y * w.z))
  );
}

const basisCache = new WeakMap<
  RubbleBody,
  { x: number; y: number; z: number; w: number; axes: [Vec3, Vec3, Vec3] }
>();
/** One quaternion basis per pose, shared by collision boxes and their enclosing bounds. */
export function rotationAxes(body: RubbleBody): [Vec3, Vec3, Vec3] {
  const q = body.orientation;
  let cached = basisCache.get(body);
  if (!cached || cached.x !== q.x || cached.y !== q.y || cached.z !== q.z || cached.w !== q.w) {
    cached = {
      x: q.x,
      y: q.y,
      z: q.z,
      w: q.w,
      axes: [
        rotate(q, { x: 1, y: 0, z: 0 }),
        rotate(q, { x: 0, y: 1, z: 0 }),
        rotate(q, { x: 0, y: 0, z: 1 }),
      ],
    };
    basisCache.set(body, cached);
  }
  return cached.axes;
}
