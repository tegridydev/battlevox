import { CS, D, H, NX, W } from '../core/config';
import type { World } from '../world/world';
import { buildCollisionTree, type CollisionNode, type LocalBox } from './collision-geometry';
import { type Bounds, intersects } from './section-tree';

interface Entry {
  revision: number;
  root?: CollisionNode;
  job: Generator<void, CollisionNode | undefined, unknown>;
  complete: boolean;
}
const caches = new WeakMap<World, Map<number, Entry>>();
/** Exact same-material cuboids. The cache is local, bounded and invalidated by terrain edits;
 * empty windows and blast holes are never replaced with a conservative solid hull. */
function* prepare(world: World, id: number): Generator<void, CollisionNode | undefined, unknown> {
  const ox = (id % NX) * CS,
    oz = Math.floor(id / NX) * CS;
  let top = 0,
    work = 0;
  for (let z = 0; z < CS; z++)
    for (let x = 0; x < CS; x++) top = Math.max(top, world.columnTop[(oz + z) * W + ox + x]);
  top = Math.min(H, Math.max(1, top));
  const mask = new Uint8Array(CS * CS * top),
    index = (x: number, y: number, z: number) => (y * CS + z) * CS + x;
  for (let y = 0; y < top; y++)
    for (let z = 0; z < CS; z++)
      for (let x = 0; x < CS; x++) {
        mask[index(x, y, z)] = world.cell(ox + x, y, oz + z);
        if (++work % 256 === 0) yield;
      }
  const boxes: LocalBox[] = [];
  for (let y = 0; y < top; y++)
    for (let z = 0; z < CS; z++)
      for (let x = 0; x < CS; x++) {
        if (++work % 128 === 0) yield;
        const m = mask[index(x, y, z)];
        if (!m) continue;
        let width = 1,
          depth = 1,
          height = 1;
        while (x + width < CS && mask[index(x + width, y, z)] === m) width++;
        rows: while (z + depth < CS) {
          for (let i = 0; i < width; i++) if (mask[index(x + i, y, z + depth)] !== m) break rows;
          depth++;
        }
        layers: while (y + height < top) {
          for (let k = 0; k < depth; k++)
            for (let i = 0; i < width; i++)
              if (mask[index(x + i, y + height, z + k)] !== m) break layers;
          height++;
        }
        for (let h = 0; h < height; h++)
          for (let k = 0; k < depth; k++) {
            mask.fill(0, index(x, y + h, z + k), index(x, y + h, z + k) + width);
            if (++work % 128 === 0) yield;
          }
        boxes.push({
          min: { x: ox + x, y, z: oz + z },
          max: { x: ox + x + width, y: y + height, z: oz + z + depth },
          index: world.index(ox + x, y, oz + z),
        });
      }
  return boxes.length ? yield* buildCollisionTree(boxes) : undefined;
}
export function* terrainRoots(
  world: World,
  bounds: Bounds,
): Generator<CollisionNode | undefined, void, unknown> {
  let cache = caches.get(world);
  if (!cache) {
    cache = new Map();
    caches.set(world, cache);
  }
  for (
    let z = Math.max(0, Math.floor(bounds.min.z / CS));
    z <= Math.min(D / CS - 1, Math.floor(bounds.max.z / CS));
    z++
  )
    for (
      let x = Math.max(0, Math.floor(bounds.min.x / CS));
      x <= Math.min(NX - 1, Math.floor(bounds.max.x / CS));
      x++
    ) {
      const id = z * NX + x,
        revision = world.chunkRevisions[id];
      let entry = cache.get(id);
      if (!entry || entry.revision !== revision) {
        entry?.job.return(undefined);
        entry = { revision, job: prepare(world, id), complete: false };
        cache.set(id, entry);
      }
      while (!entry.complete) {
        const step = entry.job.next();
        if (step.done) {
          entry.root = step.value;
          entry.complete = true;
        } else yield;
      }
      if (world.chunkRevisions[id] !== revision) return;
      if (entry.root && intersects(entry.root, bounds)) yield entry.root;
      // Refresh LRU order, never evict the generator currently being advanced.
      cache.delete(id);
      cache.set(id, entry);
      while (cache.size > 128) {
        const oldest = cache.keys().next().value!;
        cache.get(oldest)?.job.return(undefined);
        cache.delete(oldest);
      }
    }
}
export function clearTerrainColliders(world: World) {
  for (const entry of caches.get(world)?.values() ?? []) entry.job.return(undefined);
  caches.delete(world);
}
