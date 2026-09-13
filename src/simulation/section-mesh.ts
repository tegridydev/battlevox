import type { Colour, RubbleBody } from '../core/types';
import { fracturePalette } from '../rendering/materials';

interface Mesh {
  version: number;
  data: Float32Array;
}
export const sectionMeshes = new WeakMap<RubbleBody, Mesh>();
function mergeRow(
  mask: Int16Array,
  row: number,
  dims: number[],
  axis: number,
  slice: number,
  colours: Colour[],
  data: number[],
) {
  const u = (axis + 1) % 3,
    v = (axis + 2) % 3;
  for (let i = 0; i < dims[u]; ) {
    const n = row * dims[u] + i,
      material = mask[n];
    if (!material) {
      i++;
      continue;
    }
    let width = 1,
      height = 1;
    while (i + width < dims[u] && mask[n + width] === material) width++;
    outer: while (row + height < dims[v]) {
      for (let k = 0; k < width; k++) if (mask[n + height * dims[u] + k] !== material) break outer;
      height++;
    }
    const base = [0, 0, 0];
    base[axis] = slice;
    base[u] = i;
    base[v] = row;
    const corners = [base, [...base], [...base], [...base]];
    corners[1][u] += width;
    corners[2][u] += width;
    corners[2][v] += height;
    corners[3][v] += height;
    const normal = [0, 0, 0];
    normal[axis] = Math.sign(material);
    const colour = colours[Math.abs(material)];
    for (const k of material > 0 ? [0, 1, 2, 0, 2, 3] : [0, 3, 2, 0, 2, 1]) {
      const p = corners[k];
      data.push(
        p[0],
        p[1],
        p[2],
        normal[0],
        normal[1],
        normal[2],
        colour[0],
        colour[1],
        colour[2],
        Math.abs(material),
      );
    }
    for (let yy = 0; yy < height; yy++) mask.fill(0, n + yy * dims[u], n + yy * dims[u] + width);
    i += width;
  }
}
function fillRow(
  mask: Int16Array,
  row: number,
  dims: number[],
  axis: number,
  slice: number,
  occupied: Map<number, number>,
  cuts: Map<number, number>,
) {
  const u = (axis + 1) % 3,
    v = (axis + 2) % 3,
    strides = [1, dims[0], dims[0] * dims[1]];
  let n = row * dims[u];
  for (let col = 0; col < dims[u]; col++) {
    const key = slice * strides[axis] + col * strides[u] + row * strides[v];
    const a = slice > 0 ? (occupied.get(key - strides[axis]) ?? 0) : 0;
    const b = slice < dims[axis] ? (occupied.get(key) ?? 0) : 0;
    mask[n++] =
      a && !b
        ? a + ((cuts.get(key - strides[axis]) ?? 0) & (1 << (axis * 2)) ? 32 : 0)
        : b && !a
          ? -(b + ((cuts.get(key) ?? 0) & (1 << (axis * 2 + 1)) ? 32 : 0))
          : 0;
  }
}
/** Greedy coplanar faces. Small row functions keep both runtime work and JIT compilation bounded. */
export function* prepareSectionMesh(
  body: RubbleBody,
  colours: Colour[],
): Generator<void, void, unknown> {
  const version = body.geometryVersion;
  if (sectionMeshes.get(body)?.version === version) return;
  const dims = [body.width, body.height, body.depth],
    occupied = new Map<number, number>(),
    cuts = new Map<number, number>();
  colours = fracturePalette(colours);
  let work = 0;
  for (const v of body.voxels) {
    const key = v.x + dims[0] * (v.y + dims[1] * v.z);
    occupied.set(key, v.material);
    if (v.fractureFaces) cuts.set(key, v.fractureFaces);
    if (++work % 128 === 0) yield;
  }
  const data: number[] = [];
  for (let axis = 0; axis < 3; axis++) {
    const u = (axis + 1) % 3,
      v = (axis + 2) % 3,
      mask = new Int16Array(dims[u] * dims[v]);
    for (let slice = 0; slice <= dims[axis]; slice++) {
      for (let row = 0; row < dims[v]; row++) {
        fillRow(mask, row, dims, axis, slice, occupied, cuts);
        yield;
      }
      for (let row = 0; row < dims[v]; row++) {
        mergeRow(mask, row, dims, axis, slice, colours, data);
        yield;
      }
    }
  }
  if (version === body.geometryVersion)
    sectionMeshes.set(body, { version, data: new Float32Array(data) });
}
