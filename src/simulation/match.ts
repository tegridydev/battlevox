import { D, H, W, weapons } from '../core/config';
import { clamp, dist2 } from '../core/math';
import { projectileSpec } from '../core/projectiles';
import { atTeamBase } from '../core/scenarios';
import type { CareerStat, Team } from '../core/types';
import { smoke, tickEquipment } from './equipment';
import { updateStrategy } from './gameplay';
import { moveThrown } from './projectile-flight';
import { PROJECTILE_RADIUS, terrainSweep } from './projectile-sweep';
import { damageSection, sectionRay } from './section-query';
import type { Simulation } from './simulation';
export function resetHandling(this: Simulation) {
  this.handling = {
    recoil: 0,
    recoilV: 0,
    bloom: 0,
    sprint: 0,
    ready: 0,
    jumpBuffer: 0,
    coyote: 0,
    trigger: false,
    step: 0,
    land: 0,
    head: false,
    damage: 0,
    damageTime: 0,
    objective: 4,
  };
}

export function award(
  this: Simulation,
  label: string,
  points: number,
  itemId?: string,
  stat?: CareerStat,
  count = 1,
) {
  if (!Number.isFinite(points) || points < 0) return;
  points = Math.floor(points);
  this.score += points;
  if (points > 0) {
    this.awardText = `${label} +${points}`;
    this.awardTime = 2;
    const previous = this.xpFeed.find((e) => e.label === label);
    if (previous) {
      previous.points += points;
      previous.life = 2.5;
    } else this.xpFeed.unshift({ label, points, life: 2.5 });
    this.xpFeed.length = Math.min(3, this.xpFeed.length);
  }
  if (stat) this.roundStats[stat] = (this.roundStats[stat] ?? 0) + count;
  this.events.push({ type: 'xp', label, points, itemId, stat, count });
}

export function notify(this: Simulation, text: string, team: Team = 0) {
  const existing = this.feed.find((item) => item.text === text);
  if (existing) {
    existing.life = 6;
    return;
  }
  this.feed.unshift({ text, team, life: 6 });
  if (this.feed.length > 4) this.feed.length = 4;
}

export function updateProjectiles(this: Simulation, dt: number) {
  if (!Number.isFinite(dt) || dt <= 0) return;
  for (let i = this.projectiles.length - 1; i >= 0; i--) {
    const p = this.projectiles[i];
    // Integrate only the remaining fuse; predictor and live flight must stop at the same instant.
    const flightDt = Math.min(dt, Math.max(0, p.life));
    p.life = Math.max(0, p.life - dt);
    if (p.life < 1e-8) p.life = 0;
    p.vy -= projectileSpec[p.type].gravity * flightDt;
    let impact = false;
    const steps = Math.max(1, Math.ceil((Math.hypot(p.vx, p.vy, p.vz) * flightDt) / 0.4)),
      h = flightDt / steps;
    for (let j = 0; j < steps && !impact; j++) {
      const next = { x: p.x + p.vx * h, y: p.y + p.vy * h, z: p.z + p.vz * h };
      if (p.type === 'grenade' || p.type === 'smoke') {
        moveThrown(this, p, h);
      } else {
        const dx = next.x - p.x,
          dy = next.y - p.y,
          dz = next.z - p.z,
          length = Math.hypot(dx, dy, dz),
          dir = { x: dx / length, y: dy / length, z: dz / length };
        const hit = terrainSweep(this, p, dir, length);
        const section = sectionRay(
          this,
          p,
          dir,
          Math.min(length, hit?.t ?? length),
          PROJECTILE_RADIUS,
        );
        let t = section?.t ?? (hit ? hit.t : Infinity);
        this.neighbours(p.x, p.z, 3, (a) => {
          if (!a.alive || a === p.source || a.vehicle) return;
          const q = this.rayBox(p, dir, {
            x: a.x,
            y: a.y + a.height / 2,
            z: a.z,
            xr: 0.35 + PROJECTILE_RADIUS,
            yr: a.height / 2 + PROJECTILE_RADIUS,
            zr: 0.35 + PROJECTILE_RADIUS,
          });
          if (q <= length) t = Math.min(t, q);
        });
        for (const v of this.vehicles)
          if (v.alive && v !== p.source && v.driver !== p.source) {
            const q = this.rayBox(p, dir, {
              x: v.x,
              y: v.y + v.height / 2,
              z: v.z,
              xr: v.radius + PROJECTILE_RADIUS,
              yr: v.height / 2 + PROJECTILE_RADIUS,
              zr: v.radius + PROJECTILE_RADIUS,
            });
            if (q <= length) t = Math.min(t, q);
          }
        if (t <= length) {
          if (section && section.t === t) damageSection(section.body, section.index, 175);
          p.x += dir.x * Math.max(0, t - 0.03);
          p.y += dir.y * Math.max(0, t - 0.03);
          p.z += dir.z * Math.max(0, t - 0.03);
          impact = true;
        } else Object.assign(p, next);
      }
    }
    if (p.x < 0 || p.x > W || p.z < 0 || p.z > D || p.y < 0 || p.y > H + 10) {
      this.projectiles.splice(i, 1);
      continue;
    }
    if (impact || p.life <= 0) {
      this.projectiles.splice(i, 1);
      if (p.type === 'smoke') {
        smoke(this, p, p.source);
        continue;
      }
      this.explode(p, projectileSpec[p.type].radius, p.source, p.type === 'grenade' ? 130 : 175, {
        itemId: p.itemId,
      });
    }
  }
  this.updateDebris(dt);
  for (const list of [this.tracers, this.flashes, this.feed])
    for (let i = list.length - 1; i >= 0; i--) {
      list[i].life -= dt;
      if (list[i].life <= 0) list.splice(i, 1);
    }
}

export function capture(this: Simulation, dt: number) {
  const control = [0, 0];
  let atPoint = false;
  for (const f of this.world.flags) {
    const count = [0, 0],
      ground = this.world.groundAt(f.x, f.z);
    this.neighbours(f.x, f.z, 24, (a) => {
      if (a.alive && dist2(a, f) < 576 && Math.abs(a.y - ground) < 5) count[a.team]++;
    });
    for (const v of this.vehicles)
      if (v.alive && dist2(v, f) < 576 && Math.abs(v.y - ground) < 5) count[v.team] += 3;
    f.contested = count[0] > 0 && count[1] > 0;
    f.presence = count;
    if (!f.contested && count[0] + count[1])
      f.value = clamp(
        f.value + (count[0] > 0 ? 1 : -1) * dt * 0.06 * Math.min(3, Math.max(...count)),
        -1,
        1,
      );
    const old = f.owner;
    if (f.value >= 0.999) f.owner = 0;
    else if (f.value <= -0.999) f.owner = 1;
    else if ((f.owner === 0 && f.value <= 0) || (f.owner === 1 && f.value >= 0)) f.owner = -1;
    const present =
      this.player.alive && dist2(this.player, f) < 576 && Math.abs(this.player.y - ground) < 5;
    if (old !== f.owner && f.owner >= 0) {
      this.notify(
        `${f.owner === 0 ? 'AEGIS' : 'CINDER'} CAPTURED ${f.name} / ${f.title}`,
        f.owner as Team,
      );
      if (f.owner === this.player.team && present) {
        this.flagCaptures++;
        this.award(`${f.name} CAPTURED`, 300, undefined, 'captures');
        const squad = this.squads[this.player.squadId];
        if (squad?.order.kind === 'objective' && this.world.flags[squad.route] === f)
          this.award('SQUAD ORDER COMPLETE', 100, undefined, 'orders');
      }
    }
    // Active garrisons, rather than empty ownership, build control time.
    if (f.owner >= 0 && !f.contested && count[f.owner] > 0) control[f.owner]++;
    if (f.owner === this.player.team && !f.contested && present) atPoint = true;
  }
  if (control[0] !== control[1]) {
    const team = control[0] > control[1] ? 0 : 1;
    this.controlTime[team] +=
      dt * (1 + Math.min(0.75, Math.max(0, control[team] - control[1 - team] - 1) * 0.15));
  }
  const atBase = atTeamBase(this.testArena, this.player.team, this.player.x);
  if (this.player.alive && (atPoint || atBase) && this.simTime - this.player.lastHit > 5) {
    this.player.supply = (this.player.supply || 0) + dt;
    if (this.player.supply > 6) {
      this.reserves = weapons.map((w) => w.reserve);
      this.grenades = 3;
      this.smokeGrenades = 2;
      this.player.supply = 0;
      this.notify('AMMUNITION & GRENADES REPLENISHED', this.player.team);
    }
  } else this.player.supply = 0;
  if (
    this.controlTime.some((t) => t >= this.controlGoal) ||
    this.simTime >= this.roundLimit ||
    this.tickets.some((t) => t <= 0)
  ) {
    const exhausted = this.tickets.some((t) => t <= 0),
      oneSide = this.tickets[0] <= 0 !== this.tickets[1] <= 0,
      difference = this.controlTime[0] - this.controlTime[1];
    const winner =
      exhausted && oneSide
        ? this.tickets[1] <= 0
        : Math.abs(difference) < 0.01
          ? null
          : difference > 0;
    this.finishBattle(
      winner,
      exhausted
        ? 'reserves'
        : this.controlTime.some((t) => t >= this.controlGoal)
          ? 'control'
          : 'time',
    );
  }
}

export function fixedUpdate(this: Simulation, dt: number) {
  this.ballisticBudget = 2;
  this.coverBudget = 8;
  this.presentation.capture(this.actors);
  this.presentation.capture(this.vehicles);
  this.simTime += dt;
  if (this.practiceSupplies) {
    this.reserves = weapons.map((w) => w.reserve);
    this.grenades = 3;
    this.smokeGrenades = 2;
  }
  this.stepNumber++;
  this.abilityClock = Math.max(0, this.abilityClock - dt);
  this.awardTime = Math.max(0, this.awardTime - dt);
  this.shake *= 0.85;
  this.hitTime = Math.max(0, this.hitTime - dt);
  this.hurtTime = Math.max(0, this.hurtTime - dt);
  this.world.navCooldown -= dt;
  this.world.advanceNavigation();
  this.classClock = Math.max(0, this.classClock - dt);
  this.pings = this.pings.filter((p) => p.expires > this.simTime);
  for (const e of this.xpFeed) e.life -= dt;
  this.xpFeed = this.xpFeed.filter((e) => e.life > 0);
  for (const [id, c] of this.damageContributions)
    if (c.until < this.simTime) this.damageContributions.delete(id);
  updateStrategy(this);
  this.spatial();
  tickEquipment(this, dt);
  this.updatePlayer(dt);
  this.updateAI(dt);
  this.updateVehicles(dt);
  this.spatial();
  this.updateProjectiles(dt);
  // Process one damaged building each tick so collapse cannot monopolise a frame.
  this.advanceCollapse();
  this.updateRubble(dt);
  this.captureClock += dt;
  if (this.captureClock >= 0.25) {
    this.spatial();
    this.capture(this.captureClock);
    this.captureClock = 0;
  }
}
