import { D, H, W } from '../core/config';
import { fractureResistance } from '../core/material-physics';
import type { Vec3 } from '../core/types';
import { energyImpulse } from './contact';
import { nearbySections } from './section-index';
import { damageSection } from './section-query';
import { voxelPoint } from './section-tree';
import type { Simulation } from './simulation';
export interface EnergyLedger {
  input: number;
  fractureBudget: number;
  fractureSpent: number;
  motionBudget: number;
  motionSpent: number;
}
interface DestructionEvent {
  point: Vec3;
  radius: number;
  ledger: EnergyLedger;
}
const history = new WeakMap<Simulation, EnergyLedger[]>();
/** All receivers share one event budget. Health/cover evaluation precedes this commit. */
export function applyBlast(sim: Simulation, point: Vec3, radius: number, power: number) {
  const input = Math.max(0, power * radius * radius * 4);
  if (!Number.isFinite(input) || radius <= 0) return;
  const event: DestructionEvent = {
    point: { ...point },
    radius,
    ledger: {
      input,
      fractureBudget: input * 0.8,
      fractureSpent: 0,
      motionBudget: input * 0.2,
      motionSpent: 0,
    },
  };
  const { ledger } = event;
  const candidates: { x: number; y: number; z: number; material: number; weight: number }[] = [];
  let weight = 0;
  for (
    let z = Math.max(0, Math.floor(point.z - radius));
    z <= Math.min(D - 1, point.z + radius);
    z++
  )
    for (
      let x = Math.max(0, Math.floor(point.x - radius));
      x <= Math.min(W - 1, point.x + radius);
      x++
    )
      for (
        let y = Math.max(1, Math.floor(point.y - radius));
        y <= Math.min(H - 1, point.y + radius);
        y++
      ) {
        const material = sim.world.cell(x, y, z),
          distance = Math.hypot(x + 0.5 - point.x, y + 0.5 - point.y, z + 0.5 - point.z);
        if (!material || material === 1 || distance >= radius) continue;
        const w = (1 - distance / radius) ** 2;
        weight += w;
        candidates.push({ x, y, z, material, weight: w });
      }
  const bodies = [
    ...nearbySections(sim, {
      min: { x: point.x - radius, y: point.y - radius, z: point.z - radius },
      max: { x: point.x + radius, y: point.y + radius, z: point.z + radius },
    }),
  ];
  const dynamic: { body: (typeof bodies)[number]; index: number; weight: number }[] = [];
  for (const body of bodies)
    for (let index = body.voxels.length - 1; index >= 0; index--) {
      const p = voxelPoint(body, index),
        distance = Math.hypot(p.x - point.x, p.y - point.y, p.z - point.z);
      if (distance >= radius) continue;
      const w = (1 - distance / radius) ** 2;
      weight += w;
      dynamic.push({ body, index, weight: w });
    }
  for (const c of candidates) {
    const key = sim.world.index(c.x, c.y, c.z),
      cost = fractureResistance(c.material),
      before = sim.world.damage.get(key) ?? 0,
      paid = Math.min(
        Math.max(0, cost - before),
        (ledger.fractureBudget * c.weight) / Math.max(weight, 1e-10),
      );
    ledger.fractureSpent += paid;
    sim.world.damageVoxel(c.x, c.y, c.z, paid);
  }
  for (const c of dynamic) {
    const paid = (ledger.fractureBudget * c.weight) / Math.max(weight, 1e-10);
    ledger.fractureSpent += paid;
    damageSection(c.body, c.index, paid);
  }
  const receivers = bodies.filter((b) => b.voxels.length),
    mass = receivers.reduce((sum, b) => sum + b.mass, 0);
  for (const b of receivers) {
    const centre = { x: b.x + b.centre.x, y: b.y + b.centre.y, z: b.z + b.centre.z },
      dir = { x: centre.x - point.x, y: centre.y - point.y, z: centre.z - point.z };
    ledger.motionSpent += energyImpulse(
      b,
      dir,
      (ledger.motionBudget * b.mass) / Math.max(mass, 1e-10),
      centre,
    );
  }
  const list = history.get(sim) ?? [];
  list.push(ledger);
  if (list.length > 24) list.shift();
  history.set(sim, list);
}
export function destructionLedgers(sim: Simulation) {
  return (history.get(sim) ?? []).map((e) => Object.freeze({ ...e }));
}
