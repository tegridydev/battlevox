import { blue, orange, weapons } from '../core/config';
import { loadout } from '../core/loadout';
import { clamp, direction, dist2, lerp } from '../core/math';
import { projectileSpec } from '../core/projectiles';
import type { Actor, DamageSource, Projectile, Vec3, Vehicle } from '../core/types';
import { applyBlast } from './destruction-events';
import { repairVehicle } from './interactions';
import { travelLift } from './navigation';
import { nearMiss, retireNPC } from './npc-state';
import { fortificationStatus, interactionStatus } from './player-actions';
import { muzzleCollision } from './projectile-sweep';
import { clearSegment, damageSection, sectionRay } from './section-query';
import type { Simulation } from './simulation';
import { clearDriver, enterVehicle, leaveVehicle } from './vehicle-state';
export interface DamageContext {
  itemId?: string;
  headshot?: boolean;
}
const playerCredit = (source: DamageSource) =>
  source && ('player' in source ? source.player : source.driver?.player);
const sourceItem = (sim: Simulation, source: DamageSource, context: DamageContext) =>
  context.itemId ??
  (playerCredit(source) ? (sim.player.vehicle ? 'apc' : weapons[sim.weaponIndex].id) : undefined);
export function hurt(
  this: Simulation,
  a: Actor,
  amount: number,
  source: DamageSource,
  context: DamageContext = {},
) {
  if (
    (a.player && this.practiceInvulnerable) ||
    !a.alive ||
    a.shield > 0 ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    (source && source !== a && source.team === a.team)
  )
    return;
  const damage = Math.min(Math.max(0, a.hp), amount),
    credited = Boolean(playerCredit(source) && source !== a),
    itemId = sourceItem(this, source, context);
  a.hp = Math.max(0, a.hp - amount);
  a.lastHit = this.simTime;
  if (a.player) {
    this.hurtTime = 0.75;
    this.shake = Math.max(this.shake, 0.14);
    this.damageAngle = source ? Math.atan2(source.x - a.x, source.z - a.z) : this.yaw;
  }
  if (credited) {
    const old = this.damageContributions.get(a.id);
    this.damageContributions.set(a.id, {
      damage: damage + (old && old.until > this.simTime ? old.damage : 0),
      until: this.simTime + 10,
      itemId: itemId ?? 'ar30',
    });
    this.hitTime = 0.22;
    this.hitKill = a.hp <= 0;
    this.handling.head = Boolean(context.headshot);
    this.confirmHit(damage, this.hitKill, Boolean(context.headshot));
  }
  if (a.hp > 0) return;
  a.alive = false;
  retireNPC(this, a);
  a.deaths = (a.deaths || 0) + 1;
  a.respawn = a.player ? 8 : Math.max(8, 12 - (this.simTime % 12));
  a.reviveUntil = this.simTime + Math.min(8, a.respawn);
  this.tickets[a.team] = Math.max(0, this.tickets[a.team] - 1);
  if (a.vehicle) {
    leaveVehicle(a);
    a.reviveUntil = 0;
  }
  for (let i = 0; i < 5; i++)
    this.emitParticle(a.x, a.y + 0.7, a.z, a.team === 0 ? blue : orange, 0.27, 3, 3);
  if (source && 'frags' in source && source !== a) source.frags = (source.frags || 0) + 1;
  if (credited) {
    this.kills++;
    this.killStreak++;
    this.bestStreak = Math.max(this.bestStreak, this.killStreak);
    this.award('ELIMINATION', 100, itemId, 'kills');
    if (context.headshot) this.award('HEADSHOT', 25, itemId, 'headshots');
    const sector = this.world.flags.find((f) => f.owner === this.player.team && dist2(a, f) < 576);
    if (sector) this.award('SECTOR DEFENCE', 25, itemId);
    this.notify(
      `${context.headshot ? 'HEADSHOT' : 'ELIMINATION'} · ${weapons.find((w) => w.id === itemId)?.name.split(' / ')[0] ?? itemId ?? 'COMBAT'}`,
      this.player.team,
    );
  } else {
    const contribution = this.damageContributions.get(a.id);
    if (
      source &&
      source.team === this.player.team &&
      a.team !== this.player.team &&
      contribution &&
      contribution.until >= this.simTime &&
      contribution.damage >= 25
    )
      this.award(
        'DAMAGE ASSIST',
        Math.min(75, Math.round(contribution.damage)),
        contribution.itemId,
        'assists',
      );
  }
  this.damageContributions.delete(a.id);
  if (a.player) {
    this.deaths++;
    this.killStreak = 0;
    this.award('DEATH', 0, undefined, 'deaths');
    this.reloadTime = 0;
    this.clearInput();
    this.events.push({ type: 'death' });
  }
}

export function hurtVehicle(
  this: Simulation,
  v: Vehicle,
  amount: number,
  source: DamageSource,
  context: DamageContext = {},
): void {
  if (!v.alive || !Number.isFinite(amount) || amount <= 0 || (source && source.team === v.team))
    return;
  v.hp -= amount;
  if (v.hp <= 0) {
    v.alive = false;
    v.respawn = 45;
    if (playerCredit(source))
      this.award('VEHICLE DESTROYED', 250, sourceItem(this, source, context), 'vehicleKills');
    const driver = v.driver;
    clearDriver(v);
    if (driver) {
      driver.vehicle = null;
      driver.shield = 0;
      this.hurt(driver, 200, source, context);
    }
    this.explode({ x: v.x, y: v.y + 1, z: v.z }, 5.5, source, 150, context);
  }
}

export function explode(
  this: Simulation,
  p: Vec3,
  r: number,
  source: DamageSource,
  power = 155,
  context: DamageContext = {},
): void {
  this.flashes.push({ x: p.x, y: p.y, z: p.z, r, life: 0.32 });
  const distance = this.player ? Math.hypot(this.player.x - p.x, this.player.z - p.z) : 100;
  this.shake = Math.max(this.shake, Math.max(0, 1 - distance / 28) * 0.55);
  this.soundAt('boom', p.x, p.z, 1);
  this.addDust(p, r * 0.65, 0.8);
  // Damage uses the intact world for cover, before removing voxels.
  for (const a of this.actors)
    if (a.alive && !a.vehicle) {
      const dx = a.x - p.x,
        dy = a.y + 1 - p.y,
        dz = a.z - p.z,
        d = Math.hypot(dx, dy, dz);
      if (d < r * 1.5) {
        const cover = clearSegment(this, p, { x: a.x, y: a.y + 1, z: a.z }) ? 1 : 0.3;
        this.hurt(a, power * (1 - d / (r * 1.5)) * cover, source, context);
        if (!source || source === a || source.team !== a.team) {
          a.ix += (dx / (d + 0.1)) * 12;
          a.iz += (dz / (d + 0.1)) * 12;
          a.vy += Math.max(0, 1 - d / r) * 5;
        }
      }
    }
  for (const v of this.vehicles)
    if (v.alive) {
      const d = Math.hypot(v.x - p.x, v.y + v.height / 2 - p.y, v.z - p.z);
      if (d < r * 1.5) {
        const samples = [
          { x: v.x, y: v.y + v.height / 2, z: v.z },
          { x: v.x + v.radius * 0.7, y: v.y + v.height / 2, z: v.z },
          { x: v.x - v.radius * 0.7, y: v.y + v.height / 2, z: v.z },
        ];
        const cover =
          0.3 +
          (0.7 * samples.filter((point) => clearSegment(this, p, point)).length) / samples.length;
        this.hurtVehicle(v, power * 2 * (1 - d / (r * 1.5)) * cover, source, context);
      }
    }
  applyBlast(this, p, r, power);
  for (const b of this.world.buildings)
    if (p.x + r > b.x && p.x - r < b.x + b.w && p.z + r > b.z && p.z - r < b.z + b.d)
      b.dirty = true;
  for (let i = 0; i < 22; i++)
    this.emitParticle(
      p.x,
      p.y,
      p.z,
      i < 7 ? [1, 0.65, 0.22] : [0.35, 0.35, 0.32],
      this.effectRnd(0.15, 0.55),
      11,
      this.effectRnd(0.5, 2),
    );
}

export function rayBox(
  this: Simulation,
  o: Vec3,
  d: Vec3,
  b: Vec3 & { xr: number; yr: number; zr: number },
) {
  let lo = 0,
    hi = 150;
  for (const axis of ['x', 'y', 'z'] as const) {
    const min = b[axis] - b[`${axis}r`],
      max = b[axis] + b[`${axis}r`];
    if (Math.abs(d[axis]) < 1e-8) {
      if (o[axis] < min || o[axis] > max) return Infinity;
      continue;
    }
    let t0 = (min - o[axis]) / d[axis],
      t1 = (max - o[axis]) / d[axis];
    if (t0 > t1) [t0, t1] = [t1, t0];
    lo = Math.max(lo, t0);
    hi = Math.min(hi, t1);
    if (lo > hi) return Infinity;
  }
  return lo;
}

export function bullet(this: Simulation, a: Actor, o: Vec3, d: Vec3, amount: number) {
  if (![o.x, o.y, o.z, d.x, d.y, d.z, amount].every(Number.isFinite) || amount <= 0) return;
  const length = Math.hypot(d.x, d.y, d.z);
  if (length < 1e-8) return;
  d = { x: d.x / length, y: d.y / length, z: d.z / length };
  const weaponId = a.player ? this.weaponIndex : a.activeWeapon;
  const weapon = weapons[weaponId] ?? weapons[0];
  const wall = this.world.raycast(o, d, weapon.range);
  const section = sectionRay(this, o, d, wall?.t ?? weapon.range);
  let nearest = section?.t ?? (wall ? wall.t : weapon.range),
    target = null,
    vehicle = null;
  // Includes friendlies as blockers, with friendly-fire damage disabled.
  for (const b of this.rayActors(o, d, nearest))
    if (b !== a && b.alive && !b.vehicle) {
      const t = this.rayBox(o, d, {
        x: b.x,
        y: b.y + b.height / 2,
        z: b.z,
        xr: 0.34,
        yr: b.height / 2,
        zr: 0.34,
      });
      if (t < nearest) {
        nearest = t;
        target = b;
        vehicle = null;
      }
    }
  for (const v of this.vehicles)
    if (v.alive) {
      const t = this.rayBox(o, d, {
        x: v.x,
        y: v.y + v.height / 2,
        z: v.z,
        xr: v.radius,
        yr: v.height / 2,
        zr: v.radius,
      });
      if (t < nearest) {
        nearest = t;
        vehicle = v;
        target = null;
      }
    }
  const end = { x: o.x + d.x * nearest, y: o.y + d.y * nearest, z: o.z + d.z * nearest };
  if (target) {
    const head = end.y > target.y + target.height * 0.83;
    if (a.player) this.handling.head = head;
    const falloff = a.player
      ? lerp(1, this.weaponIndex === 3 ? 0.85 : 0.65, clamp((nearest - 35) / 80, 0, 1))
      : 1;
    this.hurt(
      target,
      amount * falloff * (head ? 1.8 : 1) * (!a.player && target.player ? 10 / 24 : 1),
      a,
      { headshot: head, itemId: a.player ? weapons[this.weaponIndex].id : undefined },
    );
  } else if (vehicle) this.hurtVehicle(vehicle, amount * 0.07, a);
  else if (section) damageSection(section.body, section.index, amount);
  else if (wall) {
    const result = this.world.damageVoxel(wall.x, wall.y, wall.z, amount);
    if (result.removed)
      this.emitParticle(end.x, end.y, end.z, this.world.colours[result.material], 0.2, 3, 1);
  }
  nearMiss(this, a, o, end);
  a.shotSerial++;
  if (this.tracers.length < 90 && (a.player || a.shotSerial % 3 === 0))
    this.tracers.push({ a: { ...o }, b: end, life: 0.11, maxLife: 0.11, team: a.team });
  this.soundAt(weapon.id, o.x, o.z, a.player ? 0.65 : 0.16);
}

export function launch(
  this: Simulation,
  a: DamageSource,
  o: Vec3,
  d: Vec3,
  type: Projectile['type'] = 'rocket',
) {
  if (this.projectiles.length >= 110 || ![o.x, o.y, o.z, d.x, d.y, d.z].every(Number.isFinite))
    return false;
  const norm = Math.hypot(d.x, d.y, d.z);
  if (norm < 1e-8 || !['rocket', 'shell', 'grenade', 'smoke'].includes(type)) return false;
  d = { x: d.x / norm, y: d.y / norm, z: d.z / norm };
  const thrown = type === 'grenade' || type === 'smoke';
  const eye = { ...o };
  let muzzle = { ...o },
    aim: Vec3 | null = null;
  if (type === 'shell' && a) {
    const vehicle = 'driver' in a ? a : a.vehicle;
    if (vehicle) Object.assign(eye, { x: vehicle.x, y: vehicle.y + 2.35, z: vehicle.z });
  } else if (type === 'rocket') {
    const player = !!(a && 'player' in a && a.player);
    if (player) {
      const wall = this.world.raycast(o, d, 115),
        section = sectionRay(this, o, d, wall?.t ?? 115);
      const range = section?.t ?? wall?.t ?? 115;
      aim = { x: o.x + d.x * range, y: o.y + d.y * range, z: o.z + d.z * range };
    }
    const yaw = player ? this.yaw : Math.atan2(d.x, d.z);
    muzzle = {
      x: o.x + Math.cos(yaw) * 0.26 + d.x * 0.72,
      y: o.y - 0.19 + d.y * 0.72,
      z: o.z - Math.sin(yaw) * 0.26 + d.z * 0.72,
    };
  } else if (thrown) {
    muzzle = { x: o.x + d.x * 0.35, y: o.y + d.y * 0.35, z: o.z + d.z * 0.35 };
  }
  const blocked = muzzleCollision(this, eye, muzzle, a);
  if (blocked) {
    // A blocked throwing hand does not spend a grenade; explosive launchers impact cover.
    if (thrown) {
      if (a && 'player' in a && a.player) this.notify('THROW OBSTRUCTED');
      return false;
    }
    this.explode(blocked, type === 'shell' ? 4.2 : 4.8, a, 175, {
      itemId: playerCredit(a) ? (type === 'shell' ? 'apc' : 'at1') : undefined,
    });
    if (a && 'shield' in a) a.shield = 0;
    return true;
  }
  o = muzzle;
  if (aim) {
    const delta = { x: aim.x - o.x, y: aim.y - o.y, z: aim.z - o.z },
      length = Math.hypot(delta.x, delta.y, delta.z);
    if (length > 1e-8) d = { x: delta.x / length, y: delta.y / length, z: delta.z / length };
  }
  const spec = projectileSpec[type],
    speed = spec.speed;
  this.projectiles.push({
    x: o.x,
    y: o.y,
    z: o.z,
    vx: d.x * speed,
    vy: d.y * speed + spec.lift,
    vz: d.z * speed,
    type,
    life: spec.fuse,
    source: a,
    itemId:
      playerCredit(a) && type !== 'smoke'
        ? type === 'grenade'
          ? 'frag'
          : type === 'shell'
            ? 'apc'
            : 'at1'
        : undefined,
  });
  if (a && 'shield' in a) a.shield = 0;
  this.soundAt(thrown ? 'click' : type === 'shell' ? 'cannon' : 'launcher', o.x, o.z, 0.8);
  return true;
}

export function reload(this: Simulation) {
  if (
    !this.playing ||
    !this.player?.alive ||
    this.player.vehicle ||
    this.reloadTime > 0 ||
    this.ammo[this.weaponIndex] >= weapons[this.weaponIndex].mag ||
    this.reserves[this.weaponIndex] <= 0
  )
    return;
  this.reloadTime = weapons[this.weaponIndex].reload * this.weaponTuning[this.weaponIndex].reload;
  this.handling.sprint = 0;
  this.soundAt('click', this.player.x, this.player.z, 0.7);
}

export function switchWeapon(this: Simulation, n: number) {
  if (!this.playing || !this.player?.alive || this.player.vehicle) return;
  if (!Number.isInteger(n) || !loadout(this).includes(n) || n === this.weaponIndex) return;
  this.weaponIndex = n;
  this.player.activeWeapon = n;
  this.scopeStep = 0;
  this.input.firePressed = false;
  this.input.aim = false;
  this.reloadTime = 0;
  this.fireTime = Math.max(this.fireTime, 0.28);
  this.handling.ready = 0.28;
  this.handling.bloom = 0;
  this.aimAmount = 0;
}

export function throwGrenade(this: Simulation) {
  if (
    !this.playing ||
    !this.player?.alive ||
    this.player.vehicle ||
    this.grenades <= 0 ||
    this.grenadeTime > 0
  )
    return;

  const d = direction(this.yaw, this.pitch);
  if (
    this.launch(
      this.player,
      { x: this.player.x, y: this.player.y + 1.5, z: this.player.z },
      d,
      'grenade',
    )
  ) {
    this.grenades--;
    this.grenadeTime = 0.65 * (this.itemTuning.frag ?? 1);
  }
}

export function useVehicle(this: Simulation) {
  const q = interactionStatus(this);
  if (q.action === 'lift') {
    this.useLift();
    return;
  }
  if (!q.available) {
    if (q.label) this.notify(q.reason);
    return;
  }
  if (q.action === 'exit' && q.position) {
    this.clearInput();
    leaveVehicle(this.player);
    Object.assign(this.player, q.position, { vx: 0, vy: 0, vz: 0, height: 1.8, crouched: false });
    this.player.poseEpoch = (this.player.poseEpoch ?? 0) + 1;
  } else if (q.action === 'enter' && q.vehicle && enterVehicle(this.player, q.vehicle)) {
    this.clearInput();
    q.vehicle.vx = q.vehicle.vz = 0;
    this.yaw = q.vehicle.turret;
    this.pitch = 0;
    this.reloadTime = 0;
    this.notify('ARMOURED · Move / steer with WASD. Aim and fire with mouse.');
  }
}

export function useLift(this: Simulation) {
  const q = interactionStatus(this);
  if (q.action !== 'lift') return false;
  if (!q.available) {
    this.notify(q.reason);
    return true;
  }
  if (!travelLift(this, this.player, q.building!, q.level!)) return true;
  this.player.shield = Math.max(this.player.shield, 0.6);
  this.abilityClock = 1.2;
  const b = this.world.buildings[q.building!];
  this.notify(
    q.level === b.floors ? 'ROOFTOP · ' + b.floors + ' STOREYS' : 'LIFT · FLOOR ' + (q.level! + 1),
  );
  return true;
}

export function heal(this: Simulation) {
  if (!this.playing || !this.player.alive || this.player.vehicle || this.abilityClock > 0) return;
  if (this.player.hp >= 100) {
    this.notify('ALREADY AT FULL HEALTH');
    return;
  }
  const restored = Math.min(45, 100 - this.player.hp);
  this.player.hp += restored;
  this.abilityClock = 22 * (this.itemTuning.field_dressing ?? 1);
  this.award('SELF AID', Math.round(restored * 0.25), 'field_dressing');
  this.notify(`FIELD DRESSING · +${Math.round(restored)} health`);
}

export function fortify(this: Simulation) {
  const q = fortificationStatus(this);
  if (!q.available) {
    this.notify(q.reason);
    return;
  }
  if (q.action === 'repair' && q.vehicle) {
    if (!repairVehicle(this, this.player, q.vehicle)) return;
    this.abilityClock = 12 * (this.itemTuning.engineer_tool ?? 1);
    this.notify('ARMOUR REPAIRED');
    return;
  }
  for (const p of q.cells ?? []) this.world.setRaw(p.x, p.y, p.z, 9);
  this.world.navDirty = this.world.mapDirty = true;
  this.abilityClock = 16 * (this.itemTuning.engineer_tool ?? 1);
  this.award('FORTIFICATION', 10, 'engineer_tool');
  this.notify('SANDBAG COVER BUILT');
}

export function weaponSpread(this: Simulation) {
  const speed = Math.hypot(this.player.vx, this.player.vz);
  return (
    weapons[this.weaponIndex].spread *
      this.weaponTuning[this.weaponIndex].spread *
      lerp(1, 0.2, this.aimAmount) *
      (this.player.crouched ? 0.72 : 1) *
      (this.player.onGround ? 1 : 2.7) *
      (1 + Math.min(1, speed / 5) * 0.65) +
    this.handling.bloom
  );
}

export function mantle(this: Simulation) {
  if (!this.player.onGround || this.player.vehicle) return false;
  const dx = Math.sin(this.yaw),
    dz = Math.cos(this.yaw),
    x = this.player.x + dx * 0.95,
    z = this.player.z + dz * 0.95;
  if (!this.occupied(this.player, x, this.player.y, z, 0.29, this.player.height)) return false;
  for (const rise of [1.05, 1.55, 2.05]) {
    if (!this.world.solid(x, this.player.y + rise - 0.12, z)) continue;
    let clear = true;
    for (let t = 0.2; t <= 1.001; t += 0.2) {
      if (
        this.occupied(
          this.player,
          this.player.x,
          this.player.y + rise * t,
          this.player.z,
          0.29,
          this.player.height,
        ) ||
        this.occupied(
          this.player,
          lerp(this.player.x, x, t),
          this.player.y + rise,
          lerp(this.player.z, z, t),
          0.29,
          this.player.height,
        )
      ) {
        clear = false;
        break;
      }
    }
    if (clear) {
      this.player.x = x;
      this.player.z = z;
      this.player.y += rise;
      this.camera.y = Math.max(this.camera.y, this.player.y + 0.2);
      this.player.vy = 0;
      this.handling.ready = 0.32;
      this.handling.land = 0.06;
      this.soundAt('step', x, z, 0.16);
      return true;
    }
  }
  return false;
}

export function confirmHit(this: Simulation, amount: number, killed: boolean, headshot = false) {
  this.handling.damage =
    this.handling.damageTime > 0 ? this.handling.damage + Math.round(amount) : Math.round(amount);
  this.handling.damageTime = 0.8;
  this.events.push({ type: 'hit', killed, headshot });
}
