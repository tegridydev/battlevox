import { expect, test } from 'bun:test';
import { weapons } from '../../src/core/config';
import {
  aimSensitivity,
  cameraFov,
  initActorEquipment,
  kitWeapons,
  loadout,
  secondaryIndex,
  zoomFor,
} from '../../src/core/loadout';
import { ensureCareer, recordXp, validateCareer } from '../../src/core/progression';
import type { Kit } from '../../src/core/types';
import { validateSettings } from '../../src/platform/storage';
import { tracerSegment } from '../../src/rendering/optics';
import { smallSimulation } from '../helpers';

test('0.6.1 all classes have a primary and validated secondary; only engineers carry AT-1', () => {
  for (const kit of ['assault', 'medic', 'support', 'engineer', 'recon'] as Kit[])
    for (const secondary of [4, 5, 6]) {
      const indices = kitWeapons(kit, secondary);
      expect(indices[1]).toBe(secondary);
      expect(indices.length).toBe(kit === 'engineer' ? 3 : 2);
      if (kit === 'engineer') expect(indices[2]).toBe(2);
    }
  for (const v of [NaN, Infinity, -1, 0, 3, 7, '5', null, undefined])
    expect(secondaryIndex(v)).toBe(4);
  expect(validateSettings({ secondary: 5 }).secondary).toBe(5);
  expect(validateSettings({ secondary: '6' }).secondary).toBe(4);
});
test('0.6.1 secondary selection is frozen until deployment and never refills current magazines', () => {
  const s = smallSimulation();
  s.equippedSecondary = 4;
  s.settings.secondary = 6;
  s.ammo[4] = 2;
  s.reserves[4] = 3;
  expect(loadout(s)[1]).toBe(4);
  s.selectWeaponSlot(1);
  expect(s.weaponIndex).toBe(4);
  expect(s.ammo[4]).toBe(2);
  s.switchWeapon(6);
  expect(s.weaponIndex).toBe(4);
  s.safeSpawn(s.player, true, { x: 100, y: 1, z: 100 });
  expect(s.equippedSecondary).toBe(6);
  s.selectWeaponSlot(1);
  expect(s.weaponIndex).toBe(6);
  expect(s.ammo[6]).toBe(18);
  s.dispose();
});
test('0.6.1 invalid weapon slots and paused weapon cycling leave state unchanged', () => {
  const s = smallSimulation();
  for (const slot of [NaN, Infinity, -1, 3, 1.5]) s.selectWeaponSlot(slot);
  expect(s.weaponIndex).toBe(0);
  s.setScreen('pause');
  s.cycleWeapon();
  s.selectWeaponSlot(1);
  expect(s.weaponIndex).toBe(0);
  s.dispose();
});
test('0.6.1 focal length, FOV and sensitivity agree at both recon zoom levels', () => {
  const s = smallSimulation();
  s.activeKit = 'recon';
  s.weaponIndex = 3;
  s.aimAmount = 1;
  s.settings.motion = false;
  expect(zoomFor(s)).toBe(4);
  expect(Math.tan(cameraFov(s) / 2) * 4).toBeCloseTo(Math.tan((s.settings.fov * Math.PI) / 360), 7);
  const sensitivity = aimSensitivity(s);
  expect(s.cycleZoom()).toBe(true);
  expect(zoomFor(s)).toBe(8);
  expect(aimSensitivity(s)).toBeCloseTo(sensitivity / 2, 7);
  s.reloadTime = 1;
  expect(s.cycleZoom()).toBe(false);
  expect(zoomFor(s)).toBe(8);
  s.reloadTime = 0;
  s.cycleZoom(-1);
  expect(zoomFor(s)).toBe(4);
  s.dispose();
});
test('0.6.1 every semi automatic sidearm consumes one round per press, including a quick tap', () => {
  for (const id of [4, 5]) {
    const s = smallSimulation();
    s.equippedSecondary = id;
    s.weaponIndex = id;
    s.input.fire = true;
    for (let i = 0; i < 70; i++) s.updatePlayer(1 / 30);
    expect(s.ammo[id]).toBe(weapons[id].mag - 1);
    s.input.fire = false;
    s.updatePlayer(1 / 30);
    s.input.firePressed = true;
    s.updatePlayer(1 / 30);
    expect(s.ammo[id]).toBe(weapons[id].mag - 2);
    expect(s.input.firePressed).toBe(false);
    s.dispose();
  }
});
test('0.6.1 machine pistol is automatic and interrupted reloads conserve ammunition', () => {
  const s = smallSimulation();
  s.equippedSecondary = 6;
  s.weaponIndex = 6;
  s.input.fire = true;
  for (let i = 0; i < 20; i++) s.updatePlayer(1 / 30);
  expect(s.ammo[6]).toBeLessThan(16);
  s.input.fire = false;
  s.ammo[6] = 1;
  s.reserves[6] = 7;
  s.reload();
  s.updatePlayer(0.1);
  s.switchWeapon(0);
  expect(s.ammo[6] + s.reserves[6]).toBe(8);
  expect(s.reloadTime).toBe(0);
  s.dispose();
});
test('0.6.1 actor equipment resets only on a new life, with class-specific sidearms and finite stocks', () => {
  const s = smallSimulation(),
    a = s.actors[1];
  a.kit = 'engineer';
  initActorEquipment(a, 9);
  expect(a.rockets).toBe(3);
  expect(a.secondaryWeapon).toBe(6);
  expect(a.fragCharges).toBe(2);
  a.kit = 'recon';
  initActorEquipment(a, 10);
  expect(a.clip).toBe(8);
  expect(a.secondaryWeapon).toBe(5);
  expect(a.rockets).toBe(0);
  s.dispose();
});
test('0.6.1 old careers keep their XP and new sidearm mastery validates and records independently', () => {
  const profile = { games: 4, wins: 2, kills: 7, best: 400 };
  const c = ensureCareer(profile);
  c.xp = 1200;
  recordXp(profile, { type: 'xp', label: 'HIT', points: 45, count: 1, itemId: 'r6' });
  expect(c.items.r6.xp).toBe(45);
  expect(c.xp).toBe(1245);
  const restored = validateCareer(c);
  expect(restored.items.r6.xp).toBe(45);
  expect(restored.items.p12.xp).toBe(0);
});
test('0.6.1 tracers advance along their shot without drawing a full-length beam', () => {
  const t = {
    a: { x: 0, y: 2, z: 0 },
    b: { x: 100, y: 2, z: 0 },
    life: 0.11,
    maxLife: 0.11,
    team: 0 as const,
  };
  const first = tracerSegment(t)!;
  t.life = 0.05;
  const second = tracerSegment(t)!;
  expect(second.x).toBeGreaterThan(first.x);
  expect(second.length).toBeLessThanOrEqual(2.81);
  t.life = 0;
  expect(tracerSegment(t)).toBeNull();
});
