import { weapons } from '../core/config';
import { angleWrap, clamp, direction } from '../core/math';
import { projectileSpec } from '../core/projectiles';
import type { Actor, Vec3 } from '../core/types';
import { count } from './equipment';
import { friendlyLane, npcState, pressure, retentionRange } from './npc-state';
import { canSee } from './perception';
import { predictGrenade } from './projectile-flight';
import { muzzleCollision } from './projectile-sweep';
import type { Simulation } from './simulation';
import { yieldFiringLane } from './tactics';

const distance = (a: Vec3, b: Vec3) => Math.hypot(a.x - b.x, a.z - b.z);
/** Conservative even when friendly fire is disabled: explosives must not be aimed through allies. */
export function safeBlast(sim: Simulation, a: Actor, point: Vec3, radius = 7): boolean {
  if (Math.hypot(a.x - point.x, a.y + 0.8 - point.y, a.z - point.z) <= radius + 3) return false;
  let safe = true;
  sim.neighbours(point.x, point.z, radius + 1, (b) => {
    if (
      b !== a &&
      b.alive &&
      b.team === a.team &&
      Math.hypot(b.x - point.x, b.y + 0.8 - point.y, b.z - point.z) < radius + 0.4
    )
      safe = false;
  });
  return (
    safe &&
    !sim.vehicles.some(
      (v) =>
        v.alive &&
        v.team === a.team &&
        Math.hypot(v.x - point.x, v.y + 1 - point.y, v.z - point.z) < radius + v.radius,
    )
  );
}
export interface GrenadePlan {
  o: Vec3;
  dir: Vec3;
  predicted: Vec3;
}
/** Predict the complete fuse, including bounces, with the same integration as the live projectile. */
export function grenadeSolution(sim: Simulation, a: Actor, target: Vec3): GrenadePlan | null {
  const o = { x: a.x, y: a.y + a.height - 0.18, z: a.z },
    range = distance(o, target);
  if (range < 12 || range > 26) return null;
  const yaw = Math.atan2(target.x - o.x, target.z - o.z);
  let best: GrenadePlan | null = null,
    error = 3.1;
  for (let i = 0; i <= 16; i++) {
    const dir = direction(yaw, -0.2 + i * 0.085);
    const muzzle = { x: o.x + dir.x * 0.35, y: o.y + dir.y * 0.35, z: o.z + dir.z * 0.35 };
    if (muzzleCollision(sim, o, muzzle, a)) continue;
    const predicted = predictGrenade(sim, o, dir);
    if (!predicted) continue;
    const score = Math.hypot(
      predicted.x - target.x,
      predicted.y - target.y - 0.2,
      predicted.z - target.z,
    );
    if (score < error && safeBlast(sim, a, predicted, 7)) {
      error = score;
      best = { o, dir, predicted };
      if (error < 0.8) break;
    }
  }
  return best;
}
function equipNPC(a: Actor, weapon: number, now: number): void {
  if (a.activeWeapon === weapon) return;
  a.activeWeapon = weapon;
  a.weaponReady = now + (weapon === 2 ? 0.6 : 0.22);
}
export function combatTick(sim: Simulation, a: Actor, dt: number): void {
  if (!a.alive || a.player || a.vehicle || !Number.isFinite(dt) || dt <= 0) return;
  const brain = npcState(a),
    primary = a.primaryWeapon,
    secondary = a.secondaryWeapon;
  a.cool = Math.max(-0.1, a.cool - dt);
  if (a.reload > 0 && (a.activeWeapon === primary || !a.target)) {
    a.reload = Math.max(0, a.reload - dt);
    if (a.reload === 0) a.clip = weapons[primary].mag;
  }
  if (a.secondaryReload > 0 && (a.activeWeapon === secondary || (!a.target && a.reload <= 0))) {
    a.secondaryReload = Math.max(0, a.secondaryReload - dt);
    if (a.secondaryReload === 0) a.secondaryClip = weapons[secondary].mag;
  }
  if (
    a.target &&
    (!a.target.alive || a.target.vehicle || distance(a, a.target) > retentionRange(a))
  )
    a.target = null;
  if (brain.avoidUntil > sim.simTime && (a.tactic === 'EVADE' || a.tactic === 'BRACE')) return;
  if (a.actionUntil > sim.simTime) {
    a.dx *= 0.45;
    a.dz *= 0.45;
    return;
  }
  a.action = '';
  if (brain.task?.phase === 'WORK') return;
  const eye = { x: a.x, y: a.y + a.height - 0.22, z: a.z },
    vehicle = a.armourTarget;
  if (
    a.kit === 'engineer' &&
    a.rockets > 0 &&
    vehicle?.alive &&
    !brain.task &&
    a.nextRocket <= sim.simTime
  ) {
    const range = distance(a, vehicle),
      target = { x: vehicle.x, y: vehicle.y + vehicle.height * 0.55, z: vehicle.z };
    if (
      range > 13 &&
      range < 90 &&
      safeBlast(sim, a, target, 6) &&
      !friendlyLane(sim, a, target, 0.9) &&
      canSee(sim, eye, target)
    ) {
      equipNPC(a, 2, sim.simTime);
      const yaw = Math.atan2(target.x - a.x, target.z - a.z);
      a.yaw += clamp(angleWrap(yaw - a.yaw), -2.4 * dt, 2.4 * dt);
      if (brain.rocketTarget !== vehicle) {
        brain.rocketTarget = vehicle;
        brain.rocketReady = sim.simTime + 0.75;
      }
      a.tactic = 'ANTI ARMOUR';
      a.dx = a.dz = 0;
      brain.reason = 'Aiming at visible armour';
      if (
        sim.simTime >= Math.max(brain.rocketReady, a.weaponReady) &&
        Math.abs(angleWrap(yaw - a.yaw)) < 0.08
      ) {
        const flight = range / projectileSpec.rocket.speed;
        target.x += vehicle.vx * flight;
        target.z += vehicle.vz * flight;
        const reach = distance(a, target),
          dy = target.y - eye.y + 0.5 * projectileSpec.rocket.gravity * flight * flight;
        if (
          safeBlast(sim, a, target, 6) &&
          canSee(sim, eye, target) &&
          !friendlyLane(sim, a, target, 0.9) &&
          sim.launch(
            a,
            eye,
            direction(Math.atan2(target.x - a.x, target.z - a.z), Math.atan2(dy, reach)),
          )
        ) {
          a.rockets--;
          a.nextRocket = sim.simTime + 7 + (a.id % 4);
          a.actionUntil = sim.simTime + 1;
          a.action = 'ROCKET';
          a.cool = 1;
          count(sim, 'rockets');
          brain.rocketTarget = null;
        }
      }
      return;
    }
  }
  brain.rocketTarget = null;
  const target = a.target,
    range = target ? distance(a, target) : Infinity;
  const emergency =
    !!target && range < 24 && a.clip <= 0 && a.secondaryClip > 0 && a.secondaryReload <= 0;
  equipNPC(a, emergency ? secondary : primary, sim.simTime);
  if (emergency) {
    a.tactic = 'SIDEARM';
    brain.reason = 'Primary empty at close range';
  }
  if (a.clip <= 0 && a.reload <= 0) a.reload = weapons[primary].reload;
  if (a.secondaryClip <= 0 && a.secondaryReload <= 0) a.secondaryReload = weapons[secondary].reload;
  if (!target) {
    if (Math.abs(a.dx) + Math.abs(a.dz) > 0.1)
      a.yaw += clamp(angleWrap(Math.atan2(a.dx, a.dz) - a.yaw), -4 * dt, 4 * dt);
    return;
  }
  const contact = a.contact;
  if (!contact || contact.until <= sim.simTime) {
    a.target = null;
    return;
  }
  const yaw = Math.atan2(contact.x - a.x, contact.z - a.z);
  a.yaw += clamp(angleWrap(yaw - a.yaw), -2.7 * dt, 2.7 * dt);
  const id = a.activeWeapon,
    weapon = weapons[id],
    sidearm = id === secondary;
  if (
    a.cool > 0 ||
    (sidearm ? a.secondaryReload : a.reload) > 0 ||
    (sidearm ? a.secondaryClip : a.clip) <= 0 ||
    sim.simTime < Math.max(brain.reactionAt, a.weaponReady) ||
    Math.abs(angleWrap(yaw - a.yaw)) > 0.13
  )
    return;
  const end = { x: target.x, y: target.y + Math.min(1.1, target.height - 0.18), z: target.z };
  if (range > weapon.range || !canSee(sim, eye, end)) {
    a.target = null;
    a.cool = 0.2;
    return;
  }
  if (friendlyLane(sim, a, end)) {
    brain.blockedShots++;
    count(sim, 'shotsBlocked');
    a.cool = 0.16;
    brain.positionUntil = 0;
    yieldFiringLane(sim, a, end);
    return;
  }
  brain.blockedSince = -1;
  if (
    a.fragCharges > 0 &&
    a.nextFrag <= sim.simTime &&
    range > 12 &&
    range < 26 &&
    safeBlast(sim, a, end, 7)
  ) {
    let group = 0;
    sim.neighbours(target.x, target.z, 5, (e) => {
      if (
        e.alive &&
        e.team !== a.team &&
        distance(e, target) < 5 &&
        canSee(sim, eye, { x: e.x, y: e.y + 1, z: e.z })
      )
        group++;
    });
    if (
      (group >= 2 || target.crouched) &&
      sim.ballisticBudget > 0 &&
      sim.projectiles.filter((p) => p.type === 'grenade' && p.source?.team === a.team).length < 3
    ) {
      sim.ballisticBudget--;
      const plan = grenadeSolution(sim, a, target);
      if (plan && sim.launch(a, plan.o, plan.dir, 'grenade')) {
        a.fragCharges--;
        a.nextFrag = sim.simTime + 22 + (a.id % 8);
        a.actionUntil = sim.simTime + 0.7;
        a.action = 'FRAG';
        a.cool = 0.8;
        count(sim, 'grenades');
        return;
      }
    }
    a.nextFrag = sim.simTime + 3;
  }
  const spread =
    ((sidearm ? 0.028 : 0.016) + range * (id === 3 ? 0.00026 : 0.00052)) *
    (a.crouched ? 0.7 : 1) *
    (sim.simTime - a.lastHit < 1.2 ? 1.4 : 1) *
    (1 + pressure(sim, a) * 1.4);
  sim.bullet(
    a,
    eye,
    direction(
      a.yaw + sim.world.rnd(-spread, spread),
      Math.atan2(end.y - eye.y, range) + sim.world.rnd(-spread, spread),
    ),
    weapon.damage * (sidearm ? 0.8 : id === 3 ? 0.78 : 0.82),
  );
  if (sidearm) {
    a.secondaryClip--;
    count(sim, 'sidearmShots');
  } else a.clip--;
  a.shield = 0;
  if (--a.burst <= 0) {
    a.burst = 3 + (a.id % 3);
    a.cool = 0.6 + sim.world.rand() * 0.7;
  } else
    a.cool =
      Math.max(weapon.delay * 1.35, id === 1 ? 0.16 : id === 3 ? 0.85 : sidearm ? 0.24 : 0.23) +
      sim.world.rand() * 0.1;
}
