import type { Camera, Vec3 } from '../core/types';
import { AllocationScope } from './allocation-scope';
import { frustumPlanes, insideFrustum } from './frustum';
import type { Program, Renderer } from './renderer';
export type LightingPreset = 'daylight' | 'afternoon' | 'overcast';

import * as configModule from '../core/config';
import * as mathModule from '../core/math';
import * as rubble_shapeModule from '../simulation/rubble-shape';
import * as material_texturesModule from './material-textures';
import * as shadersModule from './shaders';
export const lightingPresets = {
  daylight: {
    sun: [-0.48, 0.83, 0.3],
    tint: [1, 0.96, 0.87],
    sky: [0.76, 0.84, 0.9],
    ambient: 1.12,
    direct: 1,
    clouds: 0.12,
  },
  afternoon: {
    sun: [-0.64, 0.59, -0.49],
    tint: [1, 0.82, 0.6],
    sky: [0.8, 0.82, 0.84],
    ambient: 1.1,
    direct: 1.15,
    clouds: 0.23,
  },
  overcast: {
    sun: [-0.48, 0.83, 0.3],
    tint: [0.94, 0.97, 1],
    sky: [0.73, 0.79, 0.82],
    ambient: 1.45,
    direct: 0.28,
    clouds: 0.9,
  },
};
function normal(v: readonly number[]) {
  const l = Math.hypot(...v) || 1;
  return v.map((x) => x / l);
}
export function lightMatrix(centre: Vec3, sun: number[], size = 1536) {
  const z = normal(sun),
    x = normal([z[2], 0, -z[0]]),
    y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
  const eye = [centre.x + z[0] * 230, centre.y + z[1] * 230, centre.z + z[2] * 230];
  const dot = (a: number[]) => a.reduce((s, v, i) => s + v * eye[i], 0);
  const view = new Float32Array([
    x[0],
    y[0],
    z[0],
    0,
    x[1],
    y[1],
    z[1],
    0,
    x[2],
    y[2],
    z[2],
    0,
    -dot(x),
    -dot(y),
    -dot(z),
    1,
  ]);
  const extent = 115,
    near = 0.1,
    far = 480;
  const projection = new Float32Array([
    1 / extent,
    0,
    0,
    0,
    0,
    1 / extent,
    0,
    0,
    0,
    0,
    -2 / (far - near),
    0,
    0,
    0,
    -(far + near) / (far - near),
    1,
  ]);
  const matrix = mathModule.multiply(projection, view),
    texel = 2 / size;
  matrix[12] = Math.round(matrix[12] / texel) * texel;
  matrix[13] = Math.round(matrix[13] / texel) * texel;
  return matrix;
}
export class ShowcaseLighting {
  renderer: Renderer;
  textures = true;
  shadows = true;
  preset: LightingPreset = 'daylight';
  materials: WebGLTexture;
  shadow: WebGLTexture;
  framebuffer: WebGLFramebuffer;
  available = false;
  light: Float32Array = new Float32Array(16);
  clock = 1;
  private geometryKey = '';
  size = 1536;
  sun: number[] = [];
  depthTerrain: Program;
  depthBoxes: Program;
  depthSections: Program;
  sky: Program;
  constructor(renderer: Renderer) {
    this.renderer = renderer;
    const gl = renderer.gl;
    const allocations = new AllocationScope();
    try {
      this.materials = allocations.keep(
        material_texturesModule.createMaterialTexture(gl),
        (p) => gl.deleteTexture(p),
        'Material texture allocation failed',
      );
      const texture = allocations.keep(
          gl.createTexture(),
          (p) => gl.deleteTexture(p),
          'Unable to allocate shadow texture',
        ),
        fb = allocations.keep(
          gl.createFramebuffer(),
          (p) => gl.deleteFramebuffer(p),
          'Unable to allocate shadow framebuffer',
        );
      if (!texture || !fb) throw Error('Unable to allocate sun shadow map');
      this.shadow = texture;
      this.framebuffer = fb;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.DEPTH_COMPONENT24,
        this.size,
        this.size,
        0,
        gl.DEPTH_COMPONENT,
        gl.UNSIGNED_INT,
        null,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, texture, 0);
      gl.drawBuffers([gl.NONE]);
      gl.readBuffer(gl.NONE);
      this.available = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      this.depthTerrain = allocations.keep(
        renderer.program(shadersModule.staticVertex, shadersModule.depthFragment),
        (p) => gl.deleteProgram(p.p),
        'Unable to allocate depthTerrain program',
      );
      this.depthBoxes = allocations.keep(
        renderer.program(shadersModule.instanceVertex, shadersModule.depthFragment),
        (p) => gl.deleteProgram(p.p),
        'Unable to allocate depthBoxes program',
      );
      this.depthSections = allocations.keep(
        renderer.program(shadersModule.sectionVertex, shadersModule.depthFragment),
        (p) => gl.deleteProgram(p.p),
        'Unable to allocate depthSections program',
      );
      this.sky = allocations.keep(
        renderer.program(shadersModule.skyVertex, shadersModule.skyFragment),
        (p) => gl.deleteProgram(p.p),
        'Unable to allocate sky program',
      );
      this.setPreset('daylight');
      allocations.commit();
    } catch (error) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      allocations.dispose();
      throw error;
    }
  }
  setPreset(value: LightingPreset) {
    if (!Object.hasOwn(lightingPresets, value)) return;
    this.preset = value;
    this.sun = normal(lightingPresets[value].sun);
    this.renderer.sim.world.sky = [...lightingPresets[value].sky];
    this.clock = 1;
  }
  bind(p: Program) {
    const r = this.renderer,
      gl = r.gl,
      u = p.extra,
      settings = lightingPresets[this.preset];
    gl.uniform3fv(u.uSun, this.sun);
    gl.uniform3fv(u.uSunTint, settings.tint);
    gl.uniform1f(u.uAmbient, settings.ambient);
    gl.uniform1f(u.uDirect, settings.direct);
    gl.uniform1f(u.uTextures, +this.textures);
    gl.uniform1f(u.uShadows, +(this.shadows && this.available && !r.noFog));
    gl.uniform1f(u.uNoFog, +r.noFog);
    gl.uniform1f(u.uTime, r.sim.simTime);
    gl.uniformMatrix4fv(u.uLight, false, this.light);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.materials);
    gl.uniform1i(u.uMaterials, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.shadow);
    gl.uniform1i(u.uShadow, 1);
    r.smoke.bind(gl, p);
    r.dust.bind(gl, p);
  }
  renderShadows(cam: Camera, dt: number) {
    this.clock += dt;
    const geometryKey =
      `${this.renderer.sim.world.revision}:` +
      [...this.renderer.gpuSections].map(([b, gpu]) => `${b.id}/${gpu.version}`).join(',');
    if (
      !this.shadows ||
      !this.available ||
      (this.clock < 0.1 && (geometryKey === this.geometryKey || this.clock < 1 / 30))
    )
      return;
    this.geometryKey = geometryKey;
    this.clock = 0;
    const r = this.renderer,
      gl = r.gl,
      f = mathModule.direction(cam.yaw, 0),
      centre = { x: cam.x + f.x * 38, y: 22, z: cam.z + f.z * 38 };
    this.light = lightMatrix(centre, this.sun, this.size);
    r.shadowPlanes = frustumPlanes(this.light);
    // No texture can remain attached for sampling while it is the draw target.
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(0, 0, this.size, this.size);
    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    gl.enable(gl.CULL_FACE);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.3, 2.0);
    gl.useProgram(this.depthTerrain.p);
    gl.uniformMatrix4fv(this.depthTerrain.vp, false, this.light);
    for (const c of r.sim.world.chunks)
      if (
        Math.hypot(c.x * configModule.CS + 8 - centre.x, c.z * configModule.CS + 8 - centre.z) < 180
      )
        r.drawChunk(c);
    gl.useProgram(this.depthSections.p);
    gl.uniformMatrix4fv(this.depthSections.vp, false, this.light);
    for (const [body, gpu] of r.gpuSections) {
      if (
        !r.sim.rubble.includes(body) ||
        !body.voxels.length ||
        gpu.version !== body.geometryVersion ||
        !insideFrustum(r.shadowPlanes, rubble_shapeModule.rubbleBounds(body))
      )
        continue;
      const a = rubble_shapeModule.turnSection(body, { x: 1, y: 0, z: 0 }),
        b = rubble_shapeModule.turnSection(body, { x: 0, y: 1, z: 0 }),
        c = rubble_shapeModule.turnSection(body, { x: 0, y: 0, z: 1 }),
        o = rubble_shapeModule.turnSection(body, body.centre);
      const model = new Float32Array([
        a.x,
        a.y,
        a.z,
        0,
        b.x,
        b.y,
        b.z,
        0,
        c.x,
        c.y,
        c.z,
        0,
        body.x + body.centre.x - o.x,
        body.y + body.centre.y - o.y,
        body.z + body.centre.z - o.z,
        1,
      ]);
      gl.uniformMatrix4fv(this.depthSections.model, false, model);
      gl.bindVertexArray(gpu.vao);
      gl.drawArrays(gl.TRIANGLES, 0, gpu.count);
    }
    r.shadowPass = true;
    // Reuse the exact visual poses. Crouched soldiers cast crouched shadows.
    for (const a of r.sim.actors)
      if (a.alive && !a.vehicle && Math.hypot(a.x - centre.x, a.z - centre.z) < 115)
        r.renderSoldier(a);
    for (const v of r.sim.vehicles)
      if (Math.hypot(v.x - centre.x, v.z - centre.z) < 115) r.renderVehicle(v);
    this.flushShadowBoxes();
    r.shadowPass = false;
    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, r.canvas.width, r.canvas.height);
  }
  flushShadowBoxes() {
    const r = this.renderer,
      gl = r.gl;
    if (!r.instanceCount) return;
    gl.useProgram(this.depthBoxes.p);
    gl.uniformMatrix4fv(this.depthBoxes.vp, false, this.light);
    gl.bindVertexArray(r.boxVAO);
    gl.bindBuffer(gl.ARRAY_BUFFER, r.instanceBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, r.instanceData.subarray(0, r.instanceCount * 14));
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, r.instanceCount);
    r.instanceCount = 0;
  }
  drawSky(cam: Camera, fov: number) {
    const r = this.renderer,
      gl = r.gl,
      p = this.sky,
      u = p.extra,
      f = mathModule.direction(cam.yaw, cam.pitch);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.depthMask(false);
    gl.useProgram(p.p);
    gl.bindVertexArray(null);
    gl.uniform3f(p.eye, cam.x, cam.y, cam.z);
    r.smoke.bind(gl, p);
    r.dust.bind(gl, p);
    gl.uniform3f(u.uForward, f.x, f.y, f.z);
    gl.uniform3f(u.uRight, Math.cos(cam.yaw), 0, -Math.sin(cam.yaw));
    gl.uniform3f(
      u.uUp,
      -Math.sin(cam.yaw) * Math.sin(cam.pitch),
      Math.cos(cam.pitch),
      -Math.cos(cam.yaw) * Math.sin(cam.pitch),
    );
    gl.uniform3fv(u.uSun, this.sun);
    gl.uniform3fv(u.uSunTint, lightingPresets[this.preset].tint);
    gl.uniform3fv(p.sky, r.sim.world.sky);
    gl.uniform1f(u.uAspect, r.viewWidth / r.viewHeight);
    gl.uniform1f(u.uTan, Math.tan(fov * 0.5));
    gl.uniform1f(u.uTime, r.sim.simTime + r.skyTime * 12);
    gl.uniform1f(u.uClouds, lightingPresets[this.preset].clouds);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.depthMask(true);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
  }
  dispose() {
    const gl = this.renderer.gl;
    gl.deleteTexture(this.materials);
    gl.deleteTexture(this.shadow);
    gl.deleteFramebuffer(this.framebuffer);
    for (const p of [this.depthTerrain, this.depthBoxes, this.depthSections, this.sky])
      gl.deleteProgram(p.p);
  }
}
