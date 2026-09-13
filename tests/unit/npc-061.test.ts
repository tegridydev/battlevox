import { expect, test } from 'bun:test';
import { initActorEquipment } from '../../src/core/loadout';
import type { Actor, Kit } from '../../src/core/types';
import { combatTick, grenadeSolution, safeBlast } from '../../src/simulation/combat-ai';
import { aiEquipment } from '../../src/simulation/equipment';
import { npcState } from '../../src/simulation/npc-state';
import { firingPosition } from '../../src/simulation/tactics';
import { smallSimulation } from '../helpers';

function duel(kit: Kit = 'assault') {
  const s = smallSimulation();
  for (const a of s.actors) a.alive = false;
  const a = s.actors[1],
    e = s.actors[10];
  a.kit = kit;
  initActorEquipment(a, 0);
  Object.assign(a, { x: 100, y: 1, z: 100, yaw: Math.PI / 2, alive: true, cool: 0, shield: 0 });
  Object.assign(e, { x: 116, y: 1, z: 100, alive: true, shield: 0 });
  a.target = e;
  a.contact = { x: e.x, y: e.y, z: e.z, until: 100 };
  s.spatial();
  return { s, a, e };
}
function advance(s: ReturnType<typeof smallSimulation>, a: Actor, frames: number) {
  for (let i = 0; i < frames; i++) {
    s.simTime += 1 / 30;
    combatTick(s, a, 1 / 30);
  }
}
test('0.6.1 NPCs draw a sidearm for an empty primary and preserve independent ammunition', () => {
  const { s, a } = duel();
  a.clip = 0;
  a.reload = 2;
  const reserve = a.secondaryClip;
  advance(s, a, 1);
  expect(a.activeWeapon).toBe(a.secondaryWeapon);
  expect(a.secondaryClip).toBe(reserve);
  const remainingReload = a.reload;
  advance(s, a, 18);
  expect(a.secondaryClip).toBeLessThan(reserve);
  expect(a.clip).toBe(0);
  expect(a.reload).toBe(remainingReload);
  expect(s.testStats.sidearmShots).toBeGreaterThan(0);
  s.dispose();
});
test('0.6.1 NPC primary magazines refill only on completed reload, not on reload start', () => {
  const { s, a, e } = duel();
  e.x = 145;
  a.contact!.x = e.x;
  s.spatial();
  a.clip = 0;
  a.cool = 0;
  advance(s, a, 1);
  expect(a.clip).toBe(0);
  expect(a.reload).toBeGreaterThan(2);
  a.target = null;
  advance(s, a, 70);
  expect(a.clip).toBe(30);
  s.dispose();
});
test('0.6.1 friendly lanes withhold bullets without spending ammunition', () => {
  const { s, a } = duel();
  const friend = s.actors[2];
  Object.assign(friend, { alive: true, x: 108, y: 1, z: 100 });
  s.spatial();
  advance(s, a, 20);
  expect(a.clip).toBe(30);
  expect(s.testStats.shotsBlocked).toBeGreaterThan(0);
  s.dispose();
});
test('0.6.1 support work and immediate hazards interrupt combat instead of competing for movement', () => {
  const { s, a } = duel('medic'),
    b = npcState(a);
  b.task = { kind: 'HEAL', target: s.actors[2], phase: 'WORK', until: 10, started: 0 };
  advance(s, a, 12);
  expect(a.clip).toBe(30);
  b.task = null;
  b.avoidUntil = 5;
  a.tactic = 'EVADE';
  advance(s, a, 12);
  expect(a.clip).toBe(30);
  s.dispose();
});
test('0.6.1 engineers aim, protect friendly blast zones and run out of rockets', () => {
  const s = smallSimulation();
  s.battleTeamSize = 10;
  s.startBattle();
  for (const a of s.actors) a.alive = false;
  const a = s.actors[1];
  a.kit = 'engineer';
  initActorEquipment(a, 0);
  Object.assign(a, { alive: true, x: 100, y: 1, z: 100, yaw: Math.PI / 2, shield: 0 });
  for (const v of s.vehicles) v.alive = false;
  const v = s.vehicles[6];
  Object.assign(v, { alive: true, x: 140, y: 1, z: 100, vx: 0, vz: 0 });
  a.armourTarget = v;
  s.spatial();
  advance(s, a, 12);
  expect(s.projectiles).toHaveLength(0);
  expect(a.activeWeapon).toBe(2);
  const ally = s.actors[2];
  Object.assign(ally, { alive: true, x: 138, y: 1, z: 100 });
  s.spatial();
  advance(s, a, 40);
  expect(a.rockets).toBe(3);
  ally.alive = false;
  s.spatial();
  advance(s, a, 30);
  expect(a.rockets).toBe(2);
  expect(s.testStats.rockets).toBe(1);
  advance(s, a, 1100);
  expect(a.rockets).toBe(0);
  expect(s.projectiles.filter((p) => p.type === 'rocket')).toHaveLength(3);
  s.dispose();
});
test('0.6.1 grenade plans account for the full fuse and reject friendly blast areas', () => {
  const { s, a, e } = duel();
  e.x = 120;
  s.spatial();
  const plan = grenadeSolution(s, a, e);
  expect(plan).not.toBeNull();
  expect(Math.hypot(plan!.predicted.x - e.x, plan!.predicted.z - e.z)).toBeLessThan(3.2);
  const ally = s.actors[2];
  Object.assign(ally, { alive: true, x: 120, y: 1, z: 100 });
  s.spatial();
  expect(safeBlast(s, a, e, 7)).toBe(false);
  expect(grenadeSolution(s, a, e)).toBeNull();
  s.dispose();
});
test('0.6.1 medic rescue smoke consumes a charge and leaves the support task intact', () => {
  const { s, a, e } = duel('medic');
  a.target = null;
  e.alive = false;
  const wounded = s.actors[2];
  Object.assign(wounded, { alive: false, x: 105, y: 1, z: 100 });
  const b = npcState(a);
  b.task = { kind: 'REVIVE', target: wounded, phase: 'APPROACH', until: 20, started: 0 };
  s.simTime = 5;
  a.nextEquipment = 0;
  s.spatial();
  aiEquipment(s, a);
  expect(a.smokes).toBe(1);
  expect(s.projectiles.filter((p) => p.type === 'smoke')).toHaveLength(1);
  expect(b.task!.kind).toBe('REVIVE');
  aiEquipment(s, a);
  expect(a.smokes).toBe(1);
  s.dispose();
});
test('0.6.1 equipment work cannot execute repeatedly through a cooldown', () => {
  const { s, a } = duel('assault');
  a.hp = 40;
  a.lastHit = -100;
  a.target = null;
  s.simTime = 8;
  a.nextEquipment = 0;
  aiEquipment(s, a);
  expect(a.hp).toBe(65);
  expect(s.testStats.dressings).toBe(1);
  for (let i = 0; i < 10; i++) aiEquipment(s, a);
  expect(a.hp).toBe(65);
  s.dispose();
});
test('0.6.1 a committed cover position is reused and invalidates when its protection disappears', () => {
  const { s, a, e } = duel();
  const b = npcState(a);
  const point = { x: 100, y: 1, z: 103, peek: true };
  // A waist-high obstacle blocks the low ray but not a standing sightline.
  for (let z = 101; z <= 104; z++) s.world.setRaw(104, 1, z, 4);
  b.position = point;
  b.positionUntil = 5;
  b.nextCoverSearch = 10;
  s.simTime = 1;
  const retained = firingPosition(s, a, e, e);
  expect(retained).toBe(point);
  for (let z = 101; z <= 104; z++) s.world.removeVoxel(104, 1, z);
  expect(firingPosition(s, a, e, e)).toBeNull();
  expect(b.position).toBeNull();
  s.dispose();
});
