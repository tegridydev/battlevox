import { expect, test } from 'bun:test';
import { Renderer } from '../../src/rendering/renderer';
import { prepareSectionMesh } from '../../src/simulation/section-mesh';
import { smallSimulation } from '../helpers';

/** Command validation only. No DOM package, server, browser or GPU is involved. */
test('render pipeline submits prepared section shadows, dust and damage feedback and releases resources', () => {
  const resources = new Set<object>(),
    calls: string[] = [],
    saved = new Map<string, PropertyDescriptor | undefined>();
  const set = (key: string, value: unknown) => {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  };
  const finite = (...args: unknown[]) => {
    for (const a of args) {
      if (typeof a === 'number') expect(Number.isFinite(a)).toBe(true);
      if (a instanceof Float32Array) expect(a.every(Number.isFinite)).toBe(true);
    }
  };
  let target: unknown = null,
    vao: unknown = null,
    nextEnum = 100;
  const shadowVAOs = new Set<unknown>();
  const methods: Record<string, unknown> = {
    FRAMEBUFFER_COMPLETE: 77,
    getShaderParameter: () => true,
    getProgramParameter: () => true,
    getUniformLocation: () => ({}),
    getExtension: () => null,
    getParameter: () => 4,
    checkFramebufferStatus: () => 77,
    bindFramebuffer: (_kind: unknown, value: unknown) => {
      target = value;
    },
    bindVertexArray: (value: unknown) => {
      vao = value;
    },
    drawArrays: (...args: unknown[]) => {
      finite(...args);
      calls.push('draw');
      if (target) shadowVAOs.add(vao);
    },
    drawArraysInstanced: (...args: unknown[]) => {
      finite(...args);
      calls.push('instances');
    },
  };
  const gl = new Proxy(methods, {
    get(object, key: string) {
      if (key in object) return object[key];
      if (/^[A-Z_0-9]+$/.test(key)) return (object[key] = nextEnum++);
      if (key.startsWith('create'))
        return (object[key] = () => {
          const value = {};
          resources.add(value);
          return value;
        });
      if (key.startsWith('delete'))
        return (object[key] = (value: object) => {
          resources.delete(value);
        });
      return (object[key] = (...args: unknown[]) => {
        finite(...args);
        calls.push(key);
      });
    },
  });
  const ctx = new Proxy<Record<string, unknown>>(
    {
      createImageData: (w: number, h: number) => ({
        data: new Uint8ClampedArray(w * h * 4),
        width: w,
        height: h,
      }),
      createRadialGradient: (...args: unknown[]) => {
        finite(...args);
        calls.push('damage-gradient');
        return { addColorStop: finite };
      },
    },
    {
      get(object, key: string) {
        return key in object ? object[key] : (object[key] = finite);
      },
    },
  );
  const canvas = {
    clientWidth: 1280,
    clientHeight: 720,
    width: 1280,
    height: 720,
    getContext: (kind: string) => (kind === 'webgl2' ? gl : ctx),
  } as unknown as HTMLCanvasElement;
  set('document', {
    documentElement: {},
    body: { dataset: {} },
    getElementById: () => null,
    createElement: () => ({ getContext: () => ctx }),
  });
  set('getComputedStyle', () => ({ getPropertyValue: () => '' }));
  set('devicePixelRatio', 1);
  let renderer: Renderer | undefined;
  try {
    const s = smallSimulation();
    s.player.hp = 20;
    s.yaw = 0;
    Object.assign(s.actors[1], { x: 30, y: 1, z: 45 });
    s.spawnRubble([{ x: 30, y: 4, z: 45, material: 4 }], undefined, true);
    for (const _ of prepareSectionMesh(s.rubble[0], s.world.colours)) {
    }
    s.addDust({ x: 30, y: 2, z: 40 }, 3);
    s.dust[0].life -= 0.5;
    renderer = new Renderer(s, canvas, canvas);
    renderer.render(1 / 60);
    expect(renderer.dust.count).toBe(1);
    expect(calls).toContain('damage-gradient');
    expect(calls).toContain('instances');
    expect(shadowVAOs.has(renderer.gpuSections.get(s.rubble[0])?.vao)).toBe(true);
    const uploads = calls.filter((c) => c === 'bufferData').length;
    renderer.render(1 / 60);
    expect(calls.filter((c) => c === 'bufferData').length).toBe(uploads);
    renderer.dispose();
    expect(resources.size).toBe(0);
    renderer.dispose();
    expect(resources.size).toBe(0);
  } finally {
    renderer?.dispose();
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});
