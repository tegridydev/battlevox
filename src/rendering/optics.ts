import { scoped, zoomFor } from '../core/loadout';
import type { Colour, Tracer } from '../core/types';
import type { Renderer } from './renderer';
/** Reticle geometry overlays the magnified projection, never a zoomed screenshot. */
export function drawOptics(r: Renderer) {
  const s = r.sim,
    ctx = r.ctx,
    w = r.viewWidth,
    h = r.viewHeight,
    x = w / 2,
    y = h / 2;
  if (!s.acceptsInput || s.player.vehicle || s.aimAmount < 0.55) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, (s.aimAmount - 0.55) / 0.4);
  if (scoped(s)) {
    const radius = Math.min(w * 0.32, h * 0.365);
    ctx.fillStyle = '#060a0dfa';
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.fill('evenodd');
    ctx.strokeStyle = '#131a1fe6';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#9eaaa966';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, radius - 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#121a1dee';
    ctx.lineWidth = 1.2;
    for (const axis of [0, 1]) {
      ctx.beginPath();
      for (const side of [-1, 1]) {
        const inner = 8 * side,
          outer = (radius - 14) * side;
        if (!axis) {
          ctx.moveTo(x + inner, y);
          ctx.lineTo(x + outer, y);
        } else {
          ctx.moveTo(x, y + inner);
          ctx.lineTo(x, y + outer);
        }
      }
      ctx.stroke();
    }
    const unit = radius / 9;
    for (let i = 1; i <= 7; i++)
      for (const sign of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(x + i * unit * sign, y - 3);
        ctx.lineTo(x + i * unit * sign, y + 3);
        ctx.moveTo(x - 3, y + i * unit * sign);
        ctx.lineTo(x + 3, y + i * unit * sign);
        ctx.stroke();
      }
    ctx.fillStyle = '#dd644b';
    ctx.beginPath();
    ctx.arc(x, y, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = r.theme.ink;
    ctx.font = '11px ui-monospace,monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${zoomFor(s)}×${s.weaponIndex === 3 ? '  ·  X / ZOOM' : ''}`,
      x,
      Math.min(h - 18, y + radius + 24),
    );
  } else {
    ctx.strokeStyle = '#151d22cc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 3.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ed7153';
    ctx.beginPath();
    ctx.arc(x, y, 1.65, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
export function drawDeployables(r: Renderer) {
  for (const d of r.sim.deployables) {
    if (Math.hypot(d.x - r.sim.camera.x, d.z - r.sim.camera.z) > 150) continue;
    const colour: Colour = d.kind === 'medical' ? [0.3, 0.43, 0.38] : [0.3, 0.34, 0.28];
    r.box(d.x, d.y + 0.22, d.z, 0.6, 0.38, 0.44, colour, 0, 0, 0, 0, 12);
    r.box(d.x, d.y + 0.435, d.z, 0.26, 0.05, 0.08, [0.13, 0.18, 0.17]);
    if (d.kind === 'medical') {
      r.box(d.x, d.y + 0.23, d.z + 0.23, 0.25, 0.045, 0.014, [0.86, 0.91, 0.82]);
      r.box(d.x, d.y + 0.23, d.z + 0.235, 0.045, 0.25, 0.014, [0.86, 0.91, 0.82]);
    } else
      for (const side of [-1, 1])
        r.box(d.x + side * 0.21, d.y + 0.42, d.z, 0.065, 0.03, 0.46, [0.7, 0.6, 0.37]);
  }
}
export function tracerSegment(t: Tracer) {
  const dx = t.b.x - t.a.x,
    dy = t.b.y - t.a.y,
    dz = t.b.z - t.a.z,
    length = Math.hypot(dx, dy, dz);
  if (length < 0.1 || t.life <= 0) return null;
  const phase = Math.min(1, Math.max(0, 1 - t.life / (t.maxLife ?? 0.11)));
  const head = Math.min(length, 1.2 + phase * (length + 4)),
    tail = Math.max(0, head - 2.8);
  if (tail >= head) return null;
  const mid = ((head + tail) * 0.5) / length;
  return {
    x: t.a.x + dx * mid,
    y: t.a.y + dy * mid,
    z: t.a.z + dz * mid,
    length: head - tail,
    yaw: Math.atan2(dx, dz),
    pitch: Math.atan2(dy, Math.hypot(dx, dz)),
    fade: Math.min(1, t.life / 0.035),
  };
}
