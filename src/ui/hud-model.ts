import { weapons } from '../core/config';
import { loadout } from '../core/loadout';
import { clamp, dist2 } from '../core/math';
import type { Objective } from '../core/types';
import { type InteractionStatus, interactionStatus, kitStatus } from '../simulation/player-actions';
import type { Simulation } from '../simulation/simulation';

export interface HudViewModel {
  readonly health: number;
  readonly ammo: string;
  readonly reserve: string;
  readonly reload: number;
  readonly kit: InteractionStatus;
  readonly interaction: InteractionStatus;
  readonly objective: Objective;
  readonly objectiveDistance: number;
  readonly squad: readonly {
    id: number;
    name: string;
    kit: string;
    state: string;
    self: boolean;
  }[];
  readonly supply: string;
}
export function squadNumber(s: Simulation, id: number): string {
  return String((id % Math.max(1, s.battleTeamSize / 10)) + 1).padStart(2, '0');
}
export function captureProgress(value: number, team: number): number {
  return clamp((1 + value * (team === 0 ? 1 : -1)) / 2, 0, 1);
}
export function hudViewModel(s: Simulation): HudViewModel {
  const p = s.player,
    weapon = weapons[s.weaponIndex],
    squad = s.squads[p.squadId];
  const objective = s.world.flags[squad?.route ?? s.handling.objective] ?? s.world.flags[4];
  const own = s.deployables.find((d) => d.ownerId === p.id && d.ownerEpoch === (p.lifeEpoch ?? 0));
  return {
    health: p.vehicle ? Math.max(0, p.vehicle.hp / 6) : Math.max(0, p.hp),
    ammo: p.vehicle
      ? p.vehicle.cool > 0
        ? `${p.vehicle.cool.toFixed(1)}s`
        : 'READY'
      : String(s.ammo[s.weaponIndex]),
    reserve: p.vehicle ? '40 mm cannon' : `${s.reserves[s.weaponIndex]} RESERVE`,
    reload:
      p.vehicle || s.reloadTime <= 0
        ? 0
        : clamp(1 - s.reloadTime / (weapon.reload * s.weaponTuning[s.weaponIndex].reload), 0, 1),
    kit: kitStatus(s),
    interaction: interactionStatus(s),
    objective,
    objectiveDistance: Math.round(Math.sqrt(dist2(p, objective))),
    squad: (squad?.memberIds ?? []).map((id) => {
      const a = s.actors[id];
      return {
        id,
        name: `${id === squad?.leaderId ? '★ ' : ''}${a.player ? 'YOU' : String((id % s.battleTeamSize) + 1).padStart(2, '0')}`,
        kit: (a.kit ?? 'assault').toUpperCase(),
        state: a.alive
          ? a.vehicle
            ? 'APC'
            : `${Math.ceil(a.hp)} HP`
          : (a.reviveUntil ?? 0) > s.simTime
            ? 'DOWN'
            : 'OUT',
        self: a.player,
      };
    }),
    supply: own
      ? `${own.kind === 'medical' ? 'BAG' : 'CRATE'} · ${own.charges} USES · ${Math.ceil(own.life)}s`
      : loadout(s).every((id) => s.reserves[id] === 0)
        ? 'RESERVES EMPTY'
        : '',
  };
}
