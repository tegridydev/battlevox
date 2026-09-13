import { expect, spyOn, test } from 'bun:test';
import { newDestructionBudget } from '../../src/simulation/destruction-budget';
import { probeSupport } from '../../src/simulation/rubble-support';
import { invalidateSections } from '../../src/simulation/section-index';
import { terrainContacts } from '../../src/simulation/terrain-contact';
import { smallSimulation } from '../helpers';

test('terrain queries resume across tiny time slices despite distant combat edits', () => {
  const s = smallSimulation();
  const cells = Array.from({ length: 144 }, (_, i) => ({
    x: 100 + (i % 12),
    y: 5,
    z: 100 + Math.floor(i / 12),
    material: 4,
  }));
  s.spawnRubble(cells, undefined, true);
  const b = s.rubble[0];
  s.world.setRaw(100, 4, 100, 4);
  let now = 0,
    frames = 0;
  const clock = spyOn(performance, 'now').mockImplementation(() => (now += 0.1));
  try {
    let result: ReturnType<typeof terrainContacts> = { kind: 'deferred' };
    for (; frames < 1500 && result.kind === 'deferred'; frames++) {
      s.world.setRaw(300, 2, 300, frames % 2 ? 4 : 0);
      s.destructionBudget = { ...newDestructionBudget(), deadline: now + 0.55 };
      result = terrainContacts(s, b, b.x, b.y - 0.1, b.z, b, true);
    }
    expect(frames).toBeGreaterThan(1);
    expect(frames).toBeLessThan(1500);
    expect(result.kind).toBe('contact');
    if (result.kind === 'contact')
      expect(result.contacts.some((c) => c.terrain === s.world.index(100, 4, 100))).toBe(true);
    // Nearby edits must discard both completed and in-flight results.
    s.world.removeVoxel(100, 4, 100);
    s.destructionBudget = null;
    expect(terrainContacts(s, b, b.x, b.y - 0.1, b.z, b, true).kind).toBe('clear');
  } finally {
    clock.mockRestore();
  }
});

test('removed rubble cannot remain in cached terrain support contacts', () => {
  const s = smallSimulation();
  s.world.setRaw(100, 1, 100, 4);
  s.spawnRubble([{ x: 101, y: 1, z: 100, material: 4 }], undefined, true);
  s.spawnRubble(
    [
      { x: 100, y: 2, z: 100, material: 4 },
      { x: 101, y: 2, z: 100, material: 4 },
    ],
    undefined,
    true,
  );
  const [lower, upper] = s.rubble;
  lower.support = {
    stable: true,
    point: { x: 101.5, y: 1, z: 100.5 },
    hull: [],
    terrain: [{ key: s.world.index(101, 0, 100), material: 1 }],
    bodies: [],
  };
  const first = probeSupport(s, upper);
  expect(first.kind).toBe('contact');
  if (first.kind === 'contact') expect(first.contacts.some((c) => c.body === lower)).toBe(true);
  s.rubble.splice(0, 1);
  invalidateSections(s);
  const next = probeSupport(s, upper);
  expect(next.kind).toBe('contact');
  if (next.kind === 'contact') expect(next.contacts.every((c) => c.body === undefined)).toBe(true);
  expect(upper.support?.bodies).toHaveLength(0);
});

test('overdue fragments all receive motion work under a constrained clock', () => {
  const s = smallSimulation();
  for (let i = 0; i < 8; i++)
    s.spawnRubble([{ x: 40 + i * 40, y: 30, z: 180, material: 4 }], undefined, true);
  const bodies = [...s.rubble];
  let now = 0;
  const clock = spyOn(performance, 'now').mockImplementation(() => (now += 0.3));
  try {
    for (let frame = 0; frame < 240; frame++) s.updateRubble(1 / 30);
  } finally {
    clock.mockRestore();
  }
  for (const b of bodies) {
    expect(b.age).toBeGreaterThan(0.05);
    expect(b.y).toBeLessThan(30);
  }
});
