import { expect, test } from 'bun:test';
import { fractureResistance } from '../../src/core/material-physics';
import {
  claimAssignments,
  ensureCareer,
  ensureItem,
  equip,
  finishCareerMatch,
  progress,
  recordXp,
  tuning,
  validateCareer,
  xpForItemLevel,
  xpForRank,
} from '../../src/core/progression';
import type { GameEvent, MatchReport, Profile } from '../../src/core/types';
import { loadStorage, saveProfile } from '../../src/platform/storage';
import {
  aiClassBehaviour,
  healFriendly,
  resupply,
  revive,
  updateStrategy,
} from '../../src/simulation/gameplay';
import { rebuildMassProperties } from '../../src/simulation/rubble';
import { processFractures } from '../../src/simulation/section-fracture';
import { damageSection } from '../../src/simulation/section-query';
import { voxelPoint } from '../../src/simulation/section-tree';
import { solveStructuralBays } from '../../src/world/structural-bays';
import { fullSquads, smallSimulation, towerGround } from '../helpers';

const profile = (): Profile => ({ games: 0, wins: 0, kills: 0, best: 0 });
const report = (id = 'round-1'): MatchReport => ({
  id,
  endedAt: 1700000000000,
  seed: 872419,
  seconds: 400,
  result: 'victory',
  score: 2000,
  xp: 2000,
  stats: { kills: 10, captures: 2 },
  medals: [],
});
const xp = (
  points = 100,
  itemId = 'ar30',
): Extract<
  GameEvent,
  {
    type: 'xp';
  }
> => ({ type: 'xp', label: 'ELIMINATION', points, itemId, stat: 'kills', count: 1 });
function frame(floors = 4) {
  const s = smallSimulation();
  towerGround(s.world);
  s.world.cityTower(100, 100, 24, 24, floors, 0);
  return { s, w: s.world, b: s.world.buildings[0] };
}
function solve(s: ReturnType<typeof smallSimulation>, time: number) {
  for (const _ of solveStructuralBays(s.world, s.world.buildings[0], time)) {
  }
}
test('career and item level curves are monotonic with exact threshold behaviour', () => {
  for (let i = 2; i <= 100; i++) {
    expect(xpForRank(i)).toBeGreaterThan(xpForRank(i - 1));
    expect(progress(xpForRank(i)).level).toBe(i);
  }
  expect(progress(1e9).level).toBe(100);
  expect(progress(1e9, 30, true).ratio).toBe(1);
});
test('weapon sidegrades require earned mastery and do not equip automatically', () => {
  const p = profile();
  expect(equip(p, 'ar30', 'control')).toBe(false);
  ensureItem(p, 'ar30').xp = xpForItemLevel(3);
  expect(tuning(p, 'ar30').kick).toBe(1);
  expect(equip(p, 'ar30', 'control')).toBe(true);
  expect(tuning(p, 'ar30').kick).toBe(0.85);
  expect(tuning(p, 'ar30').spread).toBe(1.05);
  expect(equip(p, 'invented', 'standard')).toBe(false);
  expect(equip(p, 'ar30', 'precision')).toBe(false);
});
test('career validation rejects unearned modifiers, unsafe counters and unknown item keys', () => {
  const c = validateCareer({
    xp: Infinity,
    name: 'A\u0000B',
    items: { ar30: { xp: -8, equipped: 'precision' }, unknown: { xp: 999999 } },
    claimed: ['first_blood', 'unknown'],
    stats: { kills: NaN },
    history: [{ id: 'bad', result: 'invalid' }],
  });
  expect(c.xp).toBe(0);
  expect(c.name).toBe('AB');
  expect(c.items.ar30.equipped).toBe('standard');
  expect(c.items.unknown).toBeUndefined();
  expect(c.history).toHaveLength(0);
});
test('XP and career assignment rewards persist once without double counting kills', () => {
  const p = profile();
  for (let i = 0; i < 10; i++) recordXp(p, xp());
  expect(p.kills).toBe(10);
  expect(ensureCareer(p).xp).toBe(1400);
  expect(ensureItem(p, 'ar30').xp).toBe(1000);
  expect(claimAssignments(p)).toHaveLength(0);
});
test('match settlement is idempotent, awards earned ribbons and keeps forty reports', () => {
  const p = profile(),
    r = report();
  const first = finishCareerMatch(p, r);
  expect(first.bonus).toBe(1300);
  expect(r.medals).toHaveLength(2);
  expect(r.xp).toBe(3300);
  expect(finishCareerMatch(p, report()).duplicate).toBe(true);
  expect(p.games).toBe(1);
  for (let i = 1; i < 45; i++) finishCareerMatch(p, report('round-' + (i + 1)));
  expect(ensureCareer(p).history).toHaveLength(40);
  expect(ensureCareer(p).history[0].id).toBe('round-45');
});
test('save/load roundtrip preserves callsign, modifiers, assignments and reports', () => {
  const store = new Map<string, string>(),
    port = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
    };
  const p = profile();
  ensureCareer(p).name = 'PLAYTEST';
  for (let i = 0; i < 10; i++) recordXp(p, xp());
  equip(p, 'ar30', 'control');
  finishCareerMatch(p, report());
  expect(saveProfile(port, p)).toBe(true);
  const loaded = loadStorage(port).profile;
  expect(loaded.career?.name).toBe('PLAYTEST');
  expect(loaded.kills).toBe(p.kills);
  expect(loaded.career?.items.ar30).toEqual(p.career?.items.ar30);
  expect(loaded.career?.claimed).toEqual(p.career?.claimed);
  expect(loaded.career?.history[0].id).toBe('round-1');
  expect(saveProfile(null, p)).toBe(false);
});
test('legacy v2 counters migrate and invalid history is rejected', () => {
  const c = validateCareer({
    version: 2,
    captures: 15,
    deaths: 3,
    vehicleKills: 2,
    items: { at1: { xp: 1000, level: 80, equipped: 'precision' } },
  });
  expect(c.stats.captures).toBe(15);
  expect(c.items.at1.equipped).toBe('standard');
  expect(c.version).toBe(3);
});
test('damage assists credit the contributing weapon and expire after ten seconds', () => {
  const s = smallSimulation(),
    enemy = s.actors[10],
    ally = s.actors[1];
  s.hurt(enemy, 40, s.player, { itemId: 'dmr8' });
  s.weaponIndex = 1;
  s.hurt(enemy, 100, ally);
  const e = s.events.find((e) => e.type === 'xp' && e.stat === 'assists');
  expect(e?.type === 'xp' ? e.itemId : '').toBe('dmr8');
  expect(s.kills).toBe(0);
  const other = s.actors[11];
  s.hurt(other, 40, s.player);
  s.simTime = 11;
  s.hurt(other, 100, ally);
  expect(s.roundStats.assists).toBe(1);
});
test('headshot eliminations emit distinct feedback and real damage only', () => {
  const s = smallSimulation();
  s.hurt(s.actors[10], 2000, s.player, { itemId: 'dmr8', headshot: true });
  expect(s.handling.damage).toBe(100);
  expect(s.roundStats.headshots).toBe(1);
  expect(s.events.some((e) => e.type === 'hit' && e.headshot && e.killed)).toBe(true);
});
test('grenade XP is attributed to the projectile rather than the current weapon', () => {
  const s = smallSimulation(),
    enemy = s.actors[10];
  Object.assign(enemy, { x: 70, y: 1, z: 100 });
  s.spatial();
  s.weaponIndex = 1;
  s.explode({ x: 70, y: 2, z: 100 }, 4, s.player, 300, { itemId: 'frag' });
  expect(s.events.some((e) => e.type === 'xp' && e.stat === 'kills' && e.itemId === 'frag')).toBe(
    true,
  );
});
test('revive refunds exactly one reserve and cannot be farmed on a living soldier', () => {
  const s = smallSimulation(),
    ally = s.actors[1];
  Object.assign(ally, { x: s.player.x + 2, y: 1, z: s.player.z });
  s.hurt(ally, 200, s.actors[10]);
  expect(s.tickets[0]).toBe(5999);
  expect(revive(s, s.player, ally)).toBe(true);
  expect(ally.hp).toBe(50);
  expect(s.tickets[0]).toBe(6000);
  expect(revive(s, s.player, ally)).toBe(false);
  expect(s.roundStats.revives).toBe(1);
});
test('revival fails after its window or through an obstruction', () => {
  const s = smallSimulation(),
    ally = s.actors[1];
  Object.assign(ally, { x: s.player.x + 2, y: 1, z: s.player.z });
  s.hurt(ally, 200, s.actors[10]);
  s.simTime = 9;
  expect(revive(s, s.player, ally)).toBe(false);
  s.simTime = 0;
  for (let y = 1; y < 4; y++) s.world.setRaw(31, y, 30, 4);
  expect(revive(s, s.player, ally)).toBe(false);
});
test('medic and support XP requires a useful friendly action', () => {
  const s = smallSimulation(),
    ally = s.actors[1];
  Object.assign(ally, { x: 32, y: 1, z: 30, hp: 50, clip: 0 });
  expect(healFriendly(s, s.player, s.player)).toBe(false);
  expect(healFriendly(s, s.player, ally)).toBe(true);
  expect(ally.hp).toBe(85);
  expect(resupply(s, s.player, ally)).toBe(true);
  expect(resupply(s, s.player, ally)).toBe(false);
  expect(s.roundStats.resupplies).toBe(1);
  expect(healFriendly(s, s.player, s.actors[10])).toBe(false);
});
test('AI medic revives a downed squadmate without crediting the player', () => {
  const s = fullSquads(),
    medic = s.actors[1],
    ally = s.actors[2];
  Object.assign(medic, {
    alive: true,
    kit: 'medic',
    x: 30,
    y: 1,
    z: 30,
    lastHit: -100,
    supportReady: 0,
  });
  Object.assign(ally, { alive: false, x: 32, y: 1, z: 30, reviveUntil: 8, vehicle: null });
  s.simTime = 1;
  aiClassBehaviour(s, medic);
  expect(ally.alive).toBe(false);
  s.simTime += 0.9;
  aiClassBehaviour(s, medic);
  expect(ally.alive).toBe(true);
  expect(s.roundStats.revives).toBeUndefined();
});
test('self aid at full health produces no XP and does not consume cooldown', () => {
  const s = smallSimulation();
  s.heal();
  expect(s.abilityClock).toBe(0);
  expect(s.events.filter((e) => e.type === 'xp')).toHaveLength(0);
  s.player.hp = 50;
  s.heal();
  expect(s.player.hp).toBe(95);
  expect(s.abilityClock).toBeGreaterThan(0);
});
test('spotting accepts elevated visible targets, rejects walls, and has per-target XP cooldown', () => {
  const s = smallSimulation(),
    enemy = s.actors[10];
  Object.assign(enemy, { x: 40, y: 12, z: 30 });
  expect(s.pingAt(enemy, enemy.id)).toBe(true);
  expect(s.roundStats.spots).toBe(1);
  s.pingAt(enemy, enemy.id);
  expect(s.roundStats.spots).toBe(1);
  for (let y = 1; y < 20; y++) s.world.setRaw(35, y, 30, 4);
  expect(s.pingAt(enemy, enemy.id)).toBe(false);
  for (let i = 0; i < 30; i++) s.pingAt({ x: i, y: 1, z: 20 });
  expect(s.pings.length).toBeLessThanOrEqual(16);
});
for (let id = 0; id < 9; id++)
  test(`sector ${String.fromCharCode(65 + id)} captures, awards XP and contributes control`, () => {
    const s = smallSimulation(),
      f = s.world.flags[id];
    for (const a of s.actors) a.alive = false;
    Object.assign(s.player, { alive: true, x: f.x, y: s.world.groundAt(f.x, f.z), z: f.z });
    f.owner = -1;
    f.value = 0.99;
    s.spatial();
    s.capture(0.4);
    expect(Number(f.owner)).toBe(0);
    expect(s.roundStats.captures).toBe(1);
    expect(s.controlTime[0]).toBeGreaterThan(0);
  });
test('strategic squad selection preserves manual player orders', () => {
  const s = fullSquads();
  s.player.alive = true;
  const q = s.squads[s.player.squadId];
  expect(s.issueOrder({ kind: 'objective', objective: 8 })).toBe(true);
  for (let i = 0; i < 30; i++) {
    s.simTime++;
    updateStrategy(s);
  }
  expect(q.route).toBe(8);
  expect(new Set(s.squads.map((q) => q.route)).size).toBeGreaterThan(3);
});
test('all front-end career screens suspend simulation input', () => {
  const s = smallSimulation();
  for (const room of [
    'home',
    'loadouts',
    'barracks',
    'challenges',
    'options',
    'results',
  ] as const) {
    s.setScreen(room);
    expect(s.playing).toBe(false);
    expect(s.acceptsInput).toBe(false);
  }
});
test('authored structural frame has columns, beams, core and stable initial capacities', () => {
  const { s, b } = frame(6);
  solve(s, 0.1);
  expect(b.structure!.bays).toHaveLength(54);
  expect(b.structure!.members.some((m) => m.kind === 'core')).toBe(true);
  expect(b.structure!.members.some((m) => m.kind === 'beam')).toBe(true);
  expect(b.structure!.maxStress).toBeLessThan(1);
  expect(b.structure!.failures).toBe(0);
});
test('removing one column redistributes load without immediate tower collapse', () => {
  const { s, w, b } = frame();
  const model = b.structure!,
    bay = model.bays[0],
    member = model.members[bay.column];
  for (const p of member.sections[0]) w.removeVoxel(p.x, p.y, p.z);
  solve(s, 0.1);
  expect(member.health).toBe(0);
  expect(model.failures).toBe(0);
  expect(model.bays[1].load).toBeGreaterThan(model.bays[1].designLoad);
});
test('sustained overload fails local members, not an entire horizontal storey', () => {
  const { s, w, b } = frame(6),
    model = b.structure!;
  for (const bay of model.bays.slice(0, 9))
    if (bay.id !== 4) {
      const m = model.members[bay.column];
      for (const p of m.sections[0]) w.removeVoxel(p.x, p.y, p.z);
    }
  solve(s, 0.1);
  expect(model.failures).toBe(0);
  expect(model.unstable).toBe(true);
  for (let i = 2; i < 35 && model.failures === 0; i++) solve(s, i * 0.1);
  expect(model.failures).toBeGreaterThan(0);
  expect(w.cell(100, 5, 100)).not.toBe(0);
  expect(b.fractureHeight).toBeUndefined();
});
test('partial member damage reduces capacity before a voxel is removed', () => {
  const { s, w, b } = frame(),
    member = b.structure!.members.find((m) => m.kind === 'column')!,
    p = member.sections[0][0];
  w.damage.set(w.index(p.x, p.y, p.z), fractureResistance(w.cell(p.x, p.y, p.z)) * 0.75);
  solve(s, 0.1);
  expect(member.health).toBeCloseTo(0.25);
  expect(w.cell(p.x, p.y, p.z)).not.toBe(0);
});
test('a stale structural calculation cannot erase a freshly repaired member', () => {
  const { s, w, b } = frame(),
    member = b.structure!.members[0],
    p = member.sections[0][0];
  const job = solveStructuralBays(w, b, 1);
  job.next();
  w.setRaw(p.x, p.y, p.z, 12);
  for (const _ of job) {
  }
  expect(w.cell(p.x, p.y, p.z)).toBe(12);
  expect(b.dirty).toBe(true);
  expect(s.rubble).toHaveLength(0);
});
test('partial settlement rebuilds mass properties without moving retained rotated voxels', () => {
  const s = smallSimulation();
  s.spawnRubble(
    [
      { x: 100, y: 20, z: 100, material: 4 },
      { x: 101, y: 20, z: 100, material: 12 },
      { x: 102, y: 20, z: 100, material: 4 },
    ],
    undefined,
    true,
  );
  const b = s.rubble[0];
  b.yaw = 0.6;
  b.pitch = 0.3;
  b.roll = 0.2;
  const before = voxelPoint(b, 1);
  b.voxels.shift();
  rebuildMassProperties(b);
  const after = voxelPoint(b, 0);
  expect(after.x).toBeCloseTo(before.x, 7);
  expect(after.y).toBeCloseTo(before.y, 7);
  expect(after.z).toBeCloseTo(before.z, 7);
  expect(b.mass).toBeCloseTo(4.2);
});
test('more than four disconnected pieces are published progressively without material loss', () => {
  const s = smallSimulation();
  s.spawnRubble(
    Array.from({ length: 13 }, (_, i) => ({ x: 100 + i, y: 20, z: 100, material: 4 })),
    undefined,
    true,
  );
  const parent = s.rubble[0];
  for (let i = 11; i >= 1; i -= 2) damageSection(parent, i, 1000);
  for (let i = 0; i < 500 && s.rubble.length < 7; i++) processFractures(s);
  expect(s.rubble).toHaveLength(7);
  expect(s.rubble.reduce((n, b) => n + b.voxels.length, 0)).toBe(7);
  expect(s.rubble.filter((b) => b.primary)).toHaveLength(1);
});
