import { expect, test } from 'bun:test';
import { destructionLimits as limits, STEP } from '../../src/core/config';
import { Simulation } from '../../src/simulation/simulation';
import { fixtureSettings, fullSquads, towerGround } from '../helpers';

test('structural city has a fixed seed digest and deterministic round resets', () => {
  const s = new Simulation({ ...fixtureSettings });
  s.reset();
  const hash = () => new Bun.CryptoHasher('sha256').update(s.world.vox).digest('hex');
  expect(hash()).toBe('79a8b7efe16b293dd80b355762dfc2b93d78152711d1a478e2193751eed36a1a');
  expect(s.world.buildings).toHaveLength(100);
  expect(s.world.buildings.every((b) => !b.dirty)).toBe(true);
  const snapshot = s.actors.map((a) => [a.x, a.y, a.z]);
  s.deploy();
  s.input.aim = true;
  for (let i = 0; i < 60; i++) s.fixedUpdate(STEP);
  s.reset();
  expect(s.actors.map((a) => [a.x, a.y, a.z])).toEqual(snapshot);
  expect(s.input.aim).toBe(false);
  expect(s.actors).toHaveLength(1000);
  expect(s.vehicles).toHaveLength(12);
  expect(s.squads).toHaveLength(100);
  expect(s.events).toHaveLength(0);
  expect(s.menuState).toBe('deployment');
  expect(s.playing).toBe(false);
}, 15000);
test('full population advances through combat with finite state and bounded effects', () => {
  const s = new Simulation({ ...fixtureSettings });
  s.reset();
  expect(s.deploy()).toBe(true);
  for (let i = 0; i < 1800 && !s.ended; i++) {
    s.fixedUpdate(STEP);
    s.events.length = 0;
  }
  expect(s.simTime).toBeGreaterThan(30);
  expect(s.actors).toHaveLength(1000);
  expect(s.actors.every((a) => Number.isFinite(a.x + a.y + a.z + a.hp))).toBe(true);
  expect(s.particles.length).toBeLessThanOrEqual(420);
  expect(s.projectiles.length).toBeLessThanOrEqual(110);
  expect(s.tracers.length).toBeLessThanOrEqual(180);
  expect(s.squads.every((q) => q.memberIds.length === 10)).toBe(true);
}, 60000);

test('a twenty-storey collapse drains its work queue with bounded physics and finite state', () => {
  const s = fullSquads();
  s.spatial();
  towerGround(s.world);
  s.world.cityTower(100, 100, 24, 24, 20, 0);
  for (let z = 100; z < 124; z++)
    for (let x = 100; x < 124; x++) if (x !== 100 || z !== 100) s.world.removeVoxel(x, 5, z);
  let maximum = 0,
    detached = 0,
    valid = true;
  for (let i = 0; i < 1800; i++) {
    s.simTime += STEP;
    s.advanceCollapse();
    s.updateRubble(STEP);
    maximum = Math.max(maximum, s.rubble.filter((b) => !b.primary).length);
    detached = Math.max(detached, s.rubble.length);
    valid &&= s.rubble.every((b) =>
      [b.x, b.y, b.z, b.vx, b.vy, b.vz, b.yaw, b.pitch, b.roll].every(Number.isFinite),
    );
    valid &&= s.dust.length <= limits.dustClouds && s.world.rubbleCells.size <= limits.rubbleCells;
    s.events.length = 0;
  }
  expect(maximum).toBeLessThanOrEqual(limits.rubbleBodies);
  // Detachment is required. Secondary fracture requires sufficient impact energy;
  // a short settling drop must not fracture purely from resting support forces.
  expect(detached).toBeGreaterThan(0);
  expect(s.destructionStats.clampedTime).toBe(0);
  expect(valid).toBe(true);
  expect(s.rubble.every((body) => body.sleeping)).toBe(true);
  expect(s.collapseTask).toBeNull();
  expect(s.world.buildings[0].dirty).toBe(false);
  expect(s.world.cell(110, 104, 110)).toBe(0);
  expect(s.actors).toHaveLength(1000);
}, 60000);
