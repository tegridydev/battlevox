import { expect, test } from 'bun:test';
import { ensureCareer, ensureItem, xpForItemLevel } from '../../src/core/progression';
import { loadStorage } from '../../src/platform/storage';
import { Renderer } from '../../src/rendering/renderer';
import { App } from '../../src/ui/app';
import { byId } from '../../src/ui/dom';
import { browserFixture } from '../browser';
import { fullSquads } from '../helpers';

const silent = { resume() {}, sync() {}, consume() {}, dispose() {} };
test('career navigation, callsign, item selection, debrief and reload persistence use real DOM events', async () => {
  const fixture = await browserFixture();
  let app: App | undefined;
  try {
    const s = fullSquads();
    Object.assign(s.player, { alive: true, x: 56, y: 1, z: 256 });
    const store = new Map<string, string>(),
      port = {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => {
          store.set(key, value);
        },
      };
    const profile = loadStorage(port).profile;
    ensureItem(profile, 'ar30').xp = xpForItemLevel(3);
    const renderer = new Renderer(
      s,
      byId<HTMLCanvasElement>('world'),
      byId<HTMLCanvasElement>('hud'),
    );
    app = new App(s, renderer, silent, port, profile, {
      profileBase: null,
      recovered: false,
      recoveryConflict: false,
      exclusiveWrite: async (job) => job(),
    });
    byId('loading').hidden = true;
    document.querySelector<HTMLButtonElement>('[data-menu="barracks"]')!.click();
    expect(s.menuState).toBe('barracks');
    expect(s.playing).toBe(false);
    byId<HTMLInputElement>('callsign').value = '<PLAYTEST>';
    byId('callsignForm').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(byId('headerName').textContent).toBe('<PLAYTEST>');
    expect(byId('careerSummary').querySelector('playtest')).toBeNull();
    document.querySelector<HTMLButtonElement>('[data-menu="loadouts"]')!.click();
    const select = document.querySelector<HTMLSelectElement>('select[data-item="ar30"]')!;
    select.value = 'control';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(s.weaponTuning[0].kick).toBe(0.85);
    app.show('play');
    s.award('SECTOR CAPTURED', 300, undefined, 'captures');
    s.award('ELIMINATION', 100, 'ar30', 'kills');
    app.processEvents();
    s.finishBattle(true, 'control');
    app.processEvents();
    expect(s.menuState).toBe('results');
    expect(byId('roundXp').textContent).toContain('1,400');
    // Flush queued canonical writes, including XP earned while an earlier lock was pending.
    for (let i = 0; i < 12; i++) await Promise.resolve();
    const after = loadStorage(port).profile;
    expect(after.games).toBe(1);
    expect(after.kills).toBe(1);
    expect(after.career?.name).toBe('<PLAYTEST>');
    expect(after.career?.items.ar30.equipped).toBe('control');
    expect(after.career?.history).toHaveLength(1);
    app.show('barracks');
    expect(byId('matchHistory').querySelectorAll('.historyRow')).toHaveLength(1);
    const before = ensureCareer(profile).xp;
    app.processEvents();
    expect(ensureCareer(profile).xp).toBe(before);
  } finally {
    app?.dispose();
    fixture.restore();
  }
});
test('nine sector indicators track ownership and squad assignment without opening a menu', async () => {
  const fixture = await browserFixture();
  let app: App | undefined;
  try {
    const s = fullSquads();
    s.player.alive = true;
    const renderer = new Renderer(
      s,
      byId<HTMLCanvasElement>('world'),
      byId<HTMLCanvasElement>('hud'),
    );
    app = new App(s, renderer, silent, null, { games: 0, wins: 0, kills: 0, best: 0 });
    app.show('play');
    for (let i = 0; i < 9; i++) {
      s.squads[0].route = i;
      s.world.flags[i].owner = 0;
      app.updateHUD();
      expect(byId('objectiveName').textContent).toContain(s.world.flags[i].name);
    }
    expect(byId('flags').children).toHaveLength(9);
    expect(byId('flagI').classList.contains('assigned')).toBe(true);
  } finally {
    app?.dispose();
    fixture.restore();
  }
});
