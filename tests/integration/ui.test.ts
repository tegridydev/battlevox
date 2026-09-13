import { expect, test } from 'bun:test';
import { Renderer } from '../../src/rendering/renderer';
import { App } from '../../src/ui/app';
import { byId } from '../../src/ui/dom';
import { browserFixture } from '../browser';
import { fullSquads } from '../helpers';

const silent = { resume() {}, sync() {}, consume() {}, dispose() {} };
test('live map, orders, death deployment, pause and kit selection work through real DOM events', async () => {
  const browser = await browserFixture();
  let app: App | undefined;
  try {
    const s = fullSquads();
    s.player.alive = true;
    s.player.x = 56;
    s.player.y = 1;
    s.player.z = 256;
    const renderer = new Renderer(
      s,
      byId<HTMLCanvasElement>('world'),
      byId<HTMLCanvasElement>('hud'),
    );
    app = new App(s, renderer, silent, null, { games: 0, wins: 0, kills: 0, best: 0 });
    byId('loading').hidden = true;
    app.show('play');
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyB', bubbles: true }));
    expect(s.menuState).toBe('orders');
    expect(s.playing).toBe(true);
    expect(s.acceptsInput).toBe(false);
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Digit1', bubbles: true }));
    expect(s.squads[0].order.kind).toBe('follow');
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape', bubbles: true }));
    expect(s.menuState).toBe('play');
    document.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyM', bubbles: true }));
    expect(s.menuState).toBe('map');
    expect(s.input.fire).toBe(false);
    app.pause();
    expect(s.playing).toBe(false);
    app.resume();
    expect(s.playing).toBe(true);
    s.player.shield = 0;
    s.hurt(s.player, 1000, null);
    app.processEvents();
    expect(s.menuState).toBe('deployment');
    expect(byId('tactical').hidden).toBe(false);
    expect(byId<HTMLButtonElement>('deployNow').disabled).toBe(true);
    s.updatePlayer(9);
    byId<HTMLSelectElement>('loadout').value = 'engineer';
    byId('loadout').dispatchEvent(new Event('change'));
    app.updateTactical();
    expect(byId<HTMLButtonElement>('deployNow').disabled).toBe(false);
    byId('deployNow').click();
    expect(s.activeKit).toBe('engineer');
    expect(s.menuState).toBe('play');
    expect(s.player.alive).toBe(true);
    app.updateHUD();
    app.openTactical('map');
    app.map.draw();
    app.showScores();
    expect(byId('scoreContent').querySelectorAll('.scoreRow')).toHaveLength(1000);
    expect(byId('scoreContent').querySelectorAll('.self')).toHaveLength(1);
    expect(document.querySelector('script[src^="http"]')).toBeNull();
  } finally {
    app?.dispose();
    browser.restore();
  }
});
test('pointer-lock rejection is handled and missing graphics fails clearly', async () => {
  const browser = await browserFixture();
  try {
    const s = fullSquads();
    s.player.alive = true;
    const canvas = byId<HTMLCanvasElement>('world');
    canvas.requestPointerLock = () => Promise.reject(Error('denied'));
    const renderer = new Renderer(s, canvas, byId<HTMLCanvasElement>('hud')),
      app = new App(s, renderer, silent, null, { games: 0, wins: 0, kills: 0, best: 0 });
    app.resume();
    await Promise.resolve();
    expect(s.playing).toBe(true);
    app.dispose();
    Object.defineProperty(canvas, 'getContext', { value: () => null });
    expect(() => new Renderer(s, canvas, byId<HTMLCanvasElement>('hud'))).toThrow('WebGL 2');
  } finally {
    browser.restore();
  }
});
test('touch cancellation clears held fire and a failed base spawn remains retryable', async () => {
  const browser = await browserFixture();
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
    byId('fire').dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 7, pointerType: 'touch', bubbles: true }),
    );
    expect(s.input.fire).toBe(true);
    byId('fire').dispatchEvent(
      new PointerEvent('pointercancel', { pointerId: 7, pointerType: 'touch', bubbles: true }),
    );
    expect(s.input.fire).toBe(false);
    s.player.alive = false;
    s.player.respawn = 0;
    s.spawnError = 'Spawn blocked. Try again.';
    app.openTactical('deployment');
    expect(byId<HTMLButtonElement>('deployNow').disabled).toBe(false);
    app.pause();
    expect(s.input.fire).toBe(false);
  } finally {
    app?.dispose();
    browser.restore();
  }
});

test('touch aim, menu focus, adaptive resolution and persisted page lifecycle retain correct state', async () => {
  const browser = await browserFixture();
  let app: App | undefined;
  try {
    const s = fullSquads();
    Object.assign(s.player, { alive: true, x: 56, y: 1, z: 256 });
    const renderer = new Renderer(
      s,
      byId<HTMLCanvasElement>('world'),
      byId<HTMLCanvasElement>('hud'),
    );
    app = new App(s, renderer, silent, null, { games: 0, wins: 0, kills: 0, best: 0 });
    app.show('play');
    s.settings.aimMode = 'hold';
    byId('aim').dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 11, pointerType: 'touch' }),
    );
    expect(s.input.aim).toBe(true);
    byId('aim').dispatchEvent(
      new PointerEvent('pointercancel', { pointerId: 11, pointerType: 'touch' }),
    );
    expect(s.input.aim).toBe(false);
    s.settings.aimMode = 'toggle';
    byId('aim').dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 12, pointerType: 'touch' }),
    );
    byId('aim').dispatchEvent(
      new PointerEvent('pointerup', { pointerId: 12, pointerType: 'touch' }),
    );
    expect(s.input.aim).toBe(true);
    app.show('options');
    expect(document.activeElement?.closest('[hidden]')).toBeNull();
    expect(document.activeElement).not.toBe(document.body);
    renderer.resolutionScale = 0.6;
    s.settings.adaptive = false;
    renderer.resize();
    const full = renderer.canvas.width;
    s.settings.adaptive = true;
    renderer.resize();
    expect(renderer.canvas.width).toBeLessThan(full);
    app.show('play');
    app.start();
    const hide = new Event('pagehide');
    Object.defineProperty(hide, 'persisted', { value: true });
    window.dispatchEvent(hide);
    expect(s.playing).toBe(false);
    expect(renderer.disposed).toBe(false);
    const show = new Event('pageshow');
    Object.defineProperty(show, 'persisted', { value: true });
    window.dispatchEvent(show);
    expect(s.playing).toBe(false);
    app.resume();
    expect(s.playing).toBe(true);
  } finally {
    app?.dispose();
    browser.restore();
  }
});

test('landing camera does not accumulate per-render displacement and slow map drags do not choose spawns', async () => {
  const browser = await browserFixture();
  let renderer: Renderer | undefined;
  try {
    const s = fullSquads();
    Object.assign(s.player, { alive: true, x: 56, y: 1, z: 256 });
    s.camera.y = 2.57;
    s.handling.land = 0.1;
    renderer = new Renderer(s, byId<HTMLCanvasElement>('world'), byId<HTMLCanvasElement>('hud'));
    s.menuState = 'play';
    renderer.drawHUD = () => {};
    for (let i = 0; i < 30; i++) renderer.render(1 / 30);
    const at30 = s.camera.y;
    s.camera.y = 2.57;
    for (let i = 0; i < 120; i++) renderer.render(1 / 120);
    expect(s.camera.y).toBeCloseTo(at30, 8);
    const { TacticalMap } = await import('../../src/ui/tactical-map');
    let selections = 0;
    const canvas = byId<HTMLCanvasElement>('tacticalMap');
    const map = new TacticalMap(canvas, s, renderer.mini, () => {
      selections++;
    });
    map.zoom = 2;
    s.menuState = 'deployment';
    const x = -20 + (56 / 512) * 740;
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 9, clientX: x, clientY: 200 }),
    );
    for (let i = 1; i <= 10; i++)
      canvas.dispatchEvent(
        new PointerEvent('pointermove', { pointerId: 9, clientX: x + i, clientY: 200 }),
      );
    canvas.dispatchEvent(
      new PointerEvent('pointerup', { pointerId: 9, clientX: x + 10, clientY: 200 }),
    );
    expect(selections).toBe(0);
    map.dispose();
  } finally {
    renderer?.dispose();
    browser.restore();
  }
});

test('boot, overlapping deployment requests, and pristine restart generate the city once', async () => {
  const browser = await browserFixture();
  let app: App | undefined;
  try {
    globalThis.requestAnimationFrame = (callback) => {
      queueMicrotask(() => callback(performance.now()));
      return 1;
    };
    const s = fullSquads();
    s.started = false;
    let generations = 0;
    s.world.generateSteps = function* () {
      generations++;
      this.seed += 17;
      yield;
    };
    const renderer = new Renderer(
      s,
      byId<HTMLCanvasElement>('world'),
      byId<HTMLCanvasElement>('hud'),
    );
    app = new App(s, renderer, silent, null, { games: 0, wins: 0, kills: 0, best: 0 });
    await Promise.all([app.boot(), app.newRound(), app.newRound()]);
    expect(generations).toBe(1);
    expect(s.menuState).toBe('deployment');
    expect(s.loading).toBe(false);
    const actors = s.actors.map((a) => [a.x, a.y, a.z]);
    await Promise.all([app.newRound(), app.newRound()]);
    expect(generations).toBe(1);
    expect(s.actors.map((a) => [a.x, a.y, a.z])).toEqual(actors);
    s.world.setRaw(100, 2, 100, 4);
    await app.newRound();
    expect(generations).toBe(2);
    s.settings.seed++;
    await app.newRound();
    expect(generations).toBe(3);
  } finally {
    app?.dispose();
    browser.restore();
  }
});

test('settings show live values and combat HUD distinguishes health and reload state', async () => {
  const browser = await browserFixture();
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
    app.show('options');
    expect(document.querySelector('[data-menu="options"]')?.getAttribute('aria-current')).toBe(
      'page',
    );
    const volume = byId<HTMLInputElement>('volume');
    volume.value = '0.35';
    volume.dispatchEvent(new Event('input'));
    expect(byId('volumeValue').textContent).toBe('35%');
    volume.dispatchEvent(new Event('change'));
    expect(s.settings.volume).toBe(0.35);
    const fov = byId<HTMLInputElement>('fov');
    fov.value = '95';
    fov.dispatchEvent(new Event('input'));
    expect(byId('fovValue').textContent).toBe('95°');
    s.player.hp = 20;
    s.reloadTime = 1;
    app.updateHUD();
    expect(byId('vitals').classList.contains('lowHealth')).toBe(true);
    const progress = byId<HTMLProgressElement>('reloadProgress');
    expect(progress.hidden).toBe(false);
    expect(progress.value).toBeGreaterThan(0);
    expect(progress.value).toBeLessThan(1);
    s.player.hp = 100;
    s.reloadTime = 0;
    app.updateHUD();
    expect(progress.hidden).toBe(true);
    expect(byId('vitals').classList.contains('lowHealth')).toBe(false);
  } finally {
    app?.dispose();
    browser.restore();
  }
});
