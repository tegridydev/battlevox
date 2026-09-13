import { expect, test } from 'bun:test';
import { viewmodelPoint, viewmodels } from '../../src/rendering/viewmodel';
import type { Contact } from '../../src/simulation/contact';
import { newDestructionBudget } from '../../src/simulation/destruction-budget';
import { groundedPath, probeSupport, supportFootprint } from '../../src/simulation/rubble-support';
import { queueImpact } from '../../src/simulation/section-fracture';
import { terrainContacts } from '../../src/simulation/terrain-contact';
import { hudLayout } from '../../src/ui/hud-layout';
import { smallSimulation } from '../helpers';

const contact = (x: number, z: number, up = true): Contact => ({
  point: { x, y: 1, z },
  normal: { x: up ? 0 : 1, y: up ? 1 : 0, z: 0 },
  minX: x,
  maxX: x + 1,
  minZ: z,
  maxZ: z + 1,
  fraction: 0,
  penetration: 0,
});
test('only upward contacts and a footprint containing COM count as stable', () => {
  expect(supportFootprint([contact(0, 0, false)], { x: 0.5, y: 10, z: 0.5 }).stable).toBe(false);
  expect(supportFootprint([contact(0, 0)], { x: 2, y: 10, z: 0.5 }).stable).toBe(false);
  expect(supportFootprint([contact(0, 0), contact(3, 0)], { x: 2, y: 10, z: 0.5 }).stable).toBe(
    true,
  );
});
test('exhausted terrain work is deferred and retains simulation debt', () => {
  const s = smallSimulation();
  s.spawnRubble([{ x: 100, y: 15, z: 100, material: 4 }], undefined, true);
  const b = s.rubble[0];
  s.destructionBudget = newDestructionBudget();
  s.destructionBudget.deadline = -1;
  expect(terrainContacts(s, b, b.x, b.y, b.z).kind).toBe('deferred');
  s.destructionBudget.physicsMs = 0;
  s.updateRubble(1 / 30);
  expect(b.y).toBe(15);
  expect(b.pendingDt).toBeCloseTo(1 / 30);
  // Check debt recovery independently of the host machine frame timing.
  s.destructionBudget = newDestructionBudget();
  s.destructionBudget.physicsMs = 1000;
  s.updateRubble(1 / 30);
  expect(b.y).toBeLessThan(15);
  expect(b.pendingDt).toBeLessThan(1 / 30);
});
test('exhausted budgets retain elapsed physical time without silent clamping', () => {
  const s = smallSimulation();
  s.spawnRubble([{ x: 100, y: 15, z: 100, material: 4 }], undefined, true);
  s.destructionBudget = newDestructionBudget();
  s.destructionBudget.physicsMs = 0;
  for (let i = 0; i < 30; i++) s.updateRubble(1 / 30);
  expect(s.rubble[0].pendingDt).toBeCloseTo(1);
  expect(s.destructionStats.clampedTime).toBe(0);
});
test('measurable short-drop travel enables fracture before spawn grace expires', () => {
  const s = smallSimulation();
  s.spawnRubble(
    [
      { x: 100, y: 10, z: 100, material: 4 },
      { x: 101, y: 10, z: 100, material: 4 },
    ],
    undefined,
    true,
  );
  const b = s.rubble[0];
  b.travel = 0.1;
  b.age = 0.1;
  queueImpact(b, b, 8);
  expect(b.impact?.speed).toBe(8);
});
test('support dependency cycles cannot anchor floating bodies', () => {
  const s = smallSimulation();
  for (let y = 10; y < 12; y++)
    s.spawnRubble([{ x: 100, y, z: 100, material: 4 }], undefined, true);
  for (const b of s.rubble) probeSupport(s, b);
  const [a, b] = s.rubble;
  a.support!.stable = b.support!.stable = true;
  a.support!.bodies = [{ body: b, version: 0, x: b.x, y: b.y, z: b.z, yaw: 0, pitch: 0, roll: 0 }];
  b.support!.bodies = [{ body: a, version: 0, x: a.x, y: a.y, z: a.z, yaw: 0, pitch: 0, roll: 0 }];
  expect(groundedPath(s, a)).toBe(false);
});
test('terrain replacement is prepared without mutating collision occupancy', () => {
  const s = smallSimulation(),
    voxels = [{ x: 100, y: 8, z: 100, material: 4 }];
  s.world.setRaw(100, 8, 100, 4);
  const job = s.world.prepareDetach(voxels);
  let next = job.next();
  while (!next.done) next = job.next();
  expect(s.world.cell(100, 8, 100)).toBe(4);
  expect(next.value.length).toBeGreaterThan(0);
  expect(next.value.every((item) => item.mesh.mesh.length > 0)).toBe(true);
});
for (const [width, height, touch] of [
  [2048, 1026, false],
  [1280, 720, false],
  [390, 844, true],
  [390, 667, true],
  [844, 390, true],
] as const)
  test(`HUD left stack does not overlap at ${width}x${height}`, () => {
    const l = hudLayout(width, height, touch);
    const next = l.showSquad ? l.squad : l.showMap ? l.map : l.vitals;
    if (l.showObjective)
      expect(l.objective.y + l.objective.height + 12).toBeLessThanOrEqual(next.y);
    if (l.showSquad)
      expect(l.squad.y + l.squad.height + 12).toBeLessThanOrEqual(l.showMap ? l.map.y : l.vitals.y);
    expect(l.weapon.y).toBeGreaterThanOrEqual(0);
    expect(l.vitals.y).toBeGreaterThanOrEqual(0);
    if (l.showMap) expect(l.map.y + l.map.height + 12).toBeLessThanOrEqual(l.vitals.y);
    expect(l.weapon.x).toBeGreaterThan(l.vitals.x + l.vitals.width);
  });
test('launcher hip silhouette stays in the lower right at its dedicated FOV', () => {
  const profile = viewmodels[2],
    p = viewmodelPoint({ x: 0, y: 0.12, z: 0.95 }, profile, 0, 0, 0);
  const x = 0.5 + p.x / p.z / Math.tan(Math.PI / 6) / (16 / 9) / 2;
  const y = 0.5 - p.y / p.z / Math.tan(Math.PI / 6) / 2;
  expect(x).toBeGreaterThan(0.55);
  expect(y).toBeGreaterThan(0.58);
});
test('a grounded stack loses support when its bottom terrain is removed', () => {
  const s = smallSimulation();
  for (const y of [1, 2]) s.spawnRubble([{ x: 100, y, z: 100, material: 4 }], undefined, true);
  const [base, upper] = s.rubble;
  probeSupport(s, base);
  probeSupport(s, upper);
  expect(groundedPath(s, upper)).toBe(true);
  s.world.vox[s.world.index(100, 0, 100)] = 0;
  s.world.revision++;
  expect(groundedPath(s, upper)).toBe(false);
});
test('off-centre support creates tipping without preset spin', () => {
  const s = smallSimulation();
  s.world.setRaw(100, 1, 100, 1);
  s.spawnRubble(
    Array.from({ length: 24 }, (_, i) => ({
      x: 100 + (i % 6),
      y: 2 + Math.floor(i / 6),
      z: 100,
      material: 4,
    })),
    undefined,
    true,
  );
  const b = s.rubble[0];
  probeSupport(s, b);
  expect(b.support?.stable).toBe(false);
  for (let i = 0; i < 10; i++) s.updateRubble(1 / 30);
  expect(Math.abs(b.roll) + Math.abs(b.pitch)).toBeGreaterThan(0.001);
  expect([b.x, b.y, b.z, b.vy].every(Number.isFinite)).toBe(true);
});
