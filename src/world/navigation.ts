import { ND, NW } from '../core/config';
import type { World } from './world';
/** Builds into separate arrays; consumers never see half-rebuilt navigation fields. */
export function* navigationSteps(world: World): Generator<void, void, unknown> {
  const revision = world.navRevision,
    heights = new Float32Array(NW * ND),
    infantry = new Uint8Array(NW * ND),
    vehicles = new Uint8Array(NW * ND),
    fields: Uint16Array[] = [],
    vehicleFields: Uint16Array[] = [],
    queue = new Int32Array(NW * ND);
  let work = 0;
  for (let z = 0; z < ND; z++)
    for (let x = 0; x < NW; x++) {
      const i = z * NW + x,
        y = world.groundAt(x * 2 + 1, z * 2 + 1);
      heights[i] = y;
      infantry[i] = world.blocked(x * 2 + 1, y, z * 2 + 1, 0.35) ? 0 : 1;
      vehicles[i] = world.blocked(x * 2 + 1, y, z * 2 + 1, 1.85, 1.95) ? 0 : 1;
      if (++work % 2048 === 0) yield;
    }
  function* fill(open: Uint8Array, result: Uint16Array[]) {
    for (const flag of world.flags) {
      const field = new Uint16Array(NW * ND);
      field.fill(65535);
      result.push(field);
      let start = Math.floor(flag.z / 2) * NW + Math.floor(flag.x / 2);
      if (!open[start]) {
        let best = Infinity;
        for (let j = 0; j < open.length; j++) {
          if (open[j]) {
            const d = ((j % NW) * 2 + 1 - flag.x) ** 2 + (Math.floor(j / NW) * 2 + 1 - flag.z) ** 2;
            if (d < best) {
              best = d;
              start = j;
            }
          }
          if (++work % 2048 === 0) yield;
        }
      }
      let head = 0,
        tail = 0;
      if (open[start]) {
        queue[tail++] = start;
        field[start] = 0;
      }
      while (head < tail) {
        const i = queue[head++],
          x = i % NW;
        for (let k = 0; k < 4; k++) {
          if ((k === 0 && x === 0) || (k === 1 && x === NW - 1)) continue;
          const n = i + (k === 0 ? -1 : k === 1 ? 1 : k === 2 ? -NW : NW);
          if (
            n < 0 ||
            n >= open.length ||
            !open[n] ||
            field[n] !== 65535 ||
            Math.abs(heights[n] - heights[i]) > 1.01
          )
            continue;
          field[n] = field[i] + 1;
          queue[tail++] = n;
        }
        if (++work % 2048 === 0) yield;
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
