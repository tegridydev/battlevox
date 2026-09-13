import { expect, test } from 'bun:test';
import { destructionLimits, STEP } from '../../src/core/config';
import { Simulation } from '../../src/simulation/simulation';
import { fixtureSettings } from '../helpers';

test('two undermined towers fall during a full-population live battle', () => {
  const s = new Simulation({ ...fixtureSettings });
  s.reset();
  expect(s.deploy()).toBe(true);
  const buildings = [...s.world.buildings].sort((a, b) => a.floors - b.floors).slice(0, 2);
  for (const b of buildings)
    for (let z = b.z; z < b.z + b.d; z++)
      for (let x = b.x; x < b.x + b.w; x++) s.world.removeVoxel(x, b.base + 1, z);
  let secondaryPeak = 0;
  for (let i = 0; i < 360 && !s.ended; i++) {
    s.fixedUpdate(STEP);
    s.events.length = 0;
    secondaryPeak = Math.max(secondaryPeak, s.rubble.filter((b) => !b.primary).length);
    expect(s.rubble.every((b) => Number.isFinite(b.x + b.y + b.z + b.vx + b.vy + b.vz))).toBe(true);
  }
  for (const b of buildings) expect(s.world.cell(b.x + 10, b.base + b.h, b.z + 10)).toBe(0);
  expect(s.actors).toHaveLength(1000);
  expect(secondaryPeak).toBeLessThanOrEqual(destructionLimits.rubbleBodies);
  expect(s.world.rubbleCells.size).toBeLessThanOrEqual(destructionLimits.rubbleCells);
}, 20000);

test('incremental generation can be cancelled without continuing voxel edits', () => {
  const s = new Simulation(),
    job = s.world.generateSteps();
  job.next();
  job.next();
  const revision = s.world.revision;
  job.return();
  expect(job.next().done).toBe(true);
  expect(s.world.revision).toBe(revision);
});
