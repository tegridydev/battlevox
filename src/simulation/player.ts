import * as configModule from '../core/config';
import * as mathModule from '../core/math';
import type { Simulation } from './simulation';
export function updatePlayer(this: Simulation, dt: number) {
  if (!this.player.alive) {
    this.player.respawn = Math.max(0, this.player.respawn - dt);
    return;
  }
  this.player.shield = Math.max(0, this.player.shield - dt);
  this.handling.recoilV += (-125 * this.handling.recoil - 20 * this.handling.recoilV) * dt;
  this.handling.recoil += this.handling.recoilV * dt;
  this.handling.bloom = Math.max(0, this.handling.bloom - dt * 0.018);
  this.handling.ready = Math.max(0, this.handling.ready - dt);
  this.handling.land *= Math.exp(-dt * 12);
  this.handling.damageTime = Math.max(0, this.handling.damageTime - dt);
  this.aimAmount = mathModule.lerp(
    this.aimAmount,
    this.input.aim && this.reloadTime <= 0 ? 1 : 0,
    1 - Math.exp(-dt * (this.weaponIndex === 1 ? 9 : 14)),
  );
  const k = this.input.keys;
  let forward = (k.has('KeyW') ? 1 : 0) - (k.has('KeyS') ? 1 : 0) - this.input.mz,
    side = (k.has('KeyD') ? 1 : 0) - (k.has('KeyA') ? 1 : 0) + this.input.mx;
  const length = Math.hypot(forward, side);
  if (length > 1) {
    forward /= length;
    side /= length;
  }
  if (this.player.vehicle) {
    const v = this.player.vehicle;
    v.yaw = mathModule.angleWrap(v.yaw + side * dt * 1.5);
    const speed = forward * 10;
    v.vx = mathModule.lerp(v.vx, Math.sin(v.yaw) * speed, 1 - Math.exp(-dt * 5));
    v.vz = mathModule.lerp(v.vz, Math.cos(v.yaw) * speed, 1 - Math.exp(-dt * 5));
    this.moveBody(v, dt, v.radius, v.height);
    v.turret = this.yaw;
    v.pitch = mathModule.clamp(this.pitch, -0.2, 0.55);
    this.player.x = v.x;
    this.player.z = v.z;
    this.player.y = v.y + 1.4;
    if (this.input.fire && v.cool <= 0) {
      const d = mathModule.direction(v.turret, v.pitch);
      if (
        this.launch(
          this.player,
          { x: v.x + d.x * 2.8, y: v.y + 2.35 + d.y * 2.8, z: v.z + d.z * 2.8 },
          d,
          'shell',
        )
      ) {
        v.cool = 2.1 * (this.itemTuning.apc ?? 1);
        this.shake = 0.25;
        this.player.shield = 0;
      }
    }
    this.handling.sprint = 0;
    this.input.jump = false;
  } else {
    const crouching =
      this.input.crouch ||
      k.has('KeyC') ||
      (this.player.crouched &&
        this.occupied(this.player, this.player.x, this.player.y, this.player.z, 0.29, 1.8));
    this.player.crouched = crouching;
    this.player.height = crouching ? 1.25 : 1.8;
    const sprinting =
      (k.has('ShiftLeft') || k.has('ShiftRight') || (this.touch && length > 0.92)) &&
      forward > 0.3 &&
      !crouching &&
      !this.input.aim &&
      !this.input.fire &&
      this.reloadTime <= 0;
    if (sprinting) this.handling.ready = Math.max(this.handling.ready, 0.16);
    this.handling.sprint = mathModule.lerp(
      this.handling.sprint,
      sprinting ? 1 : 0,
      1 - Math.exp(-dt * 9),
    );
    let speed = crouching ? 2.5 : sprinting ? 7.6 : mathModule.lerp(4.7, 3, this.aimAmount);
    if (this.player.x > 249 && this.player.x < 263 && this.player.y < 2) speed *= 0.56;
    const response = 1 - Math.exp(-dt * (this.player.onGround ? 18 : 4));
    this.player.vx = mathModule.lerp(
      this.player.vx,
      (Math.sin(this.yaw) * forward + Math.cos(this.yaw) * side) * speed,
      response,
    );
    this.player.vz = mathModule.lerp(
      this.player.vz,
      (Math.cos(this.yaw) * forward - Math.sin(this.yaw) * side) * speed,
      response,
    );
    this.handling.coyote = this.player.onGround ? 0.1 : Math.max(0, this.handling.coyote - dt);
    this.handling.jumpBuffer = this.input.jump ? 0.14 : Math.max(0, this.handling.jumpBuffer - dt);
    this.input.jump = false;
    if (this.handling.jumpBuffer > 0 && this.handling.coyote > 0) {
      if (!this.mantle()) {
        this.player.vy = 7;
        this.player.onGround = false;
      }
      this.handling.coyote = this.handling.jumpBuffer = 0;
    }
    const falling = this.player.vy,
      wasGround = this.player.onGround;
    this.moveBody(this.player, dt, 0.29, this.player.height);
    const travelled = Math.hypot(this.player.vx, this.player.vz) * dt;
    this.player.walk += travelled;
    if (this.player.onGround && !wasGround && falling < -4) {
      this.handling.land = Math.min(0.13, -falling * 0.006);
      this.soundAt('step', this.player.x, this.player.z, 0.3);
    }
    if (this.player.onGround) {
      this.handling.step += travelled;
      if (this.handling.step > (sprinting ? 2.25 : 1.85)) {
        this.handling.step = 0;
        this.soundAt(
          'step',
          this.player.x,
          this.player.z,
          crouching ? 0.045 : sprinting ? 0.15 : 0.09,
        );
      }
    }
    if (this.reloadTime > 0) {
      this.reloadTime = Math.max(0, this.reloadTime - dt);
      if (this.reloadTime === 0) {
        const take = Math.min(
          configModule.weapons[this.weaponIndex].mag - this.ammo[this.weaponIndex],
          this.reserves[this.weaponIndex],
        );
        this.ammo[this.weaponIndex] += take;
        this.reserves[this.weaponIndex] -= take;
        this.soundAt('click', this.player.x, this.player.z, 0.2);
      }
    }
    if (
      (this.input.fire || this.input.firePressed) &&
      this.fireTime <= 0 &&
      this.reloadTime <= 0 &&
      this.handling.ready <= 0 &&
      (configModule.weapons[this.weaponIndex].automatic ||
        !this.handling.trigger ||
        this.input.firePressed)
    ) {
      const w = configModule.weapons[this.weaponIndex];
      if (this.ammo[this.weaponIndex] <= 0) this.reload();
      else {
        const spread = this.weaponSpread(),
          d = mathModule.direction(
            this.yaw + this.world.rnd(-spread, spread),
            this.pitch + this.handling.recoil + this.world.rnd(-spread, spread),
          );
        const o = {
          x: this.player.x,
          y: this.player.y + (crouching ? 1.08 : 1.57),
          z: this.player.z,
        };
        const accepted = this.weaponIndex !== 2 || this.launch(this.player, o, d);
        if (accepted) {
          this.ammo[this.weaponIndex]--;
          this.fireTime += w.delay;
          this.player.shield = 0;
          if (this.weaponIndex !== 2) this.bullet(this.player, o, d, w.damage);
          this.handling.recoil +=
            w.kick * this.weaponTuning[this.weaponIndex].kick * (this.input.aim ? 0.7 : 1);
          this.handling.recoilV += w.kick * this.weaponTuning[this.weaponIndex].kick * 5;
          this.handling.bloom = Math.min(
            0.018,
            this.handling.bloom + (this.weaponIndex === 1 ? 0.003 : 0.0019),
          );
          this.shake = Math.max(this.shake, 0.025);
          this.flashes.push({
            x: o.x + d.x * 0.75,
            y: o.y + d.y * 0.75,
            z: o.z + d.z * 0.75,
            r: 0.13,
            life: 0.05,
          });
        }
      }
    }
  }
  this.handling.trigger = this.input.fire;
  this.input.firePressed = false;
  if (this.simTime - this.player.lastHit > 7)
    this.player.hp = Math.min(100, this.player.hp + dt * 8);
  this.fireTime = Math.max(this.input.fire ? -dt : 0, this.fireTime - dt);
  this.grenadeTime = Math.max(0, this.grenadeTime - dt);
}
