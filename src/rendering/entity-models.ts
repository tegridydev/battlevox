import * as configModule from '../core/config';
import { scoped } from '../core/loadout';
import * as mathModule from '../core/math';
import type { Actor, Camera, Colour, Vehicle } from '../core/types';
import { insideFrustum } from './frustum';
import type { Renderer } from './renderer';
import * as viewmodelModule from './viewmodel';
export function renderWeapon(this: Renderer, vp: Float32Array, cam: Camera) {
  if (
    !this.sim.acceptsInput ||
    this.sim.player.vehicle ||
    (scoped(this.sim) && this.sim.aimAmount > 0.72)
  )
    return;
  vp = mathModule.matrix(cam, this.viewWidth / this.viewHeight, viewmodelModule.viewmodelFov, 0.02);
  this.viewVP = vp;
  const profile = viewmodelModule.viewmodels[this.sim.weaponIndex];
  this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
  const f = mathModule.direction(cam.yaw, cam.pitch),
    r = { x: Math.cos(cam.yaw), y: 0, z: -Math.sin(cam.yaw) },
    u = {
      x: -Math.sin(cam.yaw) * Math.sin(cam.pitch),
      y: Math.cos(cam.pitch),
      z: -Math.cos(cam.yaw) * Math.sin(cam.pitch),
    };
  const bob =
      this.sim.player.onGround && this.sim.settings.motion
        ? Math.sin(this.sim.player.walk * 2.2) * 0.012 * (1 - this.sim.aimAmount * 0.85)
        : 0,
    reloading =
      this.sim.reloadTime > 0
        ? Math.sin(
            (this.sim.reloadTime /
              (configModule.weapons[this.sim.weaponIndex].reload *
                this.sim.weaponTuning[this.sim.weaponIndex].reload)) *
              Math.PI,
          )
        : 0;
  const gun = (x: number, y: number, z: number, sx: number, sy: number, sz: number, c: Colour) => {
    const p = viewmodelModule.viewmodelPoint(
      { x, y, z },
      profile,
      this.sim.aimAmount,
      reloading,
      Math.max(0, this.sim.fireTime) / configModule.weapons[this.sim.weaponIndex].delay,
      bob - this.sim.handling.sprint * 0.08,
    );
    x = p.x;
    y = p.y;
    z = p.z;
    this.box(
      cam.x + r.x * x + u.x * y + f.x * z,
      cam.y + u.y * y + f.y * z,
      cam.z + r.z * x + u.z * y + f.z * z,
      sx * profile.scale,
      sy * profile.scale,
      sz * profile.scale,
      c,
      cam.yaw,
      cam.pitch - reloading * profile.reloadTilt,
      0,
      0,
      c === skin ? 0 : 12,
    );
  };
  const metal: Colour = [0.2, 0.26, 0.28],
    dark: Colour = [0.12, 0.16, 0.19],
    skin: Colour = [0.55, 0.43, 0.32];
  if (this.sim.weaponIndex >= 4) {
    const revolver = this.sim.weaponIndex === 5,
      machine = this.sim.weaponIndex === 6;
    gun(0, 0.015, 0.45, 0.09, 0.12, machine ? 0.35 : 0.25, revolver ? [0.48, 0.51, 0.5] : metal);
    gun(0, -0.105, 0.34, 0.085, 0.23, 0.12, dark);
    gun(0, -0.075, 0.46, 0.045, 0.07, 0.1, dark);
    gun(
      0,
      0.025,
      0.64,
      revolver ? 0.048 : 0.068,
      0.065,
      revolver ? 0.29 : machine ? 0.17 : 0.07,
      dark,
    );
    if (revolver) gun(0, 0.0, 0.48, 0.12, 0.12, 0.14, [0.34, 0.38, 0.37]);
    if (machine) gun(0, -0.095, 0.57, 0.07, 0.19, 0.1, dark);
    // Split rear notch, not a solid rectangle across the aim ray.
    gun(-0.03, 0.1, 0.34, 0.022, 0.037, 0.035, metal);
    gun(0.03, 0.1, 0.34, 0.022, 0.037, 0.035, metal);
    gun(0, 0.08, 0.65, 0.014, 0.027, 0.021, [0.76, 0.81, 0.69]);
    gun(-0.047, -0.105, 0.33, 0.1, 0.15, 0.13, skin);
    gun(0.04, -0.14, 0.35, 0.1, 0.13, 0.12, skin);
  } else if (this.sim.weaponIndex === 2) {
    gun(0, 0, 0.56, 0.16, 0.16, 0.68, [0.35, 0.4, 0.25]);
    gun(0, 0.02, 0.95, 0.24, 0.24, 0.12, dark);
    gun(-0.11, -0.1, 0.65, 0.12, 0.17, 0.2, skin);
    gun(0, 0, 0.23, 0.21, 0.21, 0.08, dark);
    gun(0, -0.13, 0.42, 0.07, 0.19, 0.09, dark);
    gun(-0.1, 0.1, 0.67, 0.035, 0.13, 0.09, metal);
    gun(-0.1, 0.16, 0.67, 0.05, 0.03, 0.15, dark);
    gun(0, 0.085, 0.76, 0.17, 0.025, 0.045, metal);
  } else {
    gun(0, 0, 0.5, 0.12, 0.14, 0.44, metal);
    gun(0, 0.015, 0.86, 0.053, 0.06, 0.42, dark);
    gun(0, -0.09, 0.39, 0.08, 0.23, 0.13, dark);
    gun(0, -0.09, 0.59, 0.08, 0.23, 0.12, metal);
    gun(-0.068, 0.17, 0.58, 0.017, 0.13, 0.04, dark);
    gun(0.068, 0.17, 0.58, 0.017, 0.13, 0.04, dark);
    gun(0, 0.236, 0.58, 0.15, 0.015, 0.04, dark);
    gun(0, 0.103, 0.58, 0.15, 0.015, 0.04, dark);
    gun(0, 0.077, 0.93, 0.018, 0.03, 0.025, dark);
    gun(-0.06, -0.035, 0.72, 0.11, 0.12, 0.2, skin);
    gun(0.025, -0.16, 0.37, 0.13, 0.15, 0.17, skin);
    if (this.sim.weaponIndex === 1) gun(-0.07, -0.09, 0.58, 0.16, 0.17, 0.2, [0.33, 0.37, 0.24]);
    for (let k = 0; k < 6; k++) gun(0, 0.078, 0.48 + k * 0.038, 0.11, 0.018, 0.016, dark);
    gun(0.061, 0.015, 0.45, 0.016, 0.04, 0.08, [0.4, 0.44, 0.43]);
    gun(0, 0.007, 1.08, 0.071, 0.074, 0.055, metal);
    if (this.sim.weaponIndex === 3) {
      gun(0, 0.15, 0.56, 0.085, 0.085, 0.23, dark);
      gun(0, 0.15, 0.434, 0.07, 0.07, 0.013, [0.32, 0.58, 0.65]);
    }
  }
  this.noFog = true;
  this.drawBoxes(vp, cam);
  this.noFog = false;
}
export function renderSoldier(this: Renderer, a: Actor) {
  a = this.sim.presentation.interpolate(a, this.sim.renderAlpha);
  const c = a.team === 0 ? configModule.blue : configModule.orange,
    uniform: Colour = a.team === 0 ? [0.27, 0.36, 0.35] : [0.43, 0.36, 0.27];
  const distance = mathModule.dist2(a, this.sim.camera);
  if (
    (!this.shadowPass && distance > this.sim.settings.distance ** 2) ||
    !insideFrustum(this.shadowPass ? this.shadowPlanes : this.cameraPlanes, {
      min: { x: a.x - 1.3, y: a.y, z: a.z - 1.3 },
      max: { x: a.x + 1.3, y: a.y + 2.5, z: a.z + 1.3 },
    })
  )
    return;
  const crouch = a.crouched,
    head = crouch ? 1.02 : 1.57,
    torso = crouch ? 0.73 : 1.02;
  const moving = Math.hypot(a.vx, a.vz) > 0.3,
    swing = moving ? Math.sin(a.walk * 2.6) * (crouch ? 0.15 : 0.38) : 0;
  const armour: Colour = a.team === 0 ? [0.2, 0.28, 0.29] : [0.31, 0.29, 0.22],
    dark: Colour = [0.14, 0.18, 0.19];
  if (distance > 8100) {
    this.box(
      a.x,
      a.y + (crouch ? 0.55 : 0.8),
      a.z,
      0.49,
      crouch ? 0.91 : 1.4,
      0.36,
      uniform,
      a.yaw,
    );
    this.box(a.x, a.y + head, a.z, 0.36, 0.32, 0.36, c, a.yaw);
    return;
  }
  this.part(a, 0, torso, 0, 0.53, 0.55, 0.32, uniform, a.yaw, 0, 18);
  this.part(a, 0, torso + 0.02, 0.19, 0.43, 0.43, 0.08, armour);
  this.part(a, 0, head, 0.035, 0.31, 0.3, 0.29, [0.68, 0.55, 0.41]);
  this.part(a, 0, head + 0.145, 0, 0.39, 0.15, 0.38, c);
  this.part(a, 0, head + 0.015, 0.188, 0.29, 0.055, 0.035, [0.17, 0.24, 0.26]);
  for (const side of [-1, 1]) {
    if (crouch) {
      this.part(a, side * 0.15, 0.39, 0.12, 0.21, 0.35, 0.27, uniform, a.yaw, side * 0.28);
      this.part(a, side * 0.15, 0.16, 0.11 + side * 0.11, 0.2, 0.28, 0.23, uniform);
    } else
      this.part(
        a,
        side * 0.15,
        0.36,
        -side * swing * 0.22,
        0.21,
        0.69,
        0.24,
        uniform,
        a.yaw,
        side * swing,
      );
    this.part(
      a,
      side * 0.15,
      0.085,
      crouch ? 0.18 : -side * swing * 0.15 + 0.05,
      0.23,
      0.17,
      0.32,
      dark,
    );
    this.part(a, side * 0.31, torso + 0.05, 0.15, 0.17, 0.4, 0.19, uniform, a.yaw, -0.72);
    this.part(a, side * 0.12, torso - 0.1, 0.255, 0.11, 0.18, 0.08, armour);
  }
  const launcher = a.activeWeapon === 2,
    sidearm = a.activeWeapon >= 4;
  this.part(
    a,
    0.18,
    torso + 0.16,
    0.42,
    launcher ? 0.16 : 0.09,
    launcher ? 0.16 : 0.11,
    launcher ? 0.87 : sidearm ? 0.3 : a.kit === 'recon' ? 0.92 : 0.72,
    dark,
  );
  this.part(
    a,
    0.18,
    torso + 0.2,
    sidearm ? 0.59 : 0.82,
    launcher ? 0.22 : 0.05,
    launcher ? 0.22 : 0.05,
    0.13,
    armour,
  );
  this.part(a, 0, torso + 0.02, -0.25, 0.39, 0.44, a.kit === 'support' ? 0.25 : 0.17, armour);
  if (a.kit === 'medic') {
    this.part(a, 0, torso + 0.05, -0.349, 0.16, 0.055, 0.014, [0.86, 0.88, 0.82]);
    this.part(a, 0, torso + 0.05, -0.351, 0.055, 0.16, 0.014, [0.86, 0.88, 0.82]);
  }
  if (a.kit === 'engineer')
    this.part(a, -0.32, torso - 0.17, -0.17, 0.065, 0.32, 0.07, [0.62, 0.58, 0.39]);
  if (a.kit === 'engineer' && !launcher && a.rockets > 0)
    this.part(a, -0.28, torso + 0.12, -0.32, 0.14, 0.82, 0.14, [0.28, 0.34, 0.23]);
  if (a.actionUntil > this.sim.simTime && a.action.startsWith('DEPLOY'))
    this.part(a, 0.18, torso - 0.1, 0.4, 0.3, 0.24, 0.25, [0.37, 0.44, 0.35]);
  if (a.shield > 0) this.part(a, 0, head + 0.42, 0, 0.085, 0.085, 0.085, c);
}
export function renderVehicle(this: Renderer, v: Vehicle) {
  v = this.sim.presentation.interpolate(v, this.sim.renderAlpha);
  if (
    !v.alive ||
    (!this.shadowPass && mathModule.dist2(v, this.sim.camera) > this.sim.settings.distance ** 2) ||
    !insideFrustum(this.shadowPass ? this.shadowPlanes : this.cameraPlanes, {
      min: { x: v.x - 3.5, y: v.y, z: v.z - 3.5 },
      max: { x: v.x + 3.5, y: v.y + 3, z: v.z + 3.5 },
    })
  )
    return;
  const c: Colour = v.team === 0 ? [0.28, 0.4, 0.43] : [0.48, 0.36, 0.25];
  this.part(v, 0, 0.78, 0, 2.65, 1, 3.7, c);
  this.part(v, -1.32, 0.42, 0, 0.42, 0.7, 3.9, [0.16, 0.19, 0.2]);
  this.part(v, 1.32, 0.42, 0, 0.42, 0.7, 3.9, [0.16, 0.19, 0.2]);
  this.box(v.x, v.y + 1.58, v.z, 1.8, 0.65, 1.85, c, v.turret);
  const d = mathModule.direction(v.turret, v.pitch);
  this.box(
    v.x + d.x * 1.85,
    v.y + 1.78 + d.y * 1.85,
    v.z + d.z * 1.85,
    0.22,
    0.22,
    2.6,
    [0.19, 0.25, 0.26],
    v.turret,
    v.pitch,
  );
  this.part(
    v,
    0,
    1.32,
    -1.1,
    1.4,
    0.09,
    0.5,
    v.team === 0 ? configModule.blue : configModule.orange,
  );
  for (const side of [-1, 1])
    for (let j = -1; j <= 1; j++)
      this.part(v, side * 1.54, 0.42, j * 1.25, 0.08, 0.5, 0.65, [0.3, 0.32, 0.3]);
}
