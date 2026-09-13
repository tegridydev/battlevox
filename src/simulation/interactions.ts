import type { Actor, Vec3, Vehicle } from '../core/types';
import { clearSegment } from './section-query';
import type { Simulation } from './simulation';

/** Shared distance, floor and visibility contract for useful player/NPC interactions. */
export function canInteract(
  sim: Simulation,
  actor: Actor,
  target: Vec3,
  range: number,
  vertical = 2.5,
) {
  if (
    !actor.alive ||
    actor.vehicle ||
    ![target.x, target.y, target.z, range].every(Number.isFinite)
  )
    return false;
  return (
    Math.hypot(target.x - actor.x, target.y - actor.y, target.z - actor.z) <= range &&
    Math.abs(target.y - actor.y) <= vertical &&
    clearSegment(
      sim,
      { x: actor.x, y: actor.y + 1, z: actor.z },
      { x: target.x, y: target.y + 1, z: target.z },
    )
  );
}
export function repairVehicle(sim: Simulation, actor: Actor, vehicle: Vehicle, amount = 160) {
  if (
    !vehicle.alive ||
    vehicle.team !== actor.team ||
    vehicle.hp >= 600 ||
    amount <= 0 ||
    !Number.isFinite(amount) ||
    !canInteract(sim, actor, vehicle, 6) ||
    (actor.player ? sim.activeKit : actor.kit) !== 'engineer'
  )
    return false;
  vehicle.hp = Math.min(600, vehicle.hp + amount);
  if (actor.player) sim.award('ARMOUR REPAIRED', 40, 'engineer_tool', 'repairs');
  return true;
}
