import type { Simulation } from '../simulation/simulation';
import { weapons } from './config';
import { clamp } from './math';
import type { Actor, ActorEquipment, Kit } from './types';
export const primary: Readonly<Record<Kit, number>> = {
  assault: 0,
  medic: 0,
  support: 1,
  engineer: 0,
  recon: 3,
};
export const sidearms: readonly number[] = [4, 5, 6];
export const equipmentNames: Readonly<Record<Kit, string>> = {
  assault: 'DRESSING',
  medic: 'BAG / REVIVE',
  support: 'AMMO CRATE',
  engineer: 'AT-1 / REPAIR',
  recon: 'SPOTTER',
};
export function secondaryIndex(value: unknown): number {
  return typeof value === 'number' && sidearms.includes(value) ? value : 4;
}
export function kitWeapons(kit: Kit, secondary: unknown): number[] {
  return [primary[kit], secondaryIndex(secondary), ...(kit === 'engineer' ? [2] : [])];
}
/** Settings are the next deployment; equippedSecondary belongs to the current life. */
export function loadout(sim: Simulation): number[] {
  return kitWeapons(sim.activeKit, sim.equippedSecondary);
}
export function zoomFor(sim: Simulation): number {
  const levels = weapons[sim.weaponIndex]?.zooms ?? [1];
  return levels[clamp(Math.trunc(sim.scopeStep) || 0, 0, levels.length - 1)];
}
export function scoped(sim: Simulation): boolean {
  return !sim.player.vehicle && !!weapons[sim.weaponIndex]?.scoped;
}
export function cameraFov(sim: Simulation): number {
  const base =
    ((sim.settings.fov + (sim.settings.motion ? sim.handling.sprint * 4 : 0)) * Math.PI) / 180;
  const zoom = sim.player.vehicle ? 1 : 1 + (zoomFor(sim) - 1) * clamp(sim.aimAmount, 0, 1);
  return 2 * Math.atan(Math.tan(base / 2) / zoom);
}
export function aimSensitivity(sim: Simulation): number {
  if (sim.player.vehicle) return 1;
  const t = clamp(sim.aimAmount, 0, 1);
  // Scale with focal length, so a 4x to 8x change does not double screen-space motion.
  return (1 + (sim.settings.adsSensitivity - 1) * t) / (1 + (zoomFor(sim) - 1) * t);
}
export function cycleZoom(sim: Simulation, direction = 1): boolean {
  if (
    !sim.acceptsInput ||
    sim.player.vehicle ||
    sim.reloadTime > 0 ||
    !Number.isFinite(direction) ||
    direction === 0
  )
    return false;
  const levels = weapons[sim.weaponIndex].zooms;
  if (levels.length < 2) return false;
  sim.scopeStep = ((sim.scopeStep | 0) + Math.sign(direction) + levels.length) % levels.length;
  sim.soundAt('click', sim.player.x, sim.player.z, 0.3);
  return true;
}
export function initialEquipment(kit: Kit, now = 0): ActorEquipment {
  const secondary = kit === 'recon' ? 5 : kit === 'engineer' || kit === 'support' ? 6 : 4;
  return {
    primaryWeapon: primary[kit],
    secondaryWeapon: secondary,
    activeWeapon: primary[kit],
    secondaryClip: weapons[secondary].mag,
    secondaryReload: 0,
    rockets: kit === 'engineer' ? 3 : 0,
    fragCharges: 2,
    smokes: kit === 'medic' || kit === 'assault' ? 2 : 1,
    nextEquipment: now + 3,
    actionUntil: 0,
    action: '',
    lastSmoke: -100,
    shotSerial: 0,
    weaponReady: 0,
    lastMedicalBagAt: -100,
    lastAmmoBagAt: -100,
  };
}
export function initActorEquipment(a: Actor, now: number): void {
  Object.assign(a, initialEquipment(a.kit ?? 'assault', now));
  a.nextEquipment += (a.id % 7) * 0.5;
  a.clip = weapons[a.primaryWeapon].mag;
  a.reload = 0;
  a.nextRocket = now;
  a.nextFrag = now + 3;
}
