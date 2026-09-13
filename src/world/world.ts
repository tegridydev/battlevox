import { CS, D, H, materials, ND, NW, NX, NZ, W } from '../core/config';
import { fractureResistance } from '../core/material-physics';
import type { Building, Chunk, Colour, Objective, RubbleVoxel } from '../core/types';
import { navigationSteps } from './navigation';
import * as operations from './operations';
import { SupportGraph } from './support';
export class World {
  damageRevision = 0;
  damageVoxel(x: number, y: number, z: number, amount: number) {
    const material = this.cell(x, y, z);
    if (material <= 1 || !Number.isFinite(amount) || amount <= 0)
      return { applied: 0, removed: 0, material };
    const key = this.index(x, y, z),
      before = this.damage.get(key) ?? 0;
    const resistance = fractureResistance(material);
    const applied = Math.min(amount, Math.max(0, resistance - before));
    if (applied <= 0) return { applied: 0, removed: 0, material };
    this.damageRevision++;
    if (before + applied >= resistance)
      return { applied, removed: this.removeVoxel(x, y, z), material };
    this.damage.set(key, before + applied);
    const building = this.buildings[this.buildingMap[z * W + x] - 1];
    if (building) {
      building.rev++;
      building.dirty = true;
    }
    return { applied, removed: 0, material };
  }

  /** Atomic terrain-to-island ownership transfer, with one invalidation per column/chunk. */
  detach(voxels: RubbleVoxel[]) {
    const columns = new Set<number>();
    const buildings = new Set<number>();
    let navigationChanged = false;
    for (const v of voxels) {
      const key = this.index(v.x, v.y, v.z);
      this.vox[key] = 0;
      this.damage.delete(key);
      this.rubbleCells.delete(key);
      columns.add(v.z * W + v.x);
      const bid = this.buildingMap[v.z * W + v.x];
      if (bid) buildings.add(bid - 1);
      navigationChanged ||= v.y < 9;
    }
    for (const bid of buildings) {
      const b = this.buildings[bid];
      b.rev++;
      b.dirty = true;
    }
    this.support.removeCells(voxels);
    for (const column of columns) {
      const x = column % W,
        z = Math.floor(column / W);
      let top = this.columnTop[column];
      while (top > 0 && !this.vox[this.index(x, top - 1, z)]) top--;
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
  chunkRevisions = new Uint32Array(NX * NZ);
  *prepareDetach(
    voxels: RubbleVoxel[],
  ): Generator<void, { chunk: Chunk; mesh: Chunk; revision: number }[], unknown> {
    const removed = new Set<number>(),
      ids = new Set<number>();
    let work = 0;
    const columns = new Set<number>();
    for (const v of voxels) {
      removed.add(this.index(v.x, v.y, v.z));
      columns.add(v.z * W + v.x);
      if (++work % 128 === 0) yield;
    }
    for (const column of columns) {
      const vx = column % W,
        vz = Math.floor(column / W);
      for (const [dx, dz] of [
        [0, 0],
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]) {
        const x = Math.floor((vx + dx) / CS),
          z = Math.floor((vz + dz) / CS);
        if (x >= 0 && z >= 0 && x < NX && z < NZ) ids.add(z * NX + x);
      }
      if (++work % 128 === 0) yield;
    }
    const prepared = [...ids].map((id) => ({
      chunk: this.chunks[id],
      mesh: { ...this.chunks[id] },
      revision: this.chunkRevisions[id],
    }));
    for (const item of prepared) yield* operations.prepareChunk.call(this, item.mesh, removed);
    return prepared;
  }
  generating = false;
  private prepared: { seed: number; revision: number; rng: number } | null = null;
  /** Generation and navigation are shared by preview and deployment. */
  *prepareSteps(seed: number): Generator<void, void, unknown> {
    const ready = this.prepared;
    if (ready?.seed === seed && ready.revision === this.revision && !this.damage.size) {
      this.seed = ready.rng;
      return;
    }
    this.prepared = null;
    this.seed = seed;
    try {
      yield* this.generateSteps();
      yield* navigationSteps(this);
      this.prepared = { seed, revision: this.revision, rng: this.seed };
    } finally {
      this.generating = false;
    }
  }
  foundationTop = new Uint8Array(W * D);
  support = new SupportGraph(this);
  vox = new Uint8Array(W * D * H);
  damage = new Map<number, number>();
  rubbleCells = new Set<number>();
  buildings: Building[] = [];
  chunks: Chunk[] = Array.from({ length: NX * NZ }, (_, i) => ({
    x: i % NX,
    z: Math.floor(i / NX),
    version: 0,
    top: 0,
    dirty: true,
    count: 0,
    mesh: new Float32Array(),
  }));
  columnTop = new Uint8Array(W * D);
  buildingMap = new Uint16Array(W * D);
  removingCollapse = false;
  revision = 0;
  additionRevision = 0;
  navRevision = 0;
  publishedNavRevision = 0;
  publishedNavSourceRevision = -1;
  navigationTask: Generator<void, void, unknown> | null = null;
  navDirty = true;
  mapDirty = true;
  navCooldown = 0;
  navHeight = new Float32Array(NW * ND);
  navOpen = new Uint8Array(NW * ND);
  fields: Uint16Array[] = [];

  vehicleOpen = new Uint8Array(NW * ND);
  vehicleFields: Uint16Array[] = [];
  colours: Colour[] = [...materials];
  sky = [0.57, 0.64, 0.76];
  seed = 872419;
  flags: Objective[] = Array.from({ length: 9 }, (_, i) => ({
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
  index = (x: number, y: number, z: number) => (y * D + z) * W + x;
  inside = (x: number, y: number, z: number) =>
    Number.isInteger(x) &&
    Number.isInteger(y) &&
    Number.isInteger(z) &&
    x >= 0 &&
    z >= 0 &&
    x < W &&
    z < D &&
    y >= 0 &&
    y < H;
  rnd = (a: number, b: number) => a + (b - a) * this.rand();
  dirtyQueue = new Set<number>();
  markDirty(id: number) {
    const c = this.chunks[id];
    if (c) {
      this.chunkRevisions[id]++;
      c.dirty = true;
      this.dirtyQueue.add(id);
    }
  }
  private meshJobs = new Map<
    number,
    { revision: number; target: Chunk; job: Generator<void, void, unknown> }
  >();
  meshStats = { published: 0, cancelled: 0, pending: 0, lastMs: 0 };
  cancelMeshes() {
    for (const entry of this.meshJobs.values()) entry.job.return();
    this.meshJobs.clear();
    this.meshStats.pending = 0;
  }
  rebuildPending(budgetMs = 5, camera?: { x: number; z: number }) {
    if (!(budgetMs > 0) || !Number.isFinite(budgetMs)) return;
    const start = performance.now(),
      deadline = start + budgetMs;
    // A small nearest-first window avoids sorting all city chunks every frame.
    const ids = [...this.dirtyQueue].slice(0, 64);
    if (camera)
      ids.sort((a, b) => {
        const x = this.chunks[a],
          y = this.chunks[b];
        return (
          (x.x * CS + 8 - camera.x) ** 2 +
          (x.z * CS + 8 - camera.z) ** 2 -
          ((y.x * CS + 8 - camera.x) ** 2 + (y.z * CS + 8 - camera.z) ** 2)
        );
      });
    for (const id of ids) {
      if (performance.now() >= deadline) break;
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
        if (!entry.job.next().done) continue;
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
        } else this.meshStats.cancelled++;
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
    for (const _ of navigationSteps(this)) {
    }
  }
  advanceNavigation(slices = 8) {
    if (!this.navigationTask) {
      if (!this.navDirty || this.navCooldown > 0) return;
      this.navigationTask = navigationSteps(this);
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
