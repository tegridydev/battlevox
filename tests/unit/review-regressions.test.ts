import { expect, test } from 'bun:test';
import { STEP, weapons } from '../../src/core/config';
import type { Vehicle } from '../../src/core/types';
import { sectionBlocked } from '../../src/simulation/section-query';
import { localPath } from '../../src/world/pathfinding';
import { fullSquads, smallSimulation, towerGround } from '../helpers';

function vehicle(): Vehicle {
  return {
    x: 100,
    y: 1,
    z: 100,
    vx: 0,
    vy: 0,
    vz: 0,
    ix: 0,
    iz: 0,
    team: 0,
    height: 1.95,
    radius: 1.85,
    isVehicle: true,
    hp: 600,
    alive: true,
    onGround: true,
    respawn: 0,
    cool: 0,
    driver: null,
    goal: 4,
    homeX: 100,
    homeZ: 100,
    stuck: 0,
    reverse: 0,
    yaw: 0,
    turret: 0,
    pitch: 0,
    target: null,
  };
}

test('cut trees and cross-chunk cover detach while neighbouring rooted wood stays', () => {
  const s = smallSimulation(),
    w = s.world;
  for (const x of [31, 60]) {
    for (let y = 1; y < 8; y++) w.setRaw(x, y, 100, 6);
    for (let dx = -1; dx <= 1; dx++) w.setRaw(x + dx, 8, 100, 7);
  }
  for (const _ of s.scanStructure()) {
  }
  expect(s.rubble).toHaveLength(0);
  w.removeVoxel(31, 1, 100);
  for (let i = 0; i < 30; i++) s.advanceCollapse();
  expect(w.cell(31, 2, 100)).toBe(0);
  expect(w.cell(32, 8, 100)).toBe(0);
  expect(w.cell(60, 2, 100)).toBe(6);
  expect(s.rubble.some((b) => b.primary)).toBe(true);
});
test('undermined framed tower detaches within bounded preparation slices without duplicated geometry', () => {
  const s = smallSimulation(),
    w = s.world;
  towerGround(w);
  w.cityTower(100, 100, 24, 24, 19, 0);
  for (const _ of s.scanStructure(w.buildings[0])) {
  }
  for (let z = 100; z < 124; z++) for (let x = 100; x < 124; x++) w.removeVoxel(x, 5, z);
  // The frame adds real collision geometry. Preparation is intentionally spread over frames.
  for (let i = 0; i < 180 && w.cell(110, 99, 110); i++) {
    s.simTime += STEP;
    s.advanceCollapse();
  }
  expect(w.cell(110, 99, 110)).toBe(0);
  expect(s.rubble.length).toBeGreaterThan(0);
  const cells = s.rubble.flatMap((b) =>
    b.voxels.map((v) => `${b.x + v.x},${b.y + v.y},${b.z + v.z}`),
  );
  expect(new Set(cells).size).toBe(cells.length);
}, 15000);
test('rubble gaps do not damage or repel soldiers and fast sections cannot cross', () => {
  const s = smallSimulation();
  Object.assign(s.player, { x: 102, y: 1, z: 100.5 });
  s.spatial();
  s.spawnRubble(
    [
      { x: 100, y: 2, z: 100, material: 4 },
      { x: 103, y: 2, z: 100, material: 4 },
    ],
    { x: 0, y: -10, z: 0 },
  );
  s.updateRubble(STEP);
  expect(s.player.hp).toBe(100);
  expect(s.player.x).toBe(102);
  s.rubble.length = 0;
  s.spawnRubble([{ x: 100, y: 20, z: 100, material: 4 }], { x: 16, y: 0, z: 0 });
  s.spawnRubble([{ x: 101, y: 20, z: 100, material: 4 }], { x: -16, y: 0, z: 0 });
  for (let i = 0; i < 2; i++) s.updateRubble(STEP);
  expect(s.rubble[0].x).toBeLessThan(s.rubble[1].x);
});
test('airborne expiry cannot teleport masonry into ground cover', () => {
  const s = smallSimulation();
  s.spawnRubble([{ x: 100, y: 40, z: 100, material: 4 }]);
  s.rubble[0].age = 15;
  s.updateRubble(STEP);
  expect(s.world.cell(100, 1, 100)).toBe(0);
  expect(s.rubble).toHaveLength(1);
});
test('falling masonry blocks bullets and movement before settlement', () => {
  const s = smallSimulation(),
    target = s.actors[10];
  Object.assign(target, { x: 40, y: 1, z: 30.5 });
  s.spatial();
  s.spawnRubble([{ x: 35, y: 2, z: 30, material: 4 }]);
  s.bullet(s.player, { x: 30, y: 2.5, z: 30.5 }, { x: 1, y: 0, z: 0 }, 20);
  expect(target.hp).toBe(100);
  expect(sectionBlocked(s, { x: 35.5, y: 1, z: 30.5 })).toBe(true);
});
test('vehicle blasts respect height and cover, and remote boarding is rejected', () => {
  const s = smallSimulation(),
    v = vehicle();
  s.vehicles = [v];
  s.explode({ x: 100, y: 100, z: 100 }, 4, null, 100);
  expect(v.hp).toBe(600);
  Object.assign(s.player, { x: 100, y: 50, z: 100 });
  s.useVehicle();
  expect(s.player.vehicle).toBeNull();
  s.player.y = 1;
  s.useVehicle();
  expect(s.player.vehicle).toBe(v);
  s.player.vehicle = null;
  v.driver = null;
  for (let y = 1; y < 6; y++) for (let z = 96; z <= 104; z++) s.world.setRaw(97, y, z, 1);
  s.explode({ x: 95, y: 2, z: 100 }, 5, null, 100);
  const covered = 600 - v.hp;
  const open = smallSimulation(),
    other = vehicle();
  open.vehicles = [other];
  open.explode({ x: 95, y: 2, z: 100 }, 5, null, 100);
  expect(covered).toBeLessThan(600 - other.hp);
});
test('projectile saturation preserves grenade and rocket inventory and shields', () => {
  const s = smallSimulation();
  for (let i = 0; i < 110; i++) s.launch(null, { x: 20, y: 2, z: 20 }, { x: 1, y: 0, z: 0 });
  s.player.shield = 3;
  s.throwGrenade();
  expect(s.grenades).toBe(3);
  expect(s.player.shield).toBe(3);
  s.weaponIndex = 2;
  s.input.fire = true;
  const ammo = s.ammo[2];
  s.updatePlayer(STEP);
  expect(s.ammo[2]).toBe(ammo);
  expect(s.fireTime).toBeLessThanOrEqual(0);
});
test('automatic fire carries fractional cooldown remainder', () => {
  for (const weapon of [0, 1]) {
    const s = smallSimulation();
    s.weaponIndex = weapon;
    s.ammo[weapon] = 10000;
    s.input.fire = true;
    let shots = 0;
    s.bullet = () => {
      shots++;
    };
    for (let i = 0; i < 300; i++) s.updatePlayer(STEP);
    expect(Math.abs(shots - 10 / weapons[weapon].delay)).toBeLessThanOrEqual(1);
  }
});
test('AI damage reduction applies to the actual player hit and successful grenades clear protection', () => {
  const s = smallSimulation(),
    enemy = s.actors[10];
  for (const a of s.actors) if (a !== s.player && a !== enemy) a.alive = false;
  s.spatial();
  s.bullet(enemy, { x: enemy.x, y: 2, z: enemy.z }, { x: -1, y: 0, z: 0 }, 24);
  expect(s.player.hp).toBe(90);
  enemy.shield = 3;
  expect(s.launch(enemy, { x: 60, y: 2, z: 30 }, { x: 1, y: 0, z: 0 }, 'grenade')).toBe(true);
  expect(enemy.shield).toBe(0);
});
test('local paths reject wrapped coordinates and resume a budget-limited search', () => {
  const s = smallSimulation(),
    from = { x: 1, y: 1, z: 1 },
    to = { x: 41, y: 1, z: 1 };
  expect(localPath(s.world, from, { x: -1, y: 1, z: 3 }).status).toBe('unreachable');
  let result = localPath(s.world, from, to, 1);
  expect(result.status).toBe('pending');
  for (let i = 0; i < 100 && result.status === 'pending'; i++)
    result = localPath(s.world, from, to, 1, result.search);
  expect(result.status).toBe('reachable');
});
test('hold formation destinations are unique and reserve exhaustion determines defeat', () => {
  const s = fullSquads(),
    q = s.squads[0];
  q.order = { kind: 'hold', position: { x: 100, y: 1, z: 100 } };
  for (const id of q.memberIds) {
    Object.assign(s.actors[id], { x: 80, y: 1, z: 80 });
    s.squadTarget(s.actors[id]);
  }
  const targets = q.memberIds.map((id) => s.localRoutes.get(id)!.target);
  expect(new Set(targets.map((p) => `${p.x.toFixed(3)},${p.z.toFixed(3)}`)).size).toBe(10);
  s.tickets = [0, 6000];
  s.controlTime = [10, 0];
  s.capture(0.25);
  expect(s.events.find((e) => e.type === 'finished')).toEqual({
    type: 'finished',
    winner: false,
    reason: 'reserves',
  });
});
test('engineer construction cannot overwrite terrain or intersect vehicles', () => {
  const s = smallSimulation();
  s.activeKit = 'engineer';
  s.yaw = 0;
  const v = vehicle();
  Object.assign(v, { x: 30, z: 33 });
  s.vehicles = [v];
  s.fortify();
  expect(s.abilityClock).toBe(0);
  expect(s.world.cell(30, 1, 33)).toBe(0);
});

test('both Shift keys descend a lift', () => {
  for (const key of ['ShiftLeft', 'ShiftRight']) {
    const s = smallSimulation();
    s.world.buildings.push({
      x: 100,
      z: 100,
      w: 10,
      d: 10,
      h: 10,
      base: 4,
      floors: 2,
      dirty: false,
      rev: 0,
      lift: { x: 103.5, z: 103.5 },
    });
    s.world.setRaw(103, 4, 103, 4);
    Object.assign(s.player, { x: 103.5, y: 10, z: 103.5 });
    s.input.keys.add(key);
    expect(s.useLift()).toBe(true);
    expect(s.player.y).toBe(5);
  }
});

test('simultaneous reserve exhaustion compares control and reports a draw when equal', () => {
  for (const [times, winner] of [
    [[10, 5], true],
    [[5, 10], false],
    [[5, 5], null],
  ] as const) {
    const s = smallSimulation();
    s.controlTime = [...times];
    s.tickets = [0, 0];
    s.capture(0.25);
    expect(s.events.find((e) => e.type === 'finished')).toEqual({
      type: 'finished',
      winner,
      reason: 'reserves',
    });
  }
});
test('hard primary impact creates smaller fragments without increasing translational energy', () => {
  const s = smallSimulation();
  const voxels = Array.from({ length: 64 }, (_, i) => ({
    x: 100 + (i % 8),
    y: 15,
    z: 100 + Math.floor(i / 8),
    material: 4,
  }));
  s.spawnRubble(voxels, { x: 0, y: -25, z: 0 }, true);
  let split = false;
  for (let i = 0; i < 120; i++) {
    s.updateRubble(STEP);
    if (s.rubble.some((b) => !b.primary)) {
      split = true;
      expect(s.rubble.length).toBeLessThanOrEqual(4);
      expect(Math.max(...s.rubble.map((b) => b.voxels.length))).toBeGreaterThanOrEqual(32);
      break;
    }
  }
  expect(split).toBe(true);
  const energy = s.rubble.reduce(
    (n, b) => n + (b.mass * (b.vx * b.vx + b.vy * b.vy + b.vz * b.vz)) / 2,
    0,
  );
  expect(energy).toBeLessThan(64 * ((25 * 25) / 2 + 19 * 15));
});
test('removing support beneath settled rubble and placed cover detaches both', () => {
  const s = smallSimulation(),
    w = s.world;
  w.setRaw(31, 1, 100, 9);
  w.setRaw(31, 2, 100, 4);
  w.rubbleCells.add(w.index(31, 2, 100));
  w.setRaw(32, 2, 100, 9);
  for (const _ of s.scanStructure()) {
  }
  expect(s.rubble).toHaveLength(0);
  w.removeVoxel(31, 1, 100);
  for (let i = 0; i < 30; i++) s.advanceCollapse();
  expect(w.cell(31, 2, 100)).toBe(0);
  expect(w.cell(32, 2, 100)).toBe(0);
});
