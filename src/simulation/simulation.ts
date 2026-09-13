import { CONTROL_GOAL, defaults, SD, SW, weapons } from '../core/config';
import { PoseHistory } from '../core/interpolation';
import { cycleZoom, loadout } from '../core/loadout';
import { scenario, teamSize } from '../core/scenarios';
import type {
  Actor,
  Camera,
  CareerStat,
  Deployable,
  DustCloud,
  FeedItem,
  Flash,
  GameEvent,
  Handling,
  Input,
  Kit,
  Particle,
  Projectile,
  RubbleBody,
  Screen,
  Settings,
  SmokeCloud,
  Squad,
  Tracer,
  Vec3,
  Vehicle,
} from '../core/types';
import type { PathSearch } from '../world/pathfinding';
import { World } from '../world/world';
import * as actors from './actors';
import * as combat from './combat';
import * as destruction from './destruction';
import { throwSmoke } from './equipment';
import * as gameplay from './gameplay';
import * as match from './match';
import { resetNavigation } from './navigation';
import { resetNpcState } from './npc-state';
import * as physics from './physics';
import * as rubblePhysics from './rubble';
import { cancelRubbleMotion } from './rubble';
import { cancelRubbleContacts } from './rubble-contacts';
import { clearSupportQueries } from './rubble-support';
import { cancelFractures } from './section-fracture';
import { resetSectionIndex } from './section-index';
import * as squads from './squads';
import { cancelStaticImpacts } from './static-impact';
import { clearTerrainColliders } from './terrain-collider';
import { clearDriver } from './vehicle-state';
export class Simulation {
  presentation = new PoseHistory();
  renderAlpha = 1;
  roundEpoch = 0;
  navigationBudget = 768;
  ballisticBudget = 2;
  coverBudget = 8;
  navigationStats = { expanded: 0, completed: 0, blocked: 0, liftTrips: 0 };
  battleTeamSize = 500;
  testArena: 'frontline' | 'city' = 'city';
  practiceInvulnerable = false;
  practiceSupplies = false;
  roundPractice = false;
  reactiveCursor = 0;
  testStats = {
    revives: 0,
    heals: 0,
    repairs: 0,
    resupplies: 0,
    shotsBlocked: 0,
    rockets: 0,
    grenades: 0,
    sidearmShots: 0,
    smokes: 0,
    medicalBags: 0,
    ammoCrates: 0,
    dressings: 0,
  };
  effectSeed = 0x51f15e;
  effectRnd(min: number, max: number) {
    let x = this.effectSeed;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.effectSeed = x >>> 0;
    return min + (max - min) * (this.effectSeed / 4294967296);
  }

  collapsePreparing = false;
  destructionBudget: import('./destruction-budget').DestructionBudget | null = null;
  destructionStats = {
    staleTime: 0,
    sleepingBodies: 0,
    advancedSteps: 0,
    deferredQueries: 0,
    pendingBodies: 0,
    oldestDebt: 0,
    clampedTime: 0,
    supportMs: 0,
    physicsMs: 0,
    maxSupportMs: 0,
    maxPhysicsMs: 0,
    deferredFrames: 0,
  };
  world: World;
  settings: Settings;
  events: GameEvent[] = [];
  actors: Actor[] = [];
  vehicles: Vehicle[] = [];
  projectiles: Projectile[] = [];
  particles: Particle[] = [];
  rubble: RubbleBody[] = [];
  dust: DustCloud[] = [];
  nextVoxelId = 1;
  nextRubbleId = 0;
  contactCursor = 0;
  tracers: Tracer[] = [];
  flashes: Flash[] = [];
  feed: FeedItem[] = [];
  squads: Squad[] = [];
  player: Actor;
  playing = false;
  started = false;
  ended = false;
  loading = false;
  menuState: Screen = 'home';
  simTime = 0;
  tickets = [6000, 6000];
  kills = 0;
  deaths = 0;
  flagCaptures = 0;
  score = 0;
  roundStats: Partial<Record<CareerStat, number>> = {};
  damageContributions = new Map<number, { damage: number; until: number; itemId: string }>();
  pings: gameplay.Ping[] = [];
  spotCooldowns = new Map<number, number>();
  nextPing = 0;
  nextStrategy = 0;
  strategyCursor = 0;
  classClock = 0;
  killStreak = 0;
  bestStreak = 0;
  xpFeed: { label: string; points: number; life: number }[] = [];
  weaponTuning = weapons.map(() => ({ spread: 1, kick: 1, reload: 1 }));
  itemTuning: Record<string, number> = {};
  classAbility = gameplay.classAbility;
  ping = gameplay.ping;
  pingAt = gameplay.pingAt;
  aiCursor = 0;
  captureClock = 0;
  shake = 0;
  hitTime = 0;
  hitKill = false;
  hurtTime = 0;
  aimAmount = 0;
  stepNumber = 0;
  damageAngle = 0;
  awardTime = 0;
  awardText = '';
  weaponIndex = 0;
  ammo: number[] = weapons.map((w) => w.mag);
  reserves: number[] = weapons.map((w) => w.reserve);
  reloadTime = 0;
  fireTime = 0;
  grenades = 3;
  smokeGrenades = 2;
  smokeClouds: SmokeCloud[] = [];
  deployables: Deployable[] = [];
  scopeStep = 0;
  equippedSecondary = 4;
  grenadeTime = 0;
  input: Input = {
    keys: new Set(),
    fire: false,
    aim: false,
    jump: false,
    crouch: false,
    mx: 0,
    mz: 0,
    map: false,
  };
  yaw = Math.PI / 2;
  pitch = 0;
  camera: Camera = { x: 160, y: 130, z: 60, yaw: 0.85, pitch: -0.35 };
  handling: Handling = {
    recoil: 0,
    recoilV: 0,
    bloom: 0,
    sprint: 0,
    ready: 0,
    jumpBuffer: 0,
    coyote: 0,
    trigger: false,
    step: 0,
    land: 0,
    head: false,
    damage: 0,
    damageTime: 0,
    objective: 4,
  };
  controlTime = [0, 0];
  controlGoal = CONTROL_GOAL;
  phaseNotice = false;
  abilityClock = 0;
  collapseTask: Generator<void, void, unknown> | null = null;
  roundLimit = 1500;
  spawnChoice = -1;
  buckets: Actor[][] = Array.from({ length: SW * SD }, () => []);
  activeKit: Kit = 'assault';
  spawnTarget: 'base' | 'leader' = 'base';
  selectedSquad = 0;
  selectedRole: 'leader' | 'member' = 'leader';
  initialDeployment = true;
  spawnError = '';
  localRoutes = new Map<
    number,
    {
      target: Vec3;
      point: Vec3;
      expires: number;
      revision: number;
      reachable: boolean;
      status?: 'pending' | 'reachable' | 'unreachable';
      search?: PathSearch;
    }
  >();
  constructor(settings: Settings = { ...defaults }, world = new World()) {
    this.settings = { ...settings };
    this.testArena = scenario(settings.scenario).id;
    this.battleTeamSize = teamSize(settings.teamSize);
    this.world = world;
    this.world.seed = settings.seed;
    this.player = this.makeActor(0, 0, true);
  }
  rayActors(o: Vec3, d: Vec3, length: number) {
    const found = new Set<Actor>();
    let last = -1;
    for (let t = 0; t <= length + 6; t += 6) {
      const x = Math.max(0, Math.min(SW - 1, Math.floor((o.x + d.x * Math.min(t, length)) / 8))),
        z = Math.max(0, Math.min(SD - 1, Math.floor((o.z + d.z * Math.min(t, length)) / 8))),
        key = z * SW + x;
      if (key === last) continue;
      last = key;
      this.neighbours(x * 8 + 4, z * 8 + 4, 12, (a) => found.add(a));
    }
    return found;
  }
  get touch() {
    return this.settings.touch;
  }
  soundAt(sound: string, x: number, z: number, gain: number) {
    if (this.events.length < 256) this.events.push({ type: 'sound', sound, x, z, gain });
  }
  finishBattle(winner: boolean | null, reason: 'reserves' | 'control' | 'time' = 'time') {
    if (this.ended) return;
    this.ended = true;
    this.playing = false;
    this.clearInput();
    this.events.push({ type: 'finished', winner, reason });
  }
  clearInput() {
    this.input.firePressed = false;
    this.input.keys.clear();
    this.input.fire = this.input.aim = this.input.jump = this.input.crouch = false;
    this.input.mx = this.input.mz = 0;
    this.handling.trigger = false;
    this.handling.jumpBuffer = 0;
    this.aimAmount = 0;
  }
  get acceptsInput() {
    return this.playing && this.menuState === 'play' && this.player.alive;
  }
  toggleAim(pressed: boolean) {
    if (!this.acceptsInput) return;
    if (this.settings.aimMode === 'hold') this.input.aim = pressed;
    else if (pressed) this.input.aim = !this.input.aim;
  }
  selectWeaponSlot(slot: number) {
    if (
      !this.acceptsInput ||
      this.player.vehicle ||
      !Number.isInteger(slot) ||
      slot < 0 ||
      slot > 2
    )
      return;
    if (slot === 2 && this.activeKit !== 'engineer') {
      this.classAbility();
      return;
    }
    const id = loadout(this)[slot];
    if (id !== undefined) this.switchWeapon(id);
  }
  cycleWeapon(direction = 1) {
    const kit = loadout(this);
    this.switchWeapon(
      kit[(kit.indexOf(this.weaponIndex) + (direction < 0 ? -1 : 1) + kit.length) % kit.length],
    );
  }
  setScreen(screen: Screen) {
    this.clearInput();
    this.menuState = screen;
    this.input.map = screen === 'map';
    if (!['play', 'map', 'orders', 'deployment'].includes(screen)) this.playing = false;
    else if (
      ['play', 'map', 'orders', 'deployment'].includes(screen) &&
      this.started &&
      !this.ended
    )
      this.playing = !this.initialDeployment;
  }
  /** Cancel suspended work before replacing world, actor or rigid-body ownership. */
  cancelWork() {
    this.events.length = 0;
    this.smokeClouds.length = 0;
    for (const d of this.deployables) d.used.clear();
    this.deployables.length = 0;
    this.presentation.reset();
    resetNpcState(this);
    resetNavigation(this);
    resetSectionIndex(this);
    this.navigationStats = { expanded: 0, completed: 0, blocked: 0, liftTrips: 0 };
    for (const vehicle of this.vehicles) clearDriver(vehicle);
    cancelFractures(this);
    cancelStaticImpacts(this);
    cancelRubbleMotion(this);
    cancelRubbleContacts(this.rubble);
    clearSupportQueries(this.rubble);
    this.collapseTask?.return();
    this.collapseTask = null;
    this.collapsePreparing = false;
    this.localRoutes.clear();
    this.world.cancelMeshes();
    clearTerrainColliders(this.world);
    this.destructionBudget = null;
  }
  dispose() {
    this.playing = false;
    this.clearInput();
    this.cancelWork();
    this.actors.length = this.vehicles.length = this.rubble.length = this.projectiles.length = 0;
    this.particles.length =
      this.tracers.length =
      this.flashes.length =
      this.dust.length =
      this.squads.length =
        0;
    this.buckets.forEach((b) => {
      b.length = 0;
    });
  }
  reset() {
    for (const _ of this.resetSteps()) {
    }
  }
  *resetSteps(): Generator<void, void, unknown> {
    this.cancelWork();
    this.clearInput();
    yield* this.world.prepareSteps(this.settings.seed);
    this.startBattle();
    this.spawnTarget = 'base';
    this.spawnChoice = 1;
    this.initialDeployment = true;
    this.playing = false;
    this.player.alive = false;
    this.player.respawn = 0;
    this.setScreen('deployment');
  }
  occupied = physics.occupied;
  pushInfantry = physics.pushInfantry;
  moveBody = physics.moveBody;
  scanStructure = destruction.scanStructure;
  structural = destruction.structural;
  advanceCollapse = destruction.advanceCollapse;
  updateDebris = destruction.updateDebris;
  emitParticle = destruction.emitParticle;
  spawnRubble = rubblePhysics.spawnRubble;
  updateRubble = rubblePhysics.updateRubble;
  addDust = rubblePhysics.addDust;
  impulseRubble = rubblePhysics.impulseRubble;
  hurt = combat.hurt;
  hurtVehicle = combat.hurtVehicle;
  explode = combat.explode;
  rayBox = combat.rayBox;
  bullet = combat.bullet;
  launch = combat.launch;
  reload = combat.reload;
  switchWeapon = combat.switchWeapon;
  throwGrenade = combat.throwGrenade;
  throwSmoke() {
    return throwSmoke(this);
  }
  cycleZoom(direction = 1) {
    return cycleZoom(this, direction);
  }
  useVehicle = combat.useVehicle;
  useLift = combat.useLift;
  heal = combat.heal;
  fortify = combat.fortify;
  weaponSpread = combat.weaponSpread;
  mantle = combat.mantle;
  confirmHit = combat.confirmHit;
  makeActor = actors.makeActor;
  safeSpawn = actors.safeSpawn;
  startBattle = actors.startBattle;
  spatial = actors.spatial;
  neighbours = actors.neighbours;
  chooseTarget = actors.chooseTarget;
  think = actors.think;
  updatePlayer = actors.updatePlayer;
  updateAI = actors.updateAI;
  respawnVehicle = actors.respawnVehicle;
  updateVehicles = actors.updateVehicles;
  assignGoal = actors.assignGoal;
  resetHandling = match.resetHandling;
  award = match.award;
  notify = match.notify;
  updateProjectiles = match.updateProjectiles;
  capture = match.capture;
  fixedUpdate = match.fixedUpdate;
  createSquads = squads.createSquads;
  changeMembership = squads.changeMembership;
  leaderSpawn = squads.leaderSpawn;
  deploy = squads.deploy;
  issueOrder = squads.issueOrder;
  squadTarget = squads.squadTarget;
}
