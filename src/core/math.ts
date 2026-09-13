import type { Camera, Vec2, Vec3 } from './types';
export const TAU = Math.PI * 2;
export const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const angleWrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
export const dist2 = (a: Vec2, b: Vec2) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2;
export function direction(yaw: number, pitch = 0): Vec3 {
  return {
    x: Math.sin(yaw) * Math.cos(pitch),
    y: Math.sin(pitch),
    z: Math.cos(yaw) * Math.cos(pitch),
  };
}
export function multiply(a: Float32Array, b: Float32Array) {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      o[c * 4 + r] =
        a[r] * b[c * 4] +
        a[4 + r] * b[c * 4 + 1] +
        a[8 + r] * b[c * 4 + 2] +
        a[12 + r] * b[c * 4 + 3];
  return o;
}
export function matrix(camera: Camera, aspect: number, fov: number, near = 0.055) {
  const f = direction(camera.yaw, camera.pitch),
    r = { x: Math.cos(camera.yaw), z: -Math.sin(camera.yaw) },
    u = {
      x: -Math.sin(camera.yaw) * Math.sin(camera.pitch),
      y: Math.cos(camera.pitch),
      z: -Math.cos(camera.yaw) * Math.sin(camera.pitch),
    };
  const v = new Float32Array([
    r.x,
    u.x,
    -f.x,
    0,
    0,
    u.y,
    -f.y,
    0,
    r.z,
    u.z,
    -f.z,
    0,
    -r.x * camera.x - r.z * camera.z,
    -u.x * camera.x - u.y * camera.y - u.z * camera.z,
    f.x * camera.x + f.y * camera.y + f.z * camera.z,
    1,
  ]);
  const t = 1 / Math.tan(fov / 2),
    n = near,
    far = 620,
    p = new Float32Array([
      t / aspect,
      0,
      0,
      0,
      0,
      t,
      0,
      0,
      0,
      0,
      (far + n) / (n - far),
      -1,
      0,
      0,
      (2 * far * n) / (n - far),
      0,
    ]);
  return multiply(p, v);
}
