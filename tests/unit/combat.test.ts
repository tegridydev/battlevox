import { expect, test } from 'bun:test';
import { smallSimulation } from '../helpers';

test('friendly fire and spawn protection prevent damage, self damage remains enabled', () => {
  const s = smallSimulation(),
    p = s.player,
    friend = s.actors[1],
    enemy = s.actors[10];
  s.hurt(p, 30, friend);
  expect(p.hp).toBe(100);
  p.shield = 1;
  s.hurt(p, 30, enemy);
  expect(p.hp).toBe(100);
  p.shield = 0;
  s.hurt(p, 30, p);
  expect(p.hp).toBe(70);
});
test('death charges one ticket and player waits for manual deployment', () => {
  const s = smallSimulation(),
    p = s.player;
  s.hurt(p, 1000, null);
  s.hurt(p, 1000, null);
  expect(s.tickets[0]).toBe(5999);
  expect(s.deaths).toBe(1);
  s.updatePlayer(20);
  expect(p.alive).toBe(false);
  expect(p.respawn).toBe(0);
  expect(s.events.filter((e) => e.type === 'death')).toHaveLength(1);
});
test('reload conserves ammunition and weapon selection respects class', () => {
  const s = smallSimulation();
  s.ammo[0] = 4;
  s.reserves[0] = 7;
  s.reload();
  for (let i = 0; i < 90; i++) s.updatePlayer(1 / 30);
  expect(s.ammo[0]).toBe(11);
  expect(s.reserves[0]).toBe(0);
  s.switchWeapon(2);
  expect(s.weaponIndex).toBe(0);
  s.activeKit = 'engineer';
  s.selectWeaponSlot(1);
  expect(s.weaponIndex).toBe(4);
  s.selectWeaponSlot(2);
  expect(s.weaponIndex).toBe(2);
});
test('next-deployment class does not grant engineer abilities mid-life', () => {
  const s = smallSimulation();
  s.settings.loadout = 'engineer';
  s.fortify();
  expect(s.abilityClock).toBe(0);
  expect(s.feed[0].text).toContain('Engineer loadout required');
});
test('ADS toggles on press, hold mode follows release, overlays clear aim', () => {
  const s = smallSimulation();
  s.settings.aimMode = 'toggle';
  s.toggleAim(true);
  s.toggleAim(false);
  expect(s.input.aim).toBe(true);
  s.toggleAim(true);
  expect(s.input.aim).toBe(false);
  s.settings.aimMode = 'hold';
  s.toggleAim(true);
  s.toggleAim(false);
  expect(s.input.aim).toBe(false);
  s.toggleAim(true);
  s.setScreen('map');
  expect(s.input.aim).toBe(false);
  expect(s.playing).toBe(true);
  s.toggleAim(true);
  expect(s.input.aim).toBe(false);
});
test('swept body movement cannot tunnel through a wall', () => {
  const s = smallSimulation(),
    p = s.player;
  p.x = 10;
  p.z = 10;
  p.y = 1;
  for (let y = 1; y < 5; y++) s.world.setRaw(12, y, 10, 4);
  p.vx = 100;
  s.moveBody(p, 0.1);
  expect(p.x).toBeLessThan(12);
  expect(s.occupied(p, p.x, p.y, p.z)).toBe(false);
});
test('ray boxes handle parallel axes and nearest wall blocks bullets', () => {
  const s = smallSimulation(),
    p = s.player,
    e = s.actors[10];
  p.x = 10;
  p.z = 10;
  e.x = 20;
  e.z = 10;
  e.y = 1;
  for (let y = 1; y < 4; y++) s.world.setRaw(15, y, 10, 4);
  s.spatial();
  s.bullet(p, { x: 10, y: 2, z: 10 }, { x: 1, y: 0, z: 0 }, 30);
  expect(e.hp).toBe(100);
  expect(
    s.rayBox(
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
      { x: 2, y: 2, z: 2, xr: 0.3, yr: 1, zr: 0.3 },
    ),
  ).toBe(Infinity);
});
test('uncontested occupied control earns time, contest pauses it', () => {
  const s = smallSimulation();
  for (const a of s.actors) a.alive = false;
  const p = s.player;
  p.alive = true;
  p.x = p.z = 256;
  p.y = 1;
  const f = s.world.flags[4];
  f.value = 1;
  f.owner = 0;
  s.spatial();
  s.capture(1);
  expect(s.controlTime[0]).toBe(1);
  const e = s.actors[10];
  Object.assign(e, { alive: true, x: 256, z: 256, y: 1 });
  s.spatial();
  s.capture(1);
  expect(f.contested).toBe(true);
  expect(s.controlTime[0]).toBe(1);
});
test('match result emitted exactly once', () => {
  const s = smallSimulation();
  s.finishBattle(true);
  s.finishBattle(false);
  expect(s.events.filter((e) => e.type === 'finished')).toHaveLength(1);
  expect(s.playing).toBe(false);
});
test('friendly vehicle explosions cannot damage infantry', () => {
  const s = smallSimulation();
  s.startBattle();
  const p = s.player;
  p.shield = 0;
  s.hurt(p, 50, s.vehicles[0]);
  expect(p.hp).toBe(100);
  s.hurt(p, 50, s.vehicles[6]);
  expect(p.hp).toBe(50);
});
test('semi-automatic DMR fires once per trigger press', () => {
  const s = smallSimulation();
  s.activeKit = 'recon';
  s.weaponIndex = 3;
  s.input.fire = true;
  for (let i = 0; i < 60; i++) s.updatePlayer(1 / 30);
  expect(s.ammo[3]).toBe(7);
  s.input.fire = false;
  s.updatePlayer(1 / 30);
  s.input.fire = true;
  s.updatePlayer(1 / 30);
  expect(s.ammo[3]).toBe(6);
});
