import { CS, D, H, destructionLimits as limits, NX, W } from '../core/config';
import { grainAt, physicsMaterial } from '../core/material-physics';
import { clamp } from '../core/math';
import type { RubbleBody, RubbleVoxel, Vec3 } from '../core/types';
import { bodyPoseKey } from './body-contact-query';
import { shareCollisionGeometry } from './collision-geometry';
import type { Contact, ContactResult } from './contact';
import { newDestructionBudget } from './destruction-budget';
import { identity, integrateRotation, withRotation } from './rotation';
import { contactPassPending, resolveRubbleContacts } from './rubble-contacts';
import { rubbleBounds, rubbleShape } from './rubble-shape';
import { processFractures, queueImpact } from './section-fracture';
import { type ImpactPose, impactBounds, sectionImpact } from './section-impact';
import { invalidateSections } from './section-index';
import { shareSectionTree } from './section-tree';
import { terrainContacts } from './terrain-contact';

export { terrainContacts } from './terrain-contact';

import { contactResponse, energyImpulse, resolveContact } from './contact';
import { turnSection } from './rubble-shape';
import {
  groundedPath,
  probeSupport,
  pruneSupportQueries,
  supportFootprint,
  supportUnchanged,
} from './rubble-support';
import type { Simulation } from './simulation';
import { processStaticImpacts, queueStaticImpact } from './static-impact';

export const voxelMass = (material: number) => physicsMaterial(material).density;

/** Recenter after settling without teleporting the remaining rotated geometry. */
export function rebuildMassProperties(b: RubbleBody) {
  if (!b.voxels.length) {
    b.mass = 0;
    return;
  }
  const old = { ...b.centre },
    centre = { x: 0, y: 0, z: 0 },
    inertia = { x: 0, y: 0, z: 0 },
    cross: [number, number, number] = [0, 0, 0];
  let mass = 0;
  for (const v of b.voxels) {
    const m = voxelMass(v.material);
    mass += m;
    centre.x += (v.x + 0.5) * m;
    centre.y += (v.y + 0.5) * m;
    centre.z += (v.z + 0.5) * m;
  }
  centre.x /= mass;
  centre.y /= mass;
  centre.z /= mass;
  const delta = { x: centre.x - old.x, y: centre.y - old.y, z: centre.z - old.z },
    rotated = turnSection(b, delta);
  // x + c + R(v-c) must stay invariant when c changes.
  b.x += rotated.x - delta.x;
  b.y += rotated.y - delta.y;
  b.z += rotated.z - delta.z;
  b.vx += b.omega.y * rotated.z - b.omega.z * rotated.y;
  b.vy += b.omega.z * rotated.x - b.omega.x * rotated.z;
  b.vz += b.omega.x * rotated.y - b.omega.y * rotated.x;
  for (const v of b.voxels) {
    const m = voxelMass(v.material),
      x = v.x + 0.5 - centre.x,
      y = v.y + 0.5 - centre.y,
      z = v.z + 0.5 - centre.z;
    inertia.x += m * (y * y + z * z + 1 / 6);
    inertia.y += m * (x * x + z * z + 1 / 6);
    inertia.z += m * (x * x + y * y + 1 / 6);
    cross[0] -= m * x * y;
    cross[1] -= m * x * z;
    cross[2] -= m * y * z;
  }
  b.mass = mass;
  b.centre = centre;
  b.inertia = inertia;
  b.inertiaCross = cross;
  b.width = b.height = b.depth = 0;
  for (const v of b.voxels) {
    b.width = Math.max(b.width, v.x + 1);
    b.height = Math.max(b.height, v.y + 1);
    b.depth = Math.max(b.depth, v.z + 1);
  }
  b.shape = [];
  b.shapeYaw = b.shapePitch = b.shapeRoll = NaN;
}

export function* createRubble(
  sim: Simulation,
  voxels: RubbleVoxel[],
  velocity: Vec3 = { x: 0, y: 0, z: 0 },
  primary = false,
): Generator<void, RubbleBody | null, unknown> {
  if (!voxels.length || ![velocity.x, velocity.y, velocity.z].every(Number.isFinite)) return null;
  if (!primary && sim.rubble.filter((b) => !b.primary).length >= limits.rubbleBodies) return null;
  let x = Infinity,
    y = Infinity,
    z = Infinity,
    maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity,
    work = 0;
  const unique = new Set<number | string>();
  for (const v of voxels) {
    if (
      ![v.x, v.y, v.z, v.material].every(Number.isInteger) ||
      v.material <= 1 ||
      !sim.world.colours[v.material]
    )
      return null;
    const key = sim.world.inside(v.x, v.y, v.z)
      ? sim.world.index(v.x, v.y, v.z)
      : `${v.x},${v.y},${v.z}`;
    if (unique.has(key)) return null;
    unique.add(key);
    x = Math.min(x, v.x);
    y = Math.min(y, v.y);
    z = Math.min(z, v.z);
    maxX = Math.max(maxX, v.x);
    maxY = Math.max(maxY, v.y);
    maxZ = Math.max(maxZ, v.z);
    if (++work % 128 === 0) yield;
  }
  const local: RubbleVoxel[] = [],
    centre = { x: 0, y: 0, z: 0 };
  let mass = 0;
  for (const v of voxels) {
    const p = {
        x: v.x - x,
        y: v.y - y,
        z: v.z - z,
        material: v.material,
        fractureFaces: v.fractureFaces,
        damage: v.damage ?? 0,
        id: v.id ?? sim.nextVoxelId++,
        grain: v.grain ?? grainAt(v.x, v.y, v.z, v.material, sim.settings.seed),
      },
      m = voxelMass(v.material);
    local.push(p);
    mass += m;
    centre.x += (p.x + 0.5) * m;
    centre.y += (p.y + 0.5) * m;
    centre.z += (p.z + 0.5) * m;
    if (++work % 128 === 0) yield;
  }
  centre.x /= mass;
  centre.y /= mass;
  centre.z /= mass;
  const inertia = { x: 0, y: 0, z: 0 };
  const inertiaCross: [number, number, number] = [0, 0, 0];
  for (const v of local) {
    const dx = v.x + 0.5 - centre.x,
      dy = v.y + 0.5 - centre.y,
      dz = v.z + 0.5 - centre.z,
      m = voxelMass(v.material);
    inertiaCross[0] -= m * dx * dy;
    inertiaCross[1] -= m * dx * dz;
    inertiaCross[2] -= m * dy * dz;
    inertia.x += m * (dy * dy + dz * dz + 1 / 6);
    inertia.y += m * (dx * dx + dz * dz + 1 / 6);
    inertia.z += m * (dx * dx + dy * dy + 1 / 6);
    if (++work % 128 === 0) yield;
  }
  return withRotation({
    materialOrigin: { x, y, z },
    orientation: identity(),
    omega: { x: 0, y: 0, z: 0 },
    inertiaCross,
    id: sim.nextRubbleId++,
    primary,
    bondWork: new Map(),
    centre,
    connectivityDirty: false,
    sleeping: false,
    sleepRevision: -1,
    pendingDt: 0,
    travel: 0,
    geometryVersion: 0,
    x,
    y,
    z,
    voxels: local,
    damage: new Map(local.filter((v) => (v.damage ?? 0) > 0).map((v) => [v, v.damage!])),
    width: maxX - x + 1,
    height: maxY - y + 1,
    depth: maxZ - z + 1,
    mass,
    inertia,
    vx: clamp(velocity.x, -16, 16),
    vy: clamp(velocity.y, -36, 18),
    vz: clamp(velocity.z, -16, 16),
    age: 0,
    yaw: 0,
    pitch: 0,
    roll: 0,
    spinRoll: 0,
    shapeRoll: NaN,
    spinYaw: 0,
    spinPitch: 0,
    restTime: 0,
    impactCooldown: 0,
    shapeYaw: NaN,
    shapePitch: NaN,
    shape: [],
    extent: { x: 0.49, y: 0.49, z: 0.49 },
    boundsMin: { x: 0, y: 0, z: 0 },
    boundsMax: { x: 0, y: 0, z: 0 },
    hitActors: new Set(),
    hitVehicles: new Set(),
  });
}
export function spawnRubble(
  this: Simulation,
  voxels: RubbleVoxel[],
  velocity: Vec3 = { x: 0, y: 0, z: 0 },
  primary = false,
) {
  const job = createRubble(this, voxels, velocity, primary);
  let result = job.next();
  while (!result.done) result = job.next();
  if (!result.value) return false;
  this.rubble.push(result.value);
  invalidateSections(this);
  return true;
}

export function addDust(this: Simulation, p: Vec3, radius: number, strength = 1) {
  if (this.dust.length >= limits.dustClouds) this.dust.shift();
  this.dust.push({
    x: p.x,
    y: p.y,
    z: p.z,
    radius,
    life: 2.8,
    max: 2.8,
    strength: clamp(strength, 0, 1),
  });
}

export function impulseRubble(this: Simulation, p: Vec3, r: number, power: number) {
  for (const b of this.rubble) {
    const dx = b.x + b.width / 2 - p.x,
      dy = b.y + b.height / 2 - p.y,
      dz = b.z + b.depth / 2 - p.z,
      d = Math.hypot(dx, dy, dz);
    if (d > r * 2) continue;
    energyImpulse(b, { x: dx, y: dy, z: dz }, Math.max(0, (1 - d / (r * 2)) * power), {
      x: b.x + b.centre.x,
      y: b.y + b.centre.y,
      z: b.z + b.centre.z,
    });
  }
}

function contactDamage(sim: Simulation, b: RubbleBody, old: ImpactPose) {
  const maxSpeed =
    Math.hypot(old.vx, old.vy, old.vz) +
    Math.hypot(old.omega.x, old.omega.y, old.omega.z) * Math.hypot(b.width, b.height, b.depth);
  if (maxSpeed < limits.impactSpeed) return;
  const { min, max } = impactBounds(b, old);
  sim.neighbours(
    (min.x + max.x) / 2,
    (min.z + max.z) / 2,
    Math.max(max.x - min.x, max.z - min.z) / 2 + 2,
    (a) => {
      if (!a.alive || a.vehicle || b.hitActors.has(a.id)) return;
      const hit = sectionImpact(b, old, a, 0.3, a.height);
      if (!hit || hit.speed < limits.impactSpeed) return;
      if (a.shield <= 0) b.hitActors.add(a.id);
      sim.hurt(a, Math.min(180, hit.speed * Math.sqrt(b.mass) * 2.8), null);
      for (const [x, z] of [
        [min.x - 0.4, a.z],
        [max.x + 0.4, a.z],
        [a.x, min.z - 0.4],
        [a.x, max.z + 0.4],
      ]) {
        if (!sim.occupied(a, x, a.y, z, 0.3, a.height)) {
          a.x = x;
          a.z = z;
          break;
        }
      }
    },
  );
  for (const v of sim.vehicles) {
    if (!v.alive || b.hitVehicles.has(v)) continue;
    const hit = sectionImpact(b, old, v, v.radius, v.height);
    if (!hit || hit.speed < limits.impactSpeed) continue;
    b.hitVehicles.add(v);
    sim.hurtVehicle(v, Math.min(500, Math.min(180, hit.speed * Math.sqrt(b.mass) * 2.8) * 2), null);
  }
}

function settle(sim: Simulation, b: RubbleBody) {
  const remaining = new Set(b.voxels);
  const transformed = rubbleShape(b).map((v, i) => ({ v, source: b.voxels[i] }));
  const w = sim.world;
  // Snap only to immediately neighbouring, supported surface cells. Never search down a column.
  for (const { v, source } of transformed.sort((a, b) => a.v.y - b.v.y)) {
    const centre = { x: b.x + v.x, y: b.y + v.y, z: b.z + v.z },
      candidates: { x: number; y: number; z: number; distance: number }[] = [];
    for (let dy = -1; dy <= 1; dy++)
      for (let dz = -1; dz <= 1; dz++)
        for (let dx = -1; dx <= 1; dx++) {
          const x = Math.floor(centre.x) + dx,
            y = Math.floor(centre.y) + dy,
            z = Math.floor(centre.z) + dz;
          const distance =
            (x + 0.5 - centre.x) ** 2 + (y + 0.5 - centre.y) ** 2 + (z + 0.5 - centre.z) ** 2;
          if (distance <= 2.25) candidates.push({ x, y, z, distance });
        }
    candidates.sort((a, b) => a.distance - b.distance);
    for (const { x, y, z } of candidates) {
      if (!w.inside(x, y, z) || y < 1 || w.cell(x, y, z)) continue;
      const supported = [
        [0, -1, 0],
        [1, 0, 0],
        [-1, 0, 0],
        [0, 0, 1],
        [0, 0, -1],
      ].some(([dx, dy, dz]) => {
        const material = w.cell(x + dx, y + dy, z + dz);
        return material > 0 && material !== 7 && material !== 11 && material !== 16;
      });
      if (!supported) continue;
      let occupied = false;
      sim.neighbours(x + 0.5, z + 0.5, 2, (a) => {
        if (
          a.alive &&
          !a.vehicle &&
          a.x + 0.3 > x &&
          a.x - 0.3 < x + 1 &&
          a.z + 0.3 > z &&
          a.z - 0.3 < z + 1 &&
          a.y + a.height > y &&
          a.y < y + 1
        )
          occupied = true;
      });
      if (
        occupied ||
        sim.vehicles.some(
          (v) =>
            v.alive &&
            Math.abs(v.x - x - 0.5) < v.radius + 0.5 &&
            Math.abs(v.z - z - 0.5) < v.radius + 0.5 &&
            v.y + v.height > y &&
            v.y < y + 1,
        )
      )
        continue;
      w.removingCollapse = true;
      try {
        w.setRaw(x, y, z, source.material);
        w.damageVoxel(x, y, z, b.damage?.get(source) ?? source.damage ?? 0);
        b.damage?.delete(source);
      } finally {
        w.removingCollapse = false;
      }
      remaining.delete(source);
      w.rubbleCells.add(w.index(x, y, z));
      break;
    }
    // Rotated voxels can quantize into an already settled rubble cell. Crush the trapped
    // remainder into visible dust at that contact, rather than keeping an embedded rigid body.
    if (
      remaining.has(source) &&
      b.restTime > 0.5 &&
      candidates.some((p) => w.rubbleCells.has(w.index(p.x, p.y, p.z)))
    ) {
      remaining.delete(source);
      b.damage?.delete(source);
      sim.addDust(centre, 0.5, 0.25);
    }
  }
  if (remaining.size !== b.voxels.length) {
    b.voxels = [...remaining];
    rebuildMassProperties(b);
    b.connectivityDirty = b.voxels.length > 1;
    b.geometryVersion++;
  }
  while (w.rubbleCells.size > limits.rubbleCells) {
    const index = w.rubbleCells.values().next().value!;
    w.removeVoxel(index % W, Math.floor(index / (W * D)), Math.floor(index / W) % D);
  }
}

function bodySnapshot(body: RubbleBody): RubbleBody {
  const copy = {
    ...body,
    orientation: { ...body.orientation },
    omega: { ...body.omega },
    centre: { ...body.centre },
  };
  shareCollisionGeometry(body, copy);
  shareSectionTree(body, copy);
  return copy;
}
function motionKey(sim: Simulation, b: RubbleBody): string {
  const bounds = rubbleBounds(b),
    chunks: number[] = [];
  for (
    let z = Math.max(0, Math.floor((bounds.min.z - 1) / CS));
    z <= Math.min(NX - 1, Math.floor((bounds.max.z + 1) / CS));
    z++
  )
    for (
      let x = Math.max(0, Math.floor((bounds.min.x - 1) / CS));
      x <= Math.min(NX - 1, Math.floor((bounds.max.x + 1) / CS));
      x++
    )
      chunks.push(sim.world.chunkRevisions[z * NX + x]);
  return [bodyPoseKey(b), b.vx, b.vy, b.vz, b.omega.x, b.omega.y, b.omega.z, ...chunks].join('|');
}
function* advanceBody(
  sim: Simulation,
  live: RubbleBody,
  dt: number,
): Generator<void, boolean, unknown> {
  const b = bodySnapshot(live);
  if (live.sleeping && supportUnchanged(sim, live)) return true;
  let support: ContactResult;
  do {
    support = probeSupport(sim, live);
    if (support.kind === 'deferred') yield;
  } while (support.kind === 'deferred');
  b.support = live.support;
  let stable = !!live.support?.stable && groundedPath(sim, live);
  const peers = new Map<RubbleBody, RubbleBody>(),
    peerKeys = new Map<RubbleBody, string>();
  const resolve = (body: RubbleBody, c: Contact, restitution = 0.08) => {
    if (c.body) {
      let peer = peers.get(c.body);
      if (!peer) {
        peer = bodySnapshot(c.body);
        peers.set(c.body, peer);
        peerKeys.set(c.body, motionKey(sim, c.body));
      }
      return resolveContact(body, { ...c, body: peer }, restitution);
    }
    return resolveContact(body, c, restitution);
  };
  function* terrain(
    x: number,
    y: number,
    z: number,
    from?: Vec3,
  ): Generator<void, Exclude<ContactResult, { kind: 'deferred' }>, unknown> {
    let result: ContactResult;
    do {
      result = terrainContacts(sim, b, x, y, z, from);
      if (result.kind === 'deferred') yield;
    } while (result.kind === 'deferred');
    return result;
  }
  if (b.sleeping && stable) {
    live.sleepRevision = sim.world.revision;
    return true;
  }
  b.sleeping = false;
  const before = {
    x: b.x,
    y: b.y,
    z: b.z,
    orientation: { ...b.orientation },
    omega: { ...b.omega },
    vx: b.vx,
    vy: b.vy,
    vz: b.vz,
  };
  b.vy = Math.max(-limits.terminalSpeed, b.vy - limits.gravity * dt);
  const impacts: { point: Vec3; speed: number; keys: number[]; energy?: number }[] = [];
  const impactPose = { ...before, vy: b.vy };
  // A grounded support manifold is already an exact contact result, including sleeping rubble.
  // Resolve its normal here rather than relying on a later, budget-limited body-pair query.
  // Otherwise a slab can retain its pose on another slab while accumulating terminal fall speed.
  if (support.kind === 'contact' && b.vy < 0) {
    const floor = support.contacts.find((c) => c.normal.y > 0.6);
    if (floor) {
      const impactSpeed = resolve(b, {
        ...floor,
        point: stable
          ? { x: b.x + b.centre.x, y: floor.point.y, z: b.z + b.centre.z }
          : floor.point,
      });
      const energy = (contactResponse(b)?.dissipated ?? 0) * 0.25;
      if (
        impactSpeed > limits.impactSpeed ||
        (b.primary && b.mass > 1000 && impactSpeed > 1.5 && energy > 50)
      )
        impacts.push({
          point: floor.point,
          speed: impactSpeed,
          energy,
          keys: support.contacts.flatMap((c) => (c.terrain === undefined ? [] : [c.terrain])),
        });
    }
  }
  if (stable) {
    b.omega.x *= 0.8;
    b.omega.z *= 0.8;
    b.omega.y *= 0.95;
  }
  const angularRate = Math.hypot(b.omega.x, b.omega.y, b.omega.z);
  if (angularRate > 1e-5) {
    // Contact impulses supply the off-centre torque. Do not also integrate a
    // manually constrained pivot, which double-counted gravity and added energy.
    integrateRotation(b, dt);
    let rotated = yield* terrain(b.x, b.y, b.z);
    for (let correction = 0; correction < 4 && rotated.kind === 'contact'; correction++) {
      const c = rotated.contacts.reduce((best, c) => (c.penetration > best.penetration ? c : best));
      const speed = resolve(
        b,
        stable && c.normal.y > 0.6
          ? { ...c, point: { x: b.x + b.centre.x, y: c.point.y, z: b.z + b.centre.z } }
          : c,
        0,
      );
      if (
        speed > limits.impactSpeed ||
        (b.primary && b.mass > 1000 && speed > 1.5 && (contactResponse(b)?.dissipated ?? 0) > 200)
      )
        impacts.push({
          point: c.point,
          speed,
          keys: c.terrain === undefined ? [] : [c.terrain],
          energy: (contactResponse(b)?.dissipated ?? 0) * 0.25,
        });
      const correctionDistance = Math.min(0.15, c.penetration + 0.001);
      b.x += c.normal.x * correctionDistance;
      b.y += c.normal.y * correctionDistance;
      b.z += c.normal.z * correctionDistance;
      rotated = yield* terrain(b.x, b.y, b.z);
    }
    if (rotated.kind === 'contact') {
      b.x = before.x;
      b.y = before.y;
      b.z = before.z;
      b.orientation = { ...before.orientation };
    }
  }
  for (const axis of ['x', 'z', 'y'] as const) {
    const velocity = axis === 'x' ? 'vx' : axis === 'y' ? 'vy' : 'vz';
    const delta = b[velocity] * dt;
    if (!delta) continue;
    const next = { x: b.x, y: b.y, z: b.z };
    next[axis] += delta;
    const result = yield* terrain(next.x, next.y, next.z, b);
    if (result.kind === 'clear') {
      b[axis] = next[axis];
      continue;
    }
    const opposing = result.contacts.filter((c) => c.normal[axis] * delta < -1e-9);
    if (!opposing.length) {
      b[axis] = next[axis];
      continue;
    }
    const contact = opposing.reduce((best, c) => (c.fraction < best.fraction ? c : best));
    b[axis] +=
      delta * Math.max(0, contact.fraction - 0.001) +
      contact.normal[axis] * Math.min(0.15, contact.penetration);
    // Distributed horizontal support acts through the centre rather than an arbitrary first voxel.
    if (
      contact.normal.y > 0.6 &&
      supportFootprint(
        opposing.filter((c) => c.fraction <= contact.fraction + 0.01),
        { x: b.x + b.centre.x, y: b.y + b.centre.y, z: b.z + b.centre.z },
      ).stable
    )
      stable = true;
    const manifold =
      contact.normal.y > 0.6 && stable
        ? { ...contact, point: { x: b.x + b.centre.x, y: contact.point.y, z: b.z + b.centre.z } }
        : contact;
    const impactSpeed = resolve(b, manifold);
    if (stable && axis === 'y') {
      b.vx *= 0.9;
      b.vz *= 0.9;
      b.omega.x *= 0.85;
      b.omega.y *= 0.85;
      b.omega.z *= 0.85;
    }
    if (
      impactSpeed > limits.impactSpeed ||
      (b.primary &&
        b.mass > 1000 &&
        impactSpeed > 1.5 &&
        (contactResponse(b)?.dissipated ?? 0) > 200)
    )
      impacts.push({
        point: contact.point,
        speed: impactSpeed,
        energy: (contactResponse(b)?.dissipated ?? 0) * 0.25,
        keys: opposing.flatMap((c) => (c.terrain === undefined ? [] : [c.terrain])),
      });
  }
  for (const peer of peers.keys())
    if (!sim.rubble.includes(peer) || peerKeys.get(peer) !== motionKey(sim, peer)) return false;
  for (const [peer, next] of peers) {
    peer.vx = next.vx;
    peer.vy = next.vy;
    peer.vz = next.vz;
    peer.omega = { ...next.omega };
  }
  Object.assign(live, {
    x: b.x,
    y: b.y,
    z: b.z,
    vx: b.vx,
    vy: b.vy,
    vz: b.vz,
    orientation: { ...b.orientation },
    omega: { ...b.omega },
    sleeping: false,
  });
  live.travel += Math.hypot(live.x - before.x, live.y - before.y, live.z - before.z);
  live.age += dt;
  live.impactCooldown = Math.max(0, live.impactCooldown - dt);
  for (const impact of impacts) {
    queueStaticImpact(sim, live, impact.keys, impact.speed, impact.energy);
    queueImpact(live, impact.point, impact.speed, impact.energy);
    if (live.impactCooldown <= 0) {
      sim.addDust(impact.point, Math.min(4, Math.sqrt(live.mass)), 0.6);
      sim.soundAt('boom', impact.point.x, impact.point.z, Math.min(0.6, impact.speed / 45));
    }
  }
  live.vx *= Math.exp(-dt * 0.5);
  live.vz *= Math.exp(-dt * 0.5);
  for (const axis of ['x', 'y', 'z'] as const) live.omega[axis] *= Math.exp(-dt * 0.4);
  const resting =
    stable &&
    Math.hypot(live.vx, live.vy, live.vz) < 0.25 &&
    Math.hypot(live.omega.x, live.omega.y, live.omega.z) < 0.08;
  live.restTime = resting ? live.restTime + dt : 0;
  invalidateSections(sim, live);
  contactDamage(sim, live, impactPose);
  if (live.restTime >= 1) {
    if (live.voxels.length <= 64 && live.support?.terrain.length) settle(sim, live);
    live.sleeping = true;
    live.sleepRevision = sim.world.revision;
    live.vx = live.vy = live.vz = 0;
    live.omega = { x: 0, y: 0, z: 0 };
  }
  return true;
}
interface MotionPass {
  bodies: RubbleBody[];
  index: number;
  slice: number | null;
  job?: Generator<void, boolean, unknown>;
  key?: string;
}
const motionPasses = new WeakMap<Simulation, MotionPass>();
export function cancelRubbleMotion(sim: Simulation) {
  motionPasses.get(sim)?.job?.return(false);
  motionPasses.delete(sim);
}
const lastAttempt = new WeakMap<RubbleBody, number>();
let attemptSequence = 0;
/** Debt is explicit and catch-up stays swept and bounded; rendering FPS is not a physics progress metric. */
export function updateRubble(this: Simulation, dt: number) {
  if (!Number.isFinite(dt) || dt <= 0) return;
  pruneSupportQueries(this);
  for (let i = this.dust.length - 1; i >= 0; i--) {
    const d = this.dust[i];
    d.life -= dt;
    d.y += dt * 0.7;
    d.radius += dt * 1.2;
    if (d.life <= 0) this.dust.splice(i, 1);
  }
  for (const b of this.rubble) {
    // Sleeping bodies do not accrue a backlog. Active bodies never discard elapsed physical time.
    b.lastProgressTime ??= this.simTime;
    if (b.sleeping && supportUnchanged(this, b)) {
      b.pendingDt = 0;
      b.lastProgressTime = this.simTime;
    } else b.pendingDt += dt;
  }
  const ownedBudget = !this.destructionBudget;
  this.destructionBudget ??= newDestructionBudget();
  const budget = this.destructionBudget,
    start = performance.now();
  budget.deadline = start + Math.max(0, budget.physicsMs);
  if (budget.physicsMs > 0) {
    // One motion pass owns the body's proposed dt until every terrain query completes.
    // Moving a support or resolving contacts in between retries would invalidate that work.
    let cycles = 0;
    while (performance.now() < budget.deadline && cycles < 4) {
      if (contactPassPending(this.rubble)) {
        if (
          resolveRubbleContacts(
            this.rubble,
            (b, x, y, z) => {
              const result = terrainContacts(this, b, x, y, z);
              return result.kind === 'deferred' ? 'deferred' : result.kind === 'clear';
            },
            0,
            budget,
          ) === 'deferred'
        )
          break;
      }
      let motion = motionPasses.get(this);
      if (!motion) {
        const motionDeadline = budget.deadline;
        budget.deadline = Math.min(
          motionDeadline,
          performance.now() + Math.min(1.2, Math.max(0, budget.physicsMs) * 0.2),
        );
        processFractures(this);
        processStaticImpacts(this);
        budget.deadline = motionDeadline;
        motion = {
          bodies: [...this.rubble].sort(
            (a, b) =>
              b.pendingDt - a.pendingDt ||
              (lastAttempt.get(a) ?? 0) - (lastAttempt.get(b) ?? 0) ||
              a.id - b.id,
          ),
          index: 0,
          slice: null,
        };
        motionPasses.set(this, motion);
      }
      let deferred = false;
      while (motion.index < motion.bodies.length && performance.now() < budget.deadline) {
        const b = motion.bodies[motion.index];
        if (!this.rubble.includes(b) || !b.voxels.length || b.pendingDt < 1e-6) {
          motion.job?.return(false);
          motion.job = undefined;
          motion.index++;
          motion.slice = null;
          continue;
        }
        motion.slice ??= Math.min(
          b.pendingDt,
          1 / 60,
          0.45 / Math.max(1, Math.hypot(b.vx, b.vy, b.vz)),
          0.15 /
            Math.max(
              1,
              (Math.hypot(b.omega.x, b.omega.y, b.omega.z) *
                Math.hypot(b.width, b.height, b.depth)) /
                2,
            ),
        );
        lastAttempt.set(b, ++attemptSequence);
        const key = motionKey(this, b);
        if (motion.job && motion.key !== key) {
          motion.job.return(false);
          motion.job = undefined;
        }
        if (!motion.job) {
          motion.job = advanceBody(this, b, motion.slice);
          motion.key = key;
        }
        let step = motion.job.next();
        while (!step.done && performance.now() < budget.deadline) step = motion.job.next();
        if (!step.done) {
          deferred = true;
          break;
        }
        if (!step.value) {
          motion.job = undefined;
          deferred = true;
          break;
        }
        b.pendingDt = Math.max(0, b.pendingDt - motion.slice);
        b.lastProgressTime = this.simTime;
        this.destructionStats.advancedSteps++;
        motion.job = undefined;
        motion.index++;
        motion.slice = null;
      }
      if (deferred || motion.index < motion.bodies.length) break;
      motionPasses.delete(this);
      cycles++;
      if (
        resolveRubbleContacts(
          this.rubble,
          (b, x, y, z) => {
            const result = terrainContacts(this, b, x, y, z);
            return result.kind === 'deferred' ? 'deferred' : result.kind === 'clear';
          },
          this.contactCursor++,
          budget,
        ) === 'deferred'
      )
        break;
    }
  }
  for (let i = this.rubble.length - 1; i >= 0; i--) {
    const b = this.rubble[i];
    if (
      !b.voxels.length ||
      b.y < -H ||
      b.x + b.width < 0 ||
      b.z + b.depth < 0 ||
      b.x >= W ||
      b.z >= D
    )
      this.rubble.splice(i, 1);
  }
  pruneSupportQueries(this);
  invalidateSections(this);
  const elapsed = performance.now() - start;
  budget.physicsMs -= elapsed;
  budget.deadline = Infinity;
  this.destructionStats.physicsMs = elapsed;
  this.destructionStats.maxPhysicsMs = Math.max(this.destructionStats.maxPhysicsMs, elapsed);
  this.destructionStats.pendingBodies = this.rubble.filter((b) => b.pendingDt >= 1 / 60).length;
  this.destructionStats.oldestDebt = this.rubble.reduce((n, b) => Math.max(n, b.pendingDt), 0);
  this.destructionStats.staleTime = this.rubble.reduce(
    (n, b) => Math.max(n, b.sleeping ? 0 : this.simTime - (b.lastProgressTime ?? this.simTime)),
    0,
  );
  this.destructionStats.sleepingBodies = this.rubble.filter((b) => b.sleeping).length;
  if (budget.physicsMs <= 0) this.destructionStats.deferredFrames++;
  if (ownedBudget) this.destructionBudget = null;
}
