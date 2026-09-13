import * as configModule from '../core/config';
import * as mathModule from '../core/math';
import type { Vehicle } from '../core/types';
import type { Simulation } from './simulation';
import { clearDriver } from './vehicle-state';
export function respawnVehicle(this: Simulation, v: Vehicle) {
  for (let i = 0; i < 70; i++) {
    const x = mathModule.clamp(v.homeX + this.world.rnd(-8, 8), 5, configModule.W - 5),
      z = mathModule.clamp(v.homeZ + this.world.rnd(-8, 8), 5, configModule.D - 5),
      y = this.world.groundAt(x, z);
    if (
      this.occupied(v, x, y, z, v.radius, v.height) ||
      this.actors.some(
        (a) =>
          a.alive &&
          !a.vehicle &&
          Math.abs(a.x - x) < v.radius + 0.4 &&
          Math.abs(a.z - z) < v.radius + 0.4,
      )
    )
      continue;
    clearDriver(v);
    Object.assign(v, {
      x,
      y,
      z,
      hp: 600,
      vx: 0,
      vy: 0,
      vz: 0,
      ix: 0,
      iz: 0,
      alive: true,
      driver: null,
      target: null,
      stuck: 0,
      reverse: 0,
      cool: 3,
    });
    return true;
  }
  return false;
}
export function updateVehicles(this: Simulation, dt: number) {
  for (let i = 0; i < this.vehicles.length; i++) {
    const v = this.vehicles[i];
    if (!v.alive) {
      v.respawn -= dt;
      if (v.respawn <= 0 && !this.respawnVehicle(v)) v.respawn = 1;
      continue;
    }
    v.cool -= dt;
    if (v.driver && (!v.driver.alive || v.driver.vehicle !== v)) clearDriver(v);
    if (v.driver) continue;
    if (this.stepNumber % 30 === (i * 7) % 30) {
      v.goal = 4;
      let best = Infinity;
      for (let j = 0; j < this.world.flags.length; j++) {
        const f = this.world.flags[j],
          n =
            mathModule.clamp(Math.floor(v.z / 2), 0, configModule.ND - 1) * configModule.NW +
            mathModule.clamp(Math.floor(v.x / 2), 0, configModule.NW - 1);
        if (this.world.vehicleFields[j][n] === 65535) continue;
        const cost = Math.sqrt(mathModule.dist2(v, f)) + (f.owner === v.team ? 60 : 0);
        if (cost < best) {
          best = cost;
          v.goal = j;
        }
      }
    }
    const f = this.world.flags[v.goal],
      point = this.world.navigationPoint(v, true),
      l = Math.hypot(f.x - v.x, f.z - v.z),
      oldX = v.x,
      oldZ = v.z;
    let speed = l > 8 && point.reachable ? 4.8 : 0;
    if (v.reverse > 0) {
      v.reverse -= dt;
      speed = -2.5;
    } else if (speed) {
      const target = Math.atan2(point.x - v.x, point.z - v.z),
        turn = mathModule.angleWrap(target - v.yaw);
      v.yaw = mathModule.angleWrap(v.yaw + mathModule.clamp(turn, -dt * 1.5, dt * 1.5));
      if (Math.abs(turn) > 1) speed = 0.5;
    }
    v.vx = Math.sin(v.yaw) * speed;
    v.vz = Math.cos(v.yaw) * speed;
    this.moveBody(v, dt, v.radius, v.height);
    v.stuck = Math.hypot(v.x - oldX, v.z - oldZ) < 0.015 && speed > 0 ? v.stuck + dt : 0;
    if (v.stuck > 2) {
      v.reverse = 1.2;
      v.stuck = 0;
    }
    if (this.stepNumber % 12 === (i * 3) % 12) v.target = this.chooseTarget(v, 60);
    if (v.target?.alive) {
      const t = v.target,
        d = Math.hypot(t.x - v.x, t.z - v.z);
      v.turret = Math.atan2(t.x - v.x, t.z - v.z);
      v.pitch = mathModule.clamp(Math.atan2(t.y + 1 - v.y - 2.35, d) + d * 0.001, -0.2, 0.55);
      if (v.cool <= 0 && d > 9) {
        const dir = mathModule.direction(v.turret, v.pitch);
        if (
          this.launch(
            v,
            { x: v.x + dir.x * 2.8, y: v.y + 2.35 + dir.y * 2.8, z: v.z + dir.z * 2.8 },
            dir,
            'shell',
          )
        )
          v.cool = this.world.rnd(5, 8);
      }
    } else {
      v.turret = v.yaw;
      v.pitch = 0;
    }
  }
}
