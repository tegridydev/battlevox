import { expect, spyOn, test } from 'bun:test';
import { drawRubble, prepareRubble } from '../../src/rendering/destruction';
import { Renderer } from '../../src/rendering/renderer';
import { Simulation } from '../../src/simulation/simulation';
import { byId } from '../../src/ui/dom';
import { browserFixture } from '../browser';

test('render command pipeline boots, meshes, draws and disposes without non-finite data', async () => {
  const browser = await browserFixture();
  let renderer: Renderer | undefined;
  try {
    const s = new Simulation();
    s.reset();
    s.deploy();
    renderer = new Renderer(s, byId<HTMLCanvasElement>('world'), byId<HTMLCanvasElement>('hud'));
    renderer.drawMinimap();
    renderer.render(1 / 60);
    expect(browser.draws.terrain).toBeGreaterThan(0);
    expect(browser.draws.instances).toBeGreaterThan(0);
    const cam = s.camera;
    s.spawnRubble([
      {
        x: Math.floor(cam.x + Math.sin(cam.yaw) * 4),
        y: Math.floor(cam.y),
        z: Math.floor(cam.z + Math.cos(cam.yaw) * 4),
        material: 4,
      },
    ]);
    Object.assign(s.rubble[0], { yaw: 0.2, pitch: 0.4, roll: -0.6 });
    const uploads = spyOn(renderer.gl, 'bufferData'),
      models = spyOn(renderer.gl, 'uniformMatrix4fv');
    try {
      const before = browser.draws.terrain;
      prepareRubble(renderer);
      drawRubble(renderer);
      expect(browser.draws.terrain).toBe(before + 1);
      expect(renderer.gpuSections.get(s.rubble[0])?.count).toBe(36);
      expect(models.mock.calls.at(-1)?.[2]).toHaveLength(16);
      prepareRubble(renderer);
      drawRubble(renderer);
      expect(uploads).toHaveBeenCalledTimes(1);
    } finally {
      uploads.mockRestore();
      models.mockRestore();
    }
    s.addDust({ x: cam.x + Math.sin(cam.yaw), y: cam.y, z: cam.z + Math.cos(cam.yaw) }, 0.25);
    s.updateRubble(1 / 30);
    renderer.dust.update(s.dust, cam);
    expect(renderer.dust.count).toBe(1);
    expect(renderer.dust.fade[0]).toBeGreaterThan(0);
    renderer.instanceCount = 16000;
    renderer.box(0, 0, 0, 1, 1, 1, [1, 1, 1]);
    expect(renderer.instanceCount).toBe(1);
    renderer.dispose();
    expect(browser.draws.deleted).toBeGreaterThan(5);
    const deleted = browser.draws.deleted;
    renderer.dispose();
    expect(browser.draws.deleted).toBe(deleted);
  } finally {
    renderer?.dispose();
    browser.restore();
  }
}, 15000);
