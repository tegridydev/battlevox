import type { RubbleBody, Vec3 } from '../core/types';
import { rotationAxes } from './rotation';
import { turnSection } from './rubble-shape';

export interface Bounds {
  min: Vec3;
  max: Vec3;
}
export interface TreeNode {
  x: number;
  y: number;
  z: number;
  size: number;
  children: Map<number, TreeNode>;
  indices: number[];
}
interface Tree {
  version: number;
  root: TreeNode;
}
const trees = new WeakMap<RubbleBody, Tree>();
const node = (x: number, y: number, z: number, size: number): TreeNode => ({
  x,
  y,
  z,
  size,
  children: new Map(),
  indices: [],
});
/** Local octree survives rigid motion. Only edits rebuild it. */
export function* prepareSectionTree(b: RubbleBody): Generator<void, void, unknown> {
  if (trees.get(b)?.version === b.geometryVersion) return;
  const version = b.geometryVersion;
  const size = 2 ** Math.ceil(Math.log2(Math.max(1, b.width, b.height, b.depth)));
  const root = node(0, 0, 0, size);
  for (let i = 0; i < b.voxels.length; i++) {
    const v = b.voxels[i];
    let n = root;
    while (n.size > 2) {
      const half = n.size / 2;
      const x = v.x >= n.x + half ? 1 : 0,
        y = v.y >= n.y + half ? 1 : 0,
        z = v.z >= n.z + half ? 1 : 0;
      const key = x + 2 * y + 4 * z;
      let child = n.children.get(key);
      if (!child) {
        child = node(n.x + x * half, n.y + y * half, n.z + z * half, half);
        n.children.set(key, child);
      }
      n = child;
    }
    n.indices.push(i);
    if (i % 128 === 0) yield;
  }
  if (version === b.geometryVersion) trees.set(b, { version, root });
}
export function voxelPoint(b: RubbleBody, index: number): Vec3 {
  const v = b.voxels[index];
  const p = turnSection(b, {
    x: v.x + 0.5 - b.centre.x,
    y: v.y + 0.5 - b.centre.y,
    z: v.z + 0.5 - b.centre.z,
  });
  return { x: b.x + b.centre.x + p.x, y: b.y + b.centre.y + p.y, z: b.z + b.centre.z + p.z };
}
export function rotatedBounds(b: RubbleBody, min: Vec3, max: Vec3, position: Vec3 = b): Bounds {
  const hx = (max.x - min.x) * 0.5,
    hy = (max.y - min.y) * 0.5,
    hz = (max.z - min.z) * 0.5;
  const dx = min.x + hx - b.centre.x,
    dy = min.y + hy - b.centre.y,
    dz = min.z + hz - b.centre.z;
  const [a, c, d] = rotationAxes(b);
  const x = position.x + b.centre.x + a.x * dx + c.x * dy + d.x * dz,
    y = position.y + b.centre.y + a.y * dx + c.y * dy + d.y * dz,
    z = position.z + b.centre.z + a.z * dx + c.z * dy + d.z * dz;
  const ex = Math.abs(a.x) * hx + Math.abs(c.x) * hy + Math.abs(d.x) * hz,
    ey = Math.abs(a.y) * hx + Math.abs(c.y) * hy + Math.abs(d.y) * hz,
    ez = Math.abs(a.z) * hx + Math.abs(c.z) * hy + Math.abs(d.z) * hz;
  return { min: { x: x - ex, y: y - ey, z: z - ez }, max: { x: x + ex, y: y + ey, z: z + ez } };
}

export function intersects(a: Bounds, b: Bounds) {
  return (
    a.min.x < b.max.x &&
    a.max.x > b.min.x &&
    a.min.y < b.max.y &&
    a.max.y > b.min.y &&
    a.min.z < b.max.z &&
    a.max.z > b.min.z
  );
}
/** Returning false from visit stops traversal after the first exact contact. */
export function visitSection(
  b: RubbleBody,
  accepts: (bounds: Bounds) => boolean,
  visit: (index: number) => boolean | void,
  position: Vec3 = b,
) {
  if (trees.get(b)?.version !== b.geometryVersion)
    for (const _ of prepareSectionTree(b)) {
      /* synchronous fallback for small direct edits */
    }
  const root = trees.get(b)?.root;
  if (!root) return;
  const stack = [root];
  while (stack.length) {
    const n = stack.pop()!;
    const bounds = rotatedBounds(
      b,
      n,
      {
        x: Math.min(b.width, n.x + n.size),
        y: Math.min(b.height, n.y + n.size),
        z: Math.min(b.depth, n.z + n.size),
      },
      position,
    );
    if (!accepts(bounds)) continue;
    for (const index of n.indices) if (visit(index) === false) return;
    for (const child of n.children.values()) stack.push(child);
  }
}

/** Maintain leaf indices after swap-removal; a single bullet must not rebuild a whole tower tree. */
export function removeTreeVoxel(b: RubbleBody, index: number) {
  const tree = trees.get(b);
  if (!tree || tree.version !== b.geometryVersion) return;
  // Persistent path updates keep snapshots immutable without cloning a tower's entire tree.
  const update = (n: TreeNode, v: Vec3, edit: (indices: number[]) => void): TreeNode => {
    const copy: TreeNode = { ...n, children: new Map(n.children), indices: n.indices };
    if (n.size <= 2) {
      copy.indices = n.indices.slice();
      edit(copy.indices);
      return copy;
    }
    const half = n.size / 2,
      key = (v.x >= n.x + half ? 1 : 0) + (v.y >= n.y + half ? 2 : 0) + (v.z >= n.z + half ? 4 : 0);
    const child = n.children.get(key);
    if (child) copy.children.set(key, update(child, v, edit));
    return copy;
  };
  let root = update(tree.root, b.voxels[index], (ids) => {
    const at = ids.indexOf(index);
    if (at >= 0) ids.splice(at, 1);
  });
  const last = b.voxels.length - 1;
  if (index !== last)
    root = update(root, b.voxels[last], (ids) => {
      const at = ids.indexOf(last);
      if (at >= 0) ids[at] = index;
    });
  trees.set(b, { version: tree.version + 1, root });
}
export function sectionRoot(b: RubbleBody): TreeNode | undefined {
  return trees.get(b)?.root;
}

/** Resumable traversal: even rejected nodes yield so a large query cannot restart forever. */
export function* sectionLeaves(
  b: RubbleBody,
  accepts: (bounds: Bounds) => boolean,
  position: Vec3 = b,
): Generator<number | undefined, void, unknown> {
  for (const _ of prepareSectionTree(b)) yield undefined;
  const root = trees.get(b)?.root;
  if (!root) return;
  const stack = [root];
  while (stack.length) {
    const n = stack.pop()!;
    const bounds = rotatedBounds(
      b,
      n,
      {
        x: Math.min(b.width, n.x + n.size),
        y: Math.min(b.height, n.y + n.size),
        z: Math.min(b.depth, n.z + n.size),
      },
      position,
    );
    if (accepts(bounds)) {
      for (const index of n.indices) yield index;
      for (const child of n.children.values()) stack.push(child);
    }
    yield;
  }
}
/** Published trees are immutable and can be shared by a suspended pose snapshot. */
export function shareSectionTree(source: RubbleBody, target: RubbleBody) {
  const tree = trees.get(source);
  if (tree?.version === target.geometryVersion)
    trees.set(target, { version: tree.version, root: tree.root });
}
