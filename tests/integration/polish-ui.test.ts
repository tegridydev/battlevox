import { expect, spyOn, test } from 'bun:test';
import { Renderer } from '../../src/rendering/renderer';
import { App } from '../../src/ui/app';
import { byId } from '../../src/ui/dom';
import { browserFixture } from '../browser';
import { smallSimulation } from '../helpers';

async function setup() {
  const fixture = await browserFixture(),
    s = smallSimulation();
  s.createSquads();
  const r = new Renderer(s, byId<HTMLCanvasElement>('world'), byId<HTMLCanvasElement>('hud'));
  const app = new App(s, r, { resume() {}, sync() {}, consume() {}, dispose() {} }, null, {
    games: 0,
    wins: 0,
    kills: 0,
    best: 0,
  });
  byId('loading').hidden = true;
  return { fixture, s, r, app };
}
test('tactical focus skips disabled selects and the scoreboard remains keyboard browsable', async () => {
  const { fixture, s, app } = await setup();
  try {
    app.openTactical('map');
    byId('tab-tactical-roster').focus();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'Tab', cancelable: true, bubbles: true }),
    );
    expect(document.activeElement).toBe(byId('panel-tactical-roster'));
    document.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'Tab', cancelable: true, bubbles: true }),
    );
    expect(document.activeElement).toBe(byId('zoomOut'));
    app.showScores();
    expect(byId('scoreContent').querySelectorAll('.scoreRow')).toHaveLength(s.actors.length);
    document.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'Tab', cancelable: true, bubbles: true }),
    );
    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'Tab', bubbles: true }));
    expect(byId('scoreboard').hidden).toBe(false);
    expect(document.activeElement?.classList.contains('scoreList')).toBe(true);
    app.closeScores();
    expect(byId('tactical').inert).toBe(false);
  } finally {
    app.dispose();
    fixture.restore();
  }
});
test('opaque menus skip scene submission while the live tactical map continues updating', async () => {
  const { fixture, s, r, app } = await setup();
  const render = spyOn(r, 'render'),
    minimap = spyOn(r, 'drawMinimap');
  try {
    app.show('home');
    app.tick(1 / 60);
    expect(render).toHaveBeenCalledTimes(0);
    app.openTactical('map');
    const before = s.simTime;
    s.world.mapDirty = true;
    app.tick(1 / 30);
    expect(s.simTime).toBeGreaterThan(before);
    expect(render).toHaveBeenCalledTimes(0);
    expect(minimap).toHaveBeenCalledTimes(1);
    app.show('play');
    app.tick(1 / 60);
    expect(render).toHaveBeenCalledTimes(1);
  } finally {
    render.mockRestore();
    minimap.mockRestore();
    app.dispose();
    fixture.restore();
  }
});
test('HUD scale, kit readiness, carried equipment and resume emphasis follow actual state', async () => {
  const { fixture, s, app } = await setup();
  try {
    app.show('home');
    expect(byId('homeResume').classList.contains('primary')).toBe(true);
    expect(byId('deploy').classList.contains('primary')).toBe(false);
    app.show('play');
    s.player.hp = 50;
    s.classAbility();
    s.ammo[0] = 7;
    s.reloadTime = 1;
    app.updateHUD();
    expect(byId('ammo').textContent).toBe('7');
    expect(byId('kitState').textContent).toContain('22s');
    expect(byId<HTMLButtonElement>('kitAction').disabled).toBe(true);
    expect(byId('carriedLoadout').textContent).toContain('ASSAULT');
    const scale = byId<HTMLSelectElement>('hudScale');
    scale.value = '1.3';
    scale.dispatchEvent(new Event('change'));
    expect(s.settings.hudScale).toBe(1.3);
    expect(byId('gameHUD').style.getPropertyValue('--hud-scale')).toBe('1.3');
  } finally {
    app.dispose();
    fixture.restore();
  }
});
