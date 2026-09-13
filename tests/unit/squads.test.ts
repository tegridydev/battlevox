import { expect, test } from 'bun:test';
import { fullSquads } from '../helpers';

function liveLeader() {
  const s = fullSquads();
  s.changeMembership(0, 'member');
  const leader = s.actors[s.squads[0].leaderId];
  Object.assign(leader, { alive: true, x: 100, y: 1, z: 100, lastHit: -100, onGround: true });
  s.simTime = 10;
  return { s, leader };
}
test('100 permanent squads contain all 1,000 actor IDs once', () => {
  const s = fullSquads();
  expect(s.squads).toHaveLength(100);
  expect(new Set(s.squads.flatMap((q) => q.memberIds)).size).toBe(1000);
  for (const q of s.squads) {
    expect(q.memberIds).toHaveLength(10);
    expect(q.memberIds.includes(q.leaderId)).toBe(true);
    expect(q.memberIds.every((id) => s.actors[id].team === q.team)).toBe(true);
  }
});
test('squad changes and leadership swaps preserve population invariants', () => {
  const s = fullSquads();
  expect(s.changeMembership(5, 'leader')).toBe(true);
  expect(s.squads[5].leaderId).toBe(0);
  expect(s.squads[0].leaderId).not.toBe(0);
  s.changeMembership(5, 'member');
  expect(s.squads[5].leaderId).not.toBe(0);
  expect(s.changeMembership(50, 'leader')).toBe(false);
  expect(new Set(s.squads.flatMap((q) => q.memberIds)).size).toBe(1000);
});
test('only a living squad leader can issue orders', () => {
  const s = fullSquads();
  s.player.alive = true;
  expect(s.issueOrder({ kind: 'follow' })).toBe(true);
  s.changeMembership(0, 'member');
  expect(s.issueOrder({ kind: 'objective' })).toBe(false);
});
test('safe leader spawning rejects dead, airborne, threatened leaders and enemies', () => {
  const { s, leader } = liveLeader();
  expect(s.leaderSpawn(s.player).position).not.toBeNull();
  leader.alive = false;
  expect(s.leaderSpawn(s.player).reason).toContain('down');
  leader.alive = true;
  leader.onGround = false;
  expect(s.leaderSpawn(s.player).position).toBeNull();
  leader.onGround = true;
  leader.lastHit = 9;
  expect(s.leaderSpawn(s.player).reason).toContain('combat');
  leader.lastHit = -100;
  Object.assign(s.actors[500], { alive: true, x: 100, z: 100, y: 1 });
  expect(s.leaderSpawn(s.player).position).toBeNull();
});
test('manual deployment revalidates leader and failures do not charge tickets', () => {
  const { s, leader } = liveLeader();
  s.selectedRole = 'member';
  s.spawnTarget = 'leader';
  leader.alive = false;
  expect(s.deploy()).toBe(false);
  expect(s.tickets[0]).toBe(6000);
  expect(s.player.alive).toBe(false);
  leader.alive = true;
  expect(s.deploy()).toBe(true);
  expect(s.player.alive).toBe(true);
  expect(Math.hypot(s.player.x - leader.x, s.player.z - leader.z)).toBeLessThanOrEqual(8.01);
});
test('AI members fall back to base when leader is dead', () => {
  const s = fullSquads();
  const a = s.actors[1];
  expect(s.safeSpawn(a)).toBe(true);
  expect(a.x).toBeLessThan(86);
  expect(s.squads[0].leaderId).toBe(0);
});
test('follow targets are bounded, spaced and unreachable positions do not teleport', () => {
  const { s } = liveLeader();
  s.squads[0].order = { kind: 'follow' };
  const a = s.actors[2];
  Object.assign(a, { x: 90, y: 1, z: 100, alive: true });
  const point = s.squadTarget(a);
  expect(point).not.toBeNull();
  expect(point!.x).toBeLessThanOrEqual(100);
  expect(a.x).toBe(90);
  s.world.navOpen.fill(0);
  s.localRoutes.clear();
  expect(s.squadTarget(a)).toEqual({ x: a.x, y: a.y, z: a.z });
  expect(s.squads[0].blocked).toBe(true);
});
