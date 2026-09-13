import { CS, D, H, NX, W } from '../core/config';
import { dist2 } from '../core/math';
import type { Actor, RubbleBody, Vec3 } from '../core/types';
import { segmentBox, visitCollisionBoxes } from './collision-geometry';
import { npcState } from './npc-state';
import { rubbleBounds } from './rubble-shape';
import { nearbySections } from './section-index';
import { sectionBlocked } from './section-query';
import type { Simulation } from './simulation';

export interface NavPoint extends Vec3 {
  lift?: { building: number; level: number };
}
interface Node extends Vec3 {
  id: number;
  landing?: { building: number; level: number };
}
interface Stamp {
  terrain: number;
  obstacles: number;
}
export interface LayerSearch {
  start: number;
  goal: number;
  target: Vec3;
  heap: { id: number; score: number }[];
  nodes: Map<number, Node>;
  costs: Map<number, number>;
  parents: Map<number, number>;
  closed: Set<number>;
  regions: Map<number, Stamp>;
  best: number;
}
export interface LayerResult {
  status: 'pending' | 'reachable' | 'unreachable' | 'partial';
  point: Vec3;
  path: NavPoint[];
  expanded: number;
  search?: LayerSearch;
  regions?: Map<number, Stamp>;
}
interface Column {
  terrain: number;
  obstacles: number;
  heights: number[];
}
interface Route {
  target: Vec3;
  path: NavPoint[];
  index: number;
  regions: Map<number, Stamp>;
  until: number;
}
interface NavigationState {
  columns: Map<number, Column>;
  dynamic: Map<number, number>;
  bodies: Map<RubbleBody, { signature: string; chunks: number[] }>;
  routes: WeakMap<Actor, Route>;
  searches: Map<Actor, number>;
}
const states = new WeakMap<Simulation, NavigationState>();
const chunkId = (x: number, z: number) => Math.floor(z / CS) * NX + Math.floor(x / CS);
const nodeId = (x: number, y: number, z: number) => Math.round(y * 20) * W * D + z * W + x + 1;
function stateFor(sim: Simulation) {
  let state = states.get(sim);
  if (!state) {
    state = {
      columns: new Map(),
      dynamic: new Map(),
      bodies: new Map(),
      routes: new WeakMap(),
      searches: new Map(),
    };
    states.set(sim, state);
  }
  return state;
}
export function resetNavigation(sim: Simulation) {
  states.delete(sim);
}

/** Only touched regions invalidate a route. Distant explosions do not discard its frontier. */
export function refreshNavigation(sim: Simulation) {
  const state = stateFor(sim),
    live = new Set(sim.rubble);
  for (const [actor, until] of state.searches)
    if (
      !actor.alive ||
      actor.vehicle ||
      sim.actors[actor.id] !== actor ||
      until < sim.simTime ||
      !npcState(actor).routeSearch
    ) {
      state.searches.delete(actor);
      npcState(actor).routeSearch = undefined;
    }
  const dirty = (ids: number[]) => {
    for (const id of ids) state.dynamic.set(id, (state.dynamic.get(id) ?? 0) + 1);
  };
  for (const [body, old] of state.bodies)
    if (!live.has(body)) {
      dirty(old.chunks);
      state.bodies.delete(body);
    }
  for (const body of sim.rubble) {
    const signature = [
      body.geometryVersion,
      body.sleeping,
      Math.round(body.x * 4),
      Math.round(body.y * 4),
      Math.round(body.z * 4),
      Math.round(body.orientation.x * 32),
      Math.round(body.orientation.y * 32),
      Math.round(body.orientation.z * 32),
      Math.round(body.orientation.w * 32),
    ].join(':');
    const old = state.bodies.get(body);
    if (old?.signature === signature) continue;
    if (old) dirty(old.chunks);
    const b = rubbleBounds(body),
      chunks: number[] = [];
    for (
      let z = Math.max(0, Math.floor(b.min.z / CS));
      z <= Math.min(D / CS - 1, Math.floor(b.max.z / CS));
      z++
    )
      for (
        let x = Math.max(0, Math.floor(b.min.x / CS));
        x <= Math.min(NX - 1, Math.floor(b.max.x / CS));
        x++
      )
        chunks.push(z * NX + x);
    dirty(chunks);
    state.bodies.set(body, { signature, chunks });
  }
  return state;
}
function stamp(sim: Simulation, state: NavigationState, id: number): Stamp {
  return { terrain: sim.world.chunkRevisions[id], obstacles: state.dynamic.get(id) ?? 0 };
}
function validRegions(sim: Simulation, state: NavigationState, regions: Map<number, Stamp>) {
  for (const [id, value] of regions)
    if (
      value.terrain !== sim.world.chunkRevisions[id] ||
      value.obstacles !== (state.dynamic.get(id) ?? 0)
    )
      return false;
  return true;
}
function free(sim: Simulation, p: Vec3) {
  return !sim.world.blocked(p.x, p.y, p.z, 0.34, 1.8) && !sectionBlocked(sim, p, 0.34, 1.8);
}
function foot(sim: Simulation, p: Vec3) {
  return (
    sim.world.solid(p.x, p.y - 0.07, p.z) ||
    sectionBlocked(sim, { x: p.x, y: p.y - 0.08, z: p.z }, 0.18, 0.06)
  );
}
export function walkSegment(sim: Simulation, from: Vec3, to: Vec3) {
  if (Math.abs(from.y - to.y) > 1.05) return false;
  const length = Math.hypot(to.x - from.x, to.z - from.z),
    steps = Math.max(1, Math.ceil(length / 0.4));
  if (length > 64) return false;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps,
      p = {
        x: from.x + (to.x - from.x) * t,
        y: Math.max(from.y, to.y),
        z: from.z + (to.z - from.z) * t,
      };
    if (!free(sim, p) || (!foot(sim, p) && !foot(sim, { ...p, y: Math.min(from.y, to.y) })))
      return false;
  }
  return true;
}
function surfaces(
  sim: Simulation,
  state: NavigationState,
  x: number,
  z: number,
  regions: Map<number, Stamp>,
): Node[] {
  if (x < 1 || z < 1 || x >= W - 1 || z >= D - 1) return [];
  const id = chunkId(x, z),
    version = stamp(sim, state, id),
    key = z * W + x;
  regions.set(id, version);
  let column = state.columns.get(key);
  if (!column || column.terrain !== version.terrain || column.obstacles !== version.obstacles) {
    const heights: number[] = [],
      px = x + 0.5,
      pz = z + 0.5;
    for (let y = 1; y < H - 2; y++) {
      if (sim.world.cell(x, y - 1, z) && !sim.world.cell(x, y, z) && !sim.world.cell(x, y + 1, z))
        heights.push(y);
    }
    // A stable rubble top is a real navigation surface, not only an obstacle in the street grid.
    const query = {
      min: { x: px - 0.34, y: 0, z: pz - 0.34 },
      max: { x: px + 0.34, y: H, z: pz + 0.34 },
    };
    for (const body of nearbySections(sim, query)) {
      if (!body.sleeping) continue;
      visitCollisionBoxes(
        body,
        (b) => b.min.x <= px && b.max.x >= px && b.min.z <= pz && b.max.z >= pz,
        (box) => {
          const hit = segmentBox({ x: px, y: H, z: pz }, { x: 0, y: -1, z: 0 }, H, box);
          if (hit && hit.normal.y > 0.75) heights.push(H - hit.t + 0.025);
        },
      );
    }
    const unique = [...new Set(heights.map((y) => Math.round(y * 20) / 20))];
    column = {
      ...version,
      heights: unique.filter((y) => free(sim, { x: px, y, z: pz })).sort((a, b) => a - b),
    };
    state.columns.set(key, column);
    // Bounded FIFO cache. It retains geometry metadata, never actor references.
    while (state.columns.size > 8192) state.columns.delete(state.columns.keys().next().value!);
  }
  return column.heights.map((y) => ({ id: nodeId(x, y, z), x: x + 0.5, y, z: z + 0.5 }));
}
function endpoint(
  sim: Simulation,
  state: NavigationState,
  p: Vec3,
  regions: Map<number, Stamp>,
): Node | null {
  let best: Node | null = null,
    score = Infinity;
  const x = Math.floor(p.x),
    z = Math.floor(p.z);
  for (let dz = -2; dz <= 2; dz++)
    for (let dx = -2; dx <= 2; dx++) {
      for (const node of surfaces(sim, state, x + dx, z + dz, regions)) {
        const height = Math.abs(node.y - p.y);
        if (height > 1.15) continue;
        const d = dist2(node, p) + height * height * 2;
        if (d < score) {
          score = d;
          best = node;
        }
      }
    }
  return best;
}
function landing(
  sim: Simulation,
  building: number,
  level: number,
  regions: Map<number, Stamp>,
  state: NavigationState,
): Node | null {
  const b = sim.world.buildings[building];
  if (!b || level < 0 || level > b.floors) return null;
  const p = { x: b.lift.x, y: 5 + level * 5, z: b.lift.z };
  if (p.y >= H - 2 || !sim.world.solid(p.x, p.y - 0.1, p.z) || !free(sim, p)) return null;
  const id = chunkId(p.x, p.z);
  regions.set(id, stamp(sim, state, id));
  return { ...p, id: -2 - building * 32 - level, landing: { building, level } };
}
function neighbours(
  sim: Simulation,
  state: NavigationState,
  node: Node,
  search: LayerSearch,
): Node[] {
  const result: Node[] = [],
    x = Math.floor(node.x),
    z = Math.floor(node.z);
  for (const [dx, dz] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    for (const next of surfaces(sim, state, x + dx, z + dz, search.regions))
      if (Math.abs(node.y - next.y) <= 1.05 && walkSegment(sim, node, next)) result.push(next);
  }
  if (node.landing) {
    const { building, level } = node.landing;
    for (const offset of [-1, 1]) {
      const next = landing(sim, building, level + offset, search.regions, state);
      if (next) result.push(next);
    }
  } else {
    const b = sim.world.buildingMap[z * W + x] - 1;
    if (b >= 0) {
      const level = Math.round((node.y - 5) / 5),
        next = landing(sim, b, level, search.regions, state);
      if (
        next &&
        Math.abs(next.y - node.y) < 0.2 &&
        dist2(next, node) <= 2.3 &&
        walkSegment(sim, node, next)
      )
        result.push(next);
    }
  }
  return result;
}
function heapPush(heap: LayerSearch['heap'], id: number, score: number) {
  let i = heap.length;
  heap.push({ id, score });
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (heap[p].score <= score) break;
    [heap[p], heap[i]] = [heap[i], heap[p]];
    i = p;
  }
}
function heapPop(heap: LayerSearch['heap']) {
  const first = heap[0],
    last = heap.pop()!;
  if (heap.length) {
    heap[0] = last;
    let i = 0;
    while (true) {
      const l = i * 2 + 1,
        r = l + 1;
      let n = i;
      if (l < heap.length && heap[l].score < heap[n].score) n = l;
      if (r < heap.length && heap[r].score < heap[n].score) n = r;
      if (n === i) break;
      [heap[n], heap[i]] = [heap[i], heap[n]];
      i = n;
    }
  }
  return first.id;
}
function reconstruct(search: LayerSearch, id: number): NavPoint[] {
  const reverse: NavPoint[] = [];
  for (let guard = 0; id !== search.start && guard < 8192; guard++) {
    const node = search.nodes.get(id),
      parentId = search.parents.get(id);
    if (!node || parentId === undefined) break;
    const parent = search.nodes.get(parentId);
    const p: NavPoint = { x: node.x, y: node.y, z: node.z };
    if (
      node.landing &&
      parent?.landing &&
      node.landing.building === parent.landing.building &&
      node.landing.level !== parent.landing.level
    )
      p.lift = node.landing;
    reverse.push(p);
    id = parentId;
  }
  return reverse.reverse();
}

/** One budgeted A* frontier spanning multiple floors, rubble surfaces and authored lift links. */
export function layerPath(
  sim: Simulation,
  from: Vec3,
  to: Vec3,
  maxNodes = 128,
  previous?: LayerSearch,
): LayerResult {
  const failed: LayerResult = { status: 'unreachable', point: { ...from }, path: [], expanded: 0 };
  if (
    ![from, to].every(
      (p) =>
        [p.x, p.y, p.z].every(Number.isFinite) &&
        p.x >= 1 &&
        p.x < W - 1 &&
        p.z >= 1 &&
        p.z < D - 1,
    )
  )
    return failed;
  const state = refreshNavigation(sim),
    regions = new Map<number, Stamp>();
  let search = previous;
  if (
    search &&
    (dist2(search.target, to) > 1 ||
      Math.abs(search.target.y - to.y) > 0.3 ||
      !validRegions(sim, state, search.regions))
  )
    search = undefined;
  if (!search) {
    const start = endpoint(sim, state, from, regions),
      goal = endpoint(sim, state, to, regions);
    if (!start || !goal) return failed;
    search = {
      start: start.id,
      goal: goal.id,
      target: { ...to },
      heap: [],
      nodes: new Map([
        [start.id, start],
        [goal.id, goal],
      ]),
      costs: new Map([[start.id, 0]]),
      parents: new Map(),
      closed: new Set(),
      regions,
      best: start.id,
    };
    heapPush(search.heap, start.id, 0);
  }
  const goal = search.nodes.get(search.goal)!;
  const heuristic = (p: Vec3) =>
    Math.hypot(p.x - goal.x, p.z - goal.z) + Math.abs(p.y - goal.y) * 0.25;
  let expanded = 0;
  while (search.heap.length && expanded < Math.max(0, maxNodes)) {
    const id = heapPop(search.heap);
    if (search.closed.has(id)) continue;
    const node = search.nodes.get(id)!;
    search.closed.add(id);
    expanded++;
    if (heuristic(node) < heuristic(search.nodes.get(search.best)!)) search.best = id;
    if (id === search.goal) {
      const path = reconstruct(search, id);
      return {
        status: 'reachable',
        point: path[0] ?? { ...to },
        path,
        expanded,
        regions: search.regions,
      };
    }
    if (search.closed.size >= 4096) {
      const path = reconstruct(search, search.best);
      return {
        status: path.length ? 'partial' : 'unreachable',
        point: path[0] ?? { ...from },
        path,
        expanded,
        regions: search.regions,
      };
    }
    for (const next of neighbours(sim, state, node, search)) {
      if (search.closed.has(next.id)) continue;
      const lift = node.landing && next.landing && node.landing.building === next.landing.building;
      const edge = lift
        ? 5 + Math.abs(node.y - next.y) * 0.4
        : Math.hypot(next.x - node.x, next.z - node.z) + Math.abs(next.y - node.y) * 0.4;
      const cost = search.costs.get(id)! + edge;
      if (cost >= (search.costs.get(next.id) ?? Infinity)) continue;
      search.nodes.set(next.id, next);
      search.costs.set(next.id, cost);
      search.parents.set(next.id, id);
      heapPush(search.heap, next.id, cost + heuristic(next));
    }
  }
  return search.heap.length
    ? { status: 'pending', point: { ...from }, path: [], expanded, search }
    : { ...failed, expanded };
}

export function liftDestination(sim: Simulation, actor: Actor, building: number, level: number) {
  const b = sim.world.buildings[building];
  if (
    !b ||
    !actor.alive ||
    actor.vehicle ||
    sim.simTime < (actor.liftReady ?? 0) ||
    dist2(actor, b.lift) >= 9
  )
    return null;
  const current = Math.round((actor.y - 5) / 5);
  if (Math.abs(actor.y - (5 + current * 5)) > 0.3 || current === level) return null;
  const p = landing(sim, building, level, new Map(), stateFor(sim));
  if (
    !p ||
    sim.occupied(actor, p.x, p.y, p.z, 0.34, 1.8) ||
    sim.actors.some(
      (a) =>
        a !== actor && a.alive && !a.vehicle && Math.abs(a.y - p.y) < 1.8 && dist2(a, p) < 0.64,
    )
  )
    return null;
  return p;
}
export function travelLift(sim: Simulation, actor: Actor, building: number, level: number) {
  const p = liftDestination(sim, actor, building, level);
  if (!p) return false;
  Object.assign(actor, {
    x: p.x,
    y: p.y,
    z: p.z,
    vx: 0,
    vy: 0,
    vz: 0,
    onGround: true,
    liftReady: sim.simTime + 1.2,
  });
  actor.poseEpoch = (actor.poseEpoch ?? 0) + 1;
  sim.navigationStats.liftTrips++;
  return true;
}

/** Movement consumes validated waypoints; a path is not a licence to walk through later debris. */
export function routeActor(sim: Simulation, actor: Actor, target: Vec3): LayerResult {
  const brain = npcState(actor),
    state = stateFor(sim),
    stationary: LayerResult = {
      status: 'pending',
      point: { x: actor.x, y: actor.y, z: actor.z },
      path: [],
      expanded: 0,
    };
  refreshNavigation(sim);
  let route = state.routes.get(actor);
  const sameTarget = (p: Vec3) => dist2(p, target) < 4 && Math.abs(p.y - target.y) < 0.5;
  if (
    route &&
    (!sameTarget(route.target) ||
      route.until <= sim.simTime ||
      !validRegions(sim, state, route.regions))
  ) {
    state.routes.delete(actor);
    route = undefined;
  }
  if (route) {
    while (
      route.index < route.path.length &&
      dist2(actor, route.path[route.index]) < 0.3 &&
      Math.abs(actor.y - route.path[route.index].y) < 0.4
    )
      route.index++;
    const next = route.path[route.index];
    if (next?.lift) {
      if (travelLift(sim, actor, next.lift.building, next.lift.level)) {
        route.index++;
        return stationary;
      }
      if (sim.simTime < (actor.liftReady ?? 0)) return stationary;
    } else if (next && walkSegment(sim, actor, next))
      return { ...stationary, status: 'reachable', point: next };
    state.routes.delete(actor);
    route = undefined;
  }
  if (
    Math.abs(actor.y - target.y) < 1 &&
    dist2(actor, target) < 64 &&
    walkSegment(sim, actor, target)
  ) {
    brain.routeSearch = undefined;
    state.searches.delete(actor);
    brain.routeUntil = 0;
    return { ...stationary, status: 'reachable', point: { ...target } };
  }
  if (brain.routeGoal && !sameTarget(brain.routeGoal)) brain.routeSearch = undefined;
  if (sim.navigationBudget <= 0) return stationary;
  // Bound aggregate frontier memory as well as work per tick. Slots are released
  // on completion, cancellation or timeout; distant waiting actors retain flow-field steering.
  if (!state.searches.has(actor) && state.searches.size >= 64) return stationary;
  if (!state.searches.has(actor)) state.searches.set(actor, sim.simTime + 12);
  const distance = Math.sqrt(dist2(actor, target));
  const goal =
    distance > 38
      ? {
          x: actor.x + ((target.x - actor.x) * 38) / distance,
          z: actor.z + ((target.z - actor.z) * 38) / distance,
          y: 0,
        }
      : { ...target };
  if (distance > 38) goal.y = sim.world.groundAt(goal.x, goal.z);
  const result = layerPath(
    sim,
    actor,
    goal,
    Math.min(128, sim.navigationBudget),
    brain.routeSearch,
  );
  if (!result.search) state.searches.delete(actor);
  sim.navigationBudget -= result.expanded;
  sim.navigationStats.expanded += result.expanded;
  brain.routeGoal = { ...target };
  brain.routeSearch = result.search;
  brain.routeUntil = sim.simTime + 4;
  if (result.status === 'reachable' || result.status === 'partial') {
    sim.navigationStats.completed++;
    state.routes.set(actor, {
      target: { ...target },
      path: result.path,
      index: 0,
      regions: result.regions ?? new Map(),
      until: sim.simTime + 6,
    });
    // Do not turn a vertical link into horizontal movement before validating its landing.
    if (result.path[0]?.lift) return stationary;
  } else if (result.status === 'unreachable') {
    sim.navigationStats.blocked++;
    brain.routeUntil = 0;
  }
  return result;
}

export function navigationFrontiers(sim: Simulation) {
  return stateFor(sim).searches.size;
}
