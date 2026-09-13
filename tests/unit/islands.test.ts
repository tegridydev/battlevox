import { expect, spyOn, test } from 'bun:test';
import { destructionLimits } from '../../src/core/config';
import { processFractures, queueImpact } from '../../src/simulation/section-fracture';
import { prepareSectionMesh, sectionMeshes } from '../../src/simulation/section-mesh';
import { damageSection } from '../../src/simulation/section-query';
import { smallSimulation } from '../helpers';

const slab = (width: number, depth = width) =>
  Array.from({ length: width * depth }, (_, i) => ({
    x: 100 + (i % width),
    y: 20,
    z: 100 + Math.floor(i / width),
    material: 4,
  }));

test('one local impact releases a small connected patch and conserves all material', () => {
  const s = smallSimulation();
  s.spawnRubble(slab(20), { x: 0, y: -20, z: 0 }, true);
  const parent = s.rubble[0];
  parent.age = 1;
  parent.impactCooldown = 0;
  queueImpact(parent, { x: 100, y: 20, z: 100 }, 20);
  for (let i = 0; i < 300 && s.rubble.includes(parent); i++) processFractures(s);
  expect(s.rubble.includes(parent)).toBe(false);
  expect(s.rubble.length).toBeLessThanOrEqual(4);
  expect(s.rubble.reduce((n, b) => n + b.voxels.length, 0)).toBe(400);
  expect(Math.max(...s.rubble.map((b) => b.voxels.length))).toBeGreaterThanOrEqual(368);
  expect(s.rubble.every((b) => b.impactCooldown === 0.3)).toBe(true);
});
test('a surface bullet does not subdivide a slab; severing a bridge repairs connectivity', () => {
  const s = smallSimulation();
  s.spawnRubble(slab(8), undefined, true);
  const parent = s.rubble[0];
  damageSection(parent, 0, 1000);
  for (let i = 0; i < 50; i++) processFractures(s);
  expect(s.rubble).toHaveLength(1);
  expect(parent.voxels).toHaveLength(63);
  s.rubble.length = 0;
  s.spawnRubble(slab(3, 1), undefined, true);
  damageSection(s.rubble[0], 1, 1000);
  for (let i = 0; i < 50; i++) processFractures(s);
  expect(s.rubble).toHaveLength(2);
  expect(s.rubble.every((b) => b.voxels.length === 1)).toBe(true);
});
test('grace, cooldown, and pool backpressure do not cause repeated fracture attempts', () => {
  const s = smallSimulation();
  s.spawnRubble(slab(8), undefined, true);
  const body = s.rubble[0],
    point = { x: 100, y: 20, z: 100 };
  queueImpact(body, point, 30);
  expect(body.impact).toBeUndefined();
  body.age = 1;
  body.impactCooldown = 0.3;
  queueImpact(body, point, 30);
  expect(body.impact).toBeUndefined();
  body.impactCooldown = 0;
  for (let i = 0; i < destructionLimits.rubbleBodies; i++)
    s.spawnRubble([{ x: 200 + i, y: 30, z: 200, material: 4 }]);
  queueImpact(body, point, 30);
  for (let i = 0; i < 50; i++) processFractures(s);
  expect(s.rubble.includes(body)).toBe(true);
  expect(body.voxels).toHaveLength(64);
  expect(body.impact).toBeUndefined();
  expect(body.connectivityDirty).toBe(true);
  expect(body.fractureSlots).toBeGreaterThan(0);
});
test('a large resting island sleeps, remains destructible, and wakes when support disappears', () => {
  const s = smallSimulation();
  s.spawnRubble(slab(12), undefined, true);
  const body = s.rubble[0];
  body.y = 1;
  for (let i = 0; i < 90; i++) s.updateRubble(1 / 30);
  expect(body.sleeping).toBe(true);
  expect(s.rubble.includes(body)).toBe(true);
  damageSection(body, 0, 1);
  expect(body.sleeping).toBe(false);
  body.sleeping = true;
  for (let z = 100; z < 112; z++)
    for (let x = 100; x < 112; x++) s.world.vox[s.world.index(x, 0, z)] = 0;
  s.world.revision++;
  s.updateRubble(1 / 30);
  expect(body.sleeping).toBe(false);
  expect(body.vy).toBeLessThan(0);
});
test('greedy island mesh merges an intact slab to six quads', () => {
  const s = smallSimulation();
  s.spawnRubble(slab(20), undefined, true);
  const b = s.rubble[0];
  for (const _ of prepareSectionMesh(b, s.world.colours)) {
  }
  expect(sectionMeshes.get(b)?.data.length).toBe(36 * 10);
});

test('damage between fracture slices cancels stale voxel indices and preserves remaining material', () => {
  const s = smallSimulation();
  s.spawnRubble(slab(24), undefined, true);
  const body = s.rubble[0];
  body.connectivityDirty = true;
  let now = 0;
  const clock = spyOn(performance, 'now').mockImplementation(() => (now += 0.6));
  try {
    // Five lookup slices followed by the first connectivity slice leave a live BFS frontier.
    for (let i = 0; i < 6; i++) processFractures(s);
    damageSection(body, body.voxels.length - 1, 1000);
    for (let i = 0; i < 300; i++) processFractures(s);
    expect(s.rubble.reduce((n, b) => n + b.voxels.length, 0)).toBe(575);
    expect(s.rubble).toHaveLength(1);
    expect(body.connectivityDirty).toBe(false);
  } finally {
    clock.mockRestore();
  }
});
