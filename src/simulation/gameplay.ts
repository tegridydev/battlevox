import * as mathModule from '../core/math';
import type { Actor, Kit, Vec3, Vehicle } from '../core/types';
import { deploy, needsSupplies, refill } from './equipment';
import { canInteract, repairVehicle } from './interactions';
import { routeActor, walkSegment } from './navigation';
import type { SupportKind } from './npc-state';
import * as npc_stateModule from './npc-state';
import { canSee } from './perception';
import { kitStatus } from './player-actions';
import * as section_queryModule from './section-query';
import type { Simulation } from './simulation';
import { observeContact } from './tactics';
export interface Ping extends Vec3 {
  kind: 'enemy' | 'location';
  team: 0 | 1;
  expires: number;
  targetId?: number;
}
export const squadComposition: Kit[] = [
  'assault',
  'medic',
  'support',
  'engineer',
  'recon',
  'assault',
  'medic',
  'support',
  'engineer',
  'assault',
];
const visible = (sim: Simulation, a: Vec3, b: Vec3, range: number) =>
  mathModule.dist2(a, b) < range * range &&
  canSee(sim, { x: a.x, y: a.y + 1, z: a.z }, { x: b.x, y: b.y + 1, z: b.z });
const nearby = (sim: Simulation, a: Vec3, b: Vec3, range: number) =>
  mathModule.dist2(a, b) < range * range &&
  Math.abs(a.y - b.y) < 3 &&
  section_queryModule.clearSegment(
    sim,
    { x: a.x, y: a.y + 1, z: a.z },
    { x: b.x, y: b.y + 1, z: b.z },
  );
export function revive(sim: Simulation, medic: Actor, target: Actor) {
  if (
    !medic.alive ||
    medic.vehicle ||
    target.alive ||
    target.vehicle ||
    medic.team !== target.team ||
    (target.reviveUntil ?? 0) <= sim.simTime ||
    !canInteract(sim, medic, target, 4)
  )
    return false;
  if (sim.occupied(target, target.x, target.y, target.z, 0.3, 1.8)) return false;
  Object.assign(target, {
    alive: true,
    hp: 50,
    respawn: 0,
    reviveUntil: 0,
    shield: 1.1,
    target: null,
    armourTarget: null,
    vx: 0,
    vy: 0,
    vz: 0,
    lastHit: sim.simTime,
  });
  npc_stateModule.retireNPC(sim, target);
  sim.damageContributions.delete(target.id);
  sim.tickets[target.team] = Math.min(6000, sim.tickets[target.team] + 1);
  if (medic.player) sim.award('REVIVE', 100, 'medkit', 'revives');
  if (target.player) {
    sim.notify('REVIVED BY YOUR MEDIC', target.team);
    sim.events.push({ type: 'revived' });
  }
  sim.soundAt('support', target.x, target.z, 0.4);
  return true;
}
export function healFriendly(sim: Simulation, medic: Actor, target: Actor) {
  if (
    medic.vehicle ||
    target.vehicle ||
    !medic.alive ||
    !target.alive ||
    target.hp >= 95 ||
    medic.team !== target.team ||
    medic === target ||
    !canInteract(sim, medic, target, 4)
  )
    return false;
  const amount = Math.min(35, 100 - target.hp);
  target.hp += amount;
  if (medic.player) sim.award('TEAM HEAL', Math.round(amount), 'medkit', 'heals');
  if (target.player) sim.notify('MEDIC · HEALTH RESTORED', target.team);
  sim.soundAt('support', target.x, target.z, 0.25);
  return true;
}
export function resupply(sim: Simulation, support: Actor, target: Actor) {
  if (
    !support.alive ||
    support.vehicle ||
    !target.alive ||
    target.team !== support.team ||
    target === support ||
    !canInteract(sim, support, target, 5) ||
    (target.lastResupply ?? -100) > sim.simTime - 15
  )
    return false;
  const useful = refill(sim, target);
  if (!useful) return false;
  target.lastResupply = sim.simTime;
  if (support.player) sim.award('AMMO RESUPPLY', 35, 'ammo_pack', 'resupplies');
  if (target.player) sim.notify('SUPPORT · AMMUNITION REPLENISHED', target.team);
  return true;
}
function squadTargets(sim: Simulation, a: Actor) {
  return (sim.squads[a.squadId]?.memberIds ?? [])
    .map((i) => sim.actors[i])
    .filter((t) => t && t !== a);
}
export function classAbility(this: Simulation) {
  const p = this.player,
    q = kitStatus(this);
  if (!q.available) {
    if (this.acceptsInput) this.notify(q.reason);
    return;
  }
  if (q.action === 'revive' || q.action === 'heal') {
    const did =
      q.action === 'revive' ? revive(this, p, q.target!) : healFriendly(this, p, q.target!);
    if (did) this.classClock = 5 * (this.itemTuning.medkit ?? 1);
  } else if (q.action === 'medical' || q.action === 'ammo') {
    if (deploy(this, p, q.action))
      this.classClock = 8 * (this.itemTuning[q.action === 'medical' ? 'medkit' : 'ammo_pack'] ?? 1);
  } else if (q.action === 'resupply') {
    if (resupply(this, p, q.target!)) this.classClock = 6 * (this.itemTuning.ammo_pack ?? 1);
  } else if (q.action === 'repair' || q.action === 'fortify') this.fortify();
  else if (q.action === 'dress') this.heal();
  else if (q.action === 'spot') {
    let marked = 0;
    this.neighbours(p.x, p.z, 90, (a) => {
      if (marked < 3 && a.alive && a.team !== p.team && visible(this, p, a, 90)) {
        this.pingAt(a, a.id);
        marked++;
      }
    });
    if (marked) this.classClock = 16 * (this.itemTuning.spotter ?? 1);
  }
}

export function aiClassBehaviour(sim: Simulation, a: Actor) {
  if (!a.alive || a.vehicle) return;
  const brain = npc_stateModule.npcState(a);
  const reservations = npc_stateModule.supportReservationsFor(sim);
  const own = (target: Actor | Vehicle) => {
    const reservation = reservations.get(target);
    return (
      !reservation ||
      reservation.actor === a ||
      reservation.until < sim.simTime ||
      !reservation.actor.alive ||
      sim.actors[reservation.actor.id] !== reservation.actor
    );
  };
  // Danger interrupts the task, whereas an ability cooldown does not cancel its approach.
  if (sim.simTime - a.lastHit < 1.1 || (a.target && mathModule.dist2(a, a.target) < 100)) {
    if (brain.task) reservations.delete(brain.task.target);
    brain.task = null;
    brain.reason = 'Immediate threat takes priority';
    return;
  }
  let task = brain.task;
  if (task) {
    const target = task.target;
    const complete =
      task.kind === 'REVIVE'
        ? 'reviveUntil' in target
          ? target.alive || (target.reviveUntil ?? 0) <= sim.simTime
          : true
        : !target.alive ||
          (task.kind === 'HEAL' && target.hp >= 95) ||
          (task.kind === 'REPAIR' && target.hp >= 595);
    if (complete || task.until < sim.simTime || mathModule.dist2(a, target) > 900 || !own(target)) {
      if (own(target)) reservations.delete(target);
      brain.task = task = null;
    }
  }
  if (!task && sim.simTime >= (a.supportReady ?? 0)) {
    const team = squadTargets(sim, a).filter(
      (t) => mathModule.dist2(a, t) < 484 && Math.abs(a.y - t.y) < 21 && own(t),
    );
    let target: Actor | Vehicle | undefined,
      kind: SupportKind = 'HEAL';
    if (a.kit === 'medic') {
      target = team
        .filter(
          (t) =>
            !t.alive &&
            (t.reviveUntil ?? 0) >
              sim.simTime +
                0.85 +
                Math.sqrt(mathModule.dist2(a, t)) / 4.6 +
                Math.abs(a.y - t.y) * 0.24,
        )
        .sort((x, y) => mathModule.dist2(a, x) - mathModule.dist2(a, y))[0];
      if (target) kind = 'REVIVE';
      else target = team.filter((t) => t.alive && t.hp < 72).sort((x, y) => x.hp - y.hp)[0];
    } else if (a.kit === 'engineer' && !a.armourTarget) {
      target = sim.vehicles
        .filter(
          (v) =>
            v.alive &&
            v.team === a.team &&
            v.hp < 480 &&
            mathModule.dist2(a, v) < 625 &&
            Math.abs(v.y - a.y) < 2.5 &&
            own(v),
        )
        .sort((x, y) => mathModule.dist2(a, x) - mathModule.dist2(a, y))[0];
      kind = 'REPAIR';
    } else if (a.kit === 'support') {
      target = team.find(
        (t) => t.alive && (t.lastResupply ?? -100) < sim.simTime - 15 && needsSupplies(sim, t),
      );
      kind = 'RESUPPLY';
    }
    if (target) {
      task = { kind, target, phase: 'APPROACH', until: sim.simTime + 10, started: 0 };
      brain.task = task;
      reservations.set(target, { actor: a, until: task.until });
    }
  }
  if (task) {
    const target = task.target,
      d = Math.sqrt(mathModule.dist2(a, target)),
      range = task.kind === 'REPAIR' ? 4.5 : 2.8;
    brain.reason = task.kind + ' / ' + task.phase;
    if (d < range && nearby(sim, a, target, range + 0.3)) {
      a.dx = a.dz = 0;
      a.tactic = task.kind;
      task.phase = 'WORK';
      if (!a.crouched) {
        a.crouched = true;
        a.height = 1.25;
      }
      if (!task.started) task.started = sim.simTime;
      if (sim.simTime - task.started < 0.85 || sim.simTime < (a.supportReady ?? 0)) return;
      let done = false;
      if (task.kind === 'REVIVE') {
        done = 'id' in target && revive(sim, a, target);
        if (done) sim.testStats.revives++;
      } else if (task.kind === 'HEAL') {
        done = 'id' in target && healFriendly(sim, a, target);
        if (done) sim.testStats.heals++;
      } else if (task.kind === 'RESUPPLY') {
        done = 'id' in target && resupply(sim, a, target);
        if (done) sim.testStats.resupplies++;
      } else if (!('id' in target)) {
        done = repairVehicle(sim, a, target, 80);
        if (done) sim.testStats.repairs++;
      }
      if (done) {
        a.supportReady = sim.simTime + 4;
        reservations.delete(target);
        brain.task = null;
        brain.reason = task.kind + ' complete';
      }
      return;
    }
    task.started = 0;
    task.phase = 'APPROACH';
    let point: Vec3 = target;
    if (!walkSegment(sim, a, target)) {
      const path = routeActor(sim, a, target);
      task.phase = 'ROUTE';
      if (
        path.status === 'pending' ||
        path.status === 'unreachable' ||
        mathModule.dist2(a, path.point) < 0.02
      ) {
        a.dx = a.dz = 0;
        a.tactic = task.kind + ' / ROUTE';
        if (path.status === 'unreachable')
          npc_stateModule.cancelSupportTask(sim, a, 'No reachable support route');
        return;
      }
      point = path.point;
    }
    const angle = Math.atan2(point.x - a.x, point.z - a.z);
    a.dx = a.dz = 0;
    for (const offset of [0, 0.55, -0.55, 1.1, -1.1]) {
      const dx = Math.sin(angle + offset),
        dz = Math.cos(angle + offset);
      if (!sim.occupied(a, a.x + dx * 0.9, a.y, a.z + dz * 0.9, 0.34, a.height)) {
        a.dx = dx;
        a.dz = dz;
        break;
      }
    }
    a.tactic = task.kind + ' / MOVE';
    return;
  }
  if (
    a.kit === 'recon' &&
    a.target?.alive &&
    sim.simTime >= (a.supportReady ?? 0) &&
    visible(sim, a, a.target, 95)
  ) {
    const target = a.target;
    observeContact(sim, a, target);
    const existing = sim.pings.find((p) => p.team === a.team && p.targetId === target.id);
    if (existing)
      Object.assign(existing, { x: target.x, y: target.y, z: target.z, expires: sim.simTime + 8 });
    if (!sim.pings.some((p) => p.team === a.team && p.targetId === target.id)) {
      sim.pings.push({
        x: target.x,
        y: target.y,
        z: target.z,
        kind: 'enemy',
        team: a.team,
        expires: sim.simTime + 8,
        targetId: target.id,
      });
      if (sim.pings.length > 32) sim.pings.shift();
    }
    a.supportReady = sim.simTime + 8;
    brain.reason = 'Observed enemy reported to squad';
  }
}
export function pingAt(this: Simulation, point: Vec3, targetId?: number) {
  const p = this.player;
  const target = targetId === undefined ? undefined : this.actors[targetId];
  if (!p.alive || !this.playing || ![point.x, point.y, point.z].every(Number.isFinite))
    return false;
  if (target && (!target.alive || target.team === p.team || !visible(this, p, target, 125)))
    return false;
  const existing = this.pings.find(
    (q) => q.team === p.team && q.targetId !== undefined && q.targetId === targetId,
  );
  if (existing) {
    Object.assign(existing, { x: point.x, y: point.y, z: point.z, expires: this.simTime + 10 });
    return true;
  }
  this.pings.push({
    x: point.x,
    y: point.y,
    z: point.z,
    team: p.team,
    kind: target ? 'enemy' : 'location',
    targetId,
    expires: this.simTime + 10,
  });
  if (target && (this.spotCooldowns.get(target.id) ?? -100) < this.simTime - 30) {
    this.spotCooldowns.set(target.id, this.simTime);
    this.award('ENEMY SPOTTED', 10, 'spotter', 'spots');
  }
  if (this.pings.length > 16) this.pings.shift();
  this.soundAt('ping', p.x, p.z, 0.3);
  return true;
}
export function ping(this: Simulation) {
  if (!this.acceptsInput || this.simTime < this.nextPing) return;
  this.nextPing = this.simTime + 1;
  const p = this.player,
    o = { x: p.x, y: p.y + 1.5, z: p.z },
    d = mathModule.direction(this.yaw, this.pitch),
    wall = this.world.raycast(o, d, 125);
  let nearest = wall?.t ?? 125,
    target: Actor | undefined;
  for (const a of this.rayActors(o, d, nearest))
    if (a.alive && a.team !== p.team) {
      const t = this.rayBox(o, d, { x: a.x, y: a.y + 1, z: a.z, xr: 1.0, yr: 1, zr: 1.0 });
      if (t < nearest) {
        nearest = t;
        target = a;
      }
    }
  this.pingAt(
    target ?? { x: o.x + d.x * nearest, y: o.y + d.y * nearest, z: o.z + d.z * nearest },
    target?.id,
  );
}
export function updateStrategy(sim: Simulation) {
  if (sim.testArena === 'frontline') return;
  if (sim.simTime < sim.nextStrategy) return;
  sim.nextStrategy = sim.simTime + 1;
  const loads = [new Int16Array(9), new Int16Array(9)];
  for (const q of sim.squads) loads[q.team][q.route]++;
  for (let i = 0; i < 10 && sim.squads.length; i++) {
    const q = sim.squads[sim.strategyCursor++ % sim.squads.length];
    if (q.order.kind !== 'objective' || q.leaderId === sim.player.id) continue;
    const leader = sim.actors[q.leaderId];
    if (!leader?.alive) continue;
    let goal = q.route,
      best = Infinity;
    for (let j = 0; j < 9; j++) {
      const f = sim.world.flags[j],
        score =
          Math.sqrt(mathModule.dist2(leader, f)) * 0.14 +
          loads[q.team][j] * 10 +
          (f.owner === q.team ? (f.contested ? -35 : 30) : f.owner < 0 ? -15 : -35) +
          (j === q.route ? -14 : 0) +
          ((q.id * 7 + j * 3) % 5);
      if (score < best) {
        best = score;
        goal = j;
      }
    }
    loads[q.team][q.route]--;
    q.route = goal;
    loads[q.team][goal]++;
  }
}
