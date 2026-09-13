import { destructionLimits as limits } from '../core/config';
import type { RubbleBody, RubbleVoxel, Vec3 } from '../core/types';
import { bondCost, bondKey, bondLevel, depositWork } from './bonds';
import { prepareCollisionBoxes } from './collision-geometry';
import { kineticEnergy, unrotate } from './rotation';
import { createRubble } from './rubble';
import { pointVelocity, turnSection } from './rubble-shape';
import { prepareSectionMesh } from './section-mesh';
import { prepareSectionTree, voxelPoint } from './section-tree';
import type { Simulation } from './simulation';

const directions = [
  [1, 0, 0],
  [-1, 0, 0],
  [0, 1, 0],
  [0, -1, 0],
  [0, 0, 1],
  [0, 0, -1],
] as const;
const key = (v: Vec3) => `${v.x},${v.y},${v.z}`;
interface Topology {
  version: number;
  lookup: Map<string, number>;
  bonds: Uint16Array;
}
const topology = new WeakMap<RubbleBody, Topology>();
const jobs = new WeakMap<
  Simulation,
  {
    body: RubbleBody;
    version: number;
    impact?: RubbleBody['impact'];
    job: Generator<void, void, unknown>;
  }
>();

const crushWork = new WeakMap<RubbleBody, number>();
export function queueImpact(body: RubbleBody, point: Vec3, speed: number, energy?: number) {
  if (
    ![point.x, point.y, point.z, speed].every(Number.isFinite) ||
    speed <= 0 ||
    (energy !== undefined && (!Number.isFinite(energy) || energy <= 0))
  )
    return;
  if ((body.age < 0.25 && body.travel < 0.05) || body.impactCooldown > 0 || body.voxels.length < 2)
    return;
  if (speed <= limits.impactSpeed) {
    // A large section can dissipate substantial energy through many slow, distributed contacts.
    // Retain that paid work instead of treating every contact as an unrelated harmless tap.
    if (!body.primary || body.voxels.length < 256 || !(energy && energy > 0) || body.travel < 0.05)
      return;
    const accumulated = (crushWork.get(body) ?? 0) + energy;
    if (accumulated < 1800) {
      crushWork.set(body, accumulated);
      return;
    }
    energy = Math.min(20000, accumulated);
    crushWork.delete(body);
  }
  if (!body.impact || (energy ?? speed * speed) > (body.impact.energy ?? body.impact.speed ** 2)) {
    const p = unrotate(body.orientation, {
      x: point.x - body.x - body.centre.x,
      y: point.y - body.y - body.centre.y,
      z: point.z - body.z - body.centre.z,
    });
    body.impact = {
      point: { ...point },
      localPoint: { x: p.x + body.centre.x, y: p.y + body.centre.y, z: p.z + body.centre.z },
      speed,
      energy,
    };
  }
  body.sleeping = false;
}

/** Finite energy opens a local crack around a connected contact patch, never a world-space tile grid. */
function* fracture(sim: Simulation, b: RubbleBody): Generator<void, void, unknown> {
  const version = b.geometryVersion;
  b.fractureSlots = 0;
  const impact = b.impact;
  b.impact = undefined;
  b.connectivityDirty = false;
  if (impact) b.impactCooldown = 0.3;
  let data = topology.get(b);
  if (!data || data.version !== version) {
    data = { version, lookup: new Map(), bonds: new Uint16Array(b.voxels.length) };
    for (let i = 0; i < b.voxels.length; i++) {
      data.lookup.set(key(b.voxels[i]), i);
      if (i % 128 === 0) yield;
    }
    topology.set(b, data);
  }
  const { lookup } = data;
  const bonds = data.bonds.slice();
  const workState = new Map(b.bondWork);
  const neighbor = (i: number, d: number) => {
    const v = b.voxels[i],
      offset = directions[d];
    return lookup.get(`${v.x + offset[0]},${v.y + offset[1]},${v.z + offset[2]}`);
  };
  const owner = (i: number, n: number, d: number) => (d % 2 === 0 ? i : n);
  for (let i = 0; i < b.voxels.length; i++) {
    for (const d of [0, 2, 4]) {
      const n = neighbor(i, d);
      if (n !== undefined)
        bonds[i] =
          (bonds[i] & ~(31 << ((d / 2) * 5))) |
          (bondLevel(workState, b.voxels[i], b.voxels[n]) << ((d / 2) * 5));
    }
    if (i % 128 === 0) yield;
  }
  if (impact) {
    let seed = 0,
      distance = Infinity;
    for (let i = 0; i < b.voxels.length; i++) {
      const v = b.voxels[i],
        p = impact.localPoint ? { x: v.x + 0.5, y: v.y + 0.5, z: v.z + 0.5 } : voxelPoint(b, i),
        point = impact.localPoint ?? impact.point;
      const d = (p.x - point.x) ** 2 + (p.y - point.y) ** 2 + (p.z - point.z) ** 2;
      if (d < distance) {
        distance = d;
        seed = i;
      }
      if (i % 128 === 0) yield;
    }
    // Contact energy scales sublinearly with island mass: a large body cannot pulverise itself from a grazing contact.
    let energy = Math.min(20000, impact.energy ?? 0.5 * Math.sqrt(b.mass) * impact.speed ** 2);
    const patch = new Set<number>([seed]),
      frontier = [seed];
    const target =
      b.voxels.length > 256 && energy > 4000
        ? Math.min(Math.floor(b.voxels.length * 0.2), Math.floor(energy / 12))
        : Math.min(32, Math.max(1, Math.floor(energy / 120)));
    for (let head = 0; head < frontier.length && patch.size < target; head++) {
      for (let d = 0; d < 6 && patch.size < target; d++) {
        const n = neighbor(frontier[head], d);
        if (n === undefined || patch.has(n)) continue;
        patch.add(n);
        frontier.push(n);
      }
      if (head % 128 === 0) yield;
    }
    // Fit a connected contact patch to the energy actually available. An oversized requested
    // patch previously exhausted all work partway around its perimeter and never detached.
    while (patch.size > 1) {
      let boundaryCost = 0;
      for (const i of patch) {
        for (let d = 0; d < 6; d++) {
          const n = neighbor(i, d);
          if (n === undefined || patch.has(n)) continue;
          const a = b.voxels[i],
            other = b.voxels[n];
          boundaryCost += Math.max(
            0,
            bondCost(a, other) - (workState.get(bondKey(a.id!, other.id!)) ?? 0),
          );
        }
        if (i % 128 === 0) yield;
      }
      if (boundaryCost <= energy) break;
      const size = Math.max(1, Math.floor(patch.size / 2));
      patch.clear();
      for (let i = 0; i < size; i++) patch.add(frontier[i]);
    }
    for (const i of patch) {
      for (let d = 0; d < 6; d++) {
        const n = neighbor(i, d);
        if (n === undefined || patch.has(n) || energy <= 0) continue;
        const index = owner(i, n, d),
          shift = Math.floor(d / 2) * 5;
        const spend = depositWork(workState, b.voxels[i], b.voxels[n], energy);
        bonds[index] =
          (bonds[index] & ~(31 << shift)) |
          (bondLevel(workState, b.voxels[i], b.voxels[n]) << shift);
        energy -= spend;
      }
    }
  }
  const seen = new Uint8Array(b.voxels.length),
    parts: RubbleVoxel[][] = [];
  let work = 0;
  for (let start = 0; start < b.voxels.length; start++) {
    if (seen[start]) continue;
    const queue = [start],
      part: RubbleVoxel[] = [];
    seen[start] = 1;
    for (let head = 0; head < queue.length; head++) {
      const i = queue[head];
      part.push(b.voxels[i]);
      for (let d = 0; d < 6; d++) {
        const n = neighbor(i, d);
        if (n === undefined || seen[n]) continue;
        if (((bonds[owner(i, n, d)] >> (Math.floor(d / 2) * 5)) & 31) === 31) continue;
        seen[n] = 1;
        queue.push(n);
      }
      if (++work % 128 === 0) yield;
    }
    parts.push(part);
  }
  if (version !== b.geometryVersion || !sim.rubble.includes(b)) return;
  if (parts.length <= 1) {
    data.bonds = bonds;
    b.bondWork = workState;
    return;
  }
  const ordered = [...parts].sort((a, b) => b.length - a.length);
  const continuation = ordered.length > 4;
  const publishedParts = continuation
    ? [ordered.slice(0, -3).flat(), ...ordered.slice(-3)]
    : ordered;
  // Retain fatigue when a body cap delays subdivision; never restore pristine bonds.
  if (
    sim.rubble.filter((n) => !n.primary).length + publishedParts.length - 1 >
    limits.rubbleBodies
  ) {
    data.bonds = bonds;
    b.bondWork = workState;
    b.connectivityDirty = true;
    b.fractureSlots = publishedParts.length - 1;
    return;
  }
  const children: RubbleBody[] = [];
  for (let partIndex = 0; partIndex < publishedParts.length; partIndex++) {
    const part = publishedParts[partIndex];
    const members = new Set<string>();
    for (const v of part) {
      members.add(key(v));
      if (++work % 128 === 0) yield;
    }
    const cut: RubbleVoxel[] = [];
    for (const v of part) {
      let fractureFaces = v.fractureFaces ?? 0;
      for (let d = 0; d < 6; d++) {
        const offset = directions[d],
          adjacent = `${v.x + offset[0]},${v.y + offset[1]},${v.z + offset[2]}`;
        if (lookup.has(adjacent) && !members.has(adjacent)) fractureFaces |= 1 << d;
      }
      cut.push({ ...v, fractureFaces, damage: b.damage?.get(v) ?? v.damage ?? 0 });
      if (++work % 128 === 0) yield;
    }
    const child = yield* createRubble(sim, cut, { x: b.vx, y: b.vy, z: b.vz }, true);
    if (!child) return;
    child.materialOrigin = {
      x: b.materialOrigin.x + child.x,
      y: b.materialOrigin.y + child.y,
      z: b.materialOrigin.z + child.z,
    };
    child.primary = b.primary && partIndex === 0;
    const ids = new Set(part.map((v) => v.id!));
    for (const [key, value] of workState) {
      const [a, b] = key.split(':').map(Number);
      if (ids.has(a) && ids.has(b)) child.bondWork.set(key, value);
    }
    const offset = turnSection(b, {
      x: child.x + child.centre.x - b.centre.x,
      y: child.y + child.centre.y - b.centre.y,
      z: child.z + child.centre.z - b.centre.z,
    });
    child.x = b.x + b.centre.x + offset.x - child.centre.x;
    child.y = b.y + b.centre.y + offset.y - child.centre.y;
    child.z = b.z + b.centre.z + offset.z - child.centre.z;
    child.orientation = { ...b.orientation };
    child.omega = { ...b.omega };
    const velocity = pointVelocity(b, offset);
    child.vx = velocity.x;
    child.vy = velocity.y;
    child.vz = velocity.z;
    child.impactCooldown = 0.3;
    child.hitActors = new Set(b.hitActors);
    child.hitVehicles = new Set(b.hitVehicles);
    yield* prepareSectionTree(child);
    yield* prepareCollisionBoxes(child);
    yield* prepareSectionMesh(child, sim.world.colours);
    if (continuation && partIndex === 0) child.connectivityDirty = true;
    children.push(child);
  }
  if (version !== b.geometryVersion || !sim.rubble.includes(b)) return;
  if (
    sim.rubble.filter((n) => !n.primary).length +
      children.filter((n) => !n.primary).length -
      (b.primary ? 0 : 1) >
    limits.rubbleBodies
  ) {
    data.bonds = bonds;
    b.bondWork = workState;
    b.connectivityDirty = true;
    b.fractureSlots = children.length - 1;
    return;
  }
  // Preparation can span frames. Rebase children to the parent's latest transform before publication.
  for (let i = 0; i < children.length; i++) {
    const child = children[i],
      part = publishedParts[i];
    const origin = part.reduce(
      (p, v) => ({ x: Math.min(p.x, v.x), y: Math.min(p.y, v.y), z: Math.min(p.z, v.z) }),
      { x: Infinity, y: Infinity, z: Infinity },
    );
    const offset = turnSection(b, {
      x: origin.x + child.centre.x - b.centre.x,
      y: origin.y + child.centre.y - b.centre.y,
      z: origin.z + child.centre.z - b.centre.z,
    });
    child.x = b.x + b.centre.x + offset.x - child.centre.x;
    child.y = b.y + b.centre.y + offset.y - child.centre.y;
    child.z = b.z + b.centre.z + offset.z - child.centre.z;
    child.orientation = { ...b.orientation };
    child.omega = { ...b.omega };
    const velocity = pointVelocity(b, offset);
    child.vx = velocity.x;
    child.vy = velocity.y;
    child.vz = velocity.z;
  }
  const energy = kinetic(b),
    after = children.reduce((sum, c) => sum + kinetic(c), 0);
  const scale = after > 0 ? Math.min(1, Math.sqrt(energy / after)) : 1;
  for (const child of children) {
    child.vx *= scale;
    child.vy *= scale;
    child.vz *= scale;
    child.omega.x *= scale;
    child.omega.y *= scale;
    child.omega.z *= scale;
  }
  // Nonlethal hits may arrive during preparation without changing geometry.
  const integrity = new Map(b.voxels.map((v) => [v.id, b.damage?.get(v) ?? v.damage ?? 0]));
  for (const child of children) {
    child.pendingDt = b.pendingDt;
    child.damage = new Map();
    for (const v of child.voxels) {
      v.damage = integrity.get(v.id) ?? 0;
      if (v.damage) child.damage.set(v, v.damage);
    }
  }
  // A second hit can arrive while this publication is prepared. Hand it to the
  // child containing its closest surviving voxel instead of discarding the event.
  const pending = (b as RubbleBody).impact;
  if (pending) {
    const local = pending.localPoint;
    let best = 0,
      distance = Infinity;
    for (let i = 0; i < publishedParts.length; i++)
      for (const v of publishedParts[i]) {
        const p = local
          ? { x: v.x + 0.5, y: v.y + 0.5, z: v.z + 0.5 }
          : voxelPoint(b, b.voxels.indexOf(v));
        const q = local ?? pending.point,
          d = (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2;
        if (d < distance) {
          distance = d;
          best = i;
        }
      }
    const part = publishedParts[best],
      origin = part.reduce(
        (o, v) => ({ x: Math.min(o.x, v.x), y: Math.min(o.y, v.y), z: Math.min(o.z, v.z) }),
        { x: Infinity, y: Infinity, z: Infinity },
      );
    children[best].impact = {
      ...pending,
      localPoint: local
        ? { x: local.x - origin.x, y: local.y - origin.y, z: local.z - origin.z }
        : undefined,
    };
  }
  sim.rubble.splice(sim.rubble.indexOf(b), 1, ...children);
  sim.addDust(impact?.point ?? b, 2, 0.6);
}
const kinetic = kineticEnergy;
export function processFractures(sim: Simulation) {
  const budget = sim.destructionBudget;
  const deadline = Math.min(performance.now() + 1, budget?.deadline ?? Infinity);
  let completed = 0;
  while (completed < 2 && (!budget || budget.fractureEvents > 0) && performance.now() < deadline) {
    let active = jobs.get(sim);
    // A rocket or settlement can swap/remove voxels while this generator is suspended.
    // Reject the old frontier before next(), not after it has dereferenced stale indices.
    if (
      active &&
      (!sim.rubble.includes(active.body) || active.version !== active.body.geometryVersion)
    ) {
      if (sim.rubble.includes(active.body)) active.body.connectivityDirty = true;
      active.job.return();
      if (sim.rubble.includes(active.body) && active.impact && !active.body.impact)
        active.body.impact = active.impact;
      jobs.delete(sim);
      active = undefined;
    }
    if (!active) {
      const freeSlots = limits.rubbleBodies - sim.rubble.filter((b) => !b.primary).length;
      const body = sim.rubble.find(
        (b) => (b.connectivityDirty || b.impact) && (b.fractureSlots ?? 0) <= freeSlots,
      );
      if (!body) return;
      active = {
        body,
        version: body.geometryVersion,
        impact: body.impact,
        job: fracture(sim, body),
      };
      jobs.set(sim, active);
    }
    if (active.job.next().done) {
      jobs.delete(sim);
      completed++;
      if (budget) budget.fractureEvents--;
    }
  }
}

/** A simulation restart owns cancellation of deferred publication. */
export function cancelFractures(sim: Simulation) {
  jobs.get(sim)?.job.return();
  jobs.delete(sim);
}
