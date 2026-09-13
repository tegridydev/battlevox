import type { Simulation } from './simulation';
export interface DestructionBudget {
  supportMs: number;
  prepareMs: number;
  physicsMs: number;
  fractureEvents: number;
  probes: number;
  pairs: number;
  deadline: number;
}
export const newDestructionBudget = (): DestructionBudget => ({
  supportMs: 3,
  prepareMs: 3,
  physicsMs: 6,
  fractureEvents: 2,
  probes: 8192,
  pairs: 512,
  deadline: Infinity,
});
export function beginDestructionFrame(sim: Simulation) {
  sim.destructionBudget = newDestructionBudget();
}
