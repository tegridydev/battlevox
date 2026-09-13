import type { Actor, Vec3, Vehicle } from '../core/types';
import { rubbleBounds } from './rubble-shape';
import { clearSegment } from './section-query';
import type { Simulation } from './simulation';

export type SupportKind = 'REVIVE' | 'HEAL' | 'REPAIR' | 'RESUPPLY';
export interface SupportTask {
  kind: SupportKind;
  target: Actor | Vehicle;
  phase: 'APPROACH' | 'ROUTE' | 'WORK';
  until: number;
  started: number;
}
export interface NpcState {
  rocketTarget: Vehicle | null;
  rocketReady: number;
  position: (Vec3 & { peek: boolean }) | null;
  positionUntil: number;
  nextCoverSearch: number;
  nextThink: number;
  lastThink: number;
  reactionAt: number;
  lastSeen: number;
  task: SupportTask | null;
  reason: string;
  avoidUntil: number;
  avoid: Vec3 | null;
  cover: Vec3 | null;
  coverUntil: number;
  blockedShots: number;
  blockedSince: number;
  suppression: number;
  pressureAt: number;
  routeGoal: Vec3 | null;
  routeSearch?: import('./navigation').LayerSearch;
  routeUntil: number;
}
const brains = new WeakMap<Actor, NpcState>();
export function npcState(a: Actor): NpcState {
  let b = brains.get(a);
  if (!b) {
    b = {
      rocketTarget: null,
      rocketReady: 0,
      position: null,
      positionUntil: 0,
      nextCoverSearch: 0,
      nextThink: 0,
      lastThink: -100,
      reactionAt: 0,
      lastSeen: -100,
      task: null,
      reason: 'Moving to assigned sector',
      avoidUntil: 0,
      avoid: null,
      cover: null,
      coverUntil: 0,
      blockedShots: 0,
      blockedSince: -1,
      suppression: 0,
      pressureAt: 0,
      routeGoal: null,
      routeUntil: 0,
    };
    brains.set(a, b);
  }
  return b;
}
export function resetNPC(a: Actor) {
  brains.delete(a);
}
interface Reservation {
  actor: Actor;
  until: number;
}
const reservations = new WeakMap<Simulation, Map<Actor | Vehicle, Reservation>>();
export function supportReservationsFor(sim: Simulation) {
  let list = reservations.get(sim);
  if (!list) {
    list = new Map();
    reservations.set(sim, list);
  }
  return list;
}
export function pruneReservations(sim: Simulation) {
  const list = reservations.get(sim);
  if (!list) return;
  for (const [target, owner] of list) {
    const targetExists =
      'id' in target ? sim.actors[target.id] === target : sim.vehicles.includes(target);
    if (
      !targetExists ||
      owner.until <= sim.simTime ||
      !owner.actor.alive ||
      sim.actors[owner.actor.id] !== owner.actor ||
      npcState(owner.actor).task?.target !== target
    )
      list.delete(target);
  }
}
export function cancelSupportTask(sim: Simulation, a: Actor, reason = 'Task cancelled') {
  const list = reservations.get(sim);
  if (list) for (const [target, owner] of list) if (owner.actor === a) list.delete(target);
  const brain = npcState(a);
  brain.task = null;
  brain.reason = reason;
}
export function retireNPC(sim: Simulation, a: Actor) {
  cancelSupportTask(sim, a);
  reservations.get(sim)?.delete(a);
  brains.delete(a);
}
export function resetNpcState(sim: Simulation) {
  reservations.get(sim)?.clear();
  reservations.delete(sim);
  for (const a of sim.actors) brains.delete(a);
}
export function reservationCount(sim: Simulation) {
  return reservations.get(sim)?.size ?? 0;
}
export const acquisitionRange = (a: Actor) => (a.kit === 'recon' ? 90 : 68);
export const retentionRange = (a: Actor) => acquisitionRange(a) + 12;

/** Friendly bodies block a shot even though friendly-fire damage is disabled. */
export function friendlyLane(sim: Simulation, a: Actor, end: Vec3, radius = 0.62) {
  const origin = { x: a.x, y: a.y + Math.min(1.45, a.height - 0.13), z: a.z };
  const dx = end.x - origin.x,
    dy = end.y - origin.y,
    dz = end.z - origin.z;
  const length2 = dx * dx + dy * dy + dz * dz;
  if (length2 < 0.0001) return false;
  let blocked = false;
  sim.neighbours((a.x + end.x) * 0.5, (a.z + end.z) * 0.5, Math.sqrt(length2) * 0.5 + 2, (b) => {
    if (blocked || b === a || !b.alive || b.vehicle || b.team !== a.team) return;
    const t =
      ((b.x - origin.x) * dx + (b.y + b.height * 0.5 - origin.y) * dy + (b.z - origin.z) * dz) /
      length2;
    if (t <= 0.015 || t >= 0.98) return;
    const y = origin.y + dy * t;
    if (
      y >= b.y &&
      y <= b.y + b.height + 0.1 &&
      Math.hypot(origin.x + dx * t - b.x, origin.z + dz * t - b.z) < radius
    )
      blocked = true;
  });
  if (!blocked)
    for (const v of sim.vehicles) {
      if (!v.alive || v.team !== a.team || a.vehicle === v) continue;
      const t = sim.rayBox(
        origin,
        { x: dx / Math.sqrt(length2), y: dy / Math.sqrt(length2), z: dz / Math.sqrt(length2) },
        { x: v.x, y: v.y + v.height / 2, z: v.z, xr: v.radius, yr: v.height / 2, zr: v.radius },
      );
      if (t < Math.sqrt(length2)) {
        blocked = true;
        break;
      }
    }
  return blocked;
}

/** Pressure comes from actual nearby shot segments, never an omniscient enemy timer. */
export function nearMiss(sim: Simulation, shooter: Actor, from: Vec3, to: Vec3) {
  const dx = to.x - from.x,
    dy = to.y - from.y,
    dz = to.z - from.z;
  const length2 = dx * dx + dy * dy + dz * dz;
  if (length2 < 0.001) return;
  sim.neighbours((from.x + to.x) / 2, (from.z + to.z) / 2, Math.sqrt(length2) / 2 + 2, (a) => {
    if (a.player || a.team === shooter.team || !a.alive || a.vehicle || a.shield > 0) return;
    const centre = { x: a.x, y: a.y + a.height * 0.6, z: a.z };
    const t = Math.max(
      0,
      Math.min(
        1,
        ((centre.x - from.x) * dx + (centre.y - from.y) * dy + (centre.z - from.z) * dz) / length2,
      ),
    );
    const closest = { x: from.x + dx * t, y: from.y + dy * t, z: from.z + dz * t };
    const distance = Math.hypot(centre.x - closest.x, centre.y - closest.y, centre.z - closest.z);
    if (distance > 2.2 || !clearSegment(sim, centre, closest)) return;
    const b = npcState(a);
    const old = b.suppression * Math.exp(-Math.max(0, sim.simTime - b.pressureAt) * 0.9);
    b.suppression = Math.min(1, old + 0.16 * (1 - distance / 2.2));
    b.pressureAt = sim.simTime;
    b.nextThink = Math.min(b.nextThink, sim.simTime);
  });
}
export function pressure(sim: Simulation, a: Actor) {
  const b = npcState(a);
  return b.suppression * Math.exp(-Math.max(0, sim.simTime - b.pressureAt) * 0.9);
}

/** Hazards pre-empt support. Structural danger uses swept geometry, not a centre-distance sphere. */
export function hazardResponse(sim: Simulation, a: Actor) {
  if (!a.alive || a.vehicle) return false;
  const brain = npcState(a),
    eye = { x: a.x, y: a.y + 1, z: a.z };
  let hazard: Vec3 | null = null;
  for (const p of sim.projectiles) {
    if (
      p.type === 'grenade' &&
      p.life > 0 &&
      Math.hypot(p.x - a.x, p.y - a.y, p.z - a.z) < 6 &&
      clearSegment(sim, eye, p)
    ) {
      hazard = { x: p.x, y: p.y, z: p.z };
      break;
    }
  }
  if (!hazard)
    for (const b of sim.rubble) {
      const angular = Math.hypot(b.omega.x, b.omega.y, b.omega.z);
      if (b.sleeping || !b.voxels.length || (b.vy > -0.5 && angular < 0.08)) continue;
      const bounds = rubbleBounds(b),
        duration = 0.65;
      const margin = Math.min(5, angular * Math.hypot(b.width, b.height, b.depth) * 0.45) + 1.6;
      const fall = Math.max(0, -b.vy) * duration + 4;
      if (bounds.max.y < a.y - 0.5 || bounds.min.y > a.y + a.height + fall) continue;
      const loX = bounds.min.x + Math.min(0, b.vx * duration) - margin;
      const hiX = bounds.max.x + Math.max(0, b.vx * duration) + margin;
      const loZ = bounds.min.z + Math.min(0, b.vz * duration) - margin;
      const hiZ = bounds.max.z + Math.max(0, b.vz * duration) + margin;
      if (a.x < loX || a.x > hiX || a.z < loZ || a.z > hiZ) continue;
      const point = {
        x: Math.max(bounds.min.x, Math.min(bounds.max.x, a.x)),
        y: bounds.min.y,
        z: Math.max(bounds.min.z, Math.min(bounds.max.z, a.z)),
      };
      if (!sim.world.visible(eye, point)) continue;
      // The nearest edge provides a usable escape direction even beneath a long, rotating beam.
      const exits = [
        { distance: a.x - loX, x: a.x + 1, z: a.z },
        { distance: hiX - a.x, x: a.x - 1, z: a.z },
        { distance: a.z - loZ, x: a.x, z: a.z + 1 },
        { distance: hiZ - a.z, x: a.x, z: a.z - 1 },
      ].sort((u, v) => u.distance - v.distance);
      hazard = { x: exits[0].x, y: a.y, z: exits[0].z };
      break;
    }
  if (hazard) {
    brain.avoid = hazard;
    brain.avoidUntil = sim.simTime + 0.9;
    cancelSupportTask(sim, a, 'Immediate hazard');
    brain.positionUntil = 0;
    brain.position = null;
  }
  if (brain.avoidUntil < sim.simTime || !brain.avoid) return false;
  const h = brain.avoid;
  const base = Math.atan2(a.x - h.x || (a.id & 1 ? 1 : -1) * 0.01, a.z - h.z);
  for (const off of [0, 0.6, -0.6, 1.2, -1.2, Math.PI]) {
    const dx = Math.sin(base + off),
      dz = Math.cos(base + off);
    if (!sim.occupied(a, a.x + dx * 1.1, a.y, a.z + dz * 1.1, 0.34, a.height)) {
      a.dx = dx;
      a.dz = dz;
      a.tactic = 'EVADE';
      if (!sim.occupied(a, a.x, a.y, a.z, 0.3, 1.8)) {
        a.height = 1.8;
        a.crouched = false;
      }
      brain.reason = 'Escaping a visible hazard';
      return true;
    }
  }
  // A blocked escape must not fall back to a lower-priority support task.
  a.dx = a.dz = 0;
  a.tactic = 'BRACE';
  brain.reason = 'Escape obstructed';
  return true;
}
