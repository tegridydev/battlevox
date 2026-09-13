import { expect, test } from 'bun:test';
import { destructionLimits, STEP } from '../../src/core/config';
import { aiClassBehaviour } from '../../src/simulation/gameplay';
import {
  acquisitionRange,
  hazardResponse,
  nearMiss,
  npcState,
  pressure,
  reservationCount,
  retentionRange,
  supportReservationsFor,
} from '../../src/simulation/npc-state';
import { muzzleCollision } from '../../src/simulation/projectile-sweep';
import { processFractures, queueImpact } from '../../src/simulation/section-fracture';
import { damageSection, sectionBlocked } from '../../src/simulation/section-query';
import { enterVehicle } from '../../src/simulation/vehicle-state';
import { smallSimulation, towerGround } from '../helpers';

function armour(s: ReturnType<typeof smallSimulation>, x = 36, y = 1, z = 30) {
  const v = {
    x,
    y,
    z,
    vx: 0,
    vy: 0,
    vz: 0,
    ix: 0,
    iz: 0,
    yaw: 0,
    turret: 0,
    pitch: 0,
    team: 0 as const,
    isVehicle: true as const,
    height: 1.95,
    radius: 1.85,
    hp: 300,
    alive: true,
    respawn: 0,
    cool: 0,
    driver: null,
    goal: 4,
    homeX: x,
    homeZ: z,
    stuck: 0,
    reverse: 0,
    target: null,
    onGround: true,
  };
  s.vehicles.push(v);
  return s.vehicles[s.vehicles.length - 1];
}
const drainFractures = (s: ReturnType<typeof smallSimulation>, n = 100) => {
  for (let i = 0; i < n; i++) processFractures(s);
};

test('0.6 partial terrain integrity changes invalidate the owning structural revision', () => {
  const s = smallSimulation();
  towerGround(s.world);
  s.world.cityTower(100, 100, 24, 24, 3, 0);
  const b = s.world.buildings[0];
  b.dirty = false;
  const before = b.rev;
  let point: { x: number; y: number; z: number } | undefined;
  for (let z = 100; z < 124 && !point; z++)
    for (let x = 100; x < 124 && !point; x++)
      if (s.world.cell(x, 5, z) === 4) point = { x, y: 5, z };
  expect(Boolean(point)).toBe(true);
  const p = point!;
  s.world.damageVoxel(p.x, p.y, p.z, 60);
  expect(s.world.damage.get(s.world.index(p.x, p.y, p.z))).toBe(60);
  expect(b.dirty).toBe(true);
  expect(b.rev).toBeGreaterThan(before);
});

test('0.6 fragment publication preserves per-voxel damage and stable identity', () => {
  const s = smallSimulation();
  s.spawnRubble(
    [0, 1, 2].map((x) => ({ x: 100 + x, y: 20, z: 100, material: 4 })),
    undefined,
    true,
  );
  const body = s.rubble[0],
    id = body.voxels[0].id;
  damageSection(body, 0, 60);
  damageSection(body, 1, 1000);
  drainFractures(s);
  expect(s.rubble).toHaveLength(2);
  const child = s.rubble.find((b) => b.voxels.some((v) => v.id === id))!;
  const i = child.voxels.findIndex((v) => v.id === id);
  expect(child.damage!.get(child.voxels[i])).toBe(60);
  damageSection(child, i, 40);
  expect(child.voxels).toHaveLength(0);
});

test('0.6 capacity-blocked connectivity retries when fragment slots become available', () => {
  const s = smallSimulation();
  s.spawnRubble(
    [0, 1, 2].map((x) => ({ x: 100 + x, y: 20, z: 100, material: 4 })),
    undefined,
    true,
  );
  const body = s.rubble[0];
  for (let i = 0; i < destructionLimits.rubbleBodies; i++)
    s.spawnRubble([{ x: 200 + i, y: 30, z: 200, material: 4 }]);
  damageSection(body, 1, 1000);
  drainFractures(s);
  expect(body.connectivityDirty).toBe(true);
  s.rubble.splice(1, 4);
  drainFractures(s);
  expect(s.rubble.includes(body)).toBe(false);
  expect(s.rubble.filter((b) => b.x < 110)).toHaveLength(2);
});

test('0.6 rotated section corners use exact actor narrow-phase geometry', () => {
  const s = smallSimulation();
  s.spawnRubble([{ x: 100, y: 1, z: 100, material: 4 }], undefined, true);
  const b = s.rubble[0];
  b.yaw = Math.PI / 4;
  expect(sectionBlocked(s, { x: 101.12, y: 1, z: 101.12 }, 0.08, 0.9)).toBe(false);
  expect(sectionBlocked(s, { x: 100.5, y: 1, z: 100.5 }, 0.2, 0.9)).toBe(true);
});

test('0.6 all projectile muzzles sweep cover and exclude the owning vehicle', () => {
  const s = smallSimulation();
  for (const a of s.actors) a.alive = false;
  s.player.alive = true;
  const v = armour(s, 50.5, 1, 50.5);
  enterVehicle(s.player, v);
  const from = { x: 50.5, y: 3.35, z: 50.5 },
    to = { x: 53.3, y: 3.35, z: 50.5 };
  expect(muzzleCollision(s, from, to, s.player)).toBeNull();
  s.world.setRaw(52, 3, 50, 4);
  expect(muzzleCollision(s, from, to, s.player)!.x).toBeLessThan(52);
  expect(s.launch(s.player, to, { x: 1, y: 0, z: 0 }, 'shell')).toBe(true);
  expect(s.projectiles).toHaveLength(0);
  expect(s.launch(s.player, from, { x: 0, y: 0, z: 0 }, 'rocket')).toBe(false);
});

test('0.6 player repair respects walls, vertical reach and on-foot restrictions', () => {
  const s = smallSimulation();
  s.activeKit = 'engineer';
  s.player.kit = 'engineer';
  s.player.x = 30;
  s.player.z = 30;
  const v = armour(s, 34, 1, 30);
  s.world.setRaw(32, 1, 30, 4);
  s.world.setRaw(32, 2, 30, 4);
  s.fortify();
  expect(v.hp).toBe(300);
  s.world.removeVoxel(32, 1, 30);
  s.world.removeVoxel(32, 2, 30);
  s.player.y = 21;
  s.abilityClock = 0;
  s.fortify();
  expect(v.hp).toBe(300);
  s.player.y = 1;
  s.abilityClock = 0;
  enterVehicle(s.player, v);
  s.fortify();
  expect(v.hp).toBe(300);
  s.safeSpawn(s.player, true, { x: 30, y: 1, z: 30 });
  expect(s.player.vehicle).toBeNull();
  expect(v.driver).toBeNull();
  s.activeKit = 'engineer';
  s.abilityClock = 0;
  s.fortify();
  expect(v.hp).toBe(460);
});

test('0.6 respot updates observed coordinates without awarding duplicate spot XP', () => {
  const s = smallSimulation(),
    target = s.actors[10];
  target.x = 50;
  target.z = 30;
  s.pingAt(target, target.id);
  const score = s.score;
  target.x = 60;
  s.simTime = 1;
  s.pingAt(target, target.id);
  expect(s.pings[0].x).toBe(60);
  expect(s.score).toBe(score);
  expect(s.pings).toHaveLength(1);
});

test('0.6 NPC magazines and recon acquisition/retention share their weapon contracts', () => {
  const s = smallSimulation();
  expect(s.actors[2].clip).toBe(60);
  expect(s.actors[4].clip).toBe(8);
  const recon = s.actors[4];
  expect(acquisitionRange(recon)).toBe(90);
  expect(retentionRange(recon)).toBeGreaterThan(90);
  recon.x = 100;
  recon.z = 100;
  recon.yaw = Math.PI / 2;
  const target = s.actors[10];
  target.x = 185;
  target.z = 100;
  for (const a of s.actors) if (a !== recon && a !== target) a.alive = false;
  s.spatial();
  s.think(recon);
  expect(recon.target).toBe(target);
  npcState(recon).nextThink = 100;
  s.updateAI(STEP);
  expect(recon.target).toBe(target);
});

test('0.6 support work completes after approach and releases its reservation', () => {
  const s = smallSimulation();
  s.createSquads();
  const medic = s.actors[1],
    target = s.actors[2];
  medic.x = 100;
  target.x = 102;
  medic.z = target.z = 100;
  target.hp = 30;
  for (const a of s.actors) if (a !== medic && a !== target) a.alive = false;
  s.simTime = 1;
  aiClassBehaviour(s, medic);
  expect(npcState(medic).task?.phase).toBe('WORK');
  expect(reservationCount(s)).toBe(1);
  s.simTime = 2;
  aiClassBehaviour(s, medic);
  expect(target.hp).toBe(65);
  expect(reservationCount(s)).toBe(0);
  expect(npcState(medic).task).toBeNull();
});

test('0.6 hazard interruption cancels aid ownership and opaque cover occludes grenade danger', () => {
  const s = smallSimulation(),
    a = s.actors[1],
    target = s.actors[2];
  a.x = 100;
  a.z = 100;
  target.x = 110;
  target.z = 100;
  npcState(a).task = { kind: 'HEAL', target, phase: 'APPROACH', until: 10, started: 0 };
  supportReservationsFor(s).set(target, { actor: a, until: 10 });
  s.projectiles.push({
    x: 104,
    y: 2,
    z: 100,
    vx: 0,
    vy: 0,
    vz: 0,
    type: 'grenade',
    life: 1,
    source: null,
  });
  for (let y = 1; y < 4; y++) s.world.setRaw(102, y, 100, 4);
  expect(hazardResponse(s, a)).toBe(false);
  expect(reservationCount(s)).toBe(1);
  for (let y = 1; y < 4; y++) s.world.removeVoxel(102, y, 100);
  expect(hazardResponse(s, a)).toBe(true);
  expect(reservationCount(s)).toBe(0);
  expect(npcState(a).task).toBeNull();
});

test('0.6 near-miss pressure is shot-derived and decays without hidden target tracking', () => {
  const s = smallSimulation(),
    enemy = s.actors[10];
  enemy.x = 45;
  enemy.z = 31;
  s.spatial();
  nearMiss(s, s.player, { x: 30, y: 2, z: 30 }, { x: 60, y: 2, z: 30 });
  const value = pressure(s, enemy);
  expect(value).toBeGreaterThan(0);
  s.simTime = 10;
  expect(pressure(s, enemy)).toBeLessThan(value * 0.01);
});

test('0.6 effects limits do not alter the gameplay RNG stream', () => {
  const a = smallSimulation(),
    b = smallSimulation();
  a.effectSeed = b.effectSeed = 123;
  for (let i = 0; i < 421; i++) a.emitParticle(30, 1, 30, [1, 1, 1]);
  expect(a.world.rand()).toBe(b.world.rand());
  a.dispose();
  b.dispose();
});

test('0.6 cancellation clears aid, collision and vehicle ownership between rounds', () => {
  const s = smallSimulation(),
    a = s.actors[1],
    target = s.actors[2],
    v = armour(s);
  enterVehicle(s.player, v);
  npcState(a).task = { kind: 'HEAL', target, phase: 'APPROACH', until: 10, started: 0 };
  supportReservationsFor(s).set(target, { actor: a, until: 10 });
  s.cancelWork();
  expect(v.driver).toBeNull();
  expect(s.player.vehicle).toBeNull();
  expect(reservationCount(s)).toBe(0);
  expect(npcState(a).task).toBeNull();
});

test('0.6 impacts retain a rest-space position even after the rigid body moves', () => {
  const s = smallSimulation();
  s.spawnRubble(
    [0, 1].map((x) => ({ x: 100 + x, y: 20, z: 100, material: 4 })),
    undefined,
    true,
  );
  const b = s.rubble[0];
  b.age = 1;
  queueImpact(b, { x: 100.5, y: 20.5, z: 100.5 }, 10, 100);
  const p = { ...b.impact!.localPoint! };
  b.x += 10;
  expect(b.impact!.localPoint).toEqual(p);
  expect(p.x).toBeCloseTo(0.5);
});
