import type { RubbleBody, Vec3 } from '../core/types';
import type { Contact } from './contact';
import { rotate, rotationAxes } from './rotation';
import { type Bounds, rotatedBounds, sectionLeaves, visitSection } from './section-tree';
export interface Box {
  centre: Vec3;
  half: Vec3;
  axes: Vec3[];
  bounds: Bounds;
  index: number;
}
const unit = [
  { x: 1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
  { x: 0, y: 0, z: 1 },
];
const basis = rotationAxes;
const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
export function orientedBox(
  b: RubbleBody,
  min: Vec3,
  max: Vec3,
  position: Vec3 = b,
  index = 0,
): Box {
  const offset = rotate(b.orientation, {
    x: (min.x + max.x) / 2 - b.centre.x,
    y: (min.y + max.y) / 2 - b.centre.y,
    z: (min.z + max.z) / 2 - b.centre.z,
  });
  return {
    centre: {
      x: position.x + b.centre.x + offset.x,
      y: position.y + b.centre.y + offset.y,
      z: position.z + b.centre.z + offset.z,
    },
    half: { x: (max.x - min.x) / 2, y: (max.y - min.y) / 2, z: (max.z - min.z) / 2 },
    axes: basis(b),
    bounds: rotatedBounds(b, min, max, position),
    index,
  };
}
export const axisBox = (bounds: Bounds): Box => ({
  centre: {
    x: (bounds.min.x + bounds.max.x) / 2,
    y: (bounds.min.y + bounds.max.y) / 2,
    z: (bounds.min.z + bounds.max.z) / 2,
  },
  half: {
    x: (bounds.max.x - bounds.min.x) / 2,
    y: (bounds.max.y - bounds.min.y) / 2,
    z: (bounds.max.z - bounds.min.z) / 2,
  },
  axes: unit,
  bounds,
  index: 0,
});
interface ProjectionAxis {
  normal: Vec3;
  a: Vec3;
  b: Vec3;
}
const projections = new WeakMap<Vec3[], WeakMap<Vec3[], ProjectionAxis[]>>();
function projectionAxes(a: Vec3[], b: Vec3[]) {
  let cache = projections.get(a);
  if (!cache) {
    cache = new WeakMap();
    projections.set(a, cache);
  }
  let result = cache.get(b);
  if (result) return result;
  const axes = [...a, ...b];
  for (const x of a)
    for (const y of b) {
      const n = { x: x.y * y.z - x.z * y.y, y: x.z * y.x - x.x * y.z, z: x.x * y.y - x.y * y.x },
        length = Math.hypot(n.x, n.y, n.z);
      if (length > 1e-7) axes.push({ x: n.x / length, y: n.y / length, z: n.z / length });
    }
  result = axes.map((normal) => ({
    normal,
    a: {
      x: Math.abs(dot(a[0], normal)),
      y: Math.abs(dot(a[1], normal)),
      z: Math.abs(dot(a[2], normal)),
    },
    b: {
      x: Math.abs(dot(b[0], normal)),
      y: Math.abs(dot(b[1], normal)),
      z: Math.abs(dot(b[2], normal)),
    },
  }));
  cache.set(b, result);
  return result;
}
/** Continuous SAT under translation. Projection axes are shared by all boxes of a rigid pose. */
export function sweepObb(a: Box, b: Box, delta: Vec3): Contact | null {
  const axes = projectionAxes(a.axes, b.axes);
  const offset = {
    x: a.centre.x - b.centre.x,
    y: a.centre.y - b.centre.y,
    z: a.centre.z - b.centre.z,
  };
  let enter = 0,
    exit = 1,
    depth = Infinity,
    normal = { x: 0, y: 1, z: 0 },
    entryNormal = normal,
    overlap = true;
  for (const axis of axes) {
    const n = axis.normal;
    const r = dot(axis.a, a.half) + dot(axis.b, b.half),
      p = dot(offset, n),
      v = dot(delta, n),
      penetration = r - Math.abs(p);
    if (penetration <= 0) overlap = false;
    if (penetration < depth) {
      depth = penetration;
      const sign = p >= 0 ? 1 : -1;
      normal = { x: n.x * sign, y: n.y * sign, z: n.z * sign };
    }
    if (Math.abs(v) < 1e-10) {
      if (Math.abs(p) >= r) return null;
      continue;
    }
    const t1 = (-r - p) / v,
      t2 = (r - p) / v,
      near = Math.min(t1, t2),
      far = Math.max(t1, t2);
    if (near > enter) {
      enter = near;
      const sign = v > 0 ? -1 : 1;
      entryNormal = { x: n.x * sign, y: n.y * sign, z: n.z * sign };
    }
    exit = Math.min(exit, far);
    if (enter > exit) return null;
  }
  if (!overlap && (enter < 0 || enter > 1 || exit < 0)) return null;
  if (!overlap) normal = entryNormal;
  const fraction = overlap ? 0 : enter;
  const minX = Math.max(a.bounds.min.x + delta.x * fraction, b.bounds.min.x),
    maxX = Math.min(a.bounds.max.x + delta.x * fraction, b.bounds.max.x),
    minZ = Math.max(a.bounds.min.z + delta.z * fraction, b.bounds.min.z),
    maxZ = Math.min(a.bounds.max.z + delta.z * fraction, b.bounds.max.z);
  const point = {
    x: (minX + maxX) / 2,
    y:
      (Math.max(a.bounds.min.y + delta.y * fraction, b.bounds.min.y) +
        Math.min(a.bounds.max.y + delta.y * fraction, b.bounds.max.y)) /
      2,
    z: (minZ + maxZ) / 2,
  };
  return {
    point,
    normal,
    fraction,
    penetration: overlap ? Math.max(0, depth) : 0,
    minX,
    maxX,
    minZ,
    maxZ,
  };
}
export interface LocalBox {
  min: Vec3;
  max: Vec3;
  index: number;
}
export interface CollisionNode extends Bounds {
  left?: CollisionNode;
  right?: CollisionNode;
  boxes?: LocalBox[];
}
const compounds = new WeakMap<
  RubbleBody,
  { version: number; boxes: LocalBox[]; root?: CollisionNode }
>();
export function* buildCollisionTree(boxes: LocalBox[]): Generator<void, CollisionNode, unknown> {
  const min = { x: Infinity, y: Infinity, z: Infinity },
    max = { x: -Infinity, y: -Infinity, z: -Infinity };
  let work = 0;
  for (const box of boxes) {
    for (const axis of ['x', 'y', 'z'] as const) {
      min[axis] = Math.min(min[axis], box.min[axis]);
      max[axis] = Math.max(max[axis], box.max[axis]);
    }
    if (++work % 128 === 0) yield;
  }
  const node: CollisionNode = { min, max };
  if (boxes.length <= 8) {
    node.boxes = boxes;
    return node;
  }
  const axis = (['x', 'y', 'z'] as const).reduce((a, b) =>
    max[b] - min[b] > max[a] - min[a] ? b : a,
  );
  boxes.sort((a, b) => a.min[axis] + a.max[axis] - b.min[axis] - b.max[axis]);
  const middle = boxes.length >> 1;
  yield;
  node.left = yield* buildCollisionTree(boxes.slice(0, middle));
  node.right = yield* buildCollisionTree(boxes.slice(middle));
  return node;
}
export function collisionRoot(b: RubbleBody) {
  const c = compounds.get(b);
  return c?.version === b.geometryVersion ? c.root : undefined;
}
export function collisionBoxCount(b: RubbleBody) {
  const c = compounds.get(b);
  return c?.version === b.geometryVersion ? c.boxes.length : 0;
}
export function* prepareCollisionBoxes(b: RubbleBody): Generator<void, void, unknown> {
  if (compounds.get(b)?.version === b.geometryVersion) return;
  const version = b.geometryVersion,
    remaining = new Map<number, number>(),
    stride = b.width * b.height,
    key = (x: number, y: number, z: number) => x + b.width * y + stride * z;
  let work = 0;
  for (let i = 0; i < b.voxels.length; i++) {
    const v = b.voxels[i];
    remaining.set(key(v.x, v.y, v.z), i);
    if (++work % 128 === 0) yield;
  }
  const boxes: LocalBox[] = [];
  for (let i = 0; i < b.voxels.length; i++) {
    const v = b.voxels[i];
    if (!remaining.has(key(v.x, v.y, v.z))) continue;
    let w = 1,
      h = 1,
      d = 1;
    while (v.x + w < b.width && remaining.has(key(v.x + w, v.y, v.z))) w++;
    row: while (v.y + h < b.height) {
      for (let x = 0; x < w; x++) if (!remaining.has(key(v.x + x, v.y + h, v.z))) break row;
      h++;
    }
    plane: while (v.z + d < b.depth) {
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) if (!remaining.has(key(v.x + x, v.y + y, v.z + d))) break plane;
      d++;
    }
    for (let z = 0; z < d; z++)
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          remaining.delete(key(v.x + x, v.y + y, v.z + z));
          if (++work % 128 === 0) yield;
        }
    boxes.push({
      min: { x: v.x + 0.01, y: v.y + 0.01, z: v.z + 0.01 },
      max: { x: v.x + w - 0.01, y: v.y + h - 0.01, z: v.z + d - 0.01 },
      index: i,
    });
  }
  const root = boxes.length ? yield* buildCollisionTree([...boxes]) : undefined;
  if (version === b.geometryVersion) compounds.set(b, { version, boxes, root });
}
export function visitCollisionBoxes(
  b: RubbleBody,
  accept: (bounds: Bounds) => boolean,
  visit: (box: Box) => boolean | void,
  position: Vec3 = b,
) {
  const cached = compounds.get(b);
  if (cached?.version === b.geometryVersion && cached.boxes) {
    for (const box of cached.boxes) {
      const bounds = rotatedBounds(b, box.min, box.max, position);
      if (accept(bounds) && visit(orientedBox(b, box.min, box.max, position, box.index)) === false)
        break;
    }
    return;
  }
  visitSection(
    b,
    accept,
    (index) => {
      const v = b.voxels[index];
      return visit(
        orientedBox(
          b,
          { x: v.x + 0.01, y: v.y + 0.01, z: v.z + 0.01 },
          { x: v.x + 0.99, y: v.y + 0.99, z: v.z + 0.99 },
          position,
          index,
        ),
      );
    },
    position,
  );
}
export function segmentBox(origin: Vec3, direction: Vec3, length: number, box: Box, radius = 0) {
  let enter = 0,
    exit = length,
    normal = { x: 0, y: 1, z: 0 };
  const r = { x: origin.x - box.centre.x, y: origin.y - box.centre.y, z: origin.z - box.centre.z };
  for (let i = 0; i < 3; i++) {
    const n = box.axes[i],
      p = dot(r, n),
      v = dot(direction, n),
      h = box.half[['x', 'y', 'z'][i] as 'x'] + radius;
    if (Math.abs(v) < 1e-10) {
      if (Math.abs(p) > h) return null;
      continue;
    }
    const t1 = (-h - p) / v,
      t2 = (h - p) / v,
      near = Math.min(t1, t2);
    if (near > enter) {
      enter = near;
      normal = { x: n.x * (v > 0 ? -1 : 1), y: n.y * (v > 0 ? -1 : 1), z: n.z * (v > 0 ? -1 : 1) };
    }
    exit = Math.min(exit, Math.max(t1, t2));
    if (enter > exit) return null;
  }
  return enter <= length && exit >= 0 ? { t: enter, normal } : null;
}

/** The query owns this iterator and resumes it on the next physics slice. */
export function* collisionBoxes(
  b: RubbleBody,
  accept: (bounds: Bounds) => boolean,
  position: Vec3 = b,
): Generator<Box | undefined, void, unknown> {
  const cached = compounds.get(b);
  if (cached?.version === b.geometryVersion && cached.boxes) {
    for (const box of cached.boxes) {
      const bounds = rotatedBounds(b, box.min, box.max, position);
      yield accept(bounds) ? orientedBox(b, box.min, box.max, position, box.index) : undefined;
    }
    return;
  }
  for (const index of sectionLeaves(b, accept, position)) {
    if (index === undefined) {
      yield;
      continue;
    }
    const v = b.voxels[index];
    yield orientedBox(
      b,
      { x: v.x + 0.01, y: v.y + 0.01, z: v.z + 0.01 },
      { x: v.x + 0.99, y: v.y + 0.99, z: v.z + 0.99 },
      position,
      index,
    );
  }
}
/** Copy the immutable local compound, not world-space axes, into a pose snapshot. */
export function shareCollisionGeometry(source: RubbleBody, target: RubbleBody) {
  const cached = compounds.get(source);
  if (cached?.version === target.geometryVersion) compounds.set(target, cached);
}
