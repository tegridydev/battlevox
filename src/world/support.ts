import { CS, D, NX, W } from '../core/config';
import type { RubbleVoxel } from '../core/types';
import { bearsLoad } from './structure';
import type { World } from './world';

interface Component {
  id: number;
  chunk: number;
  cells: number[];
  structural: boolean;
  anchored: boolean;
  edges: Set<number>;
}
/** Chunk-local components keep a severed tree and a damaged tower on the same support graph. */
export class SupportGraph {
  cells = new Map<number, Set<number>>();
  dirty = new Set<number>();
  private nodes = new Map<number, Component>();
  private owners = new Map<number, number>();
  private chunks = new Map<number, number[]>();
  private nextId = 0;
  constructor(private world: World) {}
  reset() {
    this.cells.clear();
    this.dirty.clear();
    this.nodes.clear();
    this.owners.clear();
    this.chunks.clear();
    this.nextId = 0;
  }
  private chunk(x: number, z: number) {
    return Math.floor(z / CS) * NX + Math.floor(x / CS);
  }
  changed(x: number, y: number, z: number, material: number) {
    const chunk = this.chunk(x, z),
      key = this.world.index(x, y, z);
    let cells = this.cells.get(chunk);
    if (material && material !== 1 && y >= this.world.foundationTop[z * W + x]) {
      if (!cells) {
        cells = new Set();
        this.cells.set(chunk, cells);
      }
      cells.add(key);
    } else cells?.delete(key);
    this.dirty.add(chunk);
    for (const [dx, dz] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      if (this.world.inside(x + dx, y, z + dz)) this.dirty.add(this.chunk(x + dx, z + dz));
    }
  }
  removeCells(voxels: RubbleVoxel[]) {
    const chunks = new Set<number>();
    for (const v of voxels) {
      const chunk = this.chunk(v.x, v.z);
      this.cells.get(chunk)?.delete(this.world.index(v.x, v.y, v.z));
      chunks.add(chunk);
    }
    for (const chunk of chunks) {
      this.dirty.add(chunk);
      for (const delta of [-NX, NX, -1, 1])
        if (chunk + delta >= 0 && chunk + delta < NX * NX) this.dirty.add(chunk + delta);
    }
  }
  invalidateBuilding(x: number, z: number, width: number, depth: number) {
    for (let zz = Math.floor(z / CS); zz <= Math.floor((z + depth - 1) / CS); zz++)
      for (let xx = Math.floor(x / CS); xx <= Math.floor((x + width - 1) / CS); xx++)
        this.dirty.add(zz * NX + xx);
  }
  private position(key: number) {
    return { x: key % W, y: Math.floor(key / (W * D)), z: Math.floor(key / W) % D };
  }
  private neighbours(key: number) {
    const { x, y, z } = this.position(key),
      result: number[] = [];
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
  private cut(a: number, b: number) {
    if (this.world.rubbleCells.has(a) || this.world.rubbleCells.has(b)) return false;
    const p = this.position(a),
      q = this.position(b);
    const id = this.world.buildingMap[p.z * W + p.x];
    if (!id || id !== this.world.buildingMap[q.z * W + q.x]) return false;
    const building = this.world.buildings[id - 1];
    if (building?.structure && p.x === q.x && p.z === q.z && p.y !== q.y) {
      const lower = Math.min(p.y, q.y),
        floor = (lower - building.base) / 5;
      if (Number.isInteger(floor) && floor >= 0 && floor < building.floors) {
        // Façade panels attach to their floor but cannot carry the next storey's gravity load.
        // Only authored column/core footprints bridge this floor-to-storey support plane.
        const x = p.x - building.x,
          z = p.z - building.z;
        const cx = Math.floor(building.w / 2),
          cz = Math.floor(building.d / 2);
        const column =
          (x === 2 || x === cx || x === building.w - 3) &&
          (z === 2 || z === cz || z === building.d - 3);
        const core = x >= cx && x < cx + 2 && z >= cz && z < cz + 2;
        if (!column && !core) return true;
      }
    }
    const fracture = building?.fractureHeight;
    return fracture !== undefined && p.y > fracture !== q.y > fracture;
  }
  /** Publish complete local components; geometry is revalidated at detachment by the caller. */
  *unsupported(): Generator<void, RubbleVoxel[][], unknown> {
    let work = 0;
    const pending = [...this.dirty];
    for (const chunk of pending) {
      this.dirty.delete(chunk);
      for (const id of this.chunks.get(chunk) ?? []) {
        const node = this.nodes.get(id);
        if (node) for (const key of node.cells) this.owners.delete(key);
        this.nodes.delete(id);
      }
      const ids: number[] = [],
        remaining = new Set(this.cells.get(chunk));
      while (remaining.size) {
        const first = remaining.values().next().value!;
        const p = this.position(first),
          material = this.world.cell(p.x, p.y, p.z);
        if (!material) {
          remaining.delete(first);
          continue;
        }
        const node: Component = {
          id: this.nextId++,
          chunk,
          cells: [],
          structural: bearsLoad(material),
          anchored: false,
          edges: new Set(),
        };
        const queue = [first];
        remaining.delete(first);
        for (let head = 0; head < queue.length; head++) {
          const key = queue[head];
          node.cells.push(key);
          for (const near of this.neighbours(key)) {
            const n = this.position(near),
              m = this.world.cell(n.x, n.y, n.z);
            if (!m || this.cut(key, near)) continue;
            if (m === 1 || n.y < this.world.foundationTop[n.z * W + n.x]) node.anchored = true;
            if (remaining.has(near) && bearsLoad(m) === node.structural) {
              remaining.delete(near);
              queue.push(near);
            }
          }
          if (++work % 128 === 0) yield;
        }
        ids.push(node.id);
        this.nodes.set(node.id, node);
        for (const key of node.cells) {
          this.owners.set(key, node.id);
          if (++work % 128 === 0) yield;
        }
      }
      this.chunks.set(chunk, ids);
    }
    // Edges include attached glass/leaves, but only structural nodes carry foundation reachability.
    const affected = new Set(pending);
    for (const chunk of pending) for (const delta of [-NX, NX, -1, 1]) affected.add(chunk + delta);
    for (const node of this.nodes.values()) {
      if (!affected.has(node.chunk)) continue;
      node.edges.clear();
      for (const key of node.cells) {
        for (const near of this.neighbours(key)) {
          const owner = this.owners.get(near);
          if (owner !== undefined && owner !== node.id && !this.cut(key, near))
            node.edges.add(owner);
        }
        if (++work % 128 === 0) yield;
      }
    }
    const supported = new Set<number>(),
      queue: number[] = [];
    for (const node of this.nodes.values())
      if (node.structural && node.anchored) {
        supported.add(node.id);
        queue.push(node.id);
      }
    for (let head = 0; head < queue.length; head++) {
      const node = this.nodes.get(queue[head])!;
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
    const visited = new Set<number>(),
      result: RubbleVoxel[][] = [];
    for (const start of this.nodes.values()) {
      if (supported.has(start.id) || visited.has(start.id)) continue;
      const todo = [start.id],
        voxels: RubbleVoxel[] = [];
      let stale = false;
      visited.add(start.id);
      for (let head = 0; head < todo.length; head++) {
        const node = this.nodes.get(todo[head])!;
        stale ||= this.dirty.has(node.chunk);
        for (const key of node.cells) {
          const p = this.position(key),
            material = this.world.cell(p.x, p.y, p.z);
          if (material) voxels.push({ ...p, material });
          if (++work % 128 === 0) yield;
        }
        for (const edge of node.edges)
          if (!supported.has(edge) && !visited.has(edge)) {
            visited.add(edge);
            todo.push(edge);
          }
      }
      if (!stale && voxels.length) result.push(voxels);
    }
    return result;
  }
}
