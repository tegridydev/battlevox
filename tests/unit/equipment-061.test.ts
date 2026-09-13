import { expect, spyOn, test } from 'bun:test';
import { STEP, weapons } from '../../src/core/config';
import { initActorEquipment } from '../../src/core/loadout';
import { direction } from '../../src/core/math';
import type { Kit, Vec3 } from '../../src/core/types';
import { deploy, refill, smoke, tickEquipment } from '../../src/simulation/equipment';
import { canSee, smokeDepth } from '../../src/simulation/perception';
import { predictGrenade } from '../../src/simulation/projectile-flight';
import { clearSegment } from '../../src/simulation/section-query';
import { smallSimulation } from '../helpers';

function isolated(kit: Kit = 'medic') {
  const s = smallSimulation();
  for (const a of s.actors) a.alive = a.player;
  s.player.kit = kit;
  s.activeKit = kit;
  initActorEquipment(s.player, 0);
  s.spatial();
  return s;
}
test('0.6.1 smoke occludes observations on the same segment but bullets still hit', () => {
  const s = isolated(),
    p = s.player,
    e = s.actors[10];
  Object.assign(p, { x: 100, z: 100, y: 1 });
  Object.assign(e, { x: 120, z: 100, y: 1, alive: true, shield: 0 });
  s.spatial();
  const a = { x: 100, y: 2, z: 100 },
    b = { x: 120, y: 2, z: 100 };
  smoke(s, { x: 110, y: 1, z: 100 }, p);
  tickEquipment(s, 2);
  expect(smokeDepth(s, a, b)).toBeGreaterThan(8);
  expect(canSee(s, a, b)).toBe(false);
  expect(clearSegment(s, a, b)).toBe(true);
  expect(smokeDepth(s, a, { x: 103, y: 2, z: 100 })).toBe(0);
  s.bullet(p, a, { x: 1, y: 0, z: 0 }, 30);
  expect(e.hp).toBeLessThan(100);
  tickEquipment(s, 20);
  expect(canSee(s, a, b)).toBe(true);
  s.dispose();
});
test('0.6.1 smoke growth, expiry and fixed cloud cap are bounded and reset owns their lifetime', () => {
  const s = isolated();
  for (let i = 0; i < 16; i++) smoke(s, { x: 60 + i, y: 1, z: 70 }, s.player);
  expect(s.smokeClouds).toHaveLength(12);
  expect(smokeDepth(s, { x: 55, y: 2, z: 70 }, { x: 85, y: 2, z: 70 })).toBe(0);
  tickEquipment(s, 2);
  expect(s.smokeClouds.every((c) => c.age === 2 && c.life === 12)).toBe(true);
  s.cancelWork();
  expect(s.smokeClouds).toHaveLength(0);
  expect(s.deployables).toHaveLength(0);
  s.dispose();
});
test('0.6.1 blocked smoke throws do not consume inventory and smoke never causes explosive damage', () => {
  const s = isolated();
  s.yaw = 0;
  s.pitch = 0;
  const p = s.player;
  for (let x = 29; x <= 30; x++) for (let y = 1; y < 4; y++) s.world.setRaw(x, y, 30, 4);
  expect(s.throwSmoke()).toBe(false);
  expect(s.smokeGrenades).toBe(2);
  for (let x = 29; x <= 30; x++) for (let y = 1; y < 4; y++) s.world.removeVoxel(x, y, 30);
  const boom = spyOn(s, 'explode');
  try {
    expect(s.throwSmoke()).toBe(true);
    expect(s.smokeGrenades).toBe(1);
    for (let i = 0; i < 40; i++) s.updateProjectiles(STEP);
    expect(s.smokeClouds).toHaveLength(1);
    expect(boom).toHaveBeenCalledTimes(0);
    expect(p.hp).toBe(100);
  } finally {
    boom.mockRestore();
    s.dispose();
  }
});
test('0.6.1 grenade prediction agrees with live flight through the complete fuse and wall bounce', () => {
  for (const wall of [false, true]) {
    const s = isolated('assault'),
      o = { x: 100, y: 2.62, z: 100 },
      dir = direction(Math.PI / 2, 0.38);
    if (wall)
      for (let z = 97; z < 104; z++) for (let y = 1; y < 9; y++) s.world.setRaw(111, y, z, 4);
    const expected = predictGrenade(s, o, dir);
    expect(expected).not.toBeNull();
    let result: Vec3 | undefined;
    const boom = spyOn(s, 'explode').mockImplementation((p: Vec3) => {
      result = { ...p };
    });
    try {
      expect(s.launch(s.player, o, dir, 'grenade')).toBe(true);
      for (let i = 0; i < 82 && s.projectiles.length; i++) s.updateProjectiles(STEP);
      expect(result).not.toBeUndefined();
      expect(result!.x).toBeCloseTo(expected!.x, 5);
      expect(result!.y).toBeCloseTo(expected!.y, 5);
      expect(result!.z).toBeCloseTo(expected!.z, 5);
    } finally {
      boom.mockRestore();
      s.dispose();
    }
  }
});
test('0.6.1 bags deploy on the local floor rather than a roof and cannot stack for one owner', () => {
  const s = isolated();
  for (let z = 28; z < 34; z++) for (let x = 28; x < 34; x++) s.world.setRaw(x, 8, z, 4);
  expect(deploy(s, s.player, 'medical')).toBe(true);
  expect(s.deployables[0].y).toBe(1);
  s.simTime = 5;
  expect(deploy(s, s.player, 'medical')).toBe(false);
  s.player.kit = 'assault';
  expect(deploy(s, s.player, 'ammo')).toBe(false);
  s.dispose();
});
test('0.6.1 medical bags spend charges only on useful visible healing and never award self XP', () => {
  const s = isolated();
  s.player.hp = 60;
  expect(deploy(s, s.player, 'medical')).toBe(true);
  s.simTime = 2;
  tickEquipment(s, 1);
  expect(s.player.hp).toBe(72);
  expect(s.deployables[0].charges).toBe(17);
  expect(s.events.filter((e) => e.type === 'xp')).toHaveLength(0);
  const a = s.actors[1];
  Object.assign(a, { alive: true, x: 32, z: 30, y: 1, hp: 50, lastHit: -100 });
  s.spatial();
  s.simTime = 3;
  tickEquipment(s, 1);
  expect(a.hp).toBe(62);
  expect(s.events.filter((e) => e.type === 'xp')).toHaveLength(1);
  for (let y = 1; y <= 3; y++) s.world.setRaw(31, y, 30, 4);
  s.simTime = 5;
  tickEquipment(s, 1);
  expect(a.hp).toBe(62);
  s.dispose();
});
test('0.6.1 supplies refill finite stocks without silently loading the player weapon', () => {
  const s = isolated('support');
  s.ammo[1] = 2;
  s.reserves[1] = 0;
  s.grenades = 0;
  s.smokeGrenades = 0;
  expect(refill(s, s.player)).toBe(true);
  expect(s.ammo[1]).toBe(2);
  expect(s.reserves[1]).toBe(120);
  expect(s.grenades).toBe(1);
  const a = s.actors[1];
  a.kit = 'engineer';
  initActorEquipment(a, 0);
  a.rockets = 0;
  a.fragCharges = 0;
  a.smokes = 0;
  a.clip = 0;
  for (let i = 0; i < 20; i++) refill(s, a);
  expect(a.rockets).toBe(3);
  expect(a.fragCharges).toBe(2);
  expect(a.smokes).toBe(1);
  expect(a.clip).toBe(weapons[a.primaryWeapon].mag);
  s.dispose();
});
test('0.6.1 ammo cooldown is shared across crates and a new life cannot inherit a previous owner reward', () => {
  const s = isolated('support');
  const a = s.actors[1];
  a.kit = 'engineer';
  initActorEquipment(a, 0);
  Object.assign(a, { alive: true, x: 31, y: 1, z: 32, rockets: 0 });
  s.spatial();
  expect(deploy(s, s.player, 'ammo')).toBe(true);
  s.simTime = 1;
  tickEquipment(s, 1);
  expect(a.rockets).toBe(1);
  const d = s.deployables[0];
  s.deployables.push({ ...d, ownerId: 2, x: d.x + 0.3, charges: 12, used: new Map() });
  s.simTime = 2;
  tickEquipment(s, 1);
  expect(a.rockets).toBe(1);
  const xp = s.events.filter((e) => e.type === 'xp').length;
  expect(s.safeSpawn(s.player, true, { x: 70, y: 1, z: 70 })).toBe(true);
  s.simTime = 12;
  tickEquipment(s, 1);
  expect(a.rockets).toBe(2);
  expect(s.events.filter((e) => e.type === 'xp')).toHaveLength(xp);
  s.dispose();
});
test('0.6.1 unsupported and exhausted deployables retire and clear their cooldown records', () => {
  const s = isolated();
  deploy(s, s.player, 'medical');
  const d = s.deployables[0];
  d.used.set(2, { until: 50, epoch: 0 });
  s.world.removeVoxel(Math.floor(d.x), 0, Math.floor(d.z));
  // Foundations cannot be removed with the gameplay API; remove the fixture floor explicitly.
  s.world.vox[s.world.index(Math.floor(d.x), 0, Math.floor(d.z))] = 0;
  s.simTime = 1;
  tickEquipment(s, 1);
  expect(s.deployables).toHaveLength(0);
  expect(d.used.size).toBe(0);
  s.dispose();
});
