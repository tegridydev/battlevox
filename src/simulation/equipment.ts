import { weapons } from '../core/config';
import { loadout, primary } from '../core/loadout';
import { direction } from '../core/math';
import { projectileSpec } from '../core/projectiles';
import type { Actor, DamageSource, Deployable, Vec3 } from '../core/types';
import { npcState } from './npc-state';
import { clearSegment, sectionBlocked } from './section-query';
import type { Simulation } from './simulation';
export const equipmentLimits = { smokeClouds: 12, deployables: 24, npcDeployables: 20 } as const;
export function count(sim: Simulation, key: keyof Simulation['testStats'], amount = 1): void {
  sim.testStats[key] += amount;
}
export function needsSupplies(sim: Simulation, a: Actor): boolean {
  if (a.player)
    return (
      loadout(sim).some((id) => sim.reserves[id] < weapons[id].reserve) ||
      sim.grenades < 3 ||
      sim.smokeGrenades < 2
    );
  return (
    a.clip < weapons[a.primaryWeapon].mag * 0.7 ||
    a.secondaryClip < weapons[a.secondaryWeapon].mag ||
    (a.kit === 'engineer' && a.rockets < 3) ||
    a.fragCharges < 2 ||
    a.smokes < 1
  );
}
/** A finite supply pulse. Reserve ammo never silently changes the player's loaded magazine. */
export function refill(sim: Simulation, a: Actor): boolean {
  let useful = false;
  if (a.player) {
    for (const id of loadout(sim)) {
      const before = sim.reserves[id];
      sim.reserves[id] = Math.min(
        weapons[id].reserve,
        before + (id === 2 ? 1 : weapons[id].mag * 2),
      );
      useful ||= before !== sim.reserves[id];
    }
    if (sim.grenades < 3) {
      sim.grenades++;
      useful = true;
    }
    if (sim.smokeGrenades < 2) {
      sim.smokeGrenades++;
      useful = true;
    }
  } else {
    const w = weapons[a.primaryWeapon],
      sw = weapons[a.secondaryWeapon];
    if (a.clip < w.mag * 0.7) {
      a.clip = w.mag;
      a.reload = 0;
      useful = true;
    }
    if (a.secondaryClip < sw.mag) {
      a.secondaryClip = sw.mag;
      a.secondaryReload = 0;
      useful = true;
    }
    if (a.kit === 'engineer' && a.rockets < 3) {
      a.rockets++;
      useful = true;
    }
    if (a.fragCharges < 2) {
      a.fragCharges++;
      useful = true;
    }
    if (a.smokes < 1) {
      a.smokes++;
      useful = true;
    }
  }
  return useful;
}
function supported(sim: Simulation, p: Vec3): boolean {
  return (
    sim.world.solid(p.x, p.y - 0.15, p.z) ||
    sectionBlocked(sim, { ...p, y: p.y - 0.16 }, 0.23, 0.12)
  );
}
export function deploymentStatus(
  sim: Simulation,
  a: Actor,
  kind: Deployable['kind'],
): { position?: Vec3; reason: string } {
  if (
    !a.alive ||
    a.vehicle ||
    a.actionUntil > sim.simTime ||
    !['medical', 'ammo'].includes(kind) ||
    (kind === 'medical' ? a.kit !== 'medic' : a.kit !== 'support') ||
    sim.deployables.length >= equipmentLimits.deployables
  )
    return { reason: 'Equipment unavailable or still readying' };
  if (
    !a.player &&
    (sim.deployables.filter((d) => !d.playerOwned).length >= equipmentLimits.npcDeployables ||
      sim.deployables.some(
        (d) =>
          d.team === a.team &&
          d.kind === kind &&
          d.life > 6 &&
          d.charges > 0 &&
          Math.abs(d.y - a.y) < 3 &&
          Math.hypot(d.x - a.x, d.z - a.z) < 7,
      ))
  )
    return { reason: 'Supplies already cover this area' };
  if (
    sim.deployables.some(
      (d) => d.ownerId === a.id && d.kind === kind && d.life > 0 && d.charges > 0,
    )
  )
    return { reason: 'One active supply per owner' };
  const yaw = a.player ? sim.yaw : a.yaw;
  const x = a.x + Math.sin(yaw) * 0.85,
    z = a.z + Math.cos(yaw) * 0.85;
  // Use the actor's local floor, not groundAt's highest surface (which can be the roof).
  const p = { x, y: a.y, z };
  let placed = false;
  for (const dy of [0, -0.02, 0.02, -1, 1]) {
    p.y = a.y + dy;
    if (
      supported(sim, p) &&
      !sim.occupied(a, x, p.y + 0.025, z, 0.32, 0.48) &&
      clearSegment(sim, { x: a.x, y: a.y + 0.7, z: a.z }, { x, y: p.y + 0.3, z }) &&
      !sim.actors.some(
        (b) =>
          b !== a &&
          b.alive &&
          !b.vehicle &&
          Math.abs(b.y - p.y) < 1 &&
          Math.hypot(b.x - x, b.z - z) < 0.65,
      )
    ) {
      placed = true;
      break;
    }
  }
  return placed ? { position: p, reason: '' } : { reason: 'Clear, supported ground required' };
}
export function deploy(sim: Simulation, a: Actor, kind: Deployable['kind']): boolean {
  const status = deploymentStatus(sim, a, kind),
    p = status.position;
  if (!p) return false;
  const { x, z } = p;
  sim.deployables.push({
    ...p,
    kind,
    ownerId: a.id,
    ownerEpoch: a.lifeEpoch ?? 0,
    playerOwned: a.player,
    team: a.team,
    life: 40,
    age: 0,
    charges: kind === 'medical' ? 18 : 12,
    next: sim.simTime,
    used: new Map(),
  });
  a.actionUntil = sim.simTime + 0.65;
  a.action = kind === 'medical' ? 'DEPLOY MEDICAL' : 'DEPLOY AMMO';
  a.shield = 0;
  count(sim, kind === 'medical' ? 'medicalBags' : 'ammoCrates');
  sim.soundAt('support', x, z, 0.5);
  if (a.player) {
    sim.input.aim = false;
    sim.handling.ready = 0.65;
    sim.notify(kind === 'medical' ? 'Medical bag deployed' : 'Ammo crate deployed');
  }
  return true;
}
export function smoke(sim: Simulation, point: Vec3, source: DamageSource): void {
  if (![point.x, point.y, point.z].every(Number.isFinite)) return;
  // Never lift an indoor cloud to a building's roof. Constrain its centre below nearby ceilings.
  let y = point.y + 1.3;
  for (let t = 0.2; t <= 1.3; t += 0.2)
    if (sim.world.solid(point.x, point.y + t, point.z)) {
      y = point.y + t - 0.2;
      break;
    }
  if (sim.smokeClouds.length >= equipmentLimits.smokeClouds) sim.smokeClouds.shift();
  sim.smokeClouds.push({
    x: point.x,
    y,
    z: point.z,
    life: 14,
    age: 0,
    radius: projectileSpec.smoke.radius,
    team: source?.team ?? -1,
  });
  sim.soundAt('launcher', point.x, point.z, 0.22);
}
export function throwSmoke(sim: Simulation): boolean {
  const p = sim.player;
  if (
    !sim.acceptsInput ||
    p.vehicle ||
    sim.smokeGrenades <= 0 ||
    sim.grenadeTime > 0 ||
    p.actionUntil > sim.simTime
  )
    return false;
  if (
    !sim.launch(
      p,
      { x: p.x, y: p.y + p.height - 0.18, z: p.z },
      direction(sim.yaw, sim.pitch),
      'smoke',
    )
  )
    return false;
  sim.smokeGrenades--;
  sim.grenadeTime = 0.7;
  sim.input.aim = false;
  return true;
}
export function tickEquipment(sim: Simulation, dt: number): void {
  if (!Number.isFinite(dt) || dt <= 0) return;
  for (let i = sim.smokeClouds.length - 1; i >= 0; i--) {
    const c = sim.smokeClouds[i];
    c.age += dt;
    c.life -= dt;
    if (c.life <= 0) sim.smokeClouds.splice(i, 1);
  }
  for (let i = sim.deployables.length - 1; i >= 0; i--) {
    const d = sim.deployables[i];
    d.life -= dt;
    d.age += dt;
    if (d.life > 0 && d.charges > 0 && d.next <= sim.simTime) {
      d.next = sim.simTime + 1;
      if (!supported(sim, d)) d.life = 0;
      else {
        for (const [id, use] of d.used)
          if (use.until <= sim.simTime || !sim.actors[id]) d.used.delete(id);
        sim.neighbours(d.x, d.z, 5, (a) => {
          const last = d.used.get(a.id);
          if (
            !a.alive ||
            a.vehicle ||
            a.team !== d.team ||
            d.charges <= 0 ||
            Math.hypot(a.x - d.x, a.y - d.y, a.z - d.z) > 5 ||
            (last && last.epoch === (a.lifeEpoch ?? 0) && last.until > sim.simTime) ||
            !clearSegment(sim, { x: d.x, y: d.y + 0.5, z: d.z }, { x: a.x, y: a.y + 0.8, z: a.z })
          )
            return;
          let useful = false;
          if (
            d.kind === 'medical' &&
            a.hp < 100 &&
            sim.simTime - a.lastHit > 1.5 &&
            sim.simTime - a.lastMedicalBagAt > 0.95
          ) {
            a.hp = Math.min(100, a.hp + 12);
            a.lastMedicalBagAt = sim.simTime;
            useful = true;
            count(sim, 'heals');
          } else if (d.kind === 'ammo' && sim.simTime - a.lastAmmoBagAt >= 10) {
            useful = refill(sim, a);
            if (useful) {
              a.lastAmmoBagAt = sim.simTime;
              count(sim, 'resupplies');
            }
          }
          if (!useful) return;
          d.charges--;
          d.used.set(a.id, {
            until: sim.simTime + (d.kind === 'ammo' ? 10 : 1),
            epoch: a.lifeEpoch ?? 0,
          });
          const owner = sim.actors[d.ownerId];
          if (
            d.playerOwned &&
            owner?.player &&
            owner !== a &&
            (owner.lifeEpoch ?? 0) === d.ownerEpoch
          )
            sim.award(
              d.kind === 'medical' ? 'FIELD HEAL' : 'FIELD RESUPPLY',
              10,
              d.kind === 'medical' ? 'medkit' : 'ammo_pack',
              d.kind === 'medical' ? 'heals' : 'resupplies',
            );
        });
      }
    }
    if (d.life <= 0 || d.charges <= 0) {
      d.used.clear();
      sim.deployables.splice(i, 1);
    }
  }
}
/** Runs on the fair decision service; no per-frame scan for every equipment user. */
export function aiEquipment(sim: Simulation, a: Actor): void {
  if (a.nextEquipment > sim.simTime || !a.alive || a.vehicle || a.actionUntil > sim.simTime) return;
  a.nextEquipment = sim.simTime + 2 + (a.id % 5) * 0.21;
  const brain = npcState(a);
  if (
    a.smokes > 0 &&
    (brain.task?.kind === 'REVIVE' || (a.hp < 35 && a.target)) &&
    sim.simTime - a.lastSmoke > 25 &&
    !sim.smokeClouds.some((c) => c.life > 2 && Math.hypot(c.x - a.x, c.y - a.y, c.z - a.z) < 12)
  ) {
    const point = brain.task?.target ?? a;
    const distance = Math.hypot(point.x - a.x, point.z - a.z);
    const yaw = distance > 1 ? Math.atan2(point.x - a.x, point.z - a.z) : a.yaw;
    const pitch = distance > 8 ? 0.02 : -0.85;
    if (
      sim.launch(a, { x: a.x, y: a.y + a.height - 0.18, z: a.z }, direction(yaw, pitch), 'smoke')
    ) {
      a.smokes--;
      a.lastSmoke = sim.simTime;
      a.action = 'SMOKE';
      a.actionUntil = sim.simTime + 0.8;
      count(sim, 'smokes');
      return;
    }
  }
  let wounded = 0,
    needAmmo = 0;
  sim.neighbours(a.x, a.z, 6, (b) => {
    if (
      b.team !== a.team ||
      !b.alive ||
      b.vehicle ||
      Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) > 6
    )
      return;
    if (b.hp < 82) wounded++;
    if (
      b.player
        ? sim.reserves[sim.weaponIndex] < weapons[sim.weaponIndex].mag * 2
        : b.clip < weapons[primary[b.kit ?? 'assault']].mag * 0.35 ||
          (b.kit === 'engineer' && b.rockets < 2)
    )
      needAmmo++;
  });
  if (a.kit === 'medic' && wounded && !brain.task && deploy(sim, a, 'medical'))
    a.nextEquipment = sim.simTime + 36;
  else if (a.kit === 'support' && needAmmo && !brain.task && deploy(sim, a, 'ammo'))
    a.nextEquipment = sim.simTime + 38;
  else if (a.kit === 'assault' && a.hp < 60 && sim.simTime - a.lastHit > 3) {
    a.hp = Math.min(100, a.hp + 25);
    a.nextEquipment = sim.simTime + 20;
    a.action = 'FIELD DRESSING';
    a.actionUntil = sim.simTime + 1;
    count(sim, 'dressings');
  }
}
