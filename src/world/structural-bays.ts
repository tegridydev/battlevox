import { fractureResistance, physicsMaterial } from '../core/material-physics';
import type { Building, Vec3 } from '../core/types';
import type { World } from './world';
export interface StructuralMember {
  id: number;
  kind: 'column' | 'core' | 'beam';
  floor: number;
  cells: Vec3[];
  sections: Vec3[][];
  baseline: number;
  health: number;
  stress: number;
  fatigue: number;
  failed: boolean;
}
export interface StructuralBay {
  id: number;
  floor: number;
  column: number;
  x: number;
  z: number;
  neighbours: {
    bay: number;
    beam: number;
  }[];
  slab: Vec3[];
  initialMass: number;
  designLoad: number;
  load: number;
  capacity: number;
  stress: number;
}
export interface StructuralModel {
  members: StructuralMember[];
  bays: StructuralBay[];
  perFloor: number;
  lastTime: number;
  revision: number;
  failures: number;
  maxStress: number;
  unstable: boolean;
}
const offsets = (size: number) => [2, Math.floor(size / 2), size - 3];
const capacity = (world: World, p: Vec3) => {
  const m = world.cell(p.x, p.y, p.z);
  if (!m || m === 7 || m === 11 || m === 16) return 0;
  return (
    physicsMaterial(m).compression *
    Math.max(0, 1 - (world.damage.get(world.index(p.x, p.y, p.z)) ?? 0) / fractureResistance(m))
  );
};
const sectionCapacity = (world: World, sections: Vec3[][]) =>
  Math.min(...sections.map((s) => s.reduce((n, p) => n + capacity(world, p), 0)));
/** Author a light frame inside the existing shell. Slabs and the lift remain navigable. */
export function buildStructuralFrame(world: World, b: Building) {
  const xs = offsets(b.w),
    zs = offsets(b.d);
  for (let floor = 0; floor < b.floors; floor++) {
    const bottom = b.base + floor * 5;
    for (let iz = 0; iz < 3; iz++)
      for (let ix = 0; ix < 3; ix++) {
        const core = ix === 1 && iz === 1,
          size = core ? 2 : 1;
        for (let dx = 0; dx < size; dx++)
          for (let dz = 0; dz < size; dz++)
            for (let y = bottom + 1; y < bottom + 5; y++)
              world.setRaw(b.x + xs[ix] + dx, y, b.z + zs[iz] + dz, core ? 12 : 4);
      }
    // Beam soffits sit one voxel below each floor, above standing head height.
    for (const z of zs)
      for (let x = xs[0]; x <= xs[2]; x++) world.setRaw(b.x + x, bottom + 4, b.z + z, 12);
    for (const x of xs)
      for (let z = zs[0]; z <= zs[2]; z++) world.setRaw(b.x + x, bottom + 4, b.z + z, 12);
  }
  const model: StructuralModel = {
    members: [],
    bays: [],
    perFloor: 9,
    lastTime: 0,
    revision: b.rev,
    failures: 0,
    maxStress: 0,
    unstable: false,
  };
  const member = (kind: StructuralMember['kind'], floor: number, sections: Vec3[][]) => {
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
  const bounds = (a: number[], i: number, size: number) => [
    i === 0 ? 0 : Math.floor((a[i - 1] + a[i]) / 2) + 1,
    i === 2 ? size : Math.floor((a[i] + a[i + 1]) / 2) + 1,
  ];
  for (let floor = 0; floor < b.floors; floor++) {
    const bottom = b.base + floor * 5;
    for (let iz = 0; iz < 3; iz++)
      for (let ix = 0; ix < 3; ix++) {
        const core = ix === 1 && iz === 1,
          sections: Vec3[][] = [];
        for (let y = bottom + 1; y < bottom + 5; y++) {
          const section: Vec3[] = [];
          for (let dx = 0; dx < (core ? 2 : 1); dx++)
            for (let dz = 0; dz < (core ? 2 : 1); dz++)
              section.push({ x: b.x + xs[ix] + dx, y, z: b.z + zs[iz] + dz });
          sections.push(section);
        }
        const column = member(core ? 'core' : 'column', floor, sections),
          slab: Vec3[] = [];
        const [x0, x1] = bounds(xs, ix, b.w),
          [z0, z1] = bounds(zs, iz, b.d);
        for (let x = x0; x < x1; x++)
          for (let z = z0; z < z1; z++) slab.push({ x: b.x + x, y: bottom + 5, z: b.z + z });
        const initialMass = slab.reduce(
          (n, p) =>
            n +
            physicsMaterial(world.cell(p.x, p.y, p.z)).density *
              (world.cell(p.x, p.y, p.z) ? 1 : 0),
          0,
        );
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
          if (ix + dx >= 3 || iz + dz >= 3) continue;
          const other = model.bays[floor * 9 + (iz + dz) * 3 + ix + dx],
            sections: Vec3[][] = [];
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
export function* solveStructuralBays(
  world: World,
  b: Building,
  time: number,
): Generator<void, boolean, unknown> {
  const model = b.structure;
  if (!model) return false;
  const revision = b.rev,
    dt = Math.min(0.35, Math.max(1 / 30, time - model.lastTime));
  const health: number[] = [],
    weakest: Vec3[][] = [];
  let work = 0;
  for (const member of model.members) {
    let min = Infinity,
      weak: Vec3[] = [];
    for (const section of member.sections) {
      const c = section.reduce((n, p) => n + capacity(world, p), 0);
      if (c < min) {
        min = c;
        weak = section;
      }
      if (++work % 96 === 0) yield;
    }
    health[member.id] = member.baseline > 0 ? Math.min(1, min / member.baseline) : 0;
    weakest[member.id] = weak;
  }
  const loads = new Float64Array(model.bays.length),
    capacities = new Float64Array(model.bays.length);
  const fail: number[] = [],
    fatigue = model.members.map((m) => m.fatigue),
    stresses = model.members.map(() => 0);
  let unstable = false,
    maxStress = 0;
  for (let f = b.floors - 1; f >= 0; f--) {
    const floor = model.bays.slice(f * 9, (f + 1) * 9);
    for (const bay of floor) {
      let mass = 0;
      for (const p of bay.slab) {
        const m = world.cell(p.x, p.y, p.z);
        if (m) mass += physicsMaterial(m).density;
        if (++work % 256 === 0) yield;
      }
      loads[bay.id] += mass;
      const core = model.members[bay.column].kind === 'core';
      capacities[bay.id] = bay.designLoad * (core ? 2.1 : 1.6) * health[bay.column];
    }
    // Spread excess to adjacent spare capacity. Four relaxation passes cross the 3x3 grid.
    for (let pass = 0; pass < 4; pass++)
      for (const bay of floor) {
        const excess = Math.max(0, loads[bay.id] - capacities[bay.id]);
        if (excess < 0.001) continue;
        const paths = bay.neighbours
          .filter((e) => health[e.beam] > 0.05)
          .map((e) => ({
            id: e.bay,
            spare: Math.max(0, capacities[e.bay] - loads[e.bay]) * health[e.beam],
            beam: e.beam,
          }));
        const total = paths.reduce((n, e) => n + e.spare, 0),
          transfer = Math.min(total, excess);
        for (const e of paths)
          if (total > 0) {
            const amount = (transfer * e.spare) / total;
            loads[e.id] += amount;
            loads[bay.id] -= amount;
            stresses[e.beam] = Math.max(
              stresses[e.beam],
              amount / Math.max(1, bay.designLoad * 0.7 * health[e.beam]),
            );
          }
      }
    // If a column is gone and no spare remains, its connected neighbours must still carry the
    // load, rather than letting zero-capacity supports silently absorb it.
    for (const bay of floor)
      if (health[bay.column] < 0.001 && loads[bay.id] > 0.001) {
        const paths = bay.neighbours.filter(
          (e) => health[e.beam] > 0.05 && health[model.bays[e.bay].column] > 0.001,
        );
        if (paths.length) {
          const amount = loads[bay.id] / paths.length;
          loads[bay.id] = 0;
          for (const e of paths) loads[e.bay] += amount;
        }
      }
    for (const bay of floor) {
      const id = bay.column,
        stress = capacities[bay.id] > 0.001 ? loads[bay.id] / capacities[bay.id] : 0;
      stresses[id] = stress;
      maxStress = Math.max(maxStress, stress);
      if (f > 0) loads[bay.id - 9] += health[id] > 0.001 ? loads[bay.id] : 0;
    }
    yield;
  }
  for (const m of model.members) {
    const stress = stresses[m.id];
    if (stress > 1.02 && health[m.id] > 0.001) {
      fatigue[m.id] += dt * Math.min(5, (stress - 1) * 1.4);
      unstable = true;
    } else fatigue[m.id] = Math.max(0, fatigue[m.id] - dt * 0.18);
    if (fatigue[m.id] >= 0.8 && health[m.id] > 0.001) fail.push(m.id);
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
    for (const p of weakest[id]) world.removeVoxel(p.x, p.y, p.z);
    unstable = true;
  }
  model.revision = b.rev;
  return unstable;
}
