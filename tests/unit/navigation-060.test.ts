import { expect, test } from 'bun:test';
import { PoseHistory } from '../../src/core/interpolation';
import {
  layerPath,
  navigationFrontiers,
  routeActor,
  travelLift,
  walkSegment,
} from '../../src/simulation/navigation';
import {
  observeContact,
  squadCombatIntent,
  squadContact,
  updateSquadLeadership,
} from '../../src/simulation/tactics';
import { fullSquads, smallSimulation, towerGround } from '../helpers';

test('0.6 layered navigation retains a small-budget frontier across unrelated terrain edits', () => {
  const s = smallSimulation(),
    from = { x: 100.5, y: 1, z: 100.5 },
    to = { x: 116.5, y: 1, z: 100.5 };
  let r = layerPath(s, from, to, 1);
  expect(r.status).toBe('pending');
  const frontier = r.search;
  s.world.setRaw(300, 1, 300, 4);
  r = layerPath(s, from, to, 1, r.search);
  expect(r.search).toBe(frontier);
  for (let i = 0; i < 100 && r.status === 'pending'; i++) r = layerPath(s, from, to, 8, r.search);
  expect(r.status).toBe('reachable');
  expect(r.path[r.path.length - 1]).toEqual(to);
});

test('0.6 layered navigation routes around physical rubble and does not walk through it', () => {
  const s = smallSimulation(),
    from = { x: 100.5, y: 1, z: 100.5 },
    to = { x: 108.5, y: 1, z: 100.5 };
  s.spawnRubble(
    [1, 2, 3].flatMap((y) => [99, 100, 101].map((z) => ({ x: 104, y, z, material: 4 }))),
    undefined,
    true,
  );
  s.rubble[0].sleeping = true;
  expect(walkSegment(s, from, to)).toBe(false);
  let r = layerPath(s, from, to, 128);
  for (let i = 0; i < 20 && r.status === 'pending'; i++) r = layerPath(s, from, to, 128, r.search);
  expect(r.status).toBe('reachable');
  expect(r.path.some((p) => p.z < 99 || p.z > 102)).toBe(true);
});

test('0.6 authored lift links connect distinct floor layers with validated destinations', () => {
  const s = smallSimulation();
  towerGround(s.world);
  s.world.cityTower(100, 100, 24, 24, 3, 0);
  const b = s.world.buildings[0],
    from = { x: b.lift.x, y: 5, z: b.lift.z },
    to = { ...from, y: 15 };
  let r = layerPath(s, from, to, 128);
  for (let i = 0; i < 100 && r.status === 'pending'; i++) r = layerPath(s, from, to, 128, r.search);
  expect(r.status).toBe('reachable');
  expect(r.path.some((p) => p.lift !== undefined)).toBe(true);
  Object.assign(s.player, from);
  expect(travelLift(s, s.player, 0, 1)).toBe(true);
  expect(s.player.y).toBe(10);
  expect(travelLift(s, s.player, 0, 2)).toBe(false);
  s.simTime = 2;
  s.world.removeVoxel(Math.floor(b.lift.x), 14, Math.floor(b.lift.z));
  expect(travelLift(s, s.player, 0, 2)).toBe(false);
});

test('0.6 aggregate actor navigation frontiers are memory bounded', () => {
  const s = fullSquads();
  s.navigationBudget = 10000;
  for (const a of s.actors.slice(0, 100)) {
    Object.assign(a, { x: 100.5, y: 1, z: 100.5, alive: true });
    routeActor(s, a, { x: 130.5, y: 1, z: 130.5 });
  }
  expect(navigationFrontiers(s)).toBeLessThanOrEqual(64);
  s.dispose();
  expect(navigationFrontiers(s)).toBe(0);
});

test('0.6 squad intelligence expires and cannot follow a hidden moving enemy', () => {
  const s = smallSimulation();
  s.createSquads();
  const observer = s.actors[1],
    member = s.actors[2],
    enemy = s.actors[10];
  observeContact(s, observer, enemy);
  const x = enemy.x;
  enemy.x += 40;
  expect(squadContact(s, member)!.x).toBe(x);
  s.simTime = 6.1;
  expect(squadContact(s, member)).toBeNull();
});

test('0.6 NPC squad leadership is replaced after a casualty without stealing the player role', () => {
  const s = smallSimulation();
  s.createSquads();
  const q = s.squads[1],
    old = q.leaderId;
  s.actors[old].alive = false;
  updateSquadLeadership(s);
  expect(q.leaderId).toBe(old);
  s.simTime = 1.1;
  updateSquadLeadership(s);
  expect(q.leaderId).not.toBe(old);
  s.player.alive = false;
  updateSquadLeadership(s);
  s.simTime = 3;
  updateSquadLeadership(s);
  expect(s.squads[0].leaderId).toBe(s.player.id);
});

test('0.6 coordinated flanking requires a live covering fireteam', () => {
  const s = smallSimulation();
  s.createSquads();
  const cover = s.actors[1],
    mover = s.actors[6],
    enemy = s.actors[10];
  for (const a of s.actors.slice(0, 10)) a.target = null;
  mover.target = enemy;
  observeContact(s, cover, enemy);
  expect(squadCombatIntent(s, mover)).toBeNull();
  cover.target = enemy;
  cover.reload = 0;
  expect(squadCombatIntent(s, mover)?.tactic).toBe('BOUND / FLANK');
  s.squads[0].order.kind = 'hold';
  expect(squadCombatIntent(s, mover)).toBeNull();
});

test('0.6 render interpolation is presentation-only and resets on teleport', () => {
  const h = new PoseHistory(),
    a = { x: 0, y: 1, z: 0, yaw: Math.PI - 0.1, alive: true, poseEpoch: 0 };
  h.capture([a]);
  a.x = 2;
  a.yaw = -Math.PI + 0.1;
  const v = h.interpolate(a, 0.5);
  expect(v.x).toBe(1);
  expect(a.x).toBe(2);
  expect(Math.abs(v.yaw - Math.PI)).toBeLessThan(0.001);
  a.poseEpoch++;
  expect(h.interpolate(a, 0)).toBe(a);
  h.reset();
  expect(h.interpolate(a, 0.5)).toBe(a);
});
