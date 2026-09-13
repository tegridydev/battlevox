import { D, W } from '../core/config';
import { clamp, dist2 } from '../core/math';
import { scenario } from '../core/scenarios';
import { canSee } from '../simulation/perception';
import type { Simulation } from '../simulation/simulation';
import { alphaColour, canvasTheme } from './theme';
export class TacticalMap {
  private readonly theme = canvasTheme();
  zoom = 1;
  selected: { x: number; z: number } | null = null;
  panX = 0;
  panY = 0;
  private pointer: number | null = null;
  private lastX = 0;
  private lastY = 0;
  private moved = false;
  private startX = 0;
  private startY = 0;
  private abort = new AbortController();
  constructor(
    private canvas: HTMLCanvasElement,
    private sim: Simulation,
    private terrain: HTMLCanvasElement,
    private selectSpawn: (value: string) => void,
  ) {
    const signal = this.abort.signal;
    canvas.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.zoom = clamp(this.zoom * (e.deltaY < 0 ? 1.15 : 0.87), 1, 4);
      },
      { signal, passive: false },
    );
    canvas.addEventListener(
      'pointerdown',
      (e) => {
        if (this.pointer !== null) return;
        this.pointer = e.pointerId;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.moved = false;
        canvas.setPointerCapture(e.pointerId);
      },
      { signal },
    );
    canvas.addEventListener(
      'pointermove',
      (e) => {
        if (e.pointerId !== this.pointer) return;
        const dx = e.clientX - this.lastX,
          dy = e.clientY - this.lastY;
        this.moved ||= Math.hypot(e.clientX - this.startX, e.clientY - this.startY) > 3;
        this.panX += dx;
        this.panY += dy;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
      },
      { signal },
    );
    canvas.addEventListener(
      'pointerup',
      (e) => {
        if (e.pointerId !== this.pointer) return;
        this.pointer = null;
        if (this.moved) return;
        const p = this.toWorld(e.clientX, e.clientY);
        if (p.x < 0 || p.x >= W || p.z < 0 || p.z >= D) return;
        this.selected = p;
        if (this.sim.menuState !== 'deployment') {
          this.sim.pingAt({ x: p.x, y: this.sim.world.groundAt(p.x, p.z), z: p.z });
          return;
        }
        const baseX = scenario(this.sim.testArena).homes[this.sim.player.team];
        for (const [i, z] of scenario(this.sim.testArena).gates.entries())
          if (dist2(p, { x: baseX, z }) < 100) {
            this.selectSpawn(`base:${i}`);
            return;
          }
        const squad = this.sim.squads[this.sim.selectedSquad],
          leader = squad && this.sim.actors[squad.leaderId];
        if (leader && dist2(p, leader) < 100) this.selectSpawn('leader');
      },
      { signal },
    );
    for (const type of ['pointercancel', 'lostpointercapture'])
      canvas.addEventListener(
        type,
        (e) => {
          if ((e as PointerEvent).pointerId !== this.pointer) return;
          this.pointer = null;
        },
        { signal },
      );
  }
  reset() {
    this.zoom = 1;
    this.panX = this.panY = 0;
  }
  private geometry() {
    const width = this.canvas.clientWidth || 700,
      height = this.canvas.clientHeight || 400,
      size = Math.min(width, height) - 30;
    this.panX = clamp(this.panX, (-size * (this.zoom - 1)) / 2, (size * (this.zoom - 1)) / 2);
    this.panY = clamp(this.panY, (-size * (this.zoom - 1)) / 2, (size * (this.zoom - 1)) / 2);
    return {
      width,
      height,
      size: size * this.zoom,
      x: (width - size * this.zoom) / 2 + this.panX,
      y: (height - size * this.zoom) / 2 + this.panY,
    };
  }
  private toWorld(x: number, y: number) {
    const r = this.canvas.getBoundingClientRect(),
      g = this.geometry();
    return { x: ((x - r.left - g.x) / g.size) * W, z: ((y - r.top - g.y) / g.size) * D };
  }
  draw() {
    const c = this.canvas.getContext('2d');
    if (!c) return;
    const g = this.geometry(),
      dpr = Math.min(devicePixelRatio || 1, 2);
    if (
      this.canvas.width !== Math.round(g.width * dpr) ||
      this.canvas.height !== Math.round(g.height * dpr)
    ) {
      this.canvas.width = Math.round(g.width * dpr);
      this.canvas.height = Math.round(g.height * dpr);
    }
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.fillStyle = this.theme.deep;
    c.fillRect(0, 0, g.width, g.height);
    c.drawImage(this.terrain, g.x, g.y, g.size, g.size);
    c.fillStyle = alphaColour(this.theme.deep, 0.33);
    c.fillRect(g.x, g.y, g.size, g.size);
    const x = (v: number) => g.x + (v / W) * g.size,
      z = (v: number) => g.y + (v / D) * g.size;
    c.strokeStyle = this.theme.line;
    for (let i = 0; i <= 8; i++) {
      c.beginPath();
      c.moveTo(x(i * 64), g.y);
      c.lineTo(x(i * 64), g.y + g.size);
      c.moveTo(g.x, z(i * 64));
      c.lineTo(g.x + g.size, z(i * 64));
      c.stroke();
    }
    const squadId =
      this.sim.menuState === 'deployment' ? this.sim.selectedSquad : this.sim.player.squadId;
    for (const a of this.sim.actors) {
      if (!a.alive) continue;
      if (
        a.team !== this.sim.player.team &&
        (dist2(a, this.sim.player) > 625 ||
          !canSee(this.sim, this.sim.camera, { x: a.x, y: a.y + 1.5, z: a.z }))
      )
        continue;
      c.fillStyle =
        a.team !== this.sim.player.team
          ? this.theme.enemy
          : a.squadId === squadId
            ? this.theme.squad
            : this.theme.ally;
      c.beginPath();
      c.arc(x(a.x), z(a.z), a.squadId === squadId ? 3 : 1.5, 0, Math.PI * 2);
      c.fill();
    }
    c.font = 'bold 12px system-ui';
    c.textAlign = 'center';
    for (const f of this.sim.world.flags) {
      c.strokeStyle = f.contested
        ? this.theme.warning
        : f.owner === 0
          ? this.theme.ally
          : f.owner === 1
            ? this.theme.enemy
            : this.theme.ink;
      c.lineWidth = f === this.sim.world.flags[this.sim.handling.objective] ? 3 : 1;
      c.beginPath();
      c.arc(x(f.x), z(f.z), (24 / W) * g.size, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = c.strokeStyle;
      c.fillText(f.name, x(f.x), z(f.z) + 4);
    }
    const baseX = scenario(this.sim.testArena).homes[this.sim.player.team];
    for (const [i, bz] of scenario(this.sim.testArena).gates.entries()) {
      c.fillStyle = this.theme.squad;
      c.fillRect(x(baseX) - 5, z(bz) - 5, 10, 10);
      c.fillText(['N', 'BASE', 'S'][i], x(baseX) + (baseX < 256 ? -20 : 20), z(bz) + 4);
    }
    for (const ping of this.sim.pings)
      if (ping.team === this.sim.player.team) {
        c.strokeStyle = ping.kind === 'enemy' ? this.theme.enemy : this.theme.warning;
        c.lineWidth = 2;
        c.strokeRect(x(ping.x) - 5, z(ping.z) - 5, 10, 10);
        c.fillStyle = c.strokeStyle;
        c.fillText(ping.kind === 'enemy' ? '!' : '◇', x(ping.x), z(ping.z) - 10);
      }
    if (this.selected) {
      c.strokeStyle = this.theme.ink;
      c.lineWidth = 2;
      c.strokeRect(x(this.selected.x) - 9, z(this.selected.z) - 9, 18, 18);
    }
    const squad = this.sim.squads[squadId],
      leader = squad && this.sim.actors[squad.leaderId];
    if (leader?.alive) {
      c.strokeStyle = this.theme.accent;
      c.strokeRect(x(leader.x) - 7, z(leader.z) - 7, 14, 14);
      c.fillStyle = this.theme.accent;
      c.fillText('SL', x(leader.x), z(leader.z) - 12);
    }
    if (squad?.order.kind === 'hold') {
      const p = squad.order.position;
      c.strokeStyle = this.theme.squad;
      c.strokeRect(x(p.x) - 8, z(p.z) - 8, 16, 16);
      c.fillStyle = this.theme.squad;
      c.fillText('HOLD', x(p.x), z(p.z) - 12);
    }
  }
  dispose() {
    this.abort.abort();
  }
}
