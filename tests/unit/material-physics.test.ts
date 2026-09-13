import { expect, test } from 'bun:test';
import { fractureResistance, grainAt } from '../../src/core/material-physics';
import { bondCost, bondLevel, depositWork } from '../../src/simulation/bonds';
import { axisBox, segmentBox } from '../../src/simulation/collision-geometry';
import { energyImpulse } from '../../src/simulation/contact';
import { applyBlast, destructionLedgers } from '../../src/simulation/destruction-events';
import { integrateRotation, kineticEnergy, rotate, unrotate } from '../../src/simulation/rotation';
import { smallSimulation } from '../helpers';

test('sub-quantum bond work accumulates without free damage', () => {
  const a = { x: 0, y: 0, z: 0, material: 4, id: 1, grain: 1 },
    b = { ...a, x: 1, id: 2 },
    work = new Map<string, number>(),
    cost = bondCost(a, b);
  for (let i = 0; i < 100; i++) depositWork(work, a, b, cost / 1000);
  expect(bondLevel(work, a, b)).toBe(3);
  expect(work.get('1:2')).toBeCloseTo(cost * 0.1, 8);
  expect(depositWork(work, a, b, cost * 2)).toBeCloseTo(cost * 0.9, 8);
  expect(bondLevel(work, a, b)).toBe(31);
  expect(depositWork(work, a, b, 1)).toBe(0);
});
test('material resistance and grain identity are deterministic', () => {
  expect(fractureResistance(12)).toBeGreaterThan(fractureResistance(4));
  expect(fractureResistance(4)).toBeGreaterThan(fractureResistance(6));
  expect(fractureResistance(6)).toBeGreaterThan(fractureResistance(11));
  expect(grainAt(10, 20, 30, 4, 123)).toBe(grainAt(10, 20, 30, 4, 123));
});
test('quaternion rotation and off-centre impulse preserve a finite energy budget', () => {
  const s = smallSimulation();
  s.spawnRubble([
    { x: 100, y: 10, z: 100, material: 4 },
    { x: 101, y: 11, z: 100, material: 12 },
  ]);
  const b = s.rubble[0];
  const before = kineticEnergy(b),
    point = { x: b.x + b.centre.x + 1, y: b.y + b.centre.y, z: b.z + b.centre.z };
  const spent = energyImpulse(b, { x: 0, y: 0, z: 1 }, 5, point);
  expect(spent).toBeLessThanOrEqual(5.000001);
  expect(kineticEnergy(b) - before).toBeCloseTo(spent, 8);
  for (let i = 0; i < 200; i++) integrateRotation(b, 0.01);
  const p = { x: 1, y: 2, z: 3 },
    back = unrotate(b.orientation, rotate(b.orientation, p));
  expect(back.x).toBeCloseTo(p.x, 8);
  expect(back.y).toBeCloseTo(p.y, 8);
  expect(back.z).toBeCloseTo(p.z, 8);
});
test('finite-radius sweep detects a grazing thin wall', () => {
  const box = axisBox({ min: { x: 1, y: 1, z: 1 }, max: { x: 2, y: 2, z: 2 } }),
    o = { x: 0, y: 2.05, z: 1.5 },
    d = { x: 1, y: 0, z: 0 };
  expect(segmentBox(o, d, 5, box)).toBeNull();
  expect(segmentBox(o, d, 5, box, 0.085)?.t).toBeCloseTo(0.915, 6);
});
test('one blast ledger caps shared work across multiple materials', () => {
  const s = smallSimulation();
  for (let x = 99; x < 104; x++) s.world.setRaw(x, 3, 100, x % 2 ? 4 : 12);
  applyBlast(s, { x: 101, y: 3, z: 100 }, 3, 155);
  const e = destructionLedgers(s)[0];
  expect(e.fractureSpent).toBeLessThanOrEqual(e.fractureBudget + 1e-6);
  expect(e.motionSpent).toBeLessThanOrEqual(e.motionBudget + 1e-6);
  expect(e.fractureBudget + e.motionBudget).toBeCloseTo(e.input, 6);
});
