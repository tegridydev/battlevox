import { D, W } from '../core/config';
import type { Chunk, RubbleBody } from '../core/types';
import type { Simulation } from '../simulation/simulation';
import { hudLayout } from '../ui/hud-layout';
import type { HudViewModel } from '../ui/hud-model';
import { canvasTheme } from '../ui/theme';
import { AllocationScope } from './allocation-scope';
import { DustUniforms } from './dust';
import * as scene from './scene';
import { faces, fragment, instanceVertex, sectionVertex, staticVertex, tri } from './shaders';
import { ShowcaseLighting } from './showcase-lighting';
import { SmokeUniforms } from './smoke';
export interface Program {
  p: WebGLProgram;
  extra: Record<string, WebGLUniformLocation | null>;
  vp: WebGLUniformLocation | null;
  eye: WebGLUniformLocation | null;
  sky: WebGLUniformLocation | null;
  distance: WebGLUniformLocation | null;
  exposure: WebGLUniformLocation | null;
  model: WebGLUniformLocation | null;
}
interface GPUChunk {
  vao: WebGLVertexArrayObject;
  buffer: WebGLBuffer;
  version: number;
}
export class Renderer {
  readonly theme = canvasTheme();
  hudState?: HudViewModel;
  gl: WebGL2RenderingContext;
  ctx: CanvasRenderingContext2D;
  mini: HTMLCanvasElement;
  miniCtx: CanvasRenderingContext2D;
  terrainProgram: Program;
  boxProgram: Program;
  sectionProgram: Program;
  gpuSections = new Map<RubbleBody, GPUChunk & { count: number }>();
  boxVAO: WebGLVertexArrayObject;
  cubeBuffer: WebGLBuffer;
  instanceBuffer: WebGLBuffer;
  lighting: ShowcaseLighting;
  smoke = new SmokeUniforms();
  dust = new DustUniforms();
  cameraPlanes: Float32Array = new Float32Array(24);
  shadowPlanes: Float32Array = new Float32Array(24);
  noFog = false;
  shadowPass = false;
  instanceData = new Float32Array(16000 * 14);
  instanceCount = 0;
  layout = hudLayout(1280, 720);
  viewWidth = 1;
  viewHeight = 1;
  dpr = 1;
  lastMini = -Infinity;
  roundEpoch = -1;
  resetRound() {
    this.roundEpoch = this.sim.roundEpoch;
    this.lastMini = -Infinity;
    this.resolutionScale = 1;
    this.perfTime = this.perfFrames = 0;
    this.lighting.clock = 1;
    this.lighting.setPreset(this.lighting.preset);
  }
  quality = 0.85;
  resolutionScale = 1;
  perfTime = 0;
  perfFrames = 0;
  displayFPS = 60;
  lastCombatVP: Float32Array = new Float32Array(16);
  skyTime = 0;

  gpuChunks = new Map<Chunk, GPUChunk>();
  viewVP: Float32Array = new Float32Array(16);
  disposed = false;
  constructor(
    public sim: Simulation,
    public canvas: HTMLCanvasElement,
    public hud: HTMLCanvasElement,
  ) {
    const gl = canvas.getContext('webgl2', {
        alpha: false,
        antialias: false,
        powerPreference: 'high-performance',
      }),
      ctx = hud.getContext('2d');
    if (!gl || !ctx)
      throw Error('WebGL 2 is unavailable. Enable hardware acceleration and reload.');
    this.gl = gl;
    this.ctx = ctx;
    this.mini = document.createElement('canvas');
    this.mini.width = W;
    this.mini.height = D;
    const miniCtx = this.mini.getContext('2d');
    if (!miniCtx) throw Error('Unable to initialize tactical map');
    this.miniCtx = miniCtx;
    const allocations = new AllocationScope();
    try {
      this.terrainProgram = allocations.keep(
        this.program(staticVertex),
        (p) => gl.deleteProgram(p.p),
        'Terrain shader allocation failed',
      );
      this.boxProgram = allocations.keep(
        this.program(instanceVertex),
        (p) => gl.deleteProgram(p.p),
        'Instance shader allocation failed',
      );
      this.sectionProgram = allocations.keep(
        this.program(sectionVertex),
        (p) => gl.deleteProgram(p.p),
        'Section shader allocation failed',
      );
      const vao = allocations.keep(
          gl.createVertexArray(),
          (p) => gl.deleteVertexArray(p),
          'Unable to allocate vertex array',
        ),
        cubeBuffer = allocations.keep(
          gl.createBuffer(),
          (p) => gl.deleteBuffer(p),
          'Unable to allocate cube buffer',
        ),
        instanceBuffer = allocations.keep(
          gl.createBuffer(),
          (p) => gl.deleteBuffer(p),
          'Unable to allocate instance buffer',
        );
      if (!vao || !cubeBuffer || !instanceBuffer)
        throw Error('Unable to allocate graphics buffers');
      this.boxVAO = vao;
      this.cubeBuffer = cubeBuffer;
      this.instanceBuffer = instanceBuffer;
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
      const cube: number[] = [];
      for (const [n, c] of faces)
        for (const i of tri) cube.push(c[i][0] - 0.5, c[i][1] - 0.5, c[i][2] - 0.5, ...n);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube), gl.STATIC_DRAW);
      for (let i = 0; i < 2; i++) {
        gl.enableVertexAttribArray(i);
        gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 24, i * 12);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, this.instanceData.byteLength, gl.DYNAMIC_DRAW);
      for (const [a, n, o] of [
        [2, 3, 6],
        [3, 3, 0],
        [4, 3, 3],
        [5, 3, 9],
        [6, 1, 12],
        [7, 1, 13],
      ]) {
        gl.enableVertexAttribArray(a);
        gl.vertexAttribPointer(a, n, gl.FLOAT, false, 56, o * 4);
        gl.vertexAttribDivisor(a, 1);
      }
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.frontFace(gl.CW);
      gl.clearColor(...(sim.world.sky as [number, number, number]), 1);
      this.lighting = allocations.keep(
        new ShowcaseLighting(this),
        (p) => p.dispose(),
        'Lighting allocation failed',
      );
      this.resize();
      allocations.commit();
    } catch (error) {
      allocations.dispose();
      throw error;
    }
  }
  program(vertex: string, fragmentSource = fragment): Program {
    const gl = this.gl,
      p = gl.createProgram();
    if (!p) throw Error('Unable to allocate shader program');
    try {
      for (const [type, source] of [
        [gl.VERTEX_SHADER, vertex],
        [gl.FRAGMENT_SHADER, fragmentSource],
      ] as const) {
        const s = gl.createShader(type);
        if (!s) throw Error('Unable to allocate shader');
        gl.shaderSource(s, source);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
          const message = gl.getShaderInfoLog(s);
          gl.deleteShader(s);
          throw Error(message || 'Shader compilation failed');
        }
        gl.attachShader(p, s);
        gl.deleteShader(s);
      }
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS))
        throw Error(gl.getProgramInfoLog(p) || 'Shader linking failed');
      return {
        p,
        extra: Object.fromEntries(
          [
            'uSun',
            'uSunTint',
            'uAmbient',
            'uDirect',
            'uTime',
            'uTextures',
            'uShadows',
            'uLight',
            'uShadow',
            'uMaterials',
            'uNoFog',
            'uForward',
            'uRight',
            'uUp',
            'uAspect',
            'uTan',
            'uClouds',
            'uSmokeCount',
            'uSmoke[0]',
            'uSmokeFade[0]',
            'uMaterialOrigin',
            'uDustCount',
            'uDust[0]',
            'uDustFade[0]',
          ].map((n) => [n, gl.getUniformLocation(p, n)]),
        ),
        vp: gl.getUniformLocation(p, 'uVP'),
        eye: gl.getUniformLocation(p, 'uEye'),
        sky: gl.getUniformLocation(p, 'uSky'),
        distance: gl.getUniformLocation(p, 'uDistance'),
        exposure: gl.getUniformLocation(p, 'uExposure'),
        model: gl.getUniformLocation(p, 'uModel'),
      };
    } catch (e) {
      gl.deleteProgram(p);
      throw e;
    }
  }
  drawChunk(c: Chunk) {
    const gl = this.gl;
    let gpu = this.gpuChunks.get(c);
    if (!gpu) {
      const vao = gl.createVertexArray(),
        buffer = gl.createBuffer();
      if (!vao || !buffer) {
        if (vao) gl.deleteVertexArray(vao);
        if (buffer) gl.deleteBuffer(buffer);
        throw Error('Unable to allocate terrain buffer');
      }
      gpu = { vao, buffer, version: -1 };
      this.gpuChunks.set(c, gpu);
    }
    gl.bindVertexArray(gpu.vao);
    if (gpu.version !== c.version) {
      gl.bindBuffer(gl.ARRAY_BUFFER, gpu.buffer);
      gl.bufferData(gl.ARRAY_BUFFER, c.mesh, gl.STATIC_DRAW);
      for (let i = 0; i < 3; i++) {
        gl.enableVertexAttribArray(i);
        gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 40, i * 12);
      }
      gl.enableVertexAttribArray(3);
      gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 40, 36);
      gpu.version = c.version;
    }
    gl.drawArrays(gl.TRIANGLES, 0, c.count);
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.lighting.dispose();
    const gl = this.gl;
    for (const { vao, buffer } of this.gpuChunks.values()) {
      gl.deleteVertexArray(vao);
      gl.deleteBuffer(buffer);
    }
    this.gpuChunks.clear();
    for (const { vao, buffer } of this.gpuSections.values()) {
      gl.deleteVertexArray(vao);
      gl.deleteBuffer(buffer);
    }
    this.gpuSections.clear();
    gl.deleteProgram(this.sectionProgram.p);
    gl.deleteVertexArray(this.boxVAO);
    gl.deleteBuffer(this.cubeBuffer);
    gl.deleteBuffer(this.instanceBuffer);

    gl.deleteProgram(this.terrainProgram.p);
    gl.deleteProgram(this.boxProgram.p);
  }
  renderWeapon = scene.renderWeapon;
  drawBoxes = scene.drawBoxes;
  bind = scene.bind;
  box = scene.box;
  part = scene.part;
  renderSoldier = scene.renderSoldier;
  renderVehicle = scene.renderVehicle;
  project = scene.project;
  drawCombatHUD = scene.drawCombatHUD;
  drawHUD = scene.drawHUD;
  drawMinimap = scene.drawMinimap;
  render = scene.render;
  adaptiveResolution = scene.adaptiveResolution;
  resize = scene.resize;
}
