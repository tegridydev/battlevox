import type { Team, Vec2 } from './types';
export type ScenarioId = 'city' | 'frontline';
export interface Scenario {
  id: ScenarioId;
  name: string;
  description: string;
  homes: readonly [number, number];
  gates: readonly [number, number, number];
  vehicleHomes: readonly [number, number];
  vehicleGates: readonly number[];
  spawnSpread: number;
  depthSpread: number;
  defaultSize: number;
}
export const scenarios: Record<ScenarioId, Scenario> = {
  city: {
    id: 'city',
    name: 'Metropolis',
    description:
      'Nine sectors across the complete city. Wide flanks, armour and squad redeployment.',
    homes: [56, 456],
    gates: [216, 256, 296],
    vehicleHomes: [56, 456],
    vehicleGates: [208, 224, 248, 264, 288, 304],
    spawnSpread: 23,
    depthSpread: 24,
    defaultSize: 500,
  },
  frontline: {
    id: 'frontline',
    name: 'Civic Frontline',
    description:
      'Close deployment around the central district. A focused combat and destruction scenario.',
    homes: [196, 316],
    gates: [250, 256, 262],
    vehicleHomes: [176, 336],
    vehicleGates: [250, 262],
    spawnSpread: 14,
    depthSpread: 14,
    defaultSize: 60,
  },
};
export function scenario(id: unknown): Scenario {
  return id === 'frontline' ? scenarios.frontline : scenarios.city;
}
export function spawnAnchor(id: ScenarioId, team: Team, gate: number): Vec2 {
  const s = scenario(id),
    index = Number.isInteger(gate) && gate >= 0 && gate < 3 ? gate : 1;
  return { x: s.homes[team], z: s.gates[index] };
}
export function teamSize(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(10, Math.min(500, Math.round(value / 10) * 10))
    : 500;
}

/** Bases extend thirty units forward from the active scenario's team home. */
export function atTeamBase(id: ScenarioId, team: Team, x: number): boolean {
  const home = scenario(id).homes[team];
  return team === 0 ? x < home + 30 : x > home - 30;
}
