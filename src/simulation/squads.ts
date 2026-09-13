import { kits, SQUAD_SIZE } from '../core/config';
import { dist2, TAU } from '../core/math';
import type { Actor, Order, Vec3 } from '../core/types';
import { connectedSurface, localPath } from '../world/pathfinding';
import { routeActor, walkSegment } from './navigation';
import type { Simulation } from './simulation';
export function createSquads(this: Simulation) {
  this.squads = Array.from({ length: Math.ceil(this.actors.length / SQUAD_SIZE) }, (_, id) => {
    const team = this.actors[id * SQUAD_SIZE].team,
      first = id * SQUAD_SIZE;
    return {
      id,
      team,
      leaderId: first,
      memberIds: Array.from({ length: SQUAD_SIZE }, (_, i) => first + i),
      order: { kind: 'objective' },
      blocked: false,
      route:
        this.testArena === 'frontline'
          ? 4
          : id === 0
            ? 4
            : team === 0
              ? id % 9
              : 8 - ((id - Math.ceil(this.actors.length / 20)) % 9),
    };
  });
  for (const squad of this.squads)
    for (const id of squad.memberIds) this.actors[id].squadId = squad.id;
  this.selectedSquad = this.player.squadId;
  this.selectedRole = 'leader';
}
export function changeMembership(this: Simulation, squadId: number, role: 'leader' | 'member') {
  const target = this.squads[squadId],
    old = this.squads[this.player.squadId];
  if (!target || target.team !== this.player.team || !old) return false;
  if (target !== old) {
    const replacement = target.memberIds.find((id) => id !== target.leaderId)!;
    old.memberIds[old.memberIds.indexOf(this.player.id)] = replacement;
    target.memberIds[target.memberIds.indexOf(replacement)] = this.player.id;
    this.actors[replacement].squadId = old.id;
    if (old.leaderId === this.player.id) old.leaderId = replacement;
    this.player.squadId = target.id;
  }
  if (role === 'leader') target.leaderId = this.player.id;
  else if (target.leaderId === this.player.id)
    target.leaderId = target.memberIds.find((id) => id !== this.player.id)!;
  this.localRoutes.clear();
  this.handling.objective = target.route;
  return true;
}
export function leaderSpawn(this: Simulation, a: Actor): { position: Vec3 | null; reason: string } {
  const squad = this.squads[a.squadId],
    leader = squad && this.actors[squad.leaderId];
  if (!leader || leader === a) return { position: null, reason: 'Squad leaders deploy at base' };
  if (!leader.alive) return { position: null, reason: 'Squad leader is down' };
  if (leader.vehicle || !leader.onGround)
    return { position: null, reason: 'Leader must be on foot and grounded' };
  if (this.simTime - leader.lastHit < 5) return { position: null, reason: 'Leader is in combat' };
  for (let i = 0; i < 48; i++) {
    const angle = (i + a.id) * 2.39996,
      r = 3 + (i % 6),
      x = leader.x + Math.sin(angle) * r,
      z = leader.z + Math.cos(angle) * r,
      y = leader.y;
    const p = { x, y, z };
    if (
      this.occupied(a, x, y, z, 0.34, 1.8) ||
      !connectedSurface(this.world, leader, p) ||
      !walkSegment(this, leader, p)
    )
      continue;
    if (
      this.actors.some(
        (b) =>
          b.alive &&
          b !== a &&
          (b.team !== a.team ? dist2(b, p) < 225 : dist2(b, p) < 0.64 && Math.abs(b.y - y) < 2),
      )
    )
      continue;
    return { position: p, reason: '' };
  }
  return { position: null, reason: 'No safe, connected landing near leader' };
}
export function deploy(this: Simulation) {
  if (
    this.ended ||
    this.player.alive ||
    this.player.respawn > 0 ||
    this.tickets[this.player.team] <= 0
  )
    return false;
  const target = this.squads[this.selectedSquad];
  if (!target || target.team !== this.player.team) return false;
  // Validate against the prospective leader without mutating membership on failure.
  let position: Vec3 | undefined;
  if (this.spawnTarget === 'leader') {
    if (this.selectedRole === 'leader') {
      this.spawnError = 'Squad leaders deploy at base';
      return false;
    }
    const candidate = { ...this.player, squadId: target.id };
    const result = this.leaderSpawn(candidate);
    if (!result.position || target.leaderId === this.player.id) {
      this.spawnError = result.reason || 'Choose a base gate';
      return false;
    }
    position = result.position;
  }
  if (!this.safeSpawn(this.player, true, position)) {
    this.spawnError = 'Spawn blocked. Choose another gate or try again.';
    return false;
  }
  this.changeMembership(this.selectedSquad, this.selectedRole);
  this.activeKit = this.settings.loadout;
  this.weaponIndex = kits[this.activeKit][0];
  this.spawnError = '';
  this.initialDeployment = false;
  this.playing = true;
  this.setScreen('play');
  return true;
}
export function issueOrder(this: Simulation, order: Order) {
  const squad = this.squads[this.player.squadId];
  if (!this.player.alive || !squad || squad.leaderId !== this.player.id) return false;
  if (order.kind === 'objective' && order.objective !== undefined) {
    if (
      !Number.isInteger(order.objective) ||
      order.objective < 0 ||
      order.objective >= this.world.flags.length
    )
      return false;
    squad.route = order.objective;
    this.handling.objective = squad.route;
  }
  squad.order = order.kind === 'hold' ? { kind: 'hold', position: { ...order.position } } : order;
  squad.blocked = false;
  this.localRoutes.clear();
  this.notify(`SQUAD ${squad.id + 1} · ${order.kind.toUpperCase()}`);
  return true;
}
export function squadTarget(this: Simulation, a: Actor): Vec3 | null {
  const squad = this.squads[a.squadId];
  if (!squad) return null;
  const leader = this.actors[squad.leaderId];
  let target: Vec3 | null = null;
  if (squad.order.kind === 'hold') target = squad.order.position;
  else if (squad.order.kind === 'follow' && leader.alive && leader !== a) target = leader;
  else if (squad.order.kind === 'objective') {
    const route = squad.route;
    this.assignGoal(a, route);
    return null;
  }
  if (!target) {
    this.assignGoal(a, squad.route);
    return null;
  }
  const participants =
    squad.order.kind === 'follow'
      ? squad.memberIds.filter((id) => id !== squad.leaderId)
      : squad.memberIds;
  const slot = participants.indexOf(a.id),
    angle = (slot * TAU) / participants.length,
    r = 3 + (slot % 3) * 1.5;
  const desired = {
    x: target.x + Math.sin(angle) * r,
    y: target.y,
    z: target.z + Math.cos(angle) * r,
  };
  if (dist2(a, desired) < 2) return { x: a.x, y: a.y, z: a.z };
  if (
    this.rubble.length ||
    Math.abs(a.y - desired.y) > 1.05 ||
    a.y > this.world.groundAt(a.x, a.z) + 2
  ) {
    const result = routeActor(this, a, desired);
    this.localRoutes.set(a.id, {
      target: desired,
      point: result.point,
      expires: this.simTime + 1,
      revision: this.world.publishedNavRevision,
      status: result.status === 'partial' ? 'reachable' : result.status,
      reachable: result.status === 'reachable' || result.status === 'partial',
    });
    squad.blocked = result.status === 'unreachable';
    squad.routing = result.status === 'pending';
    return result.point;
  }
  const cached = this.localRoutes.get(a.id);
  if (
    cached &&
    cached.status !== 'pending' &&
    cached.expires > this.simTime &&
    cached.revision === this.world.publishedNavRevision &&
    dist2(cached.target, desired) < 9 &&
    dist2(a, cached.point) > 0.6
  )
    return cached.point;
  const path = localPath(this.world, a, desired, 2048, cached?.search);

  this.localRoutes.set(a.id, {
    target: desired,
    point: path.point,
    expires: this.simTime + 1,
    revision: this.world.publishedNavRevision,
    status: path.status,
    search: path.search,
    reachable: path.reachable,
  });
  squad.blocked = squad.memberIds.some((id) => {
    const route = this.localRoutes.get(id);
    return route && route.status === 'unreachable' && route.expires > this.simTime;
  });
  squad.routing = squad.memberIds.some((id) => this.localRoutes.get(id)?.status === 'pending');
  return path.point;
}
