import { dist2 } from '../core/math';
import type { Actor, Squad, Vec3 } from '../core/types';
import { walkSegment } from './navigation';
import { npcState, pressure } from './npc-state';
import { canSee } from './perception';
import { clearSegment } from './section-query';
import type { Simulation } from './simulation';

/** Observations are immutable positions with a lifetime, never references to hidden enemies. */
export interface Observation extends Vec3 {
  targetId: number;
  observedAt: number;
  expires: number;
  observer: number;
}
interface SquadMemory {
  contacts: Map<number, Observation>;
  leaderDownAt: number;
}
const memories = new WeakMap<Squad, SquadMemory>();
function memory(q: Squad) {
  let m = memories.get(q);
  if (!m) {
    m = { contacts: new Map(), leaderDownAt: -1 };
    memories.set(q, m);
  }
  return m;
}
export function observeContact(sim: Simulation, observer: Actor, target: Actor) {
  const squad = sim.squads[observer.squadId];
  if (!squad || observer.team === target.team) return;
  const m = memory(squad);
  m.contacts.set(target.id, {
    x: target.x,
    y: target.y,
    z: target.z,
    targetId: target.id,
    observedAt: sim.simTime,
    expires: sim.simTime + 6,
    observer: observer.id,
  });
  if (m.contacts.size > 8) {
    const oldest = [...m.contacts.values()].sort((a, b) => a.observedAt - b.observedAt)[0];
    m.contacts.delete(oldest.targetId);
  }
}
export function squadContact(sim: Simulation, actor: Actor): Observation | null {
  const squad = sim.squads[actor.squadId];
  if (!squad) return null;
  const m = memory(squad);
  let best: Observation | null = null,
    score = Infinity;
  for (const [id, contact] of m.contacts) {
    if (contact.expires <= sim.simTime) {
      m.contacts.delete(id);
      continue;
    }
    const d = dist2(contact, actor) + (sim.simTime - contact.observedAt) * 40;
    if (d < score) {
      best = contact;
      score = d;
    }
  }
  return best;
}
export function updateSquadLeadership(sim: Simulation) {
  for (const q of sim.squads) {
    const m = memory(q),
      leader = sim.actors[q.leaderId];
    // A player's selected role remains theirs while down. NPC squads elect a survivor.
    if (leader?.player || leader?.alive) {
      m.leaderDownAt = -1;
      continue;
    }
    if (m.leaderDownAt < 0) m.leaderDownAt = sim.simTime;
    if (sim.simTime - m.leaderDownAt < 1) continue;
    const successor = q.memberIds
      .map((id) => sim.actors[id])
      .filter((a) => a?.alive && !a.vehicle)
      .sort((a, b) => pressure(sim, a) - pressure(sim, b) || b.hp - a.hp || a.id - b.id)[0];
    if (successor) {
      q.leaderId = successor.id;
      m.leaderDownAt = -1;
    }
  }
}

/** Fireteams alternate movement and covering fire. Manual follow/hold orders take precedence. */
export function squadCombatIntent(
  sim: Simulation,
  actor: Actor,
): { point: Vec3; tactic: string } | null {
  const q = sim.squads[actor.squadId];
  if (!q || q.order.kind !== 'objective') return null;
  const contact = squadContact(sim, actor);
  if (!contact || dist2(actor, contact) > 95 * 95) return null;
  if (!actor.target) {
    if (dist2(actor, contact) < 9) return null;
    return { point: contact, tactic: 'INVESTIGATE' };
  }
  const members = q.memberIds.map((id) => sim.actors[id]).filter((a) => a?.alive && !a.vehicle);
  const slot = q.memberIds.indexOf(actor.id),
    team = slot < 5 ? 0 : 1;
  const coveringTeam = (Math.floor(sim.simTime / 5) + q.id) % 2;
  const coverReady = members.some(
    (a) =>
      a !== actor &&
      (q.memberIds.indexOf(a.id) < 5 ? 0 : 1) === coveringTeam &&
      a.target &&
      a.reload <= 0 &&
      pressure(sim, a) < 0.6,
  );
  if (
    (team === coveringTeam || actor.kit === 'support' || actor.kit === 'recon') &&
    actor.target &&
    actor.reload <= 0
  )
    return { point: actor, tactic: 'SUPPRESS' };
  if (!coverReady) return null;
  const leader = sim.actors[q.leaderId] ?? actor;
  const dx = contact.x - leader.x,
    dz = contact.z - leader.z,
    length = Math.hypot(dx, dz) || 1;
  const side = q.id % 2 ? 1 : -1,
    spread = 9 + (slot % 5) * 1.6;
  const point = {
    x: contact.x - (dx / length) * 15 + (dz / length) * spread * side,
    z: contact.z - (dz / length) * 15 - (dx / length) * spread * side,
    y: actor.y,
  };
  return { point, tactic: 'BOUND / FLANK' };
}

/** Persistent lane blockage produces a validated lateral move rather than endless delayed shots. */
export function yieldFiringLane(sim: Simulation, actor: Actor, target: Vec3) {
  const brain = npcState(actor);
  if (brain.blockedSince < 0) brain.blockedSince = sim.simTime;
  if (sim.simTime - brain.blockedSince < 0.32 || brain.task || actor.tactic === 'EVADE') return;
  const yaw = Math.atan2(target.x - actor.x, target.z - actor.z),
    sign = actor.id % 2 ? 1 : -1;
  for (const side of [sign, -sign]) {
    const dx = Math.cos(yaw) * side,
      dz = -Math.sin(yaw) * side;
    const point = { x: actor.x + dx * 1.8, y: actor.y, z: actor.z + dz * 1.8 };
    if (
      walkSegment(sim, actor, point) &&
      !sim.actors.some(
        (a) =>
          a !== actor &&
          a.alive &&
          !a.vehicle &&
          Math.abs(a.y - actor.y) < 1.8 &&
          dist2(a, point) < 0.7,
      )
    ) {
      actor.dx = dx;
      actor.dz = dz;
      actor.crouched = false;
      actor.tactic = 'CLEAR FIRING LANE';
      brain.reason = 'Repositioning around an allied firing lane';
      brain.nextThink = Math.max(brain.nextThink, sim.simTime + 0.35);
      return;
    }
  }
}

export interface FiringPosition extends Vec3 {
  peek: boolean;
}
/** Cover slots are local-floor positions, revalidated against terrain and moving sections. */
export function firingPosition(
  sim: Simulation,
  a: Actor,
  threat: Vec3,
  objective: Vec3,
): FiringPosition | null {
  const brain = npcState(a),
    eye = { x: threat.x, y: threat.y + 1.4, z: threat.z };
  const freeReservation = (p: Vec3) => {
    let free = true;
    sim.neighbours(p.x, p.z, 8, (ally) => {
      if (ally === a || !ally.alive || ally.team !== a.team || Math.abs(ally.y - p.y) > 2) return;
      const b = npcState(ally);
      if (b.position && b.positionUntil > sim.simTime && dist2(b.position, p) < 1.65 ** 2)
        free = false;
    });
    return free;
  };
  const protectedLow = (p: Vec3) => !clearSegment(sim, eye, { x: p.x, y: p.y + 0.75, z: p.z });
  if (
    brain.position &&
    brain.positionUntil > sim.simTime &&
    freeReservation(brain.position) &&
    walkSegment(sim, a, brain.position) &&
    protectedLow(brain.position)
  ) {
    brain.position.peek = canSee(sim, eye, { ...brain.position, y: brain.position.y + 1.5 });
    return brain.position;
  }
  brain.position = null;
  brain.positionUntil = 0;
  if (sim.coverBudget <= 0 || brain.nextCoverSearch > sim.simTime) return null;
  sim.coverBudget--;
  brain.nextCoverSearch = sim.simTime + 1.2 + (a.id % 5) * 0.08;
  let best: FiringPosition | null = null,
    score = -Infinity;
  for (let k = 0; k < 12; k++) {
    const angle = (k * Math.PI) / 6 + (a.id % 3) * 0.12,
      radius = k < 6 ? 3.5 : 6;
    const x = a.x + Math.sin(angle) * radius,
      z = a.z + Math.cos(angle) * radius;
    let p: Vec3 | null = null;
    for (const dy of [0, -1, 1]) {
      const candidate = { x, y: a.y + dy, z };
      if (walkSegment(sim, a, candidate) && !sim.occupied(a, x, candidate.y, z, 0.35, 1.8)) {
        p = candidate;
        break;
      }
    }
    if (!p || !freeReservation(p) || !protectedLow(p)) continue;
    const peek = canSee(sim, eye, { ...p, y: p.y + 1.5 });
    const value = (peek ? 34 : 20) - radius - Math.sqrt(dist2(p, objective)) * 0.02;
    if (value > score) {
      score = value;
      best = { ...p, peek };
    }
  }
  if (best) {
    brain.position = best;
    brain.cover = best;
    brain.coverUntil = brain.positionUntil = sim.simTime + 3.5 + (a.id % 3) * 0.4;
    brain.reason = best.peek ? 'Holding cover with a clear firing lane' : 'Sheltering behind cover';
  }
  return best;
}
