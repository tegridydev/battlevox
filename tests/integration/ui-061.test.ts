import { expect, test } from 'bun:test';
import { weapons } from '../../src/core/config';
import { assignments, ensureCareer, itemTracks } from '../../src/core/progression';
import type { MatchReport, Profile } from '../../src/core/types';
import { loadStorage } from '../../src/platform/storage';
import { Renderer } from '../../src/rendering/renderer';
import { smoke } from '../../src/simulation/equipment';
import { App } from '../../src/ui/app';
import { byId } from '../../src/ui/dom';
import { browserFixture } from '../browser';
import { smallSimulation } from '../helpers';

const silent = { resume() {}, sync() {}, consume() {}, dispose() {} };
async function setup(profile: Profile = loadStorage(null).profile) {
  const f = await browserFixture(),
    s = smallSimulation();
  s.createSquads();
  const r = new Renderer(s, byId<HTMLCanvasElement>('world'), byId<HTMLCanvasElement>('hud'));
  const app = new App(s, r, silent, null, profile);
  byId('loading').hidden = true;
  return { f, s, r, app, profile };
}
test('0.6.1 next-deployment sidearm selectors synchronise without altering current inventory', async () => {
  const { f, s, app } = await setup();
  try {
    app.show('loadouts');
    s.ammo[4] = 2;
    s.reserves[4] = 11;
    const select = byId<HTMLSelectElement>('arsenalSecondary');
    select.value = '6';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(s.settings.secondary).toBe(6);
    expect(byId<HTMLSelectElement>('secondary').value).toBe('6');
    expect(s.equippedSecondary).toBe(4);
    expect(s.ammo[4]).toBe(2);
    app.show('play');
    s.selectWeaponSlot(1);
    expect(s.weaponIndex).toBe(4);
    s.safeSpawn(s.player, true, { x: 100, y: 1, z: 100 });
    s.selectWeaponSlot(1);
    expect(s.weaponIndex).toBe(6);
  } finally {
    app.dispose();
    f.restore();
  }
});
test('0.6.1 equipment controls select primary, sidearm and launcher without conflating slots', async () => {
  const { f, s, app } = await setup();
  try {
    s.activeKit = 'engineer';
    s.player.kit = 'engineer';
    app.show('play');
    document.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'Digit2', bubbles: true, cancelable: true }),
    );
    expect(s.weaponIndex).toBe(4);
    document.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'Digit3', bubbles: true, cancelable: true }),
    );
    expect(s.weaponIndex).toBe(2);
    document.querySelector<HTMLButtonElement>('[data-weapon-slot="0"]')!.click();
    expect(s.weaponIndex).toBe(0);
    document.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'Digit4', bubbles: true, cancelable: true }),
    );
    expect(s.smokeGrenades).toBe(1);
    expect(s.projectiles[0].type).toBe('smoke');
  } finally {
    app.dispose();
    f.restore();
  }
});
test('0.6.1 mouse wheel changes weapons normally and zoom while aiming; menus consume neither', async () => {
  const { f, s, app } = await setup();
  try {
    s.activeKit = 'recon';
    s.weaponIndex = 3;
    app.show('play');
    s.input.aim = true;
    const wheel = () => {
      const e = new Event('wheel', { cancelable: true, bubbles: true });
      Object.defineProperty(e, 'deltaY', { value: 1 });
      byId('world').dispatchEvent(e);
    };
    wheel();
    expect(s.scopeStep).toBe(1);
    expect(s.weaponIndex).toBe(3);
    s.input.aim = false;
    wheel();
    expect(s.weaponIndex).toBe(4);
    app.show('home');
    wheel();
    expect(s.weaponIndex).toBe(4);
  } finally {
    app.dispose();
    f.restore();
  }
});
test('0.6.1 tabs have a single selected panel and support keyboard navigation without scrolling', async () => {
  const { f, app } = await setup();
  try {
    app.show('options');
    const first = document.querySelector<HTMLButtonElement>('[data-tab="settings:display"]')!;
    first.focus();
    first.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'ArrowRight', bubbles: true, cancelable: true }),
    );
    expect(document.querySelector<HTMLElement>('[data-panel="settings:display"]')!.hidden).toBe(
      true,
    );
    expect(document.querySelector<HTMLElement>('[data-panel="settings:controls"]')!.hidden).toBe(
      false,
    );
    expect(document.activeElement).toBe(document.querySelector('[data-tab="settings:controls"]'));
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA', bubbles: true }));
    expect(document.querySelectorAll('[data-tab^="settings:"][aria-selected="true"]')).toHaveLength(
      1,
    );
  } finally {
    app.dispose();
    f.restore();
  }
});
test('0.6.1 every equipment track and every assignment remains reachable through compact controls', async () => {
  const { f, app } = await setup();
  try {
    app.show('loadouts');
    const sel = byId<HTMLSelectElement>('arsenalItem');
    expect(sel.options.length).toBe(itemTracks.length);
    for (const item of itemTracks) {
      sel.value = item.id;
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      expect(byId('arsenal').querySelectorAll('.loadoutCard')).toHaveLength(1);
      expect(byId('arsenal').textContent).toContain(item.name);
    }
    app.show('challenges');
    const seen = new Set<string>();
    for (let i = 0; i < 20; i++) {
      for (const h of byId('assignments').querySelectorAll('h2')) seen.add(h.textContent!);
      const next = byId('assignmentsPager').querySelectorAll('button')[1];
      if (next.disabled) break;
      next.click();
    }
    expect(seen.size).toBe(assignments.length);
    expect(byId('assignmentsPager').querySelectorAll('button')[1].disabled).toBe(true);
  } finally {
    app.dispose();
    f.restore();
  }
});
test('0.6.1 history pages retain all forty records and never reset a callsign being edited', async () => {
  const profile = loadStorage(null).profile,
    c = ensureCareer(profile);
  for (let i = 0; i < 40; i++)
    c.history.push({
      id: 'test' + i,
      endedAt: 1789000000000,
      seed: 1,
      seconds: 600,
      result: 'victory',
      score: 1000 + i,
      xp: i,
      stats: { kills: i },
      medals: [],
    } as MatchReport);
  const { f, app } = await setup(profile);
  try {
    app.show('barracks');
    app.screens.select('career', 'history');
    const seen = new Set<string>();
    for (let i = 0; i < 40; i++) {
      for (const row of byId('matchHistory').querySelectorAll('.historyRow'))
        seen.add(row.textContent!);
      const next = byId('historyPager').querySelectorAll('button')[1];
      if (next.disabled) break;
      next.click();
    }
    expect(seen.size).toBe(40);
    app.screens.select('career', 'save');
    const input = byId<HTMLInputElement>('callsign');
    input.focus();
    input.value = 'IN PROGRESS';
    window.dispatchEvent(new Event('resize'));
    expect(input.value).toBe('IN PROGRESS');
  } finally {
    app.dispose();
    f.restore();
  }
});
test('0.6.1 optics, all sidearm models, smoke uniforms and deployables issue finite graphics commands', async () => {
  const { f, s, r, app } = await setup();
  try {
    app.show('play');
    s.player.x = 100;
    s.player.y = 1;
    s.player.z = 100;
    s.camera.x = 100;
    s.camera.y = 2.57;
    s.camera.z = 100;
    smoke(s, { x: 110, y: 1, z: 100 }, s.player);
    s.smokeClouds[0].age = 2;
    for (const id of weapons.map((_, i) => i)) {
      s.weaponIndex = id;
      s.aimAmount = id === 2 || id === 3 ? 1 : 0;
      r.render(1 / 60);
    }
    expect(f.draws.instances).toBeGreaterThan(0);
    expect(f.draws.terrain).toBeGreaterThan(0);
  } finally {
    app.dispose();
    f.restore();
  }
});
test('0.6.1 field diagnostics replace metrics rather than extending a scrolling page', async () => {
  const { f, s, app } = await setup();
  try {
    app.openLab();
    app.screens.select('lab', 'engine');
    byId('labCheck').click();
    expect(byId('labTelemetry').hidden).toBe(true);
    expect(byId('labCheckResult').textContent).not.toContain('FAIL');
    byId('labCheck').click();
    expect(byId('labCheckResult').hidden).toBe(true);
    app.screens.select('lab', 'practice');
    byId('labReposition').click();
    expect(s.roundPractice).toBe(true);
    expect(byId('labActionStatus').textContent).toContain('Repositioned');
  } finally {
    app.dispose();
    f.restore();
  }
});
