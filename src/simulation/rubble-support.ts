import { CS, D, NX, W } from '../core/config';
import type { RubbleBody, Vec3 } from '../core/types';
import { bodyContactQuery, bodyPoseKey } from './body-contact-query';
import type { Contact, ContactResult } from './contact';
import { rubbleBounds } from './rubble-shape';
import { nearbySections } from './section-index';
import { intersects } from './section-tree';
import type { Simulation } from './simulation';
import { terrainContacts } from './terrain-contact';
export interface SupportState {
  chunks?: { id: number; revision: number }[];
  stable: boolean;
  point: Vec3;
  hull: Vec3[];
  terrain: { key: number; material: number }[];
  bodies: {
    body: RubbleBody;
    version: number;
    x: number;
    y: number;
    z: number;
    yaw: number;
    pitch: number;
    roll: number;
  }[];
}
const cross = (o: Vec3, a: Vec3, b: Vec3) => (a.x - o.x) * (b.z - o.z) - (a.z - o.z) * (b.x - o.x);
export function supportFootprint(
  contacts: Contact[],
  centre: Vec3,
): { stable: boolean; point: Vec3; hull: Vec3[] } {
  const points = contacts
    .filter((c) => c.normal.y > 0.6)
    .flatMap((c) => [
      { x: c.minX, y: c.point.y, z: c.minZ },
      { x: c.maxX, y: c.point.y, z: c.minZ },
      { x: c.maxX, y: c.point.y, z: c.maxZ },
      { x: c.minX, y: c.point.y, z: c.maxZ },
    ])
    .sort((a, b) => a.x - b.x || a.z - b.z);
  if (!points.length) return { stable: false, point: centre, hull: [] };
  const half = (list: Vec3[]) => {
    const result: Vec3[] = [];
    for (const p of list) {
      while (
        result.length >= 2 &&
        cross(result[result.length - 2], result[result.length - 1], p) <= 0
      )
        result.pop();
      result.push(p);
    }
    return result;
  };
  const lower = half(points),
    upper = half([...points].reverse());
  lower.pop();
  upper.pop();
  const hull = lower.concat(upper);
  let stable = hull.length >= 3,
    closest = Infinity,
    point = points[0];
  for (let i = 0; i < hull.length; i++) {
    const a = hull[i],
      b = hull[(i + 1) % hull.length],
      dx = b.x - a.x,
      dz = b.z - a.z;
    stable &&= cross(a, b, centre) >= -0.03 * Math.hypot(dx, dz);
    const t = Math.max(
      0,
      Math.min(
        1,
        ((centre.x - a.x) * dx + (centre.z - a.z) * dz) / Math.max(1e-8, dx * dx + dz * dz),
      ),
    );
    const p = { x: a.x + dx * t, y: a.y + (b.y - a.y) * t, z: a.z + dz * t };
    const distance = (p.x - centre.x) ** 2 + (p.z - centre.z) ** 2;
    if (distance < closest) {
      point = p;
      closest = distance;
    }
  }
  if (stable) point = { x: centre.x, y: Math.max(...contacts.map((c) => c.point.y)), z: centre.z };
  return { stable, point, hull };
}
export function groundedPath(
  sim: Simulation,
  body: RubbleBody,
  visited = new Set<RubbleBody>(),
): boolean {
  // A graph walk visits each support once, including cyclic stacks. Branch-local copies
  // made a densely interlocked pile exponential even though its graph is small.
  const pending = [body];
  while (pending.length) {
    const current = pending.pop()!;
    if (visited.has(current) || !current.support?.stable) continue;
    visited.add(current);
    if (current.support.terrain.some((t) => sim.world.vox[t.key] === t.material)) return true;
    for (const link of current.support.bodies)
      if (!visited.has(link.body) && sim.rubble.includes(link.body)) pending.push(link.body);
  }
  return false;
}
export function supportUnchanged(sim: Simulation, b: RubbleBody) {
  const s = b.support;
  return (
    !!s?.stable &&
    s.terrain.every((t) => sim.world.vox[t.key] === t.material) &&
    (s.chunks?.every((c) => sim.world.chunkRevisions[c.id] === c.revision) ??
      b.sleepRevision === sim.world.revision) &&
    s.bodies.every(
      (n) =>
        n.body.sleeping &&
        sim.rubble.includes(n.body) &&
        n.version === n.body.geometryVersion &&
        n.x === n.body.x &&
        n.y === n.body.y &&
        n.z === n.body.z &&
        n.yaw === n.body.yaw &&
        n.pitch === n.body.pitch &&
        n.roll === n.body.roll,
    ) &&
    groundedPath(sim, b)
  );
}
const supportQueries = new WeakMap<
  RubbleBody,
  Map<RubbleBody, { key: string; job: Generator<void, Contact[], unknown>; result?: Contact[] }>
>();
export function probeSupport(sim: Simulation, b: RubbleBody): ContactResult {
  const cached = supportQueries.get(b);
  if (cached)
    for (const [body, query] of cached) {
      if (!sim.rubble.includes(body)) {
        query.job.return([]);
        cached.delete(body);
      }
    }
  if (b.support) b.support.bodies = b.support.bodies.filter((n) => sim.rubble.includes(n.body));
  const result = terrainContacts(sim, b, b.x, b.y - 0.07, b.z, b, true);
  if (result.kind === 'deferred') return result;
  // Body contacts must never be appended to the memoised terrain-only result.
  const contacts = result.kind === 'contact' ? [...result.contacts] : [];
  const original = rubbleBounds(b);
  const bounds = { min: { ...original.min, y: original.min.y - 0.07 }, max: { ...original.max } };
  for (const other of nearbySections(sim, bounds)) {
    if (other === b || !groundedPath(sim, other) || !intersects(bounds, rubbleBounds(other)))
      continue;
    let queries = supportQueries.get(b);
    if (!queries) {
      queries = new Map();
      supportQueries.set(b, queries);
    }
    const key = bodyPoseKey(b) + '|' + bodyPoseKey(other);
    let query = queries.get(other);
    if (!query || query.key !== key) {
      query = { key, job: bodyContactQuery(b, other, { x: 0, y: -0.07, z: 0 }, true) };
      queries.set(other, query);
    }
    const deadline = sim.destructionBudget?.deadline ?? Infinity;
    while (!query.result && performance.now() < deadline) {
      const next = query.job.next();
      if (next.done) query.result = next.value;
    }
    if (!query.result) {
      sim.destructionStats.deferredQueries++;
      return { kind: 'deferred' };
    }
    contacts.push(...query.result);
  }
  const centre = { x: b.x + b.centre.x, y: b.y + b.centre.y, z: b.z + b.centre.z };
  const terrainOnly = contacts.filter((c) => c.terrain !== undefined);
  const terrainFootprint = supportFootprint(terrainOnly, centre);
  const used = terrainFootprint.stable ? terrainOnly : contacts;
  const footprint = supportFootprint(used, {
    x: b.x + b.centre.x,
    y: b.y + b.centre.y,
    z: b.z + b.centre.z,
  });
  b.support = {
    ...footprint,
    chunks: [
      ...new Set(
        used
          .filter((c) => c.terrain !== undefined)
          .map((c) => {
            const x = c.terrain! % W,
              z = Math.floor(c.terrain! / W) % D;
            return Math.floor(z / CS) * NX + Math.floor(x / CS);
          }),
      ),
    ].map((id) => ({ id, revision: sim.world.chunkRevisions[id] })),
    terrain: used
      .filter((c) => c.terrain !== undefined)
      .map((c) => ({ key: c.terrain!, material: sim.world.vox[c.terrain!] })),
    bodies: [...new Set(contacts.flatMap((c) => (c.body ? [c.body] : [])))].map((body) => ({
      body,
      version: body.geometryVersion,
      x: body.x,
      y: body.y,
      z: body.z,
      yaw: body.yaw,
      pitch: body.pitch,
      roll: body.roll,
    })),
  };
  return contacts.length ? { kind: 'contact', contacts } : { kind: 'clear' };
}

export function clearSupportQueries(bodies: RubbleBody[]) {
  for (const b of bodies) {
    for (const query of supportQueries.get(b)?.values() ?? []) query.job.return([]);
    supportQueries.delete(b);
    b.support = undefined;
  }
}

/** Collection outside the query path also covers unchanged sleeping bodies. */
export function pruneSupportQueries(sim: Simulation) {
  const live = new Set(sim.rubble);
  for (const b of live) {
    const queries = supportQueries.get(b);
    if (queries)
      for (const [other, q] of queries)
        if (!live.has(other)) {
          q.job.return([]);
          queries.delete(other);
        }
    if (b.support) b.support.bodies = b.support.bodies.filter((n) => live.has(n.body));
  }
}
