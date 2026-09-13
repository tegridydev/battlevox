import type { RubbleBody } from '../core/types';
import { rubbleBounds } from './rubble-shape';
import type { Bounds } from './section-tree';
import type { Simulation } from './simulation';

interface Entry {
  list: RubbleBody[];
  count: number;
  membershipDirty: boolean;
  grid: Map<number, Set<RubbleBody>>;
  cells: Map<RubbleBody, number[]>;
  dirty: Set<RubbleBody>;
}
const indices = new WeakMap<Simulation, Entry>();
// Szudzik pairing of signed grid coordinates; unlike bit packing it does not alias
// rubble that briefly travels outside the generated world bounds.
const coordinate = (v: number) => (v >= 0 ? v * 2 : -v * 2 - 1);
const key = (x: number, z: number) => {
  const a = coordinate(x),
    b = coordinate(z);
  return a >= b ? a * a + a + b : a + b * b;
};
function cells(bounds: Bounds) {
  const result: number[] = [];
  for (let z = Math.floor(bounds.min.z / 16); z <= Math.floor(bounds.max.z / 16); z++)
    for (let x = Math.floor(bounds.min.x / 16); x <= Math.floor(bounds.max.x / 16); x++)
      result.push(key(x, z));
  return result;
}
function remove(entry: Entry, body: RubbleBody) {
  for (const k of entry.cells.get(body) ?? []) {
    const bucket = entry.grid.get(k);
    bucket?.delete(body);
    if (!bucket?.size) entry.grid.delete(k);
  }
  entry.cells.delete(body);
  entry.dirty.delete(body);
}
function update(entry: Entry, body: RubbleBody) {
  const next = cells(rubbleBounds(body)),
    old = entry.cells.get(body);
  if (old && old.length === next.length && old.every((n, i) => n === next[i])) return;
  remove(entry, body);
  for (const k of next) {
    let bucket = entry.grid.get(k);
    if (!bucket) {
      bucket = new Set();
      entry.grid.set(k, bucket);
    }
    bucket.add(body);
  }
  entry.cells.set(body, next);
}
export function invalidateSections(sim: Simulation, body?: RubbleBody) {
  const entry = indices.get(sim);
  if (!entry) return;
  if (body) entry.dirty.add(body);
  else {
    entry.membershipDirty = true;
    for (const b of sim.rubble) entry.dirty.add(b);
  }
}
export function resetSectionIndex(sim: Simulation) {
  indices.delete(sim);
}
/** Membership changes are reconciled once; movement only updates the body's touched cells. */
export function nearbySections(sim: Simulation, bounds: Bounds) {
  let entry = indices.get(sim);
  if (!entry || entry.list !== sim.rubble) {
    entry = {
      list: sim.rubble,
      count: -1,
      membershipDirty: true,
      grid: new Map(),
      cells: new Map(),
      dirty: new Set(),
    };
    indices.set(sim, entry);
  }
  if (entry.count !== sim.rubble.length || entry.membershipDirty) {
    const live = new Set(sim.rubble);
    for (const b of entry.cells.keys()) if (!live.has(b)) remove(entry, b);
    for (const b of live) if (!entry.cells.has(b)) entry.dirty.add(b);
    entry.count = sim.rubble.length;
    entry.membershipDirty = false;
  }
  for (const body of entry.dirty) update(entry, body);
  entry.dirty.clear();
  const result = new Set<RubbleBody>();
  for (const k of cells(bounds)) for (const b of entry.grid.get(k) ?? []) result.add(b);
  return result;
}
