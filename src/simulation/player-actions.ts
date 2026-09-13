import { direction, dist2, TAU } from '../core/math';
import type { Actor, Vec3, Vehicle } from '../core/types';
import { deploymentStatus, needsSupplies } from './equipment';
import { canInteract } from './interactions';
import { liftDestination } from './navigation';
import { canSee } from './perception';
import { clearSegment } from './section-query';
import type { Simulation } from './simulation';

export interface InteractionStatus {
  action:
    | 'none'
    | 'enter'
    | 'exit'
    | 'lift'
    | 'heal'
    | 'revive'
    | 'medical'
    | 'ammo'
    | 'resupply'
    | 'repair'
    | 'fortify'
    | 'dress'
    | 'spot';
  label: string;
  available: boolean;
  reason: string;
  cooldown: number;
  target?: Actor;
  vehicle?: Vehicle;
  position?: Vec3;
  cells?: Vec3[];
  building?: number;
  level?: number;
}
const status = (
  action: InteractionStatus['action'],
  label: string,
  reason = '',
  cooldown = 0,
): InteractionStatus => ({ action, label, reason, cooldown, available: !reason && cooldown <= 0 });

/** Read-only queries. Call again at input time: a displayed target is never an authorization to mutate it. */
export function interactionStatus(s: Simulation): InteractionStatus {
  const p = s.player;
  if (!s.acceptsInput) return status('none', '', 'Unavailable');
  if (p.vehicle) {
    const v = p.vehicle;
    for (let i = 0; i < 12; i++) {
      const angle = (i * TAU) / 12,
        x = v.x + Math.sin(angle) * 3.6,
        z = v.z + Math.cos(angle) * 3.6,
        y = s.world.groundAt(x, z);
      if (
        Math.abs(y - v.y) < 1.1 &&
        clearSegment(s, { x: v.x, y: v.y + 1, z: v.z }, { x, y: y + 1, z }) &&
        !s.occupied(p, x, y, z, 0.3, 1.8) &&
        !s.actors.some((a) => a !== p && a.alive && !a.vehicle && dist2(a, { x, z }) < 0.65)
      )
        return { ...status('exit', 'Exit armour'), position: { x, y, z } };
    }
    return status('exit', 'Exit armour', 'Exit blocked · move to clear ground');
  }
  const building = s.world.buildings.findIndex(
    (b) => Math.hypot(p.x - b.lift.x, p.z - b.lift.z) < 3,
  );
  if (building >= 0) {
    const b = s.world.buildings[building],
      current = Math.round((p.y - 5) / 5);
    const down = s.input.keys.has('ShiftLeft') || s.input.keys.has('ShiftRight');
    const level = down ? Math.max(0, current - 1) : (current + 1) % (b.floors + 1);
    const cooldown = Math.max(0, s.abilityClock, (p.liftReady ?? 0) - s.simTime);
    const reason =
      cooldown > 0
        ? 'Lift cycling'
        : level === current
          ? 'Already at this landing'
          : liftDestination(s, p, building, level)
            ? ''
            : 'Landing destroyed, occupied or unavailable';
    return {
      ...status('lift', `Lift ${down ? 'down' : 'up'} · Shift + E for down`, reason, cooldown),
      building,
      level,
    };
  }
  const vehicles = s.vehicles.filter((v) => v.alive && v.team === p.team && dist2(v, p) < 30.25);
  const vehicle = vehicles.find(
    (v) =>
      !v.driver &&
      Math.hypot(v.x - p.x, v.y - p.y, v.z - p.z) < 5.5 &&
      clearSegment(s, { x: p.x, y: p.y + 1, z: p.z }, { x: v.x, y: v.y + 1, z: v.z }),
  );
  if (vehicle) return { ...status('enter', 'Enter armour'), vehicle };
  return vehicles.length
    ? status(
        'enter',
        'Enter armour',
        vehicles.every((v) => v.driver) ? 'Vehicle occupied' : 'Move closer with a clear approach',
      )
    : status('none', '');
}

export function fortificationStatus(s: Simulation): InteractionStatus {
  const p = s.player,
    cooldown = Math.max(0, s.abilityClock);
  if (s.activeKit !== 'engineer' || !p.alive || p.vehicle || !s.playing)
    return status('fortify', 'Build cover', 'Engineer loadout required · use on foot');
  const vehicle = s.vehicles.find(
    (v) => v.alive && v.team === p.team && dist2(v, p) < 36 && v.hp < 600,
  );
  if (vehicle)
    return {
      ...status(
        'repair',
        'Repair armour',
        cooldown
          ? 'Tool recharging'
          : canInteract(s, p, vehicle, 6)
            ? ''
            : 'Repair target obstructed or on another floor',
        cooldown,
      ),
      vehicle,
    };
  const d = direction(s.yaw),
    x = Math.floor(p.x + d.x * 3),
    z = Math.floor(p.z + d.z * 3),
    y = Math.floor(s.world.groundAt(x, z));
  if (cooldown) return status('fortify', 'Build cover', 'Tool recharging', cooldown);
  if (y > 8 || s.actors.some((a) => a.alive && dist2(a, { x, z }) < 4))
    return status('fortify', 'Build cover', 'Choose a clear patch of street');
  const cells: Vec3[] = [];
  for (let k = -1; k <= 1; k++)
    for (let h = 0; h < 2; h++)
      cells.push({
        x: x + (Math.abs(d.z) > 0.7 ? k : 0),
        y: y + h,
        z: z + (Math.abs(d.z) > 0.7 ? 0 : k),
      });
  const blocked = cells.some(
    (c) =>
      !s.world.inside(c.x, c.y, c.z) ||
      s.world.cell(c.x, c.y, c.z) ||
      s.occupied(p, c.x + 0.5, c.y, c.z + 0.5, 0.5, 1) ||
      s.actors.some(
        (a) =>
          a.alive &&
          !a.vehicle &&
          Math.abs(a.x - c.x - 0.5) < 0.8 &&
          Math.abs(a.z - c.z - 0.5) < 0.8 &&
          a.y + a.height > c.y &&
          a.y < c.y + 1,
      ),
  );
  return {
    ...status('fortify', 'Build cover', blocked ? 'Cover placement obstructed' : ''),
    cells,
  };
}

export function kitStatus(s: Simulation): InteractionStatus {
  const p = s.player,
    kit = s.activeKit;
  const cooldown = Math.max(
    0,
    kit === 'engineer' || kit === 'assault' ? s.abilityClock : s.classClock,
  );
  if (!s.acceptsInput || p.vehicle) return status('none', 'Class equipment', 'Available on foot');
  if (kit === 'engineer') return fortificationStatus(s);
  if (cooldown > 0)
    return status(
      kit === 'assault' ? 'dress' : kit === 'recon' ? 'spot' : kit === 'medic' ? 'medical' : 'ammo',
      kit === 'assault'
        ? 'Field dressing'
        : kit === 'recon'
          ? 'Spot contacts'
          : kit === 'medic'
            ? 'Medical support'
            : 'Ammunition support',
      'Recharging',
      cooldown,
    );
  if (kit === 'assault')
    return status('dress', 'Field dressing', p.hp >= 100 ? 'Already at full health' : '');
  if (kit === 'recon') {
    let visible = false;
    s.neighbours(p.x, p.z, 90, (a) => {
      if (
        a.alive &&
        a.team !== p.team &&
        dist2(a, p) < 8100 &&
        canSee(s, { x: p.x, y: p.y + 1, z: p.z }, { x: a.x, y: a.y + 1, z: a.z })
      )
        visible = true;
    });
    return status('spot', 'Spot contacts', visible ? '' : 'No visible hostile contacts');
  }
  const friends: Actor[] = [];
  s.neighbours(p.x, p.z, 6, (a) => {
    if (a !== p && a.team === p.team) friends.push(a);
  });
  friends.sort((a, b) => dist2(a, p) - dist2(b, p));
  if (kit === 'medic') {
    const down = (s.squads[p.squadId]?.memberIds ?? [])
      .map((id) => s.actors[id])
      .find(
        (a) =>
          a &&
          a !== p &&
          !a.alive &&
          !a.vehicle &&
          (a.reviveUntil ?? 0) > s.simTime &&
          canInteract(s, p, a, 4) &&
          !s.occupied(a, a.x, a.y, a.z, 0.3, 1.8),
      );
    if (down) return { ...status('revive', 'Revive squadmate'), target: down };
    const target = friends.find(
      (a) => a.alive && !a.vehicle && a.hp < 95 && canInteract(s, p, a, 4),
    );
    if (target) return { ...status('heal', 'Heal teammate'), target };
  }
  const placement = deploymentStatus(s, p, kit === 'medic' ? 'medical' : 'ammo');
  if (placement.position)
    return status(
      kit === 'medic' ? 'medical' : 'ammo',
      kit === 'medic' ? 'Deploy medical bag' : 'Deploy ammo crate',
    );
  if (kit === 'support') {
    const target = friends.find(
      (a) =>
        a.alive &&
        canInteract(s, p, a, 5) &&
        (a.lastResupply ?? -100) <= s.simTime - 15 &&
        needsSupplies(s, a),
    );
    if (target) return { ...status('resupply', 'Resupply teammate'), target };
  }
  return status(
    kit === 'medic' ? 'medical' : 'ammo',
    kit === 'medic' ? 'Deploy medical bag' : 'Deploy ammo crate',
    placement.reason,
  );
}
