import * as configModule from '../core/config';
import { scoped } from '../core/loadout';
import * as mathModule from '../core/math';
import { canSee } from '../simulation/perception';
import { captureProgress } from '../ui/hud-model';
import { alphaColour } from '../ui/theme';
import { drawOptics } from './optics';
import type { Renderer } from './renderer';
export function project(this: Renderer, x: number, y: number, z: number, vp: Float32Array) {
  const w = vp[3] * x + vp[7] * y + vp[11] * z + vp[15];
  if (w <= 0.1) return null;
  return {
    x:
      ((vp[0] * x + vp[4] * y + vp[8] * z + vp[12]) / w) * this.viewWidth * 0.5 +
      this.viewWidth * 0.5,
    y:
      (-(vp[1] * x + vp[5] * y + vp[9] * z + vp[13]) / w) * this.viewHeight * 0.5 +
      this.viewHeight * 0.5,
  };
}
export function drawCombatHUD(this: Renderer) {
  if (!this.sim.playing || !this.sim.player.alive) return;
  const cx = this.viewWidth / 2,
    cy = this.viewHeight / 2;

  if (!this.sim.touch || this.viewWidth > 700) {
    this.ctx.textAlign = 'center';
    this.ctx.font = `${Math.round(12 * this.layout.scale)}px system-ui`;
    const heading = ((this.sim.yaw * 180) / Math.PI + 360) % 360;
    for (let i = -3; i <= 3; i++) {
      const degree = Math.round(heading / 15) * 15 + i * 15,
        x = cx + mathModule.angleWrap(((degree - heading) * Math.PI) / 180) * 155;
      if (x < cx - 135 || x > cx + 135) continue;
      const d = (degree + 720) % 360;
      this.ctx.fillStyle = alphaColour(this.theme.ink, 0.8);
      this.ctx.fillText(
        d % 90 === 0 ? ['N', 'E', 'S', 'W'][d / 90] : String(d).padStart(3, '0'),
        x,
        this.layout.compassY,
      );
    }
    this.ctx.fillStyle = this.theme.accent;
    this.ctx.fillRect(cx - 1, this.layout.compassY + 4, 2, 5);
  }
  if (this.sim.reloadTime > 0 && !this.sim.player.vehicle) {
    this.ctx.strokeStyle = this.theme.accent;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(
      cx,
      cy,
      23,
      -Math.PI / 2,
      -Math.PI / 2 +
        mathModule.TAU *
          (1 -
            this.sim.reloadTime /
              (configModule.weapons[this.sim.weaponIndex].reload *
                this.sim.weaponTuning[this.sim.weaponIndex].reload)),
    );
    this.ctx.stroke();
  }
  if (this.sim.handling.damageTime > 0) {
    this.ctx.textAlign = 'center';
    this.ctx.font = `bold ${Math.round(13 * this.layout.scale)}px system-ui`;
    this.ctx.fillStyle = this.sim.hitKill ? this.theme.warning : this.theme.ink;
    this.ctx.fillText(
      (this.sim.hitKill
        ? this.sim.handling.head
          ? 'HEADSHOT ELIMINATION · '
          : 'ELIMINATED · '
        : this.sim.handling.head
          ? 'HEADSHOT · '
          : 'HIT · ') + this.sim.handling.damage,
      cx,
      cy + 40,
    );
  }
  if (this.sim.player.shield > 0) {
    this.ctx.textAlign = 'center';
    this.ctx.font = `${Math.round(12 * this.layout.scale)}px system-ui`;
    this.ctx.fillStyle = this.theme.ally;
    this.ctx.fillText(
      'SPAWN PROTECTION · ' + this.sim.player.shield.toFixed(1) + 's',
      cx,
      cy + 118,
    );
  }
}
export function drawHUD(this: Renderer, vp: Float32Array) {
  this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  this.ctx.clearRect(0, 0, this.viewWidth, this.viewHeight);
  if (!this.sim.started) return;
  const centreX = this.viewWidth / 2,
    centreY = this.viewHeight / 2;
  if (this.sim.playing && this.sim.player.alive) {
    this.ctx.strokeStyle = this.theme.ink;
    this.ctx.lineWidth = 1.5;
    const gap = this.sim.player.vehicle
      ? 7
      : mathModule.clamp(this.sim.weaponSpread() * this.viewHeight * 0.65, 2, 40);
    this.ctx.save();
    if (!this.sim.player.vehicle && this.sim.aimAmount > 0.65) this.ctx.globalAlpha = 0;
    this.ctx.beginPath();
    for (const [x, y] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      this.ctx.moveTo(centreX + x * gap, centreY + y * gap);
      this.ctx.lineTo(centreX + x * (gap + 6), centreY + y * (gap + 6));
    }
    this.ctx.strokeStyle = this.theme.deep;
    this.ctx.lineWidth = 4;
    this.ctx.stroke();
    this.ctx.strokeStyle = this.theme.ink;
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
    this.ctx.restore();
    if (this.sim.hitTime > 0) {
      this.ctx.strokeStyle = this.sim.hitKill ? this.theme.enemy : this.theme.ink;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      for (const [x, y] of [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]) {
        this.ctx.moveTo(centreX + x * 8, centreY + y * 8);
        this.ctx.lineTo(centreX + x * 14, centreY + y * 14);
      }
      this.ctx.stroke();
    }
  }
  drawOptics(this);
  this.drawCombatHUD();
  // Sector markers stay visible at long range; nearby friendly marks require LOS.
  this.ctx.textAlign = 'center';
  this.ctx.font = `bold ${Math.round(13 * this.layout.scale)}px system-ui`;
  const labels: { x: number; y: number }[] = [];
  const flags = [...this.sim.world.flags].sort(
    (a, b) =>
      Number(b === this.sim.world.flags[this.sim.handling.objective]) -
        Number(a === this.sim.world.flags[this.sim.handling.objective]) ||
      mathModule.dist2(a, this.sim.player) - mathModule.dist2(b, this.sim.player),
  );
  for (const f of flags) {
    if (scoped(this.sim) && this.sim.aimAmount > 0.7) continue;
    const p = this.project(f.x, this.sim.world.groundAt(f.x, f.z) + 5.4, f.z, vp);
    if (!p || p.x < 30 || p.x > this.viewWidth - 30 || p.y < 90 || p.y > this.viewHeight - 160)
      continue;
    if (
      Math.hypot(p.x - centreX, p.y - centreY) < 64 ||
      labels.some((label) => Math.abs(label.x - p.x) < 64 && Math.abs(label.y - p.y) < 65) ||
      labels.length >= 4
    )
      continue;
    labels.push(p);
    const colour =
      f.owner === 0 ? this.theme.ally : f.owner === 1 ? this.theme.enemy : this.theme.ink;
    this.ctx.fillStyle = this.theme.panel;
    this.ctx.fillRect(p.x - 15, p.y - 15, 30, 27);
    this.ctx.strokeStyle = colour;
    this.ctx.lineWidth = f === this.sim.world.flags[this.sim.handling.objective] ? 2 : 1;
    this.ctx.strokeRect(p.x - 15, p.y - 15, 30, 27);
    this.ctx.fillStyle = colour;
    this.ctx.fillText(f.name, p.x, p.y + 4);
    this.ctx.font = `${Math.round(12 * this.layout.scale)}px system-ui`;
    this.ctx.fillText(
      Math.round(Math.sqrt(mathModule.dist2(this.sim.player, f))) + ' m',
      p.x,
      p.y + 28,
    );
    this.ctx.font = `bold ${Math.round(13 * this.layout.scale)}px system-ui`;
  }
  for (let i = 0; i < this.sim.actors.length; i++) {
    const a = this.sim.actors[i];
    if (
      (scoped(this.sim) && this.sim.aimAmount > 0.7) ||
      a.player ||
      !a.alive ||
      a.team !== this.sim.player.team ||
      mathModule.dist2(a, this.sim.player) > 625
    )
      continue;
    const p = this.project(a.x, a.y + 2.2, a.z, vp);
    if (p && canSee(this.sim, this.sim.camera, { x: a.x, y: a.y + 1.65, z: a.z })) {
      this.ctx.fillStyle = this.theme.ally;
      this.ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
    }
  }
  if (this.sim.acceptsInput && !(scoped(this.sim) && this.sim.aimAmount > 0.7)) {
    const target = this.hudState?.kit.target;
    if (
      target &&
      this.hudState?.kit.available &&
      mathModule.dist2(target, this.sim.player) < 36 &&
      canSee(this.sim, this.sim.camera, { x: target.x, y: target.y + 0.8, z: target.z })
    ) {
      const p = this.project(target.x, target.y + 2, target.z, vp);
      if (
        p &&
        p.x > 20 &&
        p.x < this.viewWidth - 20 &&
        p.y > 130 &&
        p.y < this.viewHeight - 100 &&
        Math.hypot(p.x - centreX, p.y - centreY) > 60
      ) {
        this.ctx.fillStyle = this.theme.squad;
        this.ctx.font = `bold ${Math.round(12 * this.layout.scale)}px system-ui`;
        this.ctx.fillText(`Q · ${this.hudState.kit.label.toUpperCase()}`, p.x, p.y);
      }
    }
    let supplies = 0;
    for (const d of this.sim.deployables) {
      if (
        supplies >= 2 ||
        d.team !== this.sim.player.team ||
        mathModule.dist2(d, this.sim.player) > 225
      )
        continue;
      const p = this.project(d.x, d.y + 0.9, d.z, vp);
      if (
        !p ||
        p.x < 40 ||
        p.x > this.viewWidth - 40 ||
        p.y < 130 ||
        p.y > this.viewHeight - 170 ||
        Math.hypot(p.x - centreX, p.y - centreY) < 64 ||
        !canSee(this.sim, this.sim.camera, { ...d, y: d.y + 0.3 })
      )
        continue;
      this.ctx.fillStyle = this.theme.squad;
      this.ctx.font = `${Math.round(11 * this.layout.scale)}px system-ui`;
      this.ctx.fillText(`${d.kind === 'medical' ? '+ MEDICAL' : 'AMMO'} · ${d.charges}`, p.x, p.y);
      supplies++;
    }
  }
  if (this.layout.showMap) {
    const { x: mx, y: my, width: ms, height: mh } = this.layout.map;
    const player = this.sim.player,
      span = 160,
      scale = ms / span;
    const left = player.x - span / 2,
      north = player.z - span / 2;
    const px = (x: number) => mx + (x - left) * scale;
    const py = (z: number) => my + (z - north) * scale;
    const inside = (x: number, z: number) =>
      x >= left + 4 && x <= left + span - 4 && z >= north + 4 && z <= north + span - 4;
    this.ctx.save();
    this.ctx.fillStyle = this.theme.panel;
    this.ctx.fillRect(mx, my, ms, mh);
    const sx = Math.max(0, left),
      sz = Math.max(0, north),
      sw = Math.min(configModule.W, left + span) - sx,
      sh = Math.min(configModule.D, north + span) - sz;
    if (sw > 0 && sh > 0)
      this.ctx.drawImage(this.mini, sx, sz, sw, sh, px(sx), py(sz), sw * scale, sh * scale);
    this.ctx.strokeStyle = this.theme.line;
    this.ctx.strokeRect(mx, my, ms, mh);
    for (const a of this.sim.actors) {
      if (!a.alive || a.player || !inside(a.x, a.z)) continue;
      if (
        a.team !== player.team &&
        !(
          mathModule.dist2(a, player) < 625 &&
          a.cool > 0.12 &&
          canSee(this.sim, this.sim.camera, { x: a.x, y: a.y + 1.5, z: a.z })
        )
      )
        continue;
      const squad = a.team === player.team && a.squadId === player.squadId;
      this.ctx.fillStyle =
        a.team !== player.team ? this.theme.enemy : squad ? this.theme.squad : this.theme.ally;
      this.ctx.fillRect(px(a.x) - 1, py(a.z) - 1, squad ? 4 : 2, squad ? 4 : 2);
    }
    for (const v of this.sim.vehicles)
      if (v.alive && v.team === player.team && inside(v.x, v.z)) {
        this.ctx.strokeStyle = this.theme.ally;
        this.ctx.strokeRect(px(v.x) - 3, py(v.z) - 3, 6, 6);
      }
    for (const ping of this.sim.pings)
      if (ping.team === player.team && inside(ping.x, ping.z)) {
        this.ctx.strokeStyle = ping.kind === 'enemy' ? this.theme.enemy : this.theme.warning;
        this.ctx.strokeRect(px(ping.x) - 3, py(ping.z) - 3, 6, 6);
      }
    const flag = this.sim.world.flags[this.sim.handling.objective] ?? this.sim.world.flags[4],
      dx = flag.x - player.x,
      dz = flag.z - player.z;
    const edge = Math.max(1, Math.abs(dx) / 68, Math.abs(dz) / 68);
    this.ctx.fillStyle = this.theme.accent;
    this.ctx.font = `bold ${Math.round(11 * this.layout.scale)}px system-ui`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      edge > 1 ? '◆' : flag.name,
      px(player.x + dx / edge),
      py(player.z + dz / edge) + 4,
    );
    this.ctx.fillStyle = this.theme.ink;
    this.ctx.font = `${Math.round(11 * this.layout.scale)}px system-ui`;
    this.ctx.fillText('N · 160 m', mx + ms / 2, my + 11);
    this.ctx.translate(mx + ms / 2, my + mh / 2);
    this.ctx.rotate(-this.sim.yaw);
    this.ctx.beginPath();
    this.ctx.moveTo(0, 7);
    this.ctx.lineTo(-4, -4);
    this.ctx.lineTo(4, -4);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }
  // Contextual markers are positional snapshots, not live wall-tracking of spotted enemies.
  for (const ping of this.sim.pings)
    if (ping.team === this.sim.player.team && !(scoped(this.sim) && this.sim.aimAmount > 0.7)) {
      const p = this.project(ping.x, ping.y + 2.5, ping.z, vp);
      if (!p || p.x < 20 || p.x > this.viewWidth - 20 || p.y < 100 || p.y > this.viewHeight - 170)
        continue;
      this.ctx.strokeStyle = ping.kind === 'enemy' ? this.theme.enemy : this.theme.warning;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(p.x - 7, p.y - 7, 14, 14);
      this.ctx.fillStyle = this.ctx.strokeStyle;
      this.ctx.font = `bold ${Math.round(11 * this.layout.scale)}px system-ui`;
      this.ctx.fillText(ping.kind === 'enemy' ? 'SPOTTED' : 'PING', p.x, p.y - 13);
    }
  const nearby = this.sim.world.flags.find(
    (f) =>
      mathModule.dist2(f, this.sim.player) < 576 &&
      Math.abs(this.sim.player.y - this.sim.world.groundAt(f.x, f.z)) < 5,
  );
  if (this.sim.playing && this.sim.player.alive && nearby) {
    const width = 150,
      y = centreY + 86;
    this.ctx.fillStyle = this.theme.panel;
    this.ctx.fillRect(centreX - width / 2, y, width, 5);
    this.ctx.fillStyle = nearby.contested ? this.theme.accent : this.theme.ally;
    this.ctx.fillRect(
      centreX - width / 2,
      y,
      width * captureProgress(nearby.value, this.sim.player.team),
      5,
    );
  }
  if (this.sim.player.alive && (this.sim.player.hp < 45 || this.sim.hurtTime > 0)) {
    const strength = Math.min(
      0.22,
      Math.max(0, (45 - this.sim.player.hp) / 300) + this.sim.hurtTime * 0.12,
    );
    const shade = this.ctx.createRadialGradient(
      centreX,
      centreY,
      Math.min(this.viewWidth, this.viewHeight) * 0.35,
      centreX,
      centreY,
      Math.hypot(centreX, centreY),
    );
    shade.addColorStop(0, alphaColour(this.theme.danger, 0));
    shade.addColorStop(1, alphaColour(this.theme.danger, strength));
    this.ctx.fillStyle = shade;
    this.ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);
  }
  if (this.sim.hurtTime > 0) {
    const angle = this.sim.damageAngle - this.sim.yaw;
    this.ctx.save();
    this.ctx.translate(centreX, centreY);
    this.ctx.rotate(angle);
    this.ctx.fillStyle = this.theme.danger;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -82);
    this.ctx.lineTo(-9, -64);
    this.ctx.lineTo(9, -64);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }
  if (!this.sim.player.alive && this.sim.playing) {
    this.ctx.fillStyle = alphaColour(this.theme.deep, 0.74);
    this.ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);
    this.ctx.fillStyle = this.theme.ink;
    this.ctx.font = `800 ${Math.round(28 * this.layout.scale)}px system-ui`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      this.sim.tickets[this.sim.player.team] > 0
        ? 'REINFORCEMENTS INBOUND'
        : 'NO RESERVES AVAILABLE',
      centreX,
      centreY - 16,
    );
    this.ctx.font = `${Math.round(16 * this.layout.scale)}px system-ui`;
    this.ctx.fillText(
      this.sim.tickets[this.sim.player.team] > 0
        ? 'Redeploying in ' + Math.max(1, Math.ceil(this.sim.player.respawn)) + ' seconds'
        : 'No reinforcements remain.',
      centreX,
      centreY + 22,
    );
  }
}
export function drawMinimap(this: Renderer) {
  const img = this.miniCtx.createImageData(configModule.W, configModule.D);
  for (let z = 0; z < configModule.D; z++)
    for (let x = 0; x < configModule.W; x++) {
      const y = this.sim.world.floorAt(x, z),
        m = this.sim.world.cell(x, y - 1, z),
        i = (z * configModule.W + x) * 4,
        c =
          x >= 249 && x <= 262 && y < 3
            ? [0.25, 0.48, 0.57]
            : this.sim.world.colours[m] || this.sim.world.colours[1];
      img.data[i] = c[0] * 220;
      img.data[i + 1] = c[1] * 220;
      img.data[i + 2] = c[2] * 220;
      img.data[i + 3] = 255;
    }
  this.miniCtx.putImageData(img, 0, 0);
  this.sim.world.mapDirty = false;
}
