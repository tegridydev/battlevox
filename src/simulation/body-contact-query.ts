import type { RubbleBody, Vec3 } from '../core/types';
import {
  type Box,
  type CollisionNode,
  collisionRoot,
  type LocalBox,
  orientedBox,
  prepareCollisionBoxes,
  sweepObb,
} from './collision-geometry';
import type { Contact } from './contact';
import { type Bounds, intersects, rotatedBounds } from './section-tree';

const swept = (b: Bounds, d: Vec3): Bounds => ({
  min: {
    x: b.min.x + Math.min(0, d.x),
    y: b.min.y + Math.min(0, d.y),
    z: b.min.z + Math.min(0, d.z),
  },
  max: {
    x: b.max.x + Math.max(0, d.x),
    y: b.max.y + Math.max(0, d.y),
    z: b.max.z + Math.max(0, d.z),
  },
});
/** Exact greedy compound geometry with dual BVH traversal. Unlike a voxel-pair hash grid,
 * intact floors are single boxes and disconnected pieces remain separate. Both traversal
 * and geometry preparation resume without losing work when a frame budget expires. */
export function* bodyContactQuery(
  body: RubbleBody,
  other: RubbleBody,
  delta: Vec3,
  supportOnly = false,
  limit = Infinity,
): Generator<void, Contact[], unknown> {
  yield* prepareCollisionBoxes(body);
  yield* prepareCollisionBoxes(other);
  const rootA = collisionRoot(body),
    rootB = collisionRoot(other),
    contacts: Contact[] = [];
  if (!rootA || !rootB) return contacts;
  const stack: [CollisionNode, CollisionNode][] = [[rootA, rootB]],
    aBounds = new Map<CollisionNode, Bounds>(),
    bBounds = new Map<CollisionNode, Bounds>();
  const boxesA = new Map<LocalBox, Box>(),
    boxesB = new Map<LocalBox, Box>();
  const bounds = (
    b: RubbleBody,
    n: CollisionNode,
    map: Map<CollisionNode, Bounds>,
    moving = false,
  ) => {
    let v = map.get(n);
    if (!v) {
      v = rotatedBounds(b, n.min, n.max);
      if (moving) v = swept(v, delta);
      map.set(n, v);
    }
    return v;
  };
  const box = (b: RubbleBody, local: LocalBox, map: Map<LocalBox, Box>) => {
    let result = map.get(local);
    if (!result) {
      result = orientedBox(b, local.min, local.max, b, local.index);
      map.set(local, result);
    }
    return result;
  };
  const extent = (n: CollisionNode) =>
    n.max.x - n.min.x + (n.max.y - n.min.y) + (n.max.z - n.min.z);
  let work = 0;
  while (stack.length) {
    const [a, b] = stack.pop()!;
    if (++work % 24 === 0) yield;
    if (!intersects(bounds(body, a, aBounds, true), bounds(other, b, bBounds))) continue;
    if (a.boxes && b.boxes) {
      for (const ai of a.boxes)
        for (const bi of b.boxes) {
          if (++work % 16 === 0) yield;
          const first = box(body, ai, boxesA),
            second = box(other, bi, boxesB);
          if (!intersects(swept(first.bounds, delta), second.bounds)) continue;
          const contact = sweepObb(first, second, delta);
          if (contact && (!supportOnly || contact.normal.y > 0.6)) {
            contact.body = other;
            contacts.push(contact);
            if (contacts.length >= limit) return contacts;
          }
        }
    } else if (a.left && (!b.left || extent(a) >= extent(b))) {
      stack.push([a.left, b], [a.right!, b]);
    } else if (b.left) stack.push([a, b.left], [a, b.right!]);
  }
  return contacts;
}
export function bodyPoseKey(b: RubbleBody) {
  return [
    b.geometryVersion,
    b.x,
    b.y,
    b.z,
    b.orientation.x,
    b.orientation.y,
    b.orientation.z,
    b.orientation.w,
  ].join(',');
}
