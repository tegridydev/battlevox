import type { Bounds } from '../simulation/section-tree';
/** Extract clip planes once per frame, then test the positive AABB vertex. */
export function frustumPlanes(matrix: Float32Array): Float32Array {
  const result = new Float32Array(24);
  for (let axis = 0; axis < 3; axis++)
    for (let side = 0; side < 2; side++) {
      const sign = side ? -1 : 1,
        at = (axis * 2 + side) * 4;
      for (let i = 0; i < 4; i++) result[at + i] = matrix[i * 4 + 3] + sign * matrix[i * 4 + axis];
    }
  return result;
}
export function insideFrustum(planes: Float32Array, b: Bounds) {
  for (let i = 0; i < 24; i += 4) {
    const x = planes[i] >= 0 ? b.max.x : b.min.x,
      y = planes[i + 1] >= 0 ? b.max.y : b.min.y,
      z = planes[i + 2] >= 0 ? b.max.z : b.min.z;
    if (planes[i] * x + planes[i + 1] * y + planes[i + 2] * z + planes[i + 3] < 0) return false;
  }
  return true;
}
