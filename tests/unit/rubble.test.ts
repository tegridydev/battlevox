import { expect, test } from 'bun:test';
import { destructionLimits as limits } from '../../src/core/config';
import type { RubbleVoxel } from '../../src/core/types';
import { terrainContacts } from '../../src/simulation/rubble';
import { resolveRubbleContacts } from '../../src/simulation/rubble-contacts';
import { rubbleBounds, rubbleShape } from '../../src/simulation/rubble-shape';
import { smallSimulation } from '../helpers';

const slab = (x: number, y: number, z: number): RubbleVoxel[] =>
  Array.from({ length: 16 }, (_, i) => ({
    x: x + (i % 4),
    y,
    z: z + Math.floor(i / 4),
    material: 4,
  }));

test('rubble spends finite impact energy on weaker floors without tunnelling', () => {
  const s = smallSimulation();
  for (const v of slab(100, 5, 100)) s.world.setRaw(v.x, v.y, v.z, 4);
  s.spawnRubble(slab(100, 15, 100), { x: 0, y: -30, z: 0 });
  for (let i = 0; i < 100; i++) s.updateRubble(1 / 30);
  expect(s.rubble).toHaveLength(0);
  expect(slab(100, 5, 100).some((v) => !s.world.cell(v.x, v.y, v.z))).toBe(true);
  expect(s.world.cell(100, 0, 100)).toBe(1);
  expect(s.world.rubbleCells.size).toBe(16);
  expect([...s.world.rubbleCells].every((key) => Math.floor(key / (512 * 512)) >= 1)).toBe(true);
});

test('falling masonry damages soldiers and vehicles only once per section', () => {
  const s = smallSimulation(),
    a = s.actors[10];
  Object.assign(a, { x: 101, y: 1, z: 101, hp: 100, alive: true, shield: 0 });
  s.spatial();
  s.spawnRubble(slab(100, 8, 100), { x: 0, y: -25, z: 0 });
  for (let i = 0; i < 30; i++) s.updateRubble(1 / 30);
  expect(a.alive).toBe(false);
  expect(a.deaths).toBe(1);
  const v = {
    x: 121,
    y: 1,
    z: 121,
    vx: 0,
    vy: 0,
    vz: 0,
    ix: 0,
    iz: 0,
    team: 0 as const,
    height: 1.95,
    radius: 1.85,
    isVehicle: true as const,
    hp: 600,
    alive: true,
    onGround: true,
    respawn: 0,
    cool: 0,
    driver: null,
    goal: 4,
    homeX: 121,
    homeZ: 121,
    stuck: 0,
    reverse: 0,
    yaw: 0,
    turret: 0,
    pitch: 0,
    target: null,
  };
  s.vehicles.push(v);
  s.spawnRubble(slab(120, 9, 120), { x: 0, y: -25, z: 0 });
  for (let i = 0; i < 30; i++) s.updateRubble(1 / 30);
  expect(v.hp).toBeLessThan(600);
  expect(v.hp).toBeGreaterThan(0);
});

test('blast impulses move rubble outward and invalid bodies are rejected', () => {
  const s = smallSimulation();
  expect(s.spawnRubble([{ x: 105, y: 5, z: 100, material: 4 }])).toBe(true);
  s.impulseRubble({ x: 100, y: 5, z: 100 }, 8, 160);
  expect(s.rubble[0].vx).toBeGreaterThan(0);
  expect(s.rubble[0].vy).toBeGreaterThan(0);
  expect(s.spawnRubble([{ x: NaN, y: 5, z: 100, material: 4 }])).toBe(false);
  expect(
    s.spawnRubble(Array.from({ length: 65 }, () => ({ x: 100, y: 5, z: 100, material: 4 }))),
  ).toBe(false);
  expect(s.spawnRubble([{ x: 100, y: 5, z: 100, material: 99 }])).toBe(false);
});

test('settling leaves protected soldiers clear instead of burying them in terrain', () => {
  const s = smallSimulation(),
    a = s.player;
  Object.assign(a, { x: 100.5, y: 1, z: 100.5, shield: 3 });
  s.spatial();
  s.spawnRubble([{ x: 100, y: 2, z: 100, material: 4 }]);
  for (let i = 0; i < 60; i++) s.updateRubble(1 / 30);
  expect(s.world.blocked(a.x, a.y, a.z, 0.3, a.height)).toBe(false);
  expect(a.alive).toBe(true);
});

test('old rubble is bounded and replacements are not removed by rubble cleanup', () => {
  const s = smallSimulation(),
    w = s.world;
  for (let i = 0; i < limits.rubbleCells; i++) {
    const x = 5 + (i % 128),
      z = 5 + Math.floor(i / 128);
    w.setRaw(x, 1, z, 4);
    w.rubbleCells.add(w.index(x, 1, z));
  }
  w.setRaw(5, 1, 5, 9);
  expect(w.rubbleCells.has(w.index(5, 1, 5))).toBe(false);
  s.spawnRubble(slab(300, 2, 300));
  for (let i = 0; i < 60; i++) s.updateRubble(1 / 30);
  expect(w.rubbleCells.size).toBe(limits.rubbleCells);
  expect(w.cell(5, 1, 5)).toBe(9);
});

test('dust and bodies clear on round reset, and cosmetic clouds have a cap and expiry', () => {
  const s = smallSimulation();
  for (let i = 0; i < 100; i++) s.addDust({ x: 50, y: 2, z: 50 }, 3);
  expect(s.dust).toHaveLength(limits.dustClouds);
  for (let i = 0; i < 90; i++) s.updateRubble(1 / 30);
  expect(s.dust).toHaveLength(0);
  s.spawnRubble(slab(100, 5, 100));
  s.addDust({ x: 50, y: 2, z: 50 }, 3);
  s.startBattle();
  expect(s.rubble).toHaveLength(0);
  expect(s.dust).toHaveLength(0);
});

test('rotating sections travel sideways, bounce, and eventually leave rubble beyond their footprint', () => {
  const s = smallSimulation();
  s.spawnRubble(slab(100, 12, 100), { x: 6, y: -2, z: 2 });
  const body = s.rubble[0];
  body.spinRoll = -0.8;
  body.spinPitch = 0.6;
  for (let i = 0; i < 10; i++) s.updateRubble(1 / 30);
  expect(body.x).toBeGreaterThan(101);
  expect(Math.abs(body.roll)).toBeGreaterThan(0.1);
  expect(Math.abs(body.pitch)).toBeGreaterThan(0.1);
  let bounced = false;
  for (let i = 0; i < 300; i++) {
    s.updateRubble(1 / 30);
    if (s.rubble.some((b) => b.vy > 0)) bounced = true;
  }
  expect(bounced).toBe(true);
  expect(s.rubble).toHaveLength(0);
  expect([...s.world.rubbleCells].some((index) => index % 512 > 104)).toBe(true);
  expect(s.world.cell(100, 0, 100)).toBe(1);
});

test('rotation cannot sweep a section through an indestructible wall', () => {
  const s = smallSimulation();
  for (let y = 0; y < 30; y++) for (let z = 95; z < 110; z++) s.world.setRaw(104, y, z, 1);
  s.spawnRubble(slab(100, 15, 100), { x: 12, y: 0, z: 0 });
  s.rubble[0].spinYaw = 2;
  s.rubble[0].spinRoll = 1;
  const b = s.rubble[0];
  for (let tick = 0; tick < 30; tick++) {
    s.updateRubble(1 / 30);
    expect(terrainContacts(s, b, b.x, b.y, b.z).kind).toBe('clear');
    expect(rubbleBounds(b).max.x).toBeLessThan(104.01);
  }
});

test('airborne sections exchange momentum without adding kinetic energy', () => {
  const s = smallSimulation();
  s.spawnRubble([{ x: 100, y: 20, z: 100, material: 4 }], { x: 4, y: 0, z: 0 });
  s.spawnRubble([{ x: 101, y: 20, z: 100, material: 4 }], { x: -2, y: 0, z: 0 });
  const [a, b] = s.rubble;
  b.x = 100.8;
  resolveRubbleContacts(s.rubble, () => true);
  expect(a.vx + b.vx).toBeCloseTo(2);
  expect(a.vx * a.vx + b.vx * b.vx).toBeLessThanOrEqual(20);
  expect(a.vx).toBeLessThan(b.vx);
  expect(b.x - a.x).toBeGreaterThan(0.8);
});

test('holes in sections do not cause phantom body contacts', () => {
  const s = smallSimulation();
  s.spawnRubble(
    [
      { x: 100, y: 20, z: 100, material: 4 },
      { x: 103, y: 20, z: 100, material: 4 },
    ],
    { x: 1, y: 0, z: 0 },
  );
  s.spawnRubble([{ x: 101, y: 20, z: 100, material: 4 }], { x: -1, y: 0, z: 0 });
  resolveRubbleContacts(s.rubble, () => true);
  expect(s.rubble[0].vx).toBe(1);
  expect(s.rubble[1].vx).toBe(-1);
});

test('rotated centres and bounds agree with a quarter-turn about the section centre', () => {
  const s = smallSimulation();
  s.spawnRubble([
    { x: 100, y: 20, z: 100, material: 4 },
    { x: 103, y: 20, z: 100, material: 4 },
  ]);
  const b = s.rubble[0];
  b.roll = Math.PI / 2;
  const points = rubbleShape(b),
    bounds = rubbleBounds(b);
  expect(points[0].x).toBeCloseTo(2);
  expect(points[0].y).toBeCloseTo(-1);
  expect(points[1].y).toBeCloseTo(2);
  expect(bounds.max.y - bounds.min.y).toBeCloseTo(3.98);
  expect(bounds.max.x - bounds.min.x).toBeCloseTo(0.98);
});
