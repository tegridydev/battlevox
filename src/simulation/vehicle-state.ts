import type { Actor, Vehicle } from '../core/types';

/** These are the only writers of the two sides of a driver relationship. */
export function leaveVehicle(actor: Actor) {
  const old = actor.vehicle;
  if (old?.driver === actor) old.driver = null;
  actor.vehicle = null;
}
export function clearDriver(vehicle: Vehicle) {
  const actor = vehicle.driver;
  if (actor?.vehicle === vehicle) actor.vehicle = null;
  vehicle.driver = null;
}
export function enterVehicle(actor: Actor, vehicle: Vehicle): boolean {
  if (!actor.alive || !vehicle.alive || (vehicle.driver && vehicle.driver !== actor)) return false;
  leaveVehicle(actor);
  actor.vehicle = vehicle;
  vehicle.driver = actor;
  return true;
}
