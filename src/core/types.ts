export type Team = 0 | 1;
export type Kit = 'assault' | 'medic' | 'support' | 'engineer' | 'recon';
export interface Vec2 {
  x: number;
  z: number;
}
export interface Vec3 extends Vec2 {
  y: number;
}
export type Colour = readonly [number, number, number];
export interface Camera extends Vec3 {
  yaw: number;
  pitch: number;
}
export interface Body extends Vec3 {
  vx: number;
  vy: number;
  vz: number;
  ix: number;
  iz: number;
  height: number;
  onGround: boolean;
  alive: boolean;
  team: Team;
  isVehicle?: boolean;
  radius?: number;
  vehicle?: Vehicle | null;
}
export interface ActorEquipment {
  primaryWeapon: number;
  secondaryWeapon: number;
  activeWeapon: number;
  secondaryClip: number;
  secondaryReload: number;
  rockets: number;
  fragCharges: number;
  smokes: number;
  nextEquipment: number;
  actionUntil: number;
  action: string;
  lastSmoke: number;
  shotSerial: number;
  weaponReady: number;
  lastMedicalBagAt: number;
  lastAmmoBagAt: number;
}
export interface Actor extends Body, ActorEquipment {
  liftReady?: number;
  poseEpoch?: number;
  lifeEpoch?: number;
  kit?: Kit;
  supportReady?: number;
  reviveUntil?: number;
  lastResupply?: number;
  id: number;
  squadId: number;
  player: boolean;
  hp: number;
  respawn: number;
  shield: number;
  crouched: boolean;
  dx: number;
  dz: number;
  yaw: number;
  walk: number;
  target: Actor | null;
  armourTarget: Vehicle | null;
  goal: number;

  cool: number;
  clip: number;
  burst: number;
  reload: number;
  stuck: number;
  lastX: number;
  lastZ: number;
  lastHit: number;
  frags: number;
  deaths: number;
  supply: number;

  tactic: string;
  contact: (Vec3 & { until: number }) | null;
  nextRocket: number;
  nextFrag: number;
  vehicle: Vehicle | null;
}
export interface Vehicle extends Body {
  isVehicle: true;
  radius: number;
  hp: number;
  respawn: number;
  cool: number;
  driver: Actor | null;
  goal: number;
  homeX: number;
  homeZ: number;
  stuck: number;
  reverse: number;
  yaw: number;
  turret: number;
  pitch: number;
  target: Actor | null;
}
export type DamageSource = Actor | Vehicle | null;
export interface Building {
  structure?: import('../world/structural-bays').StructuralModel;
  supportBaseline?: Uint16Array | Float32Array;
  fractureHeight?: number;
  collapseDirection?: Vec3;
  lastCollapseSound?: number;
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  base: number;
  floors: number;
  dirty: boolean;
  rev: number;
  lift: Vec2;
}
export interface Chunk {
  version: number;
  x: number;
  z: number;
  top: number;
  dirty: boolean;
  mesh: Float32Array;
  count: number;
}
export interface Objective extends Vec2 {
  name: string;
  title: string;
  value: number;
  owner: Team | -1;
  contested: boolean;
  presence: number[];
}
export interface Particle extends Vec3 {
  vx: number;
  vy: number;
  vz: number;
  c: Colour;
  size: number;
  life: number;
  max: number;
  yaw: number;
  pitch: number;
  spin: number;
  settled?: boolean;
}
export interface Projectile extends Vec3 {
  vx: number;
  vy: number;
  vz: number;
  type: 'rocket' | 'grenade' | 'shell' | 'smoke';
  life: number;
  source: DamageSource;
  itemId?: string;
}
export interface SmokeCloud extends Vec3 {
  life: number;
  age: number;
  radius: number;
  team: Team | -1;
}
export interface Deployable extends Vec3 {
  kind: 'medical' | 'ammo';
  ownerId: number;
  ownerEpoch: number;
  playerOwned: boolean;
  team: Team;
  life: number;
  age: number;
  charges: number;
  next: number;
  used: Map<number, { until: number; epoch: number }>;
}
export interface Tracer {
  maxLife?: number;
  a: Vec3;
  b: Vec3;
  life: number;
  team: Team;
}
export interface Flash extends Vec3 {
  r: number;
  life: number;
}
export interface FeedItem {
  text: string;
  team: Team;
  life: number;
}
export interface Input {
  keys: Set<string>;
  fire: boolean;
  firePressed?: boolean;
  aim: boolean;
  jump: boolean;
  crouch: boolean;
  mx: number;
  mz: number;
  map: boolean;
}
export interface Handling {
  recoil: number;
  recoilV: number;
  bloom: number;
  sprint: number;
  ready: number;
  jumpBuffer: number;
  coyote: number;
  trigger: boolean;
  step: number;
  land: number;
  head: boolean;
  damage: number;
  damageTime: number;
  objective: number;
}
export interface Settings {
  hudScale: 1 | 1.15 | 1.3;
  secondary: number;
  scenario: import('./scenarios').ScenarioId;
  teamSize: number;
  lighting: 'daylight' | 'afternoon' | 'overcast';
  textures: boolean;
  shadows: boolean;
  seed: number;
  quality: number;
  distance: number;
  fov: number;
  brightness: number;
  sensitivity: number;
  volume: number;
  adsSensitivity: number;
  motion: boolean;
  adaptive: boolean;
  minutes: number;
  mode: 'conquest';
  loadout: Kit;
  touch: boolean;
  aimMode: 'toggle' | 'hold';
}
export type CareerStat =
  | 'kills'
  | 'assists'
  | 'headshots'
  | 'captures'
  | 'heals'
  | 'repairs'
  | 'resupplies'
  | 'revives'
  | 'vehicleKills'
  | 'orders'
  | 'spots'
  | 'deaths';
export interface Mastery {
  xp: number;
  equipped: string;
}
export interface MatchReport {
  id: string;
  endedAt: number;
  seed: number;
  seconds: number;
  result: 'victory' | 'defeat' | 'draw';
  score: number;
  xp: number;
  stats: Partial<Record<CareerStat, number>>;
  medals: string[];
}
export interface Career {
  version: 3;
  xp: number;
  name: string;
  stats: Partial<Record<CareerStat, number>>;
  items: Record<string, Mastery>;
  claimed: string[];
  medals: Record<string, number>;
  history: MatchReport[];
}
export interface Profile {
  career?: Career;
  games: number;
  wins: number;
  kills: number;
  best: number;
}
export type Order =
  | { kind: 'follow' }
  | { kind: 'objective'; objective?: number }
  | { kind: 'hold'; position: Vec3 };
export interface Squad {
  id: number;
  team: Team;
  leaderId: number;
  memberIds: number[];
  order: Order;
  blocked: boolean;
  route: number;
  routing?: boolean;
}
export type Screen =
  | 'home'
  | 'loadouts'
  | 'barracks'
  | 'challenges'
  | 'play'
  | 'pause'
  | 'options'
  | 'controls'
  | 'credits'
  | 'results'
  | 'confirm'
  | 'deployment'
  | 'map'
  | 'orders'
  | 'lab';
export type GameEvent =
  | { type: 'sound'; sound: string; x: number; z: number; gain: number }
  | { type: 'hit'; killed: boolean; headshot?: boolean }
  | { type: 'xp'; label: string; points: number; itemId?: string; stat?: CareerStat; count: number }
  | { type: 'death' }
  | { type: 'revived' }
  | { type: 'finished'; winner: boolean | null; reason?: 'reserves' | 'control' | 'time' };

/** Local voxel coordinates inside a falling masonry section. */
export interface RubbleVoxel extends Vec3 {
  damage?: number;
  id?: number;
  grain?: number;
  material: number;
  fractureFaces?: number;
}
export interface RubbleBody extends Vec3 {
  /** Immutable material coordinates inherited by fracture children. */
  materialOrigin: Vec3;
  lastProgressTime?: number;
  id: number;
  voxels: RubbleVoxel[];
  primary: boolean;
  bondWork: Map<string, number>;
  orientation: import('../simulation/rotation').Quaternion;
  omega: Vec3;
  inertiaCross: [number, number, number];
  centre: Vec3;
  /** Connectivity repair pending after a direct voxel edit. */
  connectivityDirty: boolean;
  fractureSlots?: number;
  sleeping: boolean;
  sleepRevision: number;
  pendingDt: number;
  travel: number;
  support?: import('../simulation/rubble-support').SupportState;
  inertia: Vec3;
  impact?: { point: Vec3; localPoint?: Vec3; speed: number; energy?: number };
  geometryVersion: number;
  damage?: Map<RubbleVoxel, number>;
  vx: number;
  vy: number;
  vz: number;
  width: number;
  height: number;
  depth: number;
  mass: number;
  age: number;
  yaw: number;
  pitch: number;
  roll: number;
  spinRoll: number;
  shapeRoll: number;
  spinYaw: number;
  spinPitch: number;
  restTime: number;
  impactCooldown: number;
  shapeYaw: number;
  shapePitch: number;
  shape: RubbleVoxel[];
  extent: Vec3;
  boundsMin: Vec3;
  boundsMax: Vec3;
  hitActors: Set<number>;
  hitVehicles: Set<Vehicle>;
}
export interface DustCloud extends Vec3 {
  radius: number;
  life: number;
  max: number;
  strength: number;
}
