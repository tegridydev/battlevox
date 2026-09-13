import { expect, spyOn, test } from 'bun:test';
import { destructionLimits } from '../../src/core/config';
import type { Building } from '../../src/core/types';
import { smallSimulation, towerGround } from '../helpers';

test('unsupported blocks collapse and attached blocks remain', () => {
  const s = smallSimulation(),
    w = s.world;
  const b: Building = {
    x: 100,
    z: 100,
    w: 4,
    d: 4,
    h: 5,
    base: 1,
    floors: 1,
    dirty: true,
    rev: 0,
    lift: { x: 100, z: 100 },
  };
  w.buildings.push(b);
  for (let z = 100; z < 104; z++) for (let x = 100; x < 104; x++) w.buildingMap[z * 512 + x] = 1;
  w.setRaw(100, 1, 100, 4);
  w.setRaw(100, 2, 100, 4);
  w.setRaw(103, 5, 103, 4);
  for (const _ of s.scanStructure(b)) {
  }
  expect(w.cell(100, 2, 100)).toBe(4);
  expect(w.cell(103, 5, 103)).toBe(0);
});
test('a scan invalidated while yielded cannot continue deleting newly supported terrain', () => {
  const s = smallSimulation(),
    w = s.world;
  const b: Building = {
    x: 100,
    z: 100,
    w: 24,
    d: 24,
    h: 20,
    base: 1,
    floors: 4,
    dirty: true,
    rev: 0,
    lift: { x: 100, z: 100 },
  };
  w.buildings.push(b);
  for (let z = 100; z < 124; z++)
    for (let x = 100; x < 124; x++) {
      w.buildingMap[z * 512 + x] = 1;
      w.setRaw(x, 10, z, 4);
    }
  const scan = s.scanStructure(b);
  expect(scan.next().done).toBe(false);
  w.setRaw(110, 9, 110, 4);
  expect(scan.next().done).toBe(true);
  expect(w.cell(110, 10, 110)).toBe(4);
  expect(b.dirty).toBe(true);
});

test('intact city towers carry their own load; glass cannot carry a detached roof', () => {
  const s = smallSimulation(),
    w = s.world;
  towerGround(w);
  w.cityTower(100, 100, 24, 24, 3, 0);
  const b = w.buildings[0];
  for (const _ of s.scanStructure(b)) {
  }
  expect(b.fractureHeight).toBeUndefined();
  expect(s.rubble).toHaveLength(0);
  expect(w.cell(110, 19, 110)).not.toBe(0);
  const glass: Building = {
    x: 140,
    z: 140,
    w: 3,
    d: 3,
    h: 5,
    base: 1,
    floors: 1,
    dirty: true,
    rev: 0,
    lift: { x: 140, z: 140 },
  };
  w.buildings.push(glass);
  w.setRaw(140, 1, 140, 4);
  w.setRaw(140, 2, 140, 11);
  w.setRaw(140, 3, 140, 4);
  for (const _ of s.scanStructure(glass)) {
  }
  expect(w.cell(140, 1, 140)).toBe(4);
  expect(w.cell(140, 3, 140)).toBe(0);
  expect(s.rubble.length).toBeGreaterThan(0);
});

test('minor facade damage does not trigger a tower-wide failure', () => {
  const s = smallSimulation(),
    w = s.world;
  towerGround(w);
  w.cityTower(100, 100, 24, 24, 3, 0);
  const b = w.buildings[0];
  w.removeVoxel(100, 5, 100);
  for (const _ of s.scanStructure(b)) {
  }
  expect(b.fractureHeight).toBeUndefined();
  expect(w.cell(110, 19, 110)).toBe(10);
});

test('one remaining pillar cannot hold a tower; falling sections become physical rubble', () => {
  const s = smallSimulation(),
    w = s.world;
  towerGround(w);
  w.cityTower(100, 100, 24, 24, 5, 0);
  const b = w.buildings[0];
  for (let z = 100; z < 124; z++)
    for (let x = 100; x < 124; x++) if (x !== 100 || z !== 100) w.removeVoxel(x, 5, z);
  let maximum = 0,
    moving = false,
    rotating = false;
  // Functional completion uses a controlled work clock. Real timings belong in the benchmark,
  // otherwise unrelated OS scheduling changes the amount of physics work allowed per tick.
  let workClock = 0;
  const clock = spyOn(performance, 'now').mockImplementation(() => (workClock += 0.002));
  try {
    for (let tick = 0; tick < 600; tick++) {
      s.simTime += 1 / 30;
      s.advanceCollapse();
      s.updateRubble(1 / 30);
      maximum = Math.max(maximum, s.rubble.length);
      moving ||= s.rubble.some((body) => Math.hypot(body.vx, body.vy, body.vz) > 0.5);
      rotating ||= s.rubble.some((body) => Math.abs(body.roll) + Math.abs(body.pitch) > 0.001);
    }
  } finally {
    clock.mockRestore();
  }
  expect(b.fractureHeight).toBeUndefined();
  expect(b.structure).not.toBeUndefined();
  expect(moving).toBe(true);
  expect(rotating).toBe(true);
  expect(maximum).toBeGreaterThan(0);
  expect(s.rubble.filter((b) => !b.primary).length).toBeLessThanOrEqual(192);
  expect(w.cell(110, 29, 110)).toBe(0);
  expect(
    w.rubbleCells.size + s.rubble.reduce((n, body) => n + body.voxels.length, 0),
  ).toBeGreaterThan(0);
  expect(s.rubble.every((body) => body.sleeping)).toBe(true);
  expect(w.navDirty).toBe(true);
}, 10000);

test('full secondary budget cannot block primary detachment', () => {
  const s = smallSimulation();
  s.world.setRaw(100, 5, 100, 4);
  for (let i = 0; i < destructionLimits.rubbleBodies; i++)
    expect(s.spawnRubble([{ x: 50, y: 8, z: 50, material: 4 }])).toBe(true);
  for (const _ of s.scanStructure()) {
  }
  expect(s.world.cell(100, 5, 100)).toBe(0);
  expect(s.rubble.filter((b) => b.primary)).toHaveLength(1);
  expect(s.rubble.filter((b) => !b.primary)).toHaveLength(destructionLimits.rubbleBodies);
});
