import * as mathModule from '../core/math';
import type { Actor, Team, Vec3 } from '../core/types';
import { combatTick } from './combat-ai';
import { aiEquipment } from './equipment';
import * as gameplayModule from './gameplay';
import { refreshNavigation, routeActor, walkSegment } from './navigation';
import * as npc_stateModule from './npc-state';
import { acquisitionRange, pressure, pruneReservations } from './npc-state';
import { canSee } from './perception';
import type { Simulation } from './simulation';
import {
  firingPosition,
  observeContact,
  squadCombatIntent,
  squadContact,
  updateSquadLeadership,
} from './tactics';
export function chooseTarget(this: Simulation, a: Vec3 & { team: Team }, range = 68): Actor | null {
  let best: Actor | null = null,
    score = range * range;
  this.neighbours(a.x, a.z, range, (b) => {
    if (a.team === b.team || !b.alive || b.shield > 0) return;
    const d = mathModule.dist2(a, b);
    const observer = a as Vec3 & Partial<Actor> & { team: Team };
    if (
      typeof observer.yaw === 'number' &&
      !('isVehicle' in a) &&
      d > 100 &&
      this.simTime - (observer.lastHit ?? -100) > 1.5
    ) {
      const facing =
        ((b.x - a.x) * Math.sin(observer.yaw) + (b.z - a.z) * Math.cos(observer.yaw)) /
        Math.sqrt(d);
      if (facing < 0.3 && observer.target !== b) return;
    }
    if (
      d < score &&
      canSee(
        this,
        { x: a.x, y: a.y + Math.min(1.55, (observer.height ?? 1.8) - 0.13), z: a.z },
        { x: b.x, y: b.y + Math.min(1.2, b.height - 0.2), z: b.z },
      )
    ) {
      best = b;
      score = d;
    }
  });
  return best;
}
export function think(this: Simulation, a: Actor) {
  const brain = npc_stateModule.npcState(a);
  brain.lastThink = this.simTime;
  const seen = this.chooseTarget(a, acquisitionRange(a));
  if (seen) {
    if (a.target !== seen) brain.reactionAt = this.simTime + 0.24 + (a.id % 7) * 0.043;
    brain.lastSeen = this.simTime;
    observeContact(this, a, seen);
    a.target = seen;
    a.contact = { x: seen.x, y: seen.y, z: seen.z, until: this.simTime + 5 };
  } else a.target = null;
  a.armourTarget =
    a.kit === 'engineer'
      ? (this.vehicles.find(
          (v) =>
            v.alive &&
            v.team !== a.team &&
            mathModule.dist2(a, v) < 7225 &&
            canSee(this, { x: a.x, y: a.y + 1.5, z: a.z }, { x: v.x, y: v.y + 1, z: v.z }),
        ) ?? null)
      : null;
  const squadPoint = this.squadTarget(a),
    route = a.goal;
  const f = this.world.flags[route],
    point = squadPoint ?? this.world.navigationPoint(a),
    inCentre = mathModule.dist2(a, f) < 400;
  let dx = point.x - a.x,
    dz = point.z - a.z;
  a.tactic = route !== 4 ? 'FLANK' : 'ADVANCE';
  a.crouched = false;
  if (!squadPoint && inCentre) {
    const angle = a.id * 2.39996,
      r = 6 + (a.id % 5) * 3;
    dx = f.x + Math.sin(angle) * r - a.x;
    dz = f.z + Math.cos(angle) * r - a.z;
    if (Math.hypot(dx, dz) < 2) dx = dz = 0;
    a.tactic = f.owner === a.team ? 'HOLD' : 'SECURE';
  }
  // Check reachable nearby cover against a recently observed enemy, never through-wall knowledge.
  const threat = a.contact && a.contact.until > this.simTime ? a.contact : squadContact(this, a);
  const stressed =
    a.hp < 45 || a.reload > 0 || this.simTime - a.lastHit < 2 || pressure(this, a) > 0.4;
  const cover =
    threat &&
    !brain.task &&
    mathModule.dist2(a, threat) < 78 ** 2 &&
    (stressed || (a.target && this.squads[a.squadId]?.order.kind === 'objective'))
      ? firingPosition(this, a, threat, { ...f, y: a.y })
      : null;
  if (cover) {
    dx = cover.x - a.x;
    dz = cover.z - a.z;
    const arrived = Math.hypot(dx, dz) < 0.8;
    if (arrived) dx = dz = 0;
    a.tactic = arrived ? 'HOLD COVER' : 'TAKE COVER';
    a.crouched =
      arrived &&
      (!cover.peek || a.reload > 0 || this.simTime - a.lastHit < 1.2 || pressure(this, a) > 0.65);
  } else if (threat && a.hp < 30 && stressed) {
    dx = a.x - threat.x;
    dz = a.z - threat.z;
    a.tactic = 'FALL BACK';
  } else {
    const intent = squadCombatIntent(this, a);
    if (intent) {
      dx = intent.point.x - a.x;
      dz = intent.point.z - a.z;
      a.tactic = intent.tactic;
      a.crouched = intent.tactic === 'SUPPRESS';
    }
  }
  // Static flow fields stay the cheap default. Local 3D routing takes over when a
  // route is blocked, a floor differs, or a previous detour is still in progress.
  const navigate =
    !['HOLD COVER', 'TAKE COVER', 'FALL BACK', 'SUPPRESS'].includes(a.tactic) && !brain.task;
  if (navigate) {
    const n = Math.hypot(dx, dz),
      probe = {
        x: a.x + (dx / (n || 1)) * Math.min(n, 2),
        y: a.y,
        z: a.z + (dz / (n || 1)) * Math.min(n, 2),
      };
    if (
      n > 0.4 &&
      (brain.routeUntil > this.simTime ||
        a.stuck > 1 ||
        !walkSegment(this, a, probe) ||
        Math.abs(a.y - this.world.groundAt(a.x, a.z)) > 2)
    ) {
      const observation = a.tactic === 'INVESTIGATE' ? squadContact(this, a) : null;
      const destination =
        observation ??
        (squadPoint ? squadPoint : { x: f.x, y: this.world.groundAt(f.x, f.z), z: f.z });
      const path = routeActor(this, a, destination);
      dx = path.point.x - a.x;
      dz = path.point.z - a.z;
      if (path.status === 'pending') a.tactic = 'ROUTING';
      if (path.status === 'unreachable') a.tactic = 'ROUTE BLOCKED';
    }
  }
  if (a.crouched) a.height = 1.25;
  else if (!this.occupied(a, a.x, a.y, a.z, 0.3, 1.8)) a.height = 1.8;
  else {
    a.height = 1.25;
    a.crouched = true;
  }
  const stop = Math.hypot(dx, dz) < 0.4;
  let l = Math.hypot(dx, dz) || 1;
  dx /= l;
  dz /= l;
  this.neighbours(a.x, a.z, 1.8, (b) => {
    if (b === a || a.y + a.height <= b.y || b.y + b.height <= a.y) return;
    const x = a.x - b.x,
      z = a.z - b.z,
      q = x * x + z * z;
    if (q > 0.001 && q < 2.25) {
      dx += (x / (q + 0.2)) * 0.65;
      dz += (z / (q + 0.2)) * 0.65;
    }
  });
  for (const v of this.vehicles)
    if (v.alive) {
      const x = a.x - v.x,
        z = a.z - v.z,
        l = Math.hypot(x, z);
      if (l < 4 && l > 0.01 && a.y + a.height > v.y && a.y < v.y + v.height) {
        dx += (x / l) * (4 - l) * 2;
        dz += (z / l) * (4 - l) * 2;
      }
    }
  a.dx = a.dz = 0;
  if (!stop || Math.hypot(dx, dz) > 0.5) {
    const base = Math.atan2(dx, dz);
    for (const angle of [0, 0.65, -0.65, 1.3, -1.3, Math.PI]) {
      const x = Math.sin(base + angle),
        z = Math.cos(base + angle);
      if (
        !this.occupied(a, a.x + x * 0.8, a.y, a.z + z * 0.8, 0.3, a.height) ||
        !this.occupied(a, a.x + x * 0.8, a.y + 1.02, a.z + z * 0.8, 0.3, a.height)
      ) {
        a.dx = x;
        a.dz = z;
        break;
      }
    }
  }
  if (!stop && Math.hypot(a.x - a.lastX, a.z - a.lastZ) < 0.15) a.stuck++;
  else a.stuck = 0;
  if (a.stuck > 3 && a.onGround && a.tactic !== 'ROUTING') brain.routeUntil = this.simTime + 4;
  a.lastX = a.x;
  a.lastZ = a.z;
}
export function updateAI(this: Simulation, dt: number) {
  this.navigationBudget = 768;
  refreshNavigation(this);
  updateSquadLeadership(this);
  pruneReservations(this);
  const service = (a: Actor) => {
    const brain = npc_stateModule.npcState(a);
    if (!a.alive || a.player || a.vehicle || brain.nextThink > this.simTime) return false;
    this.think(a);
    // Immediate physical danger owns locomotion; support may not overwrite it.
    if (!npc_stateModule.hazardResponse(this, a)) {
      gameplayModule.aiClassBehaviour(this, a);
      aiEquipment(this, a);
    }
    if (a.crouched) a.height = 1.25;
    else if (!this.occupied(a, a.x, a.y, a.z, 0.3, 1.8)) a.height = 1.8;
    brain.nextThink =
      this.simTime +
      (a.target || brain.task || a.tactic === 'EVADE' ? 0.18 : 0.65) +
      (a.id % 5) * 0.012;
    return true;
  };
  // Separate a reactive quota from fair round-robin service. Distant squads still run.
  let urgent = 0;
  for (let n = 0; n < this.actors.length && urgent < 24; n++) {
    const a = this.actors[this.reactiveCursor++ % this.actors.length],
      b = npc_stateModule.npcState(a);
    if ((a.target || b.task || this.simTime - a.lastHit < 2) && service(a)) urgent++;
  }
  let regular = 0;
  for (let n = 0; n < this.actors.length && regular < 24; n++)
    if (service(this.actors[this.aiCursor++ % this.actors.length])) regular++;
  for (let i = 0; i < this.actors.length; i++) {
    const a = this.actors[i];
    if (a.player) continue;
    if (!a.alive) {
      a.respawn -= dt;
      if (a.respawn <= 0) this.safeSpawn(a);
      continue;
    }
    a.shield = Math.max(0, a.shield - dt);
    combatTick(this, a, dt);
    const speed = a.crouched
      ? 1.6
      : a.tactic === 'FALL BACK' || a.tactic === 'EVADE'
        ? 4.8
        : a.target
          ? 2.5
          : 4.6;
    a.vx = a.dx * speed;
    a.vz = a.dz * speed;
    if (a.x > 249 && a.x < 263 && a.y < 2) {
      a.vx *= 0.5;
      a.vz *= 0.5;
    }
    this.moveBody(a, dt, 0.3, a.height);
    a.walk += Math.hypot(a.vx, a.vz) * dt;
    if (this.simTime - a.lastHit > 12) a.hp = Math.min(100, a.hp + dt * 4);
  }
}
