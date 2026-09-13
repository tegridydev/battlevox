import { expect, test } from 'bun:test';
import type { Vehicle } from '../../src/core/types';
import { newDestructionBudget } from '../../src/simulation/destruction-budget';
import { resolveRubbleContacts } from '../../src/simulation/rubble-contacts';
import { groundedPath } from '../../src/simulation/rubble-support';
import { sectionBlocked } from '../../src/simulation/section-query';
import { smallSimulation } from '../helpers';

test('0.6 vehicle pushing is transactional when a displaced soldier would enter debris', () => {
  const s = smallSimulation();
  for (const a of s.actors) a.alive = false;
  const a = s.actors[1];
  Object.assign(a, { alive: true, x: 52.4, y: 1, z: 50.5 });
  s.spawnRubble(
    [
      { x: 53, y: 1, z: 50, material: 4 },
      { x: 53, y: 2, z: 50, material: 4 },
    ],
    undefined,
    true,
  );
  const v = { x: 50.5, y: 1, z: 50.5, radius: 1.85, height: 1.95, alive: true, team: 0 } as Vehicle;
  expect(sectionBlocked(s, a, 0.3, a.height)).toBe(false);
  const x = a.x,
    z = a.z;
  expect(s.pushInfantry(v, 51, 1, 50.5)).toBe(false);
  expect(a.x).toBe(x);
  expect(a.z).toBe(z);
});

test('0.6 deferred contact corrections never publish an impulse twice', () => {
  const s = smallSimulation();
  s.spawnRubble([{ x: 100, y: 20, z: 100, material: 4 }], { x: 1, y: 0, z: 0 }, true);
  s.spawnRubble([{ x: 101, y: 20, z: 100, material: 4 }], { x: -1, y: 0, z: 0 }, true);
  const [a, b] = s.rubble;
  b.x = 100.8;
  const before = [a.vx, b.vx, a.x, b.x];
  const pending = () =>
    resolveRubbleContacts(s.rubble, () => 'deferred', 0, newDestructionBudget());
  expect(pending()).toBe('deferred');
  expect(pending()).toBe('deferred');
  expect([a.vx, b.vx, a.x, b.x]).toEqual(before);
  expect(resolveRubbleContacts(s.rubble, () => true)).toBe('complete');
  expect(a.vx).toBeLessThan(1);
  expect(b.vx).toBeGreaterThan(-1);
});

test('0.6 tiny-budget collision work rejects stale snapshots instead of committing old contacts', () => {
  const s = smallSimulation();
  for (const x of [100, 101]) s.spawnRubble([{ x, y: 20, z: 100, material: 4 }], undefined, true);
  const [a, b] = s.rubble;
  b.x = 100.8;
  a.vx = 1;
  b.vx = -1;
  expect(
    resolveRubbleContacts(s.rubble, () => true, 0, { ...newDestructionBudget(), probes: 1 }),
  ).toBe('deferred');
  b.x = 140;
  for (let i = 0; i < 100; i++)
    if (
      resolveRubbleContacts(s.rubble, () => true, 0, { ...newDestructionBudget(), probes: 16 }) ===
      'complete'
    )
      break;
  expect(a.vx).toBe(1);
  expect(b.vx).toBe(-1);
  expect(b.x).toBe(140);
});

test('0.6 dense support dependency cycles do not invent an anchor or recurse exponentially', () => {
  const s = smallSimulation();
  for (let x = 100; x < 116; x++)
    s.spawnRubble([{ x, y: 20, z: 100, material: 4 }], undefined, true);
  for (const b of s.rubble)
    b.support = {
      stable: true,
      point: { x: b.x, y: b.y, z: b.z },
      hull: [],
      terrain: [],
      bodies: [],
    };
  for (const b of s.rubble)
    b.support!.bodies = s.rubble
      .filter((n) => n !== b)
      .map((body) => ({
        body,
        version: body.geometryVersion,
        x: body.x,
        y: body.y,
        z: body.z,
        yaw: body.yaw,
        pitch: body.pitch,
        roll: body.roll,
      }));
  expect(groundedPath(s, s.rubble[0])).toBe(false);
  const b = s.rubble[15];
  b.support!.terrain = [{ key: s.world.index(115, 0, 100), material: 1 }];
  expect(groundedPath(s, s.rubble[0])).toBe(true);
});
