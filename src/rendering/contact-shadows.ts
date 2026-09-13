import { D, W } from '../core/config';
import { dist2 } from '../core/math';
import type { Colour } from '../core/types';
import { materialResponse } from './materials';
import type { Renderer } from './renderer';
/** Bounded surface patches: no shadow maps, and no floating patches across holes. */
export function drawContactShadows(renderer: Renderer) {
  const { sim } = renderer,
    used = new Set<number>();
  let budget = 96;
  const patch = (x: number, y: number, z: number) => {
    if (budget <= 0) return;
    const material = sim.world.cell(x, y, z),
      key = sim.world.index(x, y, z);
    if (!material || used.has(key) || sim.world.cell(x, y + 1, z)) return;
    used.add(key);
    budget--;
    const factor = materialResponse[material]?.shadow ?? 0.75;
    const base = sim.world.colours[material];
    const colour: Colour = [base[0] * factor, base[1] * factor, base[2] * factor];
    renderer.box(x + 0.5, y + 1.008, z + 0.5, 0.55, 0.008, 0.55, colour);
  };
  for (const a of sim.actors) {
    if (!a.alive || a.player || !a.onGround || dist2(a, sim.camera) > 1600) continue;
    patch(Math.floor(a.x), Math.floor(a.y - 0.05), Math.floor(a.z));
    if (budget < 32) break;
  }
  for (const body of sim.rubble) {
    if (!body.sleeping || dist2(body, sim.camera) > 2500) continue;
    for (const support of body.support?.terrain ?? []) {
      const key = support.key;
      patch(key % W, Math.floor(key / (W * D)), Math.floor(key / W) % D);
      if (budget <= 0) return;
    }
  }
}
