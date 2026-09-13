import * as configModule from '../core/config';
import { cameraFov } from '../core/loadout';
import * as mathModule from '../core/math';
import type { Camera, Colour, Vec3 } from '../core/types';
import * as hud_layoutModule from '../ui/hud-layout';
import * as contact_shadowsModule from './contact-shadows';
import * as destructionModule from './destruction';
import { frustumPlanes, insideFrustum } from './frustum';
import { drawDeployables, tracerSegment } from './optics';
import type { Program, Renderer } from './renderer';

export { renderWeapon } from './entity-models';
export function drawBoxes(this: Renderer, vp: Float32Array, cam: Camera) {
  this.bind(this.boxProgram, vp, cam);
  this.gl.bindVertexArray(this.boxVAO);
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceBuffer);
  this.gl.bufferSubData(
    this.gl.ARRAY_BUFFER,
    0,
    this.instanceData.subarray(0, this.instanceCount * 14),
  );
  this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, 36, this.instanceCount);
  this.instanceCount = 0;
}
export function bind(this: Renderer, p: Program, vp: Float32Array, cam: Camera) {
  this.gl.useProgram(p.p);
  this.gl.uniformMatrix4fv(p.vp, false, vp);
  this.gl.uniform3f(p.eye, cam.x, cam.y, cam.z);
  this.gl.uniform3fv(p.sky, this.sim.world.sky);
  this.gl.uniform1f(p.distance, this.sim.settings.distance);
  this.gl.uniform1f(p.exposure, this.sim.settings.brightness);
  this.lighting.bind(p);
}
export function box(
  this: Renderer,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  c: Colour,
  yaw = 0,
  pitch = 0,
  glow = 0,
  roll = 0,
  material = 0,
) {
  if (this.instanceCount >= 16000) {
    if (this.shadowPass) this.lighting.flushShadowBoxes();
    else this.drawBoxes(this.viewVP, this.sim.camera);
  }
  let i = this.instanceCount++ * 14;
  const data = this.instanceData;
  data[i++] = x;
  data[i++] = y;
  data[i++] = z;
  data[i++] = sx;
  data[i++] = sy;
  data[i++] = sz;
  data[i++] = c[0];
  data[i++] = c[1];
  data[i++] = c[2];
  data[i++] = yaw;
  data[i++] = pitch;
  data[i++] = roll;
  data[i++] = glow;
  data[i] = material;
}
export function part(
  this: Renderer,
  a: Vec3 & { yaw: number },
  lx: number,
  ly: number,
  lz: number,
  sx: number,
  sy: number,
  sz: number,
  c: Colour,
  angle = a.yaw,
  p = 0,
  material = 0,
) {
  const s = Math.sin(a.yaw),
    co = Math.cos(a.yaw);
  this.box(
    a.x + co * lx + s * lz,
    a.y + ly,
    a.z - s * lx + co * lz,
    sx,
    sy,
    sz,
    c,
    angle,
    p,
    0,
    0,
    material,
  );
}
export { drawCombatHUD, drawHUD, drawMinimap, project } from './canvas-hud';
export { renderSoldier, renderVehicle } from './entity-models';
export function render(this: Renderer, dt: number) {
  this.sim.world.rebuildPending(3, this.sim.camera);
  if (this.roundEpoch !== this.sim.roundEpoch) this.resetRound();
  if (this.sim.started && this.sim.menuState !== 'home') {
    const pose = this.sim.presentation.interpolate(this.sim.player, this.sim.renderAlpha);
    const y =
      pose.y +
      (this.sim.player.vehicle ? 1.3 : this.sim.player.crouched ? 1.08 : 1.57) +
      (this.sim.player.alive ? 0 : 2);
    this.sim.camera.x = pose.x;
    this.sim.camera.z = pose.z;
    this.sim.camera.y = mathModule.lerp(this.sim.camera.y, y, 1 - Math.exp(-dt * 18));
    this.sim.camera.yaw = this.sim.yaw;
    this.sim.camera.pitch = mathModule.clamp(this.sim.pitch + this.sim.handling.recoil, -1.4, 1.4);
  } else {
    this.skyTime += dt * 0.035;
    this.sim.camera.x = 256 + Math.sin(this.skyTime) * 210;
    this.sim.camera.z = 256 + Math.cos(this.skyTime) * 210;
    this.sim.camera.y = 115;
    this.sim.camera.yaw = Math.atan2(256 - this.sim.camera.x, 256 - this.sim.camera.z);
    this.sim.camera.pitch = -0.32;
  }
  const cam = {
      ...this.sim.camera,
      y: this.sim.camera.y - (this.sim.settings.motion ? this.sim.handling.land : 0),
      yaw:
        this.sim.camera.yaw +
        Math.sin(this.sim.simTime * 57) * this.sim.shake * (this.sim.settings.motion ? 0.02 : 0),
      pitch:
        this.sim.camera.pitch +
        Math.cos(this.sim.simTime * 43) * this.sim.shake * (this.sim.settings.motion ? 0.02 : 0),
    },
    fov = cameraFov(this.sim),
    vp = mathModule.matrix(cam, this.viewWidth / this.viewHeight, fov);
  this.viewVP = vp;
  this.smoke.update(this.sim.smokeClouds);
  this.dust.update(this.sim.dust, cam);
  const planes = frustumPlanes(vp);
  this.cameraPlanes = planes;
  destructionModule.prepareRubble(this);
  this.lighting.renderShadows(cam, dt);
  this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  this.lighting.drawSky(cam, fov);

  this.bind(this.terrainProgram, vp, cam);
  for (const c of this.sim.world.chunks) {
    const dx = c.x * configModule.CS + 8 - cam.x,
      dz = c.z * configModule.CS + 8 - cam.z;
    if (
      Math.hypot(dx, dz) > this.sim.settings.distance + 12 ||
      !insideFrustum(planes, {
        min: { x: c.x * configModule.CS, y: 0, z: c.z * configModule.CS },
        max: { x: (c.x + 1) * configModule.CS, y: c.top + 1, z: (c.z + 1) * configModule.CS },
      })
    )
      continue;
    this.drawChunk(c);
  }
  this.box(256, 1.7, 256, 14, 0.08, 512, [0.26, 0.45, 0.52], 0, 0, 0, 0, 17);
  for (const b of this.sim.world.buildings) {
    if (Math.hypot(b.lift.x - cam.x, b.lift.z - cam.z) > 90) continue;
    this.box(b.lift.x, 5.4, b.lift.z, 0.3, 0.75, 0.22, [0.9, 0.67, 0.25], 0, 0, 1);
  }
  for (const f of this.sim.world.flags) {
    const y = this.sim.world.groundAt(f.x, f.z);
    this.box(f.x, y + 3, f.z, 0.12, 6, 0.12, [0.62, 0.64, 0.6]);
    this.box(
      f.x + 0.9,
      y + 5,
      f.z,
      1.8,
      1,
      0.08,
      f.owner === 0 ? configModule.blue : f.owner === 1 ? configModule.orange : [0.7, 0.7, 0.6],
      Math.sin(this.sim.simTime * 2) * 0.08,
    );
  }
  for (const flag of this.sim.world.flags) {
    if (
      mathModule.dist2(flag, cam) > 45000 &&
      flag !== this.sim.world.flags[this.sim.handling.objective]
    )
      continue;
    const ringColour: Colour = flag.contested
      ? [0.95, 0.77, 0.35]
      : flag.owner === 0
        ? configModule.blue
        : flag.owner === 1
          ? configModule.orange
          : [0.82, 0.83, 0.72];
    for (let i = 0; i < 20; i++) {
      const angle = (i * mathModule.TAU) / 20,
        x = flag.x + Math.sin(angle) * 24,
        z = flag.z + Math.cos(angle) * 24;
      this.box(
        x,
        this.sim.world.groundAt(x, z) + 0.045,
        z,
        0.14,
        0.08,
        2.6,
        ringColour,
        angle + Math.PI / 2,
        0,
        0.3,
      );
    }
  }
  contact_shadowsModule.drawContactShadows(this);
  drawDeployables(this);
  for (const a of this.sim.actors) {
    if (a.alive && !a.player && !a.vehicle) this.renderSoldier(a);
    else if (
      !a.alive &&
      (a.reviveUntil ?? 0) > this.sim.simTime &&
      mathModule.dist2(a, cam) < 9000
    ) {
      this.box(
        a.x,
        a.y + 0.2,
        a.z,
        0.52,
        0.3,
        1.1,
        a.team === 0 ? [0.24, 0.34, 0.35] : [0.42, 0.34, 0.25],
        a.yaw,
      );
      this.part(a, 0, 0.21, 0.66, 0.31, 0.28, 0.31, [0.67, 0.53, 0.4]);
    }
  }
  for (const v of this.sim.vehicles) this.renderVehicle(v);
  destructionModule.drawRubble(this);
  for (const p of this.sim.particles)
    if (mathModule.dist2(p, cam) < 40000)
      this.box(p.x, p.y, p.z, p.size, p.size, p.size, p.c, p.yaw, p.pitch);
  for (const p of this.sim.projectiles)
    this.box(
      p.x,
      p.y,
      p.z,
      0.14,
      0.14,
      0.5,
      [1, 0.73, 0.27],
      Math.atan2(p.vx, p.vz),
      Math.atan2(p.vy, Math.hypot(p.vx, p.vz)),
      1,
    );
  for (const t of this.sim.tracers) {
    const segment = tracerSegment(t);
    if (segment)
      this.box(
        segment.x,
        segment.y,
        segment.z,
        0.012,
        0.012,
        segment.length,
        [0.93, 0.77, 0.48],
        segment.yaw,
        segment.pitch,
        segment.fade,
      );
  }
  for (const p of this.sim.flashes) {
    const s = Math.max(0.05, p.r * (1 - p.life / 0.4) * 1.2);
    this.box(p.x, p.y, p.z, s, s, s, [1, 0.58, 0.19], this.sim.simTime, this.sim.simTime * 0.5, 1);
  }
  this.drawBoxes(vp, cam);
  if (this.sim.playing) this.renderWeapon(vp, cam);
  this.lastCombatVP = vp;
  if (this.sim.started && this.sim.menuState !== 'home') this.drawHUD(vp);
  else this.ctx.clearRect(0, 0, this.hud.width, this.hud.height);
  if (this.sim.started) {
    if (this.sim.world.mapDirty && this.sim.simTime - this.lastMini > 5) {
      this.lastMini = this.sim.simTime;
      this.drawMinimap();
    }
  }
}
export function adaptiveResolution(this: Renderer, dt: number) {
  this.perfTime += dt;
  this.perfFrames++;
  if (this.perfTime < 3) return;
  this.displayFPS = Math.round(this.perfFrames / this.perfTime);
  if (this.sim.settings.adaptive && this.sim.playing) {
    const old = this.resolutionScale;
    if (this.displayFPS < 40) this.resolutionScale = Math.max(0.6, this.resolutionScale - 0.08);
    else if (this.displayFPS > 57) this.resolutionScale = Math.min(1, this.resolutionScale + 0.04);
    if (old !== this.resolutionScale) this.resize();
  }
  this.perfTime = this.perfFrames = 0;
}
export function resize(this: Renderer) {
  this.viewWidth = Math.max(1, this.canvas.clientWidth || innerWidth);
  this.viewHeight = Math.max(1, this.canvas.clientHeight || innerHeight);
  const hudElement = document.getElementById('gameHUD');
  const safeStyle = hudElement ? window.getComputedStyle(hudElement) : undefined;
  const inset = Math.max(
    16,
    ...(['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'] as const).map(
      (key) => Number.parseFloat(safeStyle?.[key] ?? '') || 0,
    ),
  );
  this.layout = hud_layoutModule.hudLayout(
    this.viewWidth,
    this.viewHeight,
    this.sim.touch,
    inset,
    this.sim.settings.hudScale,
    document.body.dataset.hudPanel ?? '',
  );
  hud_layoutModule.applyHudLayout(this.layout);
  this.dpr = Math.min(devicePixelRatio || 1, 2);
  const scale = Math.min(
    this.dpr,
    this.sim.settings.quality * (this.sim.settings.adaptive ? this.resolutionScale : 1),
  );
  this.canvas.width = Math.round(this.viewWidth * scale);
  this.canvas.height = Math.round(this.viewHeight * scale);
  this.hud.width = Math.round(this.viewWidth * this.dpr);
  this.hud.height = Math.round(this.viewHeight * this.dpr);
  this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
}
