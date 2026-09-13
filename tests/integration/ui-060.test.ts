import { expect, spyOn, test } from 'bun:test';
import { loadStorage } from '../../src/platform/storage';
import { Renderer } from '../../src/rendering/renderer';
import { App } from '../../src/ui/app';
import { byId } from '../../src/ui/dom';
import { browserFixture } from '../browser';
import { smallSimulation } from '../helpers';

const silent = { resume() {}, sync() {}, consume() {}, dispose() {} };

test('0.6 field lab restores its owning screen and keyboard modal cancellation is non-destructive', async () => {
  const f = await browserFixture();
  let app: App | undefined;
  try {
    const s = smallSimulation();
    s.createSquads();
    const r = new Renderer(s, byId<HTMLCanvasElement>('world'), byId<HTMLCanvasElement>('hud'));
    app = new App(s, r, silent, null, loadStorage(null).profile);
    byId('loading').hidden = true;
    app.show('barracks');
    app.openLab();
    expect(s.menuState).toBe('lab');
    expect(s.playing).toBe(false);
    byId('labClose').click();
    expect(s.menuState).toBe('barracks');
    expect(s.playing).toBe(false);
    let invoked = 0;
    app.confirmAction(
      'TEST CONFIRMATION',
      'A cancellation must never run the action.',
      () => invoked++,
    );
    expect(byId('actionDialog').hidden).toBe(false);
    expect(document.activeElement).toBe(byId('dialogCancel'));
    document.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'Escape', bubbles: true, cancelable: true }),
    );
    expect(byId('actionDialog').hidden).toBe(true);
    expect(invoked).toBe(0);
    app.confirmAction('TEST CONFIRMATION', 'Confirm explicitly.', () => invoked++);
    byId('dialogConfirm').click();
    expect(invoked).toBe(1);
  } finally {
    app?.dispose();
    f.restore();
  }
});

test('0.6 practice toggles cannot become a career XP farming session after disabling them', async () => {
  const f = await browserFixture();
  let app: App | undefined;
  try {
    const s = smallSimulation();
    s.createSquads();
    const r = new Renderer(s, byId<HTMLCanvasElement>('world'), byId<HTMLCanvasElement>('hud')),
      profile = loadStorage(null).profile;
    app = new App(s, r, silent, null, profile);
    byId('loading').hidden = true;
    app.openLab();
    const input = byId<HTMLInputElement>('labInvulnerable');
    input.checked = true;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.checked = false;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    expect(s.roundPractice).toBe(true);
    app.show('play');
    s.award('ELIMINATION', 100, 'ar30', 'kills');
    app.processEvents();
    expect(profile.career!.xp).toBe(0);
    s.finishBattle(true, 'control');
    app.processEvents();
    expect(profile.games).toBe(0);
    expect(profile.career!.xp).toBe(0);
  } finally {
    app?.dispose();
    f.restore();
  }
});

test('0.6 minimap refresh clocks reset with the round and telemetry uses source revisions', async () => {
  const f = await browserFixture();
  let r: Renderer | undefined;
  try {
    const s = smallSimulation();
    r = new Renderer(s, byId<HTMLCanvasElement>('world'), byId<HTMLCanvasElement>('hud'));
    r.lastMini = 106;
    s.simTime = 0;
    s.roundEpoch++;
    r.resetRound();
    expect(r.lastMini).toBe(-Infinity);
    const map = spyOn(r, 'drawMinimap');
    try {
      s.world.mapDirty = true;
      r.render(1 / 60);
      expect(map).toHaveBeenCalledTimes(1);
    } finally {
      map.mockRestore();
    }
    s.world.buildNavigation();
    expect(s.world.publishedNavSourceRevision).toBe(s.world.navRevision);
    expect(s.world.navDirty).toBe(false);
  } finally {
    r?.dispose();
    f.restore();
  }
});

test('0.6 partially constructed renderers release allocated graphics resources on failure', async () => {
  const f = await browserFixture();
  const allocation = spyOn(f.gl, 'createBuffer').mockImplementation(() => null);
  try {
    const s = smallSimulation(),
      before = f.draws.deleted;
    expect(
      () => new Renderer(s, byId<HTMLCanvasElement>('world'), byId<HTMLCanvasElement>('hud')),
    ).toThrow('Unable to allocate cube buffer');
    // Three linked programs and the already allocated vertex array are rolled back.
    expect(f.draws.deleted - before).toBeGreaterThanOrEqual(4);
    s.dispose();
  } finally {
    allocation.mockRestore();
    f.restore();
  }
});
