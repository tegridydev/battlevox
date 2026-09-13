/*!
MIT License

Copyright (c) 2026 tegridydev

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
/* Battlevox 0.6.1 · linked from strict TypeScript sources */
(function(){'use strict';
const modules={"src/core/config.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.destructionLimits = exports.materials = exports.defaults = exports.kits = exports.weapons = exports.orange = exports.blue = exports.CONTROL_GOAL = exports.SQUAD_SIZE = exports.TEAM_SIZE = exports.STEP = exports.SD = exports.SW = exports.ND = exports.NW = exports.NZ = exports.NX = exports.CS = exports.H = exports.D = exports.W = void 0;
exports.W = 512, exports.D = 512, exports.H = 112, exports.CS = 16, exports.NX = exports.W / exports.CS, exports.NZ = exports.D / exports.CS, exports.NW = exports.W / 2, exports.ND = exports.D / 2, exports.SW = exports.W / 8, exports.SD = exports.D / 8, exports.STEP = 1 / 30;
exports.TEAM_SIZE = 500, exports.SQUAD_SIZE = 10, exports.CONTROL_GOAL = 180;
exports.blue = [0.4, 0.62, 0.86], exports.orange = [0.86, 0.48, 0.36];
exports.weapons = [
    {
        id: 'ar30',
        automatic: true,
        zooms: [1.5],
        range: 115,
        name: 'AR-30 / ASSAULT RIFLE',
        mag: 30,
        reserve: 150,
        delay: 0.105,
        reload: 2.1,
        damage: 30,
        spread: 0.016,
        kick: 0.013,
    },
    {
        id: 'mg60',
        automatic: true,
        zooms: [1.7],
        range: 115,
        name: 'MG-60 / SUPPORT',
        mag: 60,
        reserve: 240,
        delay: 0.085,
        reload: 3.5,
        damage: 23,
        spread: 0.024,
        kick: 0.018,
    },
    {
        id: 'at1',
        automatic: false,
        zooms: [2.5],
        range: 115,
        scoped: true,
        name: 'AT-1 / ROCKET LAUNCHER',
        mag: 1,
        reserve: 6,
        delay: 1,
        reload: 2.8,
        damage: 0,
        spread: 0,
        kick: 0.04,
    },
    {
        id: 'dmr8',
        automatic: false,
        zooms: [4, 8],
        range: 150,
        scoped: true,
        name: 'DMR-8 / MARKSMAN',
        mag: 8,
        reserve: 48,
        delay: 0.75,
        reload: 2.6,
        damage: 55,
        spread: 0.004,
        kick: 0.05,
    },
    {
        id: 'p12',
        name: 'P-12 / SERVICE PISTOL',
        mag: 12,
        reserve: 72,
        delay: 0.19,
        reload: 1.45,
        damage: 27,
        spread: 0.019,
        kick: 0.021,
        automatic: false,
        zooms: [1.25],
        range: 65,
    },
    {
        id: 'r6',
        name: 'R-6 / HEAVY REVOLVER',
        mag: 6,
        reserve: 36,
        delay: 0.43,
        reload: 2.15,
        damage: 54,
        spread: 0.012,
        kick: 0.05,
        automatic: false,
        zooms: [1.5],
        range: 85,
    },
    {
        id: 'mp18',
        name: 'MP-18 / MACHINE PISTOL',
        mag: 18,
        reserve: 108,
        delay: 0.078,
        reload: 1.85,
        damage: 18,
        spread: 0.028,
        kick: 0.012,
        automatic: true,
        zooms: [1.3],
        range: 55,
    },
];
exports.kits = {
    assault: [0, 4],
    medic: [0, 4],
    support: [1, 4],
    engineer: [0, 4, 2],
    recon: [3, 4],
};
exports.defaults = {
    hudScale: 1,
    scenario: 'frontline',
    teamSize: 60,
    lighting: 'daylight',
    textures: true,
    shadows: false,
    seed: 872426,
    quality: 0.85,
    distance: 480,
    fov: 105,
    brightness: 1,
    sensitivity: 1,
    volume: 0.65,
    adsSensitivity: 0.6,
    motion: true,
    adaptive: true,
    minutes: 10,
    mode: 'conquest',
    loadout: 'assault',
    touch: false,
    aimMode: 'hold',
    secondary: 4,
};
exports.materials = [
    [0, 0, 0],
    [0.25, 0.29, 0.3],
    [0.4, 0.33, 0.23],
    [0.34, 0.43, 0.31],
    [0.55, 0.59, 0.58],
    [0.55, 0.38, 0.34],
    [0.46, 0.36, 0.27],
    [0.23, 0.38, 0.27],
    [0.25, 0.265, 0.28],
    [0.53, 0.48, 0.32],
    [0.3, 0.39, 0.43],
    [0.42, 0.62, 0.74],
    [0.34, 0.4, 0.42],
    [0.17, 0.23, 0.25],
    [0.81, 0.74, 0.48],
    [0.54, 0.57, 0.55],
    [0.22, 0.39, 0.44],
];
/** Physics budgets are independent of visual quality and never reduce soldier counts. */
exports.destructionLimits = {
    rubbleBodies: 96,
    rubbleCells: 8192,
    clusterSize: 4,
    gravity: 19,
    terminalSpeed: 36,
    impactSpeed: 4,
    dustClouds: 48,
    contactPairs: 512,
    contactProbes: 8192,
};

},
"src/core/interpolation.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoseHistory = void 0;
const math_1 = require("./math");
/** Presentation history never changes authoritative collision or AI coordinates. */
class PoseHistory {
    previous = new WeakMap();
    views = new WeakMap();
    capture(entities) {
        for (const entity of entities)
            this.previous.set(entity, {
                x: entity.x,
                y: entity.y,
                z: entity.z,
                yaw: entity.yaw,
                turret: entity.turret,
                alive: entity.alive,
                poseEpoch: entity.poseEpoch,
            });
    }
    reset() {
        this.previous = new WeakMap();
        this.views = new WeakMap();
    }
    interpolate(entity, alpha) {
        const old = this.previous.get(entity);
        if (!old ||
            old.alive !== entity.alive ||
            old.poseEpoch !== entity.poseEpoch ||
            Math.hypot(entity.x - old.x, entity.y - old.y, entity.z - old.z) > 4)
            return entity;
        const t = (0, math_1.clamp)(Number.isFinite(alpha) ? alpha : 1, 0, 1);
        let view = this.views.get(entity);
        if (!view) {
            view = { ...entity };
            this.views.set(entity, view);
        }
        else
            Object.assign(view, entity);
        view.x = (0, math_1.lerp)(old.x, entity.x, t);
        view.y = (0, math_1.lerp)(old.y, entity.y, t);
        view.z = (0, math_1.lerp)(old.z, entity.z, t);
        view.yaw = old.yaw + (0, math_1.angleWrap)(entity.yaw - old.yaw) * t;
        if (old.turret !== undefined && entity.turret !== undefined)
            view.turret = old.turret + (0, math_1.angleWrap)(entity.turret - old.turret) * t;
        return view;
    }
}
exports.PoseHistory = PoseHistory;

},
"src/core/loadout.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equipmentNames = exports.sidearms = exports.primary = void 0;
exports.secondaryIndex = secondaryIndex;
exports.kitWeapons = kitWeapons;
exports.loadout = loadout;
exports.zoomFor = zoomFor;
exports.scoped = scoped;
exports.cameraFov = cameraFov;
exports.aimSensitivity = aimSensitivity;
exports.cycleZoom = cycleZoom;
exports.initialEquipment = initialEquipment;
exports.initActorEquipment = initActorEquipment;
const config_1 = require("./config");
const math_1 = require("./math");
exports.primary = {
    assault: 0,
    medic: 0,
    support: 1,
    engineer: 0,
    recon: 3,
};
exports.sidearms = [4, 5, 6];
exports.equipmentNames = {
    assault: 'DRESSING',
    medic: 'BAG / REVIVE',
    support: 'AMMO CRATE',
    engineer: 'AT-1 / REPAIR',
    recon: 'SPOTTER',
};
function secondaryIndex(value) {
    return typeof value === 'number' && exports.sidearms.includes(value) ? value : 4;
}
function kitWeapons(kit, secondary) {
    return [exports.primary[kit], secondaryIndex(secondary), ...(kit === 'engineer' ? [2] : [])];
}
/** Settings are the next deployment; equippedSecondary belongs to the current life. */
function loadout(sim) {
    return kitWeapons(sim.activeKit, sim.equippedSecondary);
}
function zoomFor(sim) {
    const levels = config_1.weapons[sim.weaponIndex]?.zooms ?? [1];
    return levels[(0, math_1.clamp)(Math.trunc(sim.scopeStep) || 0, 0, levels.length - 1)];
}
function scoped(sim) {
    return !sim.player.vehicle && !!config_1.weapons[sim.weaponIndex]?.scoped;
}
function cameraFov(sim) {
    const base = ((sim.settings.fov + (sim.settings.motion ? sim.handling.sprint * 4 : 0)) * Math.PI) / 180;
    const zoom = sim.player.vehicle ? 1 : 1 + (zoomFor(sim) - 1) * (0, math_1.clamp)(sim.aimAmount, 0, 1);
    return 2 * Math.atan(Math.tan(base / 2) / zoom);
}
function aimSensitivity(sim) {
    if (sim.player.vehicle)
        return 1;
    const t = (0, math_1.clamp)(sim.aimAmount, 0, 1);
    // Scale with focal length, so a 4x to 8x change does not double screen-space motion.
    return (1 + (sim.settings.adsSensitivity - 1) * t) / (1 + (zoomFor(sim) - 1) * t);
}
function cycleZoom(sim, direction = 1) {
    if (!sim.acceptsInput ||
        sim.player.vehicle ||
        sim.reloadTime > 0 ||
        !Number.isFinite(direction) ||
        direction === 0)
        return false;
    const levels = config_1.weapons[sim.weaponIndex].zooms;
    if (levels.length < 2)
        return false;
    sim.scopeStep = ((sim.scopeStep | 0) + Math.sign(direction) + levels.length) % levels.length;
    sim.soundAt('click', sim.player.x, sim.player.z, 0.3);
    return true;
}
function initialEquipment(kit, now = 0) {
    const secondary = kit === 'recon' ? 5 : kit === 'engineer' || kit === 'support' ? 6 : 4;
    return {
        primaryWeapon: exports.primary[kit],
        secondaryWeapon: secondary,
        activeWeapon: exports.primary[kit],
        secondaryClip: config_1.weapons[secondary].mag,
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
function initActorEquipment(a, now) {
    Object.assign(a, initialEquipment(a.kit ?? 'assault', now));
    a.nextEquipment += (a.id % 7) * 0.5;
    a.clip = config_1.weapons[a.primaryWeapon].mag;
    a.reload = 0;
    a.nextRocket = now;
    a.nextFrag = now + 3;
}

},
"src/core/loop.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixedClock = void 0;
const config_1 = require("./config");
/** Fixed simulation steps, independent of animation scheduling and wall-clock jitter. */
class FixedClock {
    accumulator = 0;
    get alpha() {
        return this.accumulator / config_1.STEP;
    }
    advance(elapsed, running, step) {
        if (!Number.isFinite(elapsed) || elapsed < 0)
            return;
        if (!running()) {
            this.accumulator = 0;
            return;
        }
        this.accumulator += Math.min(elapsed, 0.1);
        let count = 0;
        while (this.accumulator + 1e-9 >= config_1.STEP && count++ < 3 && running()) {
            step(config_1.STEP);
            this.accumulator = Math.max(0, this.accumulator - config_1.STEP);
        }
        this.accumulator = Math.min(this.accumulator, config_1.STEP);
    }
    reset() {
        this.accumulator = 0;
    }
}
exports.FixedClock = FixedClock;

},
"src/core/material-physics.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hash = exports.fractureResistance = exports.physicsMaterial = exports.materialPhysics = void 0;
exports.grainAt = grainAt;
const make = (toughness, density, compression, tension, shear, friction = 0.75, restitution = 0.08, grain = 2) => ({
    toughness,
    density,
    compression,
    tension,
    shear,
    friction,
    restitution,
    grain,
});
const concrete = make(1, 1, 1, 0.15, 0.3), brick = make(0.7, 0.9, 0.7, 0.1, 0.2), soil = make(1.2, 0.8, 0.6, 0.02, 0.12, 0.9), asphalt = make(1.5, 1.1, 0.8, 0.08, 0.25, 0.85);
exports.materialPhysics = [
    make(0, 0, 0, 0, 0),
    make(Infinity, 1, Infinity, Infinity, Infinity),
    soil,
    soil,
    concrete,
    brick,
    make(0.35, 0.3, 0.35, 0.25, 0.12, 0.65, 0.06, 3),
    make(0.03, 0.05, 0, 0, 0, 0.6, 0.02, 1),
    asphalt,
    brick,
    concrete,
    make(0.08, 1, 0, 0, 0, 0.45, 0.02, 1),
    make(4, 3.2, 4, 4, 2, 0.6, 0.08, 3),
    concrete,
    asphalt,
    concrete,
    make(0.08, 1, 0, 0, 0, 0.45, 0.02, 1),
];
const physicsMaterial = (id) => exports.materialPhysics[id] ?? concrete;
exports.physicsMaterial = physicsMaterial;
const fractureResistance = (id) => 100 * (0, exports.physicsMaterial)(id).toughness;
exports.fractureResistance = fractureResistance;
const hash = (n) => {
    n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
    n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
    return (n ^ (n >>> 16)) >>> 0;
};
exports.hash = hash;
function grainAt(x, y, z, material, seed) {
    const size = (0, exports.physicsMaterial)(material).grain, gx = Math.floor(x / size), gy = Math.floor(y / size), gz = Math.floor(z / size);
    let best = Infinity, id = 0;
    for (let dz = -1; dz <= 1; dz++)
        for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
                const a = gx + dx, b = gy + dy, c = gz + dz, k = (0, exports.hash)(seed ^ Math.imul(a, 73856093) ^ Math.imul(b, 19349663) ^ Math.imul(c, 83492791));
                const d = (x - (a + 0.5 + (k / 4294967295 - 0.5) * 0.4) * size) ** 2 +
                    (y - (b + 0.5 + ((0, exports.hash)(k) / 4294967295 - 0.5) * 0.4) * size) ** 2 +
                    (z - (c + 0.5 + ((0, exports.hash)(k + 1) / 4294967295 - 0.5) * 0.4) * size) ** 2;
                if (d < best) {
                    best = d;
                    id = k;
                }
            }
    return id;
}

},
"src/core/math.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dist2 = exports.angleWrap = exports.lerp = exports.clamp = exports.TAU = void 0;
exports.direction = direction;
exports.multiply = multiply;
exports.matrix = matrix;
exports.TAU = Math.PI * 2;
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
exports.clamp = clamp;
const lerp = (a, b, t) => a + (b - a) * t;
exports.lerp = lerp;
const angleWrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
exports.angleWrap = angleWrap;
const dist2 = (a, b) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2;
exports.dist2 = dist2;
function direction(yaw, pitch = 0) {
    return {
        x: Math.sin(yaw) * Math.cos(pitch),
        y: Math.sin(pitch),
        z: Math.cos(yaw) * Math.cos(pitch),
    };
}
function multiply(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++)
        for (let r = 0; r < 4; r++)
            o[c * 4 + r] =
                a[r] * b[c * 4] +
                    a[4 + r] * b[c * 4 + 1] +
                    a[8 + r] * b[c * 4 + 2] +
                    a[12 + r] * b[c * 4 + 3];
    return o;
}
function matrix(camera, aspect, fov, near = 0.055) {
    const f = direction(camera.yaw, camera.pitch), r = { x: Math.cos(camera.yaw), z: -Math.sin(camera.yaw) }, u = {
        x: -Math.sin(camera.yaw) * Math.sin(camera.pitch),
        y: Math.cos(camera.pitch),
        z: -Math.cos(camera.yaw) * Math.sin(camera.pitch),
    };
    const v = new Float32Array([
        r.x,
        u.x,
        -f.x,
        0,
        0,
        u.y,
        -f.y,
        0,
        r.z,
        u.z,
        -f.z,
        0,
        -r.x * camera.x - r.z * camera.z,
        -u.x * camera.x - u.y * camera.y - u.z * camera.z,
        f.x * camera.x + f.y * camera.y + f.z * camera.z,
        1,
    ]);
    const t = 1 / Math.tan(fov / 2), n = near, far = 620, p = new Float32Array([
        t / aspect,
        0,
        0,
        0,
        0,
        t,
        0,
        0,
        0,
        0,
        (far + n) / (n - far),
        -1,
        0,
        0,
        (2 * far * n) / (n - far),
        0,
    ]);
    return multiply(p, v);
}

},
"src/core/progression.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xpForItemLevel = exports.xpForRank = exports.medalDefinitions = exports.assignments = exports.stats = exports.itemTracks = void 0;
exports.progress = progress;
exports.ensureCareer = ensureCareer;
exports.ensureItem = ensureItem;
exports.upgrades = upgrades;
exports.equip = equip;
exports.tuning = tuning;
exports.validateCareer = validateCareer;
exports.assignmentValue = assignmentValue;
exports.claimAssignments = claimAssignments;
exports.recordXp = recordXp;
exports.finishCareerMatch = finishCareerMatch;
const specialisations = [
    {
        id: 'standard',
        name: 'Standard issue',
        level: 1,
        description: 'Factory configuration. No handling modifiers.',
    },
    {
        id: 'control',
        name: 'Recoil control',
        level: 3,
        description: '15% less recoil. 5% wider dispersion.',
        kick: 0.85,
        spread: 1.05,
    },
    {
        id: 'reload',
        name: 'Quick handling',
        level: 6,
        description: '12% faster reload. 8% more recoil.',
        reload: 0.88,
        kick: 1.08,
    },
    {
        id: 'precision',
        name: 'Precision package',
        level: 10,
        description: '15% tighter dispersion. 10% slower reload.',
        spread: 0.85,
        reload: 1.1,
    },
];
const equipment = (id, name, description) => ({
    id,
    name,
    category: 'equipment',
    maxLevel: 20,
    unlocks: [
        { id: 'standard', name: 'Standard kit', level: 1, description },
        {
            id: 'handling',
            name: 'Field proficiency',
            level: 5,
            description: '10% shorter equipment cooldown.',
            ability: 0.9,
        },
        {
            id: 'specialist',
            name: 'Specialist drills',
            level: 12,
            description: '20% shorter equipment cooldown.',
            ability: 0.8,
        },
    ],
});
exports.itemTracks = [
    ...[
        ['ar30', 'AR-30'],
        ['mg60', 'MG-60'],
        ['at1', 'AT-1'],
        ['dmr8', 'DMR-8'],
        ['p12', 'P-12'],
        ['r6', 'R-6'],
        ['mp18', 'MP-18'],
    ].map(([id, name]) => ({
        id,
        name,
        category: 'weapon',
        maxLevel: 30,
        unlocks: specialisations.map((u) => id === 'at1' && u.id === 'precision'
            ? {
                id: u.id,
                name: 'Rapid loading',
                level: u.level,
                description: '18% faster reload. 15% more recoil.',
                reload: 0.82,
                kick: 1.15,
            }
            : { ...u }),
    })),
    equipment('frag', 'M67 FRAG', 'Standard fragmentation grenade. Level with damage and eliminations.'),
    equipment('field_dressing', 'FIELD DRESSING', 'Self aid. No XP for using a kit at full health.'),
    equipment('medkit', 'MEDIC KIT', 'Heal or revive a nearby squadmate with F.'),
    equipment('ammo_pack', 'AMMO PACK', 'Resupply a nearby friendly with F.'),
    equipment('engineer_tool', 'ENGINEER TOOL', 'Repair friendly armour or place cover with V.'),
    equipment('spotter', 'RECON OPTICS', 'Spot a visible target with Z. F performs a recon scan.'),
    {
        id: 'apc',
        name: 'M12 APC',
        category: 'vehicle',
        maxLevel: 30,
        unlocks: [
            {
                id: 'standard',
                name: 'Standard crew',
                level: 1,
                description: 'Standard cannon reload cycle.',
            },
            {
                id: 'crew',
                name: 'Crew drills',
                level: 8,
                description: '10% shorter player cannon reload cycle.',
                ability: 0.9,
            },
        ],
    },
];
exports.stats = [
    'kills',
    'assists',
    'headshots',
    'captures',
    'heals',
    'repairs',
    'resupplies',
    'revives',
    'vehicleKills',
    'orders',
    'spots',
    'deaths',
];
exports.assignments = [
    {
        id: 'first_blood',
        name: 'First contact',
        stat: 'kills',
        target: 10,
        xp: 400,
        description: 'Eliminate 10 enemies.',
    },
    {
        id: 'sharpshooter',
        name: 'Precision matters',
        stat: 'headshots',
        target: 20,
        xp: 800,
        description: 'Confirm 20 headshot eliminations.',
    },
    {
        id: 'teamwork',
        name: 'Combined effort',
        stat: 'assists',
        target: 25,
        xp: 700,
        description: 'Earn 25 damage assists.',
    },
    {
        id: 'capture',
        name: 'Take the block',
        stat: 'captures',
        target: 10,
        xp: 1000,
        description: 'Participate in 10 sector captures.',
    },
    {
        id: 'medic',
        name: 'Leave nobody behind',
        stat: 'revives',
        target: 10,
        xp: 1000,
        description: 'Revive 10 friendly soldiers.',
    },
    {
        id: 'healer',
        name: 'Field medicine',
        stat: 'heals',
        target: 20,
        xp: 600,
        description: 'Heal wounded teammates 20 times.',
    },
    {
        id: 'support',
        name: 'Keep them firing',
        stat: 'resupplies',
        target: 20,
        xp: 600,
        description: 'Perform 20 useful ammunition resupplies.',
    },
    {
        id: 'engineer',
        name: 'Field service',
        stat: 'repairs',
        target: 20,
        xp: 700,
        description: 'Complete 20 useful armour repairs.',
    },
    {
        id: 'armour',
        name: 'Armour hunter',
        stat: 'vehicleKills',
        target: 10,
        xp: 1000,
        description: 'Destroy 10 hostile vehicles.',
    },
    {
        id: 'orders',
        name: 'Follow through',
        stat: 'orders',
        target: 10,
        xp: 700,
        description: 'Complete 10 squad capture orders.',
    },
    {
        id: 'victory',
        name: 'Operational success',
        stat: 'wins',
        target: 5,
        xp: 1500,
        description: 'Win five operations.',
    },
    {
        id: 'veteran',
        name: 'City veteran',
        stat: 'games',
        target: 20,
        xp: 2000,
        description: 'Complete 20 operations.',
    },
];
exports.medalDefinitions = [
    { id: 'combat', name: 'Combat ribbon', stat: 'kills', threshold: 10 },
    { id: 'objective', name: 'Sector ribbon', stat: 'captures', threshold: 2 },
    { id: 'lifesaver', name: 'Lifesaver ribbon', stat: 'revives', threshold: 3 },
    { id: 'marksman', name: 'Marksman ribbon', stat: 'headshots', threshold: 5 },
    { id: 'logistics', name: 'Logistics ribbon', stat: 'resupplies', threshold: 5 },
    { id: 'armour', name: 'Armour ribbon', stat: 'vehicleKills', threshold: 2 },
];
const xpForRank = (level) => level <= 1 ? 0 : Math.round(900 * (level - 1) ** 1.55);
exports.xpForRank = xpForRank;
const xpForItemLevel = (level) => level <= 1 ? 0 : Math.round(180 * (level - 1) ** 1.42);
exports.xpForItemLevel = xpForItemLevel;
function progress(xp, max = 100, item = false) {
    const curve = item ? exports.xpForItemLevel : exports.xpForRank;
    let level = 1;
    while (level < max && xp >= curve(level + 1))
        level++;
    const current = Math.max(0, xp - curve(level)), needed = level === max ? 0 : curve(level + 1) - curve(level);
    return { level, current, needed, ratio: needed ? Math.min(1, current / needed) : 1 };
}
function ensureCareer(p) {
    return (p.career ??= {
        version: 3,
        name: 'OPERATIVE',
        xp: 0,
        stats: {},
        items: {},
        claimed: [],
        medals: {},
        history: [],
    });
}
function ensureItem(p, id) {
    const c = ensureCareer(p);
    if (!exports.itemTracks.some((t) => t.id === id))
        return { xp: 0, equipped: 'standard' };
    return (c.items[id] ??= { xp: 0, equipped: 'standard' });
}
function upgrades(p, id) {
    const track = exports.itemTracks.find((t) => t.id === id);
    if (!track)
        return [];
    const level = progress(ensureItem(p, id).xp, track.maxLevel, true).level;
    return track.unlocks.filter((u) => u.level <= level);
}
function equip(p, id, choice) {
    if (!upgrades(p, id).some((u) => u.id === choice))
        return false;
    ensureItem(p, id).equipped = choice;
    return true;
}
function tuning(p, id) {
    const u = upgrades(p, id).find((u) => u.id === ensureItem(p, id).equipped);
    return {
        spread: u?.spread ?? 1,
        kick: u?.kick ?? 1,
        reload: u?.reload ?? 1,
        ability: u?.ability ?? 1,
    };
}
const safeInt = (v, max = 1000000000) => typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0;
const object = (v) => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const readStats = (v) => Object.fromEntries(exports.stats.map((k) => [k, safeInt(object(v)[k])]));
function validateCareer(value) {
    const raw = object(value), c = ensureCareer({ games: 0, wins: 0, kills: 0, best: 0 });
    c.xp = safeInt(raw.xp);
    c.name =
        typeof raw.name === 'string'
            ? raw.name.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 24) || 'OPERATIVE'
            : 'OPERATIVE';
    c.stats = readStats(raw.stats);
    // Previous v2 profiles kept several counters at the career root.
    if (raw.version === 2) {
        c.stats.captures = safeInt(raw.captures);
        c.stats.deaths = safeInt(raw.deaths);
        c.stats.vehicleKills = safeInt(raw.vehicleKills);
    }
    for (const track of exports.itemTracks) {
        const item = object(object(raw.items)[track.id]), xp = safeInt(item.xp);
        const equipped = track.unlocks.find((u) => u.id === item.equipped && u.level <= progress(xp, track.maxLevel, true).level)?.id ?? 'standard';
        c.items[track.id] = { xp, equipped };
    }
    c.claimed = exports.assignments
        .filter((a) => Array.isArray(raw.claimed) && raw.claimed.includes(a.id))
        .map((a) => a.id);
    c.medals = Object.fromEntries(exports.medalDefinitions.map((m) => [m.id, safeInt(object(raw.medals)[m.id])]));
    if (Array.isArray(raw.history)) {
        for (const entry of raw.history.slice(0, 40)) {
            const r = object(entry);
            if (typeof r.id !== 'string' || !['victory', 'defeat', 'draw'].includes(String(r.result)))
                continue;
            c.history.push({
                id: r.id.slice(0, 80),
                endedAt: safeInt(r.endedAt, 10000000000000),
                seed: safeInt(r.seed, 4294967295),
                seconds: safeInt(r.seconds),
                result: r.result,
                score: safeInt(r.score),
                xp: safeInt(r.xp),
                stats: readStats(r.stats),
                medals: exports.medalDefinitions
                    .filter((m) => Array.isArray(r.medals) && r.medals.includes(m.id))
                    .map((m) => m.id),
            });
        }
    }
    return c;
}
function assignmentValue(p, a) {
    return a.stat === 'games' || a.stat === 'wins'
        ? p[a.stat]
        : a.stat === 'kills'
            ? p.kills
            : (ensureCareer(p).stats[a.stat] ?? 0);
}
function claimAssignments(p) {
    const c = ensureCareer(p), earned = [];
    for (const a of exports.assignments)
        if (!c.claimed.includes(a.id) && assignmentValue(p, a) >= a.target) {
            c.claimed.push(a.id);
            c.xp = safeInt(c.xp + a.xp);
            earned.push(a);
        }
    return earned;
}
function recordXp(p, e) {
    const c = ensureCareer(p), points = safeInt(e.points), count = safeInt(e.count);
    c.xp = safeInt(c.xp + points);
    if (e.itemId && exports.itemTracks.some((t) => t.id === e.itemId)) {
        const item = ensureItem(p, e.itemId);
        item.xp = safeInt(item.xp + points);
    }
    if (e.stat) {
        c.stats[e.stat] = safeInt((c.stats[e.stat] ?? 0) + count);
        if (e.stat === 'kills')
            p.kills = safeInt(p.kills + count);
    }
    return claimAssignments(p);
}
function finishCareerMatch(p, report) {
    const c = ensureCareer(p);
    if (c.history.some((r) => r.id === report.id))
        return { bonus: 0, assignments: [], duplicate: true };
    report.medals = exports.medalDefinitions
        .filter((m) => (report.stats[m.stat] ?? 0) >= m.threshold)
        .map((m) => m.id);
    for (const id of report.medals)
        c.medals[id] = (c.medals[id] ?? 0) + 1;
    const bonus = 500 + (report.result === 'victory' ? 500 : 0) + report.medals.length * 150;
    c.xp += bonus;
    p.games++;
    if (report.result === 'victory')
        p.wins++;
    p.best = Math.max(p.best, report.score);
    const earned = claimAssignments(p);
    report.xp += bonus + earned.reduce((n, a) => n + a.xp, 0);
    c.history.unshift(report);
    c.history.length = Math.min(40, c.history.length);
    return { bonus, assignments: earned, duplicate: false };
}

},
"src/core/projectiles.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectileSpec = void 0;
/** Launch, prediction and simulation must use the same values. */
exports.projectileSpec = {
    rocket: { speed: 49, gravity: 0.65, lift: 0, fuse: 5, radius: 4.8 },
    shell: { speed: 43, gravity: 3, lift: 0, fuse: 5, radius: 4.2 },
    grenade: { speed: 17, gravity: 19, lift: 4, fuse: 2.7, radius: 3.6 },
    smoke: { speed: 17, gravity: 19, lift: 4, fuse: 1.25, radius: 4.6 },
};

},
"src/core/scenarios.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scenarios = void 0;
exports.scenario = scenario;
exports.spawnAnchor = spawnAnchor;
exports.teamSize = teamSize;
exports.atTeamBase = atTeamBase;
exports.scenarios = {
    city: {
        id: 'city',
        name: 'Metropolis',
        description: 'Nine sectors across the complete city. Wide flanks, armour and squad redeployment.',
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
        description: 'Close deployment around the central district. A focused combat and destruction scenario.',
        homes: [196, 316],
        gates: [250, 256, 262],
        vehicleHomes: [176, 336],
        vehicleGates: [250, 262],
        spawnSpread: 14,
        depthSpread: 14,
        defaultSize: 60,
    },
};
function scenario(id) {
    return id === 'frontline' ? exports.scenarios.frontline : exports.scenarios.city;
}
function spawnAnchor(id, team, gate) {
    const s = scenario(id), index = Number.isInteger(gate) && gate >= 0 && gate < 3 ? gate : 1;
    return { x: s.homes[team], z: s.gates[index] };
}
function teamSize(value) {
    return typeof value === 'number' && Number.isFinite(value)
        ? Math.max(10, Math.min(500, Math.round(value / 10) * 10))
        : 500;
}
/** Bases extend thirty units forward from the active scenario's team home. */
function atTeamBase(id, team, x) {
    const home = scenario(id).homes[team];
    return team === 0 ? x < home + 30 : x > home - 30;
}

},
"src/core/types.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},
"src/main.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const audio_1 = require("./platform/audio");
const storage_1 = require("./platform/storage");
const renderer_1 = require("./rendering/renderer");
const simulation_1 = require("./simulation/simulation");
const app_1 = require("./ui/app");
function boot() {
    let storage = null;
    try {
        storage = window.localStorage;
    }
    catch { }
    const saved = (0, storage_1.loadStorage)(storage);
    let hasSavedSettings = false;
    try {
        const raw = JSON.parse(storage?.getItem(storage_1.settingsKey) ?? 'null');
        hasSavedSettings = !!raw && typeof raw === 'object' && !Array.isArray(raw);
    }
    catch { }
    if (!hasSavedSettings) {
        saved.settings.touch = matchMedia('(pointer: coarse)').matches;
        saved.settings.scenario = 'frontline';
        saved.settings.teamSize = 60;
        saved.settings.loadout = 'engineer';
    }
    const sim = new simulation_1.Simulation(saved.settings);
    try {
        const renderer = new renderer_1.Renderer(sim, document.getElementById('world'), document.getElementById('hud')), app = new app_1.App(sim, renderer, new audio_1.GameAudio(sim), storage, saved.profile, saved);
        if (new URLSearchParams(location.search).get('diagnostics') === '1')
            Object.defineProperty(window, 'battlevoxDiagnostics', {
                value: { app, sim, renderer },
                configurable: true,
            });
        app.start();
        void app.boot();
    }
    catch (e) {
        const loading = document.getElementById('loading'), error = document.getElementById('error');
        if (loading)
            loading.hidden = true;
        if (error) {
            error.hidden = false;
            error.textContent = `Unable to start Battlevox: ${e instanceof Error ? e.message : String(e)}`;
        }
    }
}
if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', boot, { once: true });
else
    boot();

},
"src/platform/audio.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameAudio = void 0;
const math_1 = require("../core/math");
class GameAudio {
    sim;
    audio = null;
    master = null;
    noise = null;
    voices = 0;
    disposed = false;
    constructor(sim) {
        this.sim = sim;
    }
    resume() {
        if (this.disposed)
            return;
        try {
            if (!this.audio) {
                this.audio = new AudioContext();
                this.master = this.audio.createGain();
                this.master.connect(this.audio.destination);
                this.noise = this.audio.createBuffer(1, this.audio.sampleRate * 0.8, this.audio.sampleRate);
                const data = this.noise.getChannelData(0);
                for (let i = 0; i < data.length; i++)
                    data[i] = Math.random() * 2 - 1;
            }
            void this.audio.resume().catch(() => { });
            this.sync();
        }
        catch { }
    }
    sync() {
        if (this.master)
            this.master.gain.value = this.sim.playing ? this.sim.settings.volume * 0.45 : 0;
    }
    consume(event) {
        if (event.type === 'sound')
            this.sound(event);
        else if (event.type === 'hit')
            this.hit(event.killed, Boolean(event.headshot));
    }
    hit(killed, headshot = false) {
        const a = this.audio, m = this.master;
        if (!a || !m || a.state !== 'running' || this.voices >= 24)
            return;
        const t = a.currentTime, o = a.createOscillator(), g = a.createGain();
        this.voices++;
        o.frequency.setValueAtTime(killed ? (headshot ? 1100 : 880) : headshot ? 1700 : 1400, t);
        o.frequency.exponentialRampToValueAtTime(killed ? 440 : 900, t + 0.07);
        g.gain.setValueAtTime(0.075, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
        o.connect(g);
        g.connect(m);
        o.onended = () => {
            this.voices--;
            o.disconnect();
            g.disconnect();
        };
        o.start(t);
        o.stop(t + 0.1);
    }
    sound(event) {
        const a = this.audio, m = this.master, n = this.noise;
        if (!a ||
            !m ||
            !n ||
            a.state !== 'running' ||
            this.voices >= 24 ||
            this.sim.settings.volume <= 0)
            return;
        const p = this.sim.player, distance = Math.hypot(p.x - event.x, p.z - event.z), volume = event.gain / (1 + distance * 0.09);
        if (volume < 0.015)
            return;
        const t = a.currentTime, profile = {
            p12: [0.08, 2400, 1.35],
            r6: [0.18, 1450, 0.8],
            mp18: [0.065, 1950, 1.65],
            ar30: [0.095, 1750, 1.15],
            mg60: [0.135, 1150, 0.85],
            dmr8: [0.23, 2250, 0.72],
            launcher: [0.3, 580, 0.7],
            cannon: [0.48, 320, 0.62],
            crack: [0.22, 3000, 0.82],
            support: [0.12, 2300, 1.3],
            ping: [0.09, 3800, 1.4],
        }, signature = profile[event.sound], duration = signature?.[0] ?? (event.sound === 'boom' ? 0.65 : event.sound === 'step' ? 0.065 : 0.045), source = a.createBufferSource(), filter = a.createBiquadFilter(), g = a.createGain(), pan = a.createStereoPanner();
        source.buffer = n;
        source.playbackRate.value = signature?.[2] ?? 1;
        filter.type = 'lowpass';
        filter.frequency.value =
            signature?.[1] ??
                (event.sound === 'boom'
                    ? 260
                    : event.sound === 'step'
                        ? 420
                        : event.sound === 'shot'
                            ? 1700
                            : 3800);
        g.gain.setValueAtTime(volume, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + duration);
        pan.pan.value = (0, math_1.clamp)(((event.x - p.x) * Math.cos(this.sim.yaw) - (event.z - p.z) * Math.sin(this.sim.yaw)) /
            (distance + 1), -0.9, 0.9);
        source.connect(filter);
        filter.connect(g);
        g.connect(pan);
        pan.connect(m);
        this.voices++;
        source.onended = () => {
            this.voices--;
            source.disconnect();
            filter.disconnect();
            g.disconnect();
            pan.disconnect();
        };
        source.start(t);
        source.stop(t + duration);
    }
    dispose() {
        this.disposed = true;
        if (this.audio)
            void this.audio.close().catch(() => { });
        this.audio = null;
        this.master = null;
        this.noise = null;
    }
}
exports.GameAudio = GameAudio;

},
"src/platform/input.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputController = void 0;
const loadout_1 = require("../core/loadout");
const math_1 = require("../core/math");
const dom_1 = require("../ui/dom");
class InputController {
    app;
    canvas;
    abort = new AbortController();
    dragLook = false;
    movePointer = null;
    lookPointer = null;
    lookX = 0;
    lookY = 0;
    touchHeld = new Map();
    constructor(app, canvas) {
        this.app = app;
        this.canvas = canvas;
        const signal = this.abort.signal, s = app.sim;
        document.addEventListener('keydown', (e) => this.keyDown(e), { signal });
        document.addEventListener('keyup', (e) => {
            s.input.keys.delete(e.code);
        }, { signal });
        document.addEventListener('pointerlockchange', () => {
            if (!document.pointerLockElement && s.acceptsInput && !s.touch && (0, dom_1.byId)('scoreboard').hidden)
                app.pause();
        }, { signal });
        canvas.addEventListener('wheel', (e) => {
            if (!s.acceptsInput ||
                !(0, dom_1.byId)('scoreboard').hidden ||
                !Number.isFinite(e.deltaY) ||
                e.deltaY === 0)
                return;
            e.preventDefault();
            if (s.input.aim)
                s.cycleZoom(Math.sign(e.deltaY));
            else
                s.cycleWeapon(Math.sign(e.deltaY));
        }, { signal, passive: false });
        canvas.addEventListener('pointercancel', () => this.reset(), { signal });
        canvas.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
        canvas.addEventListener('pointerdown', (e) => {
            if (!s.acceptsInput || e.pointerType === 'touch')
                return;
            if (e.button === 0) {
                this.requestLook();
                s.input.fire = true;
                s.input.firePressed = true;
                this.dragLook = true;
            }
            if (e.button === 2)
                s.toggleAim(true);
        }, { signal });
        window.addEventListener('pointerup', (e) => {
            if (e.pointerType === 'touch')
                return;
            if (e.button === 0) {
                s.input.fire = false;
                this.dragLook = false;
            }
            if (e.button === 2)
                s.toggleAim(false);
        }, { signal });
        window.addEventListener('mousemove', (e) => {
            if (!s.acceptsInput || s.touch || (!document.pointerLockElement && !this.dragLook))
                return;
            const sensitivity = 0.0021 * s.settings.sensitivity * (0, loadout_1.aimSensitivity)(s);
            s.yaw = (0, math_1.angleWrap)(s.yaw + e.movementX * sensitivity);
            s.pitch = (0, math_1.clamp)(s.pitch - e.movementY * sensitivity, -1.4, 1.4);
        }, { signal });
        window.addEventListener('blur', () => {
            this.reset();
            if (s.playing)
                app.pause();
        }, { signal });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && s.playing)
                app.pause();
        }, { signal });
        const pad = (0, dom_1.byId)('movePad');
        const stick = (e) => {
            const r = pad.getBoundingClientRect(), dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2, l = Math.max(1, Math.hypot(dx, dy) / (r.width * 0.35));
            s.input.mx = dx / l / (r.width * 0.35);
            s.input.mz = dy / l / (r.width * 0.35);
            (0, dom_1.byId)('stick').style.transform = `translate(${dx / l}px,${dy / l}px)`;
        };
        pad.addEventListener('pointerdown', (e) => {
            if (!s.acceptsInput || this.movePointer !== null)
                return;
            e.preventDefault();
            this.movePointer = e.pointerId;
            pad.setPointerCapture(e.pointerId);
            stick(e);
        }, { signal });
        pad.addEventListener('pointermove', (e) => {
            if (e.pointerId === this.movePointer)
                stick(e);
        }, { signal });
        for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'])
            pad.addEventListener(type, (e) => {
                if (e.pointerId !== this.movePointer)
                    return;
                this.movePointer = null;
                s.input.mx = s.input.mz = 0;
                (0, dom_1.byId)('stick').style.transform = '';
            }, { signal });
        canvas.addEventListener('pointerdown', (e) => {
            if (!s.acceptsInput || !s.touch || e.pointerType !== 'touch' || this.lookPointer !== null)
                return;
            this.lookPointer = e.pointerId;
            this.lookX = e.clientX;
            this.lookY = e.clientY;
            canvas.setPointerCapture(e.pointerId);
        }, { signal });
        canvas.addEventListener('pointermove', (e) => {
            if (e.pointerId !== this.lookPointer || !s.acceptsInput)
                return;
            const sensitivity = 0.005 * s.settings.sensitivity * (0, loadout_1.aimSensitivity)(s);
            s.yaw = (0, math_1.angleWrap)(s.yaw + (e.clientX - this.lookX) * sensitivity);
            s.pitch = (0, math_1.clamp)(s.pitch - (e.clientY - this.lookY) * sensitivity, -1.4, 1.4);
            this.lookX = e.clientX;
            this.lookY = e.clientY;
        }, { signal });
        for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'])
            canvas.addEventListener(type, (e) => {
                if (e.pointerId === this.lookPointer)
                    this.lookPointer = null;
            }, { signal });
        const touch = (id, down, up) => {
            const el = (0, dom_1.byId)(id);
            el.addEventListener('pointerdown', (e) => {
                if (!s.acceptsInput || this.touchHeld.has(id))
                    return;
                e.preventDefault();
                this.touchHeld.set(id, e.pointerId);
                el.setPointerCapture(e.pointerId);
                down();
            }, { signal });
            for (const type of ['pointerup', 'pointercancel', 'lostpointercapture'])
                el.addEventListener(type, (e) => {
                    if (this.touchHeld.get(id) === e.pointerId) {
                        this.touchHeld.delete(id);
                        up?.();
                    }
                }, { signal });
        };
        touch('fire', () => {
            s.input.fire = true;
            s.input.firePressed = true;
        }, () => {
            s.input.fire = false;
        });
        touch('jump', () => {
            s.input.jump = true;
        });
        touch('aim', () => s.toggleAim(true), () => s.toggleAim(false));
        touch('crouch', () => {
            s.input.crouch = !s.input.crouch;
        });
        touch('reload', () => s.reload());
        touch('grenade', () => s.throwGrenade());
        touch('touchSmoke', () => s.throwSmoke());
        touch('touchZoom', () => s.cycleZoom());
        touch('swap', () => s.cycleWeapon());
        touch('enter', () => s.useVehicle());
        touch('liftDown', () => {
            const held = s.input.keys.has('ShiftLeft');
            s.input.keys.add('ShiftLeft');
            s.useLift();
            if (!held)
                s.input.keys.delete('ShiftLeft');
        });
        touch('heal', () => s.heal());
        touch('touchClass', () => s.classAbility());
        touch('touchPing', () => s.ping());
        touch('buildCover', () => s.fortify());
        touch('touchOrders', () => app.openTactical('orders'));
        touch('touchMap', () => app.openTactical('map'));
    }
    keyDown(e) {
        const a = this.app, s = a.sim;
        if (!(0, dom_1.byId)('actionDialog').hidden) {
            if (e.code === 'Escape') {
                e.preventDefault();
                a.closeDialog();
                return;
            }
            if (e.code === 'Tab') {
                e.preventDefault();
                (document.activeElement === (0, dom_1.byId)('dialogCancel')
                    ? (0, dom_1.byId)('dialogConfirm')
                    : (0, dom_1.byId)('dialogCancel')).focus();
                return;
            }
            return;
        }
        if (e.code === 'F2') {
            e.preventDefault();
            if (!e.repeat)
                s.menuState === 'lab' ? a.closeLab() : a.openLab();
            return;
        }
        if (e.code === 'Escape' && s.menuState === 'lab') {
            e.preventDefault();
            a.closeLab();
            return;
        }
        if (e.code === 'Escape') {
            e.preventDefault();
            if (!(0, dom_1.byId)('scoreboard').hidden) {
                a.closeScores();
                return;
            }
            if (['map', 'orders'].includes(s.menuState)) {
                a.resume();
                return;
            }
            if (s.menuState === 'deployment') {
                a.pause();
                return;
            }
            if (s.menuState === 'play')
                a.pause();
            else if (s.started && !s.ended)
                a.resume();
            else
                a.show('home');
            return;
        }
        if (e.code === 'Tab' && (!s.acceptsInput || !(0, dom_1.byId)('scoreboard').hidden)) {
            const panel = !(0, dom_1.byId)('scoreboard').hidden
                ? (0, dom_1.byId)('scoreboard')
                : !(0, dom_1.byId)('tactical').hidden
                    ? (0, dom_1.byId)('tactical')
                    : (0, dom_1.byId)('overlay'), els = [
                ...panel.querySelectorAll('button:not(:disabled):not([tabindex="-1"]),input:not(:disabled),select:not(:disabled),summary,[tabindex="0"]:not(:disabled)'),
            ].filter((el) => !el.closest('[hidden],[inert]') &&
                (!el.closest('details:not([open])') || el.tagName === 'SUMMARY'));
            if (els.length) {
                const index = els.indexOf(document.activeElement);
                e.preventDefault();
                els[(index + (e.shiftKey ? -1 : 1) + els.length) % els.length].focus();
            }
            return;
        }
        if (!(0, dom_1.byId)('scoreboard').hidden)
            return;
        if (s.menuState === 'orders' && /^Digit[123]$/.test(e.code)) {
            e.preventDefault();
            if (!e.repeat)
                a.order(['follow', 'objective', 'hold'][Number(e.code.slice(-1)) - 1]);
            return;
        }
        if (!s.acceptsInput ||
            e.target instanceof HTMLInputElement ||
            e.target instanceof HTMLSelectElement)
            return;
        const handled = [
            'KeyW',
            'KeyA',
            'KeyS',
            'KeyD',
            'KeyC',
            'ShiftLeft',
            'ShiftRight',
            'Space',
            'KeyR',
            'KeyG',
            'KeyE',
            'KeyQ',
            'KeyM',
            'KeyP',
            'Digit1',
            'Digit2',
            'Digit3',
            'Digit4',
            'KeyX',
            'KeyH',
            'KeyB',
            'KeyV',
            'KeyF',
            'KeyZ',
            'KeyT',
            'Tab',
        ];
        if (handled.includes(e.code))
            e.preventDefault();
        s.input.keys.add(e.code);
        if (e.repeat)
            return;
        switch (e.code) {
            case 'Space':
                s.input.jump = true;
                break;
            case 'KeyR':
                s.reload();
                break;
            case 'KeyG':
                s.throwGrenade();
                break;
            case 'KeyE':
                s.useVehicle();
                break;
            case 'KeyQ':
                s.cycleWeapon();
                break;
            case 'Digit1':
            case 'Digit2':
            case 'Digit3':
                s.selectWeaponSlot(Number(e.code.slice(-1)) - 1);
                break;
            case 'Digit4':
                s.throwSmoke();
                break;
            case 'KeyX':
                s.cycleZoom();
                break;
            case 'KeyM':
            case 'KeyT':
                a.openTactical('map');
                break;
            case 'KeyB':
                a.openTactical('orders');
                break;
            case 'KeyP':
                a.pause();
                break;
            case 'KeyH':
                s.heal();
                break;
            case 'KeyF':
                s.classAbility();
                break;
            case 'KeyZ':
                s.ping();
                break;
            case 'KeyV':
                s.fortify();
                break;
            case 'Tab':
                a.showScores();
                break;
        }
    }
    requestLook() {
        const s = this.app.sim;
        if (s.touch || document.pointerLockElement === this.canvas || !this.canvas.requestPointerLock)
            return;
        try {
            const result = this.canvas.requestPointerLock();
            if (result)
                void result.catch(() => { });
        }
        catch { }
    }
    releaseLook() {
        try {
            if (document.pointerLockElement)
                document.exitPointerLock();
        }
        catch { }
    }
    reset() {
        this.app.sim.clearInput();
        this.dragLook = false;
        this.movePointer = this.lookPointer = null;
        this.touchHeld.clear();
        (0, dom_1.byId)('stick').style.transform = '';
    }
    dispose() {
        this.abort.abort();
        this.reset();
        this.releaseLook();
    }
}
exports.InputController = InputController;

},
"src/platform/profile-session.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileSession = exports.exclusiveProfileWrite = void 0;
const storage_1 = require("./storage");
let database;
function localDatabase() {
    if (database)
        return database;
    database = new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') {
            reject(Error('No serialisation primitive'));
            return;
        }
        const request = indexedDB.open('battlevox-save-lock', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('mutex');
        request.onsuccess = () => {
            request.result.onversionchange = () => {
                request.result.close();
                database = undefined;
            };
            resolve(request.result);
        };
        request.onerror = () => {
            database = undefined;
            reject(request.error);
        };
        request.onblocked = () => {
            database = undefined;
            reject(Error('Save database upgrade blocked'));
        };
    });
    return database;
}
/** Both Web Locks and IDB readwrite transactions serialize same-origin writers.
 * The callback is synchronous: localStorage CAS happens while the exclusive lock is held. */
const exclusiveProfileWrite = async (job) => {
    if (typeof navigator !== 'undefined' && navigator.locks)
        return navigator.locks.request('battlevox-profile-write', job);
    const db = await localDatabase();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('mutex', 'readwrite');
        let result, done = false;
        const request = tx.objectStore('mutex').get('lock');
        request.onsuccess = () => {
            try {
                result = job();
                done = true;
                tx.objectStore('mutex').put(Date.now(), 'lock');
            }
            catch (e) {
                tx.abort();
                reject(e);
            }
        };
        tx.oncomplete = () => done ? resolve(result) : reject(Error('Save transaction did not execute'));
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error ?? Error('Save transaction aborted'));
    });
};
exports.exclusiveProfileWrite = exclusiveProfileWrite;
class ProfileSession {
    storage;
    exclusive;
    expected;
    journalKey;
    constructor(storage, base, exclusive = exports.exclusiveProfileWrite) {
        this.storage = storage;
        this.exclusive = exclusive;
        this.expected = base;
        const id = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
        this.journalKey = storage_1.journalPrefix + id;
    }
    /** A per-session checkpoint is synchronous, including during pagehide/unload. */
    checkpoint(profile) {
        try {
            if (!this.storage)
                return false;
            this.storage.setItem(this.journalKey, JSON.stringify({
                base: this.expected,
                profile: (0, storage_1.validateProfile)(profile),
                updatedAt: Date.now(),
            }));
            return true;
        }
        catch {
            return false;
        }
    }
    async commit(profile) {
        const value = JSON.stringify((0, storage_1.validateProfile)(profile));
        const journalled = this.checkpoint(profile);
        if (!this.storage)
            return { ok: false, reason: 'unavailable' };
        try {
            return await this.exclusive(() => {
                const current = this.storage.getItem(storage_1.profileKey);
                if (current !== this.expected)
                    return { ok: false, reason: 'conflict' };
                this.storage.setItem(storage_1.profileKey, value);
                this.expected = value;
                // A checkpoint written while the lock was queued may contain newer XP.
                try {
                    const pending = JSON.parse(this.storage.getItem(this.journalKey) ?? 'null');
                    if (pending && JSON.stringify(pending.profile) === value)
                        this.storage.removeItem?.(this.journalKey);
                    else if (pending) {
                        pending.base = value;
                        this.storage.setItem(this.journalKey, JSON.stringify(pending));
                    }
                }
                catch {
                    /* Canonical data was saved; keep an unreadable journal for recovery. */
                }
                return { ok: true };
            });
        }
        catch {
            return { ok: false, reason: journalled ? 'checkpoint' : 'unavailable' };
        }
    }
    checkpoints() {
        return (0, storage_1.readCheckpoints)(this.storage);
    }
}
exports.ProfileSession = ProfileSession;

},
"src/platform/storage.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.journalPrefix = exports.profileKey = exports.settingsKey = void 0;
exports.readCheckpoints = readCheckpoints;
exports.validateSettings = validateSettings;
exports.validateProfile = validateProfile;
exports.loadStorage = loadStorage;
exports.saveSettings = saveSettings;
exports.saveProfile = saveProfile;
const config_1 = require("../core/config");
const loadout_1 = require("../core/loadout");
const math_1 = require("../core/math");
const progression_1 = require("../core/progression");
const scenarios_1 = require("../core/scenarios");
exports.settingsKey = 'battlevox-metropolis-settings', exports.profileKey = 'battlevox-metropolis-profile';
exports.journalPrefix = exports.profileKey + '-pending-';
function readCheckpoints(storage) {
    const result = [];
    try {
        for (let i = 0; i < Math.min(storage?.length ?? 0, 512); i++) {
            const key = storage?.key?.(i);
            if (!key?.startsWith(exports.journalPrefix))
                continue;
            try {
                const raw = JSON.parse(storage.getItem(key) ?? 'null');
                if (raw &&
                    (raw.base === null || typeof raw.base === 'string') &&
                    Number.isFinite(raw.updatedAt) &&
                    raw.profile)
                    result.push({
                        key,
                        base: raw.base,
                        profile: validateProfile(raw.profile),
                        updatedAt: raw.updatedAt,
                    });
            }
            catch { }
        }
    }
    catch { }
    return result.sort((a, b) => b.updatedAt - a.updatedAt);
}
function record(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
        ? value
        : {};
}
function validateSettings(value) {
    const raw = record(value), out = { ...config_1.defaults };
    const limits = {
        seed: [1, 4294967295],
        quality: [0.5, 1.35],
        distance: [180, 500],
        fov: [65, 105],
        brightness: [0.75, 1.35],
        sensitivity: [0.3, 2.5],
        volume: [0, 1],
        adsSensitivity: [0.2, 1],
    };
    for (const key of Object.keys(limits)) {
        const v = raw[key];
        if (typeof v === 'number' && Number.isFinite(v))
            out[key] = (0, math_1.clamp)(v, limits[key][0], limits[key][1]);
    }
    out.seed = Math.floor(out.seed);
    if (raw.hudScale === 1.15 || raw.hudScale === 1.3)
        out.hudScale = raw.hudScale;
    out.secondary = (0, loadout_1.secondaryIndex)(raw.secondary);
    for (const key of ['motion', 'adaptive', 'touch', 'textures', 'shadows'])
        if (typeof raw[key] === 'boolean')
            out[key] = raw[key];
    if (typeof raw.minutes === 'number' && [10, 25, 45].includes(raw.minutes))
        out.minutes = raw.minutes;
    if (['assault', 'medic', 'support', 'engineer', 'recon'].includes(String(raw.loadout)))
        out.loadout = raw.loadout;
    if (raw.scenario === 'frontline' || raw.scenario === 'city')
        out.scenario = raw.scenario;
    if (typeof raw.teamSize === 'number' && Number.isFinite(raw.teamSize))
        out.teamSize = (0, scenarios_1.teamSize)(raw.teamSize);
    if (raw.lighting === 'afternoon' || raw.lighting === 'overcast')
        out.lighting = raw.lighting;
    if (raw.aimMode === 'hold' || raw.aimMode === 'toggle')
        out.aimMode = raw.aimMode;
    return out;
}
function validateProfile(value) {
    const raw = record(value), out = { games: 0, wins: 0, kills: 0, best: 0 };
    for (const k of ['games', 'wins', 'kills', 'best']) {
        const v = raw[k];
        if (typeof v === 'number' && Number.isSafeInteger(v) && v >= 0)
            out[k] = v;
    }
    out.wins = Math.min(out.wins, out.games);
    if (raw.career)
        out.career = (0, progression_1.validateCareer)(raw.career);
    return out;
}
function loadStorage(storage) {
    let settings = validateSettings(null), profile = validateProfile(null);
    try {
        settings = validateSettings(JSON.parse(storage?.getItem(exports.settingsKey) || 'null'));
    }
    catch { }
    let profileBase = null;
    try {
        profileBase = storage?.getItem(exports.profileKey) ?? null;
        profile = validateProfile(JSON.parse(profileBase || 'null'));
    }
    catch { }
    const pending = readCheckpoints(storage), recoverable = pending.filter((p) => p.base === profileBase);
    // Ambiguous concurrent sessions require an explicit recovery choice, never a counter merge.
    const unique = [...new Map(recoverable.map((p) => [JSON.stringify(p.profile), p])).values()];
    if (unique.length === 1)
        profile = unique[0].profile;
    return {
        settings,
        profile,
        profileBase,
        recovered: unique.length === 1,
        recoveryConflict: unique.length > 1,
    };
}
function saveSettings(storage, value) {
    try {
        if (!storage)
            return false;
        storage.setItem(exports.settingsKey, JSON.stringify(validateSettings(value)));
        return true;
    }
    catch {
        return false;
    }
}
function saveProfile(storage, value) {
    try {
        if (!storage)
            return false;
        storage.setItem(exports.profileKey, JSON.stringify(validateProfile(value)));
        return true;
    }
    catch {
        return false;
    }
}

},
"src/rendering/allocation-scope.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllocationScope = void 0;
/** Roll back partially constructed graphics resources without relying on context loss. */
class AllocationScope {
    cleanup = [];
    keep(resource, release, message) {
        if (resource === null)
            throw Error(message);
        this.cleanup.push(() => release(resource));
        return resource;
    }
    commit() {
        this.cleanup.length = 0;
    }
    dispose() {
        for (const release of this.cleanup.reverse()) {
            try {
                release();
            }
            catch {
                /* Continue releasing the remaining independent allocations. */
            }
        }
        this.cleanup.length = 0;
    }
}
exports.AllocationScope = AllocationScope;

},
"src/rendering/canvas-hud.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.project = project;
exports.drawCombatHUD = drawCombatHUD;
exports.drawHUD = drawHUD;
exports.drawMinimap = drawMinimap;
const configModule = require("../core/config");
const loadout_1 = require("../core/loadout");
const mathModule = require("../core/math");
const perception_1 = require("../simulation/perception");
const hud_model_1 = require("../ui/hud-model");
const theme_1 = require("../ui/theme");
const optics_1 = require("./optics");
function project(x, y, z, vp) {
    const w = vp[3] * x + vp[7] * y + vp[11] * z + vp[15];
    if (w <= 0.1)
        return null;
    return {
        x: ((vp[0] * x + vp[4] * y + vp[8] * z + vp[12]) / w) * this.viewWidth * 0.5 +
            this.viewWidth * 0.5,
        y: (-(vp[1] * x + vp[5] * y + vp[9] * z + vp[13]) / w) * this.viewHeight * 0.5 +
            this.viewHeight * 0.5,
    };
}
function drawCombatHUD() {
    if (!this.sim.playing || !this.sim.player.alive)
        return;
    const cx = this.viewWidth / 2, cy = this.viewHeight / 2;
    if (!this.sim.touch || this.viewWidth > 700) {
        this.ctx.textAlign = 'center';
        this.ctx.font = `${Math.round(12 * this.layout.scale)}px system-ui`;
        const heading = ((this.sim.yaw * 180) / Math.PI + 360) % 360;
        for (let i = -3; i <= 3; i++) {
            const degree = Math.round(heading / 15) * 15 + i * 15, x = cx + mathModule.angleWrap(((degree - heading) * Math.PI) / 180) * 155;
            if (x < cx - 135 || x > cx + 135)
                continue;
            const d = (degree + 720) % 360;
            this.ctx.fillStyle = (0, theme_1.alphaColour)(this.theme.ink, 0.8);
            this.ctx.fillText(d % 90 === 0 ? ['N', 'E', 'S', 'W'][d / 90] : String(d).padStart(3, '0'), x, this.layout.compassY);
        }
        this.ctx.fillStyle = this.theme.accent;
        this.ctx.fillRect(cx - 1, this.layout.compassY + 4, 2, 5);
    }
    if (this.sim.reloadTime > 0 && !this.sim.player.vehicle) {
        this.ctx.strokeStyle = this.theme.accent;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, 23, -Math.PI / 2, -Math.PI / 2 +
            mathModule.TAU *
                (1 -
                    this.sim.reloadTime /
                        (configModule.weapons[this.sim.weaponIndex].reload *
                            this.sim.weaponTuning[this.sim.weaponIndex].reload)));
        this.ctx.stroke();
    }
    if (this.sim.handling.damageTime > 0) {
        this.ctx.textAlign = 'center';
        this.ctx.font = `bold ${Math.round(13 * this.layout.scale)}px system-ui`;
        this.ctx.fillStyle = this.sim.hitKill ? this.theme.warning : this.theme.ink;
        this.ctx.fillText((this.sim.hitKill
            ? this.sim.handling.head
                ? 'HEADSHOT ELIMINATION · '
                : 'ELIMINATED · '
            : this.sim.handling.head
                ? 'HEADSHOT · '
                : 'HIT · ') + this.sim.handling.damage, cx, cy + 40);
    }
    if (this.sim.player.shield > 0) {
        this.ctx.textAlign = 'center';
        this.ctx.font = `${Math.round(12 * this.layout.scale)}px system-ui`;
        this.ctx.fillStyle = this.theme.ally;
        this.ctx.fillText('SPAWN PROTECTION · ' + this.sim.player.shield.toFixed(1) + 's', cx, cy + 118);
    }
}
function drawHUD(vp) {
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.ctx.clearRect(0, 0, this.viewWidth, this.viewHeight);
    if (!this.sim.started)
        return;
    const centreX = this.viewWidth / 2, centreY = this.viewHeight / 2;
    if (this.sim.playing && this.sim.player.alive) {
        this.ctx.strokeStyle = this.theme.ink;
        this.ctx.lineWidth = 1.5;
        const gap = this.sim.player.vehicle
            ? 7
            : mathModule.clamp(this.sim.weaponSpread() * this.viewHeight * 0.65, 2, 40);
        this.ctx.save();
        if (!this.sim.player.vehicle && this.sim.aimAmount > 0.65)
            this.ctx.globalAlpha = 0;
        this.ctx.beginPath();
        for (const [x, y] of [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
        ]) {
            this.ctx.moveTo(centreX + x * gap, centreY + y * gap);
            this.ctx.lineTo(centreX + x * (gap + 6), centreY + y * (gap + 6));
        }
        this.ctx.strokeStyle = this.theme.deep;
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
        this.ctx.strokeStyle = this.theme.ink;
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
        this.ctx.restore();
        if (this.sim.hitTime > 0) {
            this.ctx.strokeStyle = this.sim.hitKill ? this.theme.enemy : this.theme.ink;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            for (const [x, y] of [
                [1, 1],
                [1, -1],
                [-1, 1],
                [-1, -1],
            ]) {
                this.ctx.moveTo(centreX + x * 8, centreY + y * 8);
                this.ctx.lineTo(centreX + x * 14, centreY + y * 14);
            }
            this.ctx.stroke();
        }
    }
    (0, optics_1.drawOptics)(this);
    this.drawCombatHUD();
    // Sector markers stay visible at long range; nearby friendly marks require LOS.
    this.ctx.textAlign = 'center';
    this.ctx.font = `bold ${Math.round(13 * this.layout.scale)}px system-ui`;
    const labels = [];
    const flags = [...this.sim.world.flags].sort((a, b) => Number(b === this.sim.world.flags[this.sim.handling.objective]) -
        Number(a === this.sim.world.flags[this.sim.handling.objective]) ||
        mathModule.dist2(a, this.sim.player) - mathModule.dist2(b, this.sim.player));
    for (const f of flags) {
        if ((0, loadout_1.scoped)(this.sim) && this.sim.aimAmount > 0.7)
            continue;
        const p = this.project(f.x, this.sim.world.groundAt(f.x, f.z) + 5.4, f.z, vp);
        if (!p || p.x < 30 || p.x > this.viewWidth - 30 || p.y < 90 || p.y > this.viewHeight - 160)
            continue;
        if (Math.hypot(p.x - centreX, p.y - centreY) < 64 ||
            labels.some((label) => Math.abs(label.x - p.x) < 64 && Math.abs(label.y - p.y) < 65) ||
            labels.length >= 4)
            continue;
        labels.push(p);
        const colour = f.owner === 0 ? this.theme.ally : f.owner === 1 ? this.theme.enemy : this.theme.ink;
        this.ctx.fillStyle = this.theme.panel;
        this.ctx.fillRect(p.x - 15, p.y - 15, 30, 27);
        this.ctx.strokeStyle = colour;
        this.ctx.lineWidth = f === this.sim.world.flags[this.sim.handling.objective] ? 2 : 1;
        this.ctx.strokeRect(p.x - 15, p.y - 15, 30, 27);
        this.ctx.fillStyle = colour;
        this.ctx.fillText(f.name, p.x, p.y + 4);
        this.ctx.font = `${Math.round(12 * this.layout.scale)}px system-ui`;
        this.ctx.fillText(Math.round(Math.sqrt(mathModule.dist2(this.sim.player, f))) + ' m', p.x, p.y + 28);
        this.ctx.font = `bold ${Math.round(13 * this.layout.scale)}px system-ui`;
    }
    for (let i = 0; i < this.sim.actors.length; i++) {
        const a = this.sim.actors[i];
        if (((0, loadout_1.scoped)(this.sim) && this.sim.aimAmount > 0.7) ||
            a.player ||
            !a.alive ||
            a.team !== this.sim.player.team ||
            mathModule.dist2(a, this.sim.player) > 625)
            continue;
        const p = this.project(a.x, a.y + 2.2, a.z, vp);
        if (p && (0, perception_1.canSee)(this.sim, this.sim.camera, { x: a.x, y: a.y + 1.65, z: a.z })) {
            this.ctx.fillStyle = this.theme.ally;
            this.ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        }
    }
    if (this.sim.acceptsInput && !((0, loadout_1.scoped)(this.sim) && this.sim.aimAmount > 0.7)) {
        const target = this.hudState?.kit.target;
        if (target &&
            this.hudState?.kit.available &&
            mathModule.dist2(target, this.sim.player) < 36 &&
            (0, perception_1.canSee)(this.sim, this.sim.camera, { x: target.x, y: target.y + 0.8, z: target.z })) {
            const p = this.project(target.x, target.y + 2, target.z, vp);
            if (p &&
                p.x > 20 &&
                p.x < this.viewWidth - 20 &&
                p.y > 130 &&
                p.y < this.viewHeight - 100 &&
                Math.hypot(p.x - centreX, p.y - centreY) > 60) {
                this.ctx.fillStyle = this.theme.squad;
                this.ctx.font = `bold ${Math.round(12 * this.layout.scale)}px system-ui`;
                this.ctx.fillText(`Q · ${this.hudState.kit.label.toUpperCase()}`, p.x, p.y);
            }
        }
        let supplies = 0;
        for (const d of this.sim.deployables) {
            if (supplies >= 2 ||
                d.team !== this.sim.player.team ||
                mathModule.dist2(d, this.sim.player) > 225)
                continue;
            const p = this.project(d.x, d.y + 0.9, d.z, vp);
            if (!p ||
                p.x < 40 ||
                p.x > this.viewWidth - 40 ||
                p.y < 130 ||
                p.y > this.viewHeight - 170 ||
                Math.hypot(p.x - centreX, p.y - centreY) < 64 ||
                !(0, perception_1.canSee)(this.sim, this.sim.camera, { ...d, y: d.y + 0.3 }))
                continue;
            this.ctx.fillStyle = this.theme.squad;
            this.ctx.font = `${Math.round(11 * this.layout.scale)}px system-ui`;
            this.ctx.fillText(`${d.kind === 'medical' ? '+ MEDICAL' : 'AMMO'} · ${d.charges}`, p.x, p.y);
            supplies++;
        }
    }
    if (this.layout.showMap) {
        const { x: mx, y: my, width: ms, height: mh } = this.layout.map;
        const player = this.sim.player, span = 160, scale = ms / span;
        const left = player.x - span / 2, north = player.z - span / 2;
        const px = (x) => mx + (x - left) * scale;
        const py = (z) => my + (z - north) * scale;
        const inside = (x, z) => x >= left + 4 && x <= left + span - 4 && z >= north + 4 && z <= north + span - 4;
        this.ctx.save();
        this.ctx.fillStyle = this.theme.panel;
        this.ctx.fillRect(mx, my, ms, mh);
        const sx = Math.max(0, left), sz = Math.max(0, north), sw = Math.min(configModule.W, left + span) - sx, sh = Math.min(configModule.D, north + span) - sz;
        if (sw > 0 && sh > 0)
            this.ctx.drawImage(this.mini, sx, sz, sw, sh, px(sx), py(sz), sw * scale, sh * scale);
        this.ctx.strokeStyle = this.theme.line;
        this.ctx.strokeRect(mx, my, ms, mh);
        for (const a of this.sim.actors) {
            if (!a.alive || a.player || !inside(a.x, a.z))
                continue;
            if (a.team !== player.team &&
                !(mathModule.dist2(a, player) < 625 &&
                    a.cool > 0.12 &&
                    (0, perception_1.canSee)(this.sim, this.sim.camera, { x: a.x, y: a.y + 1.5, z: a.z })))
                continue;
            const squad = a.team === player.team && a.squadId === player.squadId;
            this.ctx.fillStyle =
                a.team !== player.team ? this.theme.enemy : squad ? this.theme.squad : this.theme.ally;
            this.ctx.fillRect(px(a.x) - 1, py(a.z) - 1, squad ? 4 : 2, squad ? 4 : 2);
        }
        for (const v of this.sim.vehicles)
            if (v.alive && v.team === player.team && inside(v.x, v.z)) {
                this.ctx.strokeStyle = this.theme.ally;
                this.ctx.strokeRect(px(v.x) - 3, py(v.z) - 3, 6, 6);
            }
        for (const ping of this.sim.pings)
            if (ping.team === player.team && inside(ping.x, ping.z)) {
                this.ctx.strokeStyle = ping.kind === 'enemy' ? this.theme.enemy : this.theme.warning;
                this.ctx.strokeRect(px(ping.x) - 3, py(ping.z) - 3, 6, 6);
            }
        const flag = this.sim.world.flags[this.sim.handling.objective] ?? this.sim.world.flags[4], dx = flag.x - player.x, dz = flag.z - player.z;
        const edge = Math.max(1, Math.abs(dx) / 68, Math.abs(dz) / 68);
        this.ctx.fillStyle = this.theme.accent;
        this.ctx.font = `bold ${Math.round(11 * this.layout.scale)}px system-ui`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(edge > 1 ? '◆' : flag.name, px(player.x + dx / edge), py(player.z + dz / edge) + 4);
        this.ctx.fillStyle = this.theme.ink;
        this.ctx.font = `${Math.round(11 * this.layout.scale)}px system-ui`;
        this.ctx.fillText('N · 160 m', mx + ms / 2, my + 11);
        this.ctx.translate(mx + ms / 2, my + mh / 2);
        this.ctx.rotate(-this.sim.yaw);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 7);
        this.ctx.lineTo(-4, -4);
        this.ctx.lineTo(4, -4);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }
    // Contextual markers are positional snapshots, not live wall-tracking of spotted enemies.
    for (const ping of this.sim.pings)
        if (ping.team === this.sim.player.team && !((0, loadout_1.scoped)(this.sim) && this.sim.aimAmount > 0.7)) {
            const p = this.project(ping.x, ping.y + 2.5, ping.z, vp);
            if (!p || p.x < 20 || p.x > this.viewWidth - 20 || p.y < 100 || p.y > this.viewHeight - 170)
                continue;
            this.ctx.strokeStyle = ping.kind === 'enemy' ? this.theme.enemy : this.theme.warning;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(p.x - 7, p.y - 7, 14, 14);
            this.ctx.fillStyle = this.ctx.strokeStyle;
            this.ctx.font = `bold ${Math.round(11 * this.layout.scale)}px system-ui`;
            this.ctx.fillText(ping.kind === 'enemy' ? 'SPOTTED' : 'PING', p.x, p.y - 13);
        }
    const nearby = this.sim.world.flags.find((f) => mathModule.dist2(f, this.sim.player) < 576 &&
        Math.abs(this.sim.player.y - this.sim.world.groundAt(f.x, f.z)) < 5);
    if (this.sim.playing && this.sim.player.alive && nearby) {
        const width = 150, y = centreY + 86;
        this.ctx.fillStyle = this.theme.panel;
        this.ctx.fillRect(centreX - width / 2, y, width, 5);
        this.ctx.fillStyle = nearby.contested ? this.theme.accent : this.theme.ally;
        this.ctx.fillRect(centreX - width / 2, y, width * (0, hud_model_1.captureProgress)(nearby.value, this.sim.player.team), 5);
    }
    if (this.sim.player.alive && (this.sim.player.hp < 45 || this.sim.hurtTime > 0)) {
        const strength = Math.min(0.22, Math.max(0, (45 - this.sim.player.hp) / 300) + this.sim.hurtTime * 0.12);
        const shade = this.ctx.createRadialGradient(centreX, centreY, Math.min(this.viewWidth, this.viewHeight) * 0.35, centreX, centreY, Math.hypot(centreX, centreY));
        shade.addColorStop(0, (0, theme_1.alphaColour)(this.theme.danger, 0));
        shade.addColorStop(1, (0, theme_1.alphaColour)(this.theme.danger, strength));
        this.ctx.fillStyle = shade;
        this.ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);
    }
    if (this.sim.hurtTime > 0) {
        const angle = this.sim.damageAngle - this.sim.yaw;
        this.ctx.save();
        this.ctx.translate(centreX, centreY);
        this.ctx.rotate(angle);
        this.ctx.fillStyle = this.theme.danger;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -82);
        this.ctx.lineTo(-9, -64);
        this.ctx.lineTo(9, -64);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }
    if (!this.sim.player.alive && this.sim.playing) {
        this.ctx.fillStyle = (0, theme_1.alphaColour)(this.theme.deep, 0.74);
        this.ctx.fillRect(0, 0, this.viewWidth, this.viewHeight);
        this.ctx.fillStyle = this.theme.ink;
        this.ctx.font = `800 ${Math.round(28 * this.layout.scale)}px system-ui`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.sim.tickets[this.sim.player.team] > 0
            ? 'REINFORCEMENTS INBOUND'
            : 'NO RESERVES AVAILABLE', centreX, centreY - 16);
        this.ctx.font = `${Math.round(16 * this.layout.scale)}px system-ui`;
        this.ctx.fillText(this.sim.tickets[this.sim.player.team] > 0
            ? 'Redeploying in ' + Math.max(1, Math.ceil(this.sim.player.respawn)) + ' seconds'
            : 'No reinforcements remain.', centreX, centreY + 22);
    }
}
function drawMinimap() {
    const img = this.miniCtx.createImageData(configModule.W, configModule.D);
    for (let z = 0; z < configModule.D; z++)
        for (let x = 0; x < configModule.W; x++) {
            const y = this.sim.world.floorAt(x, z), m = this.sim.world.cell(x, y - 1, z), i = (z * configModule.W + x) * 4, c = x >= 249 && x <= 262 && y < 3
                ? [0.25, 0.48, 0.57]
                : this.sim.world.colours[m] || this.sim.world.colours[1];
            img.data[i] = c[0] * 220;
            img.data[i + 1] = c[1] * 220;
            img.data[i + 2] = c[2] * 220;
            img.data[i + 3] = 255;
        }
    this.miniCtx.putImageData(img, 0, 0);
    this.sim.world.mapDirty = false;
}

},
"src/rendering/contact-shadows.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawContactShadows = drawContactShadows;
const config_1 = require("../core/config");
const math_1 = require("../core/math");
const materials_1 = require("./materials");
/** Bounded surface patches: no shadow maps, and no floating patches across holes. */
function drawContactShadows(renderer) {
    const { sim } = renderer, used = new Set();
    let budget = 96;
    const patch = (x, y, z) => {
        if (budget <= 0)
            return;
        const material = sim.world.cell(x, y, z), key = sim.world.index(x, y, z);
        if (!material || used.has(key) || sim.world.cell(x, y + 1, z))
            return;
        used.add(key);
        budget--;
        const factor = materials_1.materialResponse[material]?.shadow ?? 0.75;
        const base = sim.world.colours[material];
        const colour = [base[0] * factor, base[1] * factor, base[2] * factor];
        renderer.box(x + 0.5, y + 1.008, z + 0.5, 0.55, 0.008, 0.55, colour);
    };
    for (const a of sim.actors) {
        if (!a.alive || a.player || !a.onGround || (0, math_1.dist2)(a, sim.camera) > 1600)
            continue;
        patch(Math.floor(a.x), Math.floor(a.y - 0.05), Math.floor(a.z));
        if (budget < 32)
            break;
    }
    for (const body of sim.rubble) {
        if (!body.sleeping || (0, math_1.dist2)(body, sim.camera) > 2500)
            continue;
        for (const support of body.support?.terrain ?? []) {
            const key = support.key;
            patch(key % config_1.W, Math.floor(key / (config_1.W * config_1.D)), Math.floor(key / config_1.W) % config_1.D);
            if (budget <= 0)
                return;
        }
    }
}

},
"src/rendering/destruction.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareRubble = prepareRubble;
exports.drawRubble = drawRubble;
const rubble_shape_1 = require("../simulation/rubble-shape");
const section_mesh_1 = require("../simulation/section-mesh");
const frustum_1 = require("./frustum");
const meshJobs = new WeakMap();
function prepareRubble(renderer) {
    const { sim, gl } = renderer, live = new Set(sim.rubble);
    for (const [body, gpu] of renderer.gpuSections)
        if (!live.has(body)) {
            gl.deleteVertexArray(gpu.vao);
            gl.deleteBuffer(gpu.buffer);
            renderer.gpuSections.delete(body);
        }
    const deadline = performance.now() + 2;
    for (const body of sim.rubble) {
        const bounds = (0, rubble_shape_1.rubbleBounds)(body), camera = sim.camera;
        const distance = Math.hypot(Math.max(bounds.min.x - camera.x, 0, camera.x - bounds.max.x), Math.max(bounds.min.z - camera.z, 0, camera.z - bounds.max.z));
        const visible = distance <= sim.settings.distance && (0, frustum_1.insideFrustum)(renderer.cameraPlanes, bounds);
        const caster = renderer.lighting.shadows && renderer.lighting.available && distance < 230;
        if (!body.voxels.length || (!visible && !caster))
            continue;
        let gpu = renderer.gpuSections.get(body);
        if (!gpu) {
            const vao = gl.createVertexArray(), buffer = gl.createBuffer();
            if (!vao || !buffer) {
                if (vao)
                    gl.deleteVertexArray(vao);
                if (buffer)
                    gl.deleteBuffer(buffer);
                throw Error('Unable to allocate section mesh');
            }
            gpu = { vao, buffer, version: -1, count: 0 };
            renderer.gpuSections.set(body, gpu);
        }
        gl.bindVertexArray(gpu.vao);
        if (gpu.version !== body.geometryVersion) {
            let mesh = section_mesh_1.sectionMeshes.get(body);
            if (mesh?.version !== body.geometryVersion && performance.now() < deadline) {
                let pending = meshJobs.get(body);
                if (!pending || pending.version !== body.geometryVersion) {
                    pending = {
                        version: body.geometryVersion,
                        job: (0, section_mesh_1.prepareSectionMesh)(body, sim.world.colours),
                    };
                    meshJobs.set(body, pending);
                }
                do {
                    if (pending.job.next().done) {
                        meshJobs.delete(body);
                        break;
                    }
                } while (performance.now() < deadline);
                mesh = section_mesh_1.sectionMeshes.get(body);
            }
            if (mesh?.version === body.geometryVersion &&
                (gpu.version < 0 || performance.now() < deadline)) {
                gl.bindBuffer(gl.ARRAY_BUFFER, gpu.buffer);
                gl.bufferData(gl.ARRAY_BUFFER, mesh.data, gl.STATIC_DRAW);
                for (let i = 0; i < 3; i++) {
                    gl.enableVertexAttribArray(i);
                    gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 40, i * 12);
                }
                gl.enableVertexAttribArray(3);
                gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 40, 36);
                gpu.count = mesh.data.length / 10;
                gpu.version = body.geometryVersion;
            }
        }
    }
}
function drawRubble(renderer) {
    renderer.bind(renderer.sectionProgram, renderer.viewVP, renderer.sim.camera);
    const gl = renderer.gl;
    for (const [body, gpu] of renderer.gpuSections) {
        if (!body.voxels.length || !(0, frustum_1.insideFrustum)(renderer.cameraPlanes, (0, rubble_shape_1.rubbleBounds)(body)))
            continue;
        const bounds = (0, rubble_shape_1.rubbleBounds)(body), cam = renderer.sim.camera;
        if (Math.hypot(Math.max(bounds.min.x - cam.x, 0, cam.x - bounds.max.x), Math.max(bounds.min.z - cam.z, 0, cam.z - bounds.max.z)) > renderer.sim.settings.distance)
            continue;
        gl.bindVertexArray(gpu.vao);
        gl.uniform3f(renderer.sectionProgram.extra.uMaterialOrigin, body.materialOrigin.x, body.materialOrigin.y, body.materialOrigin.z);
        const x = (0, rubble_shape_1.turnSection)(body, { x: 1, y: 0, z: 0 }), y = (0, rubble_shape_1.turnSection)(body, { x: 0, y: 1, z: 0 }), z = (0, rubble_shape_1.turnSection)(body, { x: 0, y: 0, z: 1 });
        const centre = body.centre, offset = (0, rubble_shape_1.turnSection)(body, centre);
        const model = new Float32Array([
            x.x,
            x.y,
            x.z,
            0,
            y.x,
            y.y,
            y.z,
            0,
            z.x,
            z.y,
            z.z,
            0,
            body.x + centre.x - offset.x,
            body.y + centre.y - offset.y,
            body.z + centre.z - offset.z,
            1,
        ]);
        gl.uniformMatrix4fv(renderer.sectionProgram.model, false, model);
        gl.drawArrays(gl.TRIANGLES, 0, gpu.count);
    }
}

},
"src/rendering/dust.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DustUniforms = void 0;
/** Cosmetic dust has a fixed GPU cost and never changes AI perception. */
class DustUniforms {
    spheres = new Float32Array(16);
    fade = new Float32Array(4);
    count = 0;
    update(clouds, eye) {
        const nearest = clouds
            .filter((d) => d.life > 0 && Math.hypot(d.x - eye.x, d.y - eye.y, d.z - eye.z) < 100)
            .sort((a, b) => Math.hypot(a.x - eye.x, a.y - eye.y, a.z - eye.z) -
            Math.hypot(b.x - eye.x, b.y - eye.y, b.z - eye.z))
            .slice(0, 4);
        this.count = nearest.length;
        for (let n = 0; n < this.count; n++) {
            const d = nearest[n], age = 1 - d.life / d.max;
            this.spheres.set([d.x, d.y, d.z, d.radius], n * 4);
            this.fade[n] = Math.max(0, Math.min(1, age * 7) * (1 - age) * d.strength);
        }
    }
    bind(gl, program) {
        gl.uniform1i(program.extra.uDustCount, this.count);
        if (!this.count)
            return;
        gl.uniform4fv(program.extra['uDust[0]'], this.spheres);
        gl.uniform1fv(program.extra['uDustFade[0]'], this.fade);
    }
}
exports.DustUniforms = DustUniforms;

},
"src/rendering/entity-models.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderWeapon = renderWeapon;
exports.renderSoldier = renderSoldier;
exports.renderVehicle = renderVehicle;
const configModule = require("../core/config");
const loadout_1 = require("../core/loadout");
const mathModule = require("../core/math");
const frustum_1 = require("./frustum");
const viewmodelModule = require("./viewmodel");
function renderWeapon(vp, cam) {
    if (!this.sim.acceptsInput ||
        this.sim.player.vehicle ||
        ((0, loadout_1.scoped)(this.sim) && this.sim.aimAmount > 0.72))
        return;
    vp = mathModule.matrix(cam, this.viewWidth / this.viewHeight, viewmodelModule.viewmodelFov, 0.02);
    this.viewVP = vp;
    const profile = viewmodelModule.viewmodels[this.sim.weaponIndex];
    this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
    const f = mathModule.direction(cam.yaw, cam.pitch), r = { x: Math.cos(cam.yaw), y: 0, z: -Math.sin(cam.yaw) }, u = {
        x: -Math.sin(cam.yaw) * Math.sin(cam.pitch),
        y: Math.cos(cam.pitch),
        z: -Math.cos(cam.yaw) * Math.sin(cam.pitch),
    };
    const bob = this.sim.player.onGround && this.sim.settings.motion
        ? Math.sin(this.sim.player.walk * 2.2) * 0.012 * (1 - this.sim.aimAmount * 0.85)
        : 0, reloading = this.sim.reloadTime > 0
        ? Math.sin((this.sim.reloadTime /
            (configModule.weapons[this.sim.weaponIndex].reload *
                this.sim.weaponTuning[this.sim.weaponIndex].reload)) *
            Math.PI)
        : 0;
    const gun = (x, y, z, sx, sy, sz, c) => {
        const p = viewmodelModule.viewmodelPoint({ x, y, z }, profile, this.sim.aimAmount, reloading, Math.max(0, this.sim.fireTime) / configModule.weapons[this.sim.weaponIndex].delay, bob - this.sim.handling.sprint * 0.08);
        x = p.x;
        y = p.y;
        z = p.z;
        this.box(cam.x + r.x * x + u.x * y + f.x * z, cam.y + u.y * y + f.y * z, cam.z + r.z * x + u.z * y + f.z * z, sx * profile.scale, sy * profile.scale, sz * profile.scale, c, cam.yaw, cam.pitch - reloading * profile.reloadTilt, 0, 0, c === skin ? 0 : 12);
    };
    const metal = [0.2, 0.26, 0.28], dark = [0.12, 0.16, 0.19], skin = [0.55, 0.43, 0.32];
    if (this.sim.weaponIndex >= 4) {
        const revolver = this.sim.weaponIndex === 5, machine = this.sim.weaponIndex === 6;
        gun(0, 0.015, 0.45, 0.09, 0.12, machine ? 0.35 : 0.25, revolver ? [0.48, 0.51, 0.5] : metal);
        gun(0, -0.105, 0.34, 0.085, 0.23, 0.12, dark);
        gun(0, -0.075, 0.46, 0.045, 0.07, 0.1, dark);
        gun(0, 0.025, 0.64, revolver ? 0.048 : 0.068, 0.065, revolver ? 0.29 : machine ? 0.17 : 0.07, dark);
        if (revolver)
            gun(0, 0.0, 0.48, 0.12, 0.12, 0.14, [0.34, 0.38, 0.37]);
        if (machine)
            gun(0, -0.095, 0.57, 0.07, 0.19, 0.1, dark);
        // Split rear notch, not a solid rectangle across the aim ray.
        gun(-0.03, 0.1, 0.34, 0.022, 0.037, 0.035, metal);
        gun(0.03, 0.1, 0.34, 0.022, 0.037, 0.035, metal);
        gun(0, 0.08, 0.65, 0.014, 0.027, 0.021, [0.76, 0.81, 0.69]);
        gun(-0.047, -0.105, 0.33, 0.1, 0.15, 0.13, skin);
        gun(0.04, -0.14, 0.35, 0.1, 0.13, 0.12, skin);
    }
    else if (this.sim.weaponIndex === 2) {
        gun(0, 0, 0.56, 0.16, 0.16, 0.68, [0.35, 0.4, 0.25]);
        gun(0, 0.02, 0.95, 0.24, 0.24, 0.12, dark);
        gun(-0.11, -0.1, 0.65, 0.12, 0.17, 0.2, skin);
        gun(0, 0, 0.23, 0.21, 0.21, 0.08, dark);
        gun(0, -0.13, 0.42, 0.07, 0.19, 0.09, dark);
        gun(-0.1, 0.1, 0.67, 0.035, 0.13, 0.09, metal);
        gun(-0.1, 0.16, 0.67, 0.05, 0.03, 0.15, dark);
        gun(0, 0.085, 0.76, 0.17, 0.025, 0.045, metal);
    }
    else {
        gun(0, 0, 0.5, 0.12, 0.14, 0.44, metal);
        gun(0, 0.015, 0.86, 0.053, 0.06, 0.42, dark);
        gun(0, -0.09, 0.39, 0.08, 0.23, 0.13, dark);
        gun(0, -0.09, 0.59, 0.08, 0.23, 0.12, metal);
        gun(-0.068, 0.17, 0.58, 0.017, 0.13, 0.04, dark);
        gun(0.068, 0.17, 0.58, 0.017, 0.13, 0.04, dark);
        gun(0, 0.236, 0.58, 0.15, 0.015, 0.04, dark);
        gun(0, 0.103, 0.58, 0.15, 0.015, 0.04, dark);
        gun(0, 0.077, 0.93, 0.018, 0.03, 0.025, dark);
        gun(-0.06, -0.035, 0.72, 0.11, 0.12, 0.2, skin);
        gun(0.025, -0.16, 0.37, 0.13, 0.15, 0.17, skin);
        if (this.sim.weaponIndex === 1)
            gun(-0.07, -0.09, 0.58, 0.16, 0.17, 0.2, [0.33, 0.37, 0.24]);
        for (let k = 0; k < 6; k++)
            gun(0, 0.078, 0.48 + k * 0.038, 0.11, 0.018, 0.016, dark);
        gun(0.061, 0.015, 0.45, 0.016, 0.04, 0.08, [0.4, 0.44, 0.43]);
        gun(0, 0.007, 1.08, 0.071, 0.074, 0.055, metal);
        if (this.sim.weaponIndex === 3) {
            gun(0, 0.15, 0.56, 0.085, 0.085, 0.23, dark);
            gun(0, 0.15, 0.434, 0.07, 0.07, 0.013, [0.32, 0.58, 0.65]);
        }
    }
    this.noFog = true;
    this.drawBoxes(vp, cam);
    this.noFog = false;
}
function renderSoldier(a) {
    a = this.sim.presentation.interpolate(a, this.sim.renderAlpha);
    const c = a.team === 0 ? configModule.blue : configModule.orange, uniform = a.team === 0 ? [0.27, 0.36, 0.35] : [0.43, 0.36, 0.27];
    const distance = mathModule.dist2(a, this.sim.camera);
    if ((!this.shadowPass && distance > this.sim.settings.distance ** 2) ||
        !(0, frustum_1.insideFrustum)(this.shadowPass ? this.shadowPlanes : this.cameraPlanes, {
            min: { x: a.x - 1.3, y: a.y, z: a.z - 1.3 },
            max: { x: a.x + 1.3, y: a.y + 2.5, z: a.z + 1.3 },
        }))
        return;
    const crouch = a.crouched, head = crouch ? 1.02 : 1.57, torso = crouch ? 0.73 : 1.02;
    const moving = Math.hypot(a.vx, a.vz) > 0.3, swing = moving ? Math.sin(a.walk * 2.6) * (crouch ? 0.15 : 0.38) : 0;
    const armour = a.team === 0 ? [0.2, 0.28, 0.29] : [0.31, 0.29, 0.22], dark = [0.14, 0.18, 0.19];
    if (distance > 8100) {
        this.box(a.x, a.y + (crouch ? 0.55 : 0.8), a.z, 0.49, crouch ? 0.91 : 1.4, 0.36, uniform, a.yaw);
        this.box(a.x, a.y + head, a.z, 0.36, 0.32, 0.36, c, a.yaw);
        return;
    }
    this.part(a, 0, torso, 0, 0.53, 0.55, 0.32, uniform, a.yaw, 0, 18);
    this.part(a, 0, torso + 0.02, 0.19, 0.43, 0.43, 0.08, armour);
    this.part(a, 0, head, 0.035, 0.31, 0.3, 0.29, [0.68, 0.55, 0.41]);
    this.part(a, 0, head + 0.145, 0, 0.39, 0.15, 0.38, c);
    this.part(a, 0, head + 0.015, 0.188, 0.29, 0.055, 0.035, [0.17, 0.24, 0.26]);
    for (const side of [-1, 1]) {
        if (crouch) {
            this.part(a, side * 0.15, 0.39, 0.12, 0.21, 0.35, 0.27, uniform, a.yaw, side * 0.28);
            this.part(a, side * 0.15, 0.16, 0.11 + side * 0.11, 0.2, 0.28, 0.23, uniform);
        }
        else
            this.part(a, side * 0.15, 0.36, -side * swing * 0.22, 0.21, 0.69, 0.24, uniform, a.yaw, side * swing);
        this.part(a, side * 0.15, 0.085, crouch ? 0.18 : -side * swing * 0.15 + 0.05, 0.23, 0.17, 0.32, dark);
        this.part(a, side * 0.31, torso + 0.05, 0.15, 0.17, 0.4, 0.19, uniform, a.yaw, -0.72);
        this.part(a, side * 0.12, torso - 0.1, 0.255, 0.11, 0.18, 0.08, armour);
    }
    const launcher = a.activeWeapon === 2, sidearm = a.activeWeapon >= 4;
    this.part(a, 0.18, torso + 0.16, 0.42, launcher ? 0.16 : 0.09, launcher ? 0.16 : 0.11, launcher ? 0.87 : sidearm ? 0.3 : a.kit === 'recon' ? 0.92 : 0.72, dark);
    this.part(a, 0.18, torso + 0.2, sidearm ? 0.59 : 0.82, launcher ? 0.22 : 0.05, launcher ? 0.22 : 0.05, 0.13, armour);
    this.part(a, 0, torso + 0.02, -0.25, 0.39, 0.44, a.kit === 'support' ? 0.25 : 0.17, armour);
    if (a.kit === 'medic') {
        this.part(a, 0, torso + 0.05, -0.349, 0.16, 0.055, 0.014, [0.86, 0.88, 0.82]);
        this.part(a, 0, torso + 0.05, -0.351, 0.055, 0.16, 0.014, [0.86, 0.88, 0.82]);
    }
    if (a.kit === 'engineer')
        this.part(a, -0.32, torso - 0.17, -0.17, 0.065, 0.32, 0.07, [0.62, 0.58, 0.39]);
    if (a.kit === 'engineer' && !launcher && a.rockets > 0)
        this.part(a, -0.28, torso + 0.12, -0.32, 0.14, 0.82, 0.14, [0.28, 0.34, 0.23]);
    if (a.actionUntil > this.sim.simTime && a.action.startsWith('DEPLOY'))
        this.part(a, 0.18, torso - 0.1, 0.4, 0.3, 0.24, 0.25, [0.37, 0.44, 0.35]);
    if (a.shield > 0)
        this.part(a, 0, head + 0.42, 0, 0.085, 0.085, 0.085, c);
}
function renderVehicle(v) {
    v = this.sim.presentation.interpolate(v, this.sim.renderAlpha);
    if (!v.alive ||
        (!this.shadowPass && mathModule.dist2(v, this.sim.camera) > this.sim.settings.distance ** 2) ||
        !(0, frustum_1.insideFrustum)(this.shadowPass ? this.shadowPlanes : this.cameraPlanes, {
            min: { x: v.x - 3.5, y: v.y, z: v.z - 3.5 },
            max: { x: v.x + 3.5, y: v.y + 3, z: v.z + 3.5 },
        }))
        return;
    const c = v.team === 0 ? [0.28, 0.4, 0.43] : [0.48, 0.36, 0.25];
    this.part(v, 0, 0.78, 0, 2.65, 1, 3.7, c);
    this.part(v, -1.32, 0.42, 0, 0.42, 0.7, 3.9, [0.16, 0.19, 0.2]);
    this.part(v, 1.32, 0.42, 0, 0.42, 0.7, 3.9, [0.16, 0.19, 0.2]);
    this.box(v.x, v.y + 1.58, v.z, 1.8, 0.65, 1.85, c, v.turret);
    const d = mathModule.direction(v.turret, v.pitch);
    this.box(v.x + d.x * 1.85, v.y + 1.78 + d.y * 1.85, v.z + d.z * 1.85, 0.22, 0.22, 2.6, [0.19, 0.25, 0.26], v.turret, v.pitch);
    this.part(v, 0, 1.32, -1.1, 1.4, 0.09, 0.5, v.team === 0 ? configModule.blue : configModule.orange);
    for (const side of [-1, 1])
        for (let j = -1; j <= 1; j++)
            this.part(v, side * 1.54, 0.42, j * 1.25, 0.08, 0.5, 0.65, [0.3, 0.32, 0.3]);
}

},
"src/rendering/frustum.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.frustumPlanes = frustumPlanes;
exports.insideFrustum = insideFrustum;
/** Extract clip planes once per frame, then test the positive AABB vertex. */
function frustumPlanes(matrix) {
    const result = new Float32Array(24);
    for (let axis = 0; axis < 3; axis++)
        for (let side = 0; side < 2; side++) {
            const sign = side ? -1 : 1, at = (axis * 2 + side) * 4;
            for (let i = 0; i < 4; i++)
                result[at + i] = matrix[i * 4 + 3] + sign * matrix[i * 4 + axis];
        }
    return result;
}
function insideFrustum(planes, b) {
    for (let i = 0; i < 24; i += 4) {
        const x = planes[i] >= 0 ? b.max.x : b.min.x, y = planes[i + 1] >= 0 ? b.max.y : b.min.y, z = planes[i + 2] >= 0 ? b.max.z : b.min.z;
        if (planes[i] * x + planes[i + 1] * y + planes[i + 2] * z + planes[i + 3] < 0)
            return false;
    }
    return true;
}

},
"src/rendering/material-textures.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MATERIAL_LAYERS = void 0;
exports.createMaterialTexture = createMaterialTexture;
/** Deterministic, offline material atlas. R stores albedo variation, A roughness.
 * No image decoding, fetch, random simulation state, or third-party assets. */
exports.MATERIAL_LAYERS = 19;
function createMaterialTexture(gl) {
    const size = 128, data = new Uint8Array(size * size * exports.MATERIAL_LAYERS * 4);
    const rand = (x, y, m) => {
        let h = Math.imul(x + 271, 374761393) ^ Math.imul(y + 151, 668265263) ^ Math.imul(m + 7, 1274126177);
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
    };
    for (let m = 0; m < exports.MATERIAL_LAYERS; m++)
        for (let y = 0; y < size; y++)
            for (let x = 0; x < size; x++) {
                const u = x / size, v = y / size, grain = rand(x, y, m), coarse = rand(x >> 3, y >> 3, m);
                let value = 0.59 + (grain - 0.5) * 0.055, rough = 0.86;
                if (m === 1 || m === 4 || m === 15) {
                    // Cast concrete: fine aggregate, formwork seams and isolated pores.
                    value += (coarse - 0.5) * 0.032;
                    if (x < 2 || y < 2)
                        value -= 0.055;
                    if (grain < 0.018)
                        value -= 0.13;
                    if (y === 4 && x % 32 < 3)
                        value -= 0.075;
                }
                else if (m === 5) {
                    const row = Math.floor(v * 4), bx = (u * 2 + (row % 2) * 0.5) % 1, by = (v * 4) % 1;
                    const mortar = bx < 0.038 || by < 0.055;
                    value = mortar
                        ? 0.39
                        : 0.56 +
                            (rand(Math.floor(u * 2 + (row % 2) * 0.5), row, m) - 0.5) * 0.16 +
                            (grain - 0.5) * 0.055;
                    if (!mortar && (bx < 0.07 || by > 0.93))
                        value -= 0.055;
                }
                else if (m === 6) {
                    const plank = Math.floor(u * 4), seam = (u * 4) % 1;
                    value =
                        0.57 +
                            (rand(plank, 0, m) - 0.5) * 0.1 +
                            Math.sin(u * 220 + Math.sin(v * 9) * 1.2) * 0.027 +
                            (grain - 0.5) * 0.03;
                    if (seam < 0.028)
                        value = 0.29;
                    rough = 0.78;
                }
                else if (m === 8) {
                    value = 0.57 + (grain - 0.5) * 0.16 + (coarse - 0.5) * 0.02;
                    if (grain > 0.978)
                        value += 0.16;
                    rough = 0.96;
                }
                else if (m === 9) {
                    const row = Math.floor(v * 3), xx = (u * 2 + (row % 2) * 0.5) % 1, yy = (v * 3) % 1;
                    value =
                        0.48 + 0.13 * Math.sin(xx * Math.PI) * Math.sin(yy * Math.PI) + (grain - 0.5) * 0.045;
                    if (x % 3 === 0 || y % 3 === 0)
                        value -= 0.022;
                }
                else if (m === 10 || m === 12 || m === 13) {
                    value = 0.59 + (grain - 0.5) * 0.022;
                    rough = m === 12 ? 0.36 : 0.56;
                    if (x < 2 || y < 2)
                        value -= 0.095;
                    const dx = Math.min(Math.abs(x - 7), Math.abs(x - 120)), dy = Math.min(Math.abs(y - 7), Math.abs(y - 120));
                    if (dx * dx + dy * dy < 6)
                        value = 0.39;
                    if (m === 10)
                        value += Math.cos(u * Math.PI * 32) * 0.045;
                }
                else if (m === 11 || m === 16) {
                    value = 0.62;
                    rough = 0.14;
                    if (x < 3 || y < 3)
                        value = 0.3;
                    else if (x < 5 || y < 5)
                        value = 0.8;
                    value += (1 - v) * 0.055;
                }
                else if (m === 2 || m === 3 || m === 7) {
                    value = 0.56 + (grain - 0.5) * 0.15 + (coarse - 0.5) * 0.11;
                    if (m === 3)
                        value += Math.sin((u + v) * 160) * 0.025;
                }
                else if (m === 14) {
                    value = 0.61 + (grain - 0.5) * 0.03;
                    rough = 0.73;
                }
                else if (m === 17) {
                    value = 0.61;
                    rough = 0.2;
                }
                if (m === 18) {
                    value = 0.57 + (coarse - 0.5) * 0.18 + (grain - 0.5) * 0.04;
                    if ((x + y) % 4 === 0)
                        value -= 0.06;
                    rough = 0.96;
                }
                const i = ((m * size + y) * size + x) * 4, c = Math.max(0, Math.min(255, Math.round(value * 255)));
                data[i] = data[i + 1] = data[i + 2] = c;
                data[i + 3] = Math.round(rough * 255);
            }
    const t = gl.createTexture();
    if (!t)
        throw Error('Unable to allocate material textures');
    try {
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, t);
        gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGBA8, size, size, exports.MATERIAL_LAYERS, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
        const ext = gl.getExtension('EXT_texture_filter_anisotropic');
        if (ext)
            gl.texParameterf(gl.TEXTURE_2D_ARRAY, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(4, gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
        return t;
    }
    catch (error) {
        gl.deleteTexture(t);
        throw error;
    }
}

},
"src/rendering/materials.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.materialResponse = void 0;
exports.fracturePalette = fracturePalette;
/** Cut interiors are deliberately matte and lighter than weathered exterior surfaces. */
exports.materialResponse = {
    4: { fracture: [0.64, 0.62, 0.57], shadow: 0.68 },
    5: { fracture: [0.64, 0.46, 0.38], shadow: 0.67 },
    6: { fracture: [0.65, 0.49, 0.31], shadow: 0.72 },
    8: { fracture: [0.35, 0.36, 0.37], shadow: 0.74 },
    11: { fracture: [0.54, 0.7, 0.75], shadow: 0.82 },
    12: { fracture: [0.48, 0.51, 0.52], shadow: 0.74 },
};
function fracturePalette(colours) {
    const palette = [...colours];
    for (let m = 1; m < colours.length; m++)
        palette[m + 32] = exports.materialResponse[m]?.fracture ?? [
            Math.min(1, colours[m][0] * 1.1),
            Math.min(1, colours[m][1] * 1.1),
            Math.min(1, colours[m][2] * 1.1),
        ];
    return palette;
}

},
"src/rendering/optics.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawOptics = drawOptics;
exports.drawDeployables = drawDeployables;
exports.tracerSegment = tracerSegment;
const loadout_1 = require("../core/loadout");
/** Reticle geometry overlays the magnified projection, never a zoomed screenshot. */
function drawOptics(r) {
    const s = r.sim, ctx = r.ctx, w = r.viewWidth, h = r.viewHeight, x = w / 2, y = h / 2;
    if (!s.acceptsInput || s.player.vehicle || s.aimAmount < 0.55)
        return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, (s.aimAmount - 0.55) / 0.4);
    if ((0, loadout_1.scoped)(s)) {
        const radius = Math.min(w * 0.32, h * 0.365);
        ctx.fillStyle = '#060a0dfa';
        ctx.beginPath();
        ctx.rect(0, 0, w, h);
        ctx.arc(x, y, radius, 0, Math.PI * 2, true);
        ctx.fill('evenodd');
        ctx.strokeStyle = '#131a1fe6';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(x, y, radius + 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#9eaaa966';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, radius - 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = '#121a1dee';
        ctx.lineWidth = 1.2;
        for (const axis of [0, 1]) {
            ctx.beginPath();
            for (const side of [-1, 1]) {
                const inner = 8 * side, outer = (radius - 14) * side;
                if (!axis) {
                    ctx.moveTo(x + inner, y);
                    ctx.lineTo(x + outer, y);
                }
                else {
                    ctx.moveTo(x, y + inner);
                    ctx.lineTo(x, y + outer);
                }
            }
            ctx.stroke();
        }
        const unit = radius / 9;
        for (let i = 1; i <= 7; i++)
            for (const sign of [-1, 1]) {
                ctx.beginPath();
                ctx.moveTo(x + i * unit * sign, y - 3);
                ctx.lineTo(x + i * unit * sign, y + 3);
                ctx.moveTo(x - 3, y + i * unit * sign);
                ctx.lineTo(x + 3, y + i * unit * sign);
                ctx.stroke();
            }
        ctx.fillStyle = '#dd644b';
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = r.theme.ink;
        ctx.font = '11px ui-monospace,monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${(0, loadout_1.zoomFor)(s)}×${s.weaponIndex === 3 ? '  ·  X / ZOOM' : ''}`, x, Math.min(h - 18, y + radius + 24));
    }
    else {
        ctx.strokeStyle = '#151d22cc';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 3.2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ed7153';
        ctx.beginPath();
        ctx.arc(x, y, 1.65, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}
function drawDeployables(r) {
    for (const d of r.sim.deployables) {
        if (Math.hypot(d.x - r.sim.camera.x, d.z - r.sim.camera.z) > 150)
            continue;
        const colour = d.kind === 'medical' ? [0.3, 0.43, 0.38] : [0.3, 0.34, 0.28];
        r.box(d.x, d.y + 0.22, d.z, 0.6, 0.38, 0.44, colour, 0, 0, 0, 0, 12);
        r.box(d.x, d.y + 0.435, d.z, 0.26, 0.05, 0.08, [0.13, 0.18, 0.17]);
        if (d.kind === 'medical') {
            r.box(d.x, d.y + 0.23, d.z + 0.23, 0.25, 0.045, 0.014, [0.86, 0.91, 0.82]);
            r.box(d.x, d.y + 0.23, d.z + 0.235, 0.045, 0.25, 0.014, [0.86, 0.91, 0.82]);
        }
        else
            for (const side of [-1, 1])
                r.box(d.x + side * 0.21, d.y + 0.42, d.z, 0.065, 0.03, 0.46, [0.7, 0.6, 0.37]);
    }
}
function tracerSegment(t) {
    const dx = t.b.x - t.a.x, dy = t.b.y - t.a.y, dz = t.b.z - t.a.z, length = Math.hypot(dx, dy, dz);
    if (length < 0.1 || t.life <= 0)
        return null;
    const phase = Math.min(1, Math.max(0, 1 - t.life / (t.maxLife ?? 0.11)));
    const head = Math.min(length, 1.2 + phase * (length + 4)), tail = Math.max(0, head - 2.8);
    if (tail >= head)
        return null;
    const mid = ((head + tail) * 0.5) / length;
    return {
        x: t.a.x + dx * mid,
        y: t.a.y + dy * mid,
        z: t.a.z + dz * mid,
        length: head - tail,
        yaw: Math.atan2(dx, dz),
        pitch: Math.atan2(dy, Math.hypot(dx, dz)),
        fade: Math.min(1, t.life / 0.035),
    };
}

},
"src/rendering/renderer.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Renderer = void 0;
const config_1 = require("../core/config");
const hud_layout_1 = require("../ui/hud-layout");
const theme_1 = require("../ui/theme");
const allocation_scope_1 = require("./allocation-scope");
const dust_1 = require("./dust");
const scene = require("./scene");
const shaders_1 = require("./shaders");
const showcase_lighting_1 = require("./showcase-lighting");
const smoke_1 = require("./smoke");
class Renderer {
    sim;
    canvas;
    hud;
    theme = (0, theme_1.canvasTheme)();
    hudState;
    gl;
    ctx;
    mini;
    miniCtx;
    terrainProgram;
    boxProgram;
    sectionProgram;
    gpuSections = new Map();
    boxVAO;
    cubeBuffer;
    instanceBuffer;
    lighting;
    smoke = new smoke_1.SmokeUniforms();
    dust = new dust_1.DustUniforms();
    cameraPlanes = new Float32Array(24);
    shadowPlanes = new Float32Array(24);
    noFog = false;
    shadowPass = false;
    instanceData = new Float32Array(16000 * 14);
    instanceCount = 0;
    layout = (0, hud_layout_1.hudLayout)(1280, 720);
    viewWidth = 1;
    viewHeight = 1;
    dpr = 1;
    lastMini = -Infinity;
    roundEpoch = -1;
    resetRound() {
        this.roundEpoch = this.sim.roundEpoch;
        this.lastMini = -Infinity;
        this.resolutionScale = 1;
        this.perfTime = this.perfFrames = 0;
        this.lighting.clock = 1;
        this.lighting.setPreset(this.lighting.preset);
    }
    quality = 0.85;
    resolutionScale = 1;
    perfTime = 0;
    perfFrames = 0;
    displayFPS = 60;
    lastCombatVP = new Float32Array(16);
    skyTime = 0;
    gpuChunks = new Map();
    viewVP = new Float32Array(16);
    disposed = false;
    constructor(sim, canvas, hud) {
        this.sim = sim;
        this.canvas = canvas;
        this.hud = hud;
        const gl = canvas.getContext('webgl2', {
            alpha: false,
            antialias: false,
            powerPreference: 'high-performance',
        }), ctx = hud.getContext('2d');
        if (!gl || !ctx)
            throw Error('WebGL 2 is unavailable. Enable hardware acceleration and reload.');
        this.gl = gl;
        this.ctx = ctx;
        this.mini = document.createElement('canvas');
        this.mini.width = config_1.W;
        this.mini.height = config_1.D;
        const miniCtx = this.mini.getContext('2d');
        if (!miniCtx)
            throw Error('Unable to initialize tactical map');
        this.miniCtx = miniCtx;
        const allocations = new allocation_scope_1.AllocationScope();
        try {
            this.terrainProgram = allocations.keep(this.program(shaders_1.staticVertex), (p) => gl.deleteProgram(p.p), 'Terrain shader allocation failed');
            this.boxProgram = allocations.keep(this.program(shaders_1.instanceVertex), (p) => gl.deleteProgram(p.p), 'Instance shader allocation failed');
            this.sectionProgram = allocations.keep(this.program(shaders_1.sectionVertex), (p) => gl.deleteProgram(p.p), 'Section shader allocation failed');
            const vao = allocations.keep(gl.createVertexArray(), (p) => gl.deleteVertexArray(p), 'Unable to allocate vertex array'), cubeBuffer = allocations.keep(gl.createBuffer(), (p) => gl.deleteBuffer(p), 'Unable to allocate cube buffer'), instanceBuffer = allocations.keep(gl.createBuffer(), (p) => gl.deleteBuffer(p), 'Unable to allocate instance buffer');
            if (!vao || !cubeBuffer || !instanceBuffer)
                throw Error('Unable to allocate graphics buffers');
            this.boxVAO = vao;
            this.cubeBuffer = cubeBuffer;
            this.instanceBuffer = instanceBuffer;
            gl.bindVertexArray(vao);
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
            const cube = [];
            for (const [n, c] of shaders_1.faces)
                for (const i of shaders_1.tri)
                    cube.push(c[i][0] - 0.5, c[i][1] - 0.5, c[i][2] - 0.5, ...n);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube), gl.STATIC_DRAW);
            for (let i = 0; i < 2; i++) {
                gl.enableVertexAttribArray(i);
                gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 24, i * 12);
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.instanceData.byteLength, gl.DYNAMIC_DRAW);
            for (const [a, n, o] of [
                [2, 3, 6],
                [3, 3, 0],
                [4, 3, 3],
                [5, 3, 9],
                [6, 1, 12],
                [7, 1, 13],
            ]) {
                gl.enableVertexAttribArray(a);
                gl.vertexAttribPointer(a, n, gl.FLOAT, false, 56, o * 4);
                gl.vertexAttribDivisor(a, 1);
            }
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.frontFace(gl.CW);
            gl.clearColor(...sim.world.sky, 1);
            this.lighting = allocations.keep(new showcase_lighting_1.ShowcaseLighting(this), (p) => p.dispose(), 'Lighting allocation failed');
            this.resize();
            allocations.commit();
        }
        catch (error) {
            allocations.dispose();
            throw error;
        }
    }
    program(vertex, fragmentSource = shaders_1.fragment) {
        const gl = this.gl, p = gl.createProgram();
        if (!p)
            throw Error('Unable to allocate shader program');
        try {
            for (const [type, source] of [
                [gl.VERTEX_SHADER, vertex],
                [gl.FRAGMENT_SHADER, fragmentSource],
            ]) {
                const s = gl.createShader(type);
                if (!s)
                    throw Error('Unable to allocate shader');
                gl.shaderSource(s, source);
                gl.compileShader(s);
                if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                    const message = gl.getShaderInfoLog(s);
                    gl.deleteShader(s);
                    throw Error(message || 'Shader compilation failed');
                }
                gl.attachShader(p, s);
                gl.deleteShader(s);
            }
            gl.linkProgram(p);
            if (!gl.getProgramParameter(p, gl.LINK_STATUS))
                throw Error(gl.getProgramInfoLog(p) || 'Shader linking failed');
            return {
                p,
                extra: Object.fromEntries([
                    'uSun',
                    'uSunTint',
                    'uAmbient',
                    'uDirect',
                    'uTime',
                    'uTextures',
                    'uShadows',
                    'uLight',
                    'uShadow',
                    'uMaterials',
                    'uNoFog',
                    'uForward',
                    'uRight',
                    'uUp',
                    'uAspect',
                    'uTan',
                    'uClouds',
                    'uSmokeCount',
                    'uSmoke[0]',
                    'uSmokeFade[0]',
                    'uMaterialOrigin',
                    'uDustCount',
                    'uDust[0]',
                    'uDustFade[0]',
                ].map((n) => [n, gl.getUniformLocation(p, n)])),
                vp: gl.getUniformLocation(p, 'uVP'),
                eye: gl.getUniformLocation(p, 'uEye'),
                sky: gl.getUniformLocation(p, 'uSky'),
                distance: gl.getUniformLocation(p, 'uDistance'),
                exposure: gl.getUniformLocation(p, 'uExposure'),
                model: gl.getUniformLocation(p, 'uModel'),
            };
        }
        catch (e) {
            gl.deleteProgram(p);
            throw e;
        }
    }
    drawChunk(c) {
        const gl = this.gl;
        let gpu = this.gpuChunks.get(c);
        if (!gpu) {
            const vao = gl.createVertexArray(), buffer = gl.createBuffer();
            if (!vao || !buffer) {
                if (vao)
                    gl.deleteVertexArray(vao);
                if (buffer)
                    gl.deleteBuffer(buffer);
                throw Error('Unable to allocate terrain buffer');
            }
            gpu = { vao, buffer, version: -1 };
            this.gpuChunks.set(c, gpu);
        }
        gl.bindVertexArray(gpu.vao);
        if (gpu.version !== c.version) {
            gl.bindBuffer(gl.ARRAY_BUFFER, gpu.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, c.mesh, gl.STATIC_DRAW);
            for (let i = 0; i < 3; i++) {
                gl.enableVertexAttribArray(i);
                gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 40, i * 12);
            }
            gl.enableVertexAttribArray(3);
            gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 40, 36);
            gpu.version = c.version;
        }
        gl.drawArrays(gl.TRIANGLES, 0, c.count);
    }
    dispose() {
        if (this.disposed)
            return;
        this.disposed = true;
        this.lighting.dispose();
        const gl = this.gl;
        for (const { vao, buffer } of this.gpuChunks.values()) {
            gl.deleteVertexArray(vao);
            gl.deleteBuffer(buffer);
        }
        this.gpuChunks.clear();
        for (const { vao, buffer } of this.gpuSections.values()) {
            gl.deleteVertexArray(vao);
            gl.deleteBuffer(buffer);
        }
        this.gpuSections.clear();
        gl.deleteProgram(this.sectionProgram.p);
        gl.deleteVertexArray(this.boxVAO);
        gl.deleteBuffer(this.cubeBuffer);
        gl.deleteBuffer(this.instanceBuffer);
        gl.deleteProgram(this.terrainProgram.p);
        gl.deleteProgram(this.boxProgram.p);
    }
    renderWeapon = scene.renderWeapon;
    drawBoxes = scene.drawBoxes;
    bind = scene.bind;
    box = scene.box;
    part = scene.part;
    renderSoldier = scene.renderSoldier;
    renderVehicle = scene.renderVehicle;
    project = scene.project;
    drawCombatHUD = scene.drawCombatHUD;
    drawHUD = scene.drawHUD;
    drawMinimap = scene.drawMinimap;
    render = scene.render;
    adaptiveResolution = scene.adaptiveResolution;
    resize = scene.resize;
}
exports.Renderer = Renderer;

},
"src/rendering/scene.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderVehicle = exports.renderSoldier = exports.project = exports.drawMinimap = exports.drawHUD = exports.drawCombatHUD = exports.renderWeapon = void 0;
exports.drawBoxes = drawBoxes;
exports.bind = bind;
exports.box = box;
exports.part = part;
exports.render = render;
exports.adaptiveResolution = adaptiveResolution;
exports.resize = resize;
const configModule = require("../core/config");
const loadout_1 = require("../core/loadout");
const mathModule = require("../core/math");
const hud_layoutModule = require("../ui/hud-layout");
const contact_shadowsModule = require("./contact-shadows");
const destructionModule = require("./destruction");
const frustum_1 = require("./frustum");
const optics_1 = require("./optics");
var entity_models_1 = require("./entity-models");
Object.defineProperty(exports, "renderWeapon", { enumerable: true, get: function () { return entity_models_1.renderWeapon; } });
function drawBoxes(vp, cam) {
    this.bind(this.boxProgram, vp, cam);
    this.gl.bindVertexArray(this.boxVAO);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.instanceBuffer);
    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.instanceData.subarray(0, this.instanceCount * 14));
    this.gl.drawArraysInstanced(this.gl.TRIANGLES, 0, 36, this.instanceCount);
    this.instanceCount = 0;
}
function bind(p, vp, cam) {
    this.gl.useProgram(p.p);
    this.gl.uniformMatrix4fv(p.vp, false, vp);
    this.gl.uniform3f(p.eye, cam.x, cam.y, cam.z);
    this.gl.uniform3fv(p.sky, this.sim.world.sky);
    this.gl.uniform1f(p.distance, this.sim.settings.distance);
    this.gl.uniform1f(p.exposure, this.sim.settings.brightness);
    this.lighting.bind(p);
}
function box(x, y, z, sx, sy, sz, c, yaw = 0, pitch = 0, glow = 0, roll = 0, material = 0) {
    if (this.instanceCount >= 16000) {
        if (this.shadowPass)
            this.lighting.flushShadowBoxes();
        else
            this.drawBoxes(this.viewVP, this.sim.camera);
    }
    let i = this.instanceCount++ * 14;
    const data = this.instanceData;
    data[i++] = x;
    data[i++] = y;
    data[i++] = z;
    data[i++] = sx;
    data[i++] = sy;
    data[i++] = sz;
    data[i++] = c[0];
    data[i++] = c[1];
    data[i++] = c[2];
    data[i++] = yaw;
    data[i++] = pitch;
    data[i++] = roll;
    data[i++] = glow;
    data[i] = material;
}
function part(a, lx, ly, lz, sx, sy, sz, c, angle = a.yaw, p = 0, material = 0) {
    const s = Math.sin(a.yaw), co = Math.cos(a.yaw);
    this.box(a.x + co * lx + s * lz, a.y + ly, a.z - s * lx + co * lz, sx, sy, sz, c, angle, p, 0, 0, material);
}
var canvas_hud_1 = require("./canvas-hud");
Object.defineProperty(exports, "drawCombatHUD", { enumerable: true, get: function () { return canvas_hud_1.drawCombatHUD; } });
Object.defineProperty(exports, "drawHUD", { enumerable: true, get: function () { return canvas_hud_1.drawHUD; } });
Object.defineProperty(exports, "drawMinimap", { enumerable: true, get: function () { return canvas_hud_1.drawMinimap; } });
Object.defineProperty(exports, "project", { enumerable: true, get: function () { return canvas_hud_1.project; } });
var entity_models_2 = require("./entity-models");
Object.defineProperty(exports, "renderSoldier", { enumerable: true, get: function () { return entity_models_2.renderSoldier; } });
Object.defineProperty(exports, "renderVehicle", { enumerable: true, get: function () { return entity_models_2.renderVehicle; } });
function render(dt) {
    this.sim.world.rebuildPending(3, this.sim.camera);
    if (this.roundEpoch !== this.sim.roundEpoch)
        this.resetRound();
    if (this.sim.started && this.sim.menuState !== 'home') {
        const pose = this.sim.presentation.interpolate(this.sim.player, this.sim.renderAlpha);
        const y = pose.y +
            (this.sim.player.vehicle ? 1.3 : this.sim.player.crouched ? 1.08 : 1.57) +
            (this.sim.player.alive ? 0 : 2);
        this.sim.camera.x = pose.x;
        this.sim.camera.z = pose.z;
        this.sim.camera.y = mathModule.lerp(this.sim.camera.y, y, 1 - Math.exp(-dt * 18));
        this.sim.camera.yaw = this.sim.yaw;
        this.sim.camera.pitch = mathModule.clamp(this.sim.pitch + this.sim.handling.recoil, -1.4, 1.4);
    }
    else {
        this.skyTime += dt * 0.035;
        this.sim.camera.x = 256 + Math.sin(this.skyTime) * 210;
        this.sim.camera.z = 256 + Math.cos(this.skyTime) * 210;
        this.sim.camera.y = 115;
        this.sim.camera.yaw = Math.atan2(256 - this.sim.camera.x, 256 - this.sim.camera.z);
        this.sim.camera.pitch = -0.32;
    }
    const cam = {
        ...this.sim.camera,
        y: this.sim.camera.y - (this.sim.settings.motion ? this.sim.handling.land : 0),
        yaw: this.sim.camera.yaw +
            Math.sin(this.sim.simTime * 57) * this.sim.shake * (this.sim.settings.motion ? 0.02 : 0),
        pitch: this.sim.camera.pitch +
            Math.cos(this.sim.simTime * 43) * this.sim.shake * (this.sim.settings.motion ? 0.02 : 0),
    }, fov = (0, loadout_1.cameraFov)(this.sim), vp = mathModule.matrix(cam, this.viewWidth / this.viewHeight, fov);
    this.viewVP = vp;
    this.smoke.update(this.sim.smokeClouds);
    this.dust.update(this.sim.dust, cam);
    const planes = (0, frustum_1.frustumPlanes)(vp);
    this.cameraPlanes = planes;
    destructionModule.prepareRubble(this);
    this.lighting.renderShadows(cam, dt);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.lighting.drawSky(cam, fov);
    this.bind(this.terrainProgram, vp, cam);
    for (const c of this.sim.world.chunks) {
        const dx = c.x * configModule.CS + 8 - cam.x, dz = c.z * configModule.CS + 8 - cam.z;
        if (Math.hypot(dx, dz) > this.sim.settings.distance + 12 ||
            !(0, frustum_1.insideFrustum)(planes, {
                min: { x: c.x * configModule.CS, y: 0, z: c.z * configModule.CS },
                max: { x: (c.x + 1) * configModule.CS, y: c.top + 1, z: (c.z + 1) * configModule.CS },
            }))
            continue;
        this.drawChunk(c);
    }
    this.box(256, 1.7, 256, 14, 0.08, 512, [0.26, 0.45, 0.52], 0, 0, 0, 0, 17);
    for (const b of this.sim.world.buildings) {
        if (Math.hypot(b.lift.x - cam.x, b.lift.z - cam.z) > 90)
            continue;
        this.box(b.lift.x, 5.4, b.lift.z, 0.3, 0.75, 0.22, [0.9, 0.67, 0.25], 0, 0, 1);
    }
    for (const f of this.sim.world.flags) {
        const y = this.sim.world.groundAt(f.x, f.z);
        this.box(f.x, y + 3, f.z, 0.12, 6, 0.12, [0.62, 0.64, 0.6]);
        this.box(f.x + 0.9, y + 5, f.z, 1.8, 1, 0.08, f.owner === 0 ? configModule.blue : f.owner === 1 ? configModule.orange : [0.7, 0.7, 0.6], Math.sin(this.sim.simTime * 2) * 0.08);
    }
    for (const flag of this.sim.world.flags) {
        if (mathModule.dist2(flag, cam) > 45000 &&
            flag !== this.sim.world.flags[this.sim.handling.objective])
            continue;
        const ringColour = flag.contested
            ? [0.95, 0.77, 0.35]
            : flag.owner === 0
                ? configModule.blue
                : flag.owner === 1
                    ? configModule.orange
                    : [0.82, 0.83, 0.72];
        for (let i = 0; i < 20; i++) {
            const angle = (i * mathModule.TAU) / 20, x = flag.x + Math.sin(angle) * 24, z = flag.z + Math.cos(angle) * 24;
            this.box(x, this.sim.world.groundAt(x, z) + 0.045, z, 0.14, 0.08, 2.6, ringColour, angle + Math.PI / 2, 0, 0.3);
        }
    }
    contact_shadowsModule.drawContactShadows(this);
    (0, optics_1.drawDeployables)(this);
    for (const a of this.sim.actors) {
        if (a.alive && !a.player && !a.vehicle)
            this.renderSoldier(a);
        else if (!a.alive &&
            (a.reviveUntil ?? 0) > this.sim.simTime &&
            mathModule.dist2(a, cam) < 9000) {
            this.box(a.x, a.y + 0.2, a.z, 0.52, 0.3, 1.1, a.team === 0 ? [0.24, 0.34, 0.35] : [0.42, 0.34, 0.25], a.yaw);
            this.part(a, 0, 0.21, 0.66, 0.31, 0.28, 0.31, [0.67, 0.53, 0.4]);
        }
    }
    for (const v of this.sim.vehicles)
        this.renderVehicle(v);
    destructionModule.drawRubble(this);
    for (const p of this.sim.particles)
        if (mathModule.dist2(p, cam) < 40000)
            this.box(p.x, p.y, p.z, p.size, p.size, p.size, p.c, p.yaw, p.pitch);
    for (const p of this.sim.projectiles)
        this.box(p.x, p.y, p.z, 0.14, 0.14, 0.5, [1, 0.73, 0.27], Math.atan2(p.vx, p.vz), Math.atan2(p.vy, Math.hypot(p.vx, p.vz)), 1);
    for (const t of this.sim.tracers) {
        const segment = (0, optics_1.tracerSegment)(t);
        if (segment)
            this.box(segment.x, segment.y, segment.z, 0.012, 0.012, segment.length, [0.93, 0.77, 0.48], segment.yaw, segment.pitch, segment.fade);
    }
    for (const p of this.sim.flashes) {
        const s = Math.max(0.05, p.r * (1 - p.life / 0.4) * 1.2);
        this.box(p.x, p.y, p.z, s, s, s, [1, 0.58, 0.19], this.sim.simTime, this.sim.simTime * 0.5, 1);
    }
    this.drawBoxes(vp, cam);
    if (this.sim.playing)
        this.renderWeapon(vp, cam);
    this.lastCombatVP = vp;
    if (this.sim.started && this.sim.menuState !== 'home')
        this.drawHUD(vp);
    else
        this.ctx.clearRect(0, 0, this.hud.width, this.hud.height);
    if (this.sim.started) {
        if (this.sim.world.mapDirty && this.sim.simTime - this.lastMini > 5) {
            this.lastMini = this.sim.simTime;
            this.drawMinimap();
        }
    }
}
function adaptiveResolution(dt) {
    this.perfTime += dt;
    this.perfFrames++;
    if (this.perfTime < 3)
        return;
    this.displayFPS = Math.round(this.perfFrames / this.perfTime);
    if (this.sim.settings.adaptive && this.sim.playing) {
        const old = this.resolutionScale;
        if (this.displayFPS < 40)
            this.resolutionScale = Math.max(0.6, this.resolutionScale - 0.08);
        else if (this.displayFPS > 57)
            this.resolutionScale = Math.min(1, this.resolutionScale + 0.04);
        if (old !== this.resolutionScale)
            this.resize();
    }
    this.perfTime = this.perfFrames = 0;
}
function resize() {
    this.viewWidth = Math.max(1, this.canvas.clientWidth || innerWidth);
    this.viewHeight = Math.max(1, this.canvas.clientHeight || innerHeight);
    const hudElement = document.getElementById('gameHUD');
    const safeStyle = hudElement ? window.getComputedStyle(hudElement) : undefined;
    const inset = Math.max(16, ...['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'].map((key) => Number.parseFloat(safeStyle?.[key] ?? '') || 0));
    this.layout = hud_layoutModule.hudLayout(this.viewWidth, this.viewHeight, this.sim.touch, inset, this.sim.settings.hudScale, document.body.dataset.hudPanel ?? '');
    hud_layoutModule.applyHudLayout(this.layout);
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    const scale = Math.min(this.dpr, this.sim.settings.quality * (this.sim.settings.adaptive ? this.resolutionScale : 1));
    this.canvas.width = Math.round(this.viewWidth * scale);
    this.canvas.height = Math.round(this.viewHeight * scale);
    this.hud.width = Math.round(this.viewWidth * this.dpr);
    this.hud.height = Math.round(this.viewHeight * this.dpr);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
}

},
"src/rendering/shaders.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tri = exports.faces = exports.skyFragment = exports.skyVertex = exports.depthFragment = exports.instanceVertex = exports.sectionVertex = exports.staticVertex = exports.fragment = void 0;
/** Optical depth uses the same growing spheres and fade as simulation perception. */
const smokeGLSL = `
uniform int uDustCount;uniform vec4 uDust[4];uniform float uDustFade[4];
uniform int uSmokeCount;uniform vec4 uSmoke[12];uniform float uSmokeFade[12];
vec3 smokeColour(vec3 colour,vec3 origin,vec3 end){
 vec3 delta=end-origin;float len=length(delta);if(len<.0001||(uSmokeCount==0&&uDustCount==0))return colour;
 vec3 dir=delta/len;float depth=0.0;
 for(int i=0;i<12;i++){if(i>=uSmokeCount)break;vec3 offset=uSmoke[i].xyz-origin;
  float t=dot(offset,dir);float rr=uSmoke[i].w*uSmoke[i].w-dot(offset,offset)+t*t;
  if(rr<=0.0)continue;float halfChord=sqrt(rr);
  depth+=max(0.0,min(len,t+halfChord)-max(0.0,t-halfChord))*uSmokeFade[i];
 }
 colour=mix(colour,vec3(.64,.69,.68),1.0-exp(-depth*1.1));
 float dustDepth=0.0;
 for(int i=0;i<4;i++){if(i>=uDustCount)break;vec3 offset=uDust[i].xyz-origin;
  float t=dot(offset,dir);float rr=uDust[i].w*uDust[i].w-dot(offset,offset)+t*t;
  if(rr<=0.0)continue;float halfChord=sqrt(rr);
  dustDepth+=max(0.0,min(len,t+halfChord)-max(0.0,t-halfChord))*uDustFade[i];
 }
 return mix(colour,vec3(.58,.54,.46),min(.38,1.0-exp(-dustDepth*.12)));
}`;
exports.fragment = `#version 300 es
precision highp float;
precision highp sampler2DArray;
in vec3 vColour;in vec3 vWorld;in vec3 vNormal;in vec3 vSurface;in vec3 vSurfaceNormal;in float vGlow;flat in float vMaterial;
uniform vec3 uEye,uSky,uSun,uSunTint;uniform float uDistance,uExposure,uTime,uTextures,uShadows,uAmbient,uDirect,uNoFog;
uniform mat4 uLight;uniform sampler2D uShadow;uniform sampler2DArray uMaterials;out vec4 outColour;
${smokeGLSL}
float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
vec3 skyColour(vec3 ray){float h=clamp(ray.y*.65+.35,0.0,1.0);return mix(uSky,vec3(.30,.53,.74),pow(h,1.3));}
float shadow(vec3 n){
 if(uShadows<.5)return 1.0;
 vec4 ls=uLight*vec4(vWorld,1.0);vec3 p=ls.xyz/ls.w*.5+.5;
 if(any(lessThan(p,vec3(.001)))||any(greaterThan(p,vec3(.999))))return 1.0;
 float bias=max(.00022,.00095*(1.0-max(dot(n,uSun),0.0))),s=0.0;vec2 t=1.0/vec2(textureSize(uShadow,0));
 for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)s+=p.z-bias<=texture(uShadow,p.xy+vec2(float(x),float(y))*t).r?1.0:0.0;
 float fade=smoothstep(.01,.10,min(min(p.x,p.y),min(1.0-p.x,1.0-p.y)));
 return mix(1.0,s/9.0,fade);
}
void main(){
 vec3 n=normalize(vNormal),base=max(vColour,vec3(0.0)),localN=normalize(vSurfaceNormal);
 float mat=mod(vMaterial,32.0);bool broken=vMaterial>31.5;
 vec2 uv=abs(localN.y)>.6?vSurface.xz:abs(localN.x)>.6?vSurface.zy:vSurface.xy;
 float scale=mat==5.0?1.0:mat==6.0?.65:mat==11.0||mat==16.0?.5:mat==8.0?1.25:.5;
 vec4 tex=texture(uMaterials,vec3(uv*scale,clamp(mat,0.0,18.0)));
 float roughness=tex.a;float shade=mix(1.0,tex.r*1.7,uTextures*step(.5,mat));base*=shade;
 // Local/rest coordinates keep cracks and patterns attached to moving chunks.
 if(broken){float crack=abs(sin(uv.x*11.0+sin(uv.y*9.0)*1.7));base*=.91+.09*hash(floor(vSurface*9.0));base*=1.0-(1.0-smoothstep(.02-fwidth(crack),.085+fwidth(crack),crack))*.23;}
 if(mat==4.0||mat==5.0)base*=.90+.14*hash(floor(vSurface/24.0));
 vec3 viewDir=normalize(uEye-vWorld);
 bool glass=mat==11.0||mat==16.0;bool water=mat==17.0;
 if(water){n=normalize(n+vec3(sin(vWorld.z*1.8+uTime*1.1)*.11,0.0,cos(vWorld.x*2.2-uTime*.9)*.11));roughness=.21;}
 float sunAmount=max(dot(n,uSun),0.0),sh=shadow(n);
 float hemisphere=.38+.30*max(n.y,0.0);
 float fill=max(dot(n,normalize(vec3(.75,.3,-.8))),0.0)*.24;
 vec3 linear=pow(max(base,vec3(0.0)),vec3(2.2));
 vec3 lit=linear*(vec3(.88,.97,1.09)*(hemisphere+fill)*uAmbient*mix(.78,1.0,sh)+uSunTint*sunAmount*1.38*uDirect*sh);
 float spec=pow(max(dot(n,normalize(uSun+viewDir)),0.0),mix(14.0,100.0,1.0-roughness));
 float fresnel=pow(1.0-max(dot(n,viewDir),0.0),5.0);
 if(glass||water){vec3 env=pow(skyColour(reflect(-viewDir,n)),vec3(2.2));lit=mix(lit,env,(water?.28:.24)+fresnel*.5);lit+=uSunTint*spec*sh*.75*uDirect;}
 else if(mat==12.0||mat==10.0){lit+=uSunTint*spec*sh*.10;}
 lit+=linear*clamp(vGlow,0.0,4.0)*2.8;
 vec3 colour=pow(vec3(1.0)-exp(-max(lit,vec3(0.0))*uExposure*1.35),vec3(1.0/2.2));
 float fog=smoothstep(uDistance*.42,uDistance,length(vWorld-uEye))*.93*(1.0-uNoFog);
 colour=mix(colour,uSky,fog);if(uNoFog<.5)colour=smokeColour(colour,uEye,vWorld);outColour=vec4(colour,1.0);
}`;
const outputs = `out vec3 vColour;out vec3 vWorld;out vec3 vNormal;out vec3 vSurface;out vec3 vSurfaceNormal;out float vGlow;flat out float vMaterial;`;
exports.staticVertex = `#version 300 es
precision highp float;
layout(location=0)in vec3 aPosition;layout(location=1)in vec3 aNormal;layout(location=2)in vec3 aColour;layout(location=3)in float aMaterial;
uniform mat4 uVP;${outputs}
void main(){vWorld=aPosition;vSurface=aPosition;vSurfaceNormal=aNormal;vNormal=aNormal;vColour=aColour;vGlow=0.0;vMaterial=aMaterial;gl_Position=uVP*vec4(aPosition,1.0);}`;
exports.sectionVertex = `#version 300 es
precision highp float;
layout(location=0)in vec3 aPosition;layout(location=1)in vec3 aNormal;layout(location=2)in vec3 aColour;layout(location=3)in float aMaterial;
uniform mat4 uVP,uModel;uniform vec3 uMaterialOrigin;${outputs}
void main(){vWorld=(uModel*vec4(aPosition,1.0)).xyz;vSurface=aPosition+uMaterialOrigin;vSurfaceNormal=aNormal;vNormal=mat3(uModel)*aNormal;vColour=aColour;vGlow=0.0;vMaterial=aMaterial;gl_Position=uVP*vec4(vWorld,1.0);}`;
exports.instanceVertex = `#version 300 es
precision highp float;
layout(location=0)in vec3 aPosition;layout(location=1)in vec3 aNormal;layout(location=2)in vec3 aColour;layout(location=3)in vec3 aOffset;layout(location=4)in vec3 aSize;layout(location=5)in vec3 aRotation;layout(location=6)in float aGlow;layout(location=7)in float aMaterial;
uniform mat4 uVP;${outputs}
vec3 turn(vec3 p){float c,s;if(aRotation.z!=0.0){c=cos(aRotation.z);s=sin(aRotation.z);p=vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z);}c=cos(aRotation.y);s=sin(aRotation.y);p=vec3(p.x,c*p.y+s*p.z,-s*p.y+c*p.z);c=cos(aRotation.x);s=sin(aRotation.x);return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);}
void main(){vSurface=aPosition*aSize;vSurfaceNormal=aNormal;vWorld=aOffset+turn(aPosition*aSize);vNormal=turn(aNormal);vColour=aColour;vGlow=aGlow;vMaterial=aMaterial;gl_Position=uVP*vec4(vWorld,1.0);}`;
exports.depthFragment = `#version 300 es
precision highp float;void main(){}`;
exports.skyVertex = `#version 300 es
precision highp float;out vec2 uv;void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));uv=p;gl_Position=vec4(p*2.0-1.0,1.0,1.0);}`;
exports.skyFragment = `#version 300 es
precision highp float;in vec2 uv;out vec4 outColour;
uniform vec3 uEye,uForward,uRight,uUp,uSun,uSky,uSunTint;uniform float uAspect,uTan,uTime,uClouds;
${smokeGLSL}
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.0),f.x),f.y);}
void main(){vec2 q=uv*2.0-1.0;vec3 ray=normalize(uForward+uRight*q.x*uAspect*uTan+uUp*q.y*uTan);
 vec3 c=mix(uSky,vec3(.30,.53,.74),pow(clamp(ray.y*.65+.35,0.0,1.0),1.3));
 float sun=pow(max(dot(ray,uSun),0.0),640.0);float halo=pow(max(dot(ray,uSun),0.0),24.0);
 c+=uSunTint*(sun*.65+halo*.08)*(1.0-uClouds*.7);
 if(ray.y>.04){vec2 p=ray.xz/(ray.y+.17)*2.2+vec2(uTime*.002,0);float cloud=noise(p)*.65+noise(p*2.4)*.25+noise(p*5.3)*.10;float mask=smoothstep(.51-uClouds*.2,.8-uClouds*.18,cloud)*smoothstep(.04,.28,ray.y);c=mix(c,vec3(.93,.94,.94),mask*(.55+uClouds*.3));}
 outColour=vec4(smokeColour(c,uEye,uEye+ray*620.0),1.0);}`;
exports.faces = [
    [
        [1, 0, 0],
        [
            [1, 0, 0],
            [1, 1, 0],
            [1, 1, 1],
            [1, 0, 1],
        ],
    ],
    [
        [-1, 0, 0],
        [
            [0, 0, 1],
            [0, 1, 1],
            [0, 1, 0],
            [0, 0, 0],
        ],
    ],
    [
        [0, 1, 0],
        [
            [0, 1, 1],
            [1, 1, 1],
            [1, 1, 0],
            [0, 1, 0],
        ],
    ],
    [
        [0, -1, 0],
        [
            [0, 0, 0],
            [1, 0, 0],
            [1, 0, 1],
            [0, 0, 1],
        ],
    ],
    [
        [0, 0, 1],
        [
            [1, 0, 1],
            [1, 1, 1],
            [0, 1, 1],
            [0, 0, 1],
        ],
    ],
    [
        [0, 0, -1],
        [
            [0, 0, 0],
            [0, 1, 0],
            [1, 1, 0],
            [1, 0, 0],
        ],
    ],
];
exports.tri = [0, 1, 2, 0, 2, 3];

},
"src/rendering/showcase-lighting.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowcaseLighting = exports.lightingPresets = void 0;
exports.lightMatrix = lightMatrix;
const allocation_scope_1 = require("./allocation-scope");
const frustum_1 = require("./frustum");
const configModule = require("../core/config");
const mathModule = require("../core/math");
const rubble_shapeModule = require("../simulation/rubble-shape");
const material_texturesModule = require("./material-textures");
const shadersModule = require("./shaders");
exports.lightingPresets = {
    daylight: {
        sun: [-0.48, 0.83, 0.3],
        tint: [1, 0.96, 0.87],
        sky: [0.76, 0.84, 0.9],
        ambient: 1.12,
        direct: 1,
        clouds: 0.12,
    },
    afternoon: {
        sun: [-0.64, 0.59, -0.49],
        tint: [1, 0.82, 0.6],
        sky: [0.8, 0.82, 0.84],
        ambient: 1.1,
        direct: 1.15,
        clouds: 0.23,
    },
    overcast: {
        sun: [-0.48, 0.83, 0.3],
        tint: [0.94, 0.97, 1],
        sky: [0.73, 0.79, 0.82],
        ambient: 1.45,
        direct: 0.28,
        clouds: 0.9,
    },
};
function normal(v) {
    const l = Math.hypot(...v) || 1;
    return v.map((x) => x / l);
}
function lightMatrix(centre, sun, size = 1536) {
    const z = normal(sun), x = normal([z[2], 0, -z[0]]), y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
    const eye = [centre.x + z[0] * 230, centre.y + z[1] * 230, centre.z + z[2] * 230];
    const dot = (a) => a.reduce((s, v, i) => s + v * eye[i], 0);
    const view = new Float32Array([
        x[0],
        y[0],
        z[0],
        0,
        x[1],
        y[1],
        z[1],
        0,
        x[2],
        y[2],
        z[2],
        0,
        -dot(x),
        -dot(y),
        -dot(z),
        1,
    ]);
    const extent = 115, near = 0.1, far = 480;
    const projection = new Float32Array([
        1 / extent,
        0,
        0,
        0,
        0,
        1 / extent,
        0,
        0,
        0,
        0,
        -2 / (far - near),
        0,
        0,
        0,
        -(far + near) / (far - near),
        1,
    ]);
    const matrix = mathModule.multiply(projection, view), texel = 2 / size;
    matrix[12] = Math.round(matrix[12] / texel) * texel;
    matrix[13] = Math.round(matrix[13] / texel) * texel;
    return matrix;
}
class ShowcaseLighting {
    renderer;
    textures = true;
    shadows = true;
    preset = 'daylight';
    materials;
    shadow;
    framebuffer;
    available = false;
    light = new Float32Array(16);
    clock = 1;
    geometryKey = '';
    size = 1536;
    sun = [];
    depthTerrain;
    depthBoxes;
    depthSections;
    sky;
    constructor(renderer) {
        this.renderer = renderer;
        const gl = renderer.gl;
        const allocations = new allocation_scope_1.AllocationScope();
        try {
            this.materials = allocations.keep(material_texturesModule.createMaterialTexture(gl), (p) => gl.deleteTexture(p), 'Material texture allocation failed');
            const texture = allocations.keep(gl.createTexture(), (p) => gl.deleteTexture(p), 'Unable to allocate shadow texture'), fb = allocations.keep(gl.createFramebuffer(), (p) => gl.deleteFramebuffer(p), 'Unable to allocate shadow framebuffer');
            if (!texture || !fb)
                throw Error('Unable to allocate sun shadow map');
            this.shadow = texture;
            this.framebuffer = fb;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, this.size, this.size, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, texture, 0);
            gl.drawBuffers([gl.NONE]);
            gl.readBuffer(gl.NONE);
            this.available = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            this.depthTerrain = allocations.keep(renderer.program(shadersModule.staticVertex, shadersModule.depthFragment), (p) => gl.deleteProgram(p.p), 'Unable to allocate depthTerrain program');
            this.depthBoxes = allocations.keep(renderer.program(shadersModule.instanceVertex, shadersModule.depthFragment), (p) => gl.deleteProgram(p.p), 'Unable to allocate depthBoxes program');
            this.depthSections = allocations.keep(renderer.program(shadersModule.sectionVertex, shadersModule.depthFragment), (p) => gl.deleteProgram(p.p), 'Unable to allocate depthSections program');
            this.sky = allocations.keep(renderer.program(shadersModule.skyVertex, shadersModule.skyFragment), (p) => gl.deleteProgram(p.p), 'Unable to allocate sky program');
            this.setPreset('daylight');
            allocations.commit();
        }
        catch (error) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            allocations.dispose();
            throw error;
        }
    }
    setPreset(value) {
        if (!Object.hasOwn(exports.lightingPresets, value))
            return;
        this.preset = value;
        this.sun = normal(exports.lightingPresets[value].sun);
        this.renderer.sim.world.sky = [...exports.lightingPresets[value].sky];
        this.clock = 1;
    }
    bind(p) {
        const r = this.renderer, gl = r.gl, u = p.extra, settings = exports.lightingPresets[this.preset];
        gl.uniform3fv(u.uSun, this.sun);
        gl.uniform3fv(u.uSunTint, settings.tint);
        gl.uniform1f(u.uAmbient, settings.ambient);
        gl.uniform1f(u.uDirect, settings.direct);
        gl.uniform1f(u.uTextures, +this.textures);
        gl.uniform1f(u.uShadows, +(this.shadows && this.available && !r.noFog));
        gl.uniform1f(u.uNoFog, +r.noFog);
        gl.uniform1f(u.uTime, r.sim.simTime);
        gl.uniformMatrix4fv(u.uLight, false, this.light);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.materials);
        gl.uniform1i(u.uMaterials, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.shadow);
        gl.uniform1i(u.uShadow, 1);
        r.smoke.bind(gl, p);
        r.dust.bind(gl, p);
    }
    renderShadows(cam, dt) {
        this.clock += dt;
        const geometryKey = `${this.renderer.sim.world.revision}:` +
            [...this.renderer.gpuSections].map(([b, gpu]) => `${b.id}/${gpu.version}`).join(',');
        if (!this.shadows ||
            !this.available ||
            (this.clock < 0.1 && (geometryKey === this.geometryKey || this.clock < 1 / 30)))
            return;
        this.geometryKey = geometryKey;
        this.clock = 0;
        const r = this.renderer, gl = r.gl, f = mathModule.direction(cam.yaw, 0), centre = { x: cam.x + f.x * 38, y: 22, z: cam.z + f.z * 38 };
        this.light = lightMatrix(centre, this.sun, this.size);
        r.shadowPlanes = (0, frustum_1.frustumPlanes)(this.light);
        // No texture can remain attached for sampling while it is the draw target.
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.viewport(0, 0, this.size, this.size);
        gl.enable(gl.DEPTH_TEST);
        gl.depthMask(true);
        gl.disable(gl.BLEND);
        gl.enable(gl.CULL_FACE);
        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.POLYGON_OFFSET_FILL);
        gl.polygonOffset(1.3, 2.0);
        gl.useProgram(this.depthTerrain.p);
        gl.uniformMatrix4fv(this.depthTerrain.vp, false, this.light);
        for (const c of r.sim.world.chunks)
            if (Math.hypot(c.x * configModule.CS + 8 - centre.x, c.z * configModule.CS + 8 - centre.z) < 180)
                r.drawChunk(c);
        gl.useProgram(this.depthSections.p);
        gl.uniformMatrix4fv(this.depthSections.vp, false, this.light);
        for (const [body, gpu] of r.gpuSections) {
            if (!r.sim.rubble.includes(body) ||
                !body.voxels.length ||
                gpu.version !== body.geometryVersion ||
                !(0, frustum_1.insideFrustum)(r.shadowPlanes, rubble_shapeModule.rubbleBounds(body)))
                continue;
            const a = rubble_shapeModule.turnSection(body, { x: 1, y: 0, z: 0 }), b = rubble_shapeModule.turnSection(body, { x: 0, y: 1, z: 0 }), c = rubble_shapeModule.turnSection(body, { x: 0, y: 0, z: 1 }), o = rubble_shapeModule.turnSection(body, body.centre);
            const model = new Float32Array([
                a.x,
                a.y,
                a.z,
                0,
                b.x,
                b.y,
                b.z,
                0,
                c.x,
                c.y,
                c.z,
                0,
                body.x + body.centre.x - o.x,
                body.y + body.centre.y - o.y,
                body.z + body.centre.z - o.z,
                1,
            ]);
            gl.uniformMatrix4fv(this.depthSections.model, false, model);
            gl.bindVertexArray(gpu.vao);
            gl.drawArrays(gl.TRIANGLES, 0, gpu.count);
        }
        r.shadowPass = true;
        // Reuse the exact visual poses. Crouched soldiers cast crouched shadows.
        for (const a of r.sim.actors)
            if (a.alive && !a.vehicle && Math.hypot(a.x - centre.x, a.z - centre.z) < 115)
                r.renderSoldier(a);
        for (const v of r.sim.vehicles)
            if (Math.hypot(v.x - centre.x, v.z - centre.z) < 115)
                r.renderVehicle(v);
        this.flushShadowBoxes();
        r.shadowPass = false;
        gl.disable(gl.POLYGON_OFFSET_FILL);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, r.canvas.width, r.canvas.height);
    }
    flushShadowBoxes() {
        const r = this.renderer, gl = r.gl;
        if (!r.instanceCount)
            return;
        gl.useProgram(this.depthBoxes.p);
        gl.uniformMatrix4fv(this.depthBoxes.vp, false, this.light);
        gl.bindVertexArray(r.boxVAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, r.instanceBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, r.instanceData.subarray(0, r.instanceCount * 14));
        gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, r.instanceCount);
        r.instanceCount = 0;
    }
    drawSky(cam, fov) {
        const r = this.renderer, gl = r.gl, p = this.sky, u = p.extra, f = mathModule.direction(cam.yaw, cam.pitch);
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.CULL_FACE);
        gl.depthMask(false);
        gl.useProgram(p.p);
        gl.bindVertexArray(null);
        gl.uniform3f(p.eye, cam.x, cam.y, cam.z);
        r.smoke.bind(gl, p);
        r.dust.bind(gl, p);
        gl.uniform3f(u.uForward, f.x, f.y, f.z);
        gl.uniform3f(u.uRight, Math.cos(cam.yaw), 0, -Math.sin(cam.yaw));
        gl.uniform3f(u.uUp, -Math.sin(cam.yaw) * Math.sin(cam.pitch), Math.cos(cam.pitch), -Math.cos(cam.yaw) * Math.sin(cam.pitch));
        gl.uniform3fv(u.uSun, this.sun);
        gl.uniform3fv(u.uSunTint, exports.lightingPresets[this.preset].tint);
        gl.uniform3fv(p.sky, r.sim.world.sky);
        gl.uniform1f(u.uAspect, r.viewWidth / r.viewHeight);
        gl.uniform1f(u.uTan, Math.tan(fov * 0.5));
        gl.uniform1f(u.uTime, r.sim.simTime + r.skyTime * 12);
        gl.uniform1f(u.uClouds, exports.lightingPresets[this.preset].clouds);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.depthMask(true);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
    }
    dispose() {
        const gl = this.renderer.gl;
        gl.deleteTexture(this.materials);
        gl.deleteTexture(this.shadow);
        gl.deleteFramebuffer(this.framebuffer);
        for (const p of [this.depthTerrain, this.depthBoxes, this.depthSections, this.sky])
            gl.deleteProgram(p.p);
    }
}
exports.ShowcaseLighting = ShowcaseLighting;

},
"src/rendering/smoke.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmokeUniforms = void 0;
const perception_1 = require("../simulation/perception");
/** Fixed buffers are filled once per frame and shared by sky, terrain and actors. */
class SmokeUniforms {
    spheres = new Float32Array(12 * 4);
    fade = new Float32Array(12);
    count = 0;
    update(clouds) {
        this.count = 0;
        for (const c of clouds) {
            const radius = (0, perception_1.smokeRadius)(c);
            if (radius <= 0 || this.count >= 12)
                continue;
            const n = this.count++, i = n * 4;
            this.spheres[i] = c.x;
            this.spheres[i + 1] = c.y;
            this.spheres[i + 2] = c.z;
            this.spheres[i + 3] = radius;
            this.fade[n] = Math.min(1, c.life / 2);
        }
    }
    bind(gl, program) {
        gl.uniform1i(program.extra.uSmokeCount, this.count);
        if (!this.count)
            return;
        gl.uniform4fv(program.extra['uSmoke[0]'], this.spheres);
        gl.uniform1fv(program.extra['uSmokeFade[0]'], this.fade);
    }
}
exports.SmokeUniforms = SmokeUniforms;

},
"src/rendering/viewmodel.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewmodelFov = exports.viewmodels = void 0;
exports.viewmodelPoint = viewmodelPoint;
exports.viewmodels = [
    {
        hip: { x: 0.23, y: -0.24, z: 0.05 },
        ads: { x: 0, y: -0.117, z: 0.14 },
        scale: 0.7,
        pivot: 0.4,
        reloadTilt: 0.45,
        recoil: 0.035,
    },
    {
        hip: { x: 0.25, y: -0.25, z: 0.06 },
        ads: { x: 0, y: -0.117, z: 0.16 },
        scale: 0.72,
        pivot: 0.4,
        reloadTilt: 0.5,
        recoil: 0.035,
    },
    {
        hip: { x: 0.29, y: -0.27, z: 0.12 },
        ads: { x: 0.21, y: -0.16, z: 0.16 },
        scale: 0.65,
        pivot: 0.48,
        reloadTilt: 0.55,
        recoil: 0.065,
    },
    {
        hip: { x: 0.22, y: -0.24, z: 0.04 },
        ads: { x: 0, y: -0.117, z: 0.18 },
        scale: 0.68,
        pivot: 0.4,
        reloadTilt: 0.4,
        recoil: 0.05,
    },
    {
        hip: { x: 0.19, y: -0.23, z: 0.19 },
        ads: { x: 0, y: -0.08, z: 0.23 },
        scale: 0.75,
        pivot: 0.3,
        reloadTilt: 0.65,
        recoil: 0.085,
    },
    {
        hip: { x: 0.2, y: -0.24, z: 0.16 },
        ads: { x: 0, y: -0.085, z: 0.23 },
        scale: 0.78,
        pivot: 0.3,
        reloadTilt: 0.6,
        recoil: 0.11,
    },
    {
        hip: { x: 0.21, y: -0.235, z: 0.13 },
        ads: { x: 0, y: -0.085, z: 0.23 },
        scale: 0.74,
        pivot: 0.3,
        reloadTilt: 0.6,
        recoil: 0.055,
    },
];
exports.viewmodelFov = Math.PI / 3;
/** Rotate every part centre around the same reload pivot, before camera transformation. */
function viewmodelPoint(p, profile, aim, reload, recoil, bob = 0) {
    const t = -reload * profile.reloadTilt, c = Math.cos(t), s = Math.sin(t);
    const z = p.z - profile.pivot;
    return {
        x: p.x * profile.scale + profile.hip.x + (profile.ads.x - profile.hip.x) * aim,
        y: (c * p.y + s * z) * profile.scale +
            profile.hip.y +
            (profile.ads.y - profile.hip.y) * aim -
            reload * 0.16 +
            bob,
        z: (-s * p.y + c * z + profile.pivot) * profile.scale +
            profile.hip.z +
            (profile.ads.z - profile.hip.z) * aim -
            recoil * profile.recoil,
    };
}

},
"src/simulation/actors.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVehicles = exports.respawnVehicle = exports.updatePlayer = exports.updateAI = exports.think = exports.chooseTarget = void 0;
exports.makeActor = makeActor;
exports.safeSpawn = safeSpawn;
exports.startBattle = startBattle;
exports.spatial = spatial;
exports.neighbours = neighbours;
exports.assignGoal = assignGoal;
const configModule = require("../core/config");
const loadout_1 = require("../core/loadout");
const mathModule = require("../core/math");
const scenarios_1 = require("../core/scenarios");
const gameplayModule = require("./gameplay");
const npc_stateModule = require("./npc-state");
const npc_state_1 = require("./npc-state");
const vehicle_state_1 = require("./vehicle-state");
function makeActor(id, team, isPlayer = false) {
    return {
        ...(0, loadout_1.initialEquipment)(gameplayModule.squadComposition[id % 10], this.simTime),
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
        clip: configModule.weapons[gameplayModule.squadComposition[id % 10] === 'support'
            ? 1
            : gameplayModule.squadComposition[id % 10] === 'recon'
                ? 3
                : 0].mag,
        burst: 4,
        reload: 0,
        stuck: 0,
        lastX: 0,
        lastZ: 0,
        lastHit: -100,
        vehicle: null,
    };
}
function safeSpawn(a, initial = false, position) {
    (0, vehicle_state_1.leaveVehicle)(a);
    (0, npc_state_1.retireNPC)(this, a);
    if (this.tickets[a.team] <= 0) {
        a.alive = false;
        return false;
    }
    const setup = (0, scenarios_1.scenario)(this.testArena), close = setup.id === 'frontline';
    const home = (0, scenarios_1.spawnAnchor)(setup.id, a.team, 1);
    const anchor = (0, scenarios_1.spawnAnchor)(setup.id, a.team, a.player ? this.spawnChoice : a.id % 3);
    let chosen = position ?? (!initial && !a.player ? this.leaderSpawn(a).position : null);
    for (let i = 0; i < 150 && !chosen; i++) {
        const o = i < 110 ? anchor : home, x = mathModule.clamp(o.x +
            this.world.rnd(-Math.max(setup.spawnSpread, close ? this.battleTeamSize * 0.07 : 0), Math.max(setup.spawnSpread, close ? this.battleTeamSize * 0.07 : 0)), 4, configModule.W - 4), z = mathModule.clamp(o.z + this.world.rnd(-setup.depthSpread, setup.depthSpread), 4, configModule.D - 4), y = this.world.groundAt(x, z);
        if (this.occupied(a, x, y, z, 0.34, 1.8) ||
            this.actors.some((b) => b !== a && b.alive && mathModule.dist2(b, { x, z }) < (b.team === a.team ? 0.48 : 100)))
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
    (0, loadout_1.initActorEquipment)(a, this.simTime);
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
        this.equippedSecondary = (0, loadout_1.secondaryIndex)(this.settings.secondary);
        this.scopeStep = 0;
        this.reloadTime = 0;
        this.activeKit = this.settings.loadout;
        a.kit = this.activeKit;
        (0, loadout_1.initActorEquipment)(a, this.simTime);
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
function startBattle() {
    this.cancelWork();
    this.roundEpoch++;
    for (const key of Object.keys(this.destructionStats))
        this.destructionStats[key] = 0;
    this.nextVoxelId = 1;
    this.effectSeed = (this.settings.seed ^ 0x51f15e) >>> 0;
    this.roundPractice = this.practiceInvulnerable || this.practiceSupplies;
    this.rubble.length = this.dust.length = 0;
    for (const key of Object.keys(this.testStats))
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
        for (let k = 0; k < (0, scenarios_1.scenario)(this.testArena).vehicleGates.length; k++) {
            const setup = (0, scenarios_1.scenario)(this.testArena), x = setup.vehicleHomes[team], z = setup.vehicleGates[k];
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
                team: team,
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
        if (a.player)
            this.player = a;
    }
    this.createSquads();
    for (const a of this.actors) {
        a.goal = this.squads[a.squadId]?.route ?? 4;
    }
    this.handling.objective = this.squads[this.player.squadId]?.route ?? 4;
    for (const a of this.actors)
        this.safeSpawn(a, true);
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
    this.notify(this.testArena === 'frontline'
        ? 'AEGIS COMMAND · Secure the civic centre. Hold uncontested control for 180 seconds.'
        : 'AEGIS COMMAND · Advance from West Base. Secure sectors and hold the map advantage for 180 seconds.');
}
function spatial() {
    for (const b of this.buckets)
        b.length = 0;
    for (const a of this.actors)
        if (a.alive && !a.vehicle) {
            const i = mathModule.clamp(Math.floor(a.z / 8), 0, configModule.SD - 1) * configModule.SW +
                mathModule.clamp(Math.floor(a.x / 8), 0, configModule.SW - 1);
            this.buckets[i].push(a);
        }
}
function neighbours(x, z, r, visit) {
    const x0 = mathModule.clamp(Math.floor((x - r) / 8), 0, configModule.SW - 1), x1 = mathModule.clamp(Math.floor((x + r) / 8), 0, configModule.SW - 1), z0 = mathModule.clamp(Math.floor((z - r) / 8), 0, configModule.SD - 1), z1 = mathModule.clamp(Math.floor((z + r) / 8), 0, configModule.SD - 1);
    for (let zz = z0; zz <= z1; zz++)
        for (let xx = x0; xx <= x1; xx++)
            for (const a of this.buckets[zz * configModule.SW + xx])
                visit(a);
}
var npc_1 = require("./npc");
Object.defineProperty(exports, "chooseTarget", { enumerable: true, get: function () { return npc_1.chooseTarget; } });
Object.defineProperty(exports, "think", { enumerable: true, get: function () { return npc_1.think; } });
Object.defineProperty(exports, "updateAI", { enumerable: true, get: function () { return npc_1.updateAI; } });
var player_1 = require("./player");
Object.defineProperty(exports, "updatePlayer", { enumerable: true, get: function () { return player_1.updatePlayer; } });
var vehicles_1 = require("./vehicles");
Object.defineProperty(exports, "respawnVehicle", { enumerable: true, get: function () { return vehicles_1.respawnVehicle; } });
Object.defineProperty(exports, "updateVehicles", { enumerable: true, get: function () { return vehicles_1.updateVehicles; } });
function assignGoal(a, goal) {
    if (a.goal === goal)
        return;
    a.goal = goal;
}

},
"src/simulation/body-contact-query.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bodyContactQuery = bodyContactQuery;
exports.bodyPoseKey = bodyPoseKey;
const collision_geometry_1 = require("./collision-geometry");
const section_tree_1 = require("./section-tree");
const swept = (b, d) => ({
    min: {
        x: b.min.x + Math.min(0, d.x),
        y: b.min.y + Math.min(0, d.y),
        z: b.min.z + Math.min(0, d.z),
    },
    max: {
        x: b.max.x + Math.max(0, d.x),
        y: b.max.y + Math.max(0, d.y),
        z: b.max.z + Math.max(0, d.z),
    },
});
/** Exact greedy compound geometry with dual BVH traversal. Unlike a voxel-pair hash grid,
 * intact floors are single boxes and disconnected pieces remain separate. Both traversal
 * and geometry preparation resume without losing work when a frame budget expires. */
function* bodyContactQuery(body, other, delta, supportOnly = false, limit = Infinity) {
    yield* (0, collision_geometry_1.prepareCollisionBoxes)(body);
    yield* (0, collision_geometry_1.prepareCollisionBoxes)(other);
    const rootA = (0, collision_geometry_1.collisionRoot)(body), rootB = (0, collision_geometry_1.collisionRoot)(other), contacts = [];
    if (!rootA || !rootB)
        return contacts;
    const stack = [[rootA, rootB]], aBounds = new Map(), bBounds = new Map();
    const boxesA = new Map(), boxesB = new Map();
    const bounds = (b, n, map, moving = false) => {
        let v = map.get(n);
        if (!v) {
            v = (0, section_tree_1.rotatedBounds)(b, n.min, n.max);
            if (moving)
                v = swept(v, delta);
            map.set(n, v);
        }
        return v;
    };
    const box = (b, local, map) => {
        let result = map.get(local);
        if (!result) {
            result = (0, collision_geometry_1.orientedBox)(b, local.min, local.max, b, local.index);
            map.set(local, result);
        }
        return result;
    };
    const extent = (n) => n.max.x - n.min.x + (n.max.y - n.min.y) + (n.max.z - n.min.z);
    let work = 0;
    while (stack.length) {
        const [a, b] = stack.pop();
        if (++work % 24 === 0)
            yield;
        if (!(0, section_tree_1.intersects)(bounds(body, a, aBounds, true), bounds(other, b, bBounds)))
            continue;
        if (a.boxes && b.boxes) {
            for (const ai of a.boxes)
                for (const bi of b.boxes) {
                    if (++work % 16 === 0)
                        yield;
                    const first = box(body, ai, boxesA), second = box(other, bi, boxesB);
                    if (!(0, section_tree_1.intersects)(swept(first.bounds, delta), second.bounds))
                        continue;
                    const contact = (0, collision_geometry_1.sweepObb)(first, second, delta);
                    if (contact && (!supportOnly || contact.normal.y > 0.6)) {
                        contact.body = other;
                        contacts.push(contact);
                        if (contacts.length >= limit)
                            return contacts;
                    }
                }
        }
        else if (a.left && (!b.left || extent(a) >= extent(b))) {
            stack.push([a.left, b], [a.right, b]);
        }
        else if (b.left)
            stack.push([a, b.left], [a, b.right]);
    }
    return contacts;
}
function bodyPoseKey(b) {
    return [
        b.geometryVersion,
        b.x,
        b.y,
        b.z,
        b.orientation.x,
        b.orientation.y,
        b.orientation.z,
        b.orientation.w,
    ].join(',');
}

},
"src/simulation/bonds.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bondLevel = exports.bondKey = void 0;
exports.bondCost = bondCost;
exports.depositWork = depositWork;
const material_physics_1 = require("../core/material-physics");
const bondKey = (a, b) => (a < b ? `${a}:${b}` : `${b}:${a}`);
exports.bondKey = bondKey;
function bondCost(a, b) {
    const x = (0, material_physics_1.physicsMaterial)(a.material).toughness, y = (0, material_physics_1.physicsMaterial)(b.material).toughness;
    const mixed = (2 * x * y) / Math.max(1e-8, x + y);
    return Math.max(0.01, 12 *
        mixed *
        (a.grain === b.grain ? 1.15 : 0.85) *
        (0.9 + (0.2 * (0, material_physics_1.hash)((a.id ?? 0) ^ (b.id ?? 0))) / 4294967295));
}
/** Returns actual paid work; five-bit damage never stores the accumulated energy. */
function depositWork(work, a, b, energy) {
    if (!(energy > 0) || !Number.isFinite(energy))
        return 0;
    const key = (0, exports.bondKey)(a.id, b.id), cost = bondCost(a, b), old = work.get(key) ?? 0, paid = Math.min(energy, Math.max(0, cost - old));
    if (paid > 0)
        work.set(key, old + paid);
    return paid;
}
const bondLevel = (work, a, b) => Math.min(31, Math.floor(((work.get((0, exports.bondKey)(a.id, b.id)) ?? 0) / bondCost(a, b)) * 31 + 1e-6));
exports.bondLevel = bondLevel;

},
"src/simulation/collision-geometry.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.axisBox = void 0;
exports.orientedBox = orientedBox;
exports.sweepObb = sweepObb;
exports.buildCollisionTree = buildCollisionTree;
exports.collisionRoot = collisionRoot;
exports.collisionBoxCount = collisionBoxCount;
exports.prepareCollisionBoxes = prepareCollisionBoxes;
exports.visitCollisionBoxes = visitCollisionBoxes;
exports.segmentBox = segmentBox;
exports.collisionBoxes = collisionBoxes;
exports.shareCollisionGeometry = shareCollisionGeometry;
const rotation_1 = require("./rotation");
const section_tree_1 = require("./section-tree");
const unit = [
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: 0, z: 1 },
];
const basis = rotation_1.rotationAxes;
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
function orientedBox(b, min, max, position = b, index = 0) {
    const offset = (0, rotation_1.rotate)(b.orientation, {
        x: (min.x + max.x) / 2 - b.centre.x,
        y: (min.y + max.y) / 2 - b.centre.y,
        z: (min.z + max.z) / 2 - b.centre.z,
    });
    return {
        centre: {
            x: position.x + b.centre.x + offset.x,
            y: position.y + b.centre.y + offset.y,
            z: position.z + b.centre.z + offset.z,
        },
        half: { x: (max.x - min.x) / 2, y: (max.y - min.y) / 2, z: (max.z - min.z) / 2 },
        axes: basis(b),
        bounds: (0, section_tree_1.rotatedBounds)(b, min, max, position),
        index,
    };
}
const axisBox = (bounds) => ({
    centre: {
        x: (bounds.min.x + bounds.max.x) / 2,
        y: (bounds.min.y + bounds.max.y) / 2,
        z: (bounds.min.z + bounds.max.z) / 2,
    },
    half: {
        x: (bounds.max.x - bounds.min.x) / 2,
        y: (bounds.max.y - bounds.min.y) / 2,
        z: (bounds.max.z - bounds.min.z) / 2,
    },
    axes: unit,
    bounds,
    index: 0,
});
exports.axisBox = axisBox;
const projections = new WeakMap();
function projectionAxes(a, b) {
    let cache = projections.get(a);
    if (!cache) {
        cache = new WeakMap();
        projections.set(a, cache);
    }
    let result = cache.get(b);
    if (result)
        return result;
    const axes = [...a, ...b];
    for (const x of a)
        for (const y of b) {
            const n = { x: x.y * y.z - x.z * y.y, y: x.z * y.x - x.x * y.z, z: x.x * y.y - x.y * y.x }, length = Math.hypot(n.x, n.y, n.z);
            if (length > 1e-7)
                axes.push({ x: n.x / length, y: n.y / length, z: n.z / length });
        }
    result = axes.map((normal) => ({
        normal,
        a: {
            x: Math.abs(dot(a[0], normal)),
            y: Math.abs(dot(a[1], normal)),
            z: Math.abs(dot(a[2], normal)),
        },
        b: {
            x: Math.abs(dot(b[0], normal)),
            y: Math.abs(dot(b[1], normal)),
            z: Math.abs(dot(b[2], normal)),
        },
    }));
    cache.set(b, result);
    return result;
}
/** Continuous SAT under translation. Projection axes are shared by all boxes of a rigid pose. */
function sweepObb(a, b, delta) {
    const axes = projectionAxes(a.axes, b.axes);
    const offset = {
        x: a.centre.x - b.centre.x,
        y: a.centre.y - b.centre.y,
        z: a.centre.z - b.centre.z,
    };
    let enter = 0, exit = 1, depth = Infinity, normal = { x: 0, y: 1, z: 0 }, entryNormal = normal, overlap = true;
    for (const axis of axes) {
        const n = axis.normal;
        const r = dot(axis.a, a.half) + dot(axis.b, b.half), p = dot(offset, n), v = dot(delta, n), penetration = r - Math.abs(p);
        if (penetration <= 0)
            overlap = false;
        if (penetration < depth) {
            depth = penetration;
            const sign = p >= 0 ? 1 : -1;
            normal = { x: n.x * sign, y: n.y * sign, z: n.z * sign };
        }
        if (Math.abs(v) < 1e-10) {
            if (Math.abs(p) >= r)
                return null;
            continue;
        }
        const t1 = (-r - p) / v, t2 = (r - p) / v, near = Math.min(t1, t2), far = Math.max(t1, t2);
        if (near > enter) {
            enter = near;
            const sign = v > 0 ? -1 : 1;
            entryNormal = { x: n.x * sign, y: n.y * sign, z: n.z * sign };
        }
        exit = Math.min(exit, far);
        if (enter > exit)
            return null;
    }
    if (!overlap && (enter < 0 || enter > 1 || exit < 0))
        return null;
    if (!overlap)
        normal = entryNormal;
    const fraction = overlap ? 0 : enter;
    const minX = Math.max(a.bounds.min.x + delta.x * fraction, b.bounds.min.x), maxX = Math.min(a.bounds.max.x + delta.x * fraction, b.bounds.max.x), minZ = Math.max(a.bounds.min.z + delta.z * fraction, b.bounds.min.z), maxZ = Math.min(a.bounds.max.z + delta.z * fraction, b.bounds.max.z);
    const point = {
        x: (minX + maxX) / 2,
        y: (Math.max(a.bounds.min.y + delta.y * fraction, b.bounds.min.y) +
            Math.min(a.bounds.max.y + delta.y * fraction, b.bounds.max.y)) /
            2,
        z: (minZ + maxZ) / 2,
    };
    return {
        point,
        normal,
        fraction,
        penetration: overlap ? Math.max(0, depth) : 0,
        minX,
        maxX,
        minZ,
        maxZ,
    };
}
const compounds = new WeakMap();
function* buildCollisionTree(boxes) {
    const min = { x: Infinity, y: Infinity, z: Infinity }, max = { x: -Infinity, y: -Infinity, z: -Infinity };
    let work = 0;
    for (const box of boxes) {
        for (const axis of ['x', 'y', 'z']) {
            min[axis] = Math.min(min[axis], box.min[axis]);
            max[axis] = Math.max(max[axis], box.max[axis]);
        }
        if (++work % 128 === 0)
            yield;
    }
    const node = { min, max };
    if (boxes.length <= 8) {
        node.boxes = boxes;
        return node;
    }
    const axis = ['x', 'y', 'z'].reduce((a, b) => max[b] - min[b] > max[a] - min[a] ? b : a);
    boxes.sort((a, b) => a.min[axis] + a.max[axis] - b.min[axis] - b.max[axis]);
    const middle = boxes.length >> 1;
    yield;
    node.left = yield* buildCollisionTree(boxes.slice(0, middle));
    node.right = yield* buildCollisionTree(boxes.slice(middle));
    return node;
}
function collisionRoot(b) {
    const c = compounds.get(b);
    return c?.version === b.geometryVersion ? c.root : undefined;
}
function collisionBoxCount(b) {
    const c = compounds.get(b);
    return c?.version === b.geometryVersion ? c.boxes.length : 0;
}
function* prepareCollisionBoxes(b) {
    if (compounds.get(b)?.version === b.geometryVersion)
        return;
    const version = b.geometryVersion, remaining = new Map(), stride = b.width * b.height, key = (x, y, z) => x + b.width * y + stride * z;
    let work = 0;
    for (let i = 0; i < b.voxels.length; i++) {
        const v = b.voxels[i];
        remaining.set(key(v.x, v.y, v.z), i);
        if (++work % 128 === 0)
            yield;
    }
    const boxes = [];
    for (let i = 0; i < b.voxels.length; i++) {
        const v = b.voxels[i];
        if (!remaining.has(key(v.x, v.y, v.z)))
            continue;
        let w = 1, h = 1, d = 1;
        while (v.x + w < b.width && remaining.has(key(v.x + w, v.y, v.z)))
            w++;
        row: while (v.y + h < b.height) {
            for (let x = 0; x < w; x++)
                if (!remaining.has(key(v.x + x, v.y + h, v.z)))
                    break row;
            h++;
        }
        plane: while (v.z + d < b.depth) {
            for (let y = 0; y < h; y++)
                for (let x = 0; x < w; x++)
                    if (!remaining.has(key(v.x + x, v.y + y, v.z + d)))
                        break plane;
            d++;
        }
        for (let z = 0; z < d; z++)
            for (let y = 0; y < h; y++)
                for (let x = 0; x < w; x++) {
                    remaining.delete(key(v.x + x, v.y + y, v.z + z));
                    if (++work % 128 === 0)
                        yield;
                }
        boxes.push({
            min: { x: v.x + 0.01, y: v.y + 0.01, z: v.z + 0.01 },
            max: { x: v.x + w - 0.01, y: v.y + h - 0.01, z: v.z + d - 0.01 },
            index: i,
        });
    }
    const root = boxes.length ? yield* buildCollisionTree([...boxes]) : undefined;
    if (version === b.geometryVersion)
        compounds.set(b, { version, boxes, root });
}
function visitCollisionBoxes(b, accept, visit, position = b) {
    const cached = compounds.get(b);
    if (cached?.version === b.geometryVersion && cached.boxes) {
        for (const box of cached.boxes) {
            const bounds = (0, section_tree_1.rotatedBounds)(b, box.min, box.max, position);
            if (accept(bounds) && visit(orientedBox(b, box.min, box.max, position, box.index)) === false)
                break;
        }
        return;
    }
    (0, section_tree_1.visitSection)(b, accept, (index) => {
        const v = b.voxels[index];
        return visit(orientedBox(b, { x: v.x + 0.01, y: v.y + 0.01, z: v.z + 0.01 }, { x: v.x + 0.99, y: v.y + 0.99, z: v.z + 0.99 }, position, index));
    }, position);
}
function segmentBox(origin, direction, length, box, radius = 0) {
    let enter = 0, exit = length, normal = { x: 0, y: 1, z: 0 };
    const r = { x: origin.x - box.centre.x, y: origin.y - box.centre.y, z: origin.z - box.centre.z };
    for (let i = 0; i < 3; i++) {
        const n = box.axes[i], p = dot(r, n), v = dot(direction, n), h = box.half[['x', 'y', 'z'][i]] + radius;
        if (Math.abs(v) < 1e-10) {
            if (Math.abs(p) > h)
                return null;
            continue;
        }
        const t1 = (-h - p) / v, t2 = (h - p) / v, near = Math.min(t1, t2);
        if (near > enter) {
            enter = near;
            normal = { x: n.x * (v > 0 ? -1 : 1), y: n.y * (v > 0 ? -1 : 1), z: n.z * (v > 0 ? -1 : 1) };
        }
        exit = Math.min(exit, Math.max(t1, t2));
        if (enter > exit)
            return null;
    }
    return enter <= length && exit >= 0 ? { t: enter, normal } : null;
}
/** The query owns this iterator and resumes it on the next physics slice. */
function* collisionBoxes(b, accept, position = b) {
    const cached = compounds.get(b);
    if (cached?.version === b.geometryVersion && cached.boxes) {
        for (const box of cached.boxes) {
            const bounds = (0, section_tree_1.rotatedBounds)(b, box.min, box.max, position);
            yield accept(bounds) ? orientedBox(b, box.min, box.max, position, box.index) : undefined;
        }
        return;
    }
    for (const index of (0, section_tree_1.sectionLeaves)(b, accept, position)) {
        if (index === undefined) {
            yield;
            continue;
        }
        const v = b.voxels[index];
        yield orientedBox(b, { x: v.x + 0.01, y: v.y + 0.01, z: v.z + 0.01 }, { x: v.x + 0.99, y: v.y + 0.99, z: v.z + 0.99 }, position, index);
    }
}
/** Copy the immutable local compound, not world-space axes, into a pose snapshot. */
function shareCollisionGeometry(source, target) {
    const cached = compounds.get(source);
    if (cached?.version === target.geometryVersion)
        compounds.set(target, cached);
}

},
"src/simulation/combat-ai.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeBlast = safeBlast;
exports.grenadeSolution = grenadeSolution;
exports.combatTick = combatTick;
const config_1 = require("../core/config");
const math_1 = require("../core/math");
const projectiles_1 = require("../core/projectiles");
const equipment_1 = require("./equipment");
const npc_state_1 = require("./npc-state");
const perception_1 = require("./perception");
const projectile_flight_1 = require("./projectile-flight");
const projectile_sweep_1 = require("./projectile-sweep");
const tactics_1 = require("./tactics");
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
/** Conservative even when friendly fire is disabled: explosives must not be aimed through allies. */
function safeBlast(sim, a, point, radius = 7) {
    if (Math.hypot(a.x - point.x, a.y + 0.8 - point.y, a.z - point.z) <= radius + 3)
        return false;
    let safe = true;
    sim.neighbours(point.x, point.z, radius + 1, (b) => {
        if (b !== a &&
            b.alive &&
            b.team === a.team &&
            Math.hypot(b.x - point.x, b.y + 0.8 - point.y, b.z - point.z) < radius + 0.4)
            safe = false;
    });
    return (safe &&
        !sim.vehicles.some((v) => v.alive &&
            v.team === a.team &&
            Math.hypot(v.x - point.x, v.y + 1 - point.y, v.z - point.z) < radius + v.radius));
}
/** Predict the complete fuse, including bounces, with the same integration as the live projectile. */
function grenadeSolution(sim, a, target) {
    const o = { x: a.x, y: a.y + a.height - 0.18, z: a.z }, range = distance(o, target);
    if (range < 12 || range > 26)
        return null;
    const yaw = Math.atan2(target.x - o.x, target.z - o.z);
    let best = null, error = 3.1;
    for (let i = 0; i <= 16; i++) {
        const dir = (0, math_1.direction)(yaw, -0.2 + i * 0.085);
        const muzzle = { x: o.x + dir.x * 0.35, y: o.y + dir.y * 0.35, z: o.z + dir.z * 0.35 };
        if ((0, projectile_sweep_1.muzzleCollision)(sim, o, muzzle, a))
            continue;
        const predicted = (0, projectile_flight_1.predictGrenade)(sim, o, dir);
        if (!predicted)
            continue;
        const score = Math.hypot(predicted.x - target.x, predicted.y - target.y - 0.2, predicted.z - target.z);
        if (score < error && safeBlast(sim, a, predicted, 7)) {
            error = score;
            best = { o, dir, predicted };
            if (error < 0.8)
                break;
        }
    }
    return best;
}
function equipNPC(a, weapon, now) {
    if (a.activeWeapon === weapon)
        return;
    a.activeWeapon = weapon;
    a.weaponReady = now + (weapon === 2 ? 0.6 : 0.22);
}
function combatTick(sim, a, dt) {
    if (!a.alive || a.player || a.vehicle || !Number.isFinite(dt) || dt <= 0)
        return;
    const brain = (0, npc_state_1.npcState)(a), primary = a.primaryWeapon, secondary = a.secondaryWeapon;
    a.cool = Math.max(-0.1, a.cool - dt);
    if (a.reload > 0 && (a.activeWeapon === primary || !a.target)) {
        a.reload = Math.max(0, a.reload - dt);
        if (a.reload === 0)
            a.clip = config_1.weapons[primary].mag;
    }
    if (a.secondaryReload > 0 && (a.activeWeapon === secondary || (!a.target && a.reload <= 0))) {
        a.secondaryReload = Math.max(0, a.secondaryReload - dt);
        if (a.secondaryReload === 0)
            a.secondaryClip = config_1.weapons[secondary].mag;
    }
    if (a.target &&
        (!a.target.alive || a.target.vehicle || distance(a, a.target) > (0, npc_state_1.retentionRange)(a)))
        a.target = null;
    if (brain.avoidUntil > sim.simTime && (a.tactic === 'EVADE' || a.tactic === 'BRACE'))
        return;
    if (a.actionUntil > sim.simTime) {
        a.dx *= 0.45;
        a.dz *= 0.45;
        return;
    }
    a.action = '';
    if (brain.task?.phase === 'WORK')
        return;
    const eye = { x: a.x, y: a.y + a.height - 0.22, z: a.z }, vehicle = a.armourTarget;
    if (a.kit === 'engineer' &&
        a.rockets > 0 &&
        vehicle?.alive &&
        !brain.task &&
        a.nextRocket <= sim.simTime) {
        const range = distance(a, vehicle), target = { x: vehicle.x, y: vehicle.y + vehicle.height * 0.55, z: vehicle.z };
        if (range > 13 &&
            range < 90 &&
            safeBlast(sim, a, target, 6) &&
            !(0, npc_state_1.friendlyLane)(sim, a, target, 0.9) &&
            (0, perception_1.canSee)(sim, eye, target)) {
            equipNPC(a, 2, sim.simTime);
            const yaw = Math.atan2(target.x - a.x, target.z - a.z);
            a.yaw += (0, math_1.clamp)((0, math_1.angleWrap)(yaw - a.yaw), -2.4 * dt, 2.4 * dt);
            if (brain.rocketTarget !== vehicle) {
                brain.rocketTarget = vehicle;
                brain.rocketReady = sim.simTime + 0.75;
            }
            a.tactic = 'ANTI ARMOUR';
            a.dx = a.dz = 0;
            brain.reason = 'Aiming at visible armour';
            if (sim.simTime >= Math.max(brain.rocketReady, a.weaponReady) &&
                Math.abs((0, math_1.angleWrap)(yaw - a.yaw)) < 0.08) {
                const flight = range / projectiles_1.projectileSpec.rocket.speed;
                target.x += vehicle.vx * flight;
                target.z += vehicle.vz * flight;
                const reach = distance(a, target), dy = target.y - eye.y + 0.5 * projectiles_1.projectileSpec.rocket.gravity * flight * flight;
                if (safeBlast(sim, a, target, 6) &&
                    (0, perception_1.canSee)(sim, eye, target) &&
                    !(0, npc_state_1.friendlyLane)(sim, a, target, 0.9) &&
                    sim.launch(a, eye, (0, math_1.direction)(Math.atan2(target.x - a.x, target.z - a.z), Math.atan2(dy, reach)))) {
                    a.rockets--;
                    a.nextRocket = sim.simTime + 7 + (a.id % 4);
                    a.actionUntil = sim.simTime + 1;
                    a.action = 'ROCKET';
                    a.cool = 1;
                    (0, equipment_1.count)(sim, 'rockets');
                    brain.rocketTarget = null;
                }
            }
            return;
        }
    }
    brain.rocketTarget = null;
    const target = a.target, range = target ? distance(a, target) : Infinity;
    const emergency = !!target && range < 24 && a.clip <= 0 && a.secondaryClip > 0 && a.secondaryReload <= 0;
    equipNPC(a, emergency ? secondary : primary, sim.simTime);
    if (emergency) {
        a.tactic = 'SIDEARM';
        brain.reason = 'Primary empty at close range';
    }
    if (a.clip <= 0 && a.reload <= 0)
        a.reload = config_1.weapons[primary].reload;
    if (a.secondaryClip <= 0 && a.secondaryReload <= 0)
        a.secondaryReload = config_1.weapons[secondary].reload;
    if (!target) {
        if (Math.abs(a.dx) + Math.abs(a.dz) > 0.1)
            a.yaw += (0, math_1.clamp)((0, math_1.angleWrap)(Math.atan2(a.dx, a.dz) - a.yaw), -4 * dt, 4 * dt);
        return;
    }
    const contact = a.contact;
    if (!contact || contact.until <= sim.simTime) {
        a.target = null;
        return;
    }
    const yaw = Math.atan2(contact.x - a.x, contact.z - a.z);
    a.yaw += (0, math_1.clamp)((0, math_1.angleWrap)(yaw - a.yaw), -2.7 * dt, 2.7 * dt);
    const id = a.activeWeapon, weapon = config_1.weapons[id], sidearm = id === secondary;
    if (a.cool > 0 ||
        (sidearm ? a.secondaryReload : a.reload) > 0 ||
        (sidearm ? a.secondaryClip : a.clip) <= 0 ||
        sim.simTime < Math.max(brain.reactionAt, a.weaponReady) ||
        Math.abs((0, math_1.angleWrap)(yaw - a.yaw)) > 0.13)
        return;
    const end = { x: target.x, y: target.y + Math.min(1.1, target.height - 0.18), z: target.z };
    if (range > weapon.range || !(0, perception_1.canSee)(sim, eye, end)) {
        a.target = null;
        a.cool = 0.2;
        return;
    }
    if ((0, npc_state_1.friendlyLane)(sim, a, end)) {
        brain.blockedShots++;
        (0, equipment_1.count)(sim, 'shotsBlocked');
        a.cool = 0.16;
        brain.positionUntil = 0;
        (0, tactics_1.yieldFiringLane)(sim, a, end);
        return;
    }
    brain.blockedSince = -1;
    if (a.fragCharges > 0 &&
        a.nextFrag <= sim.simTime &&
        range > 12 &&
        range < 26 &&
        safeBlast(sim, a, end, 7)) {
        let group = 0;
        sim.neighbours(target.x, target.z, 5, (e) => {
            if (e.alive &&
                e.team !== a.team &&
                distance(e, target) < 5 &&
                (0, perception_1.canSee)(sim, eye, { x: e.x, y: e.y + 1, z: e.z }))
                group++;
        });
        if ((group >= 2 || target.crouched) &&
            sim.ballisticBudget > 0 &&
            sim.projectiles.filter((p) => p.type === 'grenade' && p.source?.team === a.team).length < 3) {
            sim.ballisticBudget--;
            const plan = grenadeSolution(sim, a, target);
            if (plan && sim.launch(a, plan.o, plan.dir, 'grenade')) {
                a.fragCharges--;
                a.nextFrag = sim.simTime + 22 + (a.id % 8);
                a.actionUntil = sim.simTime + 0.7;
                a.action = 'FRAG';
                a.cool = 0.8;
                (0, equipment_1.count)(sim, 'grenades');
                return;
            }
        }
        a.nextFrag = sim.simTime + 3;
    }
    const spread = ((sidearm ? 0.028 : 0.016) + range * (id === 3 ? 0.00026 : 0.00052)) *
        (a.crouched ? 0.7 : 1) *
        (sim.simTime - a.lastHit < 1.2 ? 1.4 : 1) *
        (1 + (0, npc_state_1.pressure)(sim, a) * 1.4);
    sim.bullet(a, eye, (0, math_1.direction)(a.yaw + sim.world.rnd(-spread, spread), Math.atan2(end.y - eye.y, range) + sim.world.rnd(-spread, spread)), weapon.damage * (sidearm ? 0.8 : id === 3 ? 0.78 : 0.82));
    if (sidearm) {
        a.secondaryClip--;
        (0, equipment_1.count)(sim, 'sidearmShots');
    }
    else
        a.clip--;
    a.shield = 0;
    if (--a.burst <= 0) {
        a.burst = 3 + (a.id % 3);
        a.cool = 0.6 + sim.world.rand() * 0.7;
    }
    else
        a.cool =
            Math.max(weapon.delay * 1.35, id === 1 ? 0.16 : id === 3 ? 0.85 : sidearm ? 0.24 : 0.23) +
                sim.world.rand() * 0.1;
}

},
"src/simulation/combat.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hurt = hurt;
exports.hurtVehicle = hurtVehicle;
exports.explode = explode;
exports.rayBox = rayBox;
exports.bullet = bullet;
exports.launch = launch;
exports.reload = reload;
exports.switchWeapon = switchWeapon;
exports.throwGrenade = throwGrenade;
exports.useVehicle = useVehicle;
exports.useLift = useLift;
exports.heal = heal;
exports.fortify = fortify;
exports.weaponSpread = weaponSpread;
exports.mantle = mantle;
exports.confirmHit = confirmHit;
const config_1 = require("../core/config");
const loadout_1 = require("../core/loadout");
const math_1 = require("../core/math");
const projectiles_1 = require("../core/projectiles");
const destruction_events_1 = require("./destruction-events");
const interactions_1 = require("./interactions");
const navigation_1 = require("./navigation");
const npc_state_1 = require("./npc-state");
const player_actions_1 = require("./player-actions");
const projectile_sweep_1 = require("./projectile-sweep");
const section_query_1 = require("./section-query");
const vehicle_state_1 = require("./vehicle-state");
const playerCredit = (source) => source && ('player' in source ? source.player : source.driver?.player);
const sourceItem = (sim, source, context) => context.itemId ??
    (playerCredit(source) ? (sim.player.vehicle ? 'apc' : config_1.weapons[sim.weaponIndex].id) : undefined);
function hurt(a, amount, source, context = {}) {
    if ((a.player && this.practiceInvulnerable) ||
        !a.alive ||
        a.shield > 0 ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        (source && source !== a && source.team === a.team))
        return;
    const damage = Math.min(Math.max(0, a.hp), amount), credited = Boolean(playerCredit(source) && source !== a), itemId = sourceItem(this, source, context);
    a.hp = Math.max(0, a.hp - amount);
    a.lastHit = this.simTime;
    if (a.player) {
        this.hurtTime = 0.75;
        this.shake = Math.max(this.shake, 0.14);
        this.damageAngle = source ? Math.atan2(source.x - a.x, source.z - a.z) : this.yaw;
    }
    if (credited) {
        const old = this.damageContributions.get(a.id);
        this.damageContributions.set(a.id, {
            damage: damage + (old && old.until > this.simTime ? old.damage : 0),
            until: this.simTime + 10,
            itemId: itemId ?? 'ar30',
        });
        this.hitTime = 0.22;
        this.hitKill = a.hp <= 0;
        this.handling.head = Boolean(context.headshot);
        this.confirmHit(damage, this.hitKill, Boolean(context.headshot));
    }
    if (a.hp > 0)
        return;
    a.alive = false;
    (0, npc_state_1.retireNPC)(this, a);
    a.deaths = (a.deaths || 0) + 1;
    a.respawn = a.player ? 8 : Math.max(8, 12 - (this.simTime % 12));
    a.reviveUntil = this.simTime + Math.min(8, a.respawn);
    this.tickets[a.team] = Math.max(0, this.tickets[a.team] - 1);
    if (a.vehicle) {
        (0, vehicle_state_1.leaveVehicle)(a);
        a.reviveUntil = 0;
    }
    for (let i = 0; i < 5; i++)
        this.emitParticle(a.x, a.y + 0.7, a.z, a.team === 0 ? config_1.blue : config_1.orange, 0.27, 3, 3);
    if (source && 'frags' in source && source !== a)
        source.frags = (source.frags || 0) + 1;
    if (credited) {
        this.kills++;
        this.killStreak++;
        this.bestStreak = Math.max(this.bestStreak, this.killStreak);
        this.award('ELIMINATION', 100, itemId, 'kills');
        if (context.headshot)
            this.award('HEADSHOT', 25, itemId, 'headshots');
        const sector = this.world.flags.find((f) => f.owner === this.player.team && (0, math_1.dist2)(a, f) < 576);
        if (sector)
            this.award('SECTOR DEFENCE', 25, itemId);
        this.notify(`${context.headshot ? 'HEADSHOT' : 'ELIMINATION'} · ${config_1.weapons.find((w) => w.id === itemId)?.name.split(' / ')[0] ?? itemId ?? 'COMBAT'}`, this.player.team);
    }
    else {
        const contribution = this.damageContributions.get(a.id);
        if (source &&
            source.team === this.player.team &&
            a.team !== this.player.team &&
            contribution &&
            contribution.until >= this.simTime &&
            contribution.damage >= 25)
            this.award('DAMAGE ASSIST', Math.min(75, Math.round(contribution.damage)), contribution.itemId, 'assists');
    }
    this.damageContributions.delete(a.id);
    if (a.player) {
        this.deaths++;
        this.killStreak = 0;
        this.award('DEATH', 0, undefined, 'deaths');
        this.reloadTime = 0;
        this.clearInput();
        this.events.push({ type: 'death' });
    }
}
function hurtVehicle(v, amount, source, context = {}) {
    if (!v.alive || !Number.isFinite(amount) || amount <= 0 || (source && source.team === v.team))
        return;
    v.hp -= amount;
    if (v.hp <= 0) {
        v.alive = false;
        v.respawn = 45;
        if (playerCredit(source))
            this.award('VEHICLE DESTROYED', 250, sourceItem(this, source, context), 'vehicleKills');
        const driver = v.driver;
        (0, vehicle_state_1.clearDriver)(v);
        if (driver) {
            driver.vehicle = null;
            driver.shield = 0;
            this.hurt(driver, 200, source, context);
        }
        this.explode({ x: v.x, y: v.y + 1, z: v.z }, 5.5, source, 150, context);
    }
}
function explode(p, r, source, power = 155, context = {}) {
    this.flashes.push({ x: p.x, y: p.y, z: p.z, r, life: 0.32 });
    const distance = this.player ? Math.hypot(this.player.x - p.x, this.player.z - p.z) : 100;
    this.shake = Math.max(this.shake, Math.max(0, 1 - distance / 28) * 0.55);
    this.soundAt('boom', p.x, p.z, 1);
    this.addDust(p, r * 0.65, 0.8);
    // Damage uses the intact world for cover, before removing voxels.
    for (const a of this.actors)
        if (a.alive && !a.vehicle) {
            const dx = a.x - p.x, dy = a.y + 1 - p.y, dz = a.z - p.z, d = Math.hypot(dx, dy, dz);
            if (d < r * 1.5) {
                const cover = (0, section_query_1.clearSegment)(this, p, { x: a.x, y: a.y + 1, z: a.z }) ? 1 : 0.3;
                this.hurt(a, power * (1 - d / (r * 1.5)) * cover, source, context);
                if (!source || source === a || source.team !== a.team) {
                    a.ix += (dx / (d + 0.1)) * 12;
                    a.iz += (dz / (d + 0.1)) * 12;
                    a.vy += Math.max(0, 1 - d / r) * 5;
                }
            }
        }
    for (const v of this.vehicles)
        if (v.alive) {
            const d = Math.hypot(v.x - p.x, v.y + v.height / 2 - p.y, v.z - p.z);
            if (d < r * 1.5) {
                const samples = [
                    { x: v.x, y: v.y + v.height / 2, z: v.z },
                    { x: v.x + v.radius * 0.7, y: v.y + v.height / 2, z: v.z },
                    { x: v.x - v.radius * 0.7, y: v.y + v.height / 2, z: v.z },
                ];
                const cover = 0.3 +
                    (0.7 * samples.filter((point) => (0, section_query_1.clearSegment)(this, p, point)).length) / samples.length;
                this.hurtVehicle(v, power * 2 * (1 - d / (r * 1.5)) * cover, source, context);
            }
        }
    (0, destruction_events_1.applyBlast)(this, p, r, power);
    for (const b of this.world.buildings)
        if (p.x + r > b.x && p.x - r < b.x + b.w && p.z + r > b.z && p.z - r < b.z + b.d)
            b.dirty = true;
    for (let i = 0; i < 22; i++)
        this.emitParticle(p.x, p.y, p.z, i < 7 ? [1, 0.65, 0.22] : [0.35, 0.35, 0.32], this.effectRnd(0.15, 0.55), 11, this.effectRnd(0.5, 2));
}
function rayBox(o, d, b) {
    let lo = 0, hi = 150;
    for (const axis of ['x', 'y', 'z']) {
        const min = b[axis] - b[`${axis}r`], max = b[axis] + b[`${axis}r`];
        if (Math.abs(d[axis]) < 1e-8) {
            if (o[axis] < min || o[axis] > max)
                return Infinity;
            continue;
        }
        let t0 = (min - o[axis]) / d[axis], t1 = (max - o[axis]) / d[axis];
        if (t0 > t1)
            [t0, t1] = [t1, t0];
        lo = Math.max(lo, t0);
        hi = Math.min(hi, t1);
        if (lo > hi)
            return Infinity;
    }
    return lo;
}
function bullet(a, o, d, amount) {
    if (![o.x, o.y, o.z, d.x, d.y, d.z, amount].every(Number.isFinite) || amount <= 0)
        return;
    const length = Math.hypot(d.x, d.y, d.z);
    if (length < 1e-8)
        return;
    d = { x: d.x / length, y: d.y / length, z: d.z / length };
    const weaponId = a.player ? this.weaponIndex : a.activeWeapon;
    const weapon = config_1.weapons[weaponId] ?? config_1.weapons[0];
    const wall = this.world.raycast(o, d, weapon.range);
    const section = (0, section_query_1.sectionRay)(this, o, d, wall?.t ?? weapon.range);
    let nearest = section?.t ?? (wall ? wall.t : weapon.range), target = null, vehicle = null;
    // Includes friendlies as blockers, with friendly-fire damage disabled.
    for (const b of this.rayActors(o, d, nearest))
        if (b !== a && b.alive && !b.vehicle) {
            const t = this.rayBox(o, d, {
                x: b.x,
                y: b.y + b.height / 2,
                z: b.z,
                xr: 0.34,
                yr: b.height / 2,
                zr: 0.34,
            });
            if (t < nearest) {
                nearest = t;
                target = b;
                vehicle = null;
            }
        }
    for (const v of this.vehicles)
        if (v.alive) {
            const t = this.rayBox(o, d, {
                x: v.x,
                y: v.y + v.height / 2,
                z: v.z,
                xr: v.radius,
                yr: v.height / 2,
                zr: v.radius,
            });
            if (t < nearest) {
                nearest = t;
                vehicle = v;
                target = null;
            }
        }
    const end = { x: o.x + d.x * nearest, y: o.y + d.y * nearest, z: o.z + d.z * nearest };
    if (target) {
        const head = end.y > target.y + target.height * 0.83;
        if (a.player)
            this.handling.head = head;
        const falloff = a.player
            ? (0, math_1.lerp)(1, this.weaponIndex === 3 ? 0.85 : 0.65, (0, math_1.clamp)((nearest - 35) / 80, 0, 1))
            : 1;
        this.hurt(target, amount * falloff * (head ? 1.8 : 1) * (!a.player && target.player ? 10 / 24 : 1), a, { headshot: head, itemId: a.player ? config_1.weapons[this.weaponIndex].id : undefined });
    }
    else if (vehicle)
        this.hurtVehicle(vehicle, amount * 0.07, a);
    else if (section)
        (0, section_query_1.damageSection)(section.body, section.index, amount);
    else if (wall) {
        const result = this.world.damageVoxel(wall.x, wall.y, wall.z, amount);
        if (result.removed)
            this.emitParticle(end.x, end.y, end.z, this.world.colours[result.material], 0.2, 3, 1);
    }
    (0, npc_state_1.nearMiss)(this, a, o, end);
    a.shotSerial++;
    if (this.tracers.length < 90 && (a.player || a.shotSerial % 3 === 0))
        this.tracers.push({ a: { ...o }, b: end, life: 0.11, maxLife: 0.11, team: a.team });
    this.soundAt(weapon.id, o.x, o.z, a.player ? 0.65 : 0.16);
}
function launch(a, o, d, type = 'rocket') {
    if (this.projectiles.length >= 110 || ![o.x, o.y, o.z, d.x, d.y, d.z].every(Number.isFinite))
        return false;
    const norm = Math.hypot(d.x, d.y, d.z);
    if (norm < 1e-8 || !['rocket', 'shell', 'grenade', 'smoke'].includes(type))
        return false;
    d = { x: d.x / norm, y: d.y / norm, z: d.z / norm };
    const thrown = type === 'grenade' || type === 'smoke';
    const eye = { ...o };
    let muzzle = { ...o }, aim = null;
    if (type === 'shell' && a) {
        const vehicle = 'driver' in a ? a : a.vehicle;
        if (vehicle)
            Object.assign(eye, { x: vehicle.x, y: vehicle.y + 2.35, z: vehicle.z });
    }
    else if (type === 'rocket') {
        const player = !!(a && 'player' in a && a.player);
        if (player) {
            const wall = this.world.raycast(o, d, 115), section = (0, section_query_1.sectionRay)(this, o, d, wall?.t ?? 115);
            const range = section?.t ?? wall?.t ?? 115;
            aim = { x: o.x + d.x * range, y: o.y + d.y * range, z: o.z + d.z * range };
        }
        const yaw = player ? this.yaw : Math.atan2(d.x, d.z);
        muzzle = {
            x: o.x + Math.cos(yaw) * 0.26 + d.x * 0.72,
            y: o.y - 0.19 + d.y * 0.72,
            z: o.z - Math.sin(yaw) * 0.26 + d.z * 0.72,
        };
    }
    else if (thrown) {
        muzzle = { x: o.x + d.x * 0.35, y: o.y + d.y * 0.35, z: o.z + d.z * 0.35 };
    }
    const blocked = (0, projectile_sweep_1.muzzleCollision)(this, eye, muzzle, a);
    if (blocked) {
        // A blocked throwing hand does not spend a grenade; explosive launchers impact cover.
        if (thrown) {
            if (a && 'player' in a && a.player)
                this.notify('THROW OBSTRUCTED');
            return false;
        }
        this.explode(blocked, type === 'shell' ? 4.2 : 4.8, a, 175, {
            itemId: playerCredit(a) ? (type === 'shell' ? 'apc' : 'at1') : undefined,
        });
        if (a && 'shield' in a)
            a.shield = 0;
        return true;
    }
    o = muzzle;
    if (aim) {
        const delta = { x: aim.x - o.x, y: aim.y - o.y, z: aim.z - o.z }, length = Math.hypot(delta.x, delta.y, delta.z);
        if (length > 1e-8)
            d = { x: delta.x / length, y: delta.y / length, z: delta.z / length };
    }
    const spec = projectiles_1.projectileSpec[type], speed = spec.speed;
    this.projectiles.push({
        x: o.x,
        y: o.y,
        z: o.z,
        vx: d.x * speed,
        vy: d.y * speed + spec.lift,
        vz: d.z * speed,
        type,
        life: spec.fuse,
        source: a,
        itemId: playerCredit(a) && type !== 'smoke'
            ? type === 'grenade'
                ? 'frag'
                : type === 'shell'
                    ? 'apc'
                    : 'at1'
            : undefined,
    });
    if (a && 'shield' in a)
        a.shield = 0;
    this.soundAt(thrown ? 'click' : type === 'shell' ? 'cannon' : 'launcher', o.x, o.z, 0.8);
    return true;
}
function reload() {
    if (!this.playing ||
        !this.player?.alive ||
        this.player.vehicle ||
        this.reloadTime > 0 ||
        this.ammo[this.weaponIndex] >= config_1.weapons[this.weaponIndex].mag ||
        this.reserves[this.weaponIndex] <= 0)
        return;
    this.reloadTime = config_1.weapons[this.weaponIndex].reload * this.weaponTuning[this.weaponIndex].reload;
    this.handling.sprint = 0;
    this.soundAt('click', this.player.x, this.player.z, 0.7);
}
function switchWeapon(n) {
    if (!this.playing || !this.player?.alive || this.player.vehicle)
        return;
    if (!Number.isInteger(n) || !(0, loadout_1.loadout)(this).includes(n) || n === this.weaponIndex)
        return;
    this.weaponIndex = n;
    this.player.activeWeapon = n;
    this.scopeStep = 0;
    this.input.firePressed = false;
    this.input.aim = false;
    this.reloadTime = 0;
    this.fireTime = Math.max(this.fireTime, 0.28);
    this.handling.ready = 0.28;
    this.handling.bloom = 0;
    this.aimAmount = 0;
}
function throwGrenade() {
    if (!this.playing ||
        !this.player?.alive ||
        this.player.vehicle ||
        this.grenades <= 0 ||
        this.grenadeTime > 0)
        return;
    const d = (0, math_1.direction)(this.yaw, this.pitch);
    if (this.launch(this.player, { x: this.player.x, y: this.player.y + 1.5, z: this.player.z }, d, 'grenade')) {
        this.grenades--;
        this.grenadeTime = 0.65 * (this.itemTuning.frag ?? 1);
    }
}
function useVehicle() {
    const q = (0, player_actions_1.interactionStatus)(this);
    if (q.action === 'lift') {
        this.useLift();
        return;
    }
    if (!q.available) {
        if (q.label)
            this.notify(q.reason);
        return;
    }
    if (q.action === 'exit' && q.position) {
        this.clearInput();
        (0, vehicle_state_1.leaveVehicle)(this.player);
        Object.assign(this.player, q.position, { vx: 0, vy: 0, vz: 0, height: 1.8, crouched: false });
        this.player.poseEpoch = (this.player.poseEpoch ?? 0) + 1;
    }
    else if (q.action === 'enter' && q.vehicle && (0, vehicle_state_1.enterVehicle)(this.player, q.vehicle)) {
        this.clearInput();
        q.vehicle.vx = q.vehicle.vz = 0;
        this.yaw = q.vehicle.turret;
        this.pitch = 0;
        this.reloadTime = 0;
        this.notify('ARMOURED · Move / steer with WASD. Aim and fire with mouse.');
    }
}
function useLift() {
    const q = (0, player_actions_1.interactionStatus)(this);
    if (q.action !== 'lift')
        return false;
    if (!q.available) {
        this.notify(q.reason);
        return true;
    }
    if (!(0, navigation_1.travelLift)(this, this.player, q.building, q.level))
        return true;
    this.player.shield = Math.max(this.player.shield, 0.6);
    this.abilityClock = 1.2;
    const b = this.world.buildings[q.building];
    this.notify(q.level === b.floors ? 'ROOFTOP · ' + b.floors + ' STOREYS' : 'LIFT · FLOOR ' + (q.level + 1));
    return true;
}
function heal() {
    if (!this.playing || !this.player.alive || this.player.vehicle || this.abilityClock > 0)
        return;
    if (this.player.hp >= 100) {
        this.notify('ALREADY AT FULL HEALTH');
        return;
    }
    const restored = Math.min(45, 100 - this.player.hp);
    this.player.hp += restored;
    this.abilityClock = 22 * (this.itemTuning.field_dressing ?? 1);
    this.award('SELF AID', Math.round(restored * 0.25), 'field_dressing');
    this.notify(`FIELD DRESSING · +${Math.round(restored)} health`);
}
function fortify() {
    const q = (0, player_actions_1.fortificationStatus)(this);
    if (!q.available) {
        this.notify(q.reason);
        return;
    }
    if (q.action === 'repair' && q.vehicle) {
        if (!(0, interactions_1.repairVehicle)(this, this.player, q.vehicle))
            return;
        this.abilityClock = 12 * (this.itemTuning.engineer_tool ?? 1);
        this.notify('ARMOUR REPAIRED');
        return;
    }
    for (const p of q.cells ?? [])
        this.world.setRaw(p.x, p.y, p.z, 9);
    this.world.navDirty = this.world.mapDirty = true;
    this.abilityClock = 16 * (this.itemTuning.engineer_tool ?? 1);
    this.award('FORTIFICATION', 10, 'engineer_tool');
    this.notify('SANDBAG COVER BUILT');
}
function weaponSpread() {
    const speed = Math.hypot(this.player.vx, this.player.vz);
    return (config_1.weapons[this.weaponIndex].spread *
        this.weaponTuning[this.weaponIndex].spread *
        (0, math_1.lerp)(1, 0.2, this.aimAmount) *
        (this.player.crouched ? 0.72 : 1) *
        (this.player.onGround ? 1 : 2.7) *
        (1 + Math.min(1, speed / 5) * 0.65) +
        this.handling.bloom);
}
function mantle() {
    if (!this.player.onGround || this.player.vehicle)
        return false;
    const dx = Math.sin(this.yaw), dz = Math.cos(this.yaw), x = this.player.x + dx * 0.95, z = this.player.z + dz * 0.95;
    if (!this.occupied(this.player, x, this.player.y, z, 0.29, this.player.height))
        return false;
    for (const rise of [1.05, 1.55, 2.05]) {
        if (!this.world.solid(x, this.player.y + rise - 0.12, z))
            continue;
        let clear = true;
        for (let t = 0.2; t <= 1.001; t += 0.2) {
            if (this.occupied(this.player, this.player.x, this.player.y + rise * t, this.player.z, 0.29, this.player.height) ||
                this.occupied(this.player, (0, math_1.lerp)(this.player.x, x, t), this.player.y + rise, (0, math_1.lerp)(this.player.z, z, t), 0.29, this.player.height)) {
                clear = false;
                break;
            }
        }
        if (clear) {
            this.player.x = x;
            this.player.z = z;
            this.player.y += rise;
            this.camera.y = Math.max(this.camera.y, this.player.y + 0.2);
            this.player.vy = 0;
            this.handling.ready = 0.32;
            this.handling.land = 0.06;
            this.soundAt('step', x, z, 0.16);
            return true;
        }
    }
    return false;
}
function confirmHit(amount, killed, headshot = false) {
    this.handling.damage =
        this.handling.damageTime > 0 ? this.handling.damage + Math.round(amount) : Math.round(amount);
    this.handling.damageTime = 0.8;
    this.events.push({ type: 'hit', killed, headshot });
}

},
"src/simulation/contact.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactResponse = exports.clearContact = void 0;
exports.sweepBox = sweepBox;
exports.relativePoint = relativePoint;
exports.addAngularVelocity = addAngularVelocity;
exports.applyImpulse = applyImpulse;
exports.effectiveInverse = effectiveInverse;
exports.reduceManifold = reduceManifold;
exports.resolveManifold = resolveManifold;
exports.resolveContact = resolveContact;
exports.energyImpulse = energyImpulse;
const material_physics_1 = require("../core/material-physics");
const rotation_1 = require("./rotation");
const rubble_shape_1 = require("./rubble-shape");
exports.clearContact = { kind: 'clear' };
/** Exact slab entry for a translated conservative voxel box. Initial overlaps retain their own normal. */
function sweepBox(box, target, delta) {
    let entry = -Infinity, exit = Infinity, axis = 'y', sign = 1;
    let depth = Infinity, overlapAxis = 'y', overlapSign = 1, overlapping = true;
    for (const a of ['x', 'y', 'z']) {
        const positive = target.max[a] - box.min[a], negative = box.max[a] - target.min[a];
        if (positive <= 0 || negative <= 0)
            overlapping = false;
        if (Math.min(positive, negative) < depth) {
            depth = Math.min(positive, negative);
            overlapAxis = a;
            overlapSign = positive < negative ? 1 : -1;
        }
        if (Math.abs(delta[a]) < 1e-10) {
            if (positive <= 0 || negative <= 0)
                return null;
            continue;
        }
        const t1 = (target.min[a] - box.max[a]) / delta[a], t2 = (target.max[a] - box.min[a]) / delta[a];
        const near = Math.min(t1, t2), far = Math.max(t1, t2);
        if (near > entry) {
            entry = near;
            axis = a;
            sign = delta[a] > 0 ? -1 : 1;
        }
        exit = Math.min(exit, far);
    }
    if (!overlapping && (entry > exit || entry < 0 || entry > 1))
        return null;
    if (overlapping) {
        axis = overlapAxis;
        sign = overlapSign;
        entry = 0;
    }
    const fraction = Math.max(0, entry), normal = { x: 0, y: 0, z: 0 }, point = { x: 0, y: 0, z: 0 };
    normal[axis] = sign;
    for (const a of ['x', 'y', 'z'])
        point[a] =
            (Math.max(box.min[a] + delta[a] * fraction, target.min[a]) +
                Math.min(box.max[a] + delta[a] * fraction, target.max[a])) /
                2;
    point[axis] = sign > 0 ? target.max[axis] : target.min[axis];
    return {
        point,
        normal,
        fraction,
        penetration: overlapping ? Math.max(0, depth) : 0,
        minX: Math.max(box.min.x + delta.x * fraction, target.min.x),
        maxX: Math.min(box.max.x + delta.x * fraction, target.max.x),
        minZ: Math.max(box.min.z + delta.z * fraction, target.min.z),
        maxZ: Math.min(box.max.z + delta.z * fraction, target.max.z),
    };
}
function relativePoint(b, point) {
    return {
        x: point.x - b.x - b.centre.x,
        y: point.y - b.y - b.centre.y,
        z: point.z - b.z - b.centre.z,
    };
}
const cross = (a, b) => ({
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
});
const dot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
function addAngularVelocity(b, w) {
    b.omega.x += w.x;
    b.omega.y += w.y;
    b.omega.z += w.z;
}
const responses = new WeakMap();
const contactResponse = (b) => responses.get(b);
exports.contactResponse = contactResponse;
function applyImpulse(b, impulse, point) {
    if (b.sleeping)
        return;
    b.vx += impulse.x / b.mass;
    b.vy += impulse.y / b.mass;
    b.vz += impulse.z / b.mass;
    addAngularVelocity(b, (0, rotation_1.inverseWorld)(b, cross(relativePoint(b, point), impulse)));
}
function effectiveInverse(b, c, n) {
    let result = 0;
    for (const body of [b, c.body])
        if (body && !body.sleeping) {
            const arm = cross(relativePoint(body, c.point), n);
            result += 1 / body.mass + dot(arm, (0, rotation_1.inverseWorld)(body, arm));
        }
    return Math.max(1e-9, result);
}
const relative = (b, c) => {
    const v = (0, rubble_shape_1.pointVelocity)(b, relativePoint(b, c.point));
    if (c.body) {
        const other = (0, rubble_shape_1.pointVelocity)(c.body, relativePoint(c.body, c.point));
        v.x -= other.x;
        v.y -= other.y;
        v.z -= other.z;
    }
    return v;
};
const pair = (b, c, n, j) => {
    const impulse = { x: n.x * j, y: n.y * j, z: n.z * j };
    applyImpulse(b, impulse, c.point);
    if (c.body)
        applyImpulse(c.body, { x: -impulse.x, y: -impulse.y, z: -impulse.z }, c.point);
};
function reduceManifold(contacts) {
    const ordered = [...contacts].sort((a, b) => b.penetration - a.penetration), chosen = [];
    if (ordered.length)
        chosen.push(ordered.shift());
    while (chosen.length < 4 && ordered.length) {
        let best = -1, dist = 0;
        for (let i = 0; i < ordered.length; i++) {
            const p = ordered[i].point, d = Math.min(...chosen.map((c) => (p.x - c.point.x) ** 2 + (p.y - c.point.y) ** 2 + (p.z - c.point.z) ** 2));
            if (d > dist) {
                dist = d;
                best = i;
            }
        }
        if (best < 0 || dist < 0.01)
            break;
        chosen.push(ordered.splice(best, 1)[0]);
    }
    return chosen;
}
const cache = new WeakMap();
let solveStep = 0;
function resolveManifold(b, contacts, restitution = 0.08) {
    const selected = reduceManifold(contacts), otherBodies = [...new Set(selected.flatMap((c) => (c.body ? [c.body] : [])))], before = (0, rotation_1.kineticEnergy)(b) + otherBodies.reduce((n, o) => n + (0, rotation_1.kineticEnergy)(o), 0);
    let memory = cache.get(b);
    if (!memory) {
        memory = new Map();
        cache.set(b, memory);
    }
    const step = ++solveStep;
    const constraints = selected.map((c) => {
        const axis = Math.abs(c.normal.y) < 0.9 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 }, t = cross(axis, c.normal), len = Math.hypot(t.x, t.y, t.z), t1 = { x: t.x / len, y: t.y / len, z: t.z / len }, t2 = cross(c.normal, t1), vn = dot(relative(b, c), c.normal), key = `${c.terrain ?? 'd'}:${c.body?.id ?? -1}:${Math.round(c.point.x * 20)}:${Math.round(c.point.y * 20)}:${Math.round(c.point.z * 20)}:${Math.round(c.normal.x * 100)},${Math.round(c.normal.y * 100)},${Math.round(c.normal.z * 100)}`, old = memory.get(key);
        const mu = Math.sqrt((0, material_physics_1.physicsMaterial)(b.voxels[0]?.material ?? 4).friction *
            (0, material_physics_1.physicsMaterial)(c.body?.voxels[0]?.material ?? 4).friction), kn = effectiveInverse(b, c, c.normal);
        const valid = old &&
            old.version === b.geometryVersion &&
            old.otherVersion === (c.body?.geometryVersion ?? -1) &&
            step - old.step < 128 &&
            Math.abs(vn) < 0.5;
        const state = {
            c,
            t1,
            t2,
            key,
            mu,
            kn,
            kt1: effectiveInverse(b, c, t1),
            kt2: effectiveInverse(b, c, t2),
            closing: Math.max(0, -vn),
            bounce: vn < -4
                ? -vn * Math.min(restitution, (0, material_physics_1.physicsMaterial)(b.voxels[0]?.material ?? 4).restitution)
                : 0,
            jn: valid ? Math.min(old.normal, 0.5 / kn) : 0,
            j1: 0,
            j2: 0,
        };
        if (state.jn)
            pair(b, c, c.normal, state.jn);
        return state;
    });
    for (let iteration = 0; iteration < 4; iteration++)
        for (const q of constraints) {
            const old = q.jn;
            q.jn = Math.max(0, old + (q.bounce - dot(relative(b, q.c), q.c.normal)) / q.kn);
            pair(b, q.c, q.c.normal, q.jn - old);
            const v = relative(b, q.c), j1 = q.j1 - dot(v, q.t1) / q.kt1, j2 = q.j2 - dot(v, q.t2) / q.kt2, len = Math.hypot(j1, j2), scale = Math.min(1, (q.mu * q.jn) / Math.max(1e-9, len)), n1 = j1 * scale, n2 = j2 * scale;
            pair(b, q.c, q.t1, n1 - q.j1);
            pair(b, q.c, q.t2, n2 - q.j2);
            q.j1 = n1;
            q.j2 = n2;
        }
    let impulse = 0, closing = 0, inverse = 0;
    for (const q of constraints) {
        impulse += q.jn;
        closing = Math.max(closing, q.closing);
        inverse = Math.max(inverse, q.kn);
        memory.set(q.key, {
            version: b.geometryVersion,
            otherVersion: q.c.body?.geometryVersion ?? -1,
            normal: q.jn,
            t1: q.j1,
            t2: q.j2,
            step,
        });
    }
    if (memory.size > 64)
        for (const [key, value] of memory)
            if (step - value.step > 8)
                memory.delete(key);
    const after = (0, rotation_1.kineticEnergy)(b) + otherBodies.reduce((n, o) => n + (0, rotation_1.kineticEnergy)(o), 0), response = {
        closing,
        impulse,
        effectiveInverseMass: inverse,
        dissipated: Math.max(0, before - after),
    };
    responses.set(b, response);
    return response;
}
/** Compatibility wrapper for the per-axis swept movement path. */
function resolveContact(b, c, restitution = 0.08) {
    return resolveManifold(b, [c], restitution).closing;
}
function energyImpulse(b, direction, energy, point) {
    if (!(energy > 0) || !Number.isFinite(energy))
        return 0;
    const len = Math.hypot(direction.x, direction.y, direction.z);
    if (len < 1e-8)
        return 0;
    const n = { x: direction.x / len, y: direction.y / len, z: direction.z / len };
    b.sleeping = false;
    b.restTime = 0;
    const c = {
        normal: n,
        point,
        penetration: 0,
        fraction: 0,
        minX: point.x,
        maxX: point.x,
        minZ: point.z,
        maxZ: point.z,
    }, k = effectiveInverse(b, c, n), v = dot(relative(b, c), n), j = Math.max(0, (-v + Math.sqrt(v * v + 2 * k * energy)) / k), before = (0, rotation_1.kineticEnergy)(b);
    applyImpulse(b, { x: n.x * j, y: n.y * j, z: n.z * j }, point);
    const speed = Math.hypot(b.vx, b.vy, b.vz);
    if (speed > 36) {
        b.vx *= 36 / speed;
        b.vy *= 36 / speed;
        b.vz *= 36 / speed;
    }
    const angular = Math.hypot(b.omega.x, b.omega.y, b.omega.z);
    if (angular > 12) {
        b.omega.x *= 12 / angular;
        b.omega.y *= 12 / angular;
        b.omega.z *= 12 / angular;
    }
    return Math.max(0, (0, rotation_1.kineticEnergy)(b) - before);
}

},
"src/simulation/destruction-budget.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newDestructionBudget = void 0;
exports.beginDestructionFrame = beginDestructionFrame;
const newDestructionBudget = () => ({
    supportMs: 3,
    prepareMs: 3,
    physicsMs: 6,
    fractureEvents: 2,
    probes: 8192,
    pairs: 512,
    deadline: Infinity,
});
exports.newDestructionBudget = newDestructionBudget;
function beginDestructionFrame(sim) {
    sim.destructionBudget = (0, exports.newDestructionBudget)();
}

},
"src/simulation/destruction-events.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyBlast = applyBlast;
exports.destructionLedgers = destructionLedgers;
const config_1 = require("../core/config");
const material_physics_1 = require("../core/material-physics");
const contact_1 = require("./contact");
const section_index_1 = require("./section-index");
const section_query_1 = require("./section-query");
const section_tree_1 = require("./section-tree");
const history = new WeakMap();
/** All receivers share one event budget. Health/cover evaluation precedes this commit. */
function applyBlast(sim, point, radius, power) {
    const input = Math.max(0, power * radius * radius * 4);
    if (!Number.isFinite(input) || radius <= 0)
        return;
    const event = {
        point: { ...point },
        radius,
        ledger: {
            input,
            fractureBudget: input * 0.8,
            fractureSpent: 0,
            motionBudget: input * 0.2,
            motionSpent: 0,
        },
    };
    const { ledger } = event;
    const candidates = [];
    let weight = 0;
    for (let z = Math.max(0, Math.floor(point.z - radius)); z <= Math.min(config_1.D - 1, point.z + radius); z++)
        for (let x = Math.max(0, Math.floor(point.x - radius)); x <= Math.min(config_1.W - 1, point.x + radius); x++)
            for (let y = Math.max(1, Math.floor(point.y - radius)); y <= Math.min(config_1.H - 1, point.y + radius); y++) {
                const material = sim.world.cell(x, y, z), distance = Math.hypot(x + 0.5 - point.x, y + 0.5 - point.y, z + 0.5 - point.z);
                if (!material || material === 1 || distance >= radius)
                    continue;
                const w = (1 - distance / radius) ** 2;
                weight += w;
                candidates.push({ x, y, z, material, weight: w });
            }
    const bodies = [
        ...(0, section_index_1.nearbySections)(sim, {
            min: { x: point.x - radius, y: point.y - radius, z: point.z - radius },
            max: { x: point.x + radius, y: point.y + radius, z: point.z + radius },
        }),
    ];
    const dynamic = [];
    for (const body of bodies)
        for (let index = body.voxels.length - 1; index >= 0; index--) {
            const p = (0, section_tree_1.voxelPoint)(body, index), distance = Math.hypot(p.x - point.x, p.y - point.y, p.z - point.z);
            if (distance >= radius)
                continue;
            const w = (1 - distance / radius) ** 2;
            weight += w;
            dynamic.push({ body, index, weight: w });
        }
    for (const c of candidates) {
        const key = sim.world.index(c.x, c.y, c.z), cost = (0, material_physics_1.fractureResistance)(c.material), before = sim.world.damage.get(key) ?? 0, paid = Math.min(Math.max(0, cost - before), (ledger.fractureBudget * c.weight) / Math.max(weight, 1e-10));
        ledger.fractureSpent += paid;
        sim.world.damageVoxel(c.x, c.y, c.z, paid);
    }
    for (const c of dynamic) {
        const paid = (ledger.fractureBudget * c.weight) / Math.max(weight, 1e-10);
        ledger.fractureSpent += paid;
        (0, section_query_1.damageSection)(c.body, c.index, paid);
    }
    const receivers = bodies.filter((b) => b.voxels.length), mass = receivers.reduce((sum, b) => sum + b.mass, 0);
    for (const b of receivers) {
        const centre = { x: b.x + b.centre.x, y: b.y + b.centre.y, z: b.z + b.centre.z }, dir = { x: centre.x - point.x, y: centre.y - point.y, z: centre.z - point.z };
        ledger.motionSpent += (0, contact_1.energyImpulse)(b, dir, (ledger.motionBudget * b.mass) / Math.max(mass, 1e-10), centre);
    }
    const list = history.get(sim) ?? [];
    list.push(ledger);
    if (list.length > 24)
        list.shift();
    history.set(sim, list);
}
function destructionLedgers(sim) {
    return (history.get(sim) ?? []).map((e) => Object.freeze({ ...e }));
}

},
"src/simulation/destruction.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanStructure = scanStructure;
exports.structural = structural;
exports.advanceCollapse = advanceCollapse;
exports.updateDebris = updateDebris;
exports.emitParticle = emitParticle;
const config_1 = require("../core/config");
const math_1 = require("../core/math");
const structural_bays_1 = require("../world/structural-bays");
const structure_1 = require("../world/structure");
const collision_geometry_1 = require("./collision-geometry");
const destruction_budget_1 = require("./destruction-budget");
const rubble_1 = require("./rubble");
const section_mesh_1 = require("./section-mesh");
const section_tree_1 = require("./section-tree");
const overloads = new WeakMap();
function* assess(sim, b) {
    if (b.structure) {
        const before = b.structure.failures;
        b.dirty = yield* (0, structural_bays_1.solveStructuralBays)(sim.world, b, sim.simTime);
        if (b.structure.failures > before) {
            sim.addDust({ x: b.x + b.w / 2, y: b.base + 2, z: b.z + b.d / 2 }, 3, 0.35);
            sim.soundAt('crack', b.x + b.w / 2, b.z + b.d / 2, 0.5);
        }
        return;
    }
    const revision = b.rev;
    const counts = new Float32Array(b.h + 1), mx = new Float32Array(b.h + 1), mz = new Float32Array(b.h + 1);
    const seen = new Uint8Array(b.w * b.d * counts.length), queue = [];
    const index = (x, y, z) => (y * b.d + z) * b.w + x;
    for (let z = 0; z < b.d; z++)
        for (let x = 0; x < b.w; x++)
            if ((0, structure_1.bearsLoad)(sim.world.cell(b.x + x, b.base, b.z + z)) &&
                sim.world.cell(b.x + x, b.base - 1, b.z + z)) {
                const key = index(x, 0, z);
                seen[key] = 1;
                queue.push(key);
            }
    for (let head = 0; head < queue.length; head++) {
        const key = queue[head], x = key % b.w, z = Math.floor(key / b.w) % b.d, y = Math.floor(key / (b.w * b.d));
        if (head % 128 === 0)
            yield;
        const capacity = (0, structure_1.supportCapacity)(sim.world, b.x + x, b.base + y, b.z + z);
        counts[y] += capacity;
        mx[y] += x * capacity;
        mz[y] += z * capacity;
        for (const [dx, dy, dz] of [
            [1, 0, 0],
            [-1, 0, 0],
            [0, 1, 0],
            [0, -1, 0],
            [0, 0, 1],
            [0, 0, -1],
        ]) {
            const xx = x + dx, yy = y + dy, zz = z + dz;
            if (xx < 0 || zz < 0 || yy < 0 || xx >= b.w || zz >= b.d || yy >= counts.length)
                continue;
            const near = index(xx, yy, zz);
            if (!seen[near] && (0, structure_1.bearsLoad)(sim.world.cell(b.x + xx, b.base + yy, b.z + zz))) {
                seen[near] = 1;
                queue.push(near);
            }
        }
    }
    if (revision !== b.rev)
        return;
    const fracture = Math.min(b.fractureHeight ?? Infinity, (0, structure_1.failedSupportLevel)(b, counts, mx, mz));
    if (Number.isFinite(fracture) && fracture !== b.fractureHeight) {
        const memory = overloads.get(b);
        const ticks = memory?.level === fracture ? memory.ticks + 1 : 1;
        overloads.set(b, { level: fracture, ticks });
        if (counts[fracture - b.base] > 0 && ticks < 3)
            return;
        b.fractureHeight = fracture;
        // Legacy authored shapes use a virtual seam, not whole-storey voxel deletion.
        sim.addDust({ x: b.x + b.w / 2, y: fracture, z: b.z + b.d / 2 }, Math.min(5, b.w / 2), 0.5);
        const level = fracture - b.base;
        b.collapseDirection = (0, structure_1.collapseDirection)(b, counts[level], mx[level], mz[level]);
        sim.world.support.invalidateBuilding(b.x, b.z, b.w, b.d);
        sim.notify('STRUCTURE FAILING · SUPPORT LOST');
    }
    b.dirty = false;
}
function* scanStructure(b) {
    if (b) {
        const revision = b.rev;
        yield;
        if (b.rev !== revision) {
            b.dirty = true;
            return;
        }
        yield* assess(this, b);
    }
    const unsupported = yield* this.world.support.unsupported();
    for (const component of unsupported) {
        // Support connectivity defines the rigid body; spatial tiles are never fracture planes.
        const chunks = [component];
        for (const voxels of chunks) {
            if (voxels.some((v) => this.world.cell(v.x, v.y, v.z) !== v.material))
                continue;
            const first = voxels[0], building = this.world.buildings[this.world.buildingMap[first.z * config_1.W + first.x] - 1];
            const direction = building?.collapseDirection ?? {
                x: Math.sin(first.x + first.z),
                y: 0,
                z: Math.cos(first.x + first.z),
            };
            const lean = Math.min(5, 0.8 + Math.max(0, first.y - (building?.fractureHeight ?? first.y)) * 0.06);
            const additions = this.world.additionRevision;
            const revision = building?.rev;
            this.collapsePreparing = true;
            for (const v of voxels)
                v.damage = this.world.damage.get(this.world.index(v.x, v.y, v.z)) ?? 0;
            const body = yield* (0, rubble_1.createRubble)(this, voxels, { x: direction.x * lean, y: -0.3, z: direction.z * lean }, true);
            if (!body)
                throw Error('Unable to detach structural section');
            yield* (0, section_tree_1.prepareSectionTree)(body);
            yield* (0, collision_geometry_1.prepareCollisionBoxes)(body);
            yield* (0, section_mesh_1.prepareSectionMesh)(body, this.world.colours);
            const terrain = yield* this.world.prepareDetach(voxels);
            this.collapsePreparing = false;
            if (terrain.some((item) => this.world.chunkRevisions[item.chunk.z * config_1.NX + item.chunk.x] !== item.revision) ||
                additions !== this.world.additionRevision ||
                revision !== building?.rev ||
                voxels.some((v) => this.world.cell(v.x, v.y, v.z) !== v.material)) {
                this.world.support.invalidateBuilding(body.x, body.z, body.width, body.depth);
                continue;
            }
            body.damage = new Map();
            for (const v of body.voxels) {
                v.damage =
                    this.world.damage.get(this.world.index(v.x + body.x, v.y + body.y, v.z + body.z)) ?? 0;
                if (v.damage)
                    body.damage.set(v, v.damage);
            }
            this.rubble.push(body);
            // Contact geometry and impulses determine angular motion.
            this.world.detach(voxels);
            for (const item of terrain) {
                Object.assign(item.chunk, {
                    mesh: item.mesh.mesh,
                    count: item.mesh.count,
                    top: item.mesh.top,
                    version: item.chunk.version + 1,
                    dirty: false,
                });
                this.world.dirtyQueue.delete(item.chunk.z * config_1.NX + item.chunk.x);
            }
        }
    }
}
function structural(b) {
    return this.scanStructure(b);
}
const assessmentClocks = new WeakMap();
function advanceCollapse() {
    const clock = assessmentClocks.get(this) ?? { tick: 0, next: 0 };
    assessmentClocks.set(this, clock);
    clock.tick++;
    if (!this.collapseTask) {
        const sim = this;
        this.collapseTask = (function* () {
            if (clock.tick >= clock.next) {
                clock.next = clock.tick + 3; // 10 Hz at the shared 30 Hz simulation rate.
                for (const b of sim.world.buildings)
                    if (b.dirty)
                        yield* assess(sim, b);
            }
            if (sim.world.support.dirty.size)
                yield* sim.scanStructure();
        })();
    }
    const start = performance.now();
    const budget = this.destructionBudget ?? (0, destruction_budget_1.newDestructionBudget)();
    while (this.collapseTask && performance.now() - start < 4) {
        const phase = this.collapsePreparing ? 'prepareMs' : 'supportMs';
        if (budget[phase] <= 0)
            break;
        const before = performance.now();
        if (this.collapseTask.next().done) {
            this.collapseTask = null;
            this.collapsePreparing = false;
        }
        budget[phase] -= performance.now() - before;
    }
    const elapsed = performance.now() - start;
    this.destructionStats.supportMs = elapsed;
    this.destructionStats.maxSupportMs = Math.max(this.destructionStats.maxSupportMs, elapsed);
}
function updateDebris(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life -= dt;
        if (p.life <= 0) {
            this.particles.splice(i, 1);
            continue;
        }
        if (p.settled)
            continue;
        p.vy = Math.max(-42, p.vy - 18 * dt);
        const steps = Math.max(1, Math.ceil((Math.max(Math.abs(p.vx), Math.abs(p.vy), Math.abs(p.vz)) * dt) / 0.25));
        for (let j = 0; j < steps; j++) {
            const d = dt / steps, x = p.x + p.vx * d, y = p.y + p.vy * d, z = p.z + p.vz * d;
            if (this.world.solid(x, p.y, p.z))
                p.vx *= -0.25;
            else
                p.x = x;
            if (this.world.solid(p.x, p.y, z))
                p.vz *= -0.25;
            else
                p.z = z;
            if (y < p.size * 0.5 + 1 || this.world.solid(p.x, y - p.size * 0.5, p.z)) {
                if (p.vy < -8 && p.size > 0.65) {
                    this.neighbours(p.x, p.z, 2, (a) => {
                        if (a.alive && Math.abs(a.y - p.y) < 2 && (0, math_1.dist2)(a, p) < 2)
                            this.hurt(a, Math.min(55, Math.abs(p.vy) * p.size * 1.4), null);
                    });
                }
                p.vy = Math.abs(p.vy) * 0.18;
                p.vx *= 0.6;
                p.vz *= 0.6;
                if (p.vy < 0.5 && Math.hypot(p.vx, p.vz) < 0.3) {
                    p.settled = true;
                    break;
                }
            }
            else
                p.y = y;
        }
        p.yaw += p.spin * dt;
        p.pitch += p.spin * 0.7 * dt;
    }
}
function emitParticle(x, y, z, c, size = 0.2, speed = 5, life = 2) {
    if (this.particles.length >= 420)
        return;
    this.particles.push({
        x,
        y,
        z,
        vx: this.effectRnd(-speed, speed),
        vy: this.effectRnd(speed * 0.2, speed),
        vz: this.effectRnd(-speed, speed),
        c,
        size,
        life,
        max: life,
        yaw: this.effectRnd(0, math_1.TAU),
        pitch: 0,
        spin: this.effectRnd(-5, 5),
    });
}

},
"src/simulation/equipment.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.equipmentLimits = void 0;
exports.count = count;
exports.needsSupplies = needsSupplies;
exports.refill = refill;
exports.deploymentStatus = deploymentStatus;
exports.deploy = deploy;
exports.smoke = smoke;
exports.throwSmoke = throwSmoke;
exports.tickEquipment = tickEquipment;
exports.aiEquipment = aiEquipment;
const config_1 = require("../core/config");
const loadout_1 = require("../core/loadout");
const math_1 = require("../core/math");
const projectiles_1 = require("../core/projectiles");
const npc_state_1 = require("./npc-state");
const section_query_1 = require("./section-query");
exports.equipmentLimits = { smokeClouds: 12, deployables: 24, npcDeployables: 20 };
function count(sim, key, amount = 1) {
    sim.testStats[key] += amount;
}
function needsSupplies(sim, a) {
    if (a.player)
        return ((0, loadout_1.loadout)(sim).some((id) => sim.reserves[id] < config_1.weapons[id].reserve) ||
            sim.grenades < 3 ||
            sim.smokeGrenades < 2);
    return (a.clip < config_1.weapons[a.primaryWeapon].mag * 0.7 ||
        a.secondaryClip < config_1.weapons[a.secondaryWeapon].mag ||
        (a.kit === 'engineer' && a.rockets < 3) ||
        a.fragCharges < 2 ||
        a.smokes < 1);
}
/** A finite supply pulse. Reserve ammo never silently changes the player's loaded magazine. */
function refill(sim, a) {
    let useful = false;
    if (a.player) {
        for (const id of (0, loadout_1.loadout)(sim)) {
            const before = sim.reserves[id];
            sim.reserves[id] = Math.min(config_1.weapons[id].reserve, before + (id === 2 ? 1 : config_1.weapons[id].mag * 2));
            useful ||= before !== sim.reserves[id];
        }
        if (sim.grenades < 3) {
            sim.grenades++;
            useful = true;
        }
        if (sim.smokeGrenades < 2) {
            sim.smokeGrenades++;
            useful = true;
        }
    }
    else {
        const w = config_1.weapons[a.primaryWeapon], sw = config_1.weapons[a.secondaryWeapon];
        if (a.clip < w.mag * 0.7) {
            a.clip = w.mag;
            a.reload = 0;
            useful = true;
        }
        if (a.secondaryClip < sw.mag) {
            a.secondaryClip = sw.mag;
            a.secondaryReload = 0;
            useful = true;
        }
        if (a.kit === 'engineer' && a.rockets < 3) {
            a.rockets++;
            useful = true;
        }
        if (a.fragCharges < 2) {
            a.fragCharges++;
            useful = true;
        }
        if (a.smokes < 1) {
            a.smokes++;
            useful = true;
        }
    }
    return useful;
}
function supported(sim, p) {
    return (sim.world.solid(p.x, p.y - 0.15, p.z) ||
        (0, section_query_1.sectionBlocked)(sim, { ...p, y: p.y - 0.16 }, 0.23, 0.12));
}
function deploymentStatus(sim, a, kind) {
    if (!a.alive ||
        a.vehicle ||
        a.actionUntil > sim.simTime ||
        !['medical', 'ammo'].includes(kind) ||
        (kind === 'medical' ? a.kit !== 'medic' : a.kit !== 'support') ||
        sim.deployables.length >= exports.equipmentLimits.deployables)
        return { reason: 'Equipment unavailable or still readying' };
    if (!a.player &&
        (sim.deployables.filter((d) => !d.playerOwned).length >= exports.equipmentLimits.npcDeployables ||
            sim.deployables.some((d) => d.team === a.team &&
                d.kind === kind &&
                d.life > 6 &&
                d.charges > 0 &&
                Math.abs(d.y - a.y) < 3 &&
                Math.hypot(d.x - a.x, d.z - a.z) < 7)))
        return { reason: 'Supplies already cover this area' };
    if (sim.deployables.some((d) => d.ownerId === a.id && d.kind === kind && d.life > 0 && d.charges > 0))
        return { reason: 'One active supply per owner' };
    const yaw = a.player ? sim.yaw : a.yaw;
    const x = a.x + Math.sin(yaw) * 0.85, z = a.z + Math.cos(yaw) * 0.85;
    // Use the actor's local floor, not groundAt's highest surface (which can be the roof).
    const p = { x, y: a.y, z };
    let placed = false;
    for (const dy of [0, -0.02, 0.02, -1, 1]) {
        p.y = a.y + dy;
        if (supported(sim, p) &&
            !sim.occupied(a, x, p.y + 0.025, z, 0.32, 0.48) &&
            (0, section_query_1.clearSegment)(sim, { x: a.x, y: a.y + 0.7, z: a.z }, { x, y: p.y + 0.3, z }) &&
            !sim.actors.some((b) => b !== a &&
                b.alive &&
                !b.vehicle &&
                Math.abs(b.y - p.y) < 1 &&
                Math.hypot(b.x - x, b.z - z) < 0.65)) {
            placed = true;
            break;
        }
    }
    return placed ? { position: p, reason: '' } : { reason: 'Clear, supported ground required' };
}
function deploy(sim, a, kind) {
    const status = deploymentStatus(sim, a, kind), p = status.position;
    if (!p)
        return false;
    const { x, z } = p;
    sim.deployables.push({
        ...p,
        kind,
        ownerId: a.id,
        ownerEpoch: a.lifeEpoch ?? 0,
        playerOwned: a.player,
        team: a.team,
        life: 40,
        age: 0,
        charges: kind === 'medical' ? 18 : 12,
        next: sim.simTime,
        used: new Map(),
    });
    a.actionUntil = sim.simTime + 0.65;
    a.action = kind === 'medical' ? 'DEPLOY MEDICAL' : 'DEPLOY AMMO';
    a.shield = 0;
    count(sim, kind === 'medical' ? 'medicalBags' : 'ammoCrates');
    sim.soundAt('support', x, z, 0.5);
    if (a.player) {
        sim.input.aim = false;
        sim.handling.ready = 0.65;
        sim.notify(kind === 'medical' ? 'Medical bag deployed' : 'Ammo crate deployed');
    }
    return true;
}
function smoke(sim, point, source) {
    if (![point.x, point.y, point.z].every(Number.isFinite))
        return;
    // Never lift an indoor cloud to a building's roof. Constrain its centre below nearby ceilings.
    let y = point.y + 1.3;
    for (let t = 0.2; t <= 1.3; t += 0.2)
        if (sim.world.solid(point.x, point.y + t, point.z)) {
            y = point.y + t - 0.2;
            break;
        }
    if (sim.smokeClouds.length >= exports.equipmentLimits.smokeClouds)
        sim.smokeClouds.shift();
    sim.smokeClouds.push({
        x: point.x,
        y,
        z: point.z,
        life: 14,
        age: 0,
        radius: projectiles_1.projectileSpec.smoke.radius,
        team: source?.team ?? -1,
    });
    sim.soundAt('launcher', point.x, point.z, 0.22);
}
function throwSmoke(sim) {
    const p = sim.player;
    if (!sim.acceptsInput ||
        p.vehicle ||
        sim.smokeGrenades <= 0 ||
        sim.grenadeTime > 0 ||
        p.actionUntil > sim.simTime)
        return false;
    if (!sim.launch(p, { x: p.x, y: p.y + p.height - 0.18, z: p.z }, (0, math_1.direction)(sim.yaw, sim.pitch), 'smoke'))
        return false;
    sim.smokeGrenades--;
    sim.grenadeTime = 0.7;
    sim.input.aim = false;
    return true;
}
function tickEquipment(sim, dt) {
    if (!Number.isFinite(dt) || dt <= 0)
        return;
    for (let i = sim.smokeClouds.length - 1; i >= 0; i--) {
        const c = sim.smokeClouds[i];
        c.age += dt;
        c.life -= dt;
        if (c.life <= 0)
            sim.smokeClouds.splice(i, 1);
    }
    for (let i = sim.deployables.length - 1; i >= 0; i--) {
        const d = sim.deployables[i];
        d.life -= dt;
        d.age += dt;
        if (d.life > 0 && d.charges > 0 && d.next <= sim.simTime) {
            d.next = sim.simTime + 1;
            if (!supported(sim, d))
                d.life = 0;
            else {
                for (const [id, use] of d.used)
                    if (use.until <= sim.simTime || !sim.actors[id])
                        d.used.delete(id);
                sim.neighbours(d.x, d.z, 5, (a) => {
                    const last = d.used.get(a.id);
                    if (!a.alive ||
                        a.vehicle ||
                        a.team !== d.team ||
                        d.charges <= 0 ||
                        Math.hypot(a.x - d.x, a.y - d.y, a.z - d.z) > 5 ||
                        (last && last.epoch === (a.lifeEpoch ?? 0) && last.until > sim.simTime) ||
                        !(0, section_query_1.clearSegment)(sim, { x: d.x, y: d.y + 0.5, z: d.z }, { x: a.x, y: a.y + 0.8, z: a.z }))
                        return;
                    let useful = false;
                    if (d.kind === 'medical' &&
                        a.hp < 100 &&
                        sim.simTime - a.lastHit > 1.5 &&
                        sim.simTime - a.lastMedicalBagAt > 0.95) {
                        a.hp = Math.min(100, a.hp + 12);
                        a.lastMedicalBagAt = sim.simTime;
                        useful = true;
                        count(sim, 'heals');
                    }
                    else if (d.kind === 'ammo' && sim.simTime - a.lastAmmoBagAt >= 10) {
                        useful = refill(sim, a);
                        if (useful) {
                            a.lastAmmoBagAt = sim.simTime;
                            count(sim, 'resupplies');
                        }
                    }
                    if (!useful)
                        return;
                    d.charges--;
                    d.used.set(a.id, {
                        until: sim.simTime + (d.kind === 'ammo' ? 10 : 1),
                        epoch: a.lifeEpoch ?? 0,
                    });
                    const owner = sim.actors[d.ownerId];
                    if (d.playerOwned &&
                        owner?.player &&
                        owner !== a &&
                        (owner.lifeEpoch ?? 0) === d.ownerEpoch)
                        sim.award(d.kind === 'medical' ? 'FIELD HEAL' : 'FIELD RESUPPLY', 10, d.kind === 'medical' ? 'medkit' : 'ammo_pack', d.kind === 'medical' ? 'heals' : 'resupplies');
                });
            }
        }
        if (d.life <= 0 || d.charges <= 0) {
            d.used.clear();
            sim.deployables.splice(i, 1);
        }
    }
}
/** Runs on the fair decision service; no per-frame scan for every equipment user. */
function aiEquipment(sim, a) {
    if (a.nextEquipment > sim.simTime || !a.alive || a.vehicle || a.actionUntil > sim.simTime)
        return;
    a.nextEquipment = sim.simTime + 2 + (a.id % 5) * 0.21;
    const brain = (0, npc_state_1.npcState)(a);
    if (a.smokes > 0 &&
        (brain.task?.kind === 'REVIVE' || (a.hp < 35 && a.target)) &&
        sim.simTime - a.lastSmoke > 25 &&
        !sim.smokeClouds.some((c) => c.life > 2 && Math.hypot(c.x - a.x, c.y - a.y, c.z - a.z) < 12)) {
        const point = brain.task?.target ?? a;
        const distance = Math.hypot(point.x - a.x, point.z - a.z);
        const yaw = distance > 1 ? Math.atan2(point.x - a.x, point.z - a.z) : a.yaw;
        const pitch = distance > 8 ? 0.02 : -0.85;
        if (sim.launch(a, { x: a.x, y: a.y + a.height - 0.18, z: a.z }, (0, math_1.direction)(yaw, pitch), 'smoke')) {
            a.smokes--;
            a.lastSmoke = sim.simTime;
            a.action = 'SMOKE';
            a.actionUntil = sim.simTime + 0.8;
            count(sim, 'smokes');
            return;
        }
    }
    let wounded = 0, needAmmo = 0;
    sim.neighbours(a.x, a.z, 6, (b) => {
        if (b.team !== a.team ||
            !b.alive ||
            b.vehicle ||
            Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) > 6)
            return;
        if (b.hp < 82)
            wounded++;
        if (b.player
            ? sim.reserves[sim.weaponIndex] < config_1.weapons[sim.weaponIndex].mag * 2
            : b.clip < config_1.weapons[loadout_1.primary[b.kit ?? 'assault']].mag * 0.35 ||
                (b.kit === 'engineer' && b.rockets < 2))
            needAmmo++;
    });
    if (a.kit === 'medic' && wounded && !brain.task && deploy(sim, a, 'medical'))
        a.nextEquipment = sim.simTime + 36;
    else if (a.kit === 'support' && needAmmo && !brain.task && deploy(sim, a, 'ammo'))
        a.nextEquipment = sim.simTime + 38;
    else if (a.kit === 'assault' && a.hp < 60 && sim.simTime - a.lastHit > 3) {
        a.hp = Math.min(100, a.hp + 25);
        a.nextEquipment = sim.simTime + 20;
        a.action = 'FIELD DRESSING';
        a.actionUntil = sim.simTime + 1;
        count(sim, 'dressings');
    }
}

},
"src/simulation/gameplay.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.squadComposition = void 0;
exports.revive = revive;
exports.healFriendly = healFriendly;
exports.resupply = resupply;
exports.classAbility = classAbility;
exports.aiClassBehaviour = aiClassBehaviour;
exports.pingAt = pingAt;
exports.ping = ping;
exports.updateStrategy = updateStrategy;
const mathModule = require("../core/math");
const equipment_1 = require("./equipment");
const interactions_1 = require("./interactions");
const navigation_1 = require("./navigation");
const npc_stateModule = require("./npc-state");
const perception_1 = require("./perception");
const player_actions_1 = require("./player-actions");
const section_queryModule = require("./section-query");
const tactics_1 = require("./tactics");
exports.squadComposition = [
    'assault',
    'medic',
    'support',
    'engineer',
    'recon',
    'assault',
    'medic',
    'support',
    'engineer',
    'assault',
];
const visible = (sim, a, b, range) => mathModule.dist2(a, b) < range * range &&
    (0, perception_1.canSee)(sim, { x: a.x, y: a.y + 1, z: a.z }, { x: b.x, y: b.y + 1, z: b.z });
const nearby = (sim, a, b, range) => mathModule.dist2(a, b) < range * range &&
    Math.abs(a.y - b.y) < 3 &&
    section_queryModule.clearSegment(sim, { x: a.x, y: a.y + 1, z: a.z }, { x: b.x, y: b.y + 1, z: b.z });
function revive(sim, medic, target) {
    if (!medic.alive ||
        medic.vehicle ||
        target.alive ||
        target.vehicle ||
        medic.team !== target.team ||
        (target.reviveUntil ?? 0) <= sim.simTime ||
        !(0, interactions_1.canInteract)(sim, medic, target, 4))
        return false;
    if (sim.occupied(target, target.x, target.y, target.z, 0.3, 1.8))
        return false;
    Object.assign(target, {
        alive: true,
        hp: 50,
        respawn: 0,
        reviveUntil: 0,
        shield: 1.1,
        target: null,
        armourTarget: null,
        vx: 0,
        vy: 0,
        vz: 0,
        lastHit: sim.simTime,
    });
    npc_stateModule.retireNPC(sim, target);
    sim.damageContributions.delete(target.id);
    sim.tickets[target.team] = Math.min(6000, sim.tickets[target.team] + 1);
    if (medic.player)
        sim.award('REVIVE', 100, 'medkit', 'revives');
    if (target.player) {
        sim.notify('REVIVED BY YOUR MEDIC', target.team);
        sim.events.push({ type: 'revived' });
    }
    sim.soundAt('support', target.x, target.z, 0.4);
    return true;
}
function healFriendly(sim, medic, target) {
    if (medic.vehicle ||
        target.vehicle ||
        !medic.alive ||
        !target.alive ||
        target.hp >= 95 ||
        medic.team !== target.team ||
        medic === target ||
        !(0, interactions_1.canInteract)(sim, medic, target, 4))
        return false;
    const amount = Math.min(35, 100 - target.hp);
    target.hp += amount;
    if (medic.player)
        sim.award('TEAM HEAL', Math.round(amount), 'medkit', 'heals');
    if (target.player)
        sim.notify('MEDIC · HEALTH RESTORED', target.team);
    sim.soundAt('support', target.x, target.z, 0.25);
    return true;
}
function resupply(sim, support, target) {
    if (!support.alive ||
        support.vehicle ||
        !target.alive ||
        target.team !== support.team ||
        target === support ||
        !(0, interactions_1.canInteract)(sim, support, target, 5) ||
        (target.lastResupply ?? -100) > sim.simTime - 15)
        return false;
    const useful = (0, equipment_1.refill)(sim, target);
    if (!useful)
        return false;
    target.lastResupply = sim.simTime;
    if (support.player)
        sim.award('AMMO RESUPPLY', 35, 'ammo_pack', 'resupplies');
    if (target.player)
        sim.notify('SUPPORT · AMMUNITION REPLENISHED', target.team);
    return true;
}
function squadTargets(sim, a) {
    return (sim.squads[a.squadId]?.memberIds ?? [])
        .map((i) => sim.actors[i])
        .filter((t) => t && t !== a);
}
function classAbility() {
    const p = this.player, q = (0, player_actions_1.kitStatus)(this);
    if (!q.available) {
        if (this.acceptsInput)
            this.notify(q.reason);
        return;
    }
    if (q.action === 'revive' || q.action === 'heal') {
        const did = q.action === 'revive' ? revive(this, p, q.target) : healFriendly(this, p, q.target);
        if (did)
            this.classClock = 5 * (this.itemTuning.medkit ?? 1);
    }
    else if (q.action === 'medical' || q.action === 'ammo') {
        if ((0, equipment_1.deploy)(this, p, q.action))
            this.classClock = 8 * (this.itemTuning[q.action === 'medical' ? 'medkit' : 'ammo_pack'] ?? 1);
    }
    else if (q.action === 'resupply') {
        if (resupply(this, p, q.target))
            this.classClock = 6 * (this.itemTuning.ammo_pack ?? 1);
    }
    else if (q.action === 'repair' || q.action === 'fortify')
        this.fortify();
    else if (q.action === 'dress')
        this.heal();
    else if (q.action === 'spot') {
        let marked = 0;
        this.neighbours(p.x, p.z, 90, (a) => {
            if (marked < 3 && a.alive && a.team !== p.team && visible(this, p, a, 90)) {
                this.pingAt(a, a.id);
                marked++;
            }
        });
        if (marked)
            this.classClock = 16 * (this.itemTuning.spotter ?? 1);
    }
}
function aiClassBehaviour(sim, a) {
    if (!a.alive || a.vehicle)
        return;
    const brain = npc_stateModule.npcState(a);
    const reservations = npc_stateModule.supportReservationsFor(sim);
    const own = (target) => {
        const reservation = reservations.get(target);
        return (!reservation ||
            reservation.actor === a ||
            reservation.until < sim.simTime ||
            !reservation.actor.alive ||
            sim.actors[reservation.actor.id] !== reservation.actor);
    };
    // Danger interrupts the task, whereas an ability cooldown does not cancel its approach.
    if (sim.simTime - a.lastHit < 1.1 || (a.target && mathModule.dist2(a, a.target) < 100)) {
        if (brain.task)
            reservations.delete(brain.task.target);
        brain.task = null;
        brain.reason = 'Immediate threat takes priority';
        return;
    }
    let task = brain.task;
    if (task) {
        const target = task.target;
        const complete = task.kind === 'REVIVE'
            ? 'reviveUntil' in target
                ? target.alive || (target.reviveUntil ?? 0) <= sim.simTime
                : true
            : !target.alive ||
                (task.kind === 'HEAL' && target.hp >= 95) ||
                (task.kind === 'REPAIR' && target.hp >= 595);
        if (complete || task.until < sim.simTime || mathModule.dist2(a, target) > 900 || !own(target)) {
            if (own(target))
                reservations.delete(target);
            brain.task = task = null;
        }
    }
    if (!task && sim.simTime >= (a.supportReady ?? 0)) {
        const team = squadTargets(sim, a).filter((t) => mathModule.dist2(a, t) < 484 && Math.abs(a.y - t.y) < 21 && own(t));
        let target, kind = 'HEAL';
        if (a.kit === 'medic') {
            target = team
                .filter((t) => !t.alive &&
                (t.reviveUntil ?? 0) >
                    sim.simTime +
                        0.85 +
                        Math.sqrt(mathModule.dist2(a, t)) / 4.6 +
                        Math.abs(a.y - t.y) * 0.24)
                .sort((x, y) => mathModule.dist2(a, x) - mathModule.dist2(a, y))[0];
            if (target)
                kind = 'REVIVE';
            else
                target = team.filter((t) => t.alive && t.hp < 72).sort((x, y) => x.hp - y.hp)[0];
        }
        else if (a.kit === 'engineer' && !a.armourTarget) {
            target = sim.vehicles
                .filter((v) => v.alive &&
                v.team === a.team &&
                v.hp < 480 &&
                mathModule.dist2(a, v) < 625 &&
                Math.abs(v.y - a.y) < 2.5 &&
                own(v))
                .sort((x, y) => mathModule.dist2(a, x) - mathModule.dist2(a, y))[0];
            kind = 'REPAIR';
        }
        else if (a.kit === 'support') {
            target = team.find((t) => t.alive && (t.lastResupply ?? -100) < sim.simTime - 15 && (0, equipment_1.needsSupplies)(sim, t));
            kind = 'RESUPPLY';
        }
        if (target) {
            task = { kind, target, phase: 'APPROACH', until: sim.simTime + 10, started: 0 };
            brain.task = task;
            reservations.set(target, { actor: a, until: task.until });
        }
    }
    if (task) {
        const target = task.target, d = Math.sqrt(mathModule.dist2(a, target)), range = task.kind === 'REPAIR' ? 4.5 : 2.8;
        brain.reason = task.kind + ' / ' + task.phase;
        if (d < range && nearby(sim, a, target, range + 0.3)) {
            a.dx = a.dz = 0;
            a.tactic = task.kind;
            task.phase = 'WORK';
            if (!a.crouched) {
                a.crouched = true;
                a.height = 1.25;
            }
            if (!task.started)
                task.started = sim.simTime;
            if (sim.simTime - task.started < 0.85 || sim.simTime < (a.supportReady ?? 0))
                return;
            let done = false;
            if (task.kind === 'REVIVE') {
                done = 'id' in target && revive(sim, a, target);
                if (done)
                    sim.testStats.revives++;
            }
            else if (task.kind === 'HEAL') {
                done = 'id' in target && healFriendly(sim, a, target);
                if (done)
                    sim.testStats.heals++;
            }
            else if (task.kind === 'RESUPPLY') {
                done = 'id' in target && resupply(sim, a, target);
                if (done)
                    sim.testStats.resupplies++;
            }
            else if (!('id' in target)) {
                done = (0, interactions_1.repairVehicle)(sim, a, target, 80);
                if (done)
                    sim.testStats.repairs++;
            }
            if (done) {
                a.supportReady = sim.simTime + 4;
                reservations.delete(target);
                brain.task = null;
                brain.reason = task.kind + ' complete';
            }
            return;
        }
        task.started = 0;
        task.phase = 'APPROACH';
        let point = target;
        if (!(0, navigation_1.walkSegment)(sim, a, target)) {
            const path = (0, navigation_1.routeActor)(sim, a, target);
            task.phase = 'ROUTE';
            if (path.status === 'pending' ||
                path.status === 'unreachable' ||
                mathModule.dist2(a, path.point) < 0.02) {
                a.dx = a.dz = 0;
                a.tactic = task.kind + ' / ROUTE';
                if (path.status === 'unreachable')
                    npc_stateModule.cancelSupportTask(sim, a, 'No reachable support route');
                return;
            }
            point = path.point;
        }
        const angle = Math.atan2(point.x - a.x, point.z - a.z);
        a.dx = a.dz = 0;
        for (const offset of [0, 0.55, -0.55, 1.1, -1.1]) {
            const dx = Math.sin(angle + offset), dz = Math.cos(angle + offset);
            if (!sim.occupied(a, a.x + dx * 0.9, a.y, a.z + dz * 0.9, 0.34, a.height)) {
                a.dx = dx;
                a.dz = dz;
                break;
            }
        }
        a.tactic = task.kind + ' / MOVE';
        return;
    }
    if (a.kit === 'recon' &&
        a.target?.alive &&
        sim.simTime >= (a.supportReady ?? 0) &&
        visible(sim, a, a.target, 95)) {
        const target = a.target;
        (0, tactics_1.observeContact)(sim, a, target);
        const existing = sim.pings.find((p) => p.team === a.team && p.targetId === target.id);
        if (existing)
            Object.assign(existing, { x: target.x, y: target.y, z: target.z, expires: sim.simTime + 8 });
        if (!sim.pings.some((p) => p.team === a.team && p.targetId === target.id)) {
            sim.pings.push({
                x: target.x,
                y: target.y,
                z: target.z,
                kind: 'enemy',
                team: a.team,
                expires: sim.simTime + 8,
                targetId: target.id,
            });
            if (sim.pings.length > 32)
                sim.pings.shift();
        }
        a.supportReady = sim.simTime + 8;
        brain.reason = 'Observed enemy reported to squad';
    }
}
function pingAt(point, targetId) {
    const p = this.player;
    const target = targetId === undefined ? undefined : this.actors[targetId];
    if (!p.alive || !this.playing || ![point.x, point.y, point.z].every(Number.isFinite))
        return false;
    if (target && (!target.alive || target.team === p.team || !visible(this, p, target, 125)))
        return false;
    const existing = this.pings.find((q) => q.team === p.team && q.targetId !== undefined && q.targetId === targetId);
    if (existing) {
        Object.assign(existing, { x: point.x, y: point.y, z: point.z, expires: this.simTime + 10 });
        return true;
    }
    this.pings.push({
        x: point.x,
        y: point.y,
        z: point.z,
        team: p.team,
        kind: target ? 'enemy' : 'location',
        targetId,
        expires: this.simTime + 10,
    });
    if (target && (this.spotCooldowns.get(target.id) ?? -100) < this.simTime - 30) {
        this.spotCooldowns.set(target.id, this.simTime);
        this.award('ENEMY SPOTTED', 10, 'spotter', 'spots');
    }
    if (this.pings.length > 16)
        this.pings.shift();
    this.soundAt('ping', p.x, p.z, 0.3);
    return true;
}
function ping() {
    if (!this.acceptsInput || this.simTime < this.nextPing)
        return;
    this.nextPing = this.simTime + 1;
    const p = this.player, o = { x: p.x, y: p.y + 1.5, z: p.z }, d = mathModule.direction(this.yaw, this.pitch), wall = this.world.raycast(o, d, 125);
    let nearest = wall?.t ?? 125, target;
    for (const a of this.rayActors(o, d, nearest))
        if (a.alive && a.team !== p.team) {
            const t = this.rayBox(o, d, { x: a.x, y: a.y + 1, z: a.z, xr: 1.0, yr: 1, zr: 1.0 });
            if (t < nearest) {
                nearest = t;
                target = a;
            }
        }
    this.pingAt(target ?? { x: o.x + d.x * nearest, y: o.y + d.y * nearest, z: o.z + d.z * nearest }, target?.id);
}
function updateStrategy(sim) {
    if (sim.testArena === 'frontline')
        return;
    if (sim.simTime < sim.nextStrategy)
        return;
    sim.nextStrategy = sim.simTime + 1;
    const loads = [new Int16Array(9), new Int16Array(9)];
    for (const q of sim.squads)
        loads[q.team][q.route]++;
    for (let i = 0; i < 10 && sim.squads.length; i++) {
        const q = sim.squads[sim.strategyCursor++ % sim.squads.length];
        if (q.order.kind !== 'objective' || q.leaderId === sim.player.id)
            continue;
        const leader = sim.actors[q.leaderId];
        if (!leader?.alive)
            continue;
        let goal = q.route, best = Infinity;
        for (let j = 0; j < 9; j++) {
            const f = sim.world.flags[j], score = Math.sqrt(mathModule.dist2(leader, f)) * 0.14 +
                loads[q.team][j] * 10 +
                (f.owner === q.team ? (f.contested ? -35 : 30) : f.owner < 0 ? -15 : -35) +
                (j === q.route ? -14 : 0) +
                ((q.id * 7 + j * 3) % 5);
            if (score < best) {
                best = score;
                goal = j;
            }
        }
        loads[q.team][q.route]--;
        q.route = goal;
        loads[q.team][goal]++;
    }
}

},
"src/simulation/interactions.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canInteract = canInteract;
exports.repairVehicle = repairVehicle;
const section_query_1 = require("./section-query");
/** Shared distance, floor and visibility contract for useful player/NPC interactions. */
function canInteract(sim, actor, target, range, vertical = 2.5) {
    if (!actor.alive ||
        actor.vehicle ||
        ![target.x, target.y, target.z, range].every(Number.isFinite))
        return false;
    return (Math.hypot(target.x - actor.x, target.y - actor.y, target.z - actor.z) <= range &&
        Math.abs(target.y - actor.y) <= vertical &&
        (0, section_query_1.clearSegment)(sim, { x: actor.x, y: actor.y + 1, z: actor.z }, { x: target.x, y: target.y + 1, z: target.z }));
}
function repairVehicle(sim, actor, vehicle, amount = 160) {
    if (!vehicle.alive ||
        vehicle.team !== actor.team ||
        vehicle.hp >= 600 ||
        amount <= 0 ||
        !Number.isFinite(amount) ||
        !canInteract(sim, actor, vehicle, 6) ||
        (actor.player ? sim.activeKit : actor.kit) !== 'engineer')
        return false;
    vehicle.hp = Math.min(600, vehicle.hp + amount);
    if (actor.player)
        sim.award('ARMOUR REPAIRED', 40, 'engineer_tool', 'repairs');
    return true;
}

},
"src/simulation/match.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetHandling = resetHandling;
exports.award = award;
exports.notify = notify;
exports.updateProjectiles = updateProjectiles;
exports.capture = capture;
exports.fixedUpdate = fixedUpdate;
const config_1 = require("../core/config");
const math_1 = require("../core/math");
const projectiles_1 = require("../core/projectiles");
const scenarios_1 = require("../core/scenarios");
const equipment_1 = require("./equipment");
const gameplay_1 = require("./gameplay");
const projectile_flight_1 = require("./projectile-flight");
const projectile_sweep_1 = require("./projectile-sweep");
const section_query_1 = require("./section-query");
function resetHandling() {
    this.handling = {
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
}
function award(label, points, itemId, stat, count = 1) {
    if (!Number.isFinite(points) || points < 0)
        return;
    points = Math.floor(points);
    this.score += points;
    if (points > 0) {
        this.awardText = `${label} +${points}`;
        this.awardTime = 2;
        const previous = this.xpFeed.find((e) => e.label === label);
        if (previous) {
            previous.points += points;
            previous.life = 2.5;
        }
        else
            this.xpFeed.unshift({ label, points, life: 2.5 });
        this.xpFeed.length = Math.min(3, this.xpFeed.length);
    }
    if (stat)
        this.roundStats[stat] = (this.roundStats[stat] ?? 0) + count;
    this.events.push({ type: 'xp', label, points, itemId, stat, count });
}
function notify(text, team = 0) {
    const existing = this.feed.find((item) => item.text === text);
    if (existing) {
        existing.life = 6;
        return;
    }
    this.feed.unshift({ text, team, life: 6 });
    if (this.feed.length > 4)
        this.feed.length = 4;
}
function updateProjectiles(dt) {
    if (!Number.isFinite(dt) || dt <= 0)
        return;
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        // Integrate only the remaining fuse; predictor and live flight must stop at the same instant.
        const flightDt = Math.min(dt, Math.max(0, p.life));
        p.life = Math.max(0, p.life - dt);
        if (p.life < 1e-8)
            p.life = 0;
        p.vy -= projectiles_1.projectileSpec[p.type].gravity * flightDt;
        let impact = false;
        const steps = Math.max(1, Math.ceil((Math.hypot(p.vx, p.vy, p.vz) * flightDt) / 0.4)), h = flightDt / steps;
        for (let j = 0; j < steps && !impact; j++) {
            const next = { x: p.x + p.vx * h, y: p.y + p.vy * h, z: p.z + p.vz * h };
            if (p.type === 'grenade' || p.type === 'smoke') {
                (0, projectile_flight_1.moveThrown)(this, p, h);
            }
            else {
                const dx = next.x - p.x, dy = next.y - p.y, dz = next.z - p.z, length = Math.hypot(dx, dy, dz), dir = { x: dx / length, y: dy / length, z: dz / length };
                const hit = (0, projectile_sweep_1.terrainSweep)(this, p, dir, length);
                const section = (0, section_query_1.sectionRay)(this, p, dir, Math.min(length, hit?.t ?? length), projectile_sweep_1.PROJECTILE_RADIUS);
                let t = section?.t ?? (hit ? hit.t : Infinity);
                this.neighbours(p.x, p.z, 3, (a) => {
                    if (!a.alive || a === p.source || a.vehicle)
                        return;
                    const q = this.rayBox(p, dir, {
                        x: a.x,
                        y: a.y + a.height / 2,
                        z: a.z,
                        xr: 0.35 + projectile_sweep_1.PROJECTILE_RADIUS,
                        yr: a.height / 2 + projectile_sweep_1.PROJECTILE_RADIUS,
                        zr: 0.35 + projectile_sweep_1.PROJECTILE_RADIUS,
                    });
                    if (q <= length)
                        t = Math.min(t, q);
                });
                for (const v of this.vehicles)
                    if (v.alive && v !== p.source && v.driver !== p.source) {
                        const q = this.rayBox(p, dir, {
                            x: v.x,
                            y: v.y + v.height / 2,
                            z: v.z,
                            xr: v.radius + projectile_sweep_1.PROJECTILE_RADIUS,
                            yr: v.height / 2 + projectile_sweep_1.PROJECTILE_RADIUS,
                            zr: v.radius + projectile_sweep_1.PROJECTILE_RADIUS,
                        });
                        if (q <= length)
                            t = Math.min(t, q);
                    }
                if (t <= length) {
                    if (section && section.t === t)
                        (0, section_query_1.damageSection)(section.body, section.index, 175);
                    p.x += dir.x * Math.max(0, t - 0.03);
                    p.y += dir.y * Math.max(0, t - 0.03);
                    p.z += dir.z * Math.max(0, t - 0.03);
                    impact = true;
                }
                else
                    Object.assign(p, next);
            }
        }
        if (p.x < 0 || p.x > config_1.W || p.z < 0 || p.z > config_1.D || p.y < 0 || p.y > config_1.H + 10) {
            this.projectiles.splice(i, 1);
            continue;
        }
        if (impact || p.life <= 0) {
            this.projectiles.splice(i, 1);
            if (p.type === 'smoke') {
                (0, equipment_1.smoke)(this, p, p.source);
                continue;
            }
            this.explode(p, projectiles_1.projectileSpec[p.type].radius, p.source, p.type === 'grenade' ? 130 : 175, {
                itemId: p.itemId,
            });
        }
    }
    this.updateDebris(dt);
    for (const list of [this.tracers, this.flashes, this.feed])
        for (let i = list.length - 1; i >= 0; i--) {
            list[i].life -= dt;
            if (list[i].life <= 0)
                list.splice(i, 1);
        }
}
function capture(dt) {
    const control = [0, 0];
    let atPoint = false;
    for (const f of this.world.flags) {
        const count = [0, 0], ground = this.world.groundAt(f.x, f.z);
        this.neighbours(f.x, f.z, 24, (a) => {
            if (a.alive && (0, math_1.dist2)(a, f) < 576 && Math.abs(a.y - ground) < 5)
                count[a.team]++;
        });
        for (const v of this.vehicles)
            if (v.alive && (0, math_1.dist2)(v, f) < 576 && Math.abs(v.y - ground) < 5)
                count[v.team] += 3;
        f.contested = count[0] > 0 && count[1] > 0;
        f.presence = count;
        if (!f.contested && count[0] + count[1])
            f.value = (0, math_1.clamp)(f.value + (count[0] > 0 ? 1 : -1) * dt * 0.06 * Math.min(3, Math.max(...count)), -1, 1);
        const old = f.owner;
        if (f.value >= 0.999)
            f.owner = 0;
        else if (f.value <= -0.999)
            f.owner = 1;
        else if ((f.owner === 0 && f.value <= 0) || (f.owner === 1 && f.value >= 0))
            f.owner = -1;
        const present = this.player.alive && (0, math_1.dist2)(this.player, f) < 576 && Math.abs(this.player.y - ground) < 5;
        if (old !== f.owner && f.owner >= 0) {
            this.notify(`${f.owner === 0 ? 'AEGIS' : 'CINDER'} CAPTURED ${f.name} / ${f.title}`, f.owner);
            if (f.owner === this.player.team && present) {
                this.flagCaptures++;
                this.award(`${f.name} CAPTURED`, 300, undefined, 'captures');
                const squad = this.squads[this.player.squadId];
                if (squad?.order.kind === 'objective' && this.world.flags[squad.route] === f)
                    this.award('SQUAD ORDER COMPLETE', 100, undefined, 'orders');
            }
        }
        // Active garrisons, rather than empty ownership, build control time.
        if (f.owner >= 0 && !f.contested && count[f.owner] > 0)
            control[f.owner]++;
        if (f.owner === this.player.team && !f.contested && present)
            atPoint = true;
    }
    if (control[0] !== control[1]) {
        const team = control[0] > control[1] ? 0 : 1;
        this.controlTime[team] +=
            dt * (1 + Math.min(0.75, Math.max(0, control[team] - control[1 - team] - 1) * 0.15));
    }
    const atBase = (0, scenarios_1.atTeamBase)(this.testArena, this.player.team, this.player.x);
    if (this.player.alive && (atPoint || atBase) && this.simTime - this.player.lastHit > 5) {
        this.player.supply = (this.player.supply || 0) + dt;
        if (this.player.supply > 6) {
            this.reserves = config_1.weapons.map((w) => w.reserve);
            this.grenades = 3;
            this.smokeGrenades = 2;
            this.player.supply = 0;
            this.notify('AMMUNITION & GRENADES REPLENISHED', this.player.team);
        }
    }
    else
        this.player.supply = 0;
    if (this.controlTime.some((t) => t >= this.controlGoal) ||
        this.simTime >= this.roundLimit ||
        this.tickets.some((t) => t <= 0)) {
        const exhausted = this.tickets.some((t) => t <= 0), oneSide = this.tickets[0] <= 0 !== this.tickets[1] <= 0, difference = this.controlTime[0] - this.controlTime[1];
        const winner = exhausted && oneSide
            ? this.tickets[1] <= 0
            : Math.abs(difference) < 0.01
                ? null
                : difference > 0;
        this.finishBattle(winner, exhausted
            ? 'reserves'
            : this.controlTime.some((t) => t >= this.controlGoal)
                ? 'control'
                : 'time');
    }
}
function fixedUpdate(dt) {
    this.ballisticBudget = 2;
    this.coverBudget = 8;
    this.presentation.capture(this.actors);
    this.presentation.capture(this.vehicles);
    this.simTime += dt;
    if (this.practiceSupplies) {
        this.reserves = config_1.weapons.map((w) => w.reserve);
        this.grenades = 3;
        this.smokeGrenades = 2;
    }
    this.stepNumber++;
    this.abilityClock = Math.max(0, this.abilityClock - dt);
    this.awardTime = Math.max(0, this.awardTime - dt);
    this.shake *= 0.85;
    this.hitTime = Math.max(0, this.hitTime - dt);
    this.hurtTime = Math.max(0, this.hurtTime - dt);
    this.world.navCooldown -= dt;
    this.world.advanceNavigation();
    this.classClock = Math.max(0, this.classClock - dt);
    this.pings = this.pings.filter((p) => p.expires > this.simTime);
    for (const e of this.xpFeed)
        e.life -= dt;
    this.xpFeed = this.xpFeed.filter((e) => e.life > 0);
    for (const [id, c] of this.damageContributions)
        if (c.until < this.simTime)
            this.damageContributions.delete(id);
    (0, gameplay_1.updateStrategy)(this);
    this.spatial();
    (0, equipment_1.tickEquipment)(this, dt);
    this.updatePlayer(dt);
    this.updateAI(dt);
    this.updateVehicles(dt);
    this.spatial();
    this.updateProjectiles(dt);
    // Process one damaged building each tick so collapse cannot monopolise a frame.
    this.advanceCollapse();
    this.updateRubble(dt);
    this.captureClock += dt;
    if (this.captureClock >= 0.25) {
        this.spatial();
        this.capture(this.captureClock);
        this.captureClock = 0;
    }
}

},
"src/simulation/navigation.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetNavigation = resetNavigation;
exports.refreshNavigation = refreshNavigation;
exports.walkSegment = walkSegment;
exports.layerPath = layerPath;
exports.liftDestination = liftDestination;
exports.travelLift = travelLift;
exports.routeActor = routeActor;
exports.navigationFrontiers = navigationFrontiers;
const config_1 = require("../core/config");
const math_1 = require("../core/math");
const collision_geometry_1 = require("./collision-geometry");
const npc_state_1 = require("./npc-state");
const rubble_shape_1 = require("./rubble-shape");
const section_index_1 = require("./section-index");
const section_query_1 = require("./section-query");
const states = new WeakMap();
const chunkId = (x, z) => Math.floor(z / config_1.CS) * config_1.NX + Math.floor(x / config_1.CS);
const nodeId = (x, y, z) => Math.round(y * 20) * config_1.W * config_1.D + z * config_1.W + x + 1;
function stateFor(sim) {
    let state = states.get(sim);
    if (!state) {
        state = {
            columns: new Map(),
            dynamic: new Map(),
            bodies: new Map(),
            routes: new WeakMap(),
            searches: new Map(),
        };
        states.set(sim, state);
    }
    return state;
}
function resetNavigation(sim) {
    states.delete(sim);
}
/** Only touched regions invalidate a route. Distant explosions do not discard its frontier. */
function refreshNavigation(sim) {
    const state = stateFor(sim), live = new Set(sim.rubble);
    for (const [actor, until] of state.searches)
        if (!actor.alive ||
            actor.vehicle ||
            sim.actors[actor.id] !== actor ||
            until < sim.simTime ||
            !(0, npc_state_1.npcState)(actor).routeSearch) {
            state.searches.delete(actor);
            (0, npc_state_1.npcState)(actor).routeSearch = undefined;
        }
    const dirty = (ids) => {
        for (const id of ids)
            state.dynamic.set(id, (state.dynamic.get(id) ?? 0) + 1);
    };
    for (const [body, old] of state.bodies)
        if (!live.has(body)) {
            dirty(old.chunks);
            state.bodies.delete(body);
        }
    for (const body of sim.rubble) {
        const signature = [
            body.geometryVersion,
            body.sleeping,
            Math.round(body.x * 4),
            Math.round(body.y * 4),
            Math.round(body.z * 4),
            Math.round(body.orientation.x * 32),
            Math.round(body.orientation.y * 32),
            Math.round(body.orientation.z * 32),
            Math.round(body.orientation.w * 32),
        ].join(':');
        const old = state.bodies.get(body);
        if (old?.signature === signature)
            continue;
        if (old)
            dirty(old.chunks);
        const b = (0, rubble_shape_1.rubbleBounds)(body), chunks = [];
        for (let z = Math.max(0, Math.floor(b.min.z / config_1.CS)); z <= Math.min(config_1.D / config_1.CS - 1, Math.floor(b.max.z / config_1.CS)); z++)
            for (let x = Math.max(0, Math.floor(b.min.x / config_1.CS)); x <= Math.min(config_1.NX - 1, Math.floor(b.max.x / config_1.CS)); x++)
                chunks.push(z * config_1.NX + x);
        dirty(chunks);
        state.bodies.set(body, { signature, chunks });
    }
    return state;
}
function stamp(sim, state, id) {
    return { terrain: sim.world.chunkRevisions[id], obstacles: state.dynamic.get(id) ?? 0 };
}
function validRegions(sim, state, regions) {
    for (const [id, value] of regions)
        if (value.terrain !== sim.world.chunkRevisions[id] ||
            value.obstacles !== (state.dynamic.get(id) ?? 0))
            return false;
    return true;
}
function free(sim, p) {
    return !sim.world.blocked(p.x, p.y, p.z, 0.34, 1.8) && !(0, section_query_1.sectionBlocked)(sim, p, 0.34, 1.8);
}
function foot(sim, p) {
    return (sim.world.solid(p.x, p.y - 0.07, p.z) ||
        (0, section_query_1.sectionBlocked)(sim, { x: p.x, y: p.y - 0.08, z: p.z }, 0.18, 0.06));
}
function walkSegment(sim, from, to) {
    if (Math.abs(from.y - to.y) > 1.05)
        return false;
    const length = Math.hypot(to.x - from.x, to.z - from.z), steps = Math.max(1, Math.ceil(length / 0.4));
    if (length > 64)
        return false;
    for (let i = 0; i <= steps; i++) {
        const t = i / steps, p = {
            x: from.x + (to.x - from.x) * t,
            y: Math.max(from.y, to.y),
            z: from.z + (to.z - from.z) * t,
        };
        if (!free(sim, p) || (!foot(sim, p) && !foot(sim, { ...p, y: Math.min(from.y, to.y) })))
            return false;
    }
    return true;
}
function surfaces(sim, state, x, z, regions) {
    if (x < 1 || z < 1 || x >= config_1.W - 1 || z >= config_1.D - 1)
        return [];
    const id = chunkId(x, z), version = stamp(sim, state, id), key = z * config_1.W + x;
    regions.set(id, version);
    let column = state.columns.get(key);
    if (!column || column.terrain !== version.terrain || column.obstacles !== version.obstacles) {
        const heights = [], px = x + 0.5, pz = z + 0.5;
        for (let y = 1; y < config_1.H - 2; y++) {
            if (sim.world.cell(x, y - 1, z) && !sim.world.cell(x, y, z) && !sim.world.cell(x, y + 1, z))
                heights.push(y);
        }
        // A stable rubble top is a real navigation surface, not only an obstacle in the street grid.
        const query = {
            min: { x: px - 0.34, y: 0, z: pz - 0.34 },
            max: { x: px + 0.34, y: config_1.H, z: pz + 0.34 },
        };
        for (const body of (0, section_index_1.nearbySections)(sim, query)) {
            if (!body.sleeping)
                continue;
            (0, collision_geometry_1.visitCollisionBoxes)(body, (b) => b.min.x <= px && b.max.x >= px && b.min.z <= pz && b.max.z >= pz, (box) => {
                const hit = (0, collision_geometry_1.segmentBox)({ x: px, y: config_1.H, z: pz }, { x: 0, y: -1, z: 0 }, config_1.H, box);
                if (hit && hit.normal.y > 0.75)
                    heights.push(config_1.H - hit.t + 0.025);
            });
        }
        const unique = [...new Set(heights.map((y) => Math.round(y * 20) / 20))];
        column = {
            ...version,
            heights: unique.filter((y) => free(sim, { x: px, y, z: pz })).sort((a, b) => a - b),
        };
        state.columns.set(key, column);
        // Bounded FIFO cache. It retains geometry metadata, never actor references.
        while (state.columns.size > 8192)
            state.columns.delete(state.columns.keys().next().value);
    }
    return column.heights.map((y) => ({ id: nodeId(x, y, z), x: x + 0.5, y, z: z + 0.5 }));
}
function endpoint(sim, state, p, regions) {
    let best = null, score = Infinity;
    const x = Math.floor(p.x), z = Math.floor(p.z);
    for (let dz = -2; dz <= 2; dz++)
        for (let dx = -2; dx <= 2; dx++) {
            for (const node of surfaces(sim, state, x + dx, z + dz, regions)) {
                const height = Math.abs(node.y - p.y);
                if (height > 1.15)
                    continue;
                const d = (0, math_1.dist2)(node, p) + height * height * 2;
                if (d < score) {
                    score = d;
                    best = node;
                }
            }
        }
    return best;
}
function landing(sim, building, level, regions, state) {
    const b = sim.world.buildings[building];
    if (!b || level < 0 || level > b.floors)
        return null;
    const p = { x: b.lift.x, y: 5 + level * 5, z: b.lift.z };
    if (p.y >= config_1.H - 2 || !sim.world.solid(p.x, p.y - 0.1, p.z) || !free(sim, p))
        return null;
    const id = chunkId(p.x, p.z);
    regions.set(id, stamp(sim, state, id));
    return { ...p, id: -2 - building * 32 - level, landing: { building, level } };
}
function neighbours(sim, state, node, search) {
    const result = [], x = Math.floor(node.x), z = Math.floor(node.z);
    for (const [dx, dz] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
    ]) {
        for (const next of surfaces(sim, state, x + dx, z + dz, search.regions))
            if (Math.abs(node.y - next.y) <= 1.05 && walkSegment(sim, node, next))
                result.push(next);
    }
    if (node.landing) {
        const { building, level } = node.landing;
        for (const offset of [-1, 1]) {
            const next = landing(sim, building, level + offset, search.regions, state);
            if (next)
                result.push(next);
        }
    }
    else {
        const b = sim.world.buildingMap[z * config_1.W + x] - 1;
        if (b >= 0) {
            const level = Math.round((node.y - 5) / 5), next = landing(sim, b, level, search.regions, state);
            if (next &&
                Math.abs(next.y - node.y) < 0.2 &&
                (0, math_1.dist2)(next, node) <= 2.3 &&
                walkSegment(sim, node, next))
                result.push(next);
        }
    }
    return result;
}
function heapPush(heap, id, score) {
    let i = heap.length;
    heap.push({ id, score });
    while (i > 0) {
        const p = (i - 1) >> 1;
        if (heap[p].score <= score)
            break;
        [heap[p], heap[i]] = [heap[i], heap[p]];
        i = p;
    }
}
function heapPop(heap) {
    const first = heap[0], last = heap.pop();
    if (heap.length) {
        heap[0] = last;
        let i = 0;
        while (true) {
            const l = i * 2 + 1, r = l + 1;
            let n = i;
            if (l < heap.length && heap[l].score < heap[n].score)
                n = l;
            if (r < heap.length && heap[r].score < heap[n].score)
                n = r;
            if (n === i)
                break;
            [heap[n], heap[i]] = [heap[i], heap[n]];
            i = n;
        }
    }
    return first.id;
}
function reconstruct(search, id) {
    const reverse = [];
    for (let guard = 0; id !== search.start && guard < 8192; guard++) {
        const node = search.nodes.get(id), parentId = search.parents.get(id);
        if (!node || parentId === undefined)
            break;
        const parent = search.nodes.get(parentId);
        const p = { x: node.x, y: node.y, z: node.z };
        if (node.landing &&
            parent?.landing &&
            node.landing.building === parent.landing.building &&
            node.landing.level !== parent.landing.level)
            p.lift = node.landing;
        reverse.push(p);
        id = parentId;
    }
    return reverse.reverse();
}
/** One budgeted A* frontier spanning multiple floors, rubble surfaces and authored lift links. */
function layerPath(sim, from, to, maxNodes = 128, previous) {
    const failed = { status: 'unreachable', point: { ...from }, path: [], expanded: 0 };
    if (![from, to].every((p) => [p.x, p.y, p.z].every(Number.isFinite) &&
        p.x >= 1 &&
        p.x < config_1.W - 1 &&
        p.z >= 1 &&
        p.z < config_1.D - 1))
        return failed;
    const state = refreshNavigation(sim), regions = new Map();
    let search = previous;
    if (search &&
        ((0, math_1.dist2)(search.target, to) > 1 ||
            Math.abs(search.target.y - to.y) > 0.3 ||
            !validRegions(sim, state, search.regions)))
        search = undefined;
    if (!search) {
        const start = endpoint(sim, state, from, regions), goal = endpoint(sim, state, to, regions);
        if (!start || !goal)
            return failed;
        search = {
            start: start.id,
            goal: goal.id,
            target: { ...to },
            heap: [],
            nodes: new Map([
                [start.id, start],
                [goal.id, goal],
            ]),
            costs: new Map([[start.id, 0]]),
            parents: new Map(),
            closed: new Set(),
            regions,
            best: start.id,
        };
        heapPush(search.heap, start.id, 0);
    }
    const goal = search.nodes.get(search.goal);
    const heuristic = (p) => Math.hypot(p.x - goal.x, p.z - goal.z) + Math.abs(p.y - goal.y) * 0.25;
    let expanded = 0;
    while (search.heap.length && expanded < Math.max(0, maxNodes)) {
        const id = heapPop(search.heap);
        if (search.closed.has(id))
            continue;
        const node = search.nodes.get(id);
        search.closed.add(id);
        expanded++;
        if (heuristic(node) < heuristic(search.nodes.get(search.best)))
            search.best = id;
        if (id === search.goal) {
            const path = reconstruct(search, id);
            return {
                status: 'reachable',
                point: path[0] ?? { ...to },
                path,
                expanded,
                regions: search.regions,
            };
        }
        if (search.closed.size >= 4096) {
            const path = reconstruct(search, search.best);
            return {
                status: path.length ? 'partial' : 'unreachable',
                point: path[0] ?? { ...from },
                path,
                expanded,
                regions: search.regions,
            };
        }
        for (const next of neighbours(sim, state, node, search)) {
            if (search.closed.has(next.id))
                continue;
            const lift = node.landing && next.landing && node.landing.building === next.landing.building;
            const edge = lift
                ? 5 + Math.abs(node.y - next.y) * 0.4
                : Math.hypot(next.x - node.x, next.z - node.z) + Math.abs(next.y - node.y) * 0.4;
            const cost = search.costs.get(id) + edge;
            if (cost >= (search.costs.get(next.id) ?? Infinity))
                continue;
            search.nodes.set(next.id, next);
            search.costs.set(next.id, cost);
            search.parents.set(next.id, id);
            heapPush(search.heap, next.id, cost + heuristic(next));
        }
    }
    return search.heap.length
        ? { status: 'pending', point: { ...from }, path: [], expanded, search }
        : { ...failed, expanded };
}
function liftDestination(sim, actor, building, level) {
    const b = sim.world.buildings[building];
    if (!b ||
        !actor.alive ||
        actor.vehicle ||
        sim.simTime < (actor.liftReady ?? 0) ||
        (0, math_1.dist2)(actor, b.lift) >= 9)
        return null;
    const current = Math.round((actor.y - 5) / 5);
    if (Math.abs(actor.y - (5 + current * 5)) > 0.3 || current === level)
        return null;
    const p = landing(sim, building, level, new Map(), stateFor(sim));
    if (!p ||
        sim.occupied(actor, p.x, p.y, p.z, 0.34, 1.8) ||
        sim.actors.some((a) => a !== actor && a.alive && !a.vehicle && Math.abs(a.y - p.y) < 1.8 && (0, math_1.dist2)(a, p) < 0.64))
        return null;
    return p;
}
function travelLift(sim, actor, building, level) {
    const p = liftDestination(sim, actor, building, level);
    if (!p)
        return false;
    Object.assign(actor, {
        x: p.x,
        y: p.y,
        z: p.z,
        vx: 0,
        vy: 0,
        vz: 0,
        onGround: true,
        liftReady: sim.simTime + 1.2,
    });
    actor.poseEpoch = (actor.poseEpoch ?? 0) + 1;
    sim.navigationStats.liftTrips++;
    return true;
}
/** Movement consumes validated waypoints; a path is not a licence to walk through later debris. */
function routeActor(sim, actor, target) {
    const brain = (0, npc_state_1.npcState)(actor), state = stateFor(sim), stationary = {
        status: 'pending',
        point: { x: actor.x, y: actor.y, z: actor.z },
        path: [],
        expanded: 0,
    };
    refreshNavigation(sim);
    let route = state.routes.get(actor);
    const sameTarget = (p) => (0, math_1.dist2)(p, target) < 4 && Math.abs(p.y - target.y) < 0.5;
    if (route &&
        (!sameTarget(route.target) ||
            route.until <= sim.simTime ||
            !validRegions(sim, state, route.regions))) {
        state.routes.delete(actor);
        route = undefined;
    }
    if (route) {
        while (route.index < route.path.length &&
            (0, math_1.dist2)(actor, route.path[route.index]) < 0.3 &&
            Math.abs(actor.y - route.path[route.index].y) < 0.4)
            route.index++;
        const next = route.path[route.index];
        if (next?.lift) {
            if (travelLift(sim, actor, next.lift.building, next.lift.level)) {
                route.index++;
                return stationary;
            }
            if (sim.simTime < (actor.liftReady ?? 0))
                return stationary;
        }
        else if (next && walkSegment(sim, actor, next))
            return { ...stationary, status: 'reachable', point: next };
        state.routes.delete(actor);
        route = undefined;
    }
    if (Math.abs(actor.y - target.y) < 1 &&
        (0, math_1.dist2)(actor, target) < 64 &&
        walkSegment(sim, actor, target)) {
        brain.routeSearch = undefined;
        state.searches.delete(actor);
        brain.routeUntil = 0;
        return { ...stationary, status: 'reachable', point: { ...target } };
    }
    if (brain.routeGoal && !sameTarget(brain.routeGoal))
        brain.routeSearch = undefined;
    if (sim.navigationBudget <= 0)
        return stationary;
    // Bound aggregate frontier memory as well as work per tick. Slots are released
    // on completion, cancellation or timeout; distant waiting actors retain flow-field steering.
    if (!state.searches.has(actor) && state.searches.size >= 64)
        return stationary;
    if (!state.searches.has(actor))
        state.searches.set(actor, sim.simTime + 12);
    const distance = Math.sqrt((0, math_1.dist2)(actor, target));
    const goal = distance > 38
        ? {
            x: actor.x + ((target.x - actor.x) * 38) / distance,
            z: actor.z + ((target.z - actor.z) * 38) / distance,
            y: 0,
        }
        : { ...target };
    if (distance > 38)
        goal.y = sim.world.groundAt(goal.x, goal.z);
    const result = layerPath(sim, actor, goal, Math.min(128, sim.navigationBudget), brain.routeSearch);
    if (!result.search)
        state.searches.delete(actor);
    sim.navigationBudget -= result.expanded;
    sim.navigationStats.expanded += result.expanded;
    brain.routeGoal = { ...target };
    brain.routeSearch = result.search;
    brain.routeUntil = sim.simTime + 4;
    if (result.status === 'reachable' || result.status === 'partial') {
        sim.navigationStats.completed++;
        state.routes.set(actor, {
            target: { ...target },
            path: result.path,
            index: 0,
            regions: result.regions ?? new Map(),
            until: sim.simTime + 6,
        });
        // Do not turn a vertical link into horizontal movement before validating its landing.
        if (result.path[0]?.lift)
            return stationary;
    }
    else if (result.status === 'unreachable') {
        sim.navigationStats.blocked++;
        brain.routeUntil = 0;
    }
    return result;
}
function navigationFrontiers(sim) {
    return stateFor(sim).searches.size;
}

},
"src/simulation/npc-state.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retentionRange = exports.acquisitionRange = void 0;
exports.npcState = npcState;
exports.resetNPC = resetNPC;
exports.supportReservationsFor = supportReservationsFor;
exports.pruneReservations = pruneReservations;
exports.cancelSupportTask = cancelSupportTask;
exports.retireNPC = retireNPC;
exports.resetNpcState = resetNpcState;
exports.reservationCount = reservationCount;
exports.friendlyLane = friendlyLane;
exports.nearMiss = nearMiss;
exports.pressure = pressure;
exports.hazardResponse = hazardResponse;
const rubble_shape_1 = require("./rubble-shape");
const section_query_1 = require("./section-query");
const brains = new WeakMap();
function npcState(a) {
    let b = brains.get(a);
    if (!b) {
        b = {
            rocketTarget: null,
            rocketReady: 0,
            position: null,
            positionUntil: 0,
            nextCoverSearch: 0,
            nextThink: 0,
            lastThink: -100,
            reactionAt: 0,
            lastSeen: -100,
            task: null,
            reason: 'Moving to assigned sector',
            avoidUntil: 0,
            avoid: null,
            cover: null,
            coverUntil: 0,
            blockedShots: 0,
            blockedSince: -1,
            suppression: 0,
            pressureAt: 0,
            routeGoal: null,
            routeUntil: 0,
        };
        brains.set(a, b);
    }
    return b;
}
function resetNPC(a) {
    brains.delete(a);
}
const reservations = new WeakMap();
function supportReservationsFor(sim) {
    let list = reservations.get(sim);
    if (!list) {
        list = new Map();
        reservations.set(sim, list);
    }
    return list;
}
function pruneReservations(sim) {
    const list = reservations.get(sim);
    if (!list)
        return;
    for (const [target, owner] of list) {
        const targetExists = 'id' in target ? sim.actors[target.id] === target : sim.vehicles.includes(target);
        if (!targetExists ||
            owner.until <= sim.simTime ||
            !owner.actor.alive ||
            sim.actors[owner.actor.id] !== owner.actor ||
            npcState(owner.actor).task?.target !== target)
            list.delete(target);
    }
}
function cancelSupportTask(sim, a, reason = 'Task cancelled') {
    const list = reservations.get(sim);
    if (list)
        for (const [target, owner] of list)
            if (owner.actor === a)
                list.delete(target);
    const brain = npcState(a);
    brain.task = null;
    brain.reason = reason;
}
function retireNPC(sim, a) {
    cancelSupportTask(sim, a);
    reservations.get(sim)?.delete(a);
    brains.delete(a);
}
function resetNpcState(sim) {
    reservations.get(sim)?.clear();
    reservations.delete(sim);
    for (const a of sim.actors)
        brains.delete(a);
}
function reservationCount(sim) {
    return reservations.get(sim)?.size ?? 0;
}
const acquisitionRange = (a) => (a.kit === 'recon' ? 90 : 68);
exports.acquisitionRange = acquisitionRange;
const retentionRange = (a) => (0, exports.acquisitionRange)(a) + 12;
exports.retentionRange = retentionRange;
/** Friendly bodies block a shot even though friendly-fire damage is disabled. */
function friendlyLane(sim, a, end, radius = 0.62) {
    const origin = { x: a.x, y: a.y + Math.min(1.45, a.height - 0.13), z: a.z };
    const dx = end.x - origin.x, dy = end.y - origin.y, dz = end.z - origin.z;
    const length2 = dx * dx + dy * dy + dz * dz;
    if (length2 < 0.0001)
        return false;
    let blocked = false;
    sim.neighbours((a.x + end.x) * 0.5, (a.z + end.z) * 0.5, Math.sqrt(length2) * 0.5 + 2, (b) => {
        if (blocked || b === a || !b.alive || b.vehicle || b.team !== a.team)
            return;
        const t = ((b.x - origin.x) * dx + (b.y + b.height * 0.5 - origin.y) * dy + (b.z - origin.z) * dz) /
            length2;
        if (t <= 0.015 || t >= 0.98)
            return;
        const y = origin.y + dy * t;
        if (y >= b.y &&
            y <= b.y + b.height + 0.1 &&
            Math.hypot(origin.x + dx * t - b.x, origin.z + dz * t - b.z) < radius)
            blocked = true;
    });
    if (!blocked)
        for (const v of sim.vehicles) {
            if (!v.alive || v.team !== a.team || a.vehicle === v)
                continue;
            const t = sim.rayBox(origin, { x: dx / Math.sqrt(length2), y: dy / Math.sqrt(length2), z: dz / Math.sqrt(length2) }, { x: v.x, y: v.y + v.height / 2, z: v.z, xr: v.radius, yr: v.height / 2, zr: v.radius });
            if (t < Math.sqrt(length2)) {
                blocked = true;
                break;
            }
        }
    return blocked;
}
/** Pressure comes from actual nearby shot segments, never an omniscient enemy timer. */
function nearMiss(sim, shooter, from, to) {
    const dx = to.x - from.x, dy = to.y - from.y, dz = to.z - from.z;
    const length2 = dx * dx + dy * dy + dz * dz;
    if (length2 < 0.001)
        return;
    sim.neighbours((from.x + to.x) / 2, (from.z + to.z) / 2, Math.sqrt(length2) / 2 + 2, (a) => {
        if (a.player || a.team === shooter.team || !a.alive || a.vehicle || a.shield > 0)
            return;
        const centre = { x: a.x, y: a.y + a.height * 0.6, z: a.z };
        const t = Math.max(0, Math.min(1, ((centre.x - from.x) * dx + (centre.y - from.y) * dy + (centre.z - from.z) * dz) / length2));
        const closest = { x: from.x + dx * t, y: from.y + dy * t, z: from.z + dz * t };
        const distance = Math.hypot(centre.x - closest.x, centre.y - closest.y, centre.z - closest.z);
        if (distance > 2.2 || !(0, section_query_1.clearSegment)(sim, centre, closest))
            return;
        const b = npcState(a);
        const old = b.suppression * Math.exp(-Math.max(0, sim.simTime - b.pressureAt) * 0.9);
        b.suppression = Math.min(1, old + 0.16 * (1 - distance / 2.2));
        b.pressureAt = sim.simTime;
        b.nextThink = Math.min(b.nextThink, sim.simTime);
    });
}
function pressure(sim, a) {
    const b = npcState(a);
    return b.suppression * Math.exp(-Math.max(0, sim.simTime - b.pressureAt) * 0.9);
}
/** Hazards pre-empt support. Structural danger uses swept geometry, not a centre-distance sphere. */
function hazardResponse(sim, a) {
    if (!a.alive || a.vehicle)
        return false;
    const brain = npcState(a), eye = { x: a.x, y: a.y + 1, z: a.z };
    let hazard = null;
    for (const p of sim.projectiles) {
        if (p.type === 'grenade' &&
            p.life > 0 &&
            Math.hypot(p.x - a.x, p.y - a.y, p.z - a.z) < 6 &&
            (0, section_query_1.clearSegment)(sim, eye, p)) {
            hazard = { x: p.x, y: p.y, z: p.z };
            break;
        }
    }
    if (!hazard)
        for (const b of sim.rubble) {
            const angular = Math.hypot(b.omega.x, b.omega.y, b.omega.z);
            if (b.sleeping || !b.voxels.length || (b.vy > -0.5 && angular < 0.08))
                continue;
            const bounds = (0, rubble_shape_1.rubbleBounds)(b), duration = 0.65;
            const margin = Math.min(5, angular * Math.hypot(b.width, b.height, b.depth) * 0.45) + 1.6;
            const fall = Math.max(0, -b.vy) * duration + 4;
            if (bounds.max.y < a.y - 0.5 || bounds.min.y > a.y + a.height + fall)
                continue;
            const loX = bounds.min.x + Math.min(0, b.vx * duration) - margin;
            const hiX = bounds.max.x + Math.max(0, b.vx * duration) + margin;
            const loZ = bounds.min.z + Math.min(0, b.vz * duration) - margin;
            const hiZ = bounds.max.z + Math.max(0, b.vz * duration) + margin;
            if (a.x < loX || a.x > hiX || a.z < loZ || a.z > hiZ)
                continue;
            const point = {
                x: Math.max(bounds.min.x, Math.min(bounds.max.x, a.x)),
                y: bounds.min.y,
                z: Math.max(bounds.min.z, Math.min(bounds.max.z, a.z)),
            };
            if (!sim.world.visible(eye, point))
                continue;
            // The nearest edge provides a usable escape direction even beneath a long, rotating beam.
            const exits = [
                { distance: a.x - loX, x: a.x + 1, z: a.z },
                { distance: hiX - a.x, x: a.x - 1, z: a.z },
                { distance: a.z - loZ, x: a.x, z: a.z + 1 },
                { distance: hiZ - a.z, x: a.x, z: a.z - 1 },
            ].sort((u, v) => u.distance - v.distance);
            hazard = { x: exits[0].x, y: a.y, z: exits[0].z };
            break;
        }
    if (hazard) {
        brain.avoid = hazard;
        brain.avoidUntil = sim.simTime + 0.9;
        cancelSupportTask(sim, a, 'Immediate hazard');
        brain.positionUntil = 0;
        brain.position = null;
    }
    if (brain.avoidUntil < sim.simTime || !brain.avoid)
        return false;
    const h = brain.avoid;
    const base = Math.atan2(a.x - h.x || (a.id & 1 ? 1 : -1) * 0.01, a.z - h.z);
    for (const off of [0, 0.6, -0.6, 1.2, -1.2, Math.PI]) {
        const dx = Math.sin(base + off), dz = Math.cos(base + off);
        if (!sim.occupied(a, a.x + dx * 1.1, a.y, a.z + dz * 1.1, 0.34, a.height)) {
            a.dx = dx;
            a.dz = dz;
            a.tactic = 'EVADE';
            if (!sim.occupied(a, a.x, a.y, a.z, 0.3, 1.8)) {
                a.height = 1.8;
                a.crouched = false;
            }
            brain.reason = 'Escaping a visible hazard';
            return true;
        }
    }
    // A blocked escape must not fall back to a lower-priority support task.
    a.dx = a.dz = 0;
    a.tactic = 'BRACE';
    brain.reason = 'Escape obstructed';
    return true;
}

},
"src/simulation/npc.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chooseTarget = chooseTarget;
exports.think = think;
exports.updateAI = updateAI;
const mathModule = require("../core/math");
const combat_ai_1 = require("./combat-ai");
const equipment_1 = require("./equipment");
const gameplayModule = require("./gameplay");
const navigation_1 = require("./navigation");
const npc_stateModule = require("./npc-state");
const npc_state_1 = require("./npc-state");
const perception_1 = require("./perception");
const tactics_1 = require("./tactics");
function chooseTarget(a, range = 68) {
    let best = null, score = range * range;
    this.neighbours(a.x, a.z, range, (b) => {
        if (a.team === b.team || !b.alive || b.shield > 0)
            return;
        const d = mathModule.dist2(a, b);
        const observer = a;
        if (typeof observer.yaw === 'number' &&
            !('isVehicle' in a) &&
            d > 100 &&
            this.simTime - (observer.lastHit ?? -100) > 1.5) {
            const facing = ((b.x - a.x) * Math.sin(observer.yaw) + (b.z - a.z) * Math.cos(observer.yaw)) /
                Math.sqrt(d);
            if (facing < 0.3 && observer.target !== b)
                return;
        }
        if (d < score &&
            (0, perception_1.canSee)(this, { x: a.x, y: a.y + Math.min(1.55, (observer.height ?? 1.8) - 0.13), z: a.z }, { x: b.x, y: b.y + Math.min(1.2, b.height - 0.2), z: b.z })) {
            best = b;
            score = d;
        }
    });
    return best;
}
function think(a) {
    const brain = npc_stateModule.npcState(a);
    brain.lastThink = this.simTime;
    const seen = this.chooseTarget(a, (0, npc_state_1.acquisitionRange)(a));
    if (seen) {
        if (a.target !== seen)
            brain.reactionAt = this.simTime + 0.24 + (a.id % 7) * 0.043;
        brain.lastSeen = this.simTime;
        (0, tactics_1.observeContact)(this, a, seen);
        a.target = seen;
        a.contact = { x: seen.x, y: seen.y, z: seen.z, until: this.simTime + 5 };
    }
    else
        a.target = null;
    a.armourTarget =
        a.kit === 'engineer'
            ? (this.vehicles.find((v) => v.alive &&
                v.team !== a.team &&
                mathModule.dist2(a, v) < 7225 &&
                (0, perception_1.canSee)(this, { x: a.x, y: a.y + 1.5, z: a.z }, { x: v.x, y: v.y + 1, z: v.z })) ?? null)
            : null;
    const squadPoint = this.squadTarget(a), route = a.goal;
    const f = this.world.flags[route], point = squadPoint ?? this.world.navigationPoint(a), inCentre = mathModule.dist2(a, f) < 400;
    let dx = point.x - a.x, dz = point.z - a.z;
    a.tactic = route !== 4 ? 'FLANK' : 'ADVANCE';
    a.crouched = false;
    if (!squadPoint && inCentre) {
        const angle = a.id * 2.39996, r = 6 + (a.id % 5) * 3;
        dx = f.x + Math.sin(angle) * r - a.x;
        dz = f.z + Math.cos(angle) * r - a.z;
        if (Math.hypot(dx, dz) < 2)
            dx = dz = 0;
        a.tactic = f.owner === a.team ? 'HOLD' : 'SECURE';
    }
    // Check reachable nearby cover against a recently observed enemy, never through-wall knowledge.
    const threat = a.contact && a.contact.until > this.simTime ? a.contact : (0, tactics_1.squadContact)(this, a);
    const stressed = a.hp < 45 || a.reload > 0 || this.simTime - a.lastHit < 2 || (0, npc_state_1.pressure)(this, a) > 0.4;
    const cover = threat &&
        !brain.task &&
        mathModule.dist2(a, threat) < 78 ** 2 &&
        (stressed || (a.target && this.squads[a.squadId]?.order.kind === 'objective'))
        ? (0, tactics_1.firingPosition)(this, a, threat, { ...f, y: a.y })
        : null;
    if (cover) {
        dx = cover.x - a.x;
        dz = cover.z - a.z;
        const arrived = Math.hypot(dx, dz) < 0.8;
        if (arrived)
            dx = dz = 0;
        a.tactic = arrived ? 'HOLD COVER' : 'TAKE COVER';
        a.crouched =
            arrived &&
                (!cover.peek || a.reload > 0 || this.simTime - a.lastHit < 1.2 || (0, npc_state_1.pressure)(this, a) > 0.65);
    }
    else if (threat && a.hp < 30 && stressed) {
        dx = a.x - threat.x;
        dz = a.z - threat.z;
        a.tactic = 'FALL BACK';
    }
    else {
        const intent = (0, tactics_1.squadCombatIntent)(this, a);
        if (intent) {
            dx = intent.point.x - a.x;
            dz = intent.point.z - a.z;
            a.tactic = intent.tactic;
            a.crouched = intent.tactic === 'SUPPRESS';
        }
    }
    // Static flow fields stay the cheap default. Local 3D routing takes over when a
    // route is blocked, a floor differs, or a previous detour is still in progress.
    const navigate = !['HOLD COVER', 'TAKE COVER', 'FALL BACK', 'SUPPRESS'].includes(a.tactic) && !brain.task;
    if (navigate) {
        const n = Math.hypot(dx, dz), probe = {
            x: a.x + (dx / (n || 1)) * Math.min(n, 2),
            y: a.y,
            z: a.z + (dz / (n || 1)) * Math.min(n, 2),
        };
        if (n > 0.4 &&
            (brain.routeUntil > this.simTime ||
                a.stuck > 1 ||
                !(0, navigation_1.walkSegment)(this, a, probe) ||
                Math.abs(a.y - this.world.groundAt(a.x, a.z)) > 2)) {
            const observation = a.tactic === 'INVESTIGATE' ? (0, tactics_1.squadContact)(this, a) : null;
            const destination = observation ??
                (squadPoint ? squadPoint : { x: f.x, y: this.world.groundAt(f.x, f.z), z: f.z });
            const path = (0, navigation_1.routeActor)(this, a, destination);
            dx = path.point.x - a.x;
            dz = path.point.z - a.z;
            if (path.status === 'pending')
                a.tactic = 'ROUTING';
            if (path.status === 'unreachable')
                a.tactic = 'ROUTE BLOCKED';
        }
    }
    if (a.crouched)
        a.height = 1.25;
    else if (!this.occupied(a, a.x, a.y, a.z, 0.3, 1.8))
        a.height = 1.8;
    else {
        a.height = 1.25;
        a.crouched = true;
    }
    const stop = Math.hypot(dx, dz) < 0.4;
    let l = Math.hypot(dx, dz) || 1;
    dx /= l;
    dz /= l;
    this.neighbours(a.x, a.z, 1.8, (b) => {
        if (b === a || a.y + a.height <= b.y || b.y + b.height <= a.y)
            return;
        const x = a.x - b.x, z = a.z - b.z, q = x * x + z * z;
        if (q > 0.001 && q < 2.25) {
            dx += (x / (q + 0.2)) * 0.65;
            dz += (z / (q + 0.2)) * 0.65;
        }
    });
    for (const v of this.vehicles)
        if (v.alive) {
            const x = a.x - v.x, z = a.z - v.z, l = Math.hypot(x, z);
            if (l < 4 && l > 0.01 && a.y + a.height > v.y && a.y < v.y + v.height) {
                dx += (x / l) * (4 - l) * 2;
                dz += (z / l) * (4 - l) * 2;
            }
        }
    a.dx = a.dz = 0;
    if (!stop || Math.hypot(dx, dz) > 0.5) {
        const base = Math.atan2(dx, dz);
        for (const angle of [0, 0.65, -0.65, 1.3, -1.3, Math.PI]) {
            const x = Math.sin(base + angle), z = Math.cos(base + angle);
            if (!this.occupied(a, a.x + x * 0.8, a.y, a.z + z * 0.8, 0.3, a.height) ||
                !this.occupied(a, a.x + x * 0.8, a.y + 1.02, a.z + z * 0.8, 0.3, a.height)) {
                a.dx = x;
                a.dz = z;
                break;
            }
        }
    }
    if (!stop && Math.hypot(a.x - a.lastX, a.z - a.lastZ) < 0.15)
        a.stuck++;
    else
        a.stuck = 0;
    if (a.stuck > 3 && a.onGround && a.tactic !== 'ROUTING')
        brain.routeUntil = this.simTime + 4;
    a.lastX = a.x;
    a.lastZ = a.z;
}
function updateAI(dt) {
    this.navigationBudget = 768;
    (0, navigation_1.refreshNavigation)(this);
    (0, tactics_1.updateSquadLeadership)(this);
    (0, npc_state_1.pruneReservations)(this);
    const service = (a) => {
        const brain = npc_stateModule.npcState(a);
        if (!a.alive || a.player || a.vehicle || brain.nextThink > this.simTime)
            return false;
        this.think(a);
        // Immediate physical danger owns locomotion; support may not overwrite it.
        if (!npc_stateModule.hazardResponse(this, a)) {
            gameplayModule.aiClassBehaviour(this, a);
            (0, equipment_1.aiEquipment)(this, a);
        }
        if (a.crouched)
            a.height = 1.25;
        else if (!this.occupied(a, a.x, a.y, a.z, 0.3, 1.8))
            a.height = 1.8;
        brain.nextThink =
            this.simTime +
                (a.target || brain.task || a.tactic === 'EVADE' ? 0.18 : 0.65) +
                (a.id % 5) * 0.012;
        return true;
    };
    // Separate a reactive quota from fair round-robin service. Distant squads still run.
    let urgent = 0;
    for (let n = 0; n < this.actors.length && urgent < 24; n++) {
        const a = this.actors[this.reactiveCursor++ % this.actors.length], b = npc_stateModule.npcState(a);
        if ((a.target || b.task || this.simTime - a.lastHit < 2) && service(a))
            urgent++;
    }
    let regular = 0;
    for (let n = 0; n < this.actors.length && regular < 24; n++)
        if (service(this.actors[this.aiCursor++ % this.actors.length]))
            regular++;
    for (let i = 0; i < this.actors.length; i++) {
        const a = this.actors[i];
        if (a.player)
            continue;
        if (!a.alive) {
            a.respawn -= dt;
            if (a.respawn <= 0)
                this.safeSpawn(a);
            continue;
        }
        a.shield = Math.max(0, a.shield - dt);
        (0, combat_ai_1.combatTick)(this, a, dt);
        const speed = a.crouched
            ? 1.6
            : a.tactic === 'FALL BACK' || a.tactic === 'EVADE'
                ? 4.8
                : a.target
                    ? 2.5
                    : 4.6;
        a.vx = a.dx * speed;
        a.vz = a.dz * speed;
        if (a.x > 249 && a.x < 263 && a.y < 2) {
            a.vx *= 0.5;
            a.vz *= 0.5;
        }
        this.moveBody(a, dt, 0.3, a.height);
        a.walk += Math.hypot(a.vx, a.vz) * dt;
        if (this.simTime - a.lastHit > 12)
            a.hp = Math.min(100, a.hp + dt * 4);
    }
}

},
"src/simulation/perception.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smokeRadius = smokeRadius;
exports.smokeDepth = smokeDepth;
exports.canSee = canSee;
const section_query_1 = require("./section-query");
function smokeRadius(c) {
    return c.life > 0 && c.age >= 0.15 ? c.radius * Math.min(1, c.age / 1.3) : 0;
}
/** Smoke affects observation, never projectile, movement or explosion geometry. */
function smokeDepth(sim, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z, l2 = dx * dx + dy * dy + dz * dz;
    if (l2 < 1e-8)
        return 0;
    const length = Math.sqrt(l2);
    let depth = 0;
    for (const c of sim.smokeClouds ?? []) {
        if (c.life <= 0 || c.age < 0.15)
            continue;
        const radius = smokeRadius(c), ox = a.x - c.x, oy = a.y - c.y, oz = a.z - c.z;
        const proj = -(ox * dx + oy * dy + oz * dz) / l2;
        const perpendicular = ox * ox + oy * oy + oz * oz - proj * proj * l2;
        const disc = radius * radius - perpendicular;
        if (disc <= 0)
            continue;
        const half = Math.sqrt(disc / l2), lo = Math.max(0, proj - half), hi = Math.min(1, proj + half);
        if (hi > lo)
            depth += (hi - lo) * length * Math.min(1, c.life / 2);
    }
    return depth;
}
function canSee(sim, a, b) {
    return smokeDepth(sim, a, b) < 1.7 && (0, section_query_1.clearSegment)(sim, a, b);
}

},
"src/simulation/physics.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.occupied = occupied;
exports.pushInfantry = pushInfantry;
exports.moveBody = moveBody;
const config_1 = require("../core/config");
const math_1 = require("../core/math");
const section_query_1 = require("./section-query");
function occupied(a, x, y, z, r = 0.3, height = 1.8) {
    if (this.world.blocked(x, y, z, r, height) || (0, section_query_1.sectionBlocked)(this, { x, y, z }, r, height))
        return true;
    for (const v of this.vehicles)
        if (v !== a &&
            v.alive &&
            a.vehicle !== v &&
            y + height > v.y + 0.05 &&
            y < v.y + v.height - 0.02 &&
            Math.abs(x - v.x) < r + v.radius &&
            Math.abs(z - v.z) < r + v.radius)
            return true;
    return false;
}
function pushInfantry(v, x, y, z) {
    const moves = [];
    for (const a of this.actors) {
        if (!a.alive || a.vehicle || a.y + a.height < y || a.y > y + v.height)
            continue;
        const rx = v.radius + 0.32 - Math.abs(a.x - x), rz = v.radius + 0.32 - Math.abs(a.z - z);
        if (rx <= 0 || rz <= 0)
            continue;
        const nx = a.x + (rx < rz ? (a.x < x ? -1 : 1) * (rx + 0.015) : 0), nz = a.z + (rz <= rx ? (a.z < z ? -1 : 1) * (rz + 0.015) : 0);
        const distance = Math.hypot(nx - a.x, nz - a.z), steps = Math.max(1, Math.ceil(distance / 0.2));
        for (let i = 1; i <= steps; i++) {
            const px = a.x + ((nx - a.x) * i) / steps, pz = a.z + ((nz - a.z) * i) / steps;
            if (this.world.blocked(px, a.y, pz, 0.3, a.height) ||
                (0, section_query_1.sectionBlocked)(this, { x: px, y: a.y, z: pz }, 0.3, a.height))
                return false;
        }
        if (this.vehicles.some((b) => b !== v &&
            b.alive &&
            Math.abs(nx - b.x) < b.radius + 0.3 &&
            Math.abs(nz - b.z) < b.radius + 0.3 &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y))
            return false;
        moves.push([a, nx, nz]);
    }
    // Validate the complete proposal before moving anyone; no chain pushes or overlapping soldiers.
    const proposed = new Map(moves.map(([actor, x, z]) => [actor, { x, z }]));
    for (const [a, x, z] of moves) {
        for (const other of this.actors) {
            if (other === a ||
                !other.alive ||
                other.vehicle ||
                a.y + a.height <= other.y ||
                other.y + other.height <= a.y)
                continue;
            const target = proposed.get(other) ?? other;
            if (Math.abs(x - target.x) < 0.6 && Math.abs(z - target.z) < 0.6)
                return false;
        }
    }
    for (const [a, nx, nz] of moves) {
        a.x = nx;
        a.z = nz;
    }
    return true;
}
function moveBody(a, dt, r = 0.3, height = 1.8) {
    // Sweep short increments: explosions and long falls cannot tunnel through voxels.
    for (const [axis, delta] of [
        ['x', (a.vx + (a.ix || 0)) * dt],
        ['z', (a.vz + (a.iz || 0)) * dt],
    ]) {
        const steps = Math.max(1, Math.ceil(Math.abs(delta) / 0.22)), d = delta / steps;
        for (let i = 0; i < steps; i++) {
            const x = a.x + (axis === 'x' ? d : 0), z = a.z + (axis === 'z' ? d : 0);
            let y = a.y;
            if (this.occupied(a, x, y, z, r, height)) {
                if (a.onGround &&
                    !this.occupied(a, x, y + 1.02, z, r, height) &&
                    !this.occupied(a, a.x, y + 1.02, a.z, r, height))
                    y += 1.02;
                else
                    break;
            }
            if (a.isVehicle && !this.pushInfantry(a, x, y, z))
                break;
            a.x = x;
            a.z = z;
            a.y = y;
        }
    }
    a.vy = Math.max(-40, a.vy - 19 * dt);
    const dy = a.vy * dt, steps = Math.max(1, Math.ceil(Math.abs(dy) / 0.2));
    a.onGround = false;
    for (let i = 0; i < steps; i++) {
        const d = dy / steps;
        if (!this.occupied(a, a.x, a.y + d, a.z, r, height))
            a.y += d;
        else {
            let low = 0, high = 1;
            for (let n = 0; n < 9; n++) {
                const m = (low + high) / 2;
                if (this.occupied(a, a.x, a.y + d * m, a.z, r, height))
                    high = m;
                else
                    low = m;
            }
            a.y += d * low;
            if (d < 0) {
                a.onGround = true;
                if (!a.isVehicle && a.vy < -13)
                    this.hurt(a, (-a.vy - 13) * 6, null);
            }
            a.vy = 0;
            break;
        }
    }
    a.ix = (a.ix || 0) * Math.exp(-6 * dt);
    a.iz = (a.iz || 0) * Math.exp(-6 * dt);
    a.x = (0, math_1.clamp)(a.x, r + 1, config_1.W - r - 1);
    a.z = (0, math_1.clamp)(a.z, r + 1, config_1.D - r - 1);
}

},
"src/simulation/player-actions.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactionStatus = interactionStatus;
exports.fortificationStatus = fortificationStatus;
exports.kitStatus = kitStatus;
const math_1 = require("../core/math");
const equipment_1 = require("./equipment");
const interactions_1 = require("./interactions");
const navigation_1 = require("./navigation");
const perception_1 = require("./perception");
const section_query_1 = require("./section-query");
const status = (action, label, reason = '', cooldown = 0) => ({ action, label, reason, cooldown, available: !reason && cooldown <= 0 });
/** Read-only queries. Call again at input time: a displayed target is never an authorization to mutate it. */
function interactionStatus(s) {
    const p = s.player;
    if (!s.acceptsInput)
        return status('none', '', 'Unavailable');
    if (p.vehicle) {
        const v = p.vehicle;
        for (let i = 0; i < 12; i++) {
            const angle = (i * math_1.TAU) / 12, x = v.x + Math.sin(angle) * 3.6, z = v.z + Math.cos(angle) * 3.6, y = s.world.groundAt(x, z);
            if (Math.abs(y - v.y) < 1.1 &&
                (0, section_query_1.clearSegment)(s, { x: v.x, y: v.y + 1, z: v.z }, { x, y: y + 1, z }) &&
                !s.occupied(p, x, y, z, 0.3, 1.8) &&
                !s.actors.some((a) => a !== p && a.alive && !a.vehicle && (0, math_1.dist2)(a, { x, z }) < 0.65))
                return { ...status('exit', 'Exit armour'), position: { x, y, z } };
        }
        return status('exit', 'Exit armour', 'Exit blocked · move to clear ground');
    }
    const building = s.world.buildings.findIndex((b) => Math.hypot(p.x - b.lift.x, p.z - b.lift.z) < 3);
    if (building >= 0) {
        const b = s.world.buildings[building], current = Math.round((p.y - 5) / 5);
        const down = s.input.keys.has('ShiftLeft') || s.input.keys.has('ShiftRight');
        const level = down ? Math.max(0, current - 1) : (current + 1) % (b.floors + 1);
        const cooldown = Math.max(0, s.abilityClock, (p.liftReady ?? 0) - s.simTime);
        const reason = cooldown > 0
            ? 'Lift cycling'
            : level === current
                ? 'Already at this landing'
                : (0, navigation_1.liftDestination)(s, p, building, level)
                    ? ''
                    : 'Landing destroyed, occupied or unavailable';
        return {
            ...status('lift', `Lift ${down ? 'down' : 'up'} · Shift + E for down`, reason, cooldown),
            building,
            level,
        };
    }
    const vehicles = s.vehicles.filter((v) => v.alive && v.team === p.team && (0, math_1.dist2)(v, p) < 30.25);
    const vehicle = vehicles.find((v) => !v.driver &&
        Math.hypot(v.x - p.x, v.y - p.y, v.z - p.z) < 5.5 &&
        (0, section_query_1.clearSegment)(s, { x: p.x, y: p.y + 1, z: p.z }, { x: v.x, y: v.y + 1, z: v.z }));
    if (vehicle)
        return { ...status('enter', 'Enter armour'), vehicle };
    return vehicles.length
        ? status('enter', 'Enter armour', vehicles.every((v) => v.driver) ? 'Vehicle occupied' : 'Move closer with a clear approach')
        : status('none', '');
}
function fortificationStatus(s) {
    const p = s.player, cooldown = Math.max(0, s.abilityClock);
    if (s.activeKit !== 'engineer' || !p.alive || p.vehicle || !s.playing)
        return status('fortify', 'Build cover', 'Engineer loadout required · use on foot');
    const vehicle = s.vehicles.find((v) => v.alive && v.team === p.team && (0, math_1.dist2)(v, p) < 36 && v.hp < 600);
    if (vehicle)
        return {
            ...status('repair', 'Repair armour', cooldown
                ? 'Tool recharging'
                : (0, interactions_1.canInteract)(s, p, vehicle, 6)
                    ? ''
                    : 'Repair target obstructed or on another floor', cooldown),
            vehicle,
        };
    const d = (0, math_1.direction)(s.yaw), x = Math.floor(p.x + d.x * 3), z = Math.floor(p.z + d.z * 3), y = Math.floor(s.world.groundAt(x, z));
    if (cooldown)
        return status('fortify', 'Build cover', 'Tool recharging', cooldown);
    if (y > 8 || s.actors.some((a) => a.alive && (0, math_1.dist2)(a, { x, z }) < 4))
        return status('fortify', 'Build cover', 'Choose a clear patch of street');
    const cells = [];
    for (let k = -1; k <= 1; k++)
        for (let h = 0; h < 2; h++)
            cells.push({
                x: x + (Math.abs(d.z) > 0.7 ? k : 0),
                y: y + h,
                z: z + (Math.abs(d.z) > 0.7 ? 0 : k),
            });
    const blocked = cells.some((c) => !s.world.inside(c.x, c.y, c.z) ||
        s.world.cell(c.x, c.y, c.z) ||
        s.occupied(p, c.x + 0.5, c.y, c.z + 0.5, 0.5, 1) ||
        s.actors.some((a) => a.alive &&
            !a.vehicle &&
            Math.abs(a.x - c.x - 0.5) < 0.8 &&
            Math.abs(a.z - c.z - 0.5) < 0.8 &&
            a.y + a.height > c.y &&
            a.y < c.y + 1));
    return {
        ...status('fortify', 'Build cover', blocked ? 'Cover placement obstructed' : ''),
        cells,
    };
}
function kitStatus(s) {
    const p = s.player, kit = s.activeKit;
    const cooldown = Math.max(0, kit === 'engineer' || kit === 'assault' ? s.abilityClock : s.classClock);
    if (!s.acceptsInput || p.vehicle)
        return status('none', 'Class equipment', 'Available on foot');
    if (kit === 'engineer')
        return fortificationStatus(s);
    if (cooldown > 0)
        return status(kit === 'assault' ? 'dress' : kit === 'recon' ? 'spot' : kit === 'medic' ? 'medical' : 'ammo', kit === 'assault'
            ? 'Field dressing'
            : kit === 'recon'
                ? 'Spot contacts'
                : kit === 'medic'
                    ? 'Medical support'
                    : 'Ammunition support', 'Recharging', cooldown);
    if (kit === 'assault')
        return status('dress', 'Field dressing', p.hp >= 100 ? 'Already at full health' : '');
    if (kit === 'recon') {
        let visible = false;
        s.neighbours(p.x, p.z, 90, (a) => {
            if (a.alive &&
                a.team !== p.team &&
                (0, math_1.dist2)(a, p) < 8100 &&
                (0, perception_1.canSee)(s, { x: p.x, y: p.y + 1, z: p.z }, { x: a.x, y: a.y + 1, z: a.z }))
                visible = true;
        });
        return status('spot', 'Spot contacts', visible ? '' : 'No visible hostile contacts');
    }
    const friends = [];
    s.neighbours(p.x, p.z, 6, (a) => {
        if (a !== p && a.team === p.team)
            friends.push(a);
    });
    friends.sort((a, b) => (0, math_1.dist2)(a, p) - (0, math_1.dist2)(b, p));
    if (kit === 'medic') {
        const down = (s.squads[p.squadId]?.memberIds ?? [])
            .map((id) => s.actors[id])
            .find((a) => a &&
            a !== p &&
            !a.alive &&
            !a.vehicle &&
            (a.reviveUntil ?? 0) > s.simTime &&
            (0, interactions_1.canInteract)(s, p, a, 4) &&
            !s.occupied(a, a.x, a.y, a.z, 0.3, 1.8));
        if (down)
            return { ...status('revive', 'Revive squadmate'), target: down };
        const target = friends.find((a) => a.alive && !a.vehicle && a.hp < 95 && (0, interactions_1.canInteract)(s, p, a, 4));
        if (target)
            return { ...status('heal', 'Heal teammate'), target };
    }
    const placement = (0, equipment_1.deploymentStatus)(s, p, kit === 'medic' ? 'medical' : 'ammo');
    if (placement.position)
        return status(kit === 'medic' ? 'medical' : 'ammo', kit === 'medic' ? 'Deploy medical bag' : 'Deploy ammo crate');
    if (kit === 'support') {
        const target = friends.find((a) => a.alive &&
            (0, interactions_1.canInteract)(s, p, a, 5) &&
            (a.lastResupply ?? -100) <= s.simTime - 15 &&
            (0, equipment_1.needsSupplies)(s, a));
        if (target)
            return { ...status('resupply', 'Resupply teammate'), target };
    }
    return status(kit === 'medic' ? 'medical' : 'ammo', kit === 'medic' ? 'Deploy medical bag' : 'Deploy ammo crate', placement.reason);
}

},
"src/simulation/player.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePlayer = updatePlayer;
const configModule = require("../core/config");
const mathModule = require("../core/math");
function updatePlayer(dt) {
    if (!this.player.alive) {
        this.player.respawn = Math.max(0, this.player.respawn - dt);
        return;
    }
    this.player.shield = Math.max(0, this.player.shield - dt);
    this.handling.recoilV += (-125 * this.handling.recoil - 20 * this.handling.recoilV) * dt;
    this.handling.recoil += this.handling.recoilV * dt;
    this.handling.bloom = Math.max(0, this.handling.bloom - dt * 0.018);
    this.handling.ready = Math.max(0, this.handling.ready - dt);
    this.handling.land *= Math.exp(-dt * 12);
    this.handling.damageTime = Math.max(0, this.handling.damageTime - dt);
    this.aimAmount = mathModule.lerp(this.aimAmount, this.input.aim && this.reloadTime <= 0 ? 1 : 0, 1 - Math.exp(-dt * (this.weaponIndex === 1 ? 9 : 14)));
    const k = this.input.keys;
    let forward = (k.has('KeyW') ? 1 : 0) - (k.has('KeyS') ? 1 : 0) - this.input.mz, side = (k.has('KeyD') ? 1 : 0) - (k.has('KeyA') ? 1 : 0) + this.input.mx;
    const length = Math.hypot(forward, side);
    if (length > 1) {
        forward /= length;
        side /= length;
    }
    if (this.player.vehicle) {
        const v = this.player.vehicle;
        v.yaw = mathModule.angleWrap(v.yaw + side * dt * 1.5);
        const speed = forward * 10;
        v.vx = mathModule.lerp(v.vx, Math.sin(v.yaw) * speed, 1 - Math.exp(-dt * 5));
        v.vz = mathModule.lerp(v.vz, Math.cos(v.yaw) * speed, 1 - Math.exp(-dt * 5));
        this.moveBody(v, dt, v.radius, v.height);
        v.turret = this.yaw;
        v.pitch = mathModule.clamp(this.pitch, -0.2, 0.55);
        this.player.x = v.x;
        this.player.z = v.z;
        this.player.y = v.y + 1.4;
        if (this.input.fire && v.cool <= 0) {
            const d = mathModule.direction(v.turret, v.pitch);
            if (this.launch(this.player, { x: v.x + d.x * 2.8, y: v.y + 2.35 + d.y * 2.8, z: v.z + d.z * 2.8 }, d, 'shell')) {
                v.cool = 2.1 * (this.itemTuning.apc ?? 1);
                this.shake = 0.25;
                this.player.shield = 0;
            }
        }
        this.handling.sprint = 0;
        this.input.jump = false;
    }
    else {
        const crouching = this.input.crouch ||
            k.has('KeyC') ||
            (this.player.crouched &&
                this.occupied(this.player, this.player.x, this.player.y, this.player.z, 0.29, 1.8));
        this.player.crouched = crouching;
        this.player.height = crouching ? 1.25 : 1.8;
        const sprinting = (k.has('ShiftLeft') || k.has('ShiftRight') || (this.touch && length > 0.92)) &&
            forward > 0.3 &&
            !crouching &&
            !this.input.aim &&
            !this.input.fire &&
            this.reloadTime <= 0;
        if (sprinting)
            this.handling.ready = Math.max(this.handling.ready, 0.16);
        this.handling.sprint = mathModule.lerp(this.handling.sprint, sprinting ? 1 : 0, 1 - Math.exp(-dt * 9));
        let speed = crouching ? 2.5 : sprinting ? 7.6 : mathModule.lerp(4.7, 3, this.aimAmount);
        if (this.player.x > 249 && this.player.x < 263 && this.player.y < 2)
            speed *= 0.56;
        const response = 1 - Math.exp(-dt * (this.player.onGround ? 18 : 4));
        this.player.vx = mathModule.lerp(this.player.vx, (Math.sin(this.yaw) * forward + Math.cos(this.yaw) * side) * speed, response);
        this.player.vz = mathModule.lerp(this.player.vz, (Math.cos(this.yaw) * forward - Math.sin(this.yaw) * side) * speed, response);
        this.handling.coyote = this.player.onGround ? 0.1 : Math.max(0, this.handling.coyote - dt);
        this.handling.jumpBuffer = this.input.jump ? 0.14 : Math.max(0, this.handling.jumpBuffer - dt);
        this.input.jump = false;
        if (this.handling.jumpBuffer > 0 && this.handling.coyote > 0) {
            if (!this.mantle()) {
                this.player.vy = 7;
                this.player.onGround = false;
            }
            this.handling.coyote = this.handling.jumpBuffer = 0;
        }
        const falling = this.player.vy, wasGround = this.player.onGround;
        this.moveBody(this.player, dt, 0.29, this.player.height);
        const travelled = Math.hypot(this.player.vx, this.player.vz) * dt;
        this.player.walk += travelled;
        if (this.player.onGround && !wasGround && falling < -4) {
            this.handling.land = Math.min(0.13, -falling * 0.006);
            this.soundAt('step', this.player.x, this.player.z, 0.3);
        }
        if (this.player.onGround) {
            this.handling.step += travelled;
            if (this.handling.step > (sprinting ? 2.25 : 1.85)) {
                this.handling.step = 0;
                this.soundAt('step', this.player.x, this.player.z, crouching ? 0.045 : sprinting ? 0.15 : 0.09);
            }
        }
        if (this.reloadTime > 0) {
            this.reloadTime = Math.max(0, this.reloadTime - dt);
            if (this.reloadTime === 0) {
                const take = Math.min(configModule.weapons[this.weaponIndex].mag - this.ammo[this.weaponIndex], this.reserves[this.weaponIndex]);
                this.ammo[this.weaponIndex] += take;
                this.reserves[this.weaponIndex] -= take;
                this.soundAt('click', this.player.x, this.player.z, 0.2);
            }
        }
        if ((this.input.fire || this.input.firePressed) &&
            this.fireTime <= 0 &&
            this.reloadTime <= 0 &&
            this.handling.ready <= 0 &&
            (configModule.weapons[this.weaponIndex].automatic ||
                !this.handling.trigger ||
                this.input.firePressed)) {
            const w = configModule.weapons[this.weaponIndex];
            if (this.ammo[this.weaponIndex] <= 0)
                this.reload();
            else {
                const spread = this.weaponSpread(), d = mathModule.direction(this.yaw + this.world.rnd(-spread, spread), this.pitch + this.handling.recoil + this.world.rnd(-spread, spread));
                const o = {
                    x: this.player.x,
                    y: this.player.y + (crouching ? 1.08 : 1.57),
                    z: this.player.z,
                };
                const accepted = this.weaponIndex !== 2 || this.launch(this.player, o, d);
                if (accepted) {
                    this.ammo[this.weaponIndex]--;
                    this.fireTime += w.delay;
                    this.player.shield = 0;
                    if (this.weaponIndex !== 2)
                        this.bullet(this.player, o, d, w.damage);
                    this.handling.recoil +=
                        w.kick * this.weaponTuning[this.weaponIndex].kick * (this.input.aim ? 0.7 : 1);
                    this.handling.recoilV += w.kick * this.weaponTuning[this.weaponIndex].kick * 5;
                    this.handling.bloom = Math.min(0.018, this.handling.bloom + (this.weaponIndex === 1 ? 0.003 : 0.0019));
                    this.shake = Math.max(this.shake, 0.025);
                    this.flashes.push({
                        x: o.x + d.x * 0.75,
                        y: o.y + d.y * 0.75,
                        z: o.z + d.z * 0.75,
                        r: 0.13,
                        life: 0.05,
                    });
                }
            }
        }
    }
    this.handling.trigger = this.input.fire;
    this.input.firePressed = false;
    if (this.simTime - this.player.lastHit > 7)
        this.player.hp = Math.min(100, this.player.hp + dt * 8);
    this.fireTime = Math.max(this.input.fire ? -dt : 0, this.fireTime - dt);
    this.grenadeTime = Math.max(0, this.grenadeTime - dt);
}

},
"src/simulation/projectile-flight.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveThrown = moveThrown;
exports.predictGrenade = predictGrenade;
const config_1 = require("../core/config");
const projectiles_1 = require("../core/projectiles");
const section_query_1 = require("./section-query");
/** Shared by the live grenade update and the NPC trajectory predictor. */
function moveThrown(sim, p, dt) {
    const next = { x: p.x + p.vx * dt, y: p.y + p.vy * dt, z: p.z + p.vz * dt };
    const blocked = (q) => sim.world.solid(q.x, q.y, q.z) || (0, section_query_1.sectionBlocked)(sim, q, 0.1, 0.2);
    if (!blocked(next)) {
        Object.assign(p, next);
        return;
    }
    if (blocked({ x: next.x, y: p.y, z: p.z }))
        p.vx *= -0.48;
    if (blocked({ x: p.x, y: next.y, z: p.z })) {
        p.vy *= -0.42;
        p.vx *= 0.76;
        p.vz *= 0.76;
    }
    if (blocked({ x: p.x, y: p.y, z: next.z }))
        p.vz *= -0.48;
}
function predictGrenade(sim, origin, dir) {
    const spec = projectiles_1.projectileSpec.grenade;
    const p = {
        x: origin.x + dir.x * 0.35,
        y: origin.y + dir.y * 0.35,
        z: origin.z + dir.z * 0.35,
        vx: dir.x * spec.speed,
        vy: dir.y * spec.speed + spec.lift,
        vz: dir.z * spec.speed,
        source: null,
        type: 'grenade',
        life: spec.fuse,
    };
    for (let n = 0; n < Math.ceil(spec.fuse / config_1.STEP); n++) {
        const dt = Math.min(config_1.STEP, p.life);
        p.life -= dt;
        p.vy -= spec.gravity * dt;
        const steps = Math.max(1, Math.ceil((Math.hypot(p.vx, p.vy, p.vz) * dt) / 0.4));
        for (let i = 0; i < steps; i++)
            moveThrown(sim, p, dt / steps);
        if (p.y < -2 || p.x < 1 || p.x > config_1.W - 1 || p.z < 1 || p.z > config_1.D - 1)
            return null;
    }
    return { x: p.x, y: p.y, z: p.z };
}

},
"src/simulation/projectile-sweep.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROJECTILE_RADIUS = void 0;
exports.terrainSweep = terrainSweep;
exports.muzzleCollision = muzzleCollision;
const collision_geometry_1 = require("./collision-geometry");
const section_query_1 = require("./section-query");
exports.PROJECTILE_RADIUS = 0.085;
/** Walk the flight segment and test neighbouring cells against the expanded projectile. */
function terrainSweep(sim, o, d, length, radius = exports.PROJECTILE_RADIUS) {
    let hit = null;
    if (![length, radius, o.x, o.y, o.z, d.x, d.y, d.z].every(Number.isFinite) ||
        length < 0 ||
        radius < 0)
        return null;
    const visited = new Set(), steps = Math.max(1, Math.ceil(length));
    for (let i = 0; i < steps; i++) {
        const t0 = (length * i) / steps, t1 = (length * (i + 1)) / steps;
        if (hit && t0 > hit.t + 1)
            break;
        const a = { x: o.x + d.x * t0, y: o.y + d.y * t0, z: o.z + d.z * t0 };
        const b = { x: o.x + d.x * t1, y: o.y + d.y * t1, z: o.z + d.z * t1 };
        for (let z = Math.floor(Math.min(a.z, b.z) - radius); z <= Math.floor(Math.max(a.z, b.z) + radius); z++)
            for (let y = Math.floor(Math.min(a.y, b.y) - radius); y <= Math.floor(Math.max(a.y, b.y) + radius); y++)
                for (let x = Math.floor(Math.min(a.x, b.x) - radius); x <= Math.floor(Math.max(a.x, b.x) + radius); x++) {
                    if (!sim.world.cell(x, y, z))
                        continue;
                    const key = sim.world.index(x, y, z);
                    if (visited.has(key))
                        continue;
                    visited.add(key);
                    const h = (0, collision_geometry_1.segmentBox)(o, d, length, (0, collision_geometry_1.axisBox)({ min: { x, y, z }, max: { x: x + 1, y: y + 1, z: z + 1 } }), radius);
                    if (h && (!hit || h.t < hit.t))
                        hit = h;
                }
    }
    return hit;
}
/** The muzzle is a swept segment, not a teleport past cover or friendly bodies. */
function muzzleCollision(sim, origin, muzzle, source) {
    const delta = { x: muzzle.x - origin.x, y: muzzle.y - origin.y, z: muzzle.z - origin.z };
    const length = Math.hypot(delta.x, delta.y, delta.z);
    const d = length > 1e-8
        ? { x: delta.x / length, y: delta.y / length, z: delta.z / length }
        : { x: 0, y: 0, z: 1 };
    const terrain = terrainSweep(sim, origin, d, length), section = (0, section_query_1.sectionRay)(sim, origin, d, length, exports.PROJECTILE_RADIUS);
    let nearest = Math.min(terrain?.t ?? Infinity, section?.t ?? Infinity);
    const ownVehicle = source && ('driver' in source ? source : source.vehicle);
    for (const a of sim.actors) {
        if (a === source ||
            !a.alive ||
            a.vehicle ||
            Math.hypot(a.x - origin.x, a.z - origin.z) > length + 1)
            continue;
        nearest = Math.min(nearest, sim.rayBox(origin, d, {
            x: a.x,
            y: a.y + a.height / 2,
            z: a.z,
            xr: 0.34 + exports.PROJECTILE_RADIUS,
            yr: a.height / 2 + exports.PROJECTILE_RADIUS,
            zr: 0.34 + exports.PROJECTILE_RADIUS,
        }));
    }
    for (const v of sim.vehicles) {
        if (v === ownVehicle || !v.alive)
            continue;
        nearest = Math.min(nearest, sim.rayBox(origin, d, {
            x: v.x,
            y: v.y + v.height / 2,
            z: v.z,
            xr: v.radius + exports.PROJECTILE_RADIUS,
            yr: v.height / 2 + exports.PROJECTILE_RADIUS,
            zr: v.radius + exports.PROJECTILE_RADIUS,
        }));
    }
    if (nearest > length)
        return null;
    const t = Math.max(0, nearest - 0.03);
    return { x: origin.x + d.x * t, y: origin.y + d.y * t, z: origin.z + d.z * t };
}

},
"src/simulation/rotation.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unrotate = exports.identity = void 0;
exports.multiply = multiply;
exports.rotate = rotate;
exports.integrateRotation = integrateRotation;
exports.withRotation = withRotation;
exports.inverseWorld = inverseWorld;
exports.kineticEnergy = kineticEnergy;
exports.rotationAxes = rotationAxes;
const identity = () => ({ x: 0, y: 0, z: 0, w: 1 });
exports.identity = identity;
function multiply(a, b) {
    const q = {
        x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
        y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
        z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
        w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
    };
    const n = Math.hypot(q.x, q.y, q.z, q.w) || 1;
    return { x: q.x / n, y: q.y / n, z: q.z / n, w: q.w / n };
}
function rotate(q, p) {
    const tx = 2 * (q.y * p.z - q.z * p.y), ty = 2 * (q.z * p.x - q.x * p.z), tz = 2 * (q.x * p.y - q.y * p.x);
    return {
        x: p.x + q.w * tx + q.y * tz - q.z * ty,
        y: p.y + q.w * ty + q.z * tx - q.x * tz,
        z: p.z + q.w * tz + q.x * ty - q.y * tx,
    };
}
const unrotate = (q, p) => rotate({ x: -q.x, y: -q.y, z: -q.z, w: q.w }, p);
exports.unrotate = unrotate;
function integrateRotation(b, dt) {
    const w = b.omega, n = Math.hypot(w.x, w.y, w.z);
    if (n < 1e-12)
        return;
    const s = Math.sin((n * dt) / 2) / n;
    b.orientation = multiply({ x: w.x * s, y: w.y * s, z: w.z * s, w: Math.cos((n * dt) / 2) }, b.orientation);
}
function angles(b) {
    const x = rotate(b.orientation, { x: 1, y: 0, z: 0 }), y = rotate(b.orientation, { x: 0, y: 1, z: 0 }), z = rotate(b.orientation, { x: 0, y: 0, z: 1 });
    return {
        yaw: Math.atan2(z.x, z.z),
        pitch: Math.asin(Math.max(-1, Math.min(1, z.y))),
        roll: Math.atan2(x.y, y.y),
    };
}
/** Compatibility accessors for old fixtures/debugging; physical integration uses quaternion/omega. */
function withRotation(b) {
    for (const axis of ['yaw', 'pitch', 'roll'])
        Object.defineProperty(b, axis, {
            enumerable: true,
            configurable: true,
            get: () => angles(b)[axis],
            set: (v) => {
                const a = angles(b);
                a[axis] = v;
                const sy = Math.sin(a.yaw / 2), cy = Math.cos(a.yaw / 2), sp = Math.sin(-a.pitch / 2), cp = Math.cos(a.pitch / 2), sr = Math.sin(a.roll / 2), cr = Math.cos(a.roll / 2);
                b.orientation = multiply(multiply({ x: 0, y: sy, z: 0, w: cy }, { x: sp, y: 0, z: 0, w: cp }), { x: 0, y: 0, z: sr, w: cr });
            },
        });
    const rates = () => {
        const a = angles(b), sy = Math.sin(a.yaw), cy = Math.cos(a.yaw), cp = Math.cos(a.pitch), sp = Math.sin(a.pitch), roll = (sy * b.omega.x + cy * b.omega.z) / (Math.abs(cp) < 1e-8 ? 1e-8 : cp);
        return {
            spinRoll: roll,
            spinPitch: -cy * b.omega.x + sy * b.omega.z,
            spinYaw: b.omega.y - sp * roll,
        };
    };
    for (const axis of ['spinRoll', 'spinPitch', 'spinYaw'])
        Object.defineProperty(b, axis, {
            enumerable: true,
            configurable: true,
            get: () => rates()[axis],
            set: (value) => {
                const r = rates();
                r[axis] = value;
                const a = angles(b), sy = Math.sin(a.yaw), cy = Math.cos(a.yaw), sp = Math.sin(a.pitch), cp = Math.cos(a.pitch);
                b.omega = {
                    x: sy * cp * r.spinRoll - cy * r.spinPitch,
                    y: sp * r.spinRoll + r.spinYaw,
                    z: cy * cp * r.spinRoll + sy * r.spinPitch,
                };
            },
        });
    return b;
}
function inverseWorld(b, v) {
    const p = (0, exports.unrotate)(b.orientation, v), xx = b.inertia.x, yy = b.inertia.y, zz = b.inertia.z, [xy, xz, yz] = b.inertiaCross;
    const a = yy * zz - yz * yz, c = xz * yz - xy * zz, d = xy * yz - xz * yy, e = xx * zz - xz * xz, f = xy * xz - xx * yz, g = xx * yy - xy * xy, det = xx * a + xy * c + xz * d;
    if (!(det > 1e-12))
        return rotate(b.orientation, {
            x: p.x / Math.max(1e-6, xx),
            y: p.y / Math.max(1e-6, yy),
            z: p.z / Math.max(1e-6, zz),
        });
    return rotate(b.orientation, {
        x: (a * p.x + c * p.y + d * p.z) / det,
        y: (c * p.x + e * p.y + f * p.z) / det,
        z: (d * p.x + f * p.y + g * p.z) / det,
    });
}
function kineticEnergy(b) {
    const w = (0, exports.unrotate)(b.orientation, b.omega), [xy, xz, yz] = b.inertiaCross;
    return (0.5 *
        (b.mass * (b.vx * b.vx + b.vy * b.vy + b.vz * b.vz) +
            b.inertia.x * w.x * w.x +
            b.inertia.y * w.y * w.y +
            b.inertia.z * w.z * w.z +
            2 * (xy * w.x * w.y + xz * w.x * w.z + yz * w.y * w.z)));
}
const basisCache = new WeakMap();
/** One quaternion basis per pose, shared by collision boxes and their enclosing bounds. */
function rotationAxes(body) {
    const q = body.orientation;
    let cached = basisCache.get(body);
    if (!cached || cached.x !== q.x || cached.y !== q.y || cached.z !== q.z || cached.w !== q.w) {
        cached = {
            x: q.x,
            y: q.y,
            z: q.z,
            w: q.w,
            axes: [
                rotate(q, { x: 1, y: 0, z: 0 }),
                rotate(q, { x: 0, y: 1, z: 0 }),
                rotate(q, { x: 0, y: 0, z: 1 }),
            ],
        };
        basisCache.set(body, cached);
    }
    return cached.axes;
}

},
"src/simulation/rubble-contacts.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactPassPending = contactPassPending;
exports.cancelRubbleContacts = cancelRubbleContacts;
exports.resolveRubbleContacts = resolveRubbleContacts;
const body_contact_query_1 = require("./body-contact-query");
const collision_geometry_1 = require("./collision-geometry");
const contact_1 = require("./contact");
const rubble_shape_1 = require("./rubble-shape");
const section_fracture_1 = require("./section-fracture");
const section_tree_1 = require("./section-tree");
const passes = new WeakMap();
/** Sweep-and-prune retains its position across frames; distant pairs never enter SAT. */
function* candidates(bodies, excluded) {
    const ordered = bodies
        .filter((b) => b.voxels.length && !excluded?.has(b))
        .map((body) => ({ body, bounds: (0, rubble_shape_1.rubbleBounds)(body) }))
        .sort((a, b) => a.bounds.min.x - b.bounds.min.x || a.body.id - b.body.id);
    for (let i = 0; i < ordered.length; i++) {
        const a = ordered[i];
        for (let j = i + 1; j < ordered.length && ordered[j].bounds.min.x < a.bounds.max.x; j++) {
            const b = ordered[j];
            if ((!a.body.sleeping || !b.body.sleeping) && (0, section_tree_1.intersects)(a.bounds, b.bounds))
                yield { a: a.body, b: b.body };
            else
                yield;
        }
        yield;
    }
}
// Snapshot only geometry/pose data. Identity, health and velocities remain authoritative on the live body.
function snapshot(body) {
    const copy = {
        ...body,
        orientation: { ...body.orientation },
        centre: { ...body.centre },
        voxels: body.voxels.slice(),
    };
    (0, section_tree_1.shareSectionTree)(body, copy);
    (0, collision_geometry_1.shareCollisionGeometry)(body, copy);
    return copy;
}
function contactPassPending(bodies) {
    return passes.has(bodies);
}
function cancelRubbleContacts(bodies) {
    const pass = passes.get(bodies);
    pass?.query?.return([]);
    pass?.candidates.return();
    passes.delete(bodies);
}
/**
 * Contact work is transactional. The motion scheduler holds poses while this pass is pending.
 * Even an external edit cannot corrupt a suspended query: it owns an immutable geometry snapshot,
 * and its result is committed only when both live poses still match that snapshot.
 */
function resolveRubbleContacts(bodies, canMove, _cursor = 0, budget, deferredBodies) {
    if (!bodies.length) {
        cancelRubbleContacts(bodies);
        return 'complete';
    }
    let pass = passes.get(bodies);
    if (!pass) {
        pass = { candidates: candidates(bodies, deferredBodies) };
        passes.set(bodies, pass);
    }
    // Callers without a budget deliberately drain the pass (unit tests and offline tools).
    const exhausted = () => !!budget && (budget.probes <= 0 || budget.pairs <= 0 || performance.now() >= budget.deadline);
    while (!exhausted()) {
        if (!pass.pair) {
            const next = pass.candidates.next();
            if (budget)
                budget.probes--;
            if (next.done) {
                passes.delete(bodies);
                return 'complete';
            }
            if (!next.value)
                continue;
            const { a, b } = next.value;
            if (!bodies.includes(a) || !bodies.includes(b) || !a.voxels.length || !b.voxels.length)
                continue;
            pass.pair = { a, b };
            pass.keys = [(0, body_contact_query_1.bodyPoseKey)(a), (0, body_contact_query_1.bodyPoseKey)(b)];
            pass.query = (0, body_contact_query_1.bodyContactQuery)(snapshot(b), snapshot(a), { x: 0, y: 0, z: 0 }, false, 32);
        }
        if (exhausted())
            return 'deferred';
        const { a, b } = pass.pair;
        const unchanged = () => bodies.includes(a) &&
            bodies.includes(b) &&
            pass.keys[0] === (0, body_contact_query_1.bodyPoseKey)(a) &&
            pass.keys[1] === (0, body_contact_query_1.bodyPoseKey)(b);
        if (!pass.contacts) {
            const next = pass.query.next();
            if (budget)
                budget.probes -= 16;
            if (!next.done)
                continue;
            pass.contacts = next.value.map((c) => ({ ...c, body: a }));
            pass.corrections = [];
            pass.correctionIndex = 0;
            if (unchanged() && pass.contacts.length) {
                const c = pass.contacts.reduce((best, value) => value.penetration > best.penetration ? value : best);
                const ia = a.sleeping ? 0 : 1 / a.mass, ib = b.sleeping ? 0 : 1 / b.mass, total = Math.max(1e-9, ia + ib);
                for (const [body, scale] of [
                    [a, -ia / total],
                    [b, ib / total],
                ]) {
                    if (!scale)
                        continue;
                    const d = Math.min(0.15, c.penetration * 0.5) * scale;
                    pass.corrections.push({
                        body,
                        point: {
                            x: body.x + c.normal.x * d,
                            y: body.y + c.normal.y * d,
                            z: body.z + c.normal.z * d,
                        },
                    });
                }
            }
        }
        if (exhausted())
            return 'deferred';
        if (unchanged()) {
            while (pass.correctionIndex < pass.corrections.length) {
                const correction = pass.corrections[pass.correctionIndex], p = correction.point;
                const result = canMove(correction.body, p.x, p.y, p.z);
                if (result === 'deferred')
                    return 'deferred';
                correction.allowed = result;
                pass.correctionIndex++;
            }
            if (pass.contacts.length) {
                // No impulse is published twice while waiting on a deferred correction query.
                const response = (0, contact_1.resolveManifold)(b, pass.contacts), c = pass.contacts[0];
                if (response.closing > 4) {
                    (0, section_fracture_1.queueImpact)(a, c.point, response.closing, response.dissipated * 0.25);
                    (0, section_fracture_1.queueImpact)(b, c.point, response.closing, response.dissipated * 0.25);
                    a.sleeping = b.sleeping = false;
                    a.restTime = b.restTime = 0;
                }
                for (const correction of pass.corrections)
                    if (correction.allowed)
                        Object.assign(correction.body, correction.point);
            }
        }
        pass.pair = undefined;
        pass.query = undefined;
        pass.keys = undefined;
        pass.contacts = undefined;
        pass.corrections = undefined;
        pass.correctionIndex = 0;
        if (budget)
            budget.pairs--;
    }
    return 'deferred';
}

},
"src/simulation/rubble-shape.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rubbleShape = rubbleShape;
exports.rubbleBounds = rubbleBounds;
exports.turnSection = turnSection;
exports.sectionOverlap = sectionOverlap;
exports.angularVelocity = angularVelocity;
exports.pointVelocity = pointVelocity;
const collision_geometry_1 = require("./collision-geometry");
const rotation_1 = require("./rotation");
const section_tree_1 = require("./section-tree");
/** Matches the instance shader's yaw/pitch/roll transform, around the section centre. */
function rubbleShape(b) {
    if (b.shapeYaw === b.yaw && b.shapePitch === b.pitch && b.shapeRoll === b.roll)
        return b.shape;
    const ex = turnSection(b, { x: 1, y: 0, z: 0 }), ey = turnSection(b, { x: 0, y: 1, z: 0 }), ez = turnSection(b, { x: 0, y: 0, z: 1 });
    b.extent.x = 0.49 * (Math.abs(ex.x) + Math.abs(ey.x) + Math.abs(ez.x));
    b.extent.y = 0.49 * (Math.abs(ex.y) + Math.abs(ey.y) + Math.abs(ez.y));
    b.extent.z = 0.49 * (Math.abs(ex.z) + Math.abs(ey.z) + Math.abs(ez.z));
    b.voxels.forEach((v, index) => {
        const x = v.x + 0.5 - b.centre.x, y = v.y + 0.5 - b.centre.y, z = v.z + 0.5 - b.centre.z;
        const point = b.shape[index] ?? (b.shape[index] = { x: 0, y: 0, z: 0, material: v.material });
        point.x = b.centre.x + ex.x * x + ey.x * y + ez.x * z;
        point.y = b.centre.y + ex.y * x + ey.y * y + ez.y * z;
        point.z = b.centre.z + ex.z * x + ey.z * y + ez.z * z;
    });
    b.shapeYaw = b.yaw;
    b.shapePitch = b.pitch;
    b.shapeRoll = b.roll;
    for (const axis of ['x', 'y', 'z']) {
        b.boundsMin[axis] = Infinity;
        b.boundsMax[axis] = -Infinity;
        for (const p of b.shape) {
            b.boundsMin[axis] = Math.min(b.boundsMin[axis], p[axis] - b.extent[axis]);
            b.boundsMax[axis] = Math.max(b.boundsMax[axis], p[axis] + b.extent[axis]);
        }
    }
    return b.shape;
}
function rubbleBounds(b, position = b) {
    return (0, section_tree_1.rotatedBounds)(b, { x: 0.01, y: 0.01, z: 0.01 }, { x: b.width - 0.01, y: b.height - 0.01, z: b.depth - 0.01 }, position);
}
function turnSection(b, p) {
    return (0, rotation_1.rotate)(b.orientation, p);
}
function sectionOverlap(b, p, radius, height, old = b) {
    const bounds = rubbleBounds(b);
    if (p.x + radius < Math.min(bounds.min.x, bounds.min.x + old.x - b.x) ||
        p.x - radius > Math.max(bounds.max.x, bounds.max.x + old.x - b.x) ||
        p.z + radius < Math.min(bounds.min.z, bounds.min.z + old.z - b.z) ||
        p.z - radius > Math.max(bounds.max.z, bounds.max.z + old.z - b.z) ||
        p.y + height < Math.min(bounds.min.y, bounds.min.y + old.y - b.y) ||
        p.y > Math.max(bounds.max.y, bounds.max.y + old.y - b.y))
        return false;
    const query = {
        min: { x: p.x - radius, y: p.y, z: p.z - radius },
        max: { x: p.x + radius, y: p.y + height, z: p.z + radius },
    };
    let hit = false;
    (0, section_tree_1.visitSection)(b, (bounds) => {
        for (const axis of ['x', 'y', 'z']) {
            bounds.min[axis] += Math.min(0, old[axis] - b[axis]);
            bounds.max[axis] += Math.max(0, old[axis] - b[axis]);
        }
        return (0, section_tree_1.intersects)(query, bounds);
    }, (index) => {
        const v = b.voxels[index];
        const box = (0, collision_geometry_1.orientedBox)(b, { x: v.x + 0.01, y: v.y + 0.01, z: v.z + 0.01 }, { x: v.x + 0.99, y: v.y + 0.99, z: v.z + 0.99 }, old, index);
        if ((0, collision_geometry_1.sweepObb)(box, (0, collision_geometry_1.axisBox)(query), { x: b.x - old.x, y: b.y - old.y, z: b.z - old.z })) {
            hit = true;
            return false;
        }
    });
    return hit;
}
/** World angular velocity for the renderer's yaw * pitch * roll convention. */
function angularVelocity(b) {
    return { ...b.omega };
}
function pointVelocity(b, offset) {
    const w = angularVelocity(b);
    return {
        x: b.vx + w.y * offset.z - w.z * offset.y,
        y: b.vy + w.z * offset.x - w.x * offset.z,
        z: b.vz + w.x * offset.y - w.y * offset.x,
    };
}

},
"src/simulation/rubble-support.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportFootprint = supportFootprint;
exports.groundedPath = groundedPath;
exports.supportUnchanged = supportUnchanged;
exports.probeSupport = probeSupport;
exports.clearSupportQueries = clearSupportQueries;
exports.pruneSupportQueries = pruneSupportQueries;
const config_1 = require("../core/config");
const body_contact_query_1 = require("./body-contact-query");
const rubble_shape_1 = require("./rubble-shape");
const section_index_1 = require("./section-index");
const section_tree_1 = require("./section-tree");
const terrain_contact_1 = require("./terrain-contact");
const cross = (o, a, b) => (a.x - o.x) * (b.z - o.z) - (a.z - o.z) * (b.x - o.x);
function supportFootprint(contacts, centre) {
    const points = contacts
        .filter((c) => c.normal.y > 0.6)
        .flatMap((c) => [
        { x: c.minX, y: c.point.y, z: c.minZ },
        { x: c.maxX, y: c.point.y, z: c.minZ },
        { x: c.maxX, y: c.point.y, z: c.maxZ },
        { x: c.minX, y: c.point.y, z: c.maxZ },
    ])
        .sort((a, b) => a.x - b.x || a.z - b.z);
    if (!points.length)
        return { stable: false, point: centre, hull: [] };
    const half = (list) => {
        const result = [];
        for (const p of list) {
            while (result.length >= 2 &&
                cross(result[result.length - 2], result[result.length - 1], p) <= 0)
                result.pop();
            result.push(p);
        }
        return result;
    };
    const lower = half(points), upper = half([...points].reverse());
    lower.pop();
    upper.pop();
    const hull = lower.concat(upper);
    let stable = hull.length >= 3, closest = Infinity, point = points[0];
    for (let i = 0; i < hull.length; i++) {
        const a = hull[i], b = hull[(i + 1) % hull.length], dx = b.x - a.x, dz = b.z - a.z;
        stable &&= cross(a, b, centre) >= -0.03 * Math.hypot(dx, dz);
        const t = Math.max(0, Math.min(1, ((centre.x - a.x) * dx + (centre.z - a.z) * dz) / Math.max(1e-8, dx * dx + dz * dz)));
        const p = { x: a.x + dx * t, y: a.y + (b.y - a.y) * t, z: a.z + dz * t };
        const distance = (p.x - centre.x) ** 2 + (p.z - centre.z) ** 2;
        if (distance < closest) {
            point = p;
            closest = distance;
        }
    }
    if (stable)
        point = { x: centre.x, y: Math.max(...contacts.map((c) => c.point.y)), z: centre.z };
    return { stable, point, hull };
}
function groundedPath(sim, body, visited = new Set()) {
    // A graph walk visits each support once, including cyclic stacks. Branch-local copies
    // made a densely interlocked pile exponential even though its graph is small.
    const pending = [body];
    while (pending.length) {
        const current = pending.pop();
        if (visited.has(current) || !current.support?.stable)
            continue;
        visited.add(current);
        if (current.support.terrain.some((t) => sim.world.vox[t.key] === t.material))
            return true;
        for (const link of current.support.bodies)
            if (!visited.has(link.body) && sim.rubble.includes(link.body))
                pending.push(link.body);
    }
    return false;
}
function supportUnchanged(sim, b) {
    const s = b.support;
    return (!!s?.stable &&
        s.terrain.every((t) => sim.world.vox[t.key] === t.material) &&
        (s.chunks?.every((c) => sim.world.chunkRevisions[c.id] === c.revision) ??
            b.sleepRevision === sim.world.revision) &&
        s.bodies.every((n) => n.body.sleeping &&
            sim.rubble.includes(n.body) &&
            n.version === n.body.geometryVersion &&
            n.x === n.body.x &&
            n.y === n.body.y &&
            n.z === n.body.z &&
            n.yaw === n.body.yaw &&
            n.pitch === n.body.pitch &&
            n.roll === n.body.roll) &&
        groundedPath(sim, b));
}
const supportQueries = new WeakMap();
function probeSupport(sim, b) {
    const cached = supportQueries.get(b);
    if (cached)
        for (const [body, query] of cached) {
            if (!sim.rubble.includes(body)) {
                query.job.return([]);
                cached.delete(body);
            }
        }
    if (b.support)
        b.support.bodies = b.support.bodies.filter((n) => sim.rubble.includes(n.body));
    const result = (0, terrain_contact_1.terrainContacts)(sim, b, b.x, b.y - 0.07, b.z, b, true);
    if (result.kind === 'deferred')
        return result;
    // Body contacts must never be appended to the memoised terrain-only result.
    const contacts = result.kind === 'contact' ? [...result.contacts] : [];
    const original = (0, rubble_shape_1.rubbleBounds)(b);
    const bounds = { min: { ...original.min, y: original.min.y - 0.07 }, max: { ...original.max } };
    for (const other of (0, section_index_1.nearbySections)(sim, bounds)) {
        if (other === b || !groundedPath(sim, other) || !(0, section_tree_1.intersects)(bounds, (0, rubble_shape_1.rubbleBounds)(other)))
            continue;
        let queries = supportQueries.get(b);
        if (!queries) {
            queries = new Map();
            supportQueries.set(b, queries);
        }
        const key = (0, body_contact_query_1.bodyPoseKey)(b) + '|' + (0, body_contact_query_1.bodyPoseKey)(other);
        let query = queries.get(other);
        if (!query || query.key !== key) {
            query = { key, job: (0, body_contact_query_1.bodyContactQuery)(b, other, { x: 0, y: -0.07, z: 0 }, true) };
            queries.set(other, query);
        }
        const deadline = sim.destructionBudget?.deadline ?? Infinity;
        while (!query.result && performance.now() < deadline) {
            const next = query.job.next();
            if (next.done)
                query.result = next.value;
        }
        if (!query.result) {
            sim.destructionStats.deferredQueries++;
            return { kind: 'deferred' };
        }
        contacts.push(...query.result);
    }
    const centre = { x: b.x + b.centre.x, y: b.y + b.centre.y, z: b.z + b.centre.z };
    const terrainOnly = contacts.filter((c) => c.terrain !== undefined);
    const terrainFootprint = supportFootprint(terrainOnly, centre);
    const used = terrainFootprint.stable ? terrainOnly : contacts;
    const footprint = supportFootprint(used, {
        x: b.x + b.centre.x,
        y: b.y + b.centre.y,
        z: b.z + b.centre.z,
    });
    b.support = {
        ...footprint,
        chunks: [
            ...new Set(used
                .filter((c) => c.terrain !== undefined)
                .map((c) => {
                const x = c.terrain % config_1.W, z = Math.floor(c.terrain / config_1.W) % config_1.D;
                return Math.floor(z / config_1.CS) * config_1.NX + Math.floor(x / config_1.CS);
            })),
        ].map((id) => ({ id, revision: sim.world.chunkRevisions[id] })),
        terrain: used
            .filter((c) => c.terrain !== undefined)
            .map((c) => ({ key: c.terrain, material: sim.world.vox[c.terrain] })),
        bodies: [...new Set(contacts.flatMap((c) => (c.body ? [c.body] : [])))].map((body) => ({
            body,
            version: body.geometryVersion,
            x: body.x,
            y: body.y,
            z: body.z,
            yaw: body.yaw,
            pitch: body.pitch,
            roll: body.roll,
        })),
    };
    return contacts.length ? { kind: 'contact', contacts } : { kind: 'clear' };
}
function clearSupportQueries(bodies) {
    for (const b of bodies) {
        for (const query of supportQueries.get(b)?.values() ?? [])
            query.job.return([]);
        supportQueries.delete(b);
        b.support = undefined;
    }
}
/** Collection outside the query path also covers unchanged sleeping bodies. */
function pruneSupportQueries(sim) {
    const live = new Set(sim.rubble);
    for (const b of live) {
        const queries = supportQueries.get(b);
        if (queries)
            for (const [other, q] of queries)
                if (!live.has(other)) {
                    q.job.return([]);
                    queries.delete(other);
                }
        if (b.support)
            b.support.bodies = b.support.bodies.filter((n) => live.has(n.body));
    }
}

},
"src/simulation/rubble.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voxelMass = exports.terrainContacts = void 0;
exports.rebuildMassProperties = rebuildMassProperties;
exports.createRubble = createRubble;
exports.spawnRubble = spawnRubble;
exports.addDust = addDust;
exports.impulseRubble = impulseRubble;
exports.cancelRubbleMotion = cancelRubbleMotion;
exports.updateRubble = updateRubble;
const config_1 = require("../core/config");
const material_physics_1 = require("../core/material-physics");
const math_1 = require("../core/math");
const body_contact_query_1 = require("./body-contact-query");
const collision_geometry_1 = require("./collision-geometry");
const destruction_budget_1 = require("./destruction-budget");
const rotation_1 = require("./rotation");
const rubble_contacts_1 = require("./rubble-contacts");
const rubble_shape_1 = require("./rubble-shape");
const section_fracture_1 = require("./section-fracture");
const section_impact_1 = require("./section-impact");
const section_index_1 = require("./section-index");
const section_tree_1 = require("./section-tree");
const terrain_contact_1 = require("./terrain-contact");
var terrain_contact_2 = require("./terrain-contact");
Object.defineProperty(exports, "terrainContacts", { enumerable: true, get: function () { return terrain_contact_2.terrainContacts; } });
const contact_1 = require("./contact");
const rubble_shape_2 = require("./rubble-shape");
const rubble_support_1 = require("./rubble-support");
const static_impact_1 = require("./static-impact");
const voxelMass = (material) => (0, material_physics_1.physicsMaterial)(material).density;
exports.voxelMass = voxelMass;
/** Recenter after settling without teleporting the remaining rotated geometry. */
function rebuildMassProperties(b) {
    if (!b.voxels.length) {
        b.mass = 0;
        return;
    }
    const old = { ...b.centre }, centre = { x: 0, y: 0, z: 0 }, inertia = { x: 0, y: 0, z: 0 }, cross = [0, 0, 0];
    let mass = 0;
    for (const v of b.voxels) {
        const m = (0, exports.voxelMass)(v.material);
        mass += m;
        centre.x += (v.x + 0.5) * m;
        centre.y += (v.y + 0.5) * m;
        centre.z += (v.z + 0.5) * m;
    }
    centre.x /= mass;
    centre.y /= mass;
    centre.z /= mass;
    const delta = { x: centre.x - old.x, y: centre.y - old.y, z: centre.z - old.z }, rotated = (0, rubble_shape_2.turnSection)(b, delta);
    // x + c + R(v-c) must stay invariant when c changes.
    b.x += rotated.x - delta.x;
    b.y += rotated.y - delta.y;
    b.z += rotated.z - delta.z;
    b.vx += b.omega.y * rotated.z - b.omega.z * rotated.y;
    b.vy += b.omega.z * rotated.x - b.omega.x * rotated.z;
    b.vz += b.omega.x * rotated.y - b.omega.y * rotated.x;
    for (const v of b.voxels) {
        const m = (0, exports.voxelMass)(v.material), x = v.x + 0.5 - centre.x, y = v.y + 0.5 - centre.y, z = v.z + 0.5 - centre.z;
        inertia.x += m * (y * y + z * z + 1 / 6);
        inertia.y += m * (x * x + z * z + 1 / 6);
        inertia.z += m * (x * x + y * y + 1 / 6);
        cross[0] -= m * x * y;
        cross[1] -= m * x * z;
        cross[2] -= m * y * z;
    }
    b.mass = mass;
    b.centre = centre;
    b.inertia = inertia;
    b.inertiaCross = cross;
    b.width = b.height = b.depth = 0;
    for (const v of b.voxels) {
        b.width = Math.max(b.width, v.x + 1);
        b.height = Math.max(b.height, v.y + 1);
        b.depth = Math.max(b.depth, v.z + 1);
    }
    b.shape = [];
    b.shapeYaw = b.shapePitch = b.shapeRoll = NaN;
}
function* createRubble(sim, voxels, velocity = { x: 0, y: 0, z: 0 }, primary = false) {
    if (!voxels.length || ![velocity.x, velocity.y, velocity.z].every(Number.isFinite))
        return null;
    if (!primary && sim.rubble.filter((b) => !b.primary).length >= config_1.destructionLimits.rubbleBodies)
        return null;
    let x = Infinity, y = Infinity, z = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity, work = 0;
    const unique = new Set();
    for (const v of voxels) {
        if (![v.x, v.y, v.z, v.material].every(Number.isInteger) ||
            v.material <= 1 ||
            !sim.world.colours[v.material])
            return null;
        const key = sim.world.inside(v.x, v.y, v.z)
            ? sim.world.index(v.x, v.y, v.z)
            : `${v.x},${v.y},${v.z}`;
        if (unique.has(key))
            return null;
        unique.add(key);
        x = Math.min(x, v.x);
        y = Math.min(y, v.y);
        z = Math.min(z, v.z);
        maxX = Math.max(maxX, v.x);
        maxY = Math.max(maxY, v.y);
        maxZ = Math.max(maxZ, v.z);
        if (++work % 128 === 0)
            yield;
    }
    const local = [], centre = { x: 0, y: 0, z: 0 };
    let mass = 0;
    for (const v of voxels) {
        const p = {
            x: v.x - x,
            y: v.y - y,
            z: v.z - z,
            material: v.material,
            fractureFaces: v.fractureFaces,
            damage: v.damage ?? 0,
            id: v.id ?? sim.nextVoxelId++,
            grain: v.grain ?? (0, material_physics_1.grainAt)(v.x, v.y, v.z, v.material, sim.settings.seed),
        }, m = (0, exports.voxelMass)(v.material);
        local.push(p);
        mass += m;
        centre.x += (p.x + 0.5) * m;
        centre.y += (p.y + 0.5) * m;
        centre.z += (p.z + 0.5) * m;
        if (++work % 128 === 0)
            yield;
    }
    centre.x /= mass;
    centre.y /= mass;
    centre.z /= mass;
    const inertia = { x: 0, y: 0, z: 0 };
    const inertiaCross = [0, 0, 0];
    for (const v of local) {
        const dx = v.x + 0.5 - centre.x, dy = v.y + 0.5 - centre.y, dz = v.z + 0.5 - centre.z, m = (0, exports.voxelMass)(v.material);
        inertiaCross[0] -= m * dx * dy;
        inertiaCross[1] -= m * dx * dz;
        inertiaCross[2] -= m * dy * dz;
        inertia.x += m * (dy * dy + dz * dz + 1 / 6);
        inertia.y += m * (dx * dx + dz * dz + 1 / 6);
        inertia.z += m * (dx * dx + dy * dy + 1 / 6);
        if (++work % 128 === 0)
            yield;
    }
    return (0, rotation_1.withRotation)({
        materialOrigin: { x, y, z },
        orientation: (0, rotation_1.identity)(),
        omega: { x: 0, y: 0, z: 0 },
        inertiaCross,
        id: sim.nextRubbleId++,
        primary,
        bondWork: new Map(),
        centre,
        connectivityDirty: false,
        sleeping: false,
        sleepRevision: -1,
        pendingDt: 0,
        travel: 0,
        geometryVersion: 0,
        x,
        y,
        z,
        voxels: local,
        damage: new Map(local.filter((v) => (v.damage ?? 0) > 0).map((v) => [v, v.damage])),
        width: maxX - x + 1,
        height: maxY - y + 1,
        depth: maxZ - z + 1,
        mass,
        inertia,
        vx: (0, math_1.clamp)(velocity.x, -16, 16),
        vy: (0, math_1.clamp)(velocity.y, -36, 18),
        vz: (0, math_1.clamp)(velocity.z, -16, 16),
        age: 0,
        yaw: 0,
        pitch: 0,
        roll: 0,
        spinRoll: 0,
        shapeRoll: NaN,
        spinYaw: 0,
        spinPitch: 0,
        restTime: 0,
        impactCooldown: 0,
        shapeYaw: NaN,
        shapePitch: NaN,
        shape: [],
        extent: { x: 0.49, y: 0.49, z: 0.49 },
        boundsMin: { x: 0, y: 0, z: 0 },
        boundsMax: { x: 0, y: 0, z: 0 },
        hitActors: new Set(),
        hitVehicles: new Set(),
    });
}
function spawnRubble(voxels, velocity = { x: 0, y: 0, z: 0 }, primary = false) {
    const job = createRubble(this, voxels, velocity, primary);
    let result = job.next();
    while (!result.done)
        result = job.next();
    if (!result.value)
        return false;
    this.rubble.push(result.value);
    (0, section_index_1.invalidateSections)(this);
    return true;
}
function addDust(p, radius, strength = 1) {
    if (this.dust.length >= config_1.destructionLimits.dustClouds)
        this.dust.shift();
    this.dust.push({
        x: p.x,
        y: p.y,
        z: p.z,
        radius,
        life: 2.8,
        max: 2.8,
        strength: (0, math_1.clamp)(strength, 0, 1),
    });
}
function impulseRubble(p, r, power) {
    for (const b of this.rubble) {
        const dx = b.x + b.width / 2 - p.x, dy = b.y + b.height / 2 - p.y, dz = b.z + b.depth / 2 - p.z, d = Math.hypot(dx, dy, dz);
        if (d > r * 2)
            continue;
        (0, contact_1.energyImpulse)(b, { x: dx, y: dy, z: dz }, Math.max(0, (1 - d / (r * 2)) * power), {
            x: b.x + b.centre.x,
            y: b.y + b.centre.y,
            z: b.z + b.centre.z,
        });
    }
}
function contactDamage(sim, b, old) {
    const maxSpeed = Math.hypot(old.vx, old.vy, old.vz) +
        Math.hypot(old.omega.x, old.omega.y, old.omega.z) * Math.hypot(b.width, b.height, b.depth);
    if (maxSpeed < config_1.destructionLimits.impactSpeed)
        return;
    const { min, max } = (0, section_impact_1.impactBounds)(b, old);
    sim.neighbours((min.x + max.x) / 2, (min.z + max.z) / 2, Math.max(max.x - min.x, max.z - min.z) / 2 + 2, (a) => {
        if (!a.alive || a.vehicle || b.hitActors.has(a.id))
            return;
        const hit = (0, section_impact_1.sectionImpact)(b, old, a, 0.3, a.height);
        if (!hit || hit.speed < config_1.destructionLimits.impactSpeed)
            return;
        if (a.shield <= 0)
            b.hitActors.add(a.id);
        sim.hurt(a, Math.min(180, hit.speed * Math.sqrt(b.mass) * 2.8), null);
        for (const [x, z] of [
            [min.x - 0.4, a.z],
            [max.x + 0.4, a.z],
            [a.x, min.z - 0.4],
            [a.x, max.z + 0.4],
        ]) {
            if (!sim.occupied(a, x, a.y, z, 0.3, a.height)) {
                a.x = x;
                a.z = z;
                break;
            }
        }
    });
    for (const v of sim.vehicles) {
        if (!v.alive || b.hitVehicles.has(v))
            continue;
        const hit = (0, section_impact_1.sectionImpact)(b, old, v, v.radius, v.height);
        if (!hit || hit.speed < config_1.destructionLimits.impactSpeed)
            continue;
        b.hitVehicles.add(v);
        sim.hurtVehicle(v, Math.min(500, Math.min(180, hit.speed * Math.sqrt(b.mass) * 2.8) * 2), null);
    }
}
function settle(sim, b) {
    const remaining = new Set(b.voxels);
    const transformed = (0, rubble_shape_1.rubbleShape)(b).map((v, i) => ({ v, source: b.voxels[i] }));
    const w = sim.world;
    // Snap only to immediately neighbouring, supported surface cells. Never search down a column.
    for (const { v, source } of transformed.sort((a, b) => a.v.y - b.v.y)) {
        const centre = { x: b.x + v.x, y: b.y + v.y, z: b.z + v.z }, candidates = [];
        for (let dy = -1; dy <= 1; dy++)
            for (let dz = -1; dz <= 1; dz++)
                for (let dx = -1; dx <= 1; dx++) {
                    const x = Math.floor(centre.x) + dx, y = Math.floor(centre.y) + dy, z = Math.floor(centre.z) + dz;
                    const distance = (x + 0.5 - centre.x) ** 2 + (y + 0.5 - centre.y) ** 2 + (z + 0.5 - centre.z) ** 2;
                    if (distance <= 2.25)
                        candidates.push({ x, y, z, distance });
                }
        candidates.sort((a, b) => a.distance - b.distance);
        for (const { x, y, z } of candidates) {
            if (!w.inside(x, y, z) || y < 1 || w.cell(x, y, z))
                continue;
            const supported = [
                [0, -1, 0],
                [1, 0, 0],
                [-1, 0, 0],
                [0, 0, 1],
                [0, 0, -1],
            ].some(([dx, dy, dz]) => {
                const material = w.cell(x + dx, y + dy, z + dz);
                return material > 0 && material !== 7 && material !== 11 && material !== 16;
            });
            if (!supported)
                continue;
            let occupied = false;
            sim.neighbours(x + 0.5, z + 0.5, 2, (a) => {
                if (a.alive &&
                    !a.vehicle &&
                    a.x + 0.3 > x &&
                    a.x - 0.3 < x + 1 &&
                    a.z + 0.3 > z &&
                    a.z - 0.3 < z + 1 &&
                    a.y + a.height > y &&
                    a.y < y + 1)
                    occupied = true;
            });
            if (occupied ||
                sim.vehicles.some((v) => v.alive &&
                    Math.abs(v.x - x - 0.5) < v.radius + 0.5 &&
                    Math.abs(v.z - z - 0.5) < v.radius + 0.5 &&
                    v.y + v.height > y &&
                    v.y < y + 1))
                continue;
            w.removingCollapse = true;
            try {
                w.setRaw(x, y, z, source.material);
                w.damageVoxel(x, y, z, b.damage?.get(source) ?? source.damage ?? 0);
                b.damage?.delete(source);
            }
            finally {
                w.removingCollapse = false;
            }
            remaining.delete(source);
            w.rubbleCells.add(w.index(x, y, z));
            break;
        }
        // Rotated voxels can quantize into an already settled rubble cell. Crush the trapped
        // remainder into visible dust at that contact, rather than keeping an embedded rigid body.
        if (remaining.has(source) &&
            b.restTime > 0.5 &&
            candidates.some((p) => w.rubbleCells.has(w.index(p.x, p.y, p.z)))) {
            remaining.delete(source);
            b.damage?.delete(source);
            sim.addDust(centre, 0.5, 0.25);
        }
    }
    if (remaining.size !== b.voxels.length) {
        b.voxels = [...remaining];
        rebuildMassProperties(b);
        b.connectivityDirty = b.voxels.length > 1;
        b.geometryVersion++;
    }
    while (w.rubbleCells.size > config_1.destructionLimits.rubbleCells) {
        const index = w.rubbleCells.values().next().value;
        w.removeVoxel(index % config_1.W, Math.floor(index / (config_1.W * config_1.D)), Math.floor(index / config_1.W) % config_1.D);
    }
}
function bodySnapshot(body) {
    const copy = {
        ...body,
        orientation: { ...body.orientation },
        omega: { ...body.omega },
        centre: { ...body.centre },
    };
    (0, collision_geometry_1.shareCollisionGeometry)(body, copy);
    (0, section_tree_1.shareSectionTree)(body, copy);
    return copy;
}
function motionKey(sim, b) {
    const bounds = (0, rubble_shape_1.rubbleBounds)(b), chunks = [];
    for (let z = Math.max(0, Math.floor((bounds.min.z - 1) / config_1.CS)); z <= Math.min(config_1.NX - 1, Math.floor((bounds.max.z + 1) / config_1.CS)); z++)
        for (let x = Math.max(0, Math.floor((bounds.min.x - 1) / config_1.CS)); x <= Math.min(config_1.NX - 1, Math.floor((bounds.max.x + 1) / config_1.CS)); x++)
            chunks.push(sim.world.chunkRevisions[z * config_1.NX + x]);
    return [(0, body_contact_query_1.bodyPoseKey)(b), b.vx, b.vy, b.vz, b.omega.x, b.omega.y, b.omega.z, ...chunks].join('|');
}
function* advanceBody(sim, live, dt) {
    const b = bodySnapshot(live);
    if (live.sleeping && (0, rubble_support_1.supportUnchanged)(sim, live))
        return true;
    let support;
    do {
        support = (0, rubble_support_1.probeSupport)(sim, live);
        if (support.kind === 'deferred')
            yield;
    } while (support.kind === 'deferred');
    b.support = live.support;
    let stable = !!live.support?.stable && (0, rubble_support_1.groundedPath)(sim, live);
    const peers = new Map(), peerKeys = new Map();
    const resolve = (body, c, restitution = 0.08) => {
        if (c.body) {
            let peer = peers.get(c.body);
            if (!peer) {
                peer = bodySnapshot(c.body);
                peers.set(c.body, peer);
                peerKeys.set(c.body, motionKey(sim, c.body));
            }
            return (0, contact_1.resolveContact)(body, { ...c, body: peer }, restitution);
        }
        return (0, contact_1.resolveContact)(body, c, restitution);
    };
    function* terrain(x, y, z, from) {
        let result;
        do {
            result = (0, terrain_contact_1.terrainContacts)(sim, b, x, y, z, from);
            if (result.kind === 'deferred')
                yield;
        } while (result.kind === 'deferred');
        return result;
    }
    if (b.sleeping && stable) {
        live.sleepRevision = sim.world.revision;
        return true;
    }
    b.sleeping = false;
    const before = {
        x: b.x,
        y: b.y,
        z: b.z,
        orientation: { ...b.orientation },
        omega: { ...b.omega },
        vx: b.vx,
        vy: b.vy,
        vz: b.vz,
    };
    b.vy = Math.max(-config_1.destructionLimits.terminalSpeed, b.vy - config_1.destructionLimits.gravity * dt);
    const impacts = [];
    const impactPose = { ...before, vy: b.vy };
    // A grounded support manifold is already an exact contact result, including sleeping rubble.
    // Resolve its normal here rather than relying on a later, budget-limited body-pair query.
    // Otherwise a slab can retain its pose on another slab while accumulating terminal fall speed.
    if (support.kind === 'contact' && b.vy < 0) {
        const floor = support.contacts.find((c) => c.normal.y > 0.6);
        if (floor) {
            const impactSpeed = resolve(b, {
                ...floor,
                point: stable
                    ? { x: b.x + b.centre.x, y: floor.point.y, z: b.z + b.centre.z }
                    : floor.point,
            });
            const energy = ((0, contact_1.contactResponse)(b)?.dissipated ?? 0) * 0.25;
            if (impactSpeed > config_1.destructionLimits.impactSpeed ||
                (b.primary && b.mass > 1000 && impactSpeed > 1.5 && energy > 50))
                impacts.push({
                    point: floor.point,
                    speed: impactSpeed,
                    energy,
                    keys: support.contacts.flatMap((c) => (c.terrain === undefined ? [] : [c.terrain])),
                });
        }
    }
    if (stable) {
        b.omega.x *= 0.8;
        b.omega.z *= 0.8;
        b.omega.y *= 0.95;
    }
    const angularRate = Math.hypot(b.omega.x, b.omega.y, b.omega.z);
    if (angularRate > 1e-5) {
        // Contact impulses supply the off-centre torque. Do not also integrate a
        // manually constrained pivot, which double-counted gravity and added energy.
        (0, rotation_1.integrateRotation)(b, dt);
        let rotated = yield* terrain(b.x, b.y, b.z);
        for (let correction = 0; correction < 4 && rotated.kind === 'contact'; correction++) {
            const c = rotated.contacts.reduce((best, c) => (c.penetration > best.penetration ? c : best));
            const speed = resolve(b, stable && c.normal.y > 0.6
                ? { ...c, point: { x: b.x + b.centre.x, y: c.point.y, z: b.z + b.centre.z } }
                : c, 0);
            if (speed > config_1.destructionLimits.impactSpeed ||
                (b.primary && b.mass > 1000 && speed > 1.5 && ((0, contact_1.contactResponse)(b)?.dissipated ?? 0) > 200))
                impacts.push({
                    point: c.point,
                    speed,
                    keys: c.terrain === undefined ? [] : [c.terrain],
                    energy: ((0, contact_1.contactResponse)(b)?.dissipated ?? 0) * 0.25,
                });
            const correctionDistance = Math.min(0.15, c.penetration + 0.001);
            b.x += c.normal.x * correctionDistance;
            b.y += c.normal.y * correctionDistance;
            b.z += c.normal.z * correctionDistance;
            rotated = yield* terrain(b.x, b.y, b.z);
        }
        if (rotated.kind === 'contact') {
            b.x = before.x;
            b.y = before.y;
            b.z = before.z;
            b.orientation = { ...before.orientation };
        }
    }
    for (const axis of ['x', 'z', 'y']) {
        const velocity = axis === 'x' ? 'vx' : axis === 'y' ? 'vy' : 'vz';
        const delta = b[velocity] * dt;
        if (!delta)
            continue;
        const next = { x: b.x, y: b.y, z: b.z };
        next[axis] += delta;
        const result = yield* terrain(next.x, next.y, next.z, b);
        if (result.kind === 'clear') {
            b[axis] = next[axis];
            continue;
        }
        const opposing = result.contacts.filter((c) => c.normal[axis] * delta < -1e-9);
        if (!opposing.length) {
            b[axis] = next[axis];
            continue;
        }
        const contact = opposing.reduce((best, c) => (c.fraction < best.fraction ? c : best));
        b[axis] +=
            delta * Math.max(0, contact.fraction - 0.001) +
                contact.normal[axis] * Math.min(0.15, contact.penetration);
        // Distributed horizontal support acts through the centre rather than an arbitrary first voxel.
        if (contact.normal.y > 0.6 &&
            (0, rubble_support_1.supportFootprint)(opposing.filter((c) => c.fraction <= contact.fraction + 0.01), { x: b.x + b.centre.x, y: b.y + b.centre.y, z: b.z + b.centre.z }).stable)
            stable = true;
        const manifold = contact.normal.y > 0.6 && stable
            ? { ...contact, point: { x: b.x + b.centre.x, y: contact.point.y, z: b.z + b.centre.z } }
            : contact;
        const impactSpeed = resolve(b, manifold);
        if (stable && axis === 'y') {
            b.vx *= 0.9;
            b.vz *= 0.9;
            b.omega.x *= 0.85;
            b.omega.y *= 0.85;
            b.omega.z *= 0.85;
        }
        if (impactSpeed > config_1.destructionLimits.impactSpeed ||
            (b.primary &&
                b.mass > 1000 &&
                impactSpeed > 1.5 &&
                ((0, contact_1.contactResponse)(b)?.dissipated ?? 0) > 200))
            impacts.push({
                point: contact.point,
                speed: impactSpeed,
                energy: ((0, contact_1.contactResponse)(b)?.dissipated ?? 0) * 0.25,
                keys: opposing.flatMap((c) => (c.terrain === undefined ? [] : [c.terrain])),
            });
    }
    for (const peer of peers.keys())
        if (!sim.rubble.includes(peer) || peerKeys.get(peer) !== motionKey(sim, peer))
            return false;
    for (const [peer, next] of peers) {
        peer.vx = next.vx;
        peer.vy = next.vy;
        peer.vz = next.vz;
        peer.omega = { ...next.omega };
    }
    Object.assign(live, {
        x: b.x,
        y: b.y,
        z: b.z,
        vx: b.vx,
        vy: b.vy,
        vz: b.vz,
        orientation: { ...b.orientation },
        omega: { ...b.omega },
        sleeping: false,
    });
    live.travel += Math.hypot(live.x - before.x, live.y - before.y, live.z - before.z);
    live.age += dt;
    live.impactCooldown = Math.max(0, live.impactCooldown - dt);
    for (const impact of impacts) {
        (0, static_impact_1.queueStaticImpact)(sim, live, impact.keys, impact.speed, impact.energy);
        (0, section_fracture_1.queueImpact)(live, impact.point, impact.speed, impact.energy);
        if (live.impactCooldown <= 0) {
            sim.addDust(impact.point, Math.min(4, Math.sqrt(live.mass)), 0.6);
            sim.soundAt('boom', impact.point.x, impact.point.z, Math.min(0.6, impact.speed / 45));
        }
    }
    live.vx *= Math.exp(-dt * 0.5);
    live.vz *= Math.exp(-dt * 0.5);
    for (const axis of ['x', 'y', 'z'])
        live.omega[axis] *= Math.exp(-dt * 0.4);
    const resting = stable &&
        Math.hypot(live.vx, live.vy, live.vz) < 0.25 &&
        Math.hypot(live.omega.x, live.omega.y, live.omega.z) < 0.08;
    live.restTime = resting ? live.restTime + dt : 0;
    (0, section_index_1.invalidateSections)(sim, live);
    contactDamage(sim, live, impactPose);
    if (live.restTime >= 1) {
        if (live.voxels.length <= 64 && live.support?.terrain.length)
            settle(sim, live);
        live.sleeping = true;
        live.sleepRevision = sim.world.revision;
        live.vx = live.vy = live.vz = 0;
        live.omega = { x: 0, y: 0, z: 0 };
    }
    return true;
}
const motionPasses = new WeakMap();
function cancelRubbleMotion(sim) {
    motionPasses.get(sim)?.job?.return(false);
    motionPasses.delete(sim);
}
const lastAttempt = new WeakMap();
let attemptSequence = 0;
/** Debt is explicit and catch-up stays swept and bounded; rendering FPS is not a physics progress metric. */
function updateRubble(dt) {
    if (!Number.isFinite(dt) || dt <= 0)
        return;
    (0, rubble_support_1.pruneSupportQueries)(this);
    for (let i = this.dust.length - 1; i >= 0; i--) {
        const d = this.dust[i];
        d.life -= dt;
        d.y += dt * 0.7;
        d.radius += dt * 1.2;
        if (d.life <= 0)
            this.dust.splice(i, 1);
    }
    for (const b of this.rubble) {
        // Sleeping bodies do not accrue a backlog. Active bodies never discard elapsed physical time.
        b.lastProgressTime ??= this.simTime;
        if (b.sleeping && (0, rubble_support_1.supportUnchanged)(this, b)) {
            b.pendingDt = 0;
            b.lastProgressTime = this.simTime;
        }
        else
            b.pendingDt += dt;
    }
    const ownedBudget = !this.destructionBudget;
    this.destructionBudget ??= (0, destruction_budget_1.newDestructionBudget)();
    const budget = this.destructionBudget, start = performance.now();
    budget.deadline = start + Math.max(0, budget.physicsMs);
    if (budget.physicsMs > 0) {
        // One motion pass owns the body's proposed dt until every terrain query completes.
        // Moving a support or resolving contacts in between retries would invalidate that work.
        let cycles = 0;
        while (performance.now() < budget.deadline && cycles < 4) {
            if ((0, rubble_contacts_1.contactPassPending)(this.rubble)) {
                if ((0, rubble_contacts_1.resolveRubbleContacts)(this.rubble, (b, x, y, z) => {
                    const result = (0, terrain_contact_1.terrainContacts)(this, b, x, y, z);
                    return result.kind === 'deferred' ? 'deferred' : result.kind === 'clear';
                }, 0, budget) === 'deferred')
                    break;
            }
            let motion = motionPasses.get(this);
            if (!motion) {
                const motionDeadline = budget.deadline;
                budget.deadline = Math.min(motionDeadline, performance.now() + Math.min(1.2, Math.max(0, budget.physicsMs) * 0.2));
                (0, section_fracture_1.processFractures)(this);
                (0, static_impact_1.processStaticImpacts)(this);
                budget.deadline = motionDeadline;
                motion = {
                    bodies: [...this.rubble].sort((a, b) => b.pendingDt - a.pendingDt ||
                        (lastAttempt.get(a) ?? 0) - (lastAttempt.get(b) ?? 0) ||
                        a.id - b.id),
                    index: 0,
                    slice: null,
                };
                motionPasses.set(this, motion);
            }
            let deferred = false;
            while (motion.index < motion.bodies.length && performance.now() < budget.deadline) {
                const b = motion.bodies[motion.index];
                if (!this.rubble.includes(b) || !b.voxels.length || b.pendingDt < 1e-6) {
                    motion.job?.return(false);
                    motion.job = undefined;
                    motion.index++;
                    motion.slice = null;
                    continue;
                }
                motion.slice ??= Math.min(b.pendingDt, 1 / 60, 0.45 / Math.max(1, Math.hypot(b.vx, b.vy, b.vz)), 0.15 /
                    Math.max(1, (Math.hypot(b.omega.x, b.omega.y, b.omega.z) *
                        Math.hypot(b.width, b.height, b.depth)) /
                        2));
                lastAttempt.set(b, ++attemptSequence);
                const key = motionKey(this, b);
                if (motion.job && motion.key !== key) {
                    motion.job.return(false);
                    motion.job = undefined;
                }
                if (!motion.job) {
                    motion.job = advanceBody(this, b, motion.slice);
                    motion.key = key;
                }
                let step = motion.job.next();
                while (!step.done && performance.now() < budget.deadline)
                    step = motion.job.next();
                if (!step.done) {
                    deferred = true;
                    break;
                }
                if (!step.value) {
                    motion.job = undefined;
                    deferred = true;
                    break;
                }
                b.pendingDt = Math.max(0, b.pendingDt - motion.slice);
                b.lastProgressTime = this.simTime;
                this.destructionStats.advancedSteps++;
                motion.job = undefined;
                motion.index++;
                motion.slice = null;
            }
            if (deferred || motion.index < motion.bodies.length)
                break;
            motionPasses.delete(this);
            cycles++;
            if ((0, rubble_contacts_1.resolveRubbleContacts)(this.rubble, (b, x, y, z) => {
                const result = (0, terrain_contact_1.terrainContacts)(this, b, x, y, z);
                return result.kind === 'deferred' ? 'deferred' : result.kind === 'clear';
            }, this.contactCursor++, budget) === 'deferred')
                break;
        }
    }
    for (let i = this.rubble.length - 1; i >= 0; i--) {
        const b = this.rubble[i];
        if (!b.voxels.length ||
            b.y < -config_1.H ||
            b.x + b.width < 0 ||
            b.z + b.depth < 0 ||
            b.x >= config_1.W ||
            b.z >= config_1.D)
            this.rubble.splice(i, 1);
    }
    (0, rubble_support_1.pruneSupportQueries)(this);
    (0, section_index_1.invalidateSections)(this);
    const elapsed = performance.now() - start;
    budget.physicsMs -= elapsed;
    budget.deadline = Infinity;
    this.destructionStats.physicsMs = elapsed;
    this.destructionStats.maxPhysicsMs = Math.max(this.destructionStats.maxPhysicsMs, elapsed);
    this.destructionStats.pendingBodies = this.rubble.filter((b) => b.pendingDt >= 1 / 60).length;
    this.destructionStats.oldestDebt = this.rubble.reduce((n, b) => Math.max(n, b.pendingDt), 0);
    this.destructionStats.staleTime = this.rubble.reduce((n, b) => Math.max(n, b.sleeping ? 0 : this.simTime - (b.lastProgressTime ?? this.simTime)), 0);
    this.destructionStats.sleepingBodies = this.rubble.filter((b) => b.sleeping).length;
    if (budget.physicsMs <= 0)
        this.destructionStats.deferredFrames++;
    if (ownedBudget)
        this.destructionBudget = null;
}

},
"src/simulation/section-fracture.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueImpact = queueImpact;
exports.processFractures = processFractures;
exports.cancelFractures = cancelFractures;
const config_1 = require("../core/config");
const bonds_1 = require("./bonds");
const collision_geometry_1 = require("./collision-geometry");
const rotation_1 = require("./rotation");
const rubble_1 = require("./rubble");
const rubble_shape_1 = require("./rubble-shape");
const section_mesh_1 = require("./section-mesh");
const section_tree_1 = require("./section-tree");
const directions = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
];
const key = (v) => `${v.x},${v.y},${v.z}`;
const topology = new WeakMap();
const jobs = new WeakMap();
const crushWork = new WeakMap();
function queueImpact(body, point, speed, energy) {
    if (![point.x, point.y, point.z, speed].every(Number.isFinite) ||
        speed <= 0 ||
        (energy !== undefined && (!Number.isFinite(energy) || energy <= 0)))
        return;
    if ((body.age < 0.25 && body.travel < 0.05) || body.impactCooldown > 0 || body.voxels.length < 2)
        return;
    if (speed <= config_1.destructionLimits.impactSpeed) {
        // A large section can dissipate substantial energy through many slow, distributed contacts.
        // Retain that paid work instead of treating every contact as an unrelated harmless tap.
        if (!body.primary || body.voxels.length < 256 || !(energy && energy > 0) || body.travel < 0.05)
            return;
        const accumulated = (crushWork.get(body) ?? 0) + energy;
        if (accumulated < 1800) {
            crushWork.set(body, accumulated);
            return;
        }
        energy = Math.min(20000, accumulated);
        crushWork.delete(body);
    }
    if (!body.impact || (energy ?? speed * speed) > (body.impact.energy ?? body.impact.speed ** 2)) {
        const p = (0, rotation_1.unrotate)(body.orientation, {
            x: point.x - body.x - body.centre.x,
            y: point.y - body.y - body.centre.y,
            z: point.z - body.z - body.centre.z,
        });
        body.impact = {
            point: { ...point },
            localPoint: { x: p.x + body.centre.x, y: p.y + body.centre.y, z: p.z + body.centre.z },
            speed,
            energy,
        };
    }
    body.sleeping = false;
}
/** Finite energy opens a local crack around a connected contact patch, never a world-space tile grid. */
function* fracture(sim, b) {
    const version = b.geometryVersion;
    b.fractureSlots = 0;
    const impact = b.impact;
    b.impact = undefined;
    b.connectivityDirty = false;
    if (impact)
        b.impactCooldown = 0.3;
    let data = topology.get(b);
    if (!data || data.version !== version) {
        data = { version, lookup: new Map(), bonds: new Uint16Array(b.voxels.length) };
        for (let i = 0; i < b.voxels.length; i++) {
            data.lookup.set(key(b.voxels[i]), i);
            if (i % 128 === 0)
                yield;
        }
        topology.set(b, data);
    }
    const { lookup } = data;
    const bonds = data.bonds.slice();
    const workState = new Map(b.bondWork);
    const neighbor = (i, d) => {
        const v = b.voxels[i], offset = directions[d];
        return lookup.get(`${v.x + offset[0]},${v.y + offset[1]},${v.z + offset[2]}`);
    };
    const owner = (i, n, d) => (d % 2 === 0 ? i : n);
    for (let i = 0; i < b.voxels.length; i++) {
        for (const d of [0, 2, 4]) {
            const n = neighbor(i, d);
            if (n !== undefined)
                bonds[i] =
                    (bonds[i] & ~(31 << ((d / 2) * 5))) |
                        ((0, bonds_1.bondLevel)(workState, b.voxels[i], b.voxels[n]) << ((d / 2) * 5));
        }
        if (i % 128 === 0)
            yield;
    }
    if (impact) {
        let seed = 0, distance = Infinity;
        for (let i = 0; i < b.voxels.length; i++) {
            const v = b.voxels[i], p = impact.localPoint ? { x: v.x + 0.5, y: v.y + 0.5, z: v.z + 0.5 } : (0, section_tree_1.voxelPoint)(b, i), point = impact.localPoint ?? impact.point;
            const d = (p.x - point.x) ** 2 + (p.y - point.y) ** 2 + (p.z - point.z) ** 2;
            if (d < distance) {
                distance = d;
                seed = i;
            }
            if (i % 128 === 0)
                yield;
        }
        // Contact energy scales sublinearly with island mass: a large body cannot pulverise itself from a grazing contact.
        let energy = Math.min(20000, impact.energy ?? 0.5 * Math.sqrt(b.mass) * impact.speed ** 2);
        const patch = new Set([seed]), frontier = [seed];
        const target = b.voxels.length > 256 && energy > 4000
            ? Math.min(Math.floor(b.voxels.length * 0.2), Math.floor(energy / 12))
            : Math.min(32, Math.max(1, Math.floor(energy / 120)));
        for (let head = 0; head < frontier.length && patch.size < target; head++) {
            for (let d = 0; d < 6 && patch.size < target; d++) {
                const n = neighbor(frontier[head], d);
                if (n === undefined || patch.has(n))
                    continue;
                patch.add(n);
                frontier.push(n);
            }
            if (head % 128 === 0)
                yield;
        }
        // Fit a connected contact patch to the energy actually available. An oversized requested
        // patch previously exhausted all work partway around its perimeter and never detached.
        while (patch.size > 1) {
            let boundaryCost = 0;
            for (const i of patch) {
                for (let d = 0; d < 6; d++) {
                    const n = neighbor(i, d);
                    if (n === undefined || patch.has(n))
                        continue;
                    const a = b.voxels[i], other = b.voxels[n];
                    boundaryCost += Math.max(0, (0, bonds_1.bondCost)(a, other) - (workState.get((0, bonds_1.bondKey)(a.id, other.id)) ?? 0));
                }
                if (i % 128 === 0)
                    yield;
            }
            if (boundaryCost <= energy)
                break;
            const size = Math.max(1, Math.floor(patch.size / 2));
            patch.clear();
            for (let i = 0; i < size; i++)
                patch.add(frontier[i]);
        }
        for (const i of patch) {
            for (let d = 0; d < 6; d++) {
                const n = neighbor(i, d);
                if (n === undefined || patch.has(n) || energy <= 0)
                    continue;
                const index = owner(i, n, d), shift = Math.floor(d / 2) * 5;
                const spend = (0, bonds_1.depositWork)(workState, b.voxels[i], b.voxels[n], energy);
                bonds[index] =
                    (bonds[index] & ~(31 << shift)) |
                        ((0, bonds_1.bondLevel)(workState, b.voxels[i], b.voxels[n]) << shift);
                energy -= spend;
            }
        }
    }
    const seen = new Uint8Array(b.voxels.length), parts = [];
    let work = 0;
    for (let start = 0; start < b.voxels.length; start++) {
        if (seen[start])
            continue;
        const queue = [start], part = [];
        seen[start] = 1;
        for (let head = 0; head < queue.length; head++) {
            const i = queue[head];
            part.push(b.voxels[i]);
            for (let d = 0; d < 6; d++) {
                const n = neighbor(i, d);
                if (n === undefined || seen[n])
                    continue;
                if (((bonds[owner(i, n, d)] >> (Math.floor(d / 2) * 5)) & 31) === 31)
                    continue;
                seen[n] = 1;
                queue.push(n);
            }
            if (++work % 128 === 0)
                yield;
        }
        parts.push(part);
    }
    if (version !== b.geometryVersion || !sim.rubble.includes(b))
        return;
    if (parts.length <= 1) {
        data.bonds = bonds;
        b.bondWork = workState;
        return;
    }
    const ordered = [...parts].sort((a, b) => b.length - a.length);
    const continuation = ordered.length > 4;
    const publishedParts = continuation
        ? [ordered.slice(0, -3).flat(), ...ordered.slice(-3)]
        : ordered;
    // Retain fatigue when a body cap delays subdivision; never restore pristine bonds.
    if (sim.rubble.filter((n) => !n.primary).length + publishedParts.length - 1 >
        config_1.destructionLimits.rubbleBodies) {
        data.bonds = bonds;
        b.bondWork = workState;
        b.connectivityDirty = true;
        b.fractureSlots = publishedParts.length - 1;
        return;
    }
    const children = [];
    for (let partIndex = 0; partIndex < publishedParts.length; partIndex++) {
        const part = publishedParts[partIndex];
        const members = new Set();
        for (const v of part) {
            members.add(key(v));
            if (++work % 128 === 0)
                yield;
        }
        const cut = [];
        for (const v of part) {
            let fractureFaces = v.fractureFaces ?? 0;
            for (let d = 0; d < 6; d++) {
                const offset = directions[d], adjacent = `${v.x + offset[0]},${v.y + offset[1]},${v.z + offset[2]}`;
                if (lookup.has(adjacent) && !members.has(adjacent))
                    fractureFaces |= 1 << d;
            }
            cut.push({ ...v, fractureFaces, damage: b.damage?.get(v) ?? v.damage ?? 0 });
            if (++work % 128 === 0)
                yield;
        }
        const child = yield* (0, rubble_1.createRubble)(sim, cut, { x: b.vx, y: b.vy, z: b.vz }, true);
        if (!child)
            return;
        child.materialOrigin = {
            x: b.materialOrigin.x + child.x,
            y: b.materialOrigin.y + child.y,
            z: b.materialOrigin.z + child.z,
        };
        child.primary = b.primary && partIndex === 0;
        const ids = new Set(part.map((v) => v.id));
        for (const [key, value] of workState) {
            const [a, b] = key.split(':').map(Number);
            if (ids.has(a) && ids.has(b))
                child.bondWork.set(key, value);
        }
        const offset = (0, rubble_shape_1.turnSection)(b, {
            x: child.x + child.centre.x - b.centre.x,
            y: child.y + child.centre.y - b.centre.y,
            z: child.z + child.centre.z - b.centre.z,
        });
        child.x = b.x + b.centre.x + offset.x - child.centre.x;
        child.y = b.y + b.centre.y + offset.y - child.centre.y;
        child.z = b.z + b.centre.z + offset.z - child.centre.z;
        child.orientation = { ...b.orientation };
        child.omega = { ...b.omega };
        const velocity = (0, rubble_shape_1.pointVelocity)(b, offset);
        child.vx = velocity.x;
        child.vy = velocity.y;
        child.vz = velocity.z;
        child.impactCooldown = 0.3;
        child.hitActors = new Set(b.hitActors);
        child.hitVehicles = new Set(b.hitVehicles);
        yield* (0, section_tree_1.prepareSectionTree)(child);
        yield* (0, collision_geometry_1.prepareCollisionBoxes)(child);
        yield* (0, section_mesh_1.prepareSectionMesh)(child, sim.world.colours);
        if (continuation && partIndex === 0)
            child.connectivityDirty = true;
        children.push(child);
    }
    if (version !== b.geometryVersion || !sim.rubble.includes(b))
        return;
    if (sim.rubble.filter((n) => !n.primary).length +
        children.filter((n) => !n.primary).length -
        (b.primary ? 0 : 1) >
        config_1.destructionLimits.rubbleBodies) {
        data.bonds = bonds;
        b.bondWork = workState;
        b.connectivityDirty = true;
        b.fractureSlots = children.length - 1;
        return;
    }
    // Preparation can span frames. Rebase children to the parent's latest transform before publication.
    for (let i = 0; i < children.length; i++) {
        const child = children[i], part = publishedParts[i];
        const origin = part.reduce((p, v) => ({ x: Math.min(p.x, v.x), y: Math.min(p.y, v.y), z: Math.min(p.z, v.z) }), { x: Infinity, y: Infinity, z: Infinity });
        const offset = (0, rubble_shape_1.turnSection)(b, {
            x: origin.x + child.centre.x - b.centre.x,
            y: origin.y + child.centre.y - b.centre.y,
            z: origin.z + child.centre.z - b.centre.z,
        });
        child.x = b.x + b.centre.x + offset.x - child.centre.x;
        child.y = b.y + b.centre.y + offset.y - child.centre.y;
        child.z = b.z + b.centre.z + offset.z - child.centre.z;
        child.orientation = { ...b.orientation };
        child.omega = { ...b.omega };
        const velocity = (0, rubble_shape_1.pointVelocity)(b, offset);
        child.vx = velocity.x;
        child.vy = velocity.y;
        child.vz = velocity.z;
    }
    const energy = kinetic(b), after = children.reduce((sum, c) => sum + kinetic(c), 0);
    const scale = after > 0 ? Math.min(1, Math.sqrt(energy / after)) : 1;
    for (const child of children) {
        child.vx *= scale;
        child.vy *= scale;
        child.vz *= scale;
        child.omega.x *= scale;
        child.omega.y *= scale;
        child.omega.z *= scale;
    }
    // Nonlethal hits may arrive during preparation without changing geometry.
    const integrity = new Map(b.voxels.map((v) => [v.id, b.damage?.get(v) ?? v.damage ?? 0]));
    for (const child of children) {
        child.pendingDt = b.pendingDt;
        child.damage = new Map();
        for (const v of child.voxels) {
            v.damage = integrity.get(v.id) ?? 0;
            if (v.damage)
                child.damage.set(v, v.damage);
        }
    }
    // A second hit can arrive while this publication is prepared. Hand it to the
    // child containing its closest surviving voxel instead of discarding the event.
    const pending = b.impact;
    if (pending) {
        const local = pending.localPoint;
        let best = 0, distance = Infinity;
        for (let i = 0; i < publishedParts.length; i++)
            for (const v of publishedParts[i]) {
                const p = local
                    ? { x: v.x + 0.5, y: v.y + 0.5, z: v.z + 0.5 }
                    : (0, section_tree_1.voxelPoint)(b, b.voxels.indexOf(v));
                const q = local ?? pending.point, d = (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2;
                if (d < distance) {
                    distance = d;
                    best = i;
                }
            }
        const part = publishedParts[best], origin = part.reduce((o, v) => ({ x: Math.min(o.x, v.x), y: Math.min(o.y, v.y), z: Math.min(o.z, v.z) }), { x: Infinity, y: Infinity, z: Infinity });
        children[best].impact = {
            ...pending,
            localPoint: local
                ? { x: local.x - origin.x, y: local.y - origin.y, z: local.z - origin.z }
                : undefined,
        };
    }
    sim.rubble.splice(sim.rubble.indexOf(b), 1, ...children);
    sim.addDust(impact?.point ?? b, 2, 0.6);
}
const kinetic = rotation_1.kineticEnergy;
function processFractures(sim) {
    const budget = sim.destructionBudget;
    const deadline = Math.min(performance.now() + 1, budget?.deadline ?? Infinity);
    let completed = 0;
    while (completed < 2 && (!budget || budget.fractureEvents > 0) && performance.now() < deadline) {
        let active = jobs.get(sim);
        // A rocket or settlement can swap/remove voxels while this generator is suspended.
        // Reject the old frontier before next(), not after it has dereferenced stale indices.
        if (active &&
            (!sim.rubble.includes(active.body) || active.version !== active.body.geometryVersion)) {
            if (sim.rubble.includes(active.body))
                active.body.connectivityDirty = true;
            active.job.return();
            if (sim.rubble.includes(active.body) && active.impact && !active.body.impact)
                active.body.impact = active.impact;
            jobs.delete(sim);
            active = undefined;
        }
        if (!active) {
            const freeSlots = config_1.destructionLimits.rubbleBodies - sim.rubble.filter((b) => !b.primary).length;
            const body = sim.rubble.find((b) => (b.connectivityDirty || b.impact) && (b.fractureSlots ?? 0) <= freeSlots);
            if (!body)
                return;
            active = {
                body,
                version: body.geometryVersion,
                impact: body.impact,
                job: fracture(sim, body),
            };
            jobs.set(sim, active);
        }
        if (active.job.next().done) {
            jobs.delete(sim);
            completed++;
            if (budget)
                budget.fractureEvents--;
        }
    }
}
/** A simulation restart owns cancellation of deferred publication. */
function cancelFractures(sim) {
    jobs.get(sim)?.job.return();
    jobs.delete(sim);
}

},
"src/simulation/section-impact.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.impactBounds = impactBounds;
exports.sectionImpact = sectionImpact;
const collision_geometry_1 = require("./collision-geometry");
const rotation_1 = require("./rotation");
const rubble_shape_1 = require("./rubble-shape");
const section_tree_1 = require("./section-tree");
function mixQuaternion(a, b, t) {
    const sign = a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w < 0 ? -1 : 1;
    const q = {
        x: a.x * (1 - t) + b.x * t * sign,
        y: a.y * (1 - t) + b.y * t * sign,
        z: a.z * (1 - t) + b.z * t * sign,
        w: a.w * (1 - t) + b.w * t * sign,
    };
    const length = Math.hypot(q.x, q.y, q.z, q.w);
    return { x: q.x / length, y: q.y / length, z: q.z / length, w: q.w / length };
}
function angularDistance(a, b) {
    return 2 * Math.acos(Math.min(1, Math.abs(a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w)));
}
function sectionRadius(b) {
    return Math.hypot(Math.max(b.centre.x, b.width - b.centre.x), Math.max(b.centre.y, b.height - b.centre.y), Math.max(b.centre.z, b.depth - b.centre.z));
}
/** Broad-phase bounds include the rotational arc, not only the final orientation. */
function impactBounds(b, old) {
    const before = (0, rubble_shape_1.rubbleBounds)({ ...b, orientation: old.orientation }, old), after = (0, rubble_shape_1.rubbleBounds)(b);
    const margin = sectionRadius(b) * angularDistance(old.orientation, b.orientation);
    return {
        min: {
            x: Math.min(before.min.x, after.min.x) - margin,
            y: Math.min(before.min.y, after.min.y) - margin,
            z: Math.min(before.min.z, after.min.z) - margin,
        },
        max: {
            x: Math.max(before.max.x, after.max.x) + margin,
            y: Math.max(before.max.y, after.max.y) + margin,
            z: Math.max(before.max.z, after.max.z) + margin,
        },
    };
}
/** Sweep occupied voxels in short angular intervals. The maximum arc approximation is
 * below the existing 0.01-unit voxel inset; holes and empty rotated corners stay empty.
 * Runtime motion slices already bound the furthest corner's angular travel to 0.15 units.
 */
function sectionImpact(b, old, target, radius, height) {
    const query = {
        min: { x: target.x - radius, y: target.y, z: target.z - radius },
        max: { x: target.x + radius, y: target.y + height, z: target.z + radius },
    };
    if (!(0, section_tree_1.intersects)(query, impactBounds(b, old)))
        return null;
    const angle = angularDistance(old.orientation, b.orientation);
    const steps = Math.max(1, Math.ceil((angle * sectionRadius(b)) / 0.01));
    const pose = { ...b };
    (0, section_tree_1.shareSectionTree)(b, pose);
    const targetBox = (0, collision_geometry_1.axisBox)(query);
    for (let step = 0; step < steps; step++) {
        const t0 = step / steps, t1 = (step + 1) / steps, tm = (t0 + t1) / 2;
        const q0 = mixQuaternion(old.orientation, b.orientation, t0), q1 = mixQuaternion(old.orientation, b.orientation, t1);
        pose.orientation = mixQuaternion(old.orientation, b.orientation, tm);
        pose.x = old.x + (b.x - old.x) * tm;
        pose.y = old.y + (b.y - old.y) * tm;
        pose.z = old.z + (b.z - old.z) * tm;
        const travel = { x: (b.x - old.x) / steps, y: (b.y - old.y) / steps, z: (b.z - old.z) / steps };
        let first = null;
        (0, section_tree_1.visitSection)(pose, (bounds) => (0, section_tree_1.intersects)(query, {
            min: {
                x: bounds.min.x - Math.abs(travel.x) / 2 - 0.01,
                y: bounds.min.y - Math.abs(travel.y) / 2 - 0.01,
                z: bounds.min.z - Math.abs(travel.z) / 2 - 0.01,
            },
            max: {
                x: bounds.max.x + Math.abs(travel.x) / 2 + 0.01,
                y: bounds.max.y + Math.abs(travel.y) / 2 + 0.01,
                z: bounds.max.z + Math.abs(travel.z) / 2 + 0.01,
            },
        }), (index) => {
            const v = b.voxels[index], local = {
                x: v.x + 0.5 - b.centre.x,
                y: v.y + 0.5 - b.centre.y,
                z: v.z + 0.5 - b.centre.z,
            };
            const p0 = (0, rotation_1.rotate)(q0, local), p1 = (0, rotation_1.rotate)(q1, local), mid = (0, rotation_1.rotate)(pose.orientation, local);
            const box = (0, collision_geometry_1.orientedBox)(pose, { x: v.x + 0.01, y: v.y + 0.01, z: v.z + 0.01 }, { x: v.x + 0.99, y: v.y + 0.99, z: v.z + 0.99 }, {
                x: pose.x - travel.x / 2 + p0.x - mid.x,
                y: pose.y - travel.y / 2 + p0.y - mid.y,
                z: pose.z - travel.z / 2 + p0.z - mid.z,
            }, index);
            const contact = (0, collision_geometry_1.sweepObb)(box, targetBox, {
                x: travel.x + p1.x - p0.x,
                y: travel.y + p1.y - p0.y,
                z: travel.z + p1.z - p0.z,
            });
            if (contact && (!first || contact.fraction < first.fraction))
                first = contact;
        });
        // The callback assigns first; keep its type explicit across that boundary.
        const contact = first;
        if (contact) {
            const t = t0 + (t1 - t0) * contact.fraction;
            const velocity = (0, rubble_shape_1.pointVelocity)({ ...pose, vx: old.vx, vy: old.vy, vz: old.vz, omega: old.omega }, {
                x: contact.point.x - (old.x + (b.x - old.x) * t + b.centre.x),
                y: contact.point.y - (old.y + (b.y - old.y) * t + b.centre.y),
                z: contact.point.z - (old.z + (b.z - old.z) * t + b.centre.z),
            });
            return { contact, speed: Math.hypot(velocity.x, velocity.y, velocity.z) };
        }
    }
    return null;
}

},
"src/simulation/section-index.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateSections = invalidateSections;
exports.resetSectionIndex = resetSectionIndex;
exports.nearbySections = nearbySections;
const rubble_shape_1 = require("./rubble-shape");
const indices = new WeakMap();
// Szudzik pairing of signed grid coordinates; unlike bit packing it does not alias
// rubble that briefly travels outside the generated world bounds.
const coordinate = (v) => (v >= 0 ? v * 2 : -v * 2 - 1);
const key = (x, z) => {
    const a = coordinate(x), b = coordinate(z);
    return a >= b ? a * a + a + b : a + b * b;
};
function cells(bounds) {
    const result = [];
    for (let z = Math.floor(bounds.min.z / 16); z <= Math.floor(bounds.max.z / 16); z++)
        for (let x = Math.floor(bounds.min.x / 16); x <= Math.floor(bounds.max.x / 16); x++)
            result.push(key(x, z));
    return result;
}
function remove(entry, body) {
    for (const k of entry.cells.get(body) ?? []) {
        const bucket = entry.grid.get(k);
        bucket?.delete(body);
        if (!bucket?.size)
            entry.grid.delete(k);
    }
    entry.cells.delete(body);
    entry.dirty.delete(body);
}
function update(entry, body) {
    const next = cells((0, rubble_shape_1.rubbleBounds)(body)), old = entry.cells.get(body);
    if (old && old.length === next.length && old.every((n, i) => n === next[i]))
        return;
    remove(entry, body);
    for (const k of next) {
        let bucket = entry.grid.get(k);
        if (!bucket) {
            bucket = new Set();
            entry.grid.set(k, bucket);
        }
        bucket.add(body);
    }
    entry.cells.set(body, next);
}
function invalidateSections(sim, body) {
    const entry = indices.get(sim);
    if (!entry)
        return;
    if (body)
        entry.dirty.add(body);
    else {
        entry.membershipDirty = true;
        for (const b of sim.rubble)
            entry.dirty.add(b);
    }
}
function resetSectionIndex(sim) {
    indices.delete(sim);
}
/** Membership changes are reconciled once; movement only updates the body's touched cells. */
function nearbySections(sim, bounds) {
    let entry = indices.get(sim);
    if (!entry || entry.list !== sim.rubble) {
        entry = {
            list: sim.rubble,
            count: -1,
            membershipDirty: true,
            grid: new Map(),
            cells: new Map(),
            dirty: new Set(),
        };
        indices.set(sim, entry);
    }
    if (entry.count !== sim.rubble.length || entry.membershipDirty) {
        const live = new Set(sim.rubble);
        for (const b of entry.cells.keys())
            if (!live.has(b))
                remove(entry, b);
        for (const b of live)
            if (!entry.cells.has(b))
                entry.dirty.add(b);
        entry.count = sim.rubble.length;
        entry.membershipDirty = false;
    }
    for (const body of entry.dirty)
        update(entry, body);
    entry.dirty.clear();
    const result = new Set();
    for (const k of cells(bounds))
        for (const b of entry.grid.get(k) ?? [])
            result.add(b);
    return result;
}

},
"src/simulation/section-mesh.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sectionMeshes = void 0;
exports.prepareSectionMesh = prepareSectionMesh;
const materials_1 = require("../rendering/materials");
exports.sectionMeshes = new WeakMap();
function mergeRow(mask, row, dims, axis, slice, colours, data) {
    const u = (axis + 1) % 3, v = (axis + 2) % 3;
    for (let i = 0; i < dims[u];) {
        const n = row * dims[u] + i, material = mask[n];
        if (!material) {
            i++;
            continue;
        }
        let width = 1, height = 1;
        while (i + width < dims[u] && mask[n + width] === material)
            width++;
        outer: while (row + height < dims[v]) {
            for (let k = 0; k < width; k++)
                if (mask[n + height * dims[u] + k] !== material)
                    break outer;
            height++;
        }
        const base = [0, 0, 0];
        base[axis] = slice;
        base[u] = i;
        base[v] = row;
        const corners = [base, [...base], [...base], [...base]];
        corners[1][u] += width;
        corners[2][u] += width;
        corners[2][v] += height;
        corners[3][v] += height;
        const normal = [0, 0, 0];
        normal[axis] = Math.sign(material);
        const colour = colours[Math.abs(material)];
        for (const k of material > 0 ? [0, 1, 2, 0, 2, 3] : [0, 3, 2, 0, 2, 1]) {
            const p = corners[k];
            data.push(p[0], p[1], p[2], normal[0], normal[1], normal[2], colour[0], colour[1], colour[2], Math.abs(material));
        }
        for (let yy = 0; yy < height; yy++)
            mask.fill(0, n + yy * dims[u], n + yy * dims[u] + width);
        i += width;
    }
}
function fillRow(mask, row, dims, axis, slice, occupied, cuts) {
    const u = (axis + 1) % 3, v = (axis + 2) % 3, strides = [1, dims[0], dims[0] * dims[1]];
    let n = row * dims[u];
    for (let col = 0; col < dims[u]; col++) {
        const key = slice * strides[axis] + col * strides[u] + row * strides[v];
        const a = slice > 0 ? (occupied.get(key - strides[axis]) ?? 0) : 0;
        const b = slice < dims[axis] ? (occupied.get(key) ?? 0) : 0;
        mask[n++] =
            a && !b
                ? a + ((cuts.get(key - strides[axis]) ?? 0) & (1 << (axis * 2)) ? 32 : 0)
                : b && !a
                    ? -(b + ((cuts.get(key) ?? 0) & (1 << (axis * 2 + 1)) ? 32 : 0))
                    : 0;
    }
}
/** Greedy coplanar faces. Small row functions keep both runtime work and JIT compilation bounded. */
function* prepareSectionMesh(body, colours) {
    const version = body.geometryVersion;
    if (exports.sectionMeshes.get(body)?.version === version)
        return;
    const dims = [body.width, body.height, body.depth], occupied = new Map(), cuts = new Map();
    colours = (0, materials_1.fracturePalette)(colours);
    let work = 0;
    for (const v of body.voxels) {
        const key = v.x + dims[0] * (v.y + dims[1] * v.z);
        occupied.set(key, v.material);
        if (v.fractureFaces)
            cuts.set(key, v.fractureFaces);
        if (++work % 128 === 0)
            yield;
    }
    const data = [];
    for (let axis = 0; axis < 3; axis++) {
        const u = (axis + 1) % 3, v = (axis + 2) % 3, mask = new Int16Array(dims[u] * dims[v]);
        for (let slice = 0; slice <= dims[axis]; slice++) {
            for (let row = 0; row < dims[v]; row++) {
                fillRow(mask, row, dims, axis, slice, occupied, cuts);
                yield;
            }
            for (let row = 0; row < dims[v]; row++) {
                mergeRow(mask, row, dims, axis, slice, colours, data);
                yield;
            }
        }
    }
    if (version === body.geometryVersion)
        exports.sectionMeshes.set(body, { version, data: new Float32Array(data) });
}

},
"src/simulation/section-query.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sectionBlocked = sectionBlocked;
exports.sectionRay = sectionRay;
exports.damageSection = damageSection;
exports.clearSegment = clearSegment;
const material_physics_1 = require("../core/material-physics");
const collision_geometry_1 = require("./collision-geometry");
const rubble_1 = require("./rubble");
const rubble_shape_1 = require("./rubble-shape");
const section_index_1 = require("./section-index");
const section_tree_1 = require("./section-tree");
function sectionBlocked(sim, p, r = 0.3, height = 1.8) {
    const bounds = {
        min: { x: p.x - r, y: p.y, z: p.z - r },
        max: { x: p.x + r, y: p.y + height, z: p.z + r },
    };
    for (const b of (0, section_index_1.nearbySections)(sim, bounds))
        if ((0, rubble_shape_1.sectionOverlap)(b, p, r, height))
            return true;
    return false;
}
function sectionRay(sim, o, d, length, radius = 0) {
    let nearest = length, hit = null;
    const end = { x: o.x + d.x * length, y: o.y + d.y * length, z: o.z + d.z * length };
    for (const body of (0, section_index_1.nearbySections)(sim, {
        min: {
            x: Math.min(o.x, end.x) - radius,
            y: Math.min(o.y, end.y) - radius,
            z: Math.min(o.z, end.z) - radius,
        },
        max: {
            x: Math.max(o.x, end.x) + radius,
            y: Math.max(o.y, end.y) + radius,
            z: Math.max(o.z, end.z) + radius,
        },
    })) {
        const bounds = (0, rubble_shape_1.rubbleBounds)(body);
        const t = sim.rayBox(o, d, {
            x: (bounds.min.x + bounds.max.x) / 2,
            y: (bounds.min.y + bounds.max.y) / 2,
            z: (bounds.min.z + bounds.max.z) / 2,
            xr: (bounds.max.x - bounds.min.x) / 2,
            yr: (bounds.max.y - bounds.min.y) / 2,
            zr: (bounds.max.z - bounds.min.z) / 2,
        });
        if (t > nearest && radius === 0)
            continue;
        const ray = (box) => sim.rayBox(o, d, {
            x: (box.min.x + box.max.x) / 2,
            y: (box.min.y + box.max.y) / 2,
            z: (box.min.z + box.max.z) / 2,
            xr: (box.max.x - box.min.x) / 2,
            yr: (box.max.y - box.min.y) / 2,
            zr: (box.max.z - box.min.z) / 2,
        });
        (0, collision_geometry_1.visitCollisionBoxes)(body, (box) => ray({
            min: { x: box.min.x - radius, y: box.min.y - radius, z: box.min.z - radius },
            max: { x: box.max.x + radius, y: box.max.y + radius, z: box.max.z + radius },
        }) <= nearest, (box) => {
            const q = (0, collision_geometry_1.segmentBox)(o, d, nearest, box, radius);
            if (q && q.t <= nearest) {
                nearest = q.t;
                // Compound seeds are not necessarily the struck voxel. Resolve through the exact local tree.
                let index = box.index, distance = Infinity;
                const p = { x: o.x + d.x * q.t, y: o.y + d.y * q.t, z: o.z + d.z * q.t };
                (0, section_tree_1.visitSection)(body, (bounds) => p.x >= bounds.min.x - radius - 0.02 &&
                    p.x <= bounds.max.x + radius + 0.02 &&
                    p.y >= bounds.min.y - radius - 0.02 &&
                    p.y <= bounds.max.y + radius + 0.02 &&
                    p.z >= bounds.min.z - radius - 0.02 &&
                    p.z <= bounds.max.z + radius + 0.02, (i) => {
                    const v = body.voxels[i], bounds = (0, section_tree_1.rotatedBounds)(body, { x: v.x, y: v.y, z: v.z }, { x: v.x + 1, y: v.y + 1, z: v.z + 1 });
                    const dd = (p.x - (bounds.min.x + bounds.max.x) / 2) ** 2 +
                        (p.y - (bounds.min.y + bounds.max.y) / 2) ** 2 +
                        (p.z - (bounds.min.z + bounds.max.z) / 2) ** 2;
                    if (dd < distance) {
                        distance = dd;
                        index = i;
                    }
                });
                hit = { body, index, t: q.t };
            }
        });
    }
    return hit;
}
function damageSection(body, index, amount) {
    const v = body.voxels[index];
    if (!v || !Number.isFinite(amount) || amount <= 0)
        return;
    body.sleeping = false;
    body.restTime = 0;
    body.damage ??= new Map();
    const total = (body.damage.get(v) ?? v.damage ?? 0) + amount;
    if (total < (0, material_physics_1.fractureResistance)(v.material)) {
        body.damage.set(v, total);
        v.damage = total;
        return;
    }
    body.damage.delete(v);
    for (const key of body.bondWork.keys()) {
        const [a, b] = key.split(':').map(Number);
        if (a === v.id || b === v.id)
            body.bondWork.delete(key);
    }
    (0, section_tree_1.removeTreeVoxel)(body, index);
    body.voxels[index] = body.voxels[body.voxels.length - 1];
    body.voxels.pop();
    const removedMass = (0, rubble_1.voxelMass)(v.material), mass = Math.max(0, body.mass - removedMass);
    if (mass > 0) {
        const r = {
            x: v.x + 0.5 - body.centre.x,
            y: v.y + 0.5 - body.centre.y,
            z: v.z + 0.5 - body.centre.z,
        };
        const delta = {
            x: (-removedMass * r.x) / mass,
            y: (-removedMass * r.y) / mass,
            z: (-removedMass * r.z) / mass,
        };
        const shift = (0, rubble_shape_1.turnSection)(body, delta), velocity = (0, rubble_shape_1.pointVelocity)(body, shift);
        body.x += shift.x - delta.x;
        body.y += shift.y - delta.y;
        body.z += shift.z - delta.z;
        body.centre.x += delta.x;
        body.centre.y += delta.y;
        body.centre.z += delta.z;
        body.vx = velocity.x;
        body.vy = velocity.y;
        body.vz = velocity.z;
        body.inertiaCross[0] += removedMass * r.x * r.y + mass * delta.x * delta.y;
        body.inertiaCross[1] += removedMass * r.x * r.z + mass * delta.x * delta.z;
        body.inertiaCross[2] += removedMass * r.y * r.z + mass * delta.y * delta.z;
        body.inertia.x = Math.max(1e-6, body.inertia.x -
            removedMass * (r.y ** 2 + r.z ** 2 + 1 / 6) -
            mass * (delta.y ** 2 + delta.z ** 2));
        body.inertia.y = Math.max(1e-6, body.inertia.y -
            removedMass * (r.x ** 2 + r.z ** 2 + 1 / 6) -
            mass * (delta.x ** 2 + delta.z ** 2));
        body.inertia.z = Math.max(1e-6, body.inertia.z -
            removedMass * (r.x ** 2 + r.y ** 2 + 1 / 6) -
            mass * (delta.x ** 2 + delta.y ** 2));
    }
    body.mass = mass;
    body.shape = [];
    body.shapeYaw = NaN;
    body.geometryVersion++;
    body.connectivityDirty = true;
}
function clearSegment(sim, from, to) {
    const distance = Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z);
    if (distance < 1e-6)
        return true;
    const d = {
        x: (to.x - from.x) / distance,
        y: (to.y - from.y) / distance,
        z: (to.z - from.z) / distance,
    };
    return !sim.world.raycast(from, d, distance) && !sectionRay(sim, from, d, distance);
}

},
"src/simulation/section-tree.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prepareSectionTree = prepareSectionTree;
exports.voxelPoint = voxelPoint;
exports.rotatedBounds = rotatedBounds;
exports.intersects = intersects;
exports.visitSection = visitSection;
exports.removeTreeVoxel = removeTreeVoxel;
exports.sectionRoot = sectionRoot;
exports.sectionLeaves = sectionLeaves;
exports.shareSectionTree = shareSectionTree;
const rotation_1 = require("./rotation");
const rubble_shape_1 = require("./rubble-shape");
const trees = new WeakMap();
const node = (x, y, z, size) => ({
    x,
    y,
    z,
    size,
    children: new Map(),
    indices: [],
});
/** Local octree survives rigid motion. Only edits rebuild it. */
function* prepareSectionTree(b) {
    if (trees.get(b)?.version === b.geometryVersion)
        return;
    const version = b.geometryVersion;
    const size = 2 ** Math.ceil(Math.log2(Math.max(1, b.width, b.height, b.depth)));
    const root = node(0, 0, 0, size);
    for (let i = 0; i < b.voxels.length; i++) {
        const v = b.voxels[i];
        let n = root;
        while (n.size > 2) {
            const half = n.size / 2;
            const x = v.x >= n.x + half ? 1 : 0, y = v.y >= n.y + half ? 1 : 0, z = v.z >= n.z + half ? 1 : 0;
            const key = x + 2 * y + 4 * z;
            let child = n.children.get(key);
            if (!child) {
                child = node(n.x + x * half, n.y + y * half, n.z + z * half, half);
                n.children.set(key, child);
            }
            n = child;
        }
        n.indices.push(i);
        if (i % 128 === 0)
            yield;
    }
    if (version === b.geometryVersion)
        trees.set(b, { version, root });
}
function voxelPoint(b, index) {
    const v = b.voxels[index];
    const p = (0, rubble_shape_1.turnSection)(b, {
        x: v.x + 0.5 - b.centre.x,
        y: v.y + 0.5 - b.centre.y,
        z: v.z + 0.5 - b.centre.z,
    });
    return { x: b.x + b.centre.x + p.x, y: b.y + b.centre.y + p.y, z: b.z + b.centre.z + p.z };
}
function rotatedBounds(b, min, max, position = b) {
    const hx = (max.x - min.x) * 0.5, hy = (max.y - min.y) * 0.5, hz = (max.z - min.z) * 0.5;
    const dx = min.x + hx - b.centre.x, dy = min.y + hy - b.centre.y, dz = min.z + hz - b.centre.z;
    const [a, c, d] = (0, rotation_1.rotationAxes)(b);
    const x = position.x + b.centre.x + a.x * dx + c.x * dy + d.x * dz, y = position.y + b.centre.y + a.y * dx + c.y * dy + d.y * dz, z = position.z + b.centre.z + a.z * dx + c.z * dy + d.z * dz;
    const ex = Math.abs(a.x) * hx + Math.abs(c.x) * hy + Math.abs(d.x) * hz, ey = Math.abs(a.y) * hx + Math.abs(c.y) * hy + Math.abs(d.y) * hz, ez = Math.abs(a.z) * hx + Math.abs(c.z) * hy + Math.abs(d.z) * hz;
    return { min: { x: x - ex, y: y - ey, z: z - ez }, max: { x: x + ex, y: y + ey, z: z + ez } };
}
function intersects(a, b) {
    return (a.min.x < b.max.x &&
        a.max.x > b.min.x &&
        a.min.y < b.max.y &&
        a.max.y > b.min.y &&
        a.min.z < b.max.z &&
        a.max.z > b.min.z);
}
/** Returning false from visit stops traversal after the first exact contact. */
function visitSection(b, accepts, visit, position = b) {
    if (trees.get(b)?.version !== b.geometryVersion)
        for (const _ of prepareSectionTree(b)) {
            /* synchronous fallback for small direct edits */
        }
    const root = trees.get(b)?.root;
    if (!root)
        return;
    const stack = [root];
    while (stack.length) {
        const n = stack.pop();
        const bounds = rotatedBounds(b, n, {
            x: Math.min(b.width, n.x + n.size),
            y: Math.min(b.height, n.y + n.size),
            z: Math.min(b.depth, n.z + n.size),
        }, position);
        if (!accepts(bounds))
            continue;
        for (const index of n.indices)
            if (visit(index) === false)
                return;
        for (const child of n.children.values())
            stack.push(child);
    }
}
/** Maintain leaf indices after swap-removal; a single bullet must not rebuild a whole tower tree. */
function removeTreeVoxel(b, index) {
    const tree = trees.get(b);
    if (!tree || tree.version !== b.geometryVersion)
        return;
    // Persistent path updates keep snapshots immutable without cloning a tower's entire tree.
    const update = (n, v, edit) => {
        const copy = { ...n, children: new Map(n.children), indices: n.indices };
        if (n.size <= 2) {
            copy.indices = n.indices.slice();
            edit(copy.indices);
            return copy;
        }
        const half = n.size / 2, key = (v.x >= n.x + half ? 1 : 0) + (v.y >= n.y + half ? 2 : 0) + (v.z >= n.z + half ? 4 : 0);
        const child = n.children.get(key);
        if (child)
            copy.children.set(key, update(child, v, edit));
        return copy;
    };
    let root = update(tree.root, b.voxels[index], (ids) => {
        const at = ids.indexOf(index);
        if (at >= 0)
            ids.splice(at, 1);
    });
    const last = b.voxels.length - 1;
    if (index !== last)
        root = update(root, b.voxels[last], (ids) => {
            const at = ids.indexOf(last);
            if (at >= 0)
                ids[at] = index;
        });
    trees.set(b, { version: tree.version + 1, root });
}
function sectionRoot(b) {
    return trees.get(b)?.root;
}
/** Resumable traversal: even rejected nodes yield so a large query cannot restart forever. */
function* sectionLeaves(b, accepts, position = b) {
    for (const _ of prepareSectionTree(b))
        yield undefined;
    const root = trees.get(b)?.root;
    if (!root)
        return;
    const stack = [root];
    while (stack.length) {
        const n = stack.pop();
        const bounds = rotatedBounds(b, n, {
            x: Math.min(b.width, n.x + n.size),
            y: Math.min(b.height, n.y + n.size),
            z: Math.min(b.depth, n.z + n.size),
        }, position);
        if (accepts(bounds)) {
            for (const index of n.indices)
                yield index;
            for (const child of n.children.values())
                stack.push(child);
        }
        yield;
    }
}
/** Published trees are immutable and can be shared by a suspended pose snapshot. */
function shareSectionTree(source, target) {
    const tree = trees.get(source);
    if (tree?.version === target.geometryVersion)
        trees.set(target, { version: tree.version, root: tree.root });
}

},
"src/simulation/simulation.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Simulation = void 0;
const config_1 = require("../core/config");
const interpolation_1 = require("../core/interpolation");
const loadout_1 = require("../core/loadout");
const scenarios_1 = require("../core/scenarios");
const world_1 = require("../world/world");
const actors = require("./actors");
const combat = require("./combat");
const destruction = require("./destruction");
const equipment_1 = require("./equipment");
const gameplay = require("./gameplay");
const match = require("./match");
const navigation_1 = require("./navigation");
const npc_state_1 = require("./npc-state");
const physics = require("./physics");
const rubblePhysics = require("./rubble");
const rubble_1 = require("./rubble");
const rubble_contacts_1 = require("./rubble-contacts");
const rubble_support_1 = require("./rubble-support");
const section_fracture_1 = require("./section-fracture");
const section_index_1 = require("./section-index");
const squads = require("./squads");
const static_impact_1 = require("./static-impact");
const terrain_collider_1 = require("./terrain-collider");
const vehicle_state_1 = require("./vehicle-state");
class Simulation {
    presentation = new interpolation_1.PoseHistory();
    renderAlpha = 1;
    roundEpoch = 0;
    navigationBudget = 768;
    ballisticBudget = 2;
    coverBudget = 8;
    navigationStats = { expanded: 0, completed: 0, blocked: 0, liftTrips: 0 };
    battleTeamSize = 500;
    testArena = 'city';
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
    effectRnd(min, max) {
        let x = this.effectSeed;
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        this.effectSeed = x >>> 0;
        return min + (max - min) * (this.effectSeed / 4294967296);
    }
    collapsePreparing = false;
    destructionBudget = null;
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
    world;
    settings;
    events = [];
    actors = [];
    vehicles = [];
    projectiles = [];
    particles = [];
    rubble = [];
    dust = [];
    nextVoxelId = 1;
    nextRubbleId = 0;
    contactCursor = 0;
    tracers = [];
    flashes = [];
    feed = [];
    squads = [];
    player;
    playing = false;
    started = false;
    ended = false;
    loading = false;
    menuState = 'home';
    simTime = 0;
    tickets = [6000, 6000];
    kills = 0;
    deaths = 0;
    flagCaptures = 0;
    score = 0;
    roundStats = {};
    damageContributions = new Map();
    pings = [];
    spotCooldowns = new Map();
    nextPing = 0;
    nextStrategy = 0;
    strategyCursor = 0;
    classClock = 0;
    killStreak = 0;
    bestStreak = 0;
    xpFeed = [];
    weaponTuning = config_1.weapons.map(() => ({ spread: 1, kick: 1, reload: 1 }));
    itemTuning = {};
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
    ammo = config_1.weapons.map((w) => w.mag);
    reserves = config_1.weapons.map((w) => w.reserve);
    reloadTime = 0;
    fireTime = 0;
    grenades = 3;
    smokeGrenades = 2;
    smokeClouds = [];
    deployables = [];
    scopeStep = 0;
    equippedSecondary = 4;
    grenadeTime = 0;
    input = {
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
    camera = { x: 160, y: 130, z: 60, yaw: 0.85, pitch: -0.35 };
    handling = {
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
    controlGoal = config_1.CONTROL_GOAL;
    phaseNotice = false;
    abilityClock = 0;
    collapseTask = null;
    roundLimit = 1500;
    spawnChoice = -1;
    buckets = Array.from({ length: config_1.SW * config_1.SD }, () => []);
    activeKit = 'assault';
    spawnTarget = 'base';
    selectedSquad = 0;
    selectedRole = 'leader';
    initialDeployment = true;
    spawnError = '';
    localRoutes = new Map();
    constructor(settings = { ...config_1.defaults }, world = new world_1.World()) {
        this.settings = { ...settings };
        this.testArena = (0, scenarios_1.scenario)(settings.scenario).id;
        this.battleTeamSize = (0, scenarios_1.teamSize)(settings.teamSize);
        this.world = world;
        this.world.seed = settings.seed;
        this.player = this.makeActor(0, 0, true);
    }
    rayActors(o, d, length) {
        const found = new Set();
        let last = -1;
        for (let t = 0; t <= length + 6; t += 6) {
            const x = Math.max(0, Math.min(config_1.SW - 1, Math.floor((o.x + d.x * Math.min(t, length)) / 8))), z = Math.max(0, Math.min(config_1.SD - 1, Math.floor((o.z + d.z * Math.min(t, length)) / 8))), key = z * config_1.SW + x;
            if (key === last)
                continue;
            last = key;
            this.neighbours(x * 8 + 4, z * 8 + 4, 12, (a) => found.add(a));
        }
        return found;
    }
    get touch() {
        return this.settings.touch;
    }
    soundAt(sound, x, z, gain) {
        if (this.events.length < 256)
            this.events.push({ type: 'sound', sound, x, z, gain });
    }
    finishBattle(winner, reason = 'time') {
        if (this.ended)
            return;
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
    toggleAim(pressed) {
        if (!this.acceptsInput)
            return;
        if (this.settings.aimMode === 'hold')
            this.input.aim = pressed;
        else if (pressed)
            this.input.aim = !this.input.aim;
    }
    selectWeaponSlot(slot) {
        if (!this.acceptsInput ||
            this.player.vehicle ||
            !Number.isInteger(slot) ||
            slot < 0 ||
            slot > 2)
            return;
        if (slot === 2 && this.activeKit !== 'engineer') {
            this.classAbility();
            return;
        }
        const id = (0, loadout_1.loadout)(this)[slot];
        if (id !== undefined)
            this.switchWeapon(id);
    }
    cycleWeapon(direction = 1) {
        const kit = (0, loadout_1.loadout)(this);
        this.switchWeapon(kit[(kit.indexOf(this.weaponIndex) + (direction < 0 ? -1 : 1) + kit.length) % kit.length]);
    }
    setScreen(screen) {
        this.clearInput();
        this.menuState = screen;
        this.input.map = screen === 'map';
        if (!['play', 'map', 'orders', 'deployment'].includes(screen))
            this.playing = false;
        else if (['play', 'map', 'orders', 'deployment'].includes(screen) &&
            this.started &&
            !this.ended)
            this.playing = !this.initialDeployment;
    }
    /** Cancel suspended work before replacing world, actor or rigid-body ownership. */
    cancelWork() {
        this.events.length = 0;
        this.smokeClouds.length = 0;
        for (const d of this.deployables)
            d.used.clear();
        this.deployables.length = 0;
        this.presentation.reset();
        (0, npc_state_1.resetNpcState)(this);
        (0, navigation_1.resetNavigation)(this);
        (0, section_index_1.resetSectionIndex)(this);
        this.navigationStats = { expanded: 0, completed: 0, blocked: 0, liftTrips: 0 };
        for (const vehicle of this.vehicles)
            (0, vehicle_state_1.clearDriver)(vehicle);
        (0, section_fracture_1.cancelFractures)(this);
        (0, static_impact_1.cancelStaticImpacts)(this);
        (0, rubble_1.cancelRubbleMotion)(this);
        (0, rubble_contacts_1.cancelRubbleContacts)(this.rubble);
        (0, rubble_support_1.clearSupportQueries)(this.rubble);
        this.collapseTask?.return();
        this.collapseTask = null;
        this.collapsePreparing = false;
        this.localRoutes.clear();
        this.world.cancelMeshes();
        (0, terrain_collider_1.clearTerrainColliders)(this.world);
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
    *resetSteps() {
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
        return (0, equipment_1.throwSmoke)(this);
    }
    cycleZoom(direction = 1) {
        return (0, loadout_1.cycleZoom)(this, direction);
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
exports.Simulation = Simulation;

},
"src/simulation/squads.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSquads = createSquads;
exports.changeMembership = changeMembership;
exports.leaderSpawn = leaderSpawn;
exports.deploy = deploy;
exports.issueOrder = issueOrder;
exports.squadTarget = squadTarget;
const config_1 = require("../core/config");
const math_1 = require("../core/math");
const pathfinding_1 = require("../world/pathfinding");
const navigation_1 = require("./navigation");
function createSquads() {
    this.squads = Array.from({ length: Math.ceil(this.actors.length / config_1.SQUAD_SIZE) }, (_, id) => {
        const team = this.actors[id * config_1.SQUAD_SIZE].team, first = id * config_1.SQUAD_SIZE;
        return {
            id,
            team,
            leaderId: first,
            memberIds: Array.from({ length: config_1.SQUAD_SIZE }, (_, i) => first + i),
            order: { kind: 'objective' },
            blocked: false,
            route: this.testArena === 'frontline'
                ? 4
                : id === 0
                    ? 4
                    : team === 0
                        ? id % 9
                        : 8 - ((id - Math.ceil(this.actors.length / 20)) % 9),
        };
    });
    for (const squad of this.squads)
        for (const id of squad.memberIds)
            this.actors[id].squadId = squad.id;
    this.selectedSquad = this.player.squadId;
    this.selectedRole = 'leader';
}
function changeMembership(squadId, role) {
    const target = this.squads[squadId], old = this.squads[this.player.squadId];
    if (!target || target.team !== this.player.team || !old)
        return false;
    if (target !== old) {
        const replacement = target.memberIds.find((id) => id !== target.leaderId);
        old.memberIds[old.memberIds.indexOf(this.player.id)] = replacement;
        target.memberIds[target.memberIds.indexOf(replacement)] = this.player.id;
        this.actors[replacement].squadId = old.id;
        if (old.leaderId === this.player.id)
            old.leaderId = replacement;
        this.player.squadId = target.id;
    }
    if (role === 'leader')
        target.leaderId = this.player.id;
    else if (target.leaderId === this.player.id)
        target.leaderId = target.memberIds.find((id) => id !== this.player.id);
    this.localRoutes.clear();
    this.handling.objective = target.route;
    return true;
}
function leaderSpawn(a) {
    const squad = this.squads[a.squadId], leader = squad && this.actors[squad.leaderId];
    if (!leader || leader === a)
        return { position: null, reason: 'Squad leaders deploy at base' };
    if (!leader.alive)
        return { position: null, reason: 'Squad leader is down' };
    if (leader.vehicle || !leader.onGround)
        return { position: null, reason: 'Leader must be on foot and grounded' };
    if (this.simTime - leader.lastHit < 5)
        return { position: null, reason: 'Leader is in combat' };
    for (let i = 0; i < 48; i++) {
        const angle = (i + a.id) * 2.39996, r = 3 + (i % 6), x = leader.x + Math.sin(angle) * r, z = leader.z + Math.cos(angle) * r, y = leader.y;
        const p = { x, y, z };
        if (this.occupied(a, x, y, z, 0.34, 1.8) ||
            !(0, pathfinding_1.connectedSurface)(this.world, leader, p) ||
            !(0, navigation_1.walkSegment)(this, leader, p))
            continue;
        if (this.actors.some((b) => b.alive &&
            b !== a &&
            (b.team !== a.team ? (0, math_1.dist2)(b, p) < 225 : (0, math_1.dist2)(b, p) < 0.64 && Math.abs(b.y - y) < 2)))
            continue;
        return { position: p, reason: '' };
    }
    return { position: null, reason: 'No safe, connected landing near leader' };
}
function deploy() {
    if (this.ended ||
        this.player.alive ||
        this.player.respawn > 0 ||
        this.tickets[this.player.team] <= 0)
        return false;
    const target = this.squads[this.selectedSquad];
    if (!target || target.team !== this.player.team)
        return false;
    // Validate against the prospective leader without mutating membership on failure.
    let position;
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
    this.weaponIndex = config_1.kits[this.activeKit][0];
    this.spawnError = '';
    this.initialDeployment = false;
    this.playing = true;
    this.setScreen('play');
    return true;
}
function issueOrder(order) {
    const squad = this.squads[this.player.squadId];
    if (!this.player.alive || !squad || squad.leaderId !== this.player.id)
        return false;
    if (order.kind === 'objective' && order.objective !== undefined) {
        if (!Number.isInteger(order.objective) ||
            order.objective < 0 ||
            order.objective >= this.world.flags.length)
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
function squadTarget(a) {
    const squad = this.squads[a.squadId];
    if (!squad)
        return null;
    const leader = this.actors[squad.leaderId];
    let target = null;
    if (squad.order.kind === 'hold')
        target = squad.order.position;
    else if (squad.order.kind === 'follow' && leader.alive && leader !== a)
        target = leader;
    else if (squad.order.kind === 'objective') {
        const route = squad.route;
        this.assignGoal(a, route);
        return null;
    }
    if (!target) {
        this.assignGoal(a, squad.route);
        return null;
    }
    const participants = squad.order.kind === 'follow'
        ? squad.memberIds.filter((id) => id !== squad.leaderId)
        : squad.memberIds;
    const slot = participants.indexOf(a.id), angle = (slot * math_1.TAU) / participants.length, r = 3 + (slot % 3) * 1.5;
    const desired = {
        x: target.x + Math.sin(angle) * r,
        y: target.y,
        z: target.z + Math.cos(angle) * r,
    };
    if ((0, math_1.dist2)(a, desired) < 2)
        return { x: a.x, y: a.y, z: a.z };
    if (this.rubble.length ||
        Math.abs(a.y - desired.y) > 1.05 ||
        a.y > this.world.groundAt(a.x, a.z) + 2) {
        const result = (0, navigation_1.routeActor)(this, a, desired);
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
    if (cached &&
        cached.status !== 'pending' &&
        cached.expires > this.simTime &&
        cached.revision === this.world.publishedNavRevision &&
        (0, math_1.dist2)(cached.target, desired) < 9 &&
        (0, math_1.dist2)(a, cached.point) > 0.6)
        return cached.point;
    const path = (0, pathfinding_1.localPath)(this.world, a, desired, 2048, cached?.search);
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

},
"src/simulation/static-impact.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queueStaticImpact = queueStaticImpact;
exports.processStaticImpacts = processStaticImpacts;
exports.cancelStaticImpacts = cancelStaticImpacts;
const config_1 = require("../core/config");
const material_physics_1 = require("../core/material-physics");
const queues = new WeakMap();
function queueStaticImpact(sim, body, hits, speed, work) {
    if ((body.age < 0.25 && body.travel < 0.05) || body.impactCooldown > 0 || !hits.length)
        return;
    let queue = queues.get(sim);
    if (!queue) {
        queue = new Map();
        queues.set(sim, queue);
    }
    const energy = Math.min(16000, work ?? speed * speed * Math.sqrt(body.mass) * 0.22);
    if ((queue.size >= 24 && !queue.has(body)) || energy <= (queue.get(body)?.energy ?? 0))
        return;
    const unique = [...new Set(hits)], max = Math.min(128, Math.ceil(24 + Math.sqrt(body.mass)));
    const sampled = unique.length <= max
        ? unique
        : Array.from({ length: max }, (_, i) => unique[Math.floor((i * unique.length) / max)]);
    queue.set(body, { hits: sampled, energy });
}
function processStaticImpacts(sim) {
    const queue = queues.get(sim), budget = sim.destructionBudget;
    if (!queue || !budget)
        return;
    for (const [body, event] of queue) {
        if (budget.fractureEvents <= 0 || performance.now() >= budget.deadline)
            break;
        queue.delete(body);
        if (!sim.rubble.includes(body))
            continue;
        budget.fractureEvents--;
        let energy = event.energy, broken = 0;
        for (const key of event.hits) {
            const x = key % config_1.W, y = Math.floor(key / (config_1.W * config_1.D)), z = Math.floor(key / config_1.W) % config_1.D;
            const material = sim.world.cell(x, y, z), cost = (0, material_physics_1.fractureResistance)(material);
            if (!material || material === 1 || energy <= 0)
                continue;
            const result = sim.world.damageVoxel(x, y, z, Math.min(energy, cost));
            energy -= result.applied;
            if (result.removed)
                broken++;
        }
        if (broken) {
            body.sleeping = false;
            body.restTime = 0;
            sim.addDust(body, 2, 0.5);
        }
    }
}
function cancelStaticImpacts(sim) {
    queues.get(sim)?.clear();
    queues.delete(sim);
}

},
"src/simulation/tactics.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.observeContact = observeContact;
exports.squadContact = squadContact;
exports.updateSquadLeadership = updateSquadLeadership;
exports.squadCombatIntent = squadCombatIntent;
exports.yieldFiringLane = yieldFiringLane;
exports.firingPosition = firingPosition;
const math_1 = require("../core/math");
const navigation_1 = require("./navigation");
const npc_state_1 = require("./npc-state");
const perception_1 = require("./perception");
const section_query_1 = require("./section-query");
const memories = new WeakMap();
function memory(q) {
    let m = memories.get(q);
    if (!m) {
        m = { contacts: new Map(), leaderDownAt: -1 };
        memories.set(q, m);
    }
    return m;
}
function observeContact(sim, observer, target) {
    const squad = sim.squads[observer.squadId];
    if (!squad || observer.team === target.team)
        return;
    const m = memory(squad);
    m.contacts.set(target.id, {
        x: target.x,
        y: target.y,
        z: target.z,
        targetId: target.id,
        observedAt: sim.simTime,
        expires: sim.simTime + 6,
        observer: observer.id,
    });
    if (m.contacts.size > 8) {
        const oldest = [...m.contacts.values()].sort((a, b) => a.observedAt - b.observedAt)[0];
        m.contacts.delete(oldest.targetId);
    }
}
function squadContact(sim, actor) {
    const squad = sim.squads[actor.squadId];
    if (!squad)
        return null;
    const m = memory(squad);
    let best = null, score = Infinity;
    for (const [id, contact] of m.contacts) {
        if (contact.expires <= sim.simTime) {
            m.contacts.delete(id);
            continue;
        }
        const d = (0, math_1.dist2)(contact, actor) + (sim.simTime - contact.observedAt) * 40;
        if (d < score) {
            best = contact;
            score = d;
        }
    }
    return best;
}
function updateSquadLeadership(sim) {
    for (const q of sim.squads) {
        const m = memory(q), leader = sim.actors[q.leaderId];
        // A player's selected role remains theirs while down. NPC squads elect a survivor.
        if (leader?.player || leader?.alive) {
            m.leaderDownAt = -1;
            continue;
        }
        if (m.leaderDownAt < 0)
            m.leaderDownAt = sim.simTime;
        if (sim.simTime - m.leaderDownAt < 1)
            continue;
        const successor = q.memberIds
            .map((id) => sim.actors[id])
            .filter((a) => a?.alive && !a.vehicle)
            .sort((a, b) => (0, npc_state_1.pressure)(sim, a) - (0, npc_state_1.pressure)(sim, b) || b.hp - a.hp || a.id - b.id)[0];
        if (successor) {
            q.leaderId = successor.id;
            m.leaderDownAt = -1;
        }
    }
}
/** Fireteams alternate movement and covering fire. Manual follow/hold orders take precedence. */
function squadCombatIntent(sim, actor) {
    const q = sim.squads[actor.squadId];
    if (!q || q.order.kind !== 'objective')
        return null;
    const contact = squadContact(sim, actor);
    if (!contact || (0, math_1.dist2)(actor, contact) > 95 * 95)
        return null;
    if (!actor.target) {
        if ((0, math_1.dist2)(actor, contact) < 9)
            return null;
        return { point: contact, tactic: 'INVESTIGATE' };
    }
    const members = q.memberIds.map((id) => sim.actors[id]).filter((a) => a?.alive && !a.vehicle);
    const slot = q.memberIds.indexOf(actor.id), team = slot < 5 ? 0 : 1;
    const coveringTeam = (Math.floor(sim.simTime / 5) + q.id) % 2;
    const coverReady = members.some((a) => a !== actor &&
        (q.memberIds.indexOf(a.id) < 5 ? 0 : 1) === coveringTeam &&
        a.target &&
        a.reload <= 0 &&
        (0, npc_state_1.pressure)(sim, a) < 0.6);
    if ((team === coveringTeam || actor.kit === 'support' || actor.kit === 'recon') &&
        actor.target &&
        actor.reload <= 0)
        return { point: actor, tactic: 'SUPPRESS' };
    if (!coverReady)
        return null;
    const leader = sim.actors[q.leaderId] ?? actor;
    const dx = contact.x - leader.x, dz = contact.z - leader.z, length = Math.hypot(dx, dz) || 1;
    const side = q.id % 2 ? 1 : -1, spread = 9 + (slot % 5) * 1.6;
    const point = {
        x: contact.x - (dx / length) * 15 + (dz / length) * spread * side,
        z: contact.z - (dz / length) * 15 - (dx / length) * spread * side,
        y: actor.y,
    };
    return { point, tactic: 'BOUND / FLANK' };
}
/** Persistent lane blockage produces a validated lateral move rather than endless delayed shots. */
function yieldFiringLane(sim, actor, target) {
    const brain = (0, npc_state_1.npcState)(actor);
    if (brain.blockedSince < 0)
        brain.blockedSince = sim.simTime;
    if (sim.simTime - brain.blockedSince < 0.32 || brain.task || actor.tactic === 'EVADE')
        return;
    const yaw = Math.atan2(target.x - actor.x, target.z - actor.z), sign = actor.id % 2 ? 1 : -1;
    for (const side of [sign, -sign]) {
        const dx = Math.cos(yaw) * side, dz = -Math.sin(yaw) * side;
        const point = { x: actor.x + dx * 1.8, y: actor.y, z: actor.z + dz * 1.8 };
        if ((0, navigation_1.walkSegment)(sim, actor, point) &&
            !sim.actors.some((a) => a !== actor &&
                a.alive &&
                !a.vehicle &&
                Math.abs(a.y - actor.y) < 1.8 &&
                (0, math_1.dist2)(a, point) < 0.7)) {
            actor.dx = dx;
            actor.dz = dz;
            actor.crouched = false;
            actor.tactic = 'CLEAR FIRING LANE';
            brain.reason = 'Repositioning around an allied firing lane';
            brain.nextThink = Math.max(brain.nextThink, sim.simTime + 0.35);
            return;
        }
    }
}
/** Cover slots are local-floor positions, revalidated against terrain and moving sections. */
function firingPosition(sim, a, threat, objective) {
    const brain = (0, npc_state_1.npcState)(a), eye = { x: threat.x, y: threat.y + 1.4, z: threat.z };
    const freeReservation = (p) => {
        let free = true;
        sim.neighbours(p.x, p.z, 8, (ally) => {
            if (ally === a || !ally.alive || ally.team !== a.team || Math.abs(ally.y - p.y) > 2)
                return;
            const b = (0, npc_state_1.npcState)(ally);
            if (b.position && b.positionUntil > sim.simTime && (0, math_1.dist2)(b.position, p) < 1.65 ** 2)
                free = false;
        });
        return free;
    };
    const protectedLow = (p) => !(0, section_query_1.clearSegment)(sim, eye, { x: p.x, y: p.y + 0.75, z: p.z });
    if (brain.position &&
        brain.positionUntil > sim.simTime &&
        freeReservation(brain.position) &&
        (0, navigation_1.walkSegment)(sim, a, brain.position) &&
        protectedLow(brain.position)) {
        brain.position.peek = (0, perception_1.canSee)(sim, eye, { ...brain.position, y: brain.position.y + 1.5 });
        return brain.position;
    }
    brain.position = null;
    brain.positionUntil = 0;
    if (sim.coverBudget <= 0 || brain.nextCoverSearch > sim.simTime)
        return null;
    sim.coverBudget--;
    brain.nextCoverSearch = sim.simTime + 1.2 + (a.id % 5) * 0.08;
    let best = null, score = -Infinity;
    for (let k = 0; k < 12; k++) {
        const angle = (k * Math.PI) / 6 + (a.id % 3) * 0.12, radius = k < 6 ? 3.5 : 6;
        const x = a.x + Math.sin(angle) * radius, z = a.z + Math.cos(angle) * radius;
        let p = null;
        for (const dy of [0, -1, 1]) {
            const candidate = { x, y: a.y + dy, z };
            if ((0, navigation_1.walkSegment)(sim, a, candidate) && !sim.occupied(a, x, candidate.y, z, 0.35, 1.8)) {
                p = candidate;
                break;
            }
        }
        if (!p || !freeReservation(p) || !protectedLow(p))
            continue;
        const peek = (0, perception_1.canSee)(sim, eye, { ...p, y: p.y + 1.5 });
        const value = (peek ? 34 : 20) - radius - Math.sqrt((0, math_1.dist2)(p, objective)) * 0.02;
        if (value > score) {
            score = value;
            best = { ...p, peek };
        }
    }
    if (best) {
        brain.position = best;
        brain.cover = best;
        brain.coverUntil = brain.positionUntil = sim.simTime + 3.5 + (a.id % 3) * 0.4;
        brain.reason = best.peek ? 'Holding cover with a clear firing lane' : 'Sheltering behind cover';
    }
    return best;
}

},
"src/simulation/terrain-collider.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.terrainRoots = terrainRoots;
exports.clearTerrainColliders = clearTerrainColliders;
const config_1 = require("../core/config");
const collision_geometry_1 = require("./collision-geometry");
const section_tree_1 = require("./section-tree");
const caches = new WeakMap();
/** Exact same-material cuboids. The cache is local, bounded and invalidated by terrain edits;
 * empty windows and blast holes are never replaced with a conservative solid hull. */
function* prepare(world, id) {
    const ox = (id % config_1.NX) * config_1.CS, oz = Math.floor(id / config_1.NX) * config_1.CS;
    let top = 0, work = 0;
    for (let z = 0; z < config_1.CS; z++)
        for (let x = 0; x < config_1.CS; x++)
            top = Math.max(top, world.columnTop[(oz + z) * config_1.W + ox + x]);
    top = Math.min(config_1.H, Math.max(1, top));
    const mask = new Uint8Array(config_1.CS * config_1.CS * top), index = (x, y, z) => (y * config_1.CS + z) * config_1.CS + x;
    for (let y = 0; y < top; y++)
        for (let z = 0; z < config_1.CS; z++)
            for (let x = 0; x < config_1.CS; x++) {
                mask[index(x, y, z)] = world.cell(ox + x, y, oz + z);
                if (++work % 256 === 0)
                    yield;
            }
    const boxes = [];
    for (let y = 0; y < top; y++)
        for (let z = 0; z < config_1.CS; z++)
            for (let x = 0; x < config_1.CS; x++) {
                if (++work % 128 === 0)
                    yield;
                const m = mask[index(x, y, z)];
                if (!m)
                    continue;
                let width = 1, depth = 1, height = 1;
                while (x + width < config_1.CS && mask[index(x + width, y, z)] === m)
                    width++;
                rows: while (z + depth < config_1.CS) {
                    for (let i = 0; i < width; i++)
                        if (mask[index(x + i, y, z + depth)] !== m)
                            break rows;
                    depth++;
                }
                layers: while (y + height < top) {
                    for (let k = 0; k < depth; k++)
                        for (let i = 0; i < width; i++)
                            if (mask[index(x + i, y + height, z + k)] !== m)
                                break layers;
                    height++;
                }
                for (let h = 0; h < height; h++)
                    for (let k = 0; k < depth; k++) {
                        mask.fill(0, index(x, y + h, z + k), index(x, y + h, z + k) + width);
                        if (++work % 128 === 0)
                            yield;
                    }
                boxes.push({
                    min: { x: ox + x, y, z: oz + z },
                    max: { x: ox + x + width, y: y + height, z: oz + z + depth },
                    index: world.index(ox + x, y, oz + z),
                });
            }
    return boxes.length ? yield* (0, collision_geometry_1.buildCollisionTree)(boxes) : undefined;
}
function* terrainRoots(world, bounds) {
    let cache = caches.get(world);
    if (!cache) {
        cache = new Map();
        caches.set(world, cache);
    }
    for (let z = Math.max(0, Math.floor(bounds.min.z / config_1.CS)); z <= Math.min(config_1.D / config_1.CS - 1, Math.floor(bounds.max.z / config_1.CS)); z++)
        for (let x = Math.max(0, Math.floor(bounds.min.x / config_1.CS)); x <= Math.min(config_1.NX - 1, Math.floor(bounds.max.x / config_1.CS)); x++) {
            const id = z * config_1.NX + x, revision = world.chunkRevisions[id];
            let entry = cache.get(id);
            if (!entry || entry.revision !== revision) {
                entry?.job.return(undefined);
                entry = { revision, job: prepare(world, id), complete: false };
                cache.set(id, entry);
            }
            while (!entry.complete) {
                const step = entry.job.next();
                if (step.done) {
                    entry.root = step.value;
                    entry.complete = true;
                }
                else
                    yield;
            }
            if (world.chunkRevisions[id] !== revision)
                return;
            if (entry.root && (0, section_tree_1.intersects)(entry.root, bounds))
                yield entry.root;
            // Refresh LRU order, never evict the generator currently being advanced.
            cache.delete(id);
            cache.set(id, entry);
            while (cache.size > 128) {
                const oldest = cache.keys().next().value;
                cache.get(oldest)?.job.return(undefined);
                cache.delete(oldest);
            }
        }
}
function clearTerrainColliders(world) {
    for (const entry of caches.get(world)?.values() ?? [])
        entry.job.return(undefined);
    caches.delete(world);
}

},
"src/simulation/terrain-contact.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.terrainContacts = terrainContacts;
const config_1 = require("../core/config");
const collision_geometry_1 = require("./collision-geometry");
const contact_1 = require("./contact");
const rubble_shape_1 = require("./rubble-shape");
const section_tree_1 = require("./section-tree");
const terrain_collider_1 = require("./terrain-collider");
const queryCache = new WeakMap();
/** Only terrain in the swept footprint can invalidate a query; distant combat is irrelevant. */
function terrainRevision(sim, b, origin, end) {
    const bounds = (0, rubble_shape_1.rubbleBounds)(b, origin), values = [];
    for (let z = Math.max(0, Math.floor((bounds.min.z + Math.min(0, end.z - origin.z)) / config_1.CS)); z <= Math.min(config_1.NX - 1, Math.floor((bounds.max.z + Math.max(0, end.z - origin.z)) / config_1.CS)); z++)
        for (let x = Math.max(0, Math.floor((bounds.min.x + Math.min(0, end.x - origin.x)) / config_1.CS)); x <= Math.min(config_1.NX - 1, Math.floor((bounds.max.x + Math.max(0, end.x - origin.x)) / config_1.CS)); x++)
            values.push(sim.world.chunkRevisions[z * config_1.NX + x]);
    return values.join(',');
}
function* queryTerrain(sim, b, origin, delta, supportOnly) {
    yield* (0, collision_geometry_1.prepareCollisionBoxes)(b);
    const root = (0, collision_geometry_1.collisionRoot)(b), contacts = [], found = new Set();
    if (!root)
        return contact_1.clearContact;
    const swept = (bounds) => ({
        min: {
            x: bounds.min.x + Math.min(0, delta.x),
            y: bounds.min.y + Math.min(0, delta.y),
            z: bounds.min.z + Math.min(0, delta.z),
        },
        max: {
            x: bounds.max.x + Math.max(0, delta.x),
            y: bounds.max.y + Math.max(0, delta.y),
            z: bounds.max.z + Math.max(0, delta.z),
        },
    });
    const whole = swept((0, rubble_shape_1.rubbleBounds)(b, origin));
    const nodeCache = new Map(), boxCache = new Map();
    const bounds = (node) => {
        let value = nodeCache.get(node);
        if (!value) {
            value = swept((0, section_tree_1.rotatedBounds)(b, node.min, node.max, origin));
            nodeCache.set(node, value);
        }
        return value;
    };
    let work = 0;
    for (const terrain of (0, terrain_collider_1.terrainRoots)(sim.world, whole)) {
        if (!terrain) {
            yield;
            continue;
        }
        const stack = [[root, terrain]];
        while (stack.length) {
            const [a, c] = stack.pop();
            if (++work % 24 === 0)
                yield;
            if (!(0, section_tree_1.intersects)(bounds(a), c))
                continue;
            if (a.boxes && c.boxes) {
                for (const local of a.boxes) {
                    let shape = boxCache.get(local);
                    if (!shape) {
                        shape = (0, collision_geometry_1.orientedBox)(b, local.min, local.max, origin, local.index);
                        boxCache.set(local, shape);
                    }
                    const moving = swept(shape.bounds);
                    for (const solid of c.boxes) {
                        if (++work % 16 === 0)
                            yield;
                        if (!(0, section_tree_1.intersects)(moving, solid))
                            continue;
                        const contact = (0, collision_geometry_1.sweepObb)(shape, (0, collision_geometry_1.axisBox)(solid), delta);
                        if (!contact || (supportOnly && contact.normal.y <= 0.6))
                            continue;
                        // A representative occupied witness plus a whole-chunk revision protects support
                        // reuse, while the exact contact rectangle retains the full support footprint.
                        const px = Math.max(solid.min.x, Math.min(solid.max.x - 0.001, contact.point.x)), pz = Math.max(solid.min.z, Math.min(solid.max.z - 0.001, contact.point.z)), py = contact.normal.y > 0.6
                            ? solid.max.y - 0.001
                            : Math.max(solid.min.y, Math.min(solid.max.y - 0.001, contact.point.y));
                        const key = sim.world.index(Math.floor(px), Math.floor(py), Math.floor(pz));
                        if (supportOnly && found.has(key))
                            continue;
                        found.add(key);
                        contact.terrain = key;
                        contacts.push(contact);
                    }
                }
            }
            else if (a.left &&
                (!c.left ||
                    a.max.x - a.min.x + a.max.y - a.min.y + a.max.z - a.min.z >=
                        c.max.x - c.min.x + c.max.y - c.min.y + c.max.z - c.min.z))
                stack.push([a.left, c], [a.right, c]);
            else if (c.left)
                stack.push([a, c.left], [a, c.right]);
        }
    }
    return contacts.length ? { kind: 'contact', contacts } : contact_1.clearContact;
}
function terrainContacts(sim, b, x, y, z, from, supportOnly = false) {
    const end = { x, y, z }, origin = from ? { x: from.x, y: from.y, z: from.z } : end, delta = { x: x - origin.x, y: y - origin.y, z: z - origin.z };
    let cache = queryCache.get(b);
    if (!cache || cache.version !== b.geometryVersion) {
        cache = { version: b.geometryVersion, entries: new Map() };
        queryCache.set(b, cache);
    }
    const q = b.orientation, key = [x, y, z, origin.x, origin.y, origin.z, q.x, q.y, q.z, q.w, +supportOnly].join(','), terrain = terrainRevision(sim, b, origin, end);
    let query = cache.entries.get(key);
    // Revalidate contact witnesses after raw terrain edits as well as chunk revisions.
    // This also protects sleeping-body support when a caller removes foundation cells.
    const removedContact = query &&
        query.checkedRevision !== sim.world.revision &&
        query.result?.kind === 'contact' &&
        query.result.contacts.some((c) => c.terrain !== undefined && !sim.world.vox[c.terrain]);
    if (removedContact)
        (0, terrain_collider_1.clearTerrainColliders)(sim.world);
    if (!query || query.terrain !== terrain || removedContact) {
        query = {
            terrain,
            checkedRevision: sim.world.revision,
            job: queryTerrain(sim, b, origin, delta, supportOnly),
        };
        if (cache.entries.size >= 24)
            cache.entries.delete(cache.entries.keys().next().value);
        cache.entries.set(key, query);
    }
    query.checkedRevision = sim.world.revision;
    if (query.result)
        return query.result;
    const deadline = sim.destructionBudget?.deadline ?? Infinity;
    while (performance.now() < deadline) {
        const next = query.job.next();
        if (next.done) {
            query.result = next.value;
            return next.value;
        }
    }
    sim.destructionStats.deferredQueries++;
    return { kind: 'deferred' };
}

},
"src/simulation/vehicle-state.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveVehicle = leaveVehicle;
exports.clearDriver = clearDriver;
exports.enterVehicle = enterVehicle;
/** These are the only writers of the two sides of a driver relationship. */
function leaveVehicle(actor) {
    const old = actor.vehicle;
    if (old?.driver === actor)
        old.driver = null;
    actor.vehicle = null;
}
function clearDriver(vehicle) {
    const actor = vehicle.driver;
    if (actor?.vehicle === vehicle)
        actor.vehicle = null;
    vehicle.driver = null;
}
function enterVehicle(actor, vehicle) {
    if (!actor.alive || !vehicle.alive || (vehicle.driver && vehicle.driver !== actor))
        return false;
    leaveVehicle(actor);
    actor.vehicle = vehicle;
    vehicle.driver = actor;
    return true;
}

},
"src/simulation/vehicles.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respawnVehicle = respawnVehicle;
exports.updateVehicles = updateVehicles;
const configModule = require("../core/config");
const mathModule = require("../core/math");
const vehicle_state_1 = require("./vehicle-state");
function respawnVehicle(v) {
    for (let i = 0; i < 70; i++) {
        const x = mathModule.clamp(v.homeX + this.world.rnd(-8, 8), 5, configModule.W - 5), z = mathModule.clamp(v.homeZ + this.world.rnd(-8, 8), 5, configModule.D - 5), y = this.world.groundAt(x, z);
        if (this.occupied(v, x, y, z, v.radius, v.height) ||
            this.actors.some((a) => a.alive &&
                !a.vehicle &&
                Math.abs(a.x - x) < v.radius + 0.4 &&
                Math.abs(a.z - z) < v.radius + 0.4))
            continue;
        (0, vehicle_state_1.clearDriver)(v);
        Object.assign(v, {
            x,
            y,
            z,
            hp: 600,
            vx: 0,
            vy: 0,
            vz: 0,
            ix: 0,
            iz: 0,
            alive: true,
            driver: null,
            target: null,
            stuck: 0,
            reverse: 0,
            cool: 3,
        });
        return true;
    }
    return false;
}
function updateVehicles(dt) {
    for (let i = 0; i < this.vehicles.length; i++) {
        const v = this.vehicles[i];
        if (!v.alive) {
            v.respawn -= dt;
            if (v.respawn <= 0 && !this.respawnVehicle(v))
                v.respawn = 1;
            continue;
        }
        v.cool -= dt;
        if (v.driver && (!v.driver.alive || v.driver.vehicle !== v))
            (0, vehicle_state_1.clearDriver)(v);
        if (v.driver)
            continue;
        if (this.stepNumber % 30 === (i * 7) % 30) {
            v.goal = 4;
            let best = Infinity;
            for (let j = 0; j < this.world.flags.length; j++) {
                const f = this.world.flags[j], n = mathModule.clamp(Math.floor(v.z / 2), 0, configModule.ND - 1) * configModule.NW +
                    mathModule.clamp(Math.floor(v.x / 2), 0, configModule.NW - 1);
                if (this.world.vehicleFields[j][n] === 65535)
                    continue;
                const cost = Math.sqrt(mathModule.dist2(v, f)) + (f.owner === v.team ? 60 : 0);
                if (cost < best) {
                    best = cost;
                    v.goal = j;
                }
            }
        }
        const f = this.world.flags[v.goal], point = this.world.navigationPoint(v, true), l = Math.hypot(f.x - v.x, f.z - v.z), oldX = v.x, oldZ = v.z;
        let speed = l > 8 && point.reachable ? 4.8 : 0;
        if (v.reverse > 0) {
            v.reverse -= dt;
            speed = -2.5;
        }
        else if (speed) {
            const target = Math.atan2(point.x - v.x, point.z - v.z), turn = mathModule.angleWrap(target - v.yaw);
            v.yaw = mathModule.angleWrap(v.yaw + mathModule.clamp(turn, -dt * 1.5, dt * 1.5));
            if (Math.abs(turn) > 1)
                speed = 0.5;
        }
        v.vx = Math.sin(v.yaw) * speed;
        v.vz = Math.cos(v.yaw) * speed;
        this.moveBody(v, dt, v.radius, v.height);
        v.stuck = Math.hypot(v.x - oldX, v.z - oldZ) < 0.015 && speed > 0 ? v.stuck + dt : 0;
        if (v.stuck > 2) {
            v.reverse = 1.2;
            v.stuck = 0;
        }
        if (this.stepNumber % 12 === (i * 3) % 12)
            v.target = this.chooseTarget(v, 60);
        if (v.target?.alive) {
            const t = v.target, d = Math.hypot(t.x - v.x, t.z - v.z);
            v.turret = Math.atan2(t.x - v.x, t.z - v.z);
            v.pitch = mathModule.clamp(Math.atan2(t.y + 1 - v.y - 2.35, d) + d * 0.001, -0.2, 0.55);
            if (v.cool <= 0 && d > 9) {
                const dir = mathModule.direction(v.turret, v.pitch);
                if (this.launch(v, { x: v.x + dir.x * 2.8, y: v.y + 2.35 + dir.y * 2.8, z: v.z + dir.z * 2.8 }, dir, 'shell'))
                    v.cool = this.world.rnd(5, 8);
            }
        }
        else {
            v.turret = v.yaw;
            v.pitch = 0;
        }
    }
}

},
"src/ui/app.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const config_1 = require("../core/config");
const loadout_1 = require("../core/loadout");
const loop_1 = require("../core/loop");
const math_1 = require("../core/math");
const progression_1 = require("../core/progression");
const input_1 = require("../platform/input");
const profile_session_1 = require("../platform/profile-session");
const storage_1 = require("../platform/storage");
const destruction_budget_1 = require("../simulation/destruction-budget");
const career_1 = require("./career");
const dom_1 = require("./dom");
const hud_view_1 = require("./hud-view");
const lab_1 = require("./lab");
const scoreboard_view_1 = require("./scoreboard-view");
const screen_layout_1 = require("./screen-layout");
const settings_view_1 = require("./settings-view");
const tactical_map_1 = require("./tactical-map");
const tactical_view_1 = require("./tactical-view");
class App {
    sim;
    renderer;
    audio;
    storage;
    profile;
    abort = new AbortController();
    clock = new loop_1.FixedClock();
    previous = 0;
    raf = 0;
    uiTime = 0;
    disposed = false;
    halted = false;
    generation = 0;
    matchXp = 0;
    matchId = '';
    matchSeed = 0;
    profileDirty = false;
    saveClock = 0;
    saving = false;
    writer;
    lab;
    screens;
    tacticalState = { rosterPage: 0 };
    scoreFocus = null;
    scoreClock = 0;
    refreshCareer() {
        (0, career_1.renderCareer)(this.profile, this.screens.career);
    }
    labReturn = 'home';
    modalAction = null;
    modalFocus = null;
    openLab() {
        if (this.sim.loading)
            return;
        if (this.sim.menuState !== 'lab')
            this.labReturn = this.sim.menuState;
        this.show('lab');
    }
    closeLab() {
        this.show(this.sim.ended ? 'results' : this.labReturn === 'lab' ? 'home' : this.labReturn);
        if (this.sim.menuState === 'play')
            this.input.requestLook();
    }
    confirmAction(title, message, action) {
        this.modalAction = action;
        this.modalFocus = document.activeElement;
        (0, dom_1.text)('dialogTitle', title);
        (0, dom_1.text)('dialogMessage', message);
        (0, dom_1.byId)('actionDialog').hidden = false;
        (0, dom_1.byId)('overlay').inert = true;
        (0, dom_1.byId)('tactical').inert = true;
        (0, dom_1.byId)('dialogCancel').focus();
    }
    closeDialog(accept = false) {
        const action = this.modalAction;
        this.modalAction = null;
        (0, dom_1.byId)('actionDialog').hidden = true;
        (0, dom_1.byId)('overlay').inert = false;
        (0, dom_1.byId)('tactical').inert = false;
        this.modalFocus?.focus();
        this.modalFocus = null;
        if (accept)
            action?.();
    }
    reportSave(message, problem = false) {
        if (this.disposed)
            return;
        (0, dom_1.text)('saveStatus', message);
        (0, dom_1.text)('profileState', message);
        (0, dom_1.byId)('profileState').classList.toggle('warning', problem);
    }
    exportProfile() {
        const body = JSON.stringify({ version: '0.6.1', profile: this.profile, checkpoints: this.writer.checkpoints() }, null, 2);
        const url = URL.createObjectURL(new Blob([body], { type: 'application/json' })), link = document.createElement('a');
        link.href = url;
        link.download = 'battlevox-profile.json';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    applyTuning() {
        this.sim.weaponTuning = config_1.weapons.map((w) => (0, progression_1.tuning)(this.profile, w.id));
        this.sim.itemTuning = Object.fromEntries(progression_1.itemTracks.map((t) => [t.id, (0, progression_1.tuning)(this.profile, t.id).ability]));
    }
    savePreferences() {
        const ok = (0, storage_1.saveSettings)(this.storage, this.sim.settings);
        if (!ok)
            this.reportSave('Settings active. Device storage is unavailable.', true);
        return ok;
    }
    flushProfile() {
        if (!this.profileDirty)
            return;
        this.writer.checkpoint(this.profile);
        if (this.saving)
            return;
        this.saving = true;
        this.saveClock = 0;
        const snapshot = (0, storage_1.validateProfile)(this.profile), serialised = JSON.stringify(snapshot);
        void this.writer.commit(snapshot).then((result) => {
            this.saving = false;
            if (result.ok) {
                this.profileDirty = JSON.stringify((0, storage_1.validateProfile)(this.profile)) !== serialised;
                if (this.profileDirty)
                    this.writer.checkpoint(this.profile);
                this.reportSave('Saved on this device.');
                if (this.profileDirty && !this.disposed)
                    this.flushProfile();
            }
            else {
                this.profileDirty = true;
                this.reportSave(result.reason === 'conflict'
                    ? 'Another tab changed this profile. Recover or export from Barracks.'
                    : result.reason === 'checkpoint'
                        ? 'Session backup saved. Device save pending.'
                        : 'Storage unavailable. Export your profile.', true);
            }
        });
    }
    input;
    map;
    constructor(sim, renderer, audio, storage, profile, saved) {
        this.sim = sim;
        this.renderer = renderer;
        this.audio = audio;
        this.storage = storage;
        this.profile = profile;
        let base = null;
        try {
            base = saved ? saved.profileBase : (storage?.getItem(storage_1.profileKey) ?? null);
        }
        catch { }
        this.writer = new profile_session_1.ProfileSession(storage, base, saved?.exclusiveWrite);
        this.profileDirty = !!saved?.recovered;
        this.screens = new screen_layout_1.ScreenLayout(this.abort.signal, () => this.refreshCareer());
        this.lab = new lab_1.FieldLab(this, renderer, this.abort.signal);
        this.input = new input_1.InputController(this, (0, dom_1.byId)('world'));
        this.map = new tactical_map_1.TacticalMap((0, dom_1.byId)('tacticalMap'), sim, renderer.mini, (value) => {
            (0, dom_1.byId)('spawnSelect').value = value;
            this.readDeployment();
        });
        (0, progression_1.ensureCareer)(this.profile);
        this.applyTuning();
        this.bind();
        this.syncSettings();
        this.show('home');
        if (saved?.recoveryConflict)
            this.reportSave('Multiple session backups found. Choose one in Barracks.', true);
    }
    bind() {
        const signal = this.abort.signal, s = this.sim;
        const click = (id, fn) => (0, dom_1.byId)(id).addEventListener('click', fn, { signal });
        click('labButton', () => this.openLab());
        for (const b of document.querySelectorAll('[data-weapon-slot]'))
            b.addEventListener('click', () => s.selectWeaponSlot(Number(b.dataset.weaponSlot)), {
                signal,
            });
        click('rosterPrev', () => {
            this.tacticalState.rosterPage = Math.max(0, this.tacticalState.rosterPage - 1);
            this.updateTactical();
        });
        click('rosterNext', () => {
            this.tacticalState.rosterPage++;
            this.updateTactical();
        });
        for (const id of ['secondary', 'arsenalSecondary'])
            (0, dom_1.byId)(id).addEventListener('change', (e) => {
                s.settings.secondary = (0, loadout_1.secondaryIndex)(Number(e.target.value));
                this.syncSettings();
                this.savePreferences();
                if (s.menuState === 'deployment')
                    this.updateTactical();
            }, { signal });
        (0, dom_1.byId)('arsenalClass').addEventListener('change', (e) => {
            s.settings = (0, storage_1.validateSettings)({
                ...s.settings,
                loadout: e.target.value,
            });
            this.syncSettings();
            this.savePreferences();
        }, { signal });
        click('dialogCancel', () => this.closeDialog());
        click('dialogConfirm', () => this.closeDialog(true));
        click('exportProfile', () => this.exportProfile());
        click('recoverProfile', () => {
            if (this.saving) {
                this.reportSave('FINISHING THE CURRENT SAVE · RECOVERY WILL BE AVAILABLE WHEN IT COMPLETES', true);
                return;
            }
            const key = (0, dom_1.byId)('checkpointChoice').value;
            const selected = this.writer.checkpoints().find((p) => p.key === key);
            this.confirmAction('LOAD A SAVED PROFILE?', 'Your current session remains in its checkpoint. Loading a profile replaces the career shown in this tab.', () => {
                this.writer.checkpoint(this.profile);
                this.profile = selected
                    ? (0, storage_1.validateProfile)(selected.profile)
                    : (() => {
                        try {
                            return (0, storage_1.validateProfile)(JSON.parse(this.storage?.getItem(storage_1.profileKey) ?? 'null'));
                        }
                        catch {
                            return (0, storage_1.validateProfile)(null);
                        }
                    })();
                this.writer = new profile_session_1.ProfileSession(this.storage, (() => {
                    try {
                        return this.storage?.getItem(storage_1.profileKey) ?? null;
                    }
                    catch {
                        return null;
                    }
                })());
                this.profileDirty = true;
                this.applyTuning();
                this.refreshCareer();
                this.flushProfile();
            });
        });
        click('deploy', () => (s.started && !s.ended ? this.show('confirm') : void this.newRound()));
        for (const id of ['newConfirmed', 'restart'])
            click(id, () => void this.newRound());
        for (const id of ['homeResume', 'resume', 'returnToGame'])
            click(id, () => this.resume());
        click('confirmBack', () => this.show('home'));
        click('pause', () => this.pause());
        click('quit', () => this.show('home'));
        click('resultHome', () => this.show('home'));
        click('redeploy', () => {
            if (s.player.alive) {
                s.player.shield = 0;
                const invulnerable = s.practiceInvulnerable;
                s.practiceInvulnerable = false;
                try {
                    s.hurt(s.player, 1000, null);
                }
                finally {
                    s.practiceInvulnerable = invulnerable;
                }
            }
            s.playing = true;
            this.openTactical('deployment');
        });
        click('mapToggle', () => this.openTactical('map'));
        click('ordersButton', () => this.openTactical('orders'));
        click('scoreButton', () => (0, dom_1.byId)('scoreboard').hidden ? this.showScores() : this.closeScores());
        click('closeScores', () => this.closeScores());
        click('tacticalClose', () => (s.menuState === 'deployment' ? this.pause() : this.resume()));
        for (const el of document.querySelectorAll('[data-menu]'))
            el.addEventListener('click', () => (el.dataset.menu === 'lab' ? this.openLab() : this.show(el.dataset.menu)), { signal });
        (0, dom_1.byId)('arsenal').addEventListener('change', (event) => {
            const element = event.target.closest('select[data-item]');
            if (!element || !(0, progression_1.equip)(this.profile, element.dataset.item || '', element.value))
                return;
            this.applyTuning();
            // A configuration change cancels an in-progress reload without spending ammunition.
            s.reloadTime = 0;
            this.profileDirty = true;
            this.flushProfile();
            this.refreshCareer();
        }, { signal });
        (0, dom_1.byId)('callsignForm').addEventListener('submit', (event) => {
            event.preventDefault();
            (0, progression_1.ensureCareer)(this.profile).name =
                (0, dom_1.byId)('callsign')
                    .value.replace(/[\u0000-\u001f\u007f]/g, '')
                    .trim()
                    .slice(0, 24) || 'OPERATIVE';
            this.profileDirty = true;
            this.flushProfile();
            this.refreshCareer();
        }, { signal });
        (0, dom_1.byId)('kitAction').addEventListener('click', () => s.classAbility(), { signal });
        for (const [button, panel] of [
            ['hudMapToggle', 'map'],
            ['hudSquadToggle', 'squad'],
        ]) {
            (0, dom_1.byId)(button).addEventListener('click', () => {
                if (innerHeight < 500 || (s.touch && innerHeight < 650)) {
                    this.openTactical('map');
                    return;
                }
                const open = document.body.dataset.hudPanel !== panel;
                document.body.dataset.hudPanel = open ? panel : '';
                for (const id of ['hudMapToggle', 'hudSquadToggle'])
                    (0, dom_1.byId)(id).setAttribute('aria-expanded', String(open && id === button));
                this.renderer.resize();
            }, { signal });
        }
        for (const el of document.querySelectorAll('[data-order]'))
            el.addEventListener('click', () => this.order(el.dataset.order), { signal });
        const settingMap = {
            mapSeed: 'seed',
            duration: 'minutes',
            quality: 'quality',
            hudScale: 'hudScale',
            distance: 'distance',
            fov: 'fov',
            brightness: 'brightness',
            sensitivity: 'sensitivity',
            adsSensitivity: 'adsSensitivity',
            volume: 'volume',
            motion: 'motion',
            adaptive: 'adaptive',
            touchMode: 'touch',
            aimMode: 'aimMode',
            scenario: 'scenario',
            battleSize: 'teamSize',
            lighting: 'lighting',
            textures: 'textures',
            shadows: 'shadows',
        };
        for (const [id, key] of Object.entries(settingMap))
            (0, dom_1.byId)(id).addEventListener('change', () => {
                const el = (0, dom_1.byId)(id);
                const value = el.type === 'checkbox'
                    ? el.checked
                    : ['aimMode', 'scenario', 'lighting'].includes(key)
                        ? el.value
                        : Number(el.value);
                s.settings = (0, storage_1.validateSettings)({ ...s.settings, [key]: value });
                this.syncSettings();
                this.savePreferences();
                this.configureGraphics();
                this.renderer.resize();
                this.audio.sync();
            }, { signal });
        for (const id of ['fov', 'brightness', 'sensitivity', 'adsSensitivity', 'volume'])
            (0, dom_1.byId)(id).addEventListener('input', () => this.updateSettingValue(id), { signal });
        for (const id of ['squadSelect', 'roleSelect', 'spawnSelect', 'loadout'])
            (0, dom_1.byId)(id).addEventListener('change', () => this.readDeployment(), { signal });
        click('deployNow', () => {
            this.readDeployment();
            if (s.deploy()) {
                this.audio.resume();
                this.show('play');
                this.input.requestLook();
            }
            else
                this.updateTactical();
        });
        click('zoomIn', () => {
            this.map.zoom = (0, math_1.clamp)(this.map.zoom * 1.25, 1, 4);
        });
        click('zoomOut', () => {
            this.map.zoom = (0, math_1.clamp)(this.map.zoom / 1.25, 1, 4);
        });
        click('zoomReset', () => this.map.reset());
        click('fullscreen', () => {
            try {
                const request = document.fullscreenElement
                    ? document.exitFullscreen()
                    : document.documentElement.requestFullscreen();
                if (request)
                    void request.catch(() => { });
            }
            catch { }
        });
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.processEvents();
                this.flushProfile();
            }
        }, { signal });
        window.addEventListener('storage', (event) => {
            if (event.key === storage_1.profileKey && event.newValue)
                this.reportSave('PROFILE UPDATED IN ANOTHER TAB · THIS SESSION IS PROTECTED FROM OVERWRITE', true);
        }, { signal });
        window.addEventListener('resize', () => this.renderer.resize(), { signal });
        (0, dom_1.byId)('world').addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            this.fail('Graphics context lost. Reload to restart, and try a lower resolution.');
        }, { signal });
        window.addEventListener('pagehide', (event) => {
            this.processEvents();
            this.flushProfile();
            if (event.persisted) {
                this.pause();
                this.input.reset();
                cancelAnimationFrame(this.raf);
                this.raf = 0;
            }
            else
                this.dispose();
        }, { signal });
        window.addEventListener('pageshow', (event) => {
            if (event.persisted && !this.disposed) {
                this.clock.reset();
                this.input.reset();
                this.pause();
                this.start();
            }
        }, { signal });
    }
    updateSettingValue(id) {
        (0, settings_view_1.updateSettingValue)(id);
    }
    configureGraphics() {
        (0, settings_view_1.configureGraphics)(this.sim, this.renderer);
    }
    syncSettings() {
        (0, settings_view_1.syncSettings)(this.sim, this.renderer);
    }
    show(screen) {
        const s = this.sim;
        if (!(0, dom_1.byId)('actionDialog').hidden)
            this.closeDialog();
        s.setScreen(screen);
        if (screen === 'lab')
            this.lab.sync();
        if (screen === 'barracks') {
            const selector = (0, dom_1.byId)('checkpointChoice');
            selector.replaceChildren((0, dom_1.option)('latest', 'Saved profile'));
            for (const p of this.writer.checkpoints())
                selector.append((0, dom_1.option)(p.key, `${new Date(p.updatedAt).toLocaleString()} · ${p.profile.career?.name ?? 'OPERATIVE'} · ${p.profile.career?.xp ?? 0} XP`));
        }
        this.input.reset();
        if (screen !== 'play')
            this.input.releaseLook();
        const tactical = ['deployment', 'map', 'orders'].includes(screen);
        (0, dom_1.byId)('tactical').hidden = !tactical;
        (0, dom_1.byId)('overlay').hidden = tactical || screen === 'play';
        (0, dom_1.byId)('gameHUD').hidden = !s.started || !['play', 'map', 'orders'].includes(screen);
        document.body.classList.toggle('inPlay', screen === 'play');
        for (const page of document.querySelectorAll('[data-page]'))
            page.hidden = page.dataset.page !== screen;
        for (const button of document.querySelectorAll('[data-menu]')) {
            const selected = button.dataset.menu === screen;
            button.classList.toggle('selected', selected);
            if (selected)
                button.setAttribute('aria-current', 'page');
            else
                button.removeAttribute('aria-current');
        }
        (0, dom_1.byId)('homeResume').hidden = !s.started || s.ended;
        (0, dom_1.byId)('homeResume').classList.toggle('primary', s.started && !s.ended);
        (0, dom_1.byId)('deploy').classList.toggle('primary', !s.started || s.ended);
        document.body.classList.toggle('activeMatch', s.started && !s.ended);
        document.body.dataset.screen = screen;
        if (screen === 'play' && this.renderer.lighting)
            this.renderer.lighting.clock = 1;
        (0, dom_1.byId)('noMatch').hidden = s.started && !s.ended;
        (0, dom_1.byId)('carriedLoadout').hidden = !s.started;
        if (['home', 'loadouts', 'barracks', 'challenges', 'results'].includes(screen)) {
            this.refreshCareer();
            this.flushProfile();
        }
        this.closeScores();
        (0, dom_1.text)('profile', `${this.profile.games} matches · ${this.profile.wins} wins · ${this.profile.kills} kills`);
        if (tactical) {
            this.tacticalState.rosterPage = 0;
            this.screens.select('tactical', screen === 'orders' ? 'orders' : 'roster');
            this.updateTactical();
        }
        this.audio.sync();
        if (screen !== 'play') {
            const panel = tactical
                ? (0, dom_1.byId)('tactical')
                : (document.querySelector('[data-page]:not([hidden])') ?? (0, dom_1.byId)('overlay'));
            [
                ...panel.querySelectorAll('button:not(:disabled),select:not(:disabled),input:not(:disabled)'),
            ]
                .find((el) => !el.closest('[hidden]'))
                ?.focus({ preventScroll: true });
        }
    }
    pause() {
        this.processEvents();
        this.flushProfile();
        if (!this.sim.started || this.sim.ended || this.sim.loading)
            return;
        this.show('pause');
    }
    resume() {
        if (!this.sim.started || this.sim.ended || this.sim.loading)
            return;
        if (!this.sim.player.alive) {
            this.openTactical('deployment');
            return;
        }
        this.audio.resume();
        this.show('play');
        this.input.requestLook();
    }
    openTactical(screen) {
        if (!this.sim.started || this.sim.ended || this.sim.loading)
            return;
        if (!this.sim.player.alive)
            screen = 'deployment';
        if (screen === 'deployment') {
            (0, dom_1.byId)('spawnSelect').value =
                this.sim.spawnTarget === 'leader'
                    ? 'leader'
                    : `base:${this.sim.spawnChoice < 0 ? 1 : this.sim.spawnChoice}`;
            this.sim.selectedSquad = this.sim.player.squadId;
            this.sim.selectedRole =
                this.sim.squads[this.sim.player.squadId].leaderId === this.sim.player.id
                    ? 'leader'
                    : 'member';
            (0, dom_1.byId)('squadSelect').value = String(this.sim.selectedSquad);
            (0, dom_1.byId)('roleSelect').value = this.sim.selectedRole;
        }
        this.show(screen);
    }
    order(kind) {
        const point = this.map.selected ?? this.sim.player;
        const goal = this.sim.world.flags.reduce((best, f, i, all) => ((0, math_1.dist2)(point, f) < (0, math_1.dist2)(point, all[best]) ? i : best), this.sim.handling.objective);
        this.sim.issueOrder(kind === 'hold'
            ? {
                kind,
                position: { x: point.x, y: this.sim.world.groundAt(point.x, point.z), z: point.z },
            }
            : kind === 'objective'
                ? { kind, objective: goal }
                : { kind });
        this.updateTactical();
    }
    readDeployment() {
        const s = this.sim;
        s.selectedSquad = Number((0, dom_1.byId)('squadSelect').value);
        s.selectedRole = (0, dom_1.byId)('roleSelect').value === 'member' ? 'member' : 'leader';
        const spawn = (0, dom_1.byId)('spawnSelect').value;
        s.spawnTarget = spawn === 'leader' ? 'leader' : 'base';
        s.spawnChoice = spawn === 'leader' ? 1 : Number(spawn.split(':')[1]);
        const kit = (0, dom_1.byId)('loadout').value;
        if (kit in config_1.kits)
            s.settings.loadout = kit;
        s.spawnError = '';
        this.savePreferences();
        this.updateTactical();
    }
    updateTactical() {
        (0, tactical_view_1.updateTactical)(this.sim, this.tacticalState, () => this.timeLeft());
    }
    updateHUD() {
        (0, hud_view_1.updateHUD)(this.sim, this.renderer, () => this.timeLeft());
    }
    timeLeft() {
        const left = Math.max(0, this.sim.roundLimit - this.sim.simTime);
        return `${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}`;
    }
    closeScores() {
        const wasOpen = !(0, dom_1.byId)('scoreboard').hidden;
        (0, dom_1.byId)('scoreboard').hidden = true;
        (0, dom_1.byId)('overlay').inert = false;
        (0, dom_1.byId)('tactical').inert = false;
        (0, dom_1.byId)('gameHUD').inert = false;
        this.scoreFocus?.focus({ preventScroll: true });
        this.scoreFocus = null;
        if (this.sim.menuState === 'play' && this.renderer.lighting)
            this.renderer.lighting.clock = 1;
        if (wasOpen && this.sim.menuState === 'play')
            this.input.requestLook();
    }
    showScores() {
        if (!this.sim.started)
            return;
        this.scoreFocus = document.activeElement;
        this.input.reset();
        (0, dom_1.byId)('overlay').inert = true;
        (0, dom_1.byId)('tactical').inert = true;
        (0, dom_1.byId)('gameHUD').inert = true;
        (0, scoreboard_view_1.renderScores)(this.sim);
        (0, dom_1.byId)('scoreboard').hidden = false;
        this.input.releaseLook();
        (0, dom_1.byId)('closeScores').focus();
    }
    updateScores() {
        (0, scoreboard_view_1.updateScores)(this.sim);
    }
    processEvents() {
        for (const event of this.sim.events.splice(0)) {
            this.audio.consume(event);
            if (event.type === 'xp') {
                this.sim.roundPractice ||= this.sim.practiceInvulnerable || this.sim.practiceSupplies;
                if (this.sim.roundPractice)
                    continue;
                const before = (0, progression_1.progress)((0, progression_1.ensureCareer)(this.profile).xp).level;
                const itemBefore = event.itemId
                    ? (0, progression_1.progress)((0, progression_1.ensureItem)(this.profile, event.itemId).xp, 30, true).level
                    : 0;
                const completed = (0, progression_1.recordXp)(this.profile, event);
                this.matchXp += event.points + completed.reduce((n, a) => n + a.xp, 0);
                this.profileDirty = true;
                for (const a of completed)
                    this.sim.notify(`ASSIGNMENT COMPLETE · ${a.name.toUpperCase()} +${a.xp} XP`, this.sim.player.team);
                const after = (0, progression_1.progress)((0, progression_1.ensureCareer)(this.profile).xp).level;
                if (after > before)
                    this.sim.notify(`CAREER RANK ${after} UNLOCKED`, this.sim.player.team);
                if (event.itemId) {
                    const track = progression_1.itemTracks.find((t) => t.id === event.itemId);
                    if (track) {
                        const level = (0, progression_1.progress)((0, progression_1.ensureItem)(this.profile, track.id).xp, track.maxLevel, true).level;
                        if (level > itemBefore)
                            this.sim.notify(`${track.name} · MASTERY LEVEL ${level}`, this.sim.player.team);
                    }
                }
            }
            if (event.type === 'death' && !this.sim.player.alive)
                this.openTactical('deployment');
            if (event.type === 'revived' && this.sim.menuState === 'deployment')
                this.show('play');
            if (event.type === 'finished') {
                this.matchId ||= `${Date.now()}-${this.sim.world.seed}-${this.generation}`;
                const report = {
                    id: this.matchId,
                    endedAt: Date.now(),
                    seed: this.matchSeed || this.sim.settings.seed,
                    seconds: this.sim.simTime,
                    result: event.winner === null
                        ? 'draw'
                        : event.winner === (this.sim.player.team === 0)
                            ? 'victory'
                            : 'defeat',
                    score: this.sim.score,
                    xp: this.matchXp,
                    stats: { ...this.sim.roundStats },
                    medals: [],
                };
                if (!this.sim.roundPractice) {
                    const result = (0, progression_1.finishCareerMatch)(this.profile, report);
                    if (result.duplicate)
                        continue;
                    this.profileDirty = true;
                    this.flushProfile();
                }
                else {
                    report.xp = 0;
                    report.medals = [];
                }
                (0, dom_1.text)('roundTitle', event.winner === null ? 'DRAW' : event.winner ? 'AEGIS VICTORY' : 'CINDER VICTORY');
                (0, dom_1.text)('roundStats', `${this.sim.roundPractice ? 'PRACTICE · NO CAREER REWARDS · ' : ''}${event.reason === 'reserves' ? 'RESERVES EXHAUSTED' : event.reason === 'control' ? 'CONTROL GOAL REACHED' : 'TIME EXPIRED'} · ${Math.floor(this.sim.controlTime[0])}s : ${Math.floor(this.sim.controlTime[1])}s · ${this.sim.score} SCORE`);
                (0, career_1.renderDebrief)(report);
                this.show('results');
            }
        }
    }
    async boot() {
        await this.prepare(false);
    }
    async newRound() {
        this.audio.resume();
        await this.prepare(true);
    }
    preparation = null;
    preparationIsMatch = false;
    loadingJob = null;
    prepare(match) {
        if (this.disposed)
            return Promise.resolve();
        if (this.preparation) {
            if (match && !this.preparationIsMatch)
                return this.preparation.then(() => this.prepare(true));
            return this.preparation;
        }
        this.preparationIsMatch = match;
        this.preparation = this.runPreparation(match).finally(() => {
            this.preparation = null;
        });
        return this.preparation;
    }
    async runPreparation(match) {
        const token = ++this.generation, s = this.sim;
        this.processEvents();
        this.flushProfile();
        if (match) {
            s.testArena = s.settings.scenario;
            s.battleTeamSize = s.settings.teamSize;
            this.map.selected = null;
            this.map.reset();
            this.matchXp = 0;
            this.matchSeed = s.settings.seed;
            this.matchId = `${Date.now()}-${s.settings.seed}-${token}`;
            this.applyTuning();
        }
        s.loading = true;
        s.playing = false;
        this.input.reset();
        this.input.releaseLook();
        (0, dom_1.byId)('loading').hidden = false;
        (0, dom_1.byId)('loadProgress').removeAttribute('value');
        (0, dom_1.byId)('error').hidden = true;
        this.audio.sync();
        const breathe = () => new Promise((resolve) => requestAnimationFrame(() => resolve()));
        try {
            (0, dom_1.text)('loadLabel', 'GENERATING METROPOLIS');
            await breathe();
            if (this.disposed || token !== this.generation)
                return;
            const job = match ? s.resetSteps() : s.world.prepareSteps(s.settings.seed);
            this.loadingJob = job;
            let slices = 0;
            let done = false;
            while (!done) {
                const deadline = performance.now() + 8;
                do {
                    done = !!job.next().done;
                    slices++;
                } while (!done && performance.now() < deadline);
                (0, dom_1.text)('loadLabel', `PREPARING CITY / ${slices}`);
                if (!done)
                    await breathe();
                if (this.disposed || token !== this.generation) {
                    job.return();
                    return;
                }
            }
            this.loadingJob = null;
            this.renderer.drawMinimap();
            while (s.world.dirtyQueue.size) {
                s.world.rebuildPending(10);
                (0, dom_1.byId)('loadProgress').value =
                    100 * (1 - s.world.dirtyQueue.size / s.world.chunks.length);
                (0, dom_1.text)('loadLabel', `BUILDING CITY / ${s.world.chunks.length - s.world.dirtyQueue.size} OF ${s.world.chunks.length}`);
                await breathe();
                if (this.disposed || token !== this.generation)
                    return;
            }
            s.loading = false;
            (0, dom_1.byId)('loading').hidden = true;
            this.clock.reset();
            this.previous = performance.now();
            if (match) {
                this.syncSettings();
                this.openTactical('deployment');
            }
            else
                this.show('home');
        }
        catch (e) {
            this.loadingJob?.return();
            this.loadingJob = null;
            if (this.disposed || token !== this.generation)
                return;
            s.loading = false;
            this.fail(`Unable to build city: ${e instanceof Error ? e.message : String(e)}`);
        }
    }
    tick(dt) {
        const s = this.sim;
        if (this.disposed)
            return;
        try {
            (0, destruction_budget_1.beginDestructionFrame)(s);
            this.clock.advance(dt, () => s.playing && !s.loading, (step) => s.fixedUpdate(step));
            s.destructionBudget = null;
            this.processEvents();
            if (!(0, dom_1.byId)('scoreboard').hidden) {
                this.scoreClock += dt;
                if (this.scoreClock >= 1) {
                    this.scoreClock = 0;
                    this.updateScores();
                }
            }
            else
                this.scoreClock = 0;
            this.saveClock += dt;
            if (this.saveClock >= 2)
                this.flushProfile();
            if (!s.loading) {
                this.sim.renderAlpha = this.sim.playing ? this.clock.alpha : 1;
                if (s.menuState === 'play' && (0, dom_1.byId)('scoreboard').hidden) {
                    this.renderer.render(dt);
                    this.renderer.adaptiveResolution(dt);
                }
                else if (s.world.mapDirty &&
                    (s.menuState === 'map' || s.menuState === 'orders' || s.menuState === 'deployment')) {
                    this.renderer.drawMinimap();
                }
                if (this.sim.menuState === 'lab')
                    this.lab.update();
                this.uiTime += dt;
                if (this.uiTime >= 0.1) {
                    this.uiTime = 0;
                    this.updateHUD();
                    if (!(0, dom_1.byId)('tactical').hidden) {
                        this.updateTactical();
                        this.map.draw();
                    }
                }
            }
        }
        catch (e) {
            this.fail(`Game stopped: ${e instanceof Error ? e.message : String(e)}`);
        }
    }
    start() {
        if (this.raf || this.disposed)
            return;
        this.previous = performance.now();
        const frame = (now) => {
            if (this.disposed || this.halted)
                return;
            this.tick(Math.max(0, (now - this.previous) / 1000));
            this.previous = now;
            if (!this.halted)
                this.raf = requestAnimationFrame(frame);
        };
        this.raf = requestAnimationFrame(frame);
    }
    fail(message) {
        this.processEvents();
        this.flushProfile();
        this.halted = true;
        this.sim.playing = false;
        this.sim.loading = false;
        this.input.reset();
        this.input.releaseLook();
        this.audio.sync();
        (0, dom_1.byId)('loading').hidden = true;
        (0, dom_1.byId)('error').hidden = false;
        (0, dom_1.text)('error', `${message}\nReload the page to restart.`);
        (0, dom_1.byId)('error').focus();
        cancelAnimationFrame(this.raf);
        this.raf = 0;
    }
    dispose() {
        if (this.disposed)
            return;
        this.processEvents();
        this.flushProfile();
        this.disposed = true;
        this.generation++;
        this.loadingJob?.return();
        this.loadingJob = null;
        cancelAnimationFrame(this.raf);
        this.abort.abort();
        this.input.dispose();
        this.map.dispose();
        this.sim.dispose();
        this.renderer.dispose();
        this.audio.dispose();
    }
}
exports.App = App;

},
"src/ui/career.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCareer = renderCareer;
exports.renderDebrief = renderDebrief;
const config_1 = require("../core/config");
const progression_1 = require("../core/progression");
const dom_1 = require("./dom");
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const num = (n) => Math.floor(n).toLocaleString();
const bar = (ratio) => `<div class="xpBar"><i style="width:${Math.max(0, Math.min(100, ratio * 100))}%"></i></div>`;
const ribbon = (id, count) => {
    const m = progression_1.medalDefinitions.find((m) => m.id === id);
    return `<article class="medal ${count ? 'earned' : 'locked'}"><div class="ribbonIcon" aria-hidden="true">${count ? '◆' : '◇'}</div><b>${escape(m?.name ?? id)}</b><span>${count ? `${count} earned` : `${m?.threshold} ${m?.stat} in one round`}</span></article>`;
};
function paged(rows, key, size, state) {
    const count = Math.max(1, Math.ceil(rows.length / size));
    state[key] = Math.max(0, Math.min(count - 1, Number.isFinite(state[key]) ? Math.floor(state[key]) : 0));
    const element = (0, dom_1.byId)(`${key}Pager`), buttons = element.querySelectorAll('button');
    buttons[0].disabled = state[key] === 0;
    buttons[1].disabled = state[key] === count - 1;
    element.querySelector('output').textContent = `${state[key] + 1} / ${count}`;
    element.hidden = count === 1;
    return rows.slice(state[key] * size, (state[key] + 1) * size);
}
function renderCareer(profile, state = { item: 'ar30', assignments: 0, stats: 0, medals: 0, history: 0 }) {
    const c = (0, progression_1.ensureCareer)(profile), rank = (0, progression_1.progress)(c.xp), small = window.innerWidth < 700, short = window.innerHeight < 620;
    (0, dom_1.text)('headerRank', String(rank.level).padStart(2, '0'));
    (0, dom_1.text)('headerName', c.name);
    if (document.activeElement !== (0, dom_1.byId)('callsign'))
        (0, dom_1.byId)('callsign').value = c.name;
    (0, dom_1.byId)('careerSummary').innerHTML =
        `<div class="rankSummary"><strong>${String(rank.level).padStart(2, '0')}</strong><div><b>${escape(c.name)}</b><span>${num(c.xp)} XP</span></div></div>${bar(rank.ratio)}<div class="miniStats"><span><b>${num(profile.games)}</b>Matches</span><span><b>${num(profile.wins)}</b>Wins</span><span><b>${num(profile.kills)}</b>Kills</span></div>`;
    const active = [...progression_1.assignments].sort((a, b) => Number(c.claimed.includes(a.id)) - Number(c.claimed.includes(b.id)));
    (0, dom_1.byId)('homeAssignments').innerHTML = active
        .slice(0, 2)
        .map((a) => {
        const n = (0, progression_1.assignmentValue)(profile, a);
        return `<div class="miniAssignment"><div><b>${escape(a.name)}</b><span>${Math.min(n, a.target)} / ${a.target}</span></div>${bar(n / a.target)}</div>`;
    })
        .join('');
    (0, dom_1.byId)('homeMastery').innerHTML = progression_1.itemTracks
        .filter((t) => t.category === 'weapon')
        .sort((a, b) => (0, progression_1.ensureItem)(profile, b.id).xp - (0, progression_1.ensureItem)(profile, a.id).xp)
        .slice(0, 3)
        .map((t) => {
        const v = (0, progression_1.progress)((0, progression_1.ensureItem)(profile, t.id).xp, t.maxLevel, true);
        return `<div class="miniMastery"><b>${escape(t.name)}</b><span>Lv ${v.level}</span>${bar(v.ratio)}</div>`;
    })
        .join('');
    const selector = (0, dom_1.byId)('arsenalItem');
    if (selector.options.length !== progression_1.itemTracks.length)
        selector.replaceChildren(...progression_1.itemTracks.map((t) => (0, dom_1.option)(t.id, t.name)));
    const t = progression_1.itemTracks.find((t) => t.id === state.item) ?? progression_1.itemTracks[0];
    state.item = t.id;
    selector.value = t.id;
    const item = (0, progression_1.ensureItem)(profile, t.id), v = (0, progression_1.progress)(item.xp, t.maxLevel, true), unlocked = (0, progression_1.upgrades)(profile, t.id), chosen = unlocked.find((u) => u.id === item.equipped) ?? unlocked[0];
    const weapon = config_1.weapons.find((w) => w.id === t.id), index = config_1.weapons.findIndex((w) => w.id === t.id);
    const metrics = weapon
        ? `<div class="weaponMetrics"><span><b>${weapon.mag}</b>Magazine</span><span><b>${weapon.automatic ? 'Auto' : 'Semi'}</b>Fire mode</span><span><b>${weapon.zooms.join(' / ')}×</b>Optic</span><span><b>${weapon.range} m</b>Range</span></div>`
        : '';
    const comparison = weapon
        ? `<details class="weaponCompare"><summary>Compare ${index >= 4 ? 'sidearms' : 'primary weapons'}</summary><table><thead><tr><th>Weapon</th><th>Magazine</th><th>Range</th><th>Reload</th></tr></thead><tbody>${config_1.weapons
            .filter((_, i) => (index >= 4 ? i >= 4 : i < 4))
            .map((w) => `<tr${w === weapon ? ' class="selected"' : ''}><th>${escape(w.name.split(' / ')[0])}</th><td>${w.mag}</td><td>${w.range} m</td><td>${w.reload}s</td></tr>`)
            .join('')}</tbody></table><small>Base weapon values. Specialisation modifiers apply separately.</small></details>`
        : '';
    (0, dom_1.byId)('arsenal').innerHTML =
        `<article class="loadoutCard"><div class="equipmentArt ${t.category}"><div class="weaponShape shape${index}" aria-hidden="true"></div><b>${escape(t.name)}</b></div><div class="loadoutBody"><span class="eyebrow">${t.category} · Level ${v.level} / ${t.maxLevel}</span><h2>${escape(t.name)}</h2>${bar(v.ratio)}<small>${v.needed ? `${num(v.current)} / ${num(v.needed)} XP` : 'Mastery complete'}</small>${metrics}${comparison}<p>${escape(chosen?.description ?? '')}</p><label>Specialisation<select data-item="${t.id}" aria-label="${escape(t.name)} specialisation">${t.unlocks.map((u) => `<option value="${u.id}"${chosen?.id === u.id ? ' selected' : ''}${u.level > v.level ? ' disabled' : ''}>${escape(u.name)}${u.level > v.level ? ` · Lv ${u.level}` : ''}</option>`).join('')}</select></label><div class="unlockRow">${t.unlocks.map((u) => `<span class="${u.level <= v.level ? 'available' : 'locked'}">Lv ${u.level}</span>`).join('')}</div></div></article>`;
    (0, dom_1.byId)('assignments').innerHTML = paged(progression_1.assignments, 'assignments', small
        ? short || window.innerHeight < 720
            ? 1
            : 2
        : short
            ? 2
            : window.innerWidth > 1050
                ? 6
                : 4, state)
        .map((a) => {
        const n = (0, progression_1.assignmentValue)(profile, a), done = c.claimed.includes(a.id);
        return `<article class="assignmentCard ${done ? 'completed' : ''}"><div class="assignmentTop"><span>${done ? 'Completed' : 'In progress'}</span><b>+${num(a.xp)} XP</b></div><h2>${escape(a.name)}</h2><p>${escape(a.description)}</p>${bar(n / a.target)}<div class="assignmentBottom">${num(Math.min(n, a.target))} / ${num(a.target)}</div></article>`;
    })
        .join('');
    const cells = [
        ['Rank', rank.level],
        ['Career XP', num(c.xp)],
        ['Kills', profile.kills],
        ['Assists', c.stats.assists ?? 0],
        ['Captures', c.stats.captures ?? 0],
        ['Revives', c.stats.revives ?? 0],
        ['Headshots', c.stats.headshots ?? 0],
        ['Vehicles destroyed', c.stats.vehicleKills ?? 0],
        ['Deaths', c.stats.deaths ?? 0],
        ['Resupplies', c.stats.resupplies ?? 0],
        ['Heals', c.stats.heals ?? 0],
        ['Repairs', c.stats.repairs ?? 0],
    ];
    (0, dom_1.byId)('careerStats').innerHTML = paged(cells, 'stats', small ? 6 : short ? 8 : 12, state)
        .map(([label, value]) => `<article class="statCard"><strong>${value}</strong><span>${label}</span></article>`)
        .join('');
    (0, dom_1.byId)('medals').innerHTML = paged(progression_1.medalDefinitions, 'medals', small && window.innerHeight < 700 ? 4 : 6, state)
        .map((m) => ribbon(m.id, c.medals[m.id] ?? 0))
        .join('');
    const history = paged(c.history, 'history', short ? 2 : small ? 3 : 5, state);
    (0, dom_1.byId)('matchHistory').innerHTML = c.history.length
        ? `<div class="historyHeading"><span>Match</span><span>Result</span><span>K / D / A</span><span>Score / XP</span></div>${history.map((m) => `<article class="historyRow"><div><b>${escape(new Date(m.endedAt).toLocaleDateString())}</b><small>${Math.floor(m.seconds / 60)}:${String(Math.floor(m.seconds % 60)).padStart(2, '0')} · Seed ${m.seed}</small></div><b class="${m.result}">${m.result}</b><span>${m.stats.kills ?? 0} / ${m.stats.deaths ?? 0} / ${m.stats.assists ?? 0}</span><div><b>${num(m.score)} pts</b><small>+${num(m.xp)} XP · ${m.stats.captures ?? 0} captures</small></div></article>`).join('')}`
        : '<p class="emptyState">No completed matches.</p>';
}
function renderDebrief(report) {
    const contribution = (title, values) => `<section><h3 class="contributionTitle">${title}</h3><div class="debriefStats">${values.map(([label, value]) => `<span><b>${num(value)}</b>${label}</span>`).join('')}</div></section>`;
    (0, dom_1.byId)('roundXp').innerHTML =
        `<div><span class="eyebrow">XP EARNED</span><strong class="xpTotal">+${num(report.xp)}</strong><p>${num(report.score)} score · ${Math.floor(report.seconds / 60)} minutes in the field</p></div><div class="contributionGroups">${contribution('Combat', [
            ['Kills', report.stats.kills ?? 0],
            ['Assists', report.stats.assists ?? 0],
            ['Headshots', report.stats.headshots ?? 0],
        ])}${contribution('Objectives', [
            ['Captures', report.stats.captures ?? 0],
            ['Orders', report.stats.orders ?? 0],
        ])}${contribution('Team support', [
            ['Revives', report.stats.revives ?? 0],
            ['Heals', report.stats.heals ?? 0],
            ['Resupplies', report.stats.resupplies ?? 0],
            ['Repairs', report.stats.repairs ?? 0],
        ])}</div>`;
    (0, dom_1.byId)('roundMedals').innerHTML = report.medals.length
        ? report.medals.map((id) => ribbon(id, 1)).join('')
        : '<p class="emptyState">No ribbons earned.</p>';
}

},
"src/ui/dom.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.byId = byId;
exports.text = text;
exports.option = option;
exports.replaceRows = replaceRows;
function byId(id) {
    const el = document.getElementById(id);
    if (!el)
        throw Error(`Missing UI element: ${id}`);
    return el;
}
function text(id, value) {
    const el = byId(id), next = String(value);
    if (el.textContent !== next)
        el.textContent = next;
}
function option(value, label) {
    const el = document.createElement('option');
    el.value = value;
    el.textContent = label;
    return el;
}
function replaceRows(container, rows) {
    const old = [...container.children];
    rows.forEach((value, i) => {
        const el = old[i] ?? document.createElement('div');
        if (el.textContent !== value)
            el.textContent = value;
        if (!el.parentElement)
            container.append(el);
    });
    for (let i = rows.length; i < old.length; i++)
        old[i].remove();
}

},
"src/ui/hud-layout.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hudLayout = hudLayout;
exports.applyHudLayout = applyHudLayout;
/** One CSS-pixel coordinate system for the DOM and canvas. Compact panels remain accessible. */
function hudLayout(width, height, touch = false, inset = 16, scale = 1, expanded = '') {
    scale = Math.max(1, Math.min(1.3, scale));
    const compact = width < 1000 * scale || height < 620 * scale;
    const gap = 12, side = Math.min(244 * scale, (width - inset * 2 - gap) / 2);
    const bottom = height - inset - (touch ? (height < 620 ? 128 : 184) : 20);
    const vitalsHeight = (compact ? 72 : 84) * scale;
    const vitals = {
        x: inset,
        y: Math.max(inset + 90, bottom - vitalsHeight),
        width: side,
        height: vitalsHeight,
    };
    const topWidth = Math.max(140, Math.min(560, width - inset * 2 - (compact ? 0 : 320)));
    const top = { x: (width - topWidth) / 2, y: compact ? 58 : inset, width: topWidth, height: 66 };
    const mapSize = Math.min(144 * scale, side);
    const map = { x: inset, y: vitals.y - gap - mapSize, width: mapSize, height: mapSize };
    const objective = {
        x: inset,
        y: compact ? top.y + top.height + gap : 112,
        width: side,
        height: 70 * scale,
    };
    const squadTop = objective.y + objective.height + gap;
    const squad = {
        x: inset,
        y: squadTop,
        width: side,
        height: Math.max(80, map.y - gap - squadTop),
    };
    let showMap = !compact, showSquad = !compact;
    const showObjective = !compact || objective.y + objective.height + gap <= vitals.y;
    if (compact && expanded) {
        const y = top.y + top.height + gap, available = Math.max(0, vitals.y - gap - y);
        if (expanded === 'map') {
            showMap = true;
            Object.assign(map, {
                y,
                width: Math.min(side, available),
                height: Math.min(side, available),
            });
        }
        else if (expanded === 'squad') {
            showSquad = true;
            Object.assign(squad, { y, width: side, height: available });
        }
    }
    const weaponHeight = Math.min((compact ? 206 : 260) * scale, Math.max(104, bottom - (top.y + top.height + gap)));
    const weaponWidth = Math.min(292 * scale, (width - inset * 2 - gap) / 2);
    return {
        vitals,
        weapon: {
            x: width - inset - weaponWidth,
            y: bottom - weaponHeight,
            width: weaponWidth,
            height: weaponHeight,
        },
        squad,
        map,
        objective,
        top,
        compassY: compact ? top.y + top.height + 9 : 101,
        showMap,
        showSquad,
        showObjective: showObjective && !(compact && expanded),
        compact,
        scale,
    };
}
function applyHudLayout(layout) {
    const root = document.getElementById('gameHUD');
    root?.classList.toggle('compactHUD', layout.compact);
    root?.style.setProperty('--hud-scale', String(layout.scale));
    for (const [id, rect] of [
        ['vitals', layout.vitals],
        ['weapon', layout.weapon],
        ['squadHUD', layout.squad],
        ['objectivePanel', layout.objective],
        ['top', layout.top],
    ]) {
        const el = document.getElementById(id);
        if (!el)
            continue;
        if (id === 'squadHUD')
            el.hidden = !layout.showSquad;
        if (id === 'objectivePanel')
            el.hidden = !layout.showObjective;
        Object.assign(el.style, {
            position: 'fixed',
            left: `${rect.x}px`,
            top: `${rect.y}px`,
            right: 'auto',
            bottom: 'auto',
            width: `${rect.width}px`,
            height: `${rect.height}px`,
            minWidth: '0',
            transform: 'none',
        });
    }
}

},
"src/ui/hud-model.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.squadNumber = squadNumber;
exports.captureProgress = captureProgress;
exports.hudViewModel = hudViewModel;
const config_1 = require("../core/config");
const loadout_1 = require("../core/loadout");
const math_1 = require("../core/math");
const player_actions_1 = require("../simulation/player-actions");
function squadNumber(s, id) {
    return String((id % Math.max(1, s.battleTeamSize / 10)) + 1).padStart(2, '0');
}
function captureProgress(value, team) {
    return (0, math_1.clamp)((1 + value * (team === 0 ? 1 : -1)) / 2, 0, 1);
}
function hudViewModel(s) {
    const p = s.player, weapon = config_1.weapons[s.weaponIndex], squad = s.squads[p.squadId];
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
        reload: p.vehicle || s.reloadTime <= 0
            ? 0
            : (0, math_1.clamp)(1 - s.reloadTime / (weapon.reload * s.weaponTuning[s.weaponIndex].reload), 0, 1),
        kit: (0, player_actions_1.kitStatus)(s),
        interaction: (0, player_actions_1.interactionStatus)(s),
        objective,
        objectiveDistance: Math.round(Math.sqrt((0, math_1.dist2)(p, objective))),
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
            : (0, loadout_1.loadout)(s).every((id) => s.reserves[id] === 0)
                ? 'RESERVES EMPTY'
                : '',
    };
}

},
"src/ui/hud-view.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHUD = updateHUD;
const config_1 = require("../core/config");
const loadout_1 = require("../core/loadout");
const math_1 = require("../core/math");
const dom_1 = require("./dom");
const hud_model_1 = require("./hud-model");
function updateHUD(sim, renderer, timeLeft) {
    const s = sim, p = s.player, f = s.world.flags[s.squads[p.squadId]?.route ?? s.handling.objective] ?? s.world.flags[4];
    if (!s.started)
        return;
    s.handling.objective = s.world.flags.indexOf(f);
    (0, dom_1.text)('blueTickets', `${Math.floor(s.controlTime[0])} / ${s.controlGoal}s`);
    (0, dom_1.text)('redTickets', `${Math.floor(s.controlTime[1])} / ${s.controlGoal}s`);
    (0, dom_1.text)('clock', timeLeft());
    (0, dom_1.byId)('blueTrack').style.width = `${(0, math_1.clamp)(s.controlTime[0] / s.controlGoal, 0, 1) * 50}%`;
    (0, dom_1.byId)('redTrack').style.width = `${(0, math_1.clamp)(s.controlTime[1] / s.controlGoal, 0, 1) * 50}%`;
    for (const [index, flag] of s.world.flags.entries()) {
        const el = (0, dom_1.byId)(index === 4 ? 'centreFlag' : `flag${String.fromCharCode(65 + index)}`);
        el.style.color =
            flag.owner === 0 ? 'var(--blue)' : flag.owner === 1 ? 'var(--red)' : 'var(--ink)';
        el.classList.toggle('contested', flag.contested);
        el.classList.toggle('assigned', flag === f);
    }
    (0, dom_1.text)('objectiveName', `SECTOR ${f.name} / ${f.title.toUpperCase()}`);
    (0, dom_1.text)('objectiveTitle', f.contested ? 'SECTOR CONTESTED' : f.owner === p.team ? 'DEFEND SECTOR' : 'CAPTURE SECTOR');
    const counts = [0, 1].map((t) => s.world.flags.filter((flag) => flag.owner === t).length);
    (0, dom_1.text)('objectiveDetail', `${Math.round(Math.sqrt((0, math_1.dist2)(p, f)))} m · SECTORS ${counts[0]} : ${counts[1]}`);
    const view = (0, hud_model_1.hudViewModel)(s), hp = view.health;
    renderer.hudState = view;
    (0, dom_1.text)('health', `${Math.ceil(hp)} ${p.vehicle ? 'ARMOUR' : 'HEALTH'}`);
    (0, dom_1.byId)('vitals').classList.toggle('lowHealth', hp <= 30);
    const reload = (0, dom_1.byId)('reloadProgress');
    reload.hidden = !!p.vehicle || s.reloadTime <= 0;
    reload.value = (0, math_1.clamp)(1 - s.reloadTime / (config_1.weapons[s.weaponIndex].reload * s.weaponTuning[s.weaponIndex].reload), 0, 1);
    (0, dom_1.byId)('healthbar').style.width = `${(0, math_1.clamp)(hp, 0, 100)}%`;
    (0, dom_1.text)('stats', `${s.kills} K / ${s.deaths} D / ${s.roundStats.assists ?? 0} A · ${s.score} PTS`);
    (0, dom_1.text)('stance', p.vehicle
        ? 'ARMOURED'
        : s.handling.ready > 0
            ? 'READYING'
            : p.crouched
                ? 'CROUCHED'
                : s.handling.sprint > 0.5
                    ? 'SPRINTING'
                    : s.aimAmount > 0.8
                        ? 'AIMING'
                        : 'READY');
    (0, dom_1.text)('gunname', p.vehicle ? 'APC / 40 mm CANNON' : config_1.weapons[s.weaponIndex].name);
    (0, dom_1.text)('ammo', view.ammo);
    (0, dom_1.text)('ammoReserve', view.reserve);
    (0, dom_1.text)('reloadLabel', s.reloadTime > 0 && !p.vehicle ? `RELOADING · ${s.reloadTime.toFixed(1)}s` : '');
    (0, dom_1.byId)('ammo').classList.toggle('lowAmmo', !p.vehicle && s.ammo[s.weaponIndex] <= Math.ceil(config_1.weapons[s.weaponIndex].mag * 0.2));
    (0, dom_1.text)('inventory', `${s.grenades} FRAG · ${s.smokeGrenades} SMOKE`);
    (0, dom_1.text)('kitLabel', view.kit.label);
    (0, dom_1.text)('kitState', view.kit.cooldown > 0
        ? `${Math.ceil(view.kit.cooldown)}s · RECHARGING`
        : view.kit.available
            ? 'READY'
            : view.kit.reason);
    (0, dom_1.byId)('kitState').classList.toggle('warning', !view.kit.available);
    (0, dom_1.text)('supplyState', view.supply);
    (0, dom_1.text)('carriedLoadout', `CARRIED · ${s.activeKit.toUpperCase()} · ${config_1.weapons[s.equippedSecondary].name}`);
    const kitAction = (0, dom_1.byId)('kitAction');
    kitAction.disabled = !view.kit.available;
    kitAction.title = view.kit.reason || view.kit.label;
    const squadRows = (0, dom_1.byId)('hudRoster');
    while (squadRows.children.length > view.squad.length)
        squadRows.lastElementChild?.remove();
    for (let i = 0; i < view.squad.length; i++) {
        const member = view.squad[i], row = squadRows.children[i] ??
            squadRows.appendChild(document.createElement('div'));
        row.className = `hudSquadRow${member.self ? ' self' : ''}${member.state === 'DOWN' ? ' down' : ''}`;
        const label = `${member.name} · ${member.kit} · ${member.state}`;
        if (row.textContent !== label)
            row.textContent = label;
    }
    const equipped = (0, loadout_1.loadout)(s), weapon = config_1.weapons[s.weaponIndex];
    for (const b of document.querySelectorAll('[data-weapon-slot]')) {
        const slot = Number(b.dataset.weaponSlot), index = equipped[slot];
        b.textContent = `${slot + 1} ${index === undefined ? 'KIT' : config_1.weapons[index].name.split(' / ')[0]}`;
        b.title = slot === 2 ? loadout_1.equipmentNames[s.activeKit] : slot === 0 ? 'Primary weapon' : 'Sidearm';
        b.classList.toggle('selected', index === s.weaponIndex);
        b.setAttribute('aria-pressed', String(index === s.weaponIndex));
        b.disabled = !s.acceptsInput || !!p.vehicle;
    }
    (0, dom_1.text)('weaponStatus', p.vehicle
        ? 'CANNON'
        : s.handling.ready > 0
            ? 'DRAWING'
            : `${weapon.automatic ? 'AUTO' : 'SEMI'} · ${(0, loadout_1.zoomFor)(s)}×${weapon.zooms.length > 1 ? ' · X ZOOM' : ''}`);
    document.body.classList.toggle('scopedView', s.acceptsInput && (0, loadout_1.scoped)(s) && s.aimAmount > 0.72);
    (0, dom_1.byId)('fieldTip').hidden = !s.acceptsInput || s.simTime > 16 || s.input.aim || s.touch;
    (0, dom_1.byId)('practiceBadge').hidden = !s.roundPractice;
    (0, dom_1.replaceRows)((0, dom_1.byId)('feed'), s.feed.map((f) => f.text));
    const awards = new Map();
    for (const event of s.xpFeed)
        awards.set(event.label, (awards.get(event.label) ?? 0) + event.points);
    (0, dom_1.replaceRows)((0, dom_1.byId)('xpFeed'), [...awards].slice(-3).map(([label, points]) => `${label} +${points}`));
    const squad = s.squads[p.squadId];
    if (squad) {
        (0, dom_1.text)('squadName', `SQUAD ${(0, hud_model_1.squadNumber)(s, squad.id)} · ${squad.leaderId === p.id ? 'LEADER' : 'MEMBER'}`);
        (0, dom_1.text)('squadStatus', `${squad.memberIds.filter((id) => s.actors[id].alive).length}/10 ACTIVE · ${squad.order.kind.toUpperCase()}${squad.blocked ? ' / BLOCKED' : ''}`);
    }
    const q = view.interaction;
    const hint = q.label
        ? `E · ${q.label}${q.available ? '' : ` — ${q.reason}`}`
        : s.acceptsInput && !s.touch && !document.pointerLockElement
            ? 'Click to capture mouse · drag to look if unavailable'
            : '';
    (0, dom_1.text)('hint', hint);
    (0, dom_1.byId)('hint').hidden = !hint;
    (0, dom_1.byId)('hint').classList.toggle('unavailable', !!q.label && !q.available);
    (0, dom_1.text)('performance', `${renderer.displayFPS} FPS · ${s.actors.filter((a) => a.alive).length} ACTIVE · RESERVES ${s.tickets[0]}:${s.tickets[1]}${s.destructionStats.pendingBodies ? ` · PHYSICS ${Math.round(s.destructionStats.oldestDebt * 1000)} ms BEHIND` : ''}`);
    (0, dom_1.byId)('aim').classList.toggle('active', s.input.aim);
    (0, dom_1.byId)('crouch').classList.toggle('active', s.input.crouch);
}

},
"src/ui/lab.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldLab = void 0;
const config_1 = require("../core/config");
const scenarios_1 = require("../core/scenarios");
const storage_1 = require("../platform/storage");
const equipment_1 = require("../simulation/equipment");
const npc_state_1 = require("../simulation/npc-state");
const dom_1 = require("./dom");
/** App owns this screen, its input state, listeners and restart path. */
class FieldLab {
    app;
    scene;
    constructor(app, scene, signal) {
        this.app = app;
        this.scene = scene;
        const sim = app.sim;
        (0, dom_1.byId)('labReport').addEventListener('change', () => this.update(), { signal });
        (0, dom_1.byId)('labClose').addEventListener('click', () => app.closeLab(), { signal });
        (0, dom_1.byId)('labRestart').addEventListener('click', () => app.show('confirm'), { signal });
        (0, dom_1.byId)('labReposition').addEventListener('click', () => {
            if (!sim.started || sim.ended || !sim.player.alive) {
                (0, dom_1.text)('labActionStatus', 'Deploy a living soldier before repositioning.');
                return;
            }
            const result = sim.safeSpawn(sim.player, true);
            if (result)
                sim.roundPractice = true;
            sim.spatial();
            this.update();
            (0, dom_1.text)('labActionStatus', result
                ? 'Repositioned. Career XP is disabled for this round.'
                : 'No safe landing is available.');
        }, { signal });
        (0, dom_1.byId)('labCheckResult').hidden = true;
        (0, dom_1.byId)('labCheck').addEventListener('click', () => {
            const results = (0, dom_1.byId)('labCheckResult');
            if (!results.hidden) {
                results.hidden = true;
                (0, dom_1.byId)('labTelemetry').hidden = false;
                (0, dom_1.text)('labCheck', 'RUN CHECKS');
            }
            else {
                this.check();
                results.hidden = false;
                (0, dom_1.byId)('labTelemetry').hidden = true;
                (0, dom_1.text)('labCheck', 'BACK TO METRICS');
            }
        }, { signal });
        for (const [id, key] of [
            ['labScenario', 'scenario'],
            ['labPopulation', 'teamSize'],
        ])
            (0, dom_1.byId)(id).addEventListener('change', () => {
                const value = (0, dom_1.byId)(id).value;
                sim.settings = (0, storage_1.validateSettings)({
                    ...sim.settings,
                    [key]: key === 'teamSize' ? Number(value) : value,
                });
                app.savePreferences();
                app.syncSettings();
                this.sync();
            }, { signal });
        (0, dom_1.byId)('labInvulnerable').addEventListener('change', () => {
            sim.practiceInvulnerable = (0, dom_1.byId)('labInvulnerable').checked;
            sim.roundPractice ||= sim.practiceInvulnerable || sim.practiceSupplies;
            this.update();
        }, { signal });
        (0, dom_1.byId)('labSupplies').addEventListener('change', () => {
            sim.practiceSupplies = (0, dom_1.byId)('labSupplies').checked;
            sim.roundPractice ||= sim.practiceInvulnerable || sim.practiceSupplies;
            this.update();
        }, { signal });
    }
    sync() {
        const s = this.app.sim;
        (0, dom_1.byId)('labScenario').value = s.settings.scenario;
        (0, dom_1.byId)('labPopulation').value = String(s.settings.teamSize);
        (0, dom_1.byId)('labInvulnerable').checked = s.practiceInvulnerable;
        (0, dom_1.byId)('labSupplies').checked = s.practiceSupplies;
        this.update();
    }
    snapshot() {
        const s = this.app.sim, live = s.actors.filter((a) => a.alive), tasks = {};
        let oldestDecision = 0;
        for (const a of live)
            if (!a.player) {
                const b = (0, npc_state_1.npcState)(a);
                if (b.task)
                    tasks[b.task.kind] = (tasks[b.task.kind] ?? 0) + 1;
                oldestDecision = Math.max(oldestDecision, s.simTime - b.lastThink);
            }
        return {
            version: '0.6.1',
            scenario: s.testArena,
            simulationSeconds: s.simTime,
            population: s.actors.length,
            alive: live.length,
            squads: s.squads.length,
            equipment: {
                smoke: s.smokeClouds.length,
                deployables: s.deployables.length,
                player: {
                    weapon: config_1.weapons[s.weaponIndex].id,
                    magazines: [...s.ammo],
                    reserves: [...s.reserves],
                    secondary: s.equippedSecondary,
                    smoke: s.smokeGrenades,
                },
            },
            squad: (s.squads[s.player.squadId]?.memberIds ?? []).map((id) => {
                const a = s.actors[id], b = (0, npc_state_1.npcState)(a);
                return {
                    id,
                    kit: a.kit,
                    alive: a.alive,
                    task: b.task ? `${b.task.kind} / ${b.task.phase}` : a.action || a.tactic,
                    weapon: config_1.weapons[a.activeWeapon]?.id,
                    rockets: a.rockets,
                    grenades: a.fragCharges,
                    smoke: a.smokes,
                };
            }),
            tasks,
            reservations: (0, npc_state_1.reservationCount)(s),
            oldestDecision,
            aid: { ...s.testStats },
            navigation: {
                ...s.navigationStats,
                pending: s.world.navDirty || !!s.world.navigationTask,
                sourceRevision: s.world.navRevision,
                publishedSourceRevision: s.world.publishedNavSourceRevision,
            },
            destruction: {
                ...s.destructionStats,
                bodies: s.rubble.length,
                voxels: s.rubble.reduce((n, b) => n + b.voxels.length, 0),
            },
            meshing: { ...s.world.meshStats },
            graphics: {
                fps: this.scene.displayFPS,
                shadows: !!(this.scene.lighting?.shadows && this.scene.lighting?.available),
            },
            practice: { invulnerable: s.practiceInvulnerable, supplies: s.practiceSupplies },
        };
    }
    update() {
        if (this.app.sim.menuState !== 'lab')
            return;
        const d = this.snapshot(), s = this.app.sim;
        (0, dom_1.text)('labTelemetry', `${(0, scenarios_1.scenario)(s.testArena).name} · ${d.population} soldiers / ${d.alive} active\n${d.squads} squads · ${d.graphics.fps} FPS\nPhysics: ${d.destruction.bodies} bodies / ${d.destruction.voxels.toLocaleString()} cells\nOldest physics debt: ${Math.round(d.destruction.oldestDebt * 1000)} ms\nLast physical progress: ${d.destruction.staleTime.toFixed(2)} s · steps ${d.destruction.advancedSteps}\nTerrain meshes queued: ${d.meshing.pending}\nNavigation: ${d.navigation.pending ? 'rebuilding' : 'published'} · ${d.navigation.expanded} local nodes\nLocal routes completed: ${d.navigation.completed} · lift trips: ${d.navigation.liftTrips}`);
        (0, dom_1.text)('labAI', `Active aid tasks: ${Object.entries(d.tasks)
            .map(([k, v]) => `${k.toLowerCase()} ${v}`)
            .join(' / ') || 'none'}\nReservations: ${d.reservations}\nRevives ${d.aid.revives} · heals ${d.aid.heals} · repairs ${d.aid.repairs} · supplies ${d.aid.resupplies}\nRockets ${d.aid.rockets} · frags ${d.aid.grenades} · sidearm shots ${d.aid.sidearmShots}\nSmoke ${d.equipment.smoke} · medical bags ${d.aid.medicalBags} · ammo crates ${d.aid.ammoCrates}\nFriendly shots withheld: ${d.aid.shotsBlocked}\nOldest decision: ${Math.max(0, d.oldestDecision).toFixed(2)} s`);
        if ((0, dom_1.byId)('labReport').value === 'squad')
            (0, dom_1.text)('labAI', d.squad
                .map((a) => `${String(a.id).padStart(2, '0')} ${a.kit?.slice(0, 3).toUpperCase().padEnd(3)}  ${a.alive ? (a.task || 'ADVANCE').slice(0, 28) : 'DOWN'}`)
                .join('\n') || 'Start a battle to inspect your squad.');
        (0, dom_1.text)('practiceNotice', s.roundPractice
            ? 'PRACTICE ROUND · CAREER XP DISABLED'
            : 'STANDARD RULES · CAREER XP ENABLED');
        (0, dom_1.byId)('labReposition').disabled = !s.started || s.ended || !s.player.alive;
    }
    check() {
        const s = this.app.sim, checks = [
            [
                'Player magazines',
                s.ammo.every((n, i) => Number.isInteger(n) && n >= 0 && n <= config_1.weapons[i].mag),
            ],
            [
                'NPC equipment',
                s.actors.every((a) => a.player ||
                    !a.alive ||
                    (a.clip >= 0 &&
                        a.clip <= config_1.weapons[a.primaryWeapon].mag &&
                        a.secondaryClip >= 0 &&
                        a.secondaryClip <= config_1.weapons[a.secondaryWeapon].mag &&
                        a.rockets >= 0 &&
                        a.rockets <= 3 &&
                        a.fragCharges >= 0 &&
                        a.fragCharges <= 2 &&
                        a.smokes >= 0 &&
                        a.smokes <= 2)),
            ],
            [
                'Smoke and supplies',
                s.smokeClouds.length <= equipment_1.equipmentLimits.smokeClouds &&
                    s.deployables.length <= equipment_1.equipmentLimits.deployables,
            ],
            ['Actor coordinates', s.actors.every((a) => [a.x, a.y, a.z, a.hp].every(Number.isFinite))],
            [
                'Vehicle ownership',
                s.vehicles.every((v) => !v.driver || (v.driver.alive && v.driver.vehicle === v)) &&
                    s.actors.every((a) => !a.vehicle || a.vehicle.driver === a),
            ],
            [
                'Squad membership',
                new Set(s.squads.flatMap((q) => q.memberIds)).size === s.actors.length,
            ],
            [
                'Rubble state',
                s.rubble.every((b) => [b.x, b.y, b.z, b.pendingDt, b.mass].every(Number.isFinite) && b.pendingDt >= 0),
            ],
        ];
        (0, dom_1.text)('labCheckResult', checks.map(([label, ok]) => `${ok ? 'PASS' : 'FAIL'} / ${label}`).join('\n'));
    }
}
exports.FieldLab = FieldLab;

},
"src/ui/scoreboard-view.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateScores = updateScores;
exports.renderScores = renderScores;
const dom_1 = require("./dom");
const hud_model_1 = require("./hud-model");
function updateScores(sim) {
    const s = sim, p = s.player;
    const peers = s.actors.filter((a) => a.team === p.team);
    const rank = 1 +
        peers.filter((a) => a.frags > p.frags ||
            (a.frags === p.frags && (a.deaths < p.deaths || (a.deaths === p.deaths && a.id < p.id)))).length;
    (0, dom_1.text)('scoreSummary', `YOU · #${rank} / ${peers.length} · ${s.kills} K / ${s.deaths} D · ${s.score} PTS`);
    for (const row of (0, dom_1.byId)('scoreContent').querySelectorAll('[data-score-actor]')) {
        const a = s.actors[Number(row.dataset.scoreActor)];
        if (!a)
            continue;
        const label = `${a.player ? 'YOU' : String((a.id % s.battleTeamSize) + 1).padStart(2, '0')} · ${(a.kit ?? 'assault').toUpperCase()}${a.alive ? '' : ' · DOWN'}`;
        if (row.firstElementChild?.textContent !== label)
            row.firstElementChild.textContent = label;
        const score = `${a.frags} / ${a.deaths}`;
        if (row.lastElementChild?.textContent !== score)
            row.lastElementChild.textContent = score;
    }
    [...(0, dom_1.byId)('scoreContent').children].forEach((section, team) => {
        const heading = section.querySelector('h3');
        if (heading)
            heading.textContent = `${team === 0 ? 'AEGIS' : 'CINDER'} · ${s.tickets[team]} RESERVES`;
    });
}
function renderScores(sim) {
    const s = sim, content = (0, dom_1.byId)('scoreContent');
    const ranked = s.actors
        .filter((a) => a.team === s.player.team)
        .sort((a, b) => b.frags - a.frags || a.deaths - b.deaths || a.id - b.id);
    (0, dom_1.text)('scoreSummary', `YOU · #${ranked.findIndex((a) => a === s.player) + 1} / ${ranked.length} · ${s.kills} K / ${s.deaths} D · ${s.score} PTS`);
    content.replaceChildren();
    for (const team of [0, 1]) {
        const section = document.createElement('section'), heading = document.createElement('h3'), list = document.createElement('div');
        heading.textContent = `${team === 0 ? 'AEGIS' : 'CINDER'} · ${s.tickets[team]} RESERVES`;
        list.className = 'scoreList';
        list.tabIndex = 0;
        list.setAttribute('aria-label', `${team === 0 ? 'AEGIS' : 'CINDER'} roster`);
        const actors = s.actors
            .filter((a) => a.team === team)
            .sort((a, b) => a.squadId - b.squadId || b.frags - a.frags || a.id - b.id);
        let squad = -1;
        for (const a of actors) {
            if (a.squadId !== squad) {
                squad = a.squadId;
                const group = document.createElement('h4');
                group.textContent = `SQUAD ${(0, hud_model_1.squadNumber)(s, squad)}`;
                list.append(group);
            }
            const row = document.createElement('div'), name = document.createElement('span'), score = document.createElement('strong');
            row.className = `scoreRow${a.player ? ' self' : ''}`;
            row.dataset.scoreActor = String(a.id);
            name.textContent = `${a.player ? 'YOU' : String((a.id % s.battleTeamSize) + 1).padStart(2, '0')} · ${(a.kit ?? 'assault').toUpperCase()}${a.alive ? '' : ' · DOWN'}`;
            score.textContent = `${a.frags} / ${a.deaths}`;
            row.append(name, score);
            list.append(row);
        }
        section.append(heading, list);
        content.append(section);
    }
}

},
"src/ui/screen-layout.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenLayout = void 0;
/** Fixed page chrome with keyboard-accessible, scrollable tab panels. */
class ScreenLayout {
    refresh;
    career = {
        item: 'ar30',
        assignments: 0,
        stats: 0,
        medals: 0,
        history: 0,
    };
    constructor(signal, refresh) {
        this.refresh = refresh;
        const groups = new Set();
        for (const b of document.querySelectorAll('[data-tab]')) {
            const [group, value] = b.dataset.tab.split(':');
            groups.add(group);
            b.id = `tab-${group}-${value}`;
            b.setAttribute('role', 'tab');
            b.setAttribute('aria-controls', `panel-${group}-${value}`);
        }
        for (const panel of document.querySelectorAll('[data-panel]')) {
            const [group, value] = panel.dataset.panel.split(':');
            panel.id = `panel-${group}-${value}`;
            panel.setAttribute('role', 'tabpanel');
            panel.tabIndex = 0;
            panel.setAttribute('aria-labelledby', `tab-${group}-${value}`);
        }
        for (const group of groups) {
            const value = document
                .querySelector(`[data-tab^="${group}:"]`)
                .dataset.tab.split(':')[1];
            this.select(group, value);
        }
        document.addEventListener('click', (e) => {
            if (!(e.target instanceof HTMLElement))
                return;
            const b = e.target.closest('[data-tab],[data-page-step]');
            if (!b)
                return;
            if (b.dataset.tab) {
                const [group, value] = b.dataset.tab.split(':');
                this.select(group, value);
            }
            if (b.dataset.pageStep) {
                const [key, step] = b.dataset.pageStep.split(':');
                if (key === 'assignments' || key === 'stats' || key === 'medals' || key === 'history') {
                    this.career[key] = Math.max(0, this.career[key] + Number(step));
                    this.refresh();
                }
            }
        }, { signal });
        document.addEventListener('keydown', (e) => {
            if (!(e.target instanceof HTMLElement))
                return;
            const b = e.target.closest('[data-tab]');
            if (!b || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.code))
                return;
            e.preventDefault();
            const group = b.dataset.tab.split(':')[0];
            const buttons = [
                ...document.querySelectorAll(`[data-tab^="${group}:"]`),
            ].filter((b) => !b.hidden && !b.disabled);
            const i = buttons.indexOf(b);
            const next = e.code === 'Home'
                ? 0
                : e.code === 'End'
                    ? buttons.length - 1
                    : (i + (e.code === 'ArrowLeft' ? -1 : 1) + buttons.length) % buttons.length;
            const target = buttons[next];
            if (!target)
                return;
            this.select(group, target.dataset.tab.split(':')[1]);
            target.focus({ preventScroll: true });
        }, { signal });
        document.getElementById('arsenalItem').addEventListener('change', (e) => {
            this.career.item = e.target.value;
            this.refresh();
        }, { signal });
        window.addEventListener('resize', () => this.refresh(), { signal });
    }
    select(group, value) {
        const key = `${group}:${value}`;
        if (!document.querySelector(`[data-panel="${key}"]`))
            return;
        for (const b of document.querySelectorAll(`[data-tab^="${group}:"]`)) {
            const selected = b.dataset.tab === key;
            b.classList.toggle('selected', selected);
            b.setAttribute('aria-selected', String(selected));
            b.tabIndex = selected ? 0 : -1;
        }
        for (const panel of document.querySelectorAll(`[data-panel^="${group}:"]`))
            panel.hidden = panel.dataset.panel !== key;
    }
}
exports.ScreenLayout = ScreenLayout;

},
"src/ui/settings-view.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSettingValue = updateSettingValue;
exports.configureGraphics = configureGraphics;
exports.syncSettings = syncSettings;
const scenarios_1 = require("../core/scenarios");
const dom_1 = require("./dom");
function updateSettingValue(id) {
    const value = Number((0, dom_1.byId)(id).value);
    (0, dom_1.text)(`${id}Value`, id === 'fov'
        ? `${value}°`
        : id === 'volume'
            ? `${Math.round(value * 100)}%`
            : `${value.toFixed(2)}×`);
}
function configureGraphics(sim, renderer) {
    const l = renderer.lighting, s = sim.settings;
    if (l) {
        l.textures = s.textures;
        l.shadows = s.shadows;
        l.setPreset(s.lighting);
    }
}
function syncSettings(sim, renderer) {
    const s = sim.settings;
    for (const [id, key] of Object.entries({
        mapSeed: 'seed',
        duration: 'minutes',
        quality: 'quality',
        hudScale: 'hudScale',
        distance: 'distance',
        fov: 'fov',
        brightness: 'brightness',
        sensitivity: 'sensitivity',
        adsSensitivity: 'adsSensitivity',
        volume: 'volume',
        aimMode: 'aimMode',
        secondary: 'secondary',
        arsenalSecondary: 'secondary',
        arsenalClass: 'loadout',
        loadout: 'loadout',
        scenario: 'scenario',
        battleSize: 'teamSize',
        lighting: 'lighting',
    })) {
        (0, dom_1.byId)(id).value = String(s[key]);
    }
    for (const [id, key] of Object.entries({
        motion: 'motion',
        adaptive: 'adaptive',
        touchMode: 'touch',
        textures: 'textures',
        shadows: 'shadows',
    }))
        (0, dom_1.byId)(id).checked = Boolean(s[key]);
    for (const id of ['fov', 'brightness', 'sensitivity', 'adsSensitivity', 'volume'])
        updateSettingValue(id);
    document.body.classList.toggle('touch', s.touch);
    (0, dom_1.text)('scenarioName', (0, scenarios_1.scenario)(s.scenario).name.toUpperCase());
    (0, dom_1.text)('scenarioMeta', s.scenario === 'frontline' ? 'Central district' : 'Full city');
    configureGraphics(sim, renderer);
}

},
"src/ui/tactical-map.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TacticalMap = void 0;
const config_1 = require("../core/config");
const math_1 = require("../core/math");
const scenarios_1 = require("../core/scenarios");
const perception_1 = require("../simulation/perception");
const theme_1 = require("./theme");
class TacticalMap {
    canvas;
    sim;
    terrain;
    selectSpawn;
    theme = (0, theme_1.canvasTheme)();
    zoom = 1;
    selected = null;
    panX = 0;
    panY = 0;
    pointer = null;
    lastX = 0;
    lastY = 0;
    moved = false;
    startX = 0;
    startY = 0;
    abort = new AbortController();
    constructor(canvas, sim, terrain, selectSpawn) {
        this.canvas = canvas;
        this.sim = sim;
        this.terrain = terrain;
        this.selectSpawn = selectSpawn;
        const signal = this.abort.signal;
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.zoom = (0, math_1.clamp)(this.zoom * (e.deltaY < 0 ? 1.15 : 0.87), 1, 4);
        }, { signal, passive: false });
        canvas.addEventListener('pointerdown', (e) => {
            if (this.pointer !== null)
                return;
            this.pointer = e.pointerId;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
            this.moved = false;
            canvas.setPointerCapture(e.pointerId);
        }, { signal });
        canvas.addEventListener('pointermove', (e) => {
            if (e.pointerId !== this.pointer)
                return;
            const dx = e.clientX - this.lastX, dy = e.clientY - this.lastY;
            this.moved ||= Math.hypot(e.clientX - this.startX, e.clientY - this.startY) > 3;
            this.panX += dx;
            this.panY += dy;
            this.lastX = e.clientX;
            this.lastY = e.clientY;
        }, { signal });
        canvas.addEventListener('pointerup', (e) => {
            if (e.pointerId !== this.pointer)
                return;
            this.pointer = null;
            if (this.moved)
                return;
            const p = this.toWorld(e.clientX, e.clientY);
            if (p.x < 0 || p.x >= config_1.W || p.z < 0 || p.z >= config_1.D)
                return;
            this.selected = p;
            if (this.sim.menuState !== 'deployment') {
                this.sim.pingAt({ x: p.x, y: this.sim.world.groundAt(p.x, p.z), z: p.z });
                return;
            }
            const baseX = (0, scenarios_1.scenario)(this.sim.testArena).homes[this.sim.player.team];
            for (const [i, z] of (0, scenarios_1.scenario)(this.sim.testArena).gates.entries())
                if ((0, math_1.dist2)(p, { x: baseX, z }) < 100) {
                    this.selectSpawn(`base:${i}`);
                    return;
                }
            const squad = this.sim.squads[this.sim.selectedSquad], leader = squad && this.sim.actors[squad.leaderId];
            if (leader && (0, math_1.dist2)(p, leader) < 100)
                this.selectSpawn('leader');
        }, { signal });
        for (const type of ['pointercancel', 'lostpointercapture'])
            canvas.addEventListener(type, (e) => {
                if (e.pointerId !== this.pointer)
                    return;
                this.pointer = null;
            }, { signal });
    }
    reset() {
        this.zoom = 1;
        this.panX = this.panY = 0;
    }
    geometry() {
        const width = this.canvas.clientWidth || 700, height = this.canvas.clientHeight || 400, size = Math.min(width, height) - 30;
        this.panX = (0, math_1.clamp)(this.panX, (-size * (this.zoom - 1)) / 2, (size * (this.zoom - 1)) / 2);
        this.panY = (0, math_1.clamp)(this.panY, (-size * (this.zoom - 1)) / 2, (size * (this.zoom - 1)) / 2);
        return {
            width,
            height,
            size: size * this.zoom,
            x: (width - size * this.zoom) / 2 + this.panX,
            y: (height - size * this.zoom) / 2 + this.panY,
        };
    }
    toWorld(x, y) {
        const r = this.canvas.getBoundingClientRect(), g = this.geometry();
        return { x: ((x - r.left - g.x) / g.size) * config_1.W, z: ((y - r.top - g.y) / g.size) * config_1.D };
    }
    draw() {
        const c = this.canvas.getContext('2d');
        if (!c)
            return;
        const g = this.geometry(), dpr = Math.min(devicePixelRatio || 1, 2);
        if (this.canvas.width !== Math.round(g.width * dpr) ||
            this.canvas.height !== Math.round(g.height * dpr)) {
            this.canvas.width = Math.round(g.width * dpr);
            this.canvas.height = Math.round(g.height * dpr);
        }
        c.setTransform(dpr, 0, 0, dpr, 0, 0);
        c.fillStyle = this.theme.deep;
        c.fillRect(0, 0, g.width, g.height);
        c.drawImage(this.terrain, g.x, g.y, g.size, g.size);
        c.fillStyle = (0, theme_1.alphaColour)(this.theme.deep, 0.33);
        c.fillRect(g.x, g.y, g.size, g.size);
        const x = (v) => g.x + (v / config_1.W) * g.size, z = (v) => g.y + (v / config_1.D) * g.size;
        c.strokeStyle = this.theme.line;
        for (let i = 0; i <= 8; i++) {
            c.beginPath();
            c.moveTo(x(i * 64), g.y);
            c.lineTo(x(i * 64), g.y + g.size);
            c.moveTo(g.x, z(i * 64));
            c.lineTo(g.x + g.size, z(i * 64));
            c.stroke();
        }
        const squadId = this.sim.menuState === 'deployment' ? this.sim.selectedSquad : this.sim.player.squadId;
        for (const a of this.sim.actors) {
            if (!a.alive)
                continue;
            if (a.team !== this.sim.player.team &&
                ((0, math_1.dist2)(a, this.sim.player) > 625 ||
                    !(0, perception_1.canSee)(this.sim, this.sim.camera, { x: a.x, y: a.y + 1.5, z: a.z })))
                continue;
            c.fillStyle =
                a.team !== this.sim.player.team
                    ? this.theme.enemy
                    : a.squadId === squadId
                        ? this.theme.squad
                        : this.theme.ally;
            c.beginPath();
            c.arc(x(a.x), z(a.z), a.squadId === squadId ? 3 : 1.5, 0, Math.PI * 2);
            c.fill();
        }
        c.font = 'bold 12px system-ui';
        c.textAlign = 'center';
        for (const f of this.sim.world.flags) {
            c.strokeStyle = f.contested
                ? this.theme.warning
                : f.owner === 0
                    ? this.theme.ally
                    : f.owner === 1
                        ? this.theme.enemy
                        : this.theme.ink;
            c.lineWidth = f === this.sim.world.flags[this.sim.handling.objective] ? 3 : 1;
            c.beginPath();
            c.arc(x(f.x), z(f.z), (24 / config_1.W) * g.size, 0, Math.PI * 2);
            c.stroke();
            c.fillStyle = c.strokeStyle;
            c.fillText(f.name, x(f.x), z(f.z) + 4);
        }
        const baseX = (0, scenarios_1.scenario)(this.sim.testArena).homes[this.sim.player.team];
        for (const [i, bz] of (0, scenarios_1.scenario)(this.sim.testArena).gates.entries()) {
            c.fillStyle = this.theme.squad;
            c.fillRect(x(baseX) - 5, z(bz) - 5, 10, 10);
            c.fillText(['N', 'BASE', 'S'][i], x(baseX) + (baseX < 256 ? -20 : 20), z(bz) + 4);
        }
        for (const ping of this.sim.pings)
            if (ping.team === this.sim.player.team) {
                c.strokeStyle = ping.kind === 'enemy' ? this.theme.enemy : this.theme.warning;
                c.lineWidth = 2;
                c.strokeRect(x(ping.x) - 5, z(ping.z) - 5, 10, 10);
                c.fillStyle = c.strokeStyle;
                c.fillText(ping.kind === 'enemy' ? '!' : '◇', x(ping.x), z(ping.z) - 10);
            }
        if (this.selected) {
            c.strokeStyle = this.theme.ink;
            c.lineWidth = 2;
            c.strokeRect(x(this.selected.x) - 9, z(this.selected.z) - 9, 18, 18);
        }
        const squad = this.sim.squads[squadId], leader = squad && this.sim.actors[squad.leaderId];
        if (leader?.alive) {
            c.strokeStyle = this.theme.accent;
            c.strokeRect(x(leader.x) - 7, z(leader.z) - 7, 14, 14);
            c.fillStyle = this.theme.accent;
            c.fillText('SL', x(leader.x), z(leader.z) - 12);
        }
        if (squad?.order.kind === 'hold') {
            const p = squad.order.position;
            c.strokeStyle = this.theme.squad;
            c.strokeRect(x(p.x) - 8, z(p.z) - 8, 16, 16);
            c.fillStyle = this.theme.squad;
            c.fillText('HOLD', x(p.x), z(p.z) - 12);
        }
    }
    dispose() {
        this.abort.abort();
    }
}
exports.TacticalMap = TacticalMap;

},
"src/ui/tactical-view.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTactical = updateTactical;
const config_1 = require("../core/config");
const loadout_1 = require("../core/loadout");
const scenarios_1 = require("../core/scenarios");
const dom_1 = require("./dom");
function updateTactical(sim, state, timeLeft) {
    const s = sim, isDeployment = s.menuState === 'deployment', selector = (0, dom_1.byId)('squadSelect');
    const spawnSelect = (0, dom_1.byId)('spawnSelect'), operation = (0, scenarios_1.scenario)(s.testArena);
    for (let i = 0; i < 3; i++) {
        const gate = spawnSelect.querySelector(`option[value="base:${i}"]`);
        if (gate)
            gate.textContent = `${operation.name} / ${['North', 'Centre', 'South'][i]} gate`;
    }
    if (selector.options.length !== s.squads.filter((q) => q.team === s.player.team).length) {
        selector.replaceChildren(...s.squads
            .filter((q) => q.team === s.player.team)
            .map((q) => (0, dom_1.option)(String(q.id), `${q.team === 0 ? 'AEGIS' : 'CINDER'} ${String((q.id % Math.max(1, s.battleTeamSize / 10)) + 1).padStart(2, '0')}`)));
        selector.value = String(s.selectedSquad);
    }
    selector.disabled = !isDeployment;
    (0, dom_1.byId)('roleSelect').disabled = !isDeployment;
    (0, dom_1.byId)('roleLabel').hidden = !isDeployment;
    (0, dom_1.byId)('deploymentBar').hidden = !isDeployment;
    (0, dom_1.byId)('returnToGame').hidden = isDeployment;
    (0, dom_1.byId)('orderControls').hidden = isDeployment;
    (0, dom_1.text)('tacticalTitle', isDeployment ? 'DEPLOYMENT' : s.menuState === 'orders' ? 'SQUAD COMMAND' : 'TACTICAL MAP');
    (0, dom_1.text)('tacticalClock', `${timeLeft()} · ${s.initialDeployment ? 'AWAITING DEPLOYMENT' : 'BATTLE LIVE'}`);
    const squad = s.squads[isDeployment ? s.selectedSquad : s.player.squadId];
    if (!squad)
        return;
    const roster = (0, dom_1.byId)('roster');
    while (roster.children.length < 10)
        roster.append(document.createElement('div'));
    const rosterSize = 10;
    const rosterPages = Math.max(1, Math.ceil(squad.memberIds.length / rosterSize));
    state.rosterPage = Math.max(0, Math.min(rosterPages - 1, state.rosterPage));
    const ids = squad.memberIds.slice(state.rosterPage * rosterSize, (state.rosterPage + 1) * rosterSize);
    for (const row of roster.children)
        row.hidden = true;
    (0, dom_1.text)('rosterPage', `${state.rosterPage + 1} / ${rosterPages}`);
    (0, dom_1.byId)('rosterPrev').disabled = state.rosterPage === 0;
    (0, dom_1.byId)('rosterNext').disabled = state.rosterPage === rosterPages - 1;
    (0, dom_1.byId)('tab-tactical-orders').hidden = isDeployment;
    for (const [i, id] of ids.entries()) {
        const a = s.actors[id], row = roster.children[i];
        row.hidden = false;
        row.className = `rosterRow${a.player ? ' you' : ''}${a.alive ? '' : ' down'}`;
        const label = `${id === squad.leaderId ? '★ ' : ''}${a.player ? 'YOU' : `${a.team === 0 ? 'AEGIS' : 'CINDER'} ${String((id % s.battleTeamSize) + 1).padStart(3, '0')}`} · ${a.alive ? `${Math.ceil(a.hp)} HP` : (a.reviveUntil ?? 0) > s.simTime ? 'DOWN / REVIVABLE' : 'DEPLOYING'} · ${(a.kit ?? 'assault').toUpperCase()}`;
        if (row.textContent !== label)
            row.textContent = label;
    }
    const leader = squad.leaderId === s.player.id;
    for (const button of document.querySelectorAll('[data-order]')) {
        button.disabled = !leader || !s.player.alive;
        button.classList.toggle('selected', button.dataset.order === squad.order.kind);
        button.setAttribute('aria-pressed', String(button.dataset.order === squad.order.kind));
    }
    (0, dom_1.text)('orderStatus', `${squad.order.kind.toUpperCase()} / SECTOR ${s.world.flags[squad.route].name}${squad.routing ? ' · ROUTING' : squad.blocked ? ' · ROUTE BLOCKED / RETRYING' : ''}${leader ? '' : ' · Orders issued by squad leader'}`);
    if (isDeployment) {
        let reason = '';
        if (s.spawnTarget === 'leader') {
            if (s.selectedRole === 'leader')
                reason = 'Squad leaders deploy at base';
            else if (squad.leaderId === s.player.id)
                reason = 'Choose a base gate when handing over leadership';
            else
                reason = s.leaderSpawn({ ...s.player, squadId: squad.id }).reason;
        }
        if (s.tickets[s.player.team] <= 0)
            reason = 'No reserves available';
        else if (s.player.respawn > 0)
            reason = `REINFORCEMENTS IN ${Math.ceil(s.player.respawn)}s`;
        (0, dom_1.text)('spawnStatus', reason || s.spawnError || 'READY TO DEPLOY');
        (0, dom_1.byId)('deployNow').disabled = Boolean(reason) || s.player.alive;
        (0, dom_1.text)('kitDescription', `${(0, loadout_1.kitWeapons)(s.settings.loadout, s.settings.secondary)
            .map((i) => config_1.weapons[i].name.split(' / ')[0])
            .join(' · ')}`);
    }
}

},
"src/ui/theme.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canvasTheme = canvasTheme;
exports.alphaColour = alphaColour;
/** Canvas cannot resolve CSS var() expressions. Read the same semantic tokens once per view. */
function canvasTheme() {
    const style = typeof document === 'undefined' ? null : getComputedStyle(document.documentElement);
    const read = (name, fallback) => style?.getPropertyValue(name).trim() || fallback;
    return {
        ink: read('--ink', '#eef3fa'),
        muted: read('--muted', '#9cacc2'),
        line: read('--line', '#2a384d'),
        panel: read('--panel', '#101722f2'),
        deep: read('--deep', '#090d14'),
        accent: read('--accent', '#68d5e8'),
        ally: read('--blue', '#7cbcff'),
        enemy: read('--red', '#ff9479'),
        squad: read('--squad', '#a4d484'),
        warning: read('--warning', '#edc580'),
        danger: read('--danger', '#ff7d8d'),
        career: read('--career', '#b9a2ff'),
    };
}
function alphaColour(hex, alpha) {
    if (/^#[0-9a-f]{6,8}$/i.test(hex)) {
        const n = Number.parseInt(hex.slice(1, 7), 16);
        return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, alpha))})`;
    }
    return hex;
}

},
"src/world/navigation.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.navigationSteps = navigationSteps;
const config_1 = require("../core/config");
/** Builds into separate arrays; consumers never see half-rebuilt navigation fields. */
function* navigationSteps(world) {
    const revision = world.navRevision, heights = new Float32Array(config_1.NW * config_1.ND), infantry = new Uint8Array(config_1.NW * config_1.ND), vehicles = new Uint8Array(config_1.NW * config_1.ND), fields = [], vehicleFields = [], queue = new Int32Array(config_1.NW * config_1.ND);
    let work = 0;
    for (let z = 0; z < config_1.ND; z++)
        for (let x = 0; x < config_1.NW; x++) {
            const i = z * config_1.NW + x, y = world.groundAt(x * 2 + 1, z * 2 + 1);
            heights[i] = y;
            infantry[i] = world.blocked(x * 2 + 1, y, z * 2 + 1, 0.35) ? 0 : 1;
            vehicles[i] = world.blocked(x * 2 + 1, y, z * 2 + 1, 1.85, 1.95) ? 0 : 1;
            if (++work % 2048 === 0)
                yield;
        }
    function* fill(open, result) {
        for (const flag of world.flags) {
            const field = new Uint16Array(config_1.NW * config_1.ND);
            field.fill(65535);
            result.push(field);
            let start = Math.floor(flag.z / 2) * config_1.NW + Math.floor(flag.x / 2);
            if (!open[start]) {
                let best = Infinity;
                for (let j = 0; j < open.length; j++) {
                    if (open[j]) {
                        const d = ((j % config_1.NW) * 2 + 1 - flag.x) ** 2 + (Math.floor(j / config_1.NW) * 2 + 1 - flag.z) ** 2;
                        if (d < best) {
                            best = d;
                            start = j;
                        }
                    }
                    if (++work % 2048 === 0)
                        yield;
                }
            }
            let head = 0, tail = 0;
            if (open[start]) {
                queue[tail++] = start;
                field[start] = 0;
            }
            while (head < tail) {
                const i = queue[head++], x = i % config_1.NW;
                for (let k = 0; k < 4; k++) {
                    if ((k === 0 && x === 0) || (k === 1 && x === config_1.NW - 1))
                        continue;
                    const n = i + (k === 0 ? -1 : k === 1 ? 1 : k === 2 ? -config_1.NW : config_1.NW);
                    if (n < 0 ||
                        n >= open.length ||
                        !open[n] ||
                        field[n] !== 65535 ||
                        Math.abs(heights[n] - heights[i]) > 1.01)
                        continue;
                    field[n] = field[i] + 1;
                    queue[tail++] = n;
                }
                if (++work % 2048 === 0)
                    yield;
            }
        }
    }
    yield* fill(infantry, fields);
    yield* fill(vehicles, vehicleFields);
    world.publishedNavRevision++;
    world.publishedNavSourceRevision = revision;
    world.navHeight = heights;
    world.navOpen = infantry;
    world.vehicleOpen = vehicles;
    world.fields = fields;
    world.vehicleFields = vehicleFields;
    world.navDirty = world.navRevision !== revision;
    world.navCooldown = 3;
}

},
"src/world/operations.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cityTower = cityTower;
exports.generateSteps = generateSteps;
exports.cell = cell;
exports.solid = solid;
exports.setRaw = setRaw;
exports.mark = mark;
exports.removeVoxel = removeVoxel;
exports.floorAt = floorAt;
exports.groundAt = groundAt;
exports.raycast = raycast;
exports.visible = visible;
exports.blocked = blocked;
exports.navigationPoint = navigationPoint;
exports.rand = rand;
exports.prepareChunk = prepareChunk;
exports.rebuild = rebuild;
const config_1 = require("../core/config");
const math_1 = require("../core/math");
const structural_bays_1 = require("./structural-bays");
const structure_1 = require("./structure");
function cityTower(x, z, w, d, floors, style) {
    const b = {
        x,
        z,
        w,
        d,
        h: floors * 5,
        base: 4,
        floors,
        dirty: false,
        rev: 0,
        lift: { x: x + 6.5, z: z + 4.5 },
    };
    this.buildings.push(b);
    const id = this.buildings.length;
    for (let zz = z; zz < z + d; zz++)
        for (let xx = x; xx < x + w; xx++) {
            this.buildingMap[zz * config_1.W + xx] = id;
            this.setRaw(xx, 3, zz, 2);
            for (let y = 4; y <= 4 + b.h; y++) {
                const wall = xx === x || xx === x + w - 1 || zz === z || zz === z + d - 1, slab = (y - 4) % 5 === 0, shaft = xx >= x + 3 && xx < x + 5 && zz >= z + 3 && zz < z + 5;
                if (slab && !shaft) {
                    this.setRaw(xx, y, zz, y === 4 + b.h ? 10 : 4);
                    continue;
                }
                if (!wall)
                    continue;
                const doorway = y >= 5 &&
                    y <= 8 &&
                    ((xx >= x + w / 2 - 2 && xx <= x + w / 2 + 2) ||
                        (zz >= z + d / 2 - 2 && zz <= z + d / 2 + 2));
                if (doorway)
                    continue;
                const window = (y - 4) % 5 >= 2 &&
                    (y - 4) % 5 <= 3 &&
                    (xx === x || xx === x + w - 1 ? (zz - z) % 4 !== 0 : (xx - x) % 4 !== 0);
                this.setRaw(xx, y, zz, window ? (style % 2 ? 11 : 16) : style % 3 === 0 ? 5 : style % 3 === 1 ? 4 : 12);
            }
        }
    // Roof plant and antenna remain physical, destructible blocks.
    for (let xx = x + w - 7; xx < x + w - 3; xx++)
        for (let zz = z + d - 7; zz < z + d - 3; zz++)
            for (let y = 5 + b.h; y < 7 + b.h; y++)
                this.setRaw(xx, y, zz, 8);
    if (floors > 12)
        for (let y = 5 + b.h; y < Math.min(config_1.H, 11 + b.h); y++)
            this.setRaw(x + w - 4, y, z + 4, 10);
    (0, structural_bays_1.buildStructuralFrame)(this, b);
    (0, structure_1.recordSupports)(this, b);
}
function* generateSteps() {
    this.cancelMeshes();
    this.generating = true;
    this.foundationTop.fill(0);
    this.support.reset();
    this.vox.fill(0);
    this.damage.clear();
    this.rubbleCells.clear();
    this.buildings.length = 0;
    this.buildingMap = new Uint16Array(config_1.W * config_1.D);
    this.columnTop = new Uint8Array(config_1.W * config_1.D);
    this.revision++;
    this.navRevision++;
    this.navigationTask = null;
    this.dirtyQueue.clear();
    this.chunks.forEach((c, i) => {
        c.top = 0;
        this.markDirty(i);
    });
    for (let z = 0; z < config_1.D; z++) {
        if (z % 8 === 0)
            yield;
        for (let x = 0; x < config_1.W; x++) {
            const sx = Math.abs(((((x - 16) % 40) + 60) % 40) - 20), sz = Math.abs(((((z - 16) % 40) + 60) % 40) - 20), canal = x >= 249 && x <= 262, bridge = sz < 7;
            const road = sx < 6 || sz < 6, side = sx < 10 || sz < 10, h = canal && !bridge ? (x === 249 || x === 262 ? 2 : 1) : side && !road ? 4 : 3;
            for (let y = 0; y < h; y++)
                this.setRaw(x, y, z, y === 0 ? 1 : y === h - 1 ? (road ? 8 : side ? 4 : 3) : 2);
            if (road && !canal && ((sx < 0.6 && z % 12 < 6) || (sz < 0.6 && x % 12 < 6)))
                this.setRaw(x, h - 1, z, 14);
        }
    }
    this.foundationTop.set(this.columnTop);
    this.generating = false;
    for (let j = 0; j < 12; j++)
        for (let i = 0; i < 12; i++) {
            yield;
            const x = 24 + i * 40, z = 24 + j * 40, cx = x + 12, cz = z + 12, central = Math.hypot(cx - 256, cz - 256);
            if (this.flags.some((f) => Math.hypot(f.x - cx, f.z - cz) < 30) ||
                ((i * 3 + j) % 13 === 0 && central > 100)) {
                for (let k = 0; k < 3; k++) {
                    const tx = x + 4 + k * 7, tz = z + 8 + (k % 2) * 7;
                    for (let y = 3; y < 9; y++)
                        this.setRaw(tx, y, tz, 6);
                    for (let dx = -2; dx <= 2; dx++)
                        for (let dz = -2; dz <= 2; dz++)
                            for (let y = 8; y < 12; y++)
                                if (Math.abs(dx) + Math.abs(dz) < 4)
                                    this.setRaw(tx + dx, y, tz + dz, 7);
                }
                continue;
            }
            const floors = central < 135
                ? 12 + Math.floor(this.rand() * 8)
                : central < 225
                    ? 6 + Math.floor(this.rand() * 7)
                    : 3 + Math.floor(this.rand() * 5);
            this.cityTower(x, z, 24, 24, floors, i + j);
        }
    for (const f of this.flags) {
        for (let k = -7; k <= 7; k++)
            if (Math.abs(k) > 2) {
                for (let y = 3; y < 5; y++)
                    this.setRaw(f.x + k, y, f.z + 10, 9);
            }
        for (let y = 3; y < 6; y++) {
            this.setRaw(f.x - 11, y, f.z + 9, 12);
            this.setRaw(f.x - 10, y, f.z + 9, 12);
        }
    }
    this.buildings.forEach((b) => {
        b.dirty = false;
        b.rev = 0;
    });
    yield* this.support.unsupported();
    this.navDirty = this.mapDirty = true;
}
function cell(x, y, z) {
    return this.inside(x, y, z) ? this.vox[this.index(x, y, z)] : 0;
}
function solid(x, y, z) {
    return this.cell(Math.floor(x), Math.floor(y), Math.floor(z)) !== 0;
}
function setRaw(x, y, z, m) {
    if (!this.inside(x, y, z))
        return;
    this.rubbleCells.delete(this.index(x, y, z));
    if (m && !this.vox[this.index(x, y, z)])
        this.additionRevision++;
    this.vox[this.index(x, y, z)] = m;
    this.damage.delete(this.index(x, y, z));
    if (!this.generating) {
        this.support.changed(x, y, z, m);
        this.mark(x, z);
        this.mapDirty = true;
        if (y < 9)
            this.navDirty = true;
    }
    this.revision++;
    if (y < 9)
        this.navRevision++;
    const bid = this.buildingMap[z * config_1.W + x];
    if (bid && !this.removingCollapse) {
        const b = this.buildings[bid - 1];
        b.rev++;
        b.dirty = true;
    }
    if (m && this.columnTop)
        this.columnTop[z * config_1.W + x] = Math.max(this.columnTop[z * config_1.W + x], y + 1);
    if (m && this.chunks.length) {
        const c = this.chunks[Math.floor(z / config_1.CS) * config_1.NX + Math.floor(x / config_1.CS)];
        if (c)
            c.top = Math.max(c.top || 0, y + 1);
    }
}
function mark(x, z) {
    for (const [dx, dz] of [
        [0, 0],
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
    ]) {
        const cx = Math.floor((x + dx) / config_1.CS), cz = Math.floor((z + dz) / config_1.CS);
        if (cx >= 0 && cz >= 0 && cx < config_1.NX && cz < config_1.NZ)
            this.markDirty(cz * config_1.NX + cx);
    }
}
function removeVoxel(x, y, z) {
    const m = this.cell(x, y, z);
    if (!m || m === 1)
        return 0;
    this.rubbleCells.delete(this.index(x, y, z));
    this.vox[this.index(x, y, z)] = 0;
    this.support.changed(x, y, z, 0);
    this.revision++;
    if (y < 9)
        this.navRevision++;
    if (this.columnTop && this.columnTop[z * config_1.W + x] === y + 1) {
        let h = y;
        while (h > 0 && !this.cell(x, h - 1, z))
            h--;
        this.columnTop[z * config_1.W + x] = h;
    }
    this.damage.delete(this.index(x, y, z));
    this.mark(x, z);
    this.mapDirty = true;
    if (y < 9)
        this.navDirty = true;
    const id = this.buildingMap?.[z * config_1.W + x];
    if (id && !this.removingCollapse) {
        const b = this.buildings[id - 1];
        b.dirty = true;
        b.rev = (b.rev || 0) + 1;
    }
    return m;
}
function floorAt(x, z) {
    x = (0, math_1.clamp)(Math.floor(x), 0, config_1.W - 1);
    z = (0, math_1.clamp)(Math.floor(z), 0, config_1.D - 1);
    return Math.max(1, this.columnTop[z * config_1.W + x]);
}
function groundAt(x, z) {
    x = (0, math_1.clamp)(Math.floor(x), 0, config_1.W - 1);
    z = (0, math_1.clamp)(Math.floor(z), 0, config_1.D - 1);
    for (let y = 0; y < config_1.H - 2; y++)
        if (this.cell(x, y, z) && !this.cell(x, y + 1, z) && !this.cell(x, y + 2, z))
            return y + 1;
    return 1;
}
function raycast(o, d, max) {
    let x = Math.floor(o.x), y = Math.floor(o.y), z = Math.floor(o.z), t = 0;
    const sx = d.x >= 0 ? 1 : -1, sy = d.y >= 0 ? 1 : -1, sz = d.z >= 0 ? 1 : -1;
    const dx = d.x ? Math.abs(1 / d.x) : Infinity, dy = d.y ? Math.abs(1 / d.y) : Infinity, dz = d.z ? Math.abs(1 / d.z) : Infinity;
    let tx = d.x ? ((sx > 0 ? x + 1 : x) - o.x) / d.x : Infinity, ty = d.y ? ((sy > 0 ? y + 1 : y) - o.y) / d.y : Infinity, tz = d.z ? ((sz > 0 ? z + 1 : z) - o.z) / d.z : Infinity;
    for (let i = 0; i < 640 && t <= max; i++) {
        if (this.cell(x, y, z))
            return { x, y, z, t, m: this.cell(x, y, z) };
        if (tx < ty && tx < tz) {
            x += sx;
            t = tx;
            tx += dx;
        }
        else if (ty < tz) {
            y += sy;
            t = ty;
            ty += dy;
        }
        else {
            z += sz;
            t = tz;
            tz += dz;
        }
    }
    return null;
}
function visible(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z, l = Math.hypot(dx, dy, dz);
    return l < 0.01 || !this.raycast(a, { x: dx / l, y: dy / l, z: dz / l }, l - 0.25);
}
function blocked(x, y, z, r = 0.3, height = 1.8) {
    if (x - r < 1 || z - r < 1 || x + r > config_1.W - 1 || z + r > config_1.D - 1 || y < 0.95)
        return true;
    for (let zz = Math.floor(z - r); zz <= Math.floor(z + r); zz++)
        for (let xx = Math.floor(x - r); xx <= Math.floor(x + r); xx++)
            for (let yy = Math.floor(y + 0.025); yy <= Math.floor(y + height - 0.035); yy++)
                if (this.cell(xx, yy, zz))
                    return true;
    return false;
}
function navigationPoint(a, vehicle = false) {
    const cx = (0, math_1.clamp)(Math.floor(a.x / 2), 0, config_1.NW - 1), cz = (0, math_1.clamp)(Math.floor(a.z / 2), 0, config_1.ND - 1), field = (vehicle ? this.vehicleFields : this.fields)[a.goal];
    let best = 65535, bx = a.x, bz = a.z;
    for (const [ox, oz] of [
        [0, 0],
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
    ]) {
        const xx = cx + ox, zz = cz + oz;
        if (xx < 0 || zz < 0 || xx >= config_1.NW || zz >= config_1.ND)
            continue;
        const i = zz * config_1.NW + xx;
        if (field[i] < best && Math.abs(this.navHeight[i] - a.y) < 1.1) {
            best = field[i];
            bx = xx * 2 + 1;
            bz = zz * 2 + 1;
        }
    }
    return { x: bx, z: bz, reachable: best < 65535 };
}
function rand() {
    this.seed |= 0;
    this.seed = (this.seed + 0x6d2b79f5) | 0;
    let t = Math.imul(this.seed ^ (this.seed >>> 15), 1 | this.seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function* prepareChunk(c, removed = new Set()) {
    const sample = (x, y, z) => removed.has(this.index(x, y, z)) ? 0 : this.cell(x, y, z);
    c.top = 1;
    for (let z = c.z * config_1.CS; z < (c.z + 1) * config_1.CS; z++)
        for (let x = c.x * config_1.CS; x < (c.x + 1) * config_1.CS; x++) {
            let top = this.columnTop[z * config_1.W + x];
            while (top > 0 && !sample(x, top - 1, z))
                top--;
            c.top = Math.max(c.top, top);
        }
    // Greedy meshing: merge adjacent coplanar faces into a single rectangle.
    const data = [], origin = [c.x * config_1.CS, 0, c.z * config_1.CS], dims = [config_1.CS, Math.max(1, c.top || config_1.H), config_1.CS];
    for (let axis = 0; axis < 3; axis++) {
        const u = (axis + 1) % 3, v = (axis + 2) % 3, mask = new Int16Array(dims[u] * dims[v]), p = [0, 0, 0];
        for (let slice = 0; slice <= dims[axis]; slice++) {
            yield;
            p[axis] = slice;
            let n = 0;
            for (p[v] = 0; p[v] < dims[v]; p[v]++)
                for (p[u] = 0; p[u] < dims[u]; p[u]++) {
                    if ((n & 127) === 0)
                        yield;
                    const pos = [origin[0] + p[0], origin[1] + p[1], origin[2] + p[2]];
                    pos[axis]--;
                    const a = sample(pos[0], pos[1], pos[2]);
                    pos[axis]++;
                    const b = sample(pos[0], pos[1], pos[2]);
                    mask[n++] =
                        a && !b && slice > 0
                            ? a
                            : b && !a && slice < dims[axis]
                                ? -(axis === 1 && slice === 0 ? 0 : b)
                                : 0;
                }
            for (let j = 0; j < dims[v]; j++)
                for (let i = 0; i < dims[u];) {
                    if (((j * dims[u] + i) & 127) === 0)
                        yield;
                    const n = j * dims[u] + i, m = mask[n];
                    if (!m) {
                        i++;
                        continue;
                    }
                    let w = 1, h = 1;
                    while (i + w < dims[u] && mask[n + w] === m)
                        w++;
                    outer: while (j + h < dims[v]) {
                        for (let k = 0; k < w; k++)
                            if (mask[n + h * dims[u] + k] !== m)
                                break outer;
                        h++;
                    }
                    const base = [...origin];
                    base[axis] += slice;
                    base[u] += i;
                    base[v] += j;
                    const corners = [base, [...base], [...base], [...base]];
                    corners[1][u] += w;
                    corners[2][u] += w;
                    corners[2][v] += h;
                    corners[3][v] += h;
                    const normal = [0, 0, 0];
                    normal[axis] = m > 0 ? 1 : -1;
                    const co = this.colours[Math.abs(m)], indices = m > 0 ? [0, 1, 2, 0, 2, 3] : [0, 3, 2, 0, 2, 1];
                    for (const k of indices)
                        data.push(...corners[k], ...normal, ...co, Math.abs(m));
                    for (let yy = 0; yy < h; yy++)
                        mask.fill(0, n + yy * dims[u], n + yy * dims[u] + w);
                    i += w;
                }
        }
    }
    c.count = data.length / 10;
    c.mesh = new Float32Array(data);
    c.version++;
    c.dirty = false;
}
function rebuild(c) {
    for (const _ of prepareChunk.call(this, c)) {
    }
}

},
"src/world/pathfinding.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localPath = localPath;
exports.connectedSurface = connectedSurface;
const config_1 = require("../core/config");
const math_1 = require("../core/math");
function push(search, cell, score) {
    const heap = search.heap;
    heap.push({ cell, score });
    let i = heap.length - 1;
    while (i > 0) {
        const p = (i - 1) >> 1;
        if (heap[p].score <= score)
            break;
        [heap[p], heap[i]] = [heap[i], heap[p]];
        i = p;
    }
}
function pop(search) {
    const heap = search.heap, first = heap[0], last = heap.pop();
    if (heap.length) {
        heap[0] = last;
        let i = 0;
        while (true) {
            let n = i;
            const l = i * 2 + 1, r = l + 1;
            if (l < heap.length && heap[l].score < heap[n].score)
                n = l;
            if (r < heap.length && heap[r].score < heap[n].score)
                n = r;
            if (n === i)
                break;
            [heap[i], heap[n]] = [heap[n], heap[i]];
            i = n;
        }
    }
    return first.cell;
}
/** A bounded slice preserves its frontier; budget exhaustion is not an unreachable route. */
function localPath(world, from, to, maxNodes = 2048, previous) {
    const failed = {
        point: { x: from.x, y: from.y, z: from.z },
        reachable: false,
        status: 'unreachable',
    };
    if (![from, to].every((p) => [p.x, p.y, p.z].every(Number.isFinite) &&
        p.x >= 0 &&
        p.z >= 0 &&
        p.x < config_1.NW * 2 &&
        p.z < config_1.ND * 2))
        return failed;
    const cell = (p) => Math.floor(p.z / 2) * config_1.NW + Math.floor(p.x / 2), start = cell(from), goal = cell(to);
    if (!world.navOpen[goal] ||
        Math.abs(world.navHeight[goal] - to.y) > 2 ||
        Math.abs(world.navHeight[start] - from.y) > 2)
        return failed;
    const heuristic = (i) => Math.abs((i % config_1.NW) - (goal % config_1.NW)) + Math.abs(Math.floor(i / config_1.NW) - Math.floor(goal / config_1.NW));
    const search = previous?.start === start &&
        previous.goal === goal &&
        previous.revision === world.publishedNavRevision
        ? previous
        : {
            start,
            goal,
            revision: world.publishedNavRevision,
            heap: [],
            parents: new Map([[start, -1]]),
            costs: new Map([[start, 0]]),
            closed: new Set(),
        };
    if (!search.heap.length && !search.closed.size)
        push(search, start, heuristic(start));
    for (let work = 0; search.heap.length && work < maxNodes; work++) {
        const i = pop(search);
        if (search.closed.has(i))
            continue;
        search.closed.add(i);
        if (i === goal) {
            let point = i;
            while (search.parents.get(point) !== start && search.parents.get(point) !== -1)
                point = search.parents.get(point);
            return {
                point: {
                    x: (point % config_1.NW) * 2 + 1,
                    y: world.navHeight[point],
                    z: Math.floor(point / config_1.NW) * 2 + 1,
                },
                reachable: true,
                status: 'reachable',
            };
        }
        const x = i % config_1.NW, z = Math.floor(i / config_1.NW);
        for (const [dx, dz] of [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
        ]) {
            const xx = x + dx, zz = z + dz, n = zz * config_1.NW + xx;
            if (xx < 0 ||
                zz < 0 ||
                xx >= config_1.NW ||
                zz >= config_1.ND ||
                search.closed.has(n) ||
                !world.navOpen[n] ||
                Math.abs(world.navHeight[n] - world.navHeight[i]) > 1.01)
                continue;
            const cost = search.costs.get(i) + 1;
            if (cost >= (search.costs.get(n) ?? Infinity))
                continue;
            search.costs.set(n, cost);
            search.parents.set(n, i);
            push(search, n, cost + heuristic(n));
        }
    }
    return search.heap.length
        ? { point: { x: from.x, y: from.y, z: from.z }, reachable: false, status: 'pending', search }
        : failed;
}
/** Validate a short path on the leader's current surface, including rooftops. */
function connectedSurface(world, from, to) {
    const distance = Math.sqrt((0, math_1.dist2)(from, to));
    for (let t = 0; t <= distance; t += 0.4) {
        const f = distance ? t / distance : 0, x = from.x + (to.x - from.x) * f, z = from.z + (to.z - from.z) * f, y = from.y + (to.y - from.y) * f;
        if (world.blocked(x, y, z, 0.34, 1.8) || !world.solid(x, y - 0.1, z))
            return false;
    }
    return true;
}

},
"src/world/structural-bays.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildStructuralFrame = buildStructuralFrame;
exports.solveStructuralBays = solveStructuralBays;
const material_physics_1 = require("../core/material-physics");
const offsets = (size) => [2, Math.floor(size / 2), size - 3];
const capacity = (world, p) => {
    const m = world.cell(p.x, p.y, p.z);
    if (!m || m === 7 || m === 11 || m === 16)
        return 0;
    return ((0, material_physics_1.physicsMaterial)(m).compression *
        Math.max(0, 1 - (world.damage.get(world.index(p.x, p.y, p.z)) ?? 0) / (0, material_physics_1.fractureResistance)(m)));
};
const sectionCapacity = (world, sections) => Math.min(...sections.map((s) => s.reduce((n, p) => n + capacity(world, p), 0)));
/** Author a light frame inside the existing shell. Slabs and the lift remain navigable. */
function buildStructuralFrame(world, b) {
    const xs = offsets(b.w), zs = offsets(b.d);
    for (let floor = 0; floor < b.floors; floor++) {
        const bottom = b.base + floor * 5;
        for (let iz = 0; iz < 3; iz++)
            for (let ix = 0; ix < 3; ix++) {
                const core = ix === 1 && iz === 1, size = core ? 2 : 1;
                for (let dx = 0; dx < size; dx++)
                    for (let dz = 0; dz < size; dz++)
                        for (let y = bottom + 1; y < bottom + 5; y++)
                            world.setRaw(b.x + xs[ix] + dx, y, b.z + zs[iz] + dz, core ? 12 : 4);
            }
        // Beam soffits sit one voxel below each floor, above standing head height.
        for (const z of zs)
            for (let x = xs[0]; x <= xs[2]; x++)
                world.setRaw(b.x + x, bottom + 4, b.z + z, 12);
        for (const x of xs)
            for (let z = zs[0]; z <= zs[2]; z++)
                world.setRaw(b.x + x, bottom + 4, b.z + z, 12);
    }
    const model = {
        members: [],
        bays: [],
        perFloor: 9,
        lastTime: 0,
        revision: b.rev,
        failures: 0,
        maxStress: 0,
        unstable: false,
    };
    const member = (kind, floor, sections) => {
        const id = model.members.length;
        model.members.push({
            id,
            kind,
            floor,
            sections,
            cells: sections.flat(),
            baseline: sectionCapacity(world, sections),
            health: 1,
            stress: 0,
            fatigue: 0,
            failed: false,
        });
        return id;
    };
    const bounds = (a, i, size) => [
        i === 0 ? 0 : Math.floor((a[i - 1] + a[i]) / 2) + 1,
        i === 2 ? size : Math.floor((a[i] + a[i + 1]) / 2) + 1,
    ];
    for (let floor = 0; floor < b.floors; floor++) {
        const bottom = b.base + floor * 5;
        for (let iz = 0; iz < 3; iz++)
            for (let ix = 0; ix < 3; ix++) {
                const core = ix === 1 && iz === 1, sections = [];
                for (let y = bottom + 1; y < bottom + 5; y++) {
                    const section = [];
                    for (let dx = 0; dx < (core ? 2 : 1); dx++)
                        for (let dz = 0; dz < (core ? 2 : 1); dz++)
                            section.push({ x: b.x + xs[ix] + dx, y, z: b.z + zs[iz] + dz });
                    sections.push(section);
                }
                const column = member(core ? 'core' : 'column', floor, sections), slab = [];
                const [x0, x1] = bounds(xs, ix, b.w), [z0, z1] = bounds(zs, iz, b.d);
                for (let x = x0; x < x1; x++)
                    for (let z = z0; z < z1; z++)
                        slab.push({ x: b.x + x, y: bottom + 5, z: b.z + z });
                const initialMass = slab.reduce((n, p) => n +
                    (0, material_physics_1.physicsMaterial)(world.cell(p.x, p.y, p.z)).density *
                        (world.cell(p.x, p.y, p.z) ? 1 : 0), 0);
                model.bays.push({
                    id: floor * 9 + iz * 3 + ix,
                    floor,
                    column,
                    x: b.x + xs[ix],
                    z: b.z + zs[iz],
                    slab,
                    initialMass,
                    designLoad: initialMass * (b.floors - floor),
                    load: 0,
                    capacity: 0,
                    stress: 0,
                    neighbours: [],
                });
            }
        for (let iz = 0; iz < 3; iz++)
            for (let ix = 0; ix < 3; ix++) {
                const a = model.bays[floor * 9 + iz * 3 + ix];
                for (const [dx, dz] of [
                    [1, 0],
                    [0, 1],
                ]) {
                    if (ix + dx >= 3 || iz + dz >= 3)
                        continue;
                    const other = model.bays[floor * 9 + (iz + dz) * 3 + ix + dx], sections = [];
                    const length = Math.max(Math.abs(other.x - a.x), Math.abs(other.z - a.z));
                    for (let t = 1; t < length; t++)
                        sections.push([{ x: a.x + dx * t, y: bottom + 4, z: a.z + dz * t }]);
                    const beam = member('beam', floor, sections);
                    a.neighbours.push({ bay: other.id, beam });
                    other.neighbours.push({ bay: a.id, beam });
                }
            }
    }
    // Initial design loads are measured by tributary floor mass, not a material-independent count.
    for (let i = 0; i < 9; i++) {
        let above = 0;
        for (let f = b.floors - 1; f >= 0; f--) {
            const bay = model.bays[f * 9 + i];
            above += bay.initialMass;
            bay.designLoad = above;
        }
    }
    b.structure = model;
}
/** Bounded, deterministic load-path approximation, not engineering FEA.
 * A damaged column shares demand through surviving beams. Sustained overload fails only a
 * member's weakest cross section. The voxel support graph then detaches genuinely disconnected
 * mass. Every publication is revision-checked so a multi-frame solve cannot erase fresh repairs.
 */
function* solveStructuralBays(world, b, time) {
    const model = b.structure;
    if (!model)
        return false;
    const revision = b.rev, dt = Math.min(0.35, Math.max(1 / 30, time - model.lastTime));
    const health = [], weakest = [];
    let work = 0;
    for (const member of model.members) {
        let min = Infinity, weak = [];
        for (const section of member.sections) {
            const c = section.reduce((n, p) => n + capacity(world, p), 0);
            if (c < min) {
                min = c;
                weak = section;
            }
            if (++work % 96 === 0)
                yield;
        }
        health[member.id] = member.baseline > 0 ? Math.min(1, min / member.baseline) : 0;
        weakest[member.id] = weak;
    }
    const loads = new Float64Array(model.bays.length), capacities = new Float64Array(model.bays.length);
    const fail = [], fatigue = model.members.map((m) => m.fatigue), stresses = model.members.map(() => 0);
    let unstable = false, maxStress = 0;
    for (let f = b.floors - 1; f >= 0; f--) {
        const floor = model.bays.slice(f * 9, (f + 1) * 9);
        for (const bay of floor) {
            let mass = 0;
            for (const p of bay.slab) {
                const m = world.cell(p.x, p.y, p.z);
                if (m)
                    mass += (0, material_physics_1.physicsMaterial)(m).density;
                if (++work % 256 === 0)
                    yield;
            }
            loads[bay.id] += mass;
            const core = model.members[bay.column].kind === 'core';
            capacities[bay.id] = bay.designLoad * (core ? 2.1 : 1.6) * health[bay.column];
        }
        // Spread excess to adjacent spare capacity. Four relaxation passes cross the 3x3 grid.
        for (let pass = 0; pass < 4; pass++)
            for (const bay of floor) {
                const excess = Math.max(0, loads[bay.id] - capacities[bay.id]);
                if (excess < 0.001)
                    continue;
                const paths = bay.neighbours
                    .filter((e) => health[e.beam] > 0.05)
                    .map((e) => ({
                    id: e.bay,
                    spare: Math.max(0, capacities[e.bay] - loads[e.bay]) * health[e.beam],
                    beam: e.beam,
                }));
                const total = paths.reduce((n, e) => n + e.spare, 0), transfer = Math.min(total, excess);
                for (const e of paths)
                    if (total > 0) {
                        const amount = (transfer * e.spare) / total;
                        loads[e.id] += amount;
                        loads[bay.id] -= amount;
                        stresses[e.beam] = Math.max(stresses[e.beam], amount / Math.max(1, bay.designLoad * 0.7 * health[e.beam]));
                    }
            }
        // If a column is gone and no spare remains, its connected neighbours must still carry the
        // load, rather than letting zero-capacity supports silently absorb it.
        for (const bay of floor)
            if (health[bay.column] < 0.001 && loads[bay.id] > 0.001) {
                const paths = bay.neighbours.filter((e) => health[e.beam] > 0.05 && health[model.bays[e.bay].column] > 0.001);
                if (paths.length) {
                    const amount = loads[bay.id] / paths.length;
                    loads[bay.id] = 0;
                    for (const e of paths)
                        loads[e.bay] += amount;
                }
            }
        for (const bay of floor) {
            const id = bay.column, stress = capacities[bay.id] > 0.001 ? loads[bay.id] / capacities[bay.id] : 0;
            stresses[id] = stress;
            maxStress = Math.max(maxStress, stress);
            if (f > 0)
                loads[bay.id - 9] += health[id] > 0.001 ? loads[bay.id] : 0;
        }
        yield;
    }
    for (const m of model.members) {
        const stress = stresses[m.id];
        if (stress > 1.02 && health[m.id] > 0.001) {
            fatigue[m.id] += dt * Math.min(5, (stress - 1) * 1.4);
            unstable = true;
        }
        else
            fatigue[m.id] = Math.max(0, fatigue[m.id] - dt * 0.18);
        if (fatigue[m.id] >= 0.8 && health[m.id] > 0.001)
            fail.push(m.id);
    }
    if (b.rev !== revision) {
        b.dirty = true;
        return true;
    }
    model.lastTime = time;
    model.maxStress = maxStress;
    model.unstable = unstable;
    for (const m of model.members) {
        m.health = health[m.id];
        m.stress = stresses[m.id];
        m.fatigue = fatigue[m.id];
    }
    for (const bay of model.bays) {
        bay.load = loads[bay.id];
        bay.capacity = capacities[bay.id];
        bay.stress = stresses[bay.column];
    }
    // At most two local breaks per publication. Further demand redistributes on the next solve.
    for (const id of fail.slice(0, 2)) {
        const m = model.members[id];
        m.failed = true;
        m.fatigue = 0;
        model.failures++;
        for (const p of weakest[id])
            world.removeVoxel(p.x, p.y, p.z);
        unstable = true;
    }
    model.revision = b.rev;
    return unstable;
}

},
"src/world/structure.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bearsLoad = void 0;
exports.recordSupports = recordSupports;
exports.failedSupportLevel = failedSupportLevel;
exports.collapseDirection = collapseDirection;
exports.supportCapacity = supportCapacity;
const material_physics_1 = require("../core/material-physics");
/** Glass and foliage cannot carry a building, though attached panes remain visible. */
const bearsLoad = (material) => material > 0 && material !== 7 && material !== 11 && material !== 16;
exports.bearsLoad = bearsLoad;
function recordSupports(world, building) {
    const counts = new Float32Array(building.h + 1);
    for (let y = 0; y < counts.length; y++)
        for (let z = 0; z < building.d; z++)
            for (let x = 0; x < building.w; x++)
                if ((0, exports.bearsLoad)(world.cell(building.x + x, building.base + y, building.z + z)))
                    counts[y] += (0, material_physics_1.physicsMaterial)(world.cell(building.x + x, building.base + y, building.z + z)).compression;
    building.supportBaseline = counts;
}
/** Arcade load capacity: a storey cannot balance the tower on a few remaining pillars. */
function failedSupportLevel(building, counts, momentsX, momentsZ) {
    const baseline = building.supportBaseline;
    if (!baseline)
        return Infinity;
    for (let y = 0; y < Math.min(counts.length, baseline.length - 1); y++) {
        const original = baseline[y];
        if (original < 8)
            continue;
        const remaining = counts[y], ratio = remaining / original;
        const eccentric = remaining > 0 &&
            Math.hypot((momentsX[y] / remaining - (building.w - 1) / 2) / building.w, (momentsZ[y] / remaining - (building.d - 1) / 2) / building.d) > 0.23;
        if (ratio < 0.42 || (ratio < 0.7 && eccentric))
            return building.base + y;
    }
    return Infinity;
}
/** Toppling is directed away from the surviving support centroid, toward the damaged side. */
function collapseDirection(b, count, momentX, momentZ) {
    let x = count ? (b.w - 1) / 2 - momentX / count : 0, z = count ? (b.d - 1) / 2 - momentZ / count : 0;
    if (Math.hypot(x, z) < 0.1) {
        // Stable asymmetry for a balanced failure; do not consume the combat RNG.
        const angle = (b.x * 0.73 + b.z * 1.37) % (Math.PI * 2);
        x = Math.sin(angle);
        z = Math.cos(angle);
    }
    const length = Math.hypot(x, z);
    return { x: x / length, y: 0, z: z / length };
}
function supportCapacity(world, x, y, z) {
    const m = world.cell(x, y, z);
    return ((0, material_physics_1.physicsMaterial)(m).compression *
        Math.max(0, 1 - (world.damage.get(world.index(x, y, z)) ?? 0) / (0, material_physics_1.fractureResistance)(m)) ** 1.3);
}

},
"src/world/support.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportGraph = void 0;
const config_1 = require("../core/config");
const structure_1 = require("./structure");
/** Chunk-local components keep a severed tree and a damaged tower on the same support graph. */
class SupportGraph {
    world;
    cells = new Map();
    dirty = new Set();
    nodes = new Map();
    owners = new Map();
    chunks = new Map();
    nextId = 0;
    constructor(world) {
        this.world = world;
    }
    reset() {
        this.cells.clear();
        this.dirty.clear();
        this.nodes.clear();
        this.owners.clear();
        this.chunks.clear();
        this.nextId = 0;
    }
    chunk(x, z) {
        return Math.floor(z / config_1.CS) * config_1.NX + Math.floor(x / config_1.CS);
    }
    changed(x, y, z, material) {
        const chunk = this.chunk(x, z), key = this.world.index(x, y, z);
        let cells = this.cells.get(chunk);
        if (material && material !== 1 && y >= this.world.foundationTop[z * config_1.W + x]) {
            if (!cells) {
                cells = new Set();
                this.cells.set(chunk, cells);
            }
            cells.add(key);
        }
        else
            cells?.delete(key);
        this.dirty.add(chunk);
        for (const [dx, dz] of [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
        ]) {
            if (this.world.inside(x + dx, y, z + dz))
                this.dirty.add(this.chunk(x + dx, z + dz));
        }
    }
    removeCells(voxels) {
        const chunks = new Set();
        for (const v of voxels) {
            const chunk = this.chunk(v.x, v.z);
            this.cells.get(chunk)?.delete(this.world.index(v.x, v.y, v.z));
            chunks.add(chunk);
        }
        for (const chunk of chunks) {
            this.dirty.add(chunk);
            for (const delta of [-config_1.NX, config_1.NX, -1, 1])
                if (chunk + delta >= 0 && chunk + delta < config_1.NX * config_1.NX)
                    this.dirty.add(chunk + delta);
        }
    }
    invalidateBuilding(x, z, width, depth) {
        for (let zz = Math.floor(z / config_1.CS); zz <= Math.floor((z + depth - 1) / config_1.CS); zz++)
            for (let xx = Math.floor(x / config_1.CS); xx <= Math.floor((x + width - 1) / config_1.CS); xx++)
                this.dirty.add(zz * config_1.NX + xx);
    }
    position(key) {
        return { x: key % config_1.W, y: Math.floor(key / (config_1.W * config_1.D)), z: Math.floor(key / config_1.W) % config_1.D };
    }
    neighbours(key) {
        const { x, y, z } = this.position(key), result = [];
        for (const [dx, dy, dz] of [
            [1, 0, 0],
            [-1, 0, 0],
            [0, 1, 0],
            [0, -1, 0],
            [0, 0, 1],
            [0, 0, -1],
        ])
            if (this.world.inside(x + dx, y + dy, z + dz))
                result.push(this.world.index(x + dx, y + dy, z + dz));
        return result;
    }
    cut(a, b) {
        if (this.world.rubbleCells.has(a) || this.world.rubbleCells.has(b))
            return false;
        const p = this.position(a), q = this.position(b);
        const id = this.world.buildingMap[p.z * config_1.W + p.x];
        if (!id || id !== this.world.buildingMap[q.z * config_1.W + q.x])
            return false;
        const building = this.world.buildings[id - 1];
        if (building?.structure && p.x === q.x && p.z === q.z && p.y !== q.y) {
            const lower = Math.min(p.y, q.y), floor = (lower - building.base) / 5;
            if (Number.isInteger(floor) && floor >= 0 && floor < building.floors) {
                // Façade panels attach to their floor but cannot carry the next storey's gravity load.
                // Only authored column/core footprints bridge this floor-to-storey support plane.
                const x = p.x - building.x, z = p.z - building.z;
                const cx = Math.floor(building.w / 2), cz = Math.floor(building.d / 2);
                const column = (x === 2 || x === cx || x === building.w - 3) &&
                    (z === 2 || z === cz || z === building.d - 3);
                const core = x >= cx && x < cx + 2 && z >= cz && z < cz + 2;
                if (!column && !core)
                    return true;
            }
        }
        const fracture = building?.fractureHeight;
        return fracture !== undefined && p.y > fracture !== q.y > fracture;
    }
    /** Publish complete local components; geometry is revalidated at detachment by the caller. */
    *unsupported() {
        let work = 0;
        const pending = [...this.dirty];
        for (const chunk of pending) {
            this.dirty.delete(chunk);
            for (const id of this.chunks.get(chunk) ?? []) {
                const node = this.nodes.get(id);
                if (node)
                    for (const key of node.cells)
                        this.owners.delete(key);
                this.nodes.delete(id);
            }
            const ids = [], remaining = new Set(this.cells.get(chunk));
            while (remaining.size) {
                const first = remaining.values().next().value;
                const p = this.position(first), material = this.world.cell(p.x, p.y, p.z);
                if (!material) {
                    remaining.delete(first);
                    continue;
                }
                const node = {
                    id: this.nextId++,
                    chunk,
                    cells: [],
                    structural: (0, structure_1.bearsLoad)(material),
                    anchored: false,
                    edges: new Set(),
                };
                const queue = [first];
                remaining.delete(first);
                for (let head = 0; head < queue.length; head++) {
                    const key = queue[head];
                    node.cells.push(key);
                    for (const near of this.neighbours(key)) {
                        const n = this.position(near), m = this.world.cell(n.x, n.y, n.z);
                        if (!m || this.cut(key, near))
                            continue;
                        if (m === 1 || n.y < this.world.foundationTop[n.z * config_1.W + n.x])
                            node.anchored = true;
                        if (remaining.has(near) && (0, structure_1.bearsLoad)(m) === node.structural) {
                            remaining.delete(near);
                            queue.push(near);
                        }
                    }
                    if (++work % 128 === 0)
                        yield;
                }
                ids.push(node.id);
                this.nodes.set(node.id, node);
                for (const key of node.cells) {
                    this.owners.set(key, node.id);
                    if (++work % 128 === 0)
                        yield;
                }
            }
            this.chunks.set(chunk, ids);
        }
        // Edges include attached glass/leaves, but only structural nodes carry foundation reachability.
        const affected = new Set(pending);
        for (const chunk of pending)
            for (const delta of [-config_1.NX, config_1.NX, -1, 1])
                affected.add(chunk + delta);
        for (const node of this.nodes.values()) {
            if (!affected.has(node.chunk))
                continue;
            node.edges.clear();
            for (const key of node.cells) {
                for (const near of this.neighbours(key)) {
                    const owner = this.owners.get(near);
                    if (owner !== undefined && owner !== node.id && !this.cut(key, near))
                        node.edges.add(owner);
                }
                if (++work % 128 === 0)
                    yield;
            }
        }
        const supported = new Set(), queue = [];
        for (const node of this.nodes.values())
            if (node.structural && node.anchored) {
                supported.add(node.id);
                queue.push(node.id);
            }
        for (let head = 0; head < queue.length; head++) {
            const node = this.nodes.get(queue[head]);
            for (const edge of node.edges) {
                const n = this.nodes.get(edge);
                if (n?.structural && !supported.has(edge)) {
                    supported.add(edge);
                    queue.push(edge);
                }
            }
        }
        for (const node of this.nodes.values())
            if (!node.structural && (node.anchored || [...node.edges].some((id) => supported.has(id))))
                supported.add(node.id);
        const visited = new Set(), result = [];
        for (const start of this.nodes.values()) {
            if (supported.has(start.id) || visited.has(start.id))
                continue;
            const todo = [start.id], voxels = [];
            let stale = false;
            visited.add(start.id);
            for (let head = 0; head < todo.length; head++) {
                const node = this.nodes.get(todo[head]);
                stale ||= this.dirty.has(node.chunk);
                for (const key of node.cells) {
                    const p = this.position(key), material = this.world.cell(p.x, p.y, p.z);
                    if (material)
                        voxels.push({ ...p, material });
                    if (++work % 128 === 0)
                        yield;
                }
                for (const edge of node.edges)
                    if (!supported.has(edge) && !visited.has(edge)) {
                        visited.add(edge);
                        todo.push(edge);
                    }
            }
            if (!stale && voxels.length)
                result.push(voxels);
        }
        return result;
    }
}
exports.SupportGraph = SupportGraph;

},
"src/world/world.ts":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.World = void 0;
const config_1 = require("../core/config");
const material_physics_1 = require("../core/material-physics");
const navigation_1 = require("./navigation");
const operations = require("./operations");
const support_1 = require("./support");
class World {
    damageRevision = 0;
    damageVoxel(x, y, z, amount) {
        const material = this.cell(x, y, z);
        if (material <= 1 || !Number.isFinite(amount) || amount <= 0)
            return { applied: 0, removed: 0, material };
        const key = this.index(x, y, z), before = this.damage.get(key) ?? 0;
        const resistance = (0, material_physics_1.fractureResistance)(material);
        const applied = Math.min(amount, Math.max(0, resistance - before));
        if (applied <= 0)
            return { applied: 0, removed: 0, material };
        this.damageRevision++;
        if (before + applied >= resistance)
            return { applied, removed: this.removeVoxel(x, y, z), material };
        this.damage.set(key, before + applied);
        const building = this.buildings[this.buildingMap[z * config_1.W + x] - 1];
        if (building) {
            building.rev++;
            building.dirty = true;
        }
        return { applied, removed: 0, material };
    }
    /** Atomic terrain-to-island ownership transfer, with one invalidation per column/chunk. */
    detach(voxels) {
        const columns = new Set();
        const buildings = new Set();
        let navigationChanged = false;
        for (const v of voxels) {
            const key = this.index(v.x, v.y, v.z);
            this.vox[key] = 0;
            this.damage.delete(key);
            this.rubbleCells.delete(key);
            columns.add(v.z * config_1.W + v.x);
            const bid = this.buildingMap[v.z * config_1.W + v.x];
            if (bid)
                buildings.add(bid - 1);
            navigationChanged ||= v.y < 9;
        }
        for (const bid of buildings) {
            const b = this.buildings[bid];
            b.rev++;
            b.dirty = true;
        }
        this.support.removeCells(voxels);
        for (const column of columns) {
            const x = column % config_1.W, z = Math.floor(column / config_1.W);
            let top = this.columnTop[column];
            while (top > 0 && !this.vox[this.index(x, top - 1, z)])
                top--;
            this.columnTop[column] = top;
            this.mark(x, z);
        }
        this.revision++;
        this.mapDirty = true;
        if (navigationChanged) {
            this.navRevision++;
            this.navDirty = true;
        }
    }
    chunkRevisions = new Uint32Array(config_1.NX * config_1.NZ);
    *prepareDetach(voxels) {
        const removed = new Set(), ids = new Set();
        let work = 0;
        const columns = new Set();
        for (const v of voxels) {
            removed.add(this.index(v.x, v.y, v.z));
            columns.add(v.z * config_1.W + v.x);
            if (++work % 128 === 0)
                yield;
        }
        for (const column of columns) {
            const vx = column % config_1.W, vz = Math.floor(column / config_1.W);
            for (const [dx, dz] of [
                [0, 0],
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1],
            ]) {
                const x = Math.floor((vx + dx) / config_1.CS), z = Math.floor((vz + dz) / config_1.CS);
                if (x >= 0 && z >= 0 && x < config_1.NX && z < config_1.NZ)
                    ids.add(z * config_1.NX + x);
            }
            if (++work % 128 === 0)
                yield;
        }
        const prepared = [...ids].map((id) => ({
            chunk: this.chunks[id],
            mesh: { ...this.chunks[id] },
            revision: this.chunkRevisions[id],
        }));
        for (const item of prepared)
            yield* operations.prepareChunk.call(this, item.mesh, removed);
        return prepared;
    }
    generating = false;
    prepared = null;
    /** Generation and navigation are shared by preview and deployment. */
    *prepareSteps(seed) {
        const ready = this.prepared;
        if (ready?.seed === seed && ready.revision === this.revision && !this.damage.size) {
            this.seed = ready.rng;
            return;
        }
        this.prepared = null;
        this.seed = seed;
        try {
            yield* this.generateSteps();
            yield* (0, navigation_1.navigationSteps)(this);
            this.prepared = { seed, revision: this.revision, rng: this.seed };
        }
        finally {
            this.generating = false;
        }
    }
    foundationTop = new Uint8Array(config_1.W * config_1.D);
    support = new support_1.SupportGraph(this);
    vox = new Uint8Array(config_1.W * config_1.D * config_1.H);
    damage = new Map();
    rubbleCells = new Set();
    buildings = [];
    chunks = Array.from({ length: config_1.NX * config_1.NZ }, (_, i) => ({
        x: i % config_1.NX,
        z: Math.floor(i / config_1.NX),
        version: 0,
        top: 0,
        dirty: true,
        count: 0,
        mesh: new Float32Array(),
    }));
    columnTop = new Uint8Array(config_1.W * config_1.D);
    buildingMap = new Uint16Array(config_1.W * config_1.D);
    removingCollapse = false;
    revision = 0;
    additionRevision = 0;
    navRevision = 0;
    publishedNavRevision = 0;
    publishedNavSourceRevision = -1;
    navigationTask = null;
    navDirty = true;
    mapDirty = true;
    navCooldown = 0;
    navHeight = new Float32Array(config_1.NW * config_1.ND);
    navOpen = new Uint8Array(config_1.NW * config_1.ND);
    fields = [];
    vehicleOpen = new Uint8Array(config_1.NW * config_1.ND);
    vehicleFields = [];
    colours = [...config_1.materials];
    sky = [0.57, 0.64, 0.76];
    seed = 872419;
    flags = Array.from({ length: 9 }, (_, i) => ({
        x: 96 + Math.floor(i / 3) * 160,
        z: 96 + (i % 3) * 160,
        name: String.fromCharCode(65 + i),
        title: [
            'NORTH QUARTER',
            'WEST STATION',
            'WAREHOUSE ROW',
            'NORTH BRIDGE',
            'CIVIC CENTRE',
            'SOUTH BRIDGE',
            'FINANCIAL DISTRICT',
            'EAST STATION',
            'PORT AUTHORITY',
        ][i],
        value: 0,
        owner: -1,
        contested: false,
        presence: [0, 0],
    }));
    index = (x, y, z) => (y * config_1.D + z) * config_1.W + x;
    inside = (x, y, z) => Number.isInteger(x) &&
        Number.isInteger(y) &&
        Number.isInteger(z) &&
        x >= 0 &&
        z >= 0 &&
        x < config_1.W &&
        z < config_1.D &&
        y >= 0 &&
        y < config_1.H;
    rnd = (a, b) => a + (b - a) * this.rand();
    dirtyQueue = new Set();
    markDirty(id) {
        const c = this.chunks[id];
        if (c) {
            this.chunkRevisions[id]++;
            c.dirty = true;
            this.dirtyQueue.add(id);
        }
    }
    meshJobs = new Map();
    meshStats = { published: 0, cancelled: 0, pending: 0, lastMs: 0 };
    cancelMeshes() {
        for (const entry of this.meshJobs.values())
            entry.job.return();
        this.meshJobs.clear();
        this.meshStats.pending = 0;
    }
    rebuildPending(budgetMs = 5, camera) {
        if (!(budgetMs > 0) || !Number.isFinite(budgetMs))
            return;
        const start = performance.now(), deadline = start + budgetMs;
        // A small nearest-first window avoids sorting all city chunks every frame.
        const ids = [...this.dirtyQueue].slice(0, 64);
        if (camera)
            ids.sort((a, b) => {
                const x = this.chunks[a], y = this.chunks[b];
                return ((x.x * config_1.CS + 8 - camera.x) ** 2 +
                    (x.z * config_1.CS + 8 - camera.z) ** 2 -
                    ((y.x * config_1.CS + 8 - camera.x) ** 2 + (y.z * config_1.CS + 8 - camera.z) ** 2));
            });
        for (const id of ids) {
            if (performance.now() >= deadline)
                break;
            const c = this.chunks[id];
            if (!c.dirty) {
                this.dirtyQueue.delete(id);
                this.meshJobs.get(id)?.job.return();
                this.meshJobs.delete(id);
                continue;
            }
            let entry = this.meshJobs.get(id);
            if (entry && entry.revision !== this.chunkRevisions[id]) {
                entry.job.return();
                this.meshJobs.delete(id);
                this.meshStats.cancelled++;
                entry = undefined;
            }
            if (!entry) {
                const target = { ...c };
                entry = {
                    revision: this.chunkRevisions[id],
                    target,
                    job: operations.prepareChunk.call(this, target),
                };
                this.meshJobs.set(id, entry);
            }
            while (performance.now() < deadline) {
                if (!entry.job.next().done)
                    continue;
                if (entry.revision === this.chunkRevisions[id]) {
                    Object.assign(c, {
                        mesh: entry.target.mesh,
                        count: entry.target.count,
                        top: entry.target.top,
                        version: c.version + 1,
                        dirty: false,
                    });
                    this.dirtyQueue.delete(id);
                    this.meshStats.published++;
                }
                else
                    this.meshStats.cancelled++;
                this.meshJobs.delete(id);
                break;
            }
        }
        this.meshStats.pending = this.dirtyQueue.size;
        this.meshStats.lastMs = performance.now() - start;
    }
    cityTower = operations.cityTower;
    generateSteps = operations.generateSteps;
    generate() {
        for (const _ of this.generateSteps()) {
        }
    }
    cell = operations.cell;
    solid = operations.solid;
    setRaw = operations.setRaw;
    mark = operations.mark;
    removeVoxel = operations.removeVoxel;
    floorAt = operations.floorAt;
    groundAt = operations.groundAt;
    raycast = operations.raycast;
    visible = operations.visible;
    blocked = operations.blocked;
    buildNavigation() {
        this.navigationTask = null;
        for (const _ of (0, navigation_1.navigationSteps)(this)) {
        }
    }
    advanceNavigation(slices = 8) {
        if (!this.navigationTask) {
            if (!this.navDirty || this.navCooldown > 0)
                return;
            this.navigationTask = (0, navigation_1.navigationSteps)(this);
        }
        for (let i = 0; i < slices; i++) {
            if (this.navigationTask.next().done) {
                this.navigationTask = null;
                break;
            }
        }
    }
    navigationPoint = operations.navigationPoint;
    rand = operations.rand;
    rebuild = operations.rebuild;
}
exports.World = World;

}};
const cache=Object.create(null);
function load(id){if(cache[id])return cache[id].exports;const factory=modules[id];if(!factory)throw Error('Missing game module: '+id);const module={exports:{}};cache[id]=module;factory(function(name){if(!name.startsWith('.'))throw Error('Unexpected external dependency: '+name);const parts=id.split('/');parts.pop();for(const p of name.split('/')){if(p==='..')parts.pop();else if(p!=='.')parts.push(p);}let key=parts.join('/');if(!key.endsWith('.ts'))key+='.ts';return load(key);},module,module.exports);return module.exports;}
load('src/main.ts');
})();
