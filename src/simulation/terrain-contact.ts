import { CS, NX } from '../core/config';
import type { RubbleBody, Vec3 } from '../core/types';
import {
  axisBox,
  type Box,
  type CollisionNode,
  collisionRoot,
  orientedBox,
  prepareCollisionBoxes,
  sweepObb,
} from './collision-geometry';
import { type Contact, type ContactResult, clearContact } from './contact';
import { rubbleBounds } from './rubble-shape';
import { type Bounds, intersects, rotatedBounds } from './section-tree';
import type { Simulation } from './simulation';
import { clearTerrainColliders, terrainRoots } from './terrain-collider';

interface Query {
  terrain: string;
  checkedRevision: number;
  job: Generator<void, ContactResult, unknown>;
  result?: ContactResult;
}
const queryCache = new WeakMap<RubbleBody, { version: number; entries: Map<string, Query> }>();
/** Only terrain in the swept footprint can invalidate a query; distant combat is irrelevant. */
function terrainRevision(sim: Simulation, b: RubbleBody, origin: Vec3, end: Vec3) {
  const bounds = rubbleBounds(b, origin),
    values: number[] = [];
  for (
    let z = Math.max(0, Math.floor((bounds.min.z + Math.min(0, end.z - origin.z)) / CS));
    z <= Math.min(NX - 1, Math.floor((bounds.max.z + Math.max(0, end.z - origin.z)) / CS));
    z++
  )
    for (
      let x = Math.max(0, Math.floor((bounds.min.x + Math.min(0, end.x - origin.x)) / CS));
      x <= Math.min(NX - 1, Math.floor((bounds.max.x + Math.max(0, end.x - origin.x)) / CS));
      x++
    )
      values.push(sim.world.chunkRevisions[z * NX + x]);
  return values.join(',');
}
function* queryTerrain(
  sim: Simulation,
  b: RubbleBody,
  origin: Vec3,
  delta: Vec3,
  supportOnly: boolean,
): Generator<void, ContactResult, unknown> {
  yield* prepareCollisionBoxes(b);
  const root = collisionRoot(b),
    contacts: Contact[] = [],
    found = new Set<number>();
  if (!root) return clearContact;
  const swept = (bounds: Bounds): Bounds => ({
    min: {
      x: bounds.min.x + Math.min(0, delta.x),
      y: bounds.min.y + Math.min(0, delta.y),
      z: bounds.min.z + Math.min(0, delta.z),
    },
    max: {
      x: bounds.max.x + Math.max(0, delta.x),
      y: bounds.max.y + Math.max(0, delta.y),
      z: bounds.max.z + Math.max(0, delta.z),
    },
  });
  const whole = swept(rubbleBounds(b, origin));
  const nodeCache = new Map<CollisionNode, Bounds>(),
    boxCache = new Map<object, Box>();
  const bounds = (node: CollisionNode) => {
    let value = nodeCache.get(node);
    if (!value) {
      value = swept(rotatedBounds(b, node.min, node.max, origin));
      nodeCache.set(node, value);
    }
    return value;
  };
  let work = 0;
  for (const terrain of terrainRoots(sim.world, whole)) {
    if (!terrain) {
      yield;
      continue;
    }
    const stack: [CollisionNode, CollisionNode][] = [[root, terrain]];
    while (stack.length) {
      const [a, c] = stack.pop()!;
      if (++work % 24 === 0) yield;
      if (!intersects(bounds(a), c)) continue;
      if (a.boxes && c.boxes) {
        for (const local of a.boxes) {
          let shape = boxCache.get(local);
          if (!shape) {
            shape = orientedBox(b, local.min, local.max, origin, local.index);
            boxCache.set(local, shape);
          }
          const moving = swept(shape.bounds);
          for (const solid of c.boxes) {
            if (++work % 16 === 0) yield;
            if (!intersects(moving, solid)) continue;
            const contact = sweepObb(shape, axisBox(solid), delta);
            if (!contact || (supportOnly && contact.normal.y <= 0.6)) continue;
            // A representative occupied witness plus a whole-chunk revision protects support
            // reuse, while the exact contact rectangle retains the full support footprint.
            const px = Math.max(solid.min.x, Math.min(solid.max.x - 0.001, contact.point.x)),
              pz = Math.max(solid.min.z, Math.min(solid.max.z - 0.001, contact.point.z)),
              py =
                contact.normal.y > 0.6
                  ? solid.max.y - 0.001
                  : Math.max(solid.min.y, Math.min(solid.max.y - 0.001, contact.point.y));
            const key = sim.world.index(Math.floor(px), Math.floor(py), Math.floor(pz));
            if (supportOnly && found.has(key)) continue;
            found.add(key);
            contact.terrain = key;
            contacts.push(contact);
          }
        }
      } else if (
        a.left &&
        (!c.left ||
          a.max.x - a.min.x + a.max.y - a.min.y + a.max.z - a.min.z >=
            c.max.x - c.min.x + c.max.y - c.min.y + c.max.z - c.min.z)
      )
        stack.push([a.left, c], [a.right!, c]);
      else if (c.left) stack.push([a, c.left], [a, c.right!]);
    }
  }
  return contacts.length ? { kind: 'contact', contacts } : clearContact;
}

export function terrainContacts(
  sim: Simulation,
  b: RubbleBody,
  x: number,
  y: number,
  z: number,
  from?: Vec3,
  supportOnly = false,
): ContactResult {
  const end = { x, y, z },
    origin = from ? { x: from.x, y: from.y, z: from.z } : end,
    delta = { x: x - origin.x, y: y - origin.y, z: z - origin.z };
  let cache = queryCache.get(b);
  if (!cache || cache.version !== b.geometryVersion) {
    cache = { version: b.geometryVersion, entries: new Map() };
    queryCache.set(b, cache);
  }
  const q = b.orientation,
    key = [x, y, z, origin.x, origin.y, origin.z, q.x, q.y, q.z, q.w, +supportOnly].join(','),
    terrain = terrainRevision(sim, b, origin, end);
  let query = cache.entries.get(key);
  // Revalidate contact witnesses after raw terrain edits as well as chunk revisions.
  // This also protects sleeping-body support when a caller removes foundation cells.
  const removedContact =
    query &&
    query.checkedRevision !== sim.world.revision &&
    query.result?.kind === 'contact' &&
    query.result.contacts.some((c) => c.terrain !== undefined && !sim.world.vox[c.terrain]);
  if (removedContact) clearTerrainColliders(sim.world);
  if (!query || query.terrain !== terrain || removedContact) {
    query = {
      terrain,
      checkedRevision: sim.world.revision,
      job: queryTerrain(sim, b, origin, delta, supportOnly),
    };
    if (cache.entries.size >= 24) cache.entries.delete(cache.entries.keys().next().value!);
    cache.entries.set(key, query);
  }
  query.checkedRevision = sim.world.revision;
  if (query.result) return query.result;
  const deadline = sim.destructionBudget?.deadline ?? Infinity;
  while (performance.now() < deadline) {
    const next = query.job.next();
    if (next.done) {
      query.result = next.value;
      return next.value;
    }
  }
  sim.destructionStats.deferredQueries++;
  return { kind: 'deferred' };
}
