import { NX, W } from '../core/config';
import { dist2, TAU } from '../core/math';
import type { Building, Colour } from '../core/types';
import { solveStructuralBays } from '../world/structural-bays';
import {
  bearsLoad,
  collapseDirection,
  failedSupportLevel,
  supportCapacity,
} from '../world/structure';
import { prepareCollisionBoxes } from './collision-geometry';
import { newDestructionBudget } from './destruction-budget';
import { createRubble } from './rubble';
import { prepareSectionMesh } from './section-mesh';
import { prepareSectionTree } from './section-tree';
import type { Simulation } from './simulation';

const overloads = new WeakMap<Building, { level: number; ticks: number }>();
function* assess(sim: Simulation, b: Building): Generator<void, void, unknown> {
  if (b.structure) {
    const before = b.structure.failures;
    b.dirty = yield* solveStructuralBays(sim.world, b, sim.simTime);
    if (b.structure.failures > before) {
      sim.addDust({ x: b.x + b.w / 2, y: b.base + 2, z: b.z + b.d / 2 }, 3, 0.35);
      sim.soundAt('crack', b.x + b.w / 2, b.z + b.d / 2, 0.5);
    }
    return;
  }
  const revision = b.rev;
  const counts = new Float32Array(b.h + 1),
    mx = new Float32Array(b.h + 1),
    mz = new Float32Array(b.h + 1);
  const seen = new Uint8Array(b.w * b.d * counts.length),
    queue: number[] = [];
  const index = (x: number, y: number, z: number) => (y * b.d + z) * b.w + x;
  for (let z = 0; z < b.d; z++)
    for (let x = 0; x < b.w; x++)
      if (
        bearsLoad(sim.world.cell(b.x + x, b.base, b.z + z)) &&
        sim.world.cell(b.x + x, b.base - 1, b.z + z)
      ) {
        const key = index(x, 0, z);
        seen[key] = 1;
        queue.push(key);
      }
  for (let head = 0; head < queue.length; head++) {
    const key = queue[head],
      x = key % b.w,
      z = Math.floor(key / b.w) % b.d,
      y = Math.floor(key / (b.w * b.d));
    if (head % 128 === 0) yield;
    const capacity = supportCapacity(sim.world, b.x + x, b.base + y, b.z + z);
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
      const xx = x + dx,
        yy = y + dy,
        zz = z + dz;
      if (xx < 0 || zz < 0 || yy < 0 || xx >= b.w || zz >= b.d || yy >= counts.length) continue;
      const near = index(xx, yy, zz);
      if (!seen[near] && bearsLoad(sim.world.cell(b.x + xx, b.base + yy, b.z + zz))) {
        seen[near] = 1;
        queue.push(near);
      }
    }
  }
  if (revision !== b.rev) return;
  const fracture = Math.min(b.fractureHeight ?? Infinity, failedSupportLevel(b, counts, mx, mz));
  if (Number.isFinite(fracture) && fracture !== b.fractureHeight) {
    const memory = overloads.get(b);
    const ticks = memory?.level === fracture ? memory.ticks + 1 : 1;
    overloads.set(b, { level: fracture, ticks });
    if (counts[fracture - b.base] > 0 && ticks < 3) return;
    b.fractureHeight = fracture;
    // Legacy authored shapes use a virtual seam, not whole-storey voxel deletion.
    sim.addDust({ x: b.x + b.w / 2, y: fracture, z: b.z + b.d / 2 }, Math.min(5, b.w / 2), 0.5);
    const level = fracture - b.base;
    b.collapseDirection = collapseDirection(b, counts[level], mx[level], mz[level]);
    sim.world.support.invalidateBuilding(b.x, b.z, b.w, b.d);
    sim.notify('STRUCTURE FAILING · SUPPORT LOST');
  }
  b.dirty = false;
}
export function* scanStructure(this: Simulation, b?: Building): Generator<void, void, unknown> {
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
      if (voxels.some((v) => this.world.cell(v.x, v.y, v.z) !== v.material)) continue;
      const first = voxels[0],
        building = this.world.buildings[this.world.buildingMap[first.z * W + first.x] - 1];
      const direction = building?.collapseDirection ?? {
        x: Math.sin(first.x + first.z),
        y: 0,
        z: Math.cos(first.x + first.z),
      };
      const lean = Math.min(
        5,
        0.8 + Math.max(0, first.y - (building?.fractureHeight ?? first.y)) * 0.06,
      );
      const additions = this.world.additionRevision;
      const revision = building?.rev;
      this.collapsePreparing = true;
      for (const v of voxels)
        v.damage = this.world.damage.get(this.world.index(v.x, v.y, v.z)) ?? 0;
      const body = yield* createRubble(
        this,
        voxels,
        { x: direction.x * lean, y: -0.3, z: direction.z * lean },
        true,
      );
      if (!body) throw Error('Unable to detach structural section');
      yield* prepareSectionTree(body);
      yield* prepareCollisionBoxes(body);
      yield* prepareSectionMesh(body, this.world.colours);
      const terrain = yield* this.world.prepareDetach(voxels);
      this.collapsePreparing = false;
      if (
        terrain.some(
          (item) => this.world.chunkRevisions[item.chunk.z * NX + item.chunk.x] !== item.revision,
        ) ||
        additions !== this.world.additionRevision ||
        revision !== building?.rev ||
        voxels.some((v) => this.world.cell(v.x, v.y, v.z) !== v.material)
      ) {
        this.world.support.invalidateBuilding(body.x, body.z, body.width, body.depth);
        continue;
      }
      body.damage = new Map();
      for (const v of body.voxels) {
        v.damage =
          this.world.damage.get(this.world.index(v.x + body.x, v.y + body.y, v.z + body.z)) ?? 0;
        if (v.damage) body.damage.set(v, v.damage);
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
        this.world.dirtyQueue.delete(item.chunk.z * NX + item.chunk.x);
      }
    }
  }
}
export function structural(this: Simulation, b: Building) {
  return this.scanStructure(b);
}
const assessmentClocks = new WeakMap<Simulation, { tick: number; next: number }>();
export function advanceCollapse(this: Simulation) {
  const clock = assessmentClocks.get(this) ?? { tick: 0, next: 0 };
  assessmentClocks.set(this, clock);
  clock.tick++;
  if (!this.collapseTask) {
    const sim = this;
    this.collapseTask = (function* () {
      if (clock.tick >= clock.next) {
        clock.next = clock.tick + 3; // 10 Hz at the shared 30 Hz simulation rate.
        for (const b of sim.world.buildings) if (b.dirty) yield* assess(sim, b);
      }
      if (sim.world.support.dirty.size) yield* sim.scanStructure();
    })();
  }
  const start = performance.now();
  const budget = this.destructionBudget ?? newDestructionBudget();
  while (this.collapseTask && performance.now() - start < 4) {
    const phase = this.collapsePreparing ? 'prepareMs' : 'supportMs';
    if (budget[phase] <= 0) break;
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

export function updateDebris(this: Simulation, dt: number) {
  for (let i = this.particles.length - 1; i >= 0; i--) {
    const p = this.particles[i];
    p.life -= dt;
    if (p.life <= 0) {
      this.particles.splice(i, 1);
      continue;
    }
    if (p.settled) continue;
    p.vy = Math.max(-42, p.vy - 18 * dt);
    const steps = Math.max(
      1,
      Math.ceil((Math.max(Math.abs(p.vx), Math.abs(p.vy), Math.abs(p.vz)) * dt) / 0.25),
    );
    for (let j = 0; j < steps; j++) {
      const d = dt / steps,
        x = p.x + p.vx * d,
        y = p.y + p.vy * d,
        z = p.z + p.vz * d;
      if (this.world.solid(x, p.y, p.z)) p.vx *= -0.25;
      else p.x = x;
      if (this.world.solid(p.x, p.y, z)) p.vz *= -0.25;
      else p.z = z;
      if (y < p.size * 0.5 + 1 || this.world.solid(p.x, y - p.size * 0.5, p.z)) {
        if (p.vy < -8 && p.size > 0.65) {
          this.neighbours(p.x, p.z, 2, (a) => {
            if (a.alive && Math.abs(a.y - p.y) < 2 && dist2(a, p) < 2)
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
      } else p.y = y;
    }
    p.yaw += p.spin * dt;
    p.pitch += p.spin * 0.7 * dt;
  }
}

export function emitParticle(
  this: Simulation,
  x: number,
  y: number,
  z: number,
  c: Colour,
  size = 0.2,
  speed = 5,
  life = 2,
) {
  if (this.particles.length >= 420) return;
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
    yaw: this.effectRnd(0, TAU),
    pitch: 0,
    spin: this.effectRnd(-5, 5),
  });
}
