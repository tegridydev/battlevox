import { CS, D, H, ND, NW, NX, NZ, W } from '../core/config';
import { clamp } from '../core/math';
import type { Chunk, Vec3 } from '../core/types';
import { buildStructuralFrame } from './structural-bays';
import { recordSupports } from './structure';
import type { World } from './world';
export function cityTower(
  this: World,
  x: number,
  z: number,
  w: number,
  d: number,
  floors: number,
  style: number,
) {
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
      this.buildingMap[zz * W + xx] = id;
      this.setRaw(xx, 3, zz, 2);
      for (let y = 4; y <= 4 + b.h; y++) {
        const wall = xx === x || xx === x + w - 1 || zz === z || zz === z + d - 1,
          slab = (y - 4) % 5 === 0,
          shaft = xx >= x + 3 && xx < x + 5 && zz >= z + 3 && zz < z + 5;
        if (slab && !shaft) {
          this.setRaw(xx, y, zz, y === 4 + b.h ? 10 : 4);
          continue;
        }
        if (!wall) continue;
        const doorway =
          y >= 5 &&
          y <= 8 &&
          ((xx >= x + w / 2 - 2 && xx <= x + w / 2 + 2) ||
            (zz >= z + d / 2 - 2 && zz <= z + d / 2 + 2));
        if (doorway) continue;
        const window =
          (y - 4) % 5 >= 2 &&
          (y - 4) % 5 <= 3 &&
          (xx === x || xx === x + w - 1 ? (zz - z) % 4 !== 0 : (xx - x) % 4 !== 0);
        this.setRaw(
          xx,
          y,
          zz,
          window ? (style % 2 ? 11 : 16) : style % 3 === 0 ? 5 : style % 3 === 1 ? 4 : 12,
        );
      }
    }
  // Roof plant and antenna remain physical, destructible blocks.
  for (let xx = x + w - 7; xx < x + w - 3; xx++)
    for (let zz = z + d - 7; zz < z + d - 3; zz++)
      for (let y = 5 + b.h; y < 7 + b.h; y++) this.setRaw(xx, y, zz, 8);
  if (floors > 12)
    for (let y = 5 + b.h; y < Math.min(H, 11 + b.h); y++) this.setRaw(x + w - 4, y, z + 4, 10);
  buildStructuralFrame(this, b);
  recordSupports(this, b);
}

export function* generateSteps(this: World): Generator<void, void, unknown> {
  this.cancelMeshes();
  this.generating = true;
  this.foundationTop.fill(0);
  this.support.reset();
  this.vox.fill(0);
  this.damage.clear();
  this.rubbleCells.clear();
  this.buildings.length = 0;
  this.buildingMap = new Uint16Array(W * D);
  this.columnTop = new Uint8Array(W * D);
  this.revision++;
  this.navRevision++;
  this.navigationTask = null;
  this.dirtyQueue.clear();
  this.chunks.forEach((c, i) => {
    c.top = 0;
    this.markDirty(i);
  });

  for (let z = 0; z < D; z++) {
    if (z % 8 === 0) yield;
    for (let x = 0; x < W; x++) {
      const sx = Math.abs(((((x - 16) % 40) + 60) % 40) - 20),
        sz = Math.abs(((((z - 16) % 40) + 60) % 40) - 20),
        canal = x >= 249 && x <= 262,
        bridge = sz < 7;
      const road = sx < 6 || sz < 6,
        side = sx < 10 || sz < 10,
        h = canal && !bridge ? (x === 249 || x === 262 ? 2 : 1) : side && !road ? 4 : 3;
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
      const x = 24 + i * 40,
        z = 24 + j * 40,
        cx = x + 12,
        cz = z + 12,
        central = Math.hypot(cx - 256, cz - 256);
      if (
        this.flags.some((f) => Math.hypot(f.x - cx, f.z - cz) < 30) ||
        ((i * 3 + j) % 13 === 0 && central > 100)
      ) {
        for (let k = 0; k < 3; k++) {
          const tx = x + 4 + k * 7,
            tz = z + 8 + (k % 2) * 7;
          for (let y = 3; y < 9; y++) this.setRaw(tx, y, tz, 6);
          for (let dx = -2; dx <= 2; dx++)
            for (let dz = -2; dz <= 2; dz++)
              for (let y = 8; y < 12; y++)
                if (Math.abs(dx) + Math.abs(dz) < 4) this.setRaw(tx + dx, y, tz + dz, 7);
        }
        continue;
      }
      const floors =
        central < 135
          ? 12 + Math.floor(this.rand() * 8)
          : central < 225
            ? 6 + Math.floor(this.rand() * 7)
            : 3 + Math.floor(this.rand() * 5);
      this.cityTower(x, z, 24, 24, floors, i + j);
    }
  for (const f of this.flags) {
    for (let k = -7; k <= 7; k++)
      if (Math.abs(k) > 2) {
        for (let y = 3; y < 5; y++) this.setRaw(f.x + k, y, f.z + 10, 9);
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

export function cell(this: World, x: number, y: number, z: number) {
  return this.inside(x, y, z) ? this.vox[this.index(x, y, z)] : 0;
}

export function solid(this: World, x: number, y: number, z: number) {
  return this.cell(Math.floor(x), Math.floor(y), Math.floor(z)) !== 0;
}

export function setRaw(this: World, x: number, y: number, z: number, m: number) {
  if (!this.inside(x, y, z)) return;
  this.rubbleCells.delete(this.index(x, y, z));
  if (m && !this.vox[this.index(x, y, z)]) this.additionRevision++;
  this.vox[this.index(x, y, z)] = m;
  this.damage.delete(this.index(x, y, z));
  if (!this.generating) {
    this.support.changed(x, y, z, m);
    this.mark(x, z);
    this.mapDirty = true;
    if (y < 9) this.navDirty = true;
  }
  this.revision++;
  if (y < 9) this.navRevision++;
  const bid = this.buildingMap[z * W + x];
  if (bid && !this.removingCollapse) {
    const b = this.buildings[bid - 1];
    b.rev++;
    b.dirty = true;
  }
  if (m && this.columnTop) this.columnTop[z * W + x] = Math.max(this.columnTop[z * W + x], y + 1);
  if (m && this.chunks.length) {
    const c = this.chunks[Math.floor(z / CS) * NX + Math.floor(x / CS)];
    if (c) c.top = Math.max(c.top || 0, y + 1);
  }
}

export function mark(this: World, x: number, z: number) {
  for (const [dx, dz] of [
    [0, 0],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]) {
    const cx = Math.floor((x + dx) / CS),
      cz = Math.floor((z + dz) / CS);
    if (cx >= 0 && cz >= 0 && cx < NX && cz < NZ) this.markDirty(cz * NX + cx);
  }
}

export function removeVoxel(this: World, x: number, y: number, z: number) {
  const m = this.cell(x, y, z);
  if (!m || m === 1) return 0;
  this.rubbleCells.delete(this.index(x, y, z));
  this.vox[this.index(x, y, z)] = 0;
  this.support.changed(x, y, z, 0);
  this.revision++;
  if (y < 9) this.navRevision++;
  if (this.columnTop && this.columnTop[z * W + x] === y + 1) {
    let h = y;
    while (h > 0 && !this.cell(x, h - 1, z)) h--;
    this.columnTop[z * W + x] = h;
  }
  this.damage.delete(this.index(x, y, z));
  this.mark(x, z);
  this.mapDirty = true;
  if (y < 9) this.navDirty = true;
  const id = this.buildingMap?.[z * W + x];
  if (id && !this.removingCollapse) {
    const b = this.buildings[id - 1];
    b.dirty = true;
    b.rev = (b.rev || 0) + 1;
  }
  return m;
}

export function floorAt(this: World, x: number, z: number) {
  x = clamp(Math.floor(x), 0, W - 1);
  z = clamp(Math.floor(z), 0, D - 1);
  return Math.max(1, this.columnTop[z * W + x]);
}

export function groundAt(this: World, x: number, z: number) {
  x = clamp(Math.floor(x), 0, W - 1);
  z = clamp(Math.floor(z), 0, D - 1);
  for (let y = 0; y < H - 2; y++)
    if (this.cell(x, y, z) && !this.cell(x, y + 1, z) && !this.cell(x, y + 2, z)) return y + 1;
  return 1;
}

export function raycast(this: World, o: Vec3, d: Vec3, max: number) {
  let x = Math.floor(o.x),
    y = Math.floor(o.y),
    z = Math.floor(o.z),
    t = 0;
  const sx = d.x >= 0 ? 1 : -1,
    sy = d.y >= 0 ? 1 : -1,
    sz = d.z >= 0 ? 1 : -1;
  const dx = d.x ? Math.abs(1 / d.x) : Infinity,
    dy = d.y ? Math.abs(1 / d.y) : Infinity,
    dz = d.z ? Math.abs(1 / d.z) : Infinity;
  let tx = d.x ? ((sx > 0 ? x + 1 : x) - o.x) / d.x : Infinity,
    ty = d.y ? ((sy > 0 ? y + 1 : y) - o.y) / d.y : Infinity,
    tz = d.z ? ((sz > 0 ? z + 1 : z) - o.z) / d.z : Infinity;
  for (let i = 0; i < 640 && t <= max; i++) {
    if (this.cell(x, y, z)) return { x, y, z, t, m: this.cell(x, y, z) };
    if (tx < ty && tx < tz) {
      x += sx;
      t = tx;
      tx += dx;
    } else if (ty < tz) {
      y += sy;
      t = ty;
      ty += dy;
    } else {
      z += sz;
      t = tz;
      tz += dz;
    }
  }
  return null;
}

export function visible(this: World, a: Vec3, b: Vec3) {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    dz = b.z - a.z,
    l = Math.hypot(dx, dy, dz);
  return l < 0.01 || !this.raycast(a, { x: dx / l, y: dy / l, z: dz / l }, l - 0.25);
}

export function blocked(this: World, x: number, y: number, z: number, r = 0.3, height = 1.8) {
  if (x - r < 1 || z - r < 1 || x + r > W - 1 || z + r > D - 1 || y < 0.95) return true;
  for (let zz = Math.floor(z - r); zz <= Math.floor(z + r); zz++)
    for (let xx = Math.floor(x - r); xx <= Math.floor(x + r); xx++)
      for (let yy = Math.floor(y + 0.025); yy <= Math.floor(y + height - 0.035); yy++)
        if (this.cell(xx, yy, zz)) return true;
  return false;
}

export function navigationPoint(this: World, a: Vec3 & { goal: number }, vehicle = false) {
  const cx = clamp(Math.floor(a.x / 2), 0, NW - 1),
    cz = clamp(Math.floor(a.z / 2), 0, ND - 1),
    field = (vehicle ? this.vehicleFields : this.fields)[a.goal];
  let best = 65535,
    bx = a.x,
    bz = a.z;
  for (const [ox, oz] of [
    [0, 0],
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]) {
    const xx = cx + ox,
      zz = cz + oz;
    if (xx < 0 || zz < 0 || xx >= NW || zz >= ND) continue;
    const i = zz * NW + xx;
    if (field[i] < best && Math.abs(this.navHeight[i] - a.y) < 1.1) {
      best = field[i];
      bx = xx * 2 + 1;
      bz = zz * 2 + 1;
    }
  }
  return { x: bx, z: bz, reachable: best < 65535 };
}

export function rand(this: World) {
  this.seed |= 0;
  this.seed = (this.seed + 0x6d2b79f5) | 0;
  let t = Math.imul(this.seed ^ (this.seed >>> 15), 1 | this.seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function* prepareChunk(
  this: World,
  c: Chunk,
  removed = new Set<number>(),
): Generator<void, void, unknown> {
  const sample = (x: number, y: number, z: number) =>
    removed.has(this.index(x, y, z)) ? 0 : this.cell(x, y, z);
  c.top = 1;
  for (let z = c.z * CS; z < (c.z + 1) * CS; z++)
    for (let x = c.x * CS; x < (c.x + 1) * CS; x++) {
      let top = this.columnTop[z * W + x];
      while (top > 0 && !sample(x, top - 1, z)) top--;
      c.top = Math.max(c.top, top);
    }
  // Greedy meshing: merge adjacent coplanar faces into a single rectangle.
  const data = [],
    origin = [c.x * CS, 0, c.z * CS],
    dims = [CS, Math.max(1, c.top || H), CS];
  for (let axis = 0; axis < 3; axis++) {
    const u = (axis + 1) % 3,
      v = (axis + 2) % 3,
      mask = new Int16Array(dims[u] * dims[v]),
      p = [0, 0, 0];
    for (let slice = 0; slice <= dims[axis]; slice++) {
      yield;
      p[axis] = slice;
      let n = 0;
      for (p[v] = 0; p[v] < dims[v]; p[v]++)
        for (p[u] = 0; p[u] < dims[u]; p[u]++) {
          if ((n & 127) === 0) yield;
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
        for (let i = 0; i < dims[u]; ) {
          if (((j * dims[u] + i) & 127) === 0) yield;
          const n = j * dims[u] + i,
            m = mask[n];
          if (!m) {
            i++;
            continue;
          }
          let w = 1,
            h = 1;
          while (i + w < dims[u] && mask[n + w] === m) w++;
          outer: while (j + h < dims[v]) {
            for (let k = 0; k < w; k++) if (mask[n + h * dims[u] + k] !== m) break outer;
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
          const co = this.colours[Math.abs(m)],
            indices = m > 0 ? [0, 1, 2, 0, 2, 3] : [0, 3, 2, 0, 2, 1];
          for (const k of indices) data.push(...corners[k], ...normal, ...co, Math.abs(m));
          for (let yy = 0; yy < h; yy++) mask.fill(0, n + yy * dims[u], n + yy * dims[u] + w);
          i += w;
        }
    }
  }
  c.count = data.length / 10;
  c.mesh = new Float32Array(data);
  c.version++;
  c.dirty = false;
}

export function rebuild(this: World, c: Chunk) {
  for (const _ of prepareChunk.call(this, c)) {
  }
}
