import * as configModule from '../core/config';
import { initActorEquipment, initialEquipment, secondaryIndex } from '../core/loadout';
import * as mathModule from '../core/math';
import { scenario, spawnAnchor } from '../core/scenarios';
import type { Actor, Team, Vec3 } from '../core/types';
import * as gameplayModule from './gameplay';
import * as npc_stateModule from './npc-state';
import { retireNPC } from './npc-state';
import type { Simulation } from './simulation';
import { leaveVehicle } from './vehicle-state';
export function makeActor(this: Simulation, id: number, team: Team, isPlayer = false): Actor {
  return {
    ...initialEquipment(gameplayModule.squadComposition[id % 10], this.simTime),
    squadId: Math.floor(id / 10),
    kit: gameplayModule.squadComposition[id % 10],
    frags: 0,
    deaths: 0,
    supply: 0,

    tactic: 'ADVANCE',
    contact: null,
    nextRocket: 0,
    nextFrag: 0,
    id,
    team,
    player: isPlayer,
    x: 0,
    y: 3,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    ix: 0,
    iz: 0,
    hp: 100,
    alive: false,
    respawn: 0,
    shield: 2,
    height: 1.8,
    crouched: false,
    onGround: true,
    dx: 0,
    dz: 0,
    yaw: team === 0 ? 1.57 : -1.57,
    walk: 0,
    target: null,
    armourTarget: null,
    goal: 2,

    cool: this.world.rnd(0.2, 2),
    clip: configModule.weapons[
      gameplayModule.squadComposition[id % 10] === 'support'
        ? 1
        : gameplayModule.squadComposition[id % 10] === 'recon'
          ? 3
          : 0
    ].mag,
    burst: 4,
    reload: 0,
    stuck: 0,
    lastX: 0,
    lastZ: 0,
    lastHit: -100,
    vehicle: null,
  };
}
export function safeSpawn(this: Simulation, a: Actor, initial = false, position?: Vec3) {
  leaveVehicle(a);
  retireNPC(this, a);
  if (this.tickets[a.team] <= 0) {
    a.alive = false;
    return false;
  }
  const setup = scenario(this.testArena),
    close = setup.id === 'frontline';
  const home = spawnAnchor(setup.id, a.team, 1);
  const anchor = spawnAnchor(setup.id, a.team, a.player ? this.spawnChoice : a.id % 3);
  let chosen: Vec3 | null =
    position ?? (!initial && !a.player ? this.leaderSpawn(a).position : null);
  for (let i = 0; i < 150 && !chosen; i++) {
    const o = i < 110 ? anchor : home,
      x = mathModule.clamp(
        o.x +
          this.world.rnd(
            -Math.max(setup.spawnSpread, close ? this.battleTeamSize * 0.07 : 0),
            Math.max(setup.spawnSpread, close ? this.battleTeamSize * 0.07 : 0),
          ),
        4,
        configModule.W - 4,
      ),
      z = mathModule.clamp(
        o.z + this.world.rnd(-setup.depthSpread, setup.depthSpread),
        4,
        configModule.D - 4,
      ),
      y = this.world.groundAt(x, z);
    if (
      this.occupied(a, x, y, z, 0.34, 1.8) ||
      this.actors.some(
        (b) =>
          b !== a && b.alive && mathModule.dist2(b, { x, z }) < (b.team === a.team ? 0.48 : 100),
      )
    )
      continue;
    chosen = { x, y, z };
    break;
  }
  if (!chosen) {
    a.alive = false;
    a.respawn = 1;
    return false;
  }
  a.poseEpoch = (a.poseEpoch ?? 0) + 1;
  a.lifeEpoch = (a.lifeEpoch ?? 0) + 1;
  Object.assign(a, chosen);
  Object.assign(a, {
    alive: true,
    hp: 100,
    vx: 0,
    vy: 0,
    vz: 0,
    ix: 0,
    iz: 0,
    shield: 3,
    vehicle: null,
    target: null,
    armourTarget: null,
    clip: configModule.weapons[a.kit === 'support' ? 1 : a.kit === 'recon' ? 3 : 0].mag,
    reload: 0,
    lastHit: this.simTime,
    dx: 0,
    dz: 0,
    height: 1.8,
    crouched: false,
    onGround: true,
    stuck: 0,

    supply: 0,
    contact: null,

    tactic: 'ADVANCE',
  });
  initActorEquipment(a, this.simTime);
  npc_stateModule.resetNPC(a);
  this.damageContributions.delete(a.id);
  a.reviveUntil = 0;
  if (a.player) {
    this.resetHandling();
    this.classClock = 0;
    this.aimAmount = 0;
    this.fireTime = this.grenadeTime = 0;
    this.ammo = configModule.weapons.map((w) => w.mag);
    this.reserves = configModule.weapons.map((w) => w.reserve);
    this.grenades = 3;
    this.smokeGrenades = 2;
    this.equippedSecondary = secondaryIndex(this.settings.secondary);
    this.scopeStep = 0;
    this.reloadTime = 0;
    this.activeKit = this.settings.loadout;
    a.kit = this.activeKit;
    initActorEquipment(a, this.simTime);
    a.secondaryWeapon = this.equippedSecondary;
    a.secondaryClip = configModule.weapons[a.secondaryWeapon].mag;
    this.handling.objective = this.squads[a.squadId]?.route ?? 4;
    this.weaponIndex = this.activeKit === 'support' ? 1 : this.activeKit === 'recon' ? 3 : 0;
    this.yaw = Math.atan2(256 - a.x, 256 - a.z);
    this.pitch = 0;
    this.camera.x = a.x;
    this.camera.y = a.y + 1.57;
    this.camera.z = a.z;
  }
  return true;
}
export function startBattle(this: Simulation) {
  this.cancelWork();
  this.roundEpoch++;
  for (const key of Object.keys(this.destructionStats) as (keyof typeof this.destructionStats)[])
    this.destructionStats[key] = 0;
  this.nextVoxelId = 1;
  this.effectSeed = (this.settings.seed ^ 0x51f15e) >>> 0;
  this.roundPractice = this.practiceInvulnerable || this.practiceSupplies;
  this.rubble.length = this.dust.length = 0;
  for (const key of Object.keys(this.testStats) as (keyof typeof this.testStats)[])
    this.testStats[key] = 0;
  this.scopeStep = 0;
  this.reactiveCursor = 0;
  this.roundStats = {};
  this.damageContributions.clear();
  this.pings = [];
  this.spotCooldowns.clear();
  this.nextStrategy =
    this.strategyCursor =
    this.classClock =
    this.nextPing =
    this.killStreak =
    this.bestStreak =
      0;
  this.xpFeed = [];
  this.nextRubbleId = 0;
  this.collapseTask = null;
  this.contactCursor = 0;
  this.controlTime = [0, 0];
  this.phaseNotice = false;
  this.simTime = 0;
  this.tickets = [6000, 6000];
  this.kills = this.deaths = this.flagCaptures = this.score = 0;
  this.ended = false;
  this.stepNumber = this.aiCursor = 0;
  this.awardTime = 0;
  this.awardText = '';
  this.input.map = false;
  this.abilityClock = 0;
  this.roundLimit = this.settings.minutes * 60;
  this.spawnChoice = -1;
  this.actors.length =
    this.vehicles.length =
    this.projectiles.length =
    this.particles.length =
    this.tracers.length =
    this.flashes.length =
    this.feed.length =
      0;
  this.world.flags.forEach((f) => {
    f.value = 0;
    f.owner = -1;
    f.contested = false;
    f.presence = [0, 0];
  });
  for (let team = 0; team < 2; team++)
    for (let k = 0; k < scenario(this.testArena).vehicleGates.length; k++) {
      const setup = scenario(this.testArena),
        x = setup.vehicleHomes[team as Team],
        z = setup.vehicleGates[k];
      this.vehicles.push({
        x,
        z,
        y: this.world.groundAt(x, z),
        vx: 0,
        vy: 0,
        vz: 0,
        ix: 0,
        iz: 0,
        yaw: team === 0 ? 1.57 : -1.57,
        turret: team === 0 ? 1.57 : -1.57,
        pitch: 0,
        team: team as Team,
        isVehicle: true,
        height: 1.95,
        radius: 1.85,
        hp: 600,
        alive: true,
        respawn: 0,
        cool: 3,
        driver: null,
        goal: 4,
        homeX: x,
        homeZ: z,
        stuck: 0,
        reverse: 0,
        target: null,
        onGround: true,
      });
    }
  const perTeam = Math.max(10, Math.min(500, Math.floor(this.battleTeamSize / 10) * 10));
  this.battleTeamSize = perTeam;
  for (let i = 0; i < perTeam * 2; i++) {
    const a = this.makeActor(i, i < perTeam ? 0 : 1, i === 0);
    a.goal = 4;
    a.frags = 0;
    a.deaths = 0;
    this.actors.push(a);
    if (a.player) this.player = a;
  }
  this.createSquads();
  for (const a of this.actors) {
    a.goal = this.squads[a.squadId]?.route ?? 4;
  }
  this.handling.objective = this.squads[this.player.squadId]?.route ?? 4;
  for (const a of this.actors) this.safeSpawn(a, true);
  this.started = true;
  this.fireTime =
    this.grenadeTime =
    this.reloadTime =
    this.captureClock =
    this.shake =
    this.hitTime =
    this.hurtTime =
      0;
  this.aimAmount = 0;
  this.notify(
    this.testArena === 'frontline'
      ? 'AEGIS COMMAND · Secure the civic centre. Hold uncontested control for 180 seconds.'
      : 'AEGIS COMMAND · Advance from West Base. Secure sectors and hold the map advantage for 180 seconds.',
  );
}
export function spatial(this: Simulation) {
  for (const b of this.buckets) b.length = 0;
  for (const a of this.actors)
    if (a.alive && !a.vehicle) {
      const i =
        mathModule.clamp(Math.floor(a.z / 8), 0, configModule.SD - 1) * configModule.SW +
        mathModule.clamp(Math.floor(a.x / 8), 0, configModule.SW - 1);
      this.buckets[i].push(a);
    }
}
export function neighbours(
  this: Simulation,
  x: number,
  z: number,
  r: number,
  visit: (a: Actor) => void,
) {
  const x0 = mathModule.clamp(Math.floor((x - r) / 8), 0, configModule.SW - 1),
    x1 = mathModule.clamp(Math.floor((x + r) / 8), 0, configModule.SW - 1),
    z0 = mathModule.clamp(Math.floor((z - r) / 8), 0, configModule.SD - 1),
    z1 = mathModule.clamp(Math.floor((z + r) / 8), 0, configModule.SD - 1);
  for (let zz = z0; zz <= z1; zz++)
    for (let xx = x0; xx <= x1; xx++)
      for (const a of this.buckets[zz * configModule.SW + xx]) visit(a);
}
export { chooseTarget, think, updateAI } from './npc';
export { updatePlayer } from './player';
export { respawnVehicle, updateVehicles } from './vehicles';
export function assignGoal(this: Simulation, a: Actor, goal: number) {
  if (a.goal === goal) return;
  a.goal = goal;
}
