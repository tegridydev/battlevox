import { Window } from 'happy-dom';
/** DOM and graphics command adapter only: does not start a browser or validate GPU rendering. */
export async function browserFixture() {
  const window = new Window({
    url: 'http://127.0.0.1:3000',
    settings: {
      enableJavaScriptEvaluation: false,
      disableJavaScriptFileLoading: true,
      disableCSSFileLoading: true,
    },
  });
  window.document.write(await Bun.file('index.html').text());
  const saved = new Map<string, PropertyDescriptor | undefined>();
  const set = (key: string, value: unknown) => {
    saved.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  };
  for (const key of [
    'document',
    'HTMLElement',
    'HTMLInputElement',
    'HTMLSelectElement',
    'HTMLCanvasElement',
    'KeyboardEvent',
    'PointerEvent',
    'Event',
    'MouseEvent',
  ])
    set(key, (window as unknown as Record<string, unknown>)[key]);
  set('window', window);
  set('getComputedStyle', window.getComputedStyle.bind(window));
  set('innerWidth', 1280);
  set('innerHeight', 720);
  set('devicePixelRatio', 1);
  set('requestAnimationFrame', () => 1);
  set('cancelAnimationFrame', () => {});
  const draws = { terrain: 0, instances: 0, deleted: 0 };
  const resources = new Set<object>();
  const create = () => {
      const r = {};
      resources.add(r);
      return r;
    },
    remove = (r: object) => {
      if (resources.delete(r)) draws.deleted++;
    };
  const noop = (...args: unknown[]) => {
    for (const a of args) {
      if (typeof a === 'number' && !Number.isFinite(a)) throw Error('Non-finite graphics argument');
      if (a instanceof Float32Array && ![...a].every(Number.isFinite))
        throw Error('Non-finite vertex data');
    }
  };
  const gl: Record<string, unknown> = {
    createVertexArray: create,
    createBuffer: create,
    createProgram: create,
    createShader: create,
    createTexture: create,
    createFramebuffer: create,
    deleteTexture: remove,
    deleteFramebuffer: remove,
    getExtension: () => null,
    getParameter: () => 4,
    checkFramebufferStatus: () => 77,
    deleteVertexArray: remove,
    deleteBuffer: remove,
    deleteProgram: remove,
    deleteShader: remove,
    getShaderParameter: () => true,
    getProgramParameter: () => true,
    getUniformLocation: create,
    getShaderInfoLog: () => '',
    getProgramInfoLog: () => '',
    drawArrays: (...args: unknown[]) => {
      noop(...args);
      draws.terrain++;
    },
    drawArraysInstanced: (...args: unknown[]) => {
      noop(...args);
      draws.instances += Number(args[3]);
    },
  };
  let value = 1;
  for (const name of [
    'ARRAY_BUFFER',
    'STATIC_DRAW',
    'DYNAMIC_DRAW',
    'FLOAT',
    'VERTEX_SHADER',
    'FRAGMENT_SHADER',
    'COMPILE_STATUS',
    'LINK_STATUS',
    'DEPTH_TEST',
    'CULL_FACE',
    'CW',
    'COLOR_BUFFER_BIT',
    'DEPTH_BUFFER_BIT',
    'TRIANGLES',
    'TEXTURE_2D_ARRAY',
    'TEXTURE_2D',
    'RGBA8',
    'RGBA',
    'UNSIGNED_BYTE',
    'UNSIGNED_INT',
    'TEXTURE_MIN_FILTER',
    'TEXTURE_MAG_FILTER',
    'LINEAR_MIPMAP_LINEAR',
    'LINEAR',
    'NEAREST',
    'TEXTURE_WRAP_S',
    'TEXTURE_WRAP_T',
    'REPEAT',
    'CLAMP_TO_EDGE',
    'DEPTH_COMPONENT24',
    'DEPTH_COMPONENT',
    'DEPTH_ATTACHMENT',
    'FRAMEBUFFER',
    'FRAMEBUFFER_COMPLETE',
    'NONE',
    'BLEND',
    'POLYGON_OFFSET_FILL',
    'TEXTURE0',
    'TEXTURE1',
  ])
    gl[name] = name === 'FRAMEBUFFER_COMPLETE' ? 77 : value++;
  for (const name of [
    'bindVertexArray',
    'bindBuffer',
    'bufferData',
    'bufferSubData',
    'enableVertexAttribArray',
    'vertexAttribPointer',
    'vertexAttribDivisor',
    'enable',
    'frontFace',
    'clearColor',
    'shaderSource',
    'compileShader',
    'attachShader',
    'linkProgram',
    'useProgram',
    'uniformMatrix4fv',
    'uniform3f',
    'uniform3fv',
    'uniform4fv',
    'uniform1fv',
    'uniform1f',
    'clear',
    'viewport',
    'bindTexture',
    'texImage3D',
    'texImage2D',
    'texParameteri',
    'texParameterf',
    'generateMipmap',
    'bindFramebuffer',
    'framebufferTexture2D',
    'drawBuffers',
    'readBuffer',
    'disable',
    'depthMask',
    'polygonOffset',
    'activeTexture',
    'uniform1i',
  ])
    gl[name] = noop;
  const ctx: Record<string, unknown> = {
    createRadialGradient: (...args: unknown[]) => {
      noop(...args);
      return { addColorStop: noop };
    },
    createImageData: (w: number, h: number) => ({
      data: new Uint8ClampedArray(w * h * 4),
      width: w,
      height: h,
    }),
  };
  for (const name of [
    'setTransform',
    'clearRect',
    'fillRect',
    'strokeRect',
    'rect',
    'beginPath',
    'moveTo',
    'lineTo',
    'stroke',
    'fill',
    'arc',
    'fillText',
    'save',
    'restore',
    'drawImage',
    'translate',
    'rotate',
    'closePath',
    'putImageData',
  ])
    ctx[name] = noop;
  Object.defineProperty(window.HTMLElement.prototype, 'setPointerCapture', {
    value: () => {},
    configurable: true,
  });
  Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
    value: (type: string) => (type === 'webgl2' ? gl : ctx),
    configurable: true,
  });
  return {
    window,
    draws,
    gl: gl as Record<string, unknown> & { createBuffer: () => object | null },
    ctx,
    restore() {
      for (const [key, descriptor] of saved) {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else Reflect.deleteProperty(globalThis, key);
      }
      void window.happyDOM.close();
    },
  };
}
