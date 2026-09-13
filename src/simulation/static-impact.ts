import { D, W } from '../core/config';
import { fractureResistance } from '../core/material-physics';
import type { RubbleBody } from '../core/types';
import type { Simulation } from './simulation';

const queues = new WeakMap<Simulation, Map<RubbleBody, { hits: number[]; energy: number }>>();
export function queueStaticImpact(
  sim: Simulation,
  body: RubbleBody,
  hits: number[],
  speed: number,
  work?: number,
) {
  if ((body.age < 0.25 && body.travel < 0.05) || body.impactCooldown > 0 || !hits.length) return;
  let queue = queues.get(sim);
  if (!queue) {
    queue = new Map();
    queues.set(sim, queue);
  }
  const energy = Math.min(16000, work ?? speed * speed * Math.sqrt(body.mass) * 0.22);
  if ((queue.size >= 24 && !queue.has(body)) || energy <= (queue.get(body)?.energy ?? 0)) return;
  const unique = [...new Set(hits)],
    max = Math.min(128, Math.ceil(24 + Math.sqrt(body.mass)));
  const sampled =
    unique.length <= max
      ? unique
      : Array.from({ length: max }, (_, i) => unique[Math.floor((i * unique.length) / max)]);
  queue.set(body, { hits: sampled, energy });
}
export function processStaticImpacts(sim: Simulation) {
  const queue = queues.get(sim),
    budget = sim.destructionBudget;
  if (!queue || !budget) return;
  for (const [body, event] of queue) {
    if (budget.fractureEvents <= 0 || performance.now() >= budget.deadline) break;
    queue.delete(body);
    if (!sim.rubble.includes(body)) continue;
    budget.fractureEvents--;
    let energy = event.energy,
      broken = 0;
    for (const key of event.hits) {
      const x = key % W,
        y = Math.floor(key / (W * D)),
        z = Math.floor(key / W) % D;
      const material = sim.world.cell(x, y, z),
        cost = fractureResistance(material);
      if (!material || material === 1 || energy <= 0) continue;
      const result = sim.world.damageVoxel(x, y, z, Math.min(energy, cost));
      energy -= result.applied;
      if (result.removed) broken++;
    }
    if (broken) {
      body.sleeping = false;
      body.restTime = 0;
      sim.addDust(body, 2, 0.5);
    }
  }
}

export function cancelStaticImpacts(sim: Simulation) {
  queues.get(sim)?.clear();
  queues.delete(sim);
}
