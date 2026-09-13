import { expect, test } from 'bun:test';
import { connectedSurface, localPath } from '../../src/world/pathfinding';
import { World } from '../../src/world/world';
import { flatWorld } from '../helpers';

test('voxel bounds reject fractional and outside coordinates', () => {
  const w = new World();
  w.setRaw(-1, 2, 3, 4);
  w.setRaw(0.5, 2, 3, 4);
  expect(w.vox.some(Boolean)).toBe(false);
  w.setRaw(15, 2, 15, 4);
  expect(w.cell(15, 2, 15)).toBe(4);
  expect(w.cell(512, 2, 15)).toBe(0);
});
test('destroying highest voxel updates column height and queues adjacent chunks', () => {
  const w = flatWorld();
  w.setRaw(15, 5, 15, 4);
  w.removeVoxel(15, 5, 15);
  expect(w.floorAt(15, 15)).toBe(1);
  expect(w.dirtyQueue.has(0)).toBe(true);
  expect(w.dirtyQueue.has(1)).toBe(true);
  expect(w.dirtyQueue.has(32)).toBe(true);
  expect(w.removeVoxel(15, 0, 15)).toBe(0);
});
test('DDA returns exact entry and handles axis-parallel misses', () => {
  const w = new World();
  w.setRaw(5, 5, 5, 4);
  expect(w.raycast({ x: 1.5, y: 5.5, z: 5.5 }, { x: 1, y: 0, z: 0 }, 10)?.t).toBe(3.5);
  expect(w.raycast({ x: 1.5, y: 4.5, z: 5.5 }, { x: 1, y: 0, z: 0 }, 10)).toBeNull();
  expect(w.raycast({ x: 5.5, y: 5.5, z: 5.5 }, { x: 0, y: 0, z: 0 }, 0)?.t).toBe(0);
});
test('greedy mesh joins cubes and omits faces across chunk seams', () => {
  const w = new World();
  w.setRaw(15, 2, 5, 4);
  w.setRaw(16, 2, 5, 4);
  w.rebuild(w.chunks[0]);
  w.rebuild(w.chunks[1]);
  expect(w.chunks[0].count).toBe(30);
  expect(w.chunks[1].count).toBe(30);
  expect([...w.chunks[0].mesh].every(Number.isFinite)).toBe(true);
  w.removeVoxel(16, 2, 5);
  w.rebuild(w.chunks[0]);
  expect(w.chunks[0].count).toBe(36);
});
test('local navigation reports unreachable targets and finds a path around cover', () => {
  const w = flatWorld();
  const start = { x: 21, y: 1, z: 21 },
    goal = { x: 29, y: 1, z: 21 };
  w.navOpen[10 * 256 + 12] = 0;
  const path = localPath(w, start, goal);
  expect(path.reachable).toBe(true);
  expect(path.point).not.toEqual(start);
  w.navOpen.fill(0);
  expect(localPath(w, start, goal).reachable).toBe(false);
});
test('leader surface checks reject gaps and overhead obstruction', () => {
  const w = flatWorld(),
    from = { x: 30, y: 1, z: 30 },
    to = { x: 35, y: 1, z: 30 };
  expect(connectedSurface(w, from, to)).toBe(true);
  w.setRaw(33, 2, 30, 4);
  expect(connectedSurface(w, from, to)).toBe(false);
});
test('navigation publishes complete fields atomically and notices edits during a rebuild', () => {
  const w = flatWorld();
  const old = w.fields;
  w.navDirty = true;
  w.navCooldown = 0;
  w.advanceNavigation(1);
  expect(w.fields).toBe(old);
  w.setRaw(41, 1, 41, 4);
  while (w.navigationTask) w.advanceNavigation(16);
  expect(w.fields).not.toBe(old);
  expect(w.fields).toHaveLength(9);
  expect(w.navDirty).toBe(true);
  expect(w.navHeight[20 * 256 + 20]).toBe(2);
});

test('cancelled preparation is not marked ready and resets generation state', () => {
  const world = new World();
  let calls = 0;
  world.generateSteps = function* () {
    calls++;
    this.generating = true;
    yield;
    this.generating = false;
  };
  const pending = world.prepareSteps(123);
  pending.next();
  expect(world.generating).toBe(true);
  pending.return();
  expect(world.generating).toBe(false);
  for (const _ of world.prepareSteps(123)) {
  }
  expect(calls).toBe(2);
  for (const _ of world.prepareSteps(123)) {
  }
  expect(calls).toBe(2);
});
