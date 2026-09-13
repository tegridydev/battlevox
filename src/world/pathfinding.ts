import { ND, NW } from '../core/config';
import { dist2 } from '../core/math';
import type { Vec3 } from '../core/types';
import type { World } from './world';
export interface PathSearch {
  start: number;
  goal: number;
  revision: number;
  heap: { cell: number; score: number }[];
  parents: Map<number, number>;
  costs: Map<number, number>;
  closed: Set<number>;
}
export interface PathResult {
  point: Vec3;
  reachable: boolean;
  status: 'pending' | 'reachable' | 'unreachable';
  search?: PathSearch;
}
function push(search: PathSearch, cell: number, score: number) {
  const heap = search.heap;
  heap.push({ cell, score });
  let i = heap.length - 1;
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (heap[p].score <= score) break;
    [heap[p], heap[i]] = [heap[i], heap[p]];
    i = p;
  }
}
function pop(search: PathSearch) {
  const heap = search.heap,
    first = heap[0],
    last = heap.pop()!;
  if (heap.length) {
    heap[0] = last;
    let i = 0;
    while (true) {
      let n = i;
      const l = i * 2 + 1,
        r = l + 1;
      if (l < heap.length && heap[l].score < heap[n].score) n = l;
      if (r < heap.length && heap[r].score < heap[n].score) n = r;
      if (n === i) break;
      [heap[i], heap[n]] = [heap[n], heap[i]];
      i = n;
    }
  }
  return first.cell;
}
/** A bounded slice preserves its frontier; budget exhaustion is not an unreachable route. */
export function localPath(
  world: World,
  from: Vec3,
  to: Vec3,
  maxNodes = 2048,
  previous?: PathSearch,
): PathResult {
  const failed: PathResult = {
    point: { x: from.x, y: from.y, z: from.z },
    reachable: false,
    status: 'unreachable',
  };
  if (
    ![from, to].every(
      (p) =>
        [p.x, p.y, p.z].every(Number.isFinite) &&
        p.x >= 0 &&
        p.z >= 0 &&
        p.x < NW * 2 &&
        p.z < ND * 2,
    )
  )
    return failed;
  const cell = (p: Vec3) => Math.floor(p.z / 2) * NW + Math.floor(p.x / 2),
    start = cell(from),
    goal = cell(to);
  if (
    !world.navOpen[goal] ||
    Math.abs(world.navHeight[goal] - to.y) > 2 ||
    Math.abs(world.navHeight[start] - from.y) > 2
  )
    return failed;
  const heuristic = (i: number) =>
    Math.abs((i % NW) - (goal % NW)) + Math.abs(Math.floor(i / NW) - Math.floor(goal / NW));
  const search: PathSearch =
    previous?.start === start &&
    previous.goal === goal &&
    previous.revision === world.publishedNavRevision
      ? previous
      : {
          start,
          goal,
          revision: world.publishedNavRevision,
          heap: [],
          parents: new Map([[start, -1]]),
          costs: new Map([[start, 0]]),
          closed: new Set(),
        };
  if (!search.heap.length && !search.closed.size) push(search, start, heuristic(start));
  for (let work = 0; search.heap.length && work < maxNodes; work++) {
    const i = pop(search);
    if (search.closed.has(i)) continue;
    search.closed.add(i);
    if (i === goal) {
      let point = i;
      while (search.parents.get(point) !== start && search.parents.get(point) !== -1)
        point = search.parents.get(point)!;
      return {
        point: {
          x: (point % NW) * 2 + 1,
          y: world.navHeight[point],
          z: Math.floor(point / NW) * 2 + 1,
        },
        reachable: true,
        status: 'reachable',
      };
    }
    const x = i % NW,
      z = Math.floor(i / NW);
    for (const [dx, dz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const xx = x + dx,
        zz = z + dz,
        n = zz * NW + xx;
      if (
        xx < 0 ||
        zz < 0 ||
        xx >= NW ||
        zz >= ND ||
        search.closed.has(n) ||
        !world.navOpen[n] ||
        Math.abs(world.navHeight[n] - world.navHeight[i]) > 1.01
      )
        continue;
      const cost = search.costs.get(i)! + 1;
      if (cost >= (search.costs.get(n) ?? Infinity)) continue;
      search.costs.set(n, cost);
      search.parents.set(n, i);
      push(search, n, cost + heuristic(n));
    }
  }
  return search.heap.length
    ? { point: { x: from.x, y: from.y, z: from.z }, reachable: false, status: 'pending', search }
    : failed;
}
/** Validate a short path on the leader's current surface, including rooftops. */
export function connectedSurface(world: World, from: Vec3, to: Vec3) {
  const distance = Math.sqrt(dist2(from, to));
  for (let t = 0; t <= distance; t += 0.4) {
    const f = distance ? t / distance : 0,
      x = from.x + (to.x - from.x) * f,
      z = from.z + (to.z - from.z) * f,
      y = from.y + (to.y - from.y) * f;
    if (world.blocked(x, y, z, 0.34, 1.8) || !world.solid(x, y - 0.1, z)) return false;
  }
  return true;
}
