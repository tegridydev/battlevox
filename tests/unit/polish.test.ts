import { expect, test } from 'bun:test';
import { matrix } from '../../src/core/math';
import type { Vehicle } from '../../src/core/types';
import { validateSettings } from '../../src/platform/storage';
import { DustUniforms } from '../../src/rendering/dust';
import { frustumPlanes } from '../../src/rendering/frustum';
import type { Renderer } from '../../src/rendering/renderer';
import { part, renderSoldier } from '../../src/rendering/scene';
import { lightMatrix } from '../../src/rendering/showcase-lighting';
import { deploy, tickEquipment } from '../../src/simulation/equipment';
import { travelLift } from '../../src/simulation/navigation';
import { interactionStatus, kitStatus } from '../../src/simulation/player-actions';
import { createRubble } from '../../src/simulation/rubble';
import { processFractures } from '../../src/simulation/section-fracture';
import { prepareSectionMesh, sectionMeshes } from '../../src/simulation/section-mesh';
import { damageSection } from '../../src/simulation/section-query';
import { hudLayout } from '../../src/ui/hud-layout';
import { captureProgress, hudViewModel, squadNumber } from '../../src/ui/hud-model';
import { smallSimulation } from '../helpers';

test('equipment readout and execution share dressing cooldown, repair reach and single reward', () => {
  const s = smallSimulation();
  s.player.hp = 50;
  s.classAbility();
  expect(s.player.hp).toBe(95);
  expect(hudViewModel(s).kit.cooldown).toBe(22);
  expect(kitStatus(s).available).toBe(false);
  s.classAbility();
  expect(s.player.hp).toBe(95);
  s.activeKit = s.player.kit = 'engineer';
  s.abilityClock = 0;
  const v = { x: 32, y: 1, z: 30, team: 0, alive: true, hp: 400 } as Vehicle;
  s.vehicles = [v];
  expect(kitStatus(s).action).toBe('repair');
  const before = s.score;
  s.fortify();
  expect(v.hp).toBe(560);
  expect(s.score - before).toBe(40);
  expect(s.roundStats.repairs).toBe(1);
  s.abilityClock = 0;
  v.y = 8;
  expect(kitStatus(s).available).toBe(false);
  s.classAbility();
  expect(v.hp).toBe(560);
});

test('vehicle prompt rejects an occupied vehicle and execution rechecks an intervening wall', () => {
  const s = smallSimulation();
  const v = { x: 33, y: 1, z: 30, team: 0, alive: true, driver: s.actors[1], turret: 0 } as Vehicle;
  s.vehicles = [v];
  expect(interactionStatus(s).available).toBe(false);
  v.driver = null;
  expect(interactionStatus(s).available).toBe(true);
  for (let y = 1; y <= 3; y++) s.world.setRaw(31, y, 30, 4);
  s.useVehicle();
  expect(s.player.vehicle).toBeNull();
  expect(interactionStatus(s).available).toBe(false);
});

test('supplies follow player view direction and retain owner XP through lift travel', () => {
  const s = smallSimulation(),
    p = s.player,
    buddy = s.actors[1];
  for (const a of s.actors) a.alive = a === p || a === buddy;
  Object.assign(p, {
    x: 100.5,
    y: 5,
    z: 100.5,
    yaw: Math.PI / 2,
    kit: 'medic',
    lifeEpoch: 1,
    poseEpoch: 1,
  });
  Object.assign(buddy, { x: 100.5, y: 5, z: 102, hp: 50 });
  s.yaw = 0;
  s.activeKit = 'medic';
  for (let x = 99; x <= 102; x++) for (let z = 99; z <= 103; z++) s.world.setRaw(x, 4, z, 4);
  s.world.setRaw(100, 9, 100, 4);
  s.world.buildings = [
    { lift: { x: 100.5, z: 100.5 }, floors: 1 } as (typeof s.world.buildings)[number],
  ];
  expect(deploy(s, p, 'medical')).toBe(true);
  expect(s.deployables[0].x).toBe(p.x);
  expect(s.deployables[0].z).toBeCloseTo(101.35);
  s.spatial();
  s.simTime = 1;
  tickEquipment(s, 1);
  const xp = s.score;
  expect(xp).toBe(10);
  expect(travelLift(s, p, 0, 1)).toBe(true);
  buddy.hp = 50;
  s.spatial();
  s.simTime = 3;
  tickEquipment(s, 1);
  expect(buddy.hp).toBe(62);
  expect(s.score).toBe(xp + 10);
  expect(p.lifeEpoch).toBe(1);
});

test('HUD preserves loaded ammo during reload and uses player-relative capture progress', () => {
  const s = smallSimulation();
  s.ammo[0] = 7;
  s.reserves[0] = 42;
  s.reloadTime = 1;
  const view = hudViewModel(s);
  expect(view.ammo).toBe('7');
  expect(view.reserve).toBe('42 RESERVE');
  expect(view.reload).toBeGreaterThan(0);
  expect(captureProgress(-1, 1)).toBe(1);
  expect(captureProgress(-1, 0)).toBe(0);
  s.battleTeamSize = 60;
  expect(squadNumber(s, 6)).toBe('01');
  expect(validateSettings({ hudScale: 1.3 }).hudScale).toBe(1.3);
  expect(validateSettings({ hudScale: 999 }).hudScale).toBe(1);
});

test('tactical HUD supports scaling and compact panels without losing their controls', () => {
  for (const scale of [1, 1.15, 1.3])
    for (const [w, h, touch] of [
      [1920, 1080, false],
      [1280, 720, false],
      [390, 844, true],
      [844, 390, true],
    ] as const) {
      const l = hudLayout(w, h, touch, 16, scale);
      expect(l.weapon.x).toBeGreaterThan(l.vitals.x + l.vitals.width);
      for (const r of [l.top, l.vitals, l.weapon]) {
        expect(r.x).toBeGreaterThanOrEqual(0);
        expect(r.y).toBeGreaterThanOrEqual(0);
        expect(r.x + r.width).toBeLessThanOrEqual(w);
        expect(r.y + r.height).toBeLessThanOrEqual(h);
      }
      if (l.compact) {
        expect(hudLayout(w, h, touch, 16, scale, 'squad').showSquad).toBe(true);
        expect(hudLayout(w, h, touch, 16, scale, 'map').showMap).toBe(true);
      } else {
        expect(l.showMap).toBe(true);
        expect(l.showSquad).toBe(true);
      }
    }
});

test('rigid material origin reconstructs terrain coordinates without following body motion', () => {
  const s = smallSimulation(),
    job = createRubble(s, [{ x: 101, y: 7, z: 103, material: 4 }], { x: 0, y: 0, z: 0 }, true);
  let step = job.next();
  while (!step.done) step = job.next();
  const b = step.value!;
  for (const _ of prepareSectionMesh(b, s.world.colours)) {
  }
  const data = sectionMeshes.get(b)!.data,
    origin = { ...b.materialOrigin };
  expect([data[0] + origin.x, data[1] + origin.y, data[2] + origin.z]).toEqual([101, 7, 103]);
  b.x += 10;
  b.yaw = 1;
  expect(b.materialOrigin).toEqual(origin);
});

test('cosmetic dust selects at most four nearby live volumes and expires independently', () => {
  const dust = new DustUniforms(),
    clouds = Array.from({ length: 12 }, (_, x) => ({
      x,
      y: 2,
      z: 0,
      radius: 2,
      life: 2,
      max: 3,
      strength: 1,
    }));
  dust.update(clouds, { x: 0, y: 2, z: 0 });
  expect(dust.count).toBe(4);
  expect(dust.spheres[12]).toBe(3);
  clouds.forEach((c) => (c.life = 0));
  dust.update(clouds, { x: 0, y: 2, z: 0 });
  expect(dust.count).toBe(0);
});

test('shadow projection is snapped to shadow texels, not two-metre camera jumps', () => {
  const sun = [-0.48, 0.83, 0.3],
    size = 1536;
  for (const x of [100, 100.01, 100.5, 101, 102]) {
    const m = lightMatrix({ x, y: 22, z: 100 }, sun, size);
    expect((m[12] * size) / 2).toBeCloseTo(Math.round((m[12] * size) / 2), 3);
    expect((m[13] * size) / 2).toBeCloseTo(Math.round((m[13] * size) / 2), 3);
  }
});

test('fragment children inherit the same rest coordinates after a rotated parent splits', () => {
  const s = smallSimulation();
  s.spawnRubble(
    [0, 1, 2].map((x) => ({ x: 101 + x, y: 7, z: 103, material: 4 })),
    undefined,
    true,
  );
  const parent = s.rubble[0];
  parent.x += 10;
  parent.yaw = 0.7;
  damageSection(parent, 1, 1000);
  for (let i = 0; i < 100 && s.rubble.includes(parent); i++) processFractures(s);
  expect(s.rubble).toHaveLength(2);
  expect(s.rubble.map((b) => b.materialOrigin.x).sort((a, b) => a - b)).toEqual([101, 103]);
  for (const b of s.rubble) {
    expect(b.materialOrigin.y).toBe(7);
    expect(b.materialOrigin.z).toBe(103);
    expect(b.yaw).toBeCloseTo(0.7);
  }
});

test('camera culling avoids actor commands while retaining independent shadow casters', () => {
  const s = smallSimulation(),
    a = s.actors[1];
  Object.assign(s.camera, { x: 30, y: 2, z: 30, yaw: 0, pitch: 0 });
  let boxes = 0;
  const r = {
    sim: s,
    shadowPass: false,
    cameraPlanes: frustumPlanes(matrix(s.camera, 16 / 9, Math.PI / 3)),
    shadowPlanes: new Float32Array(24),
    box: () => boxes++,
    part,
  } as unknown as Renderer;
  Object.assign(a, { x: 30, y: 1, z: 10 });
  renderSoldier.call(r, a);
  expect(boxes).toBe(0);
  r.shadowPass = true;
  renderSoldier.call(r, a);
  expect(boxes).toBeGreaterThan(0);
  boxes = 0;
  r.shadowPass = false;
  a.z = 60;
  renderSoldier.call(r, a);
  expect(boxes).toBeGreaterThan(0);
});
