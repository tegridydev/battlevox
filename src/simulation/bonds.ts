import { hash, physicsMaterial } from '../core/material-physics';
import type { RubbleVoxel } from '../core/types';
export const bondKey = (a: number, b: number) => (a < b ? `${a}:${b}` : `${b}:${a}`);
export function bondCost(a: RubbleVoxel, b: RubbleVoxel) {
  const x = physicsMaterial(a.material).toughness,
    y = physicsMaterial(b.material).toughness;
  const mixed = (2 * x * y) / Math.max(1e-8, x + y);
  return Math.max(
    0.01,
    12 *
      mixed *
      (a.grain === b.grain ? 1.15 : 0.85) *
      (0.9 + (0.2 * hash((a.id ?? 0) ^ (b.id ?? 0))) / 4294967295),
  );
}
/** Returns actual paid work; five-bit damage never stores the accumulated energy. */
export function depositWork(
  work: Map<string, number>,
  a: RubbleVoxel,
  b: RubbleVoxel,
  energy: number,
) {
  if (!(energy > 0) || !Number.isFinite(energy)) return 0;
  const key = bondKey(a.id!, b.id!),
    cost = bondCost(a, b),
    old = work.get(key) ?? 0,
    paid = Math.min(energy, Math.max(0, cost - old));
  if (paid > 0) work.set(key, old + paid);
  return paid;
}
export const bondLevel = (work: Map<string, number>, a: RubbleVoxel, b: RubbleVoxel) =>
  Math.min(31, Math.floor(((work.get(bondKey(a.id!, b.id!)) ?? 0) / bondCost(a, b)) * 31 + 1e-6));
