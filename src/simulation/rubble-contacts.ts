import type { RubbleBody, Vec3 } from '../core/types';
import { bodyContactQuery, bodyPoseKey } from './body-contact-query';
import { shareCollisionGeometry } from './collision-geometry';
import { type Contact, resolveManifold } from './contact';
import type { DestructionBudget } from './destruction-budget';
import { rubbleBounds } from './rubble-shape';
import { queueImpact } from './section-fracture';
import { intersects, shareSectionTree } from './section-tree';

type Pair = { a: RubbleBody; b: RubbleBody };
interface Pass {
  candidates: Generator<Pair | undefined, void, unknown>;
  pair?: Pair;
  keys?: [string, string];
  query?: Generator<void, Contact[], unknown>;
  contacts?: Contact[];
  corrections?: { body: RubbleBody; point: Vec3; allowed?: boolean }[];
  correctionIndex?: number;
}
const passes = new WeakMap<RubbleBody[], Pass>();

/** Sweep-and-prune retains its position across frames; distant pairs never enter SAT. */
function* candidates(
  bodies: RubbleBody[],
  excluded?: ReadonlySet<RubbleBody>,
): Generator<Pair | undefined, void, unknown> {
  const ordered = bodies
    .filter((b) => b.voxels.length && !excluded?.has(b))
    .map((body) => ({ body, bounds: rubbleBounds(body) }))
    .sort((a, b) => a.bounds.min.x - b.bounds.min.x || a.body.id - b.body.id);
  for (let i = 0; i < ordered.length; i++) {
    const a = ordered[i];
    for (let j = i + 1; j < ordered.length && ordered[j].bounds.min.x < a.bounds.max.x; j++) {
      const b = ordered[j];
      if ((!a.body.sleeping || !b.body.sleeping) && intersects(a.bounds, b.bounds))
        yield { a: a.body, b: b.body };
      else yield;
    }
    yield;
  }
}

// Snapshot only geometry/pose data. Identity, health and velocities remain authoritative on the live body.
function snapshot(body: RubbleBody): RubbleBody {
  const copy = {
    ...body,
    orientation: { ...body.orientation },
    centre: { ...body.centre },
    voxels: body.voxels.slice(),
  };
  shareSectionTree(body, copy);
  shareCollisionGeometry(body, copy);
  return copy;
}
export function contactPassPending(bodies: RubbleBody[]) {
  return passes.has(bodies);
}
export function cancelRubbleContacts(bodies: RubbleBody[]) {
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
export function resolveRubbleContacts(
  bodies: RubbleBody[],
  canMove: (b: RubbleBody, x: number, y: number, z: number) => boolean | 'deferred',
  _cursor = 0,
  budget?: DestructionBudget,
  deferredBodies?: ReadonlySet<RubbleBody>,
): 'complete' | 'deferred' {
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
  const exhausted = () =>
    !!budget && (budget.probes <= 0 || budget.pairs <= 0 || performance.now() >= budget.deadline);
  while (!exhausted()) {
    if (!pass.pair) {
      const next = pass.candidates.next();
      if (budget) budget.probes--;
      if (next.done) {
        passes.delete(bodies);
        return 'complete';
      }
      if (!next.value) continue;
      const { a, b } = next.value;
      if (!bodies.includes(a) || !bodies.includes(b) || !a.voxels.length || !b.voxels.length)
        continue;
      pass.pair = { a, b };
      pass.keys = [bodyPoseKey(a), bodyPoseKey(b)];
      pass.query = bodyContactQuery(snapshot(b), snapshot(a), { x: 0, y: 0, z: 0 }, false, 32);
    }
    if (exhausted()) return 'deferred';
    const { a, b } = pass.pair;
    const unchanged = () =>
      bodies.includes(a) &&
      bodies.includes(b) &&
      pass.keys![0] === bodyPoseKey(a) &&
      pass.keys![1] === bodyPoseKey(b);
    if (!pass.contacts) {
      const next = pass.query!.next();
      if (budget) budget.probes -= 16;
      if (!next.done) continue;
      pass.contacts = next.value.map((c) => ({ ...c, body: a }));
      pass.corrections = [];
      pass.correctionIndex = 0;
      if (unchanged() && pass.contacts.length) {
        const c = pass.contacts.reduce((best, value) =>
          value.penetration > best.penetration ? value : best,
        );
        const ia = a.sleeping ? 0 : 1 / a.mass,
          ib = b.sleeping ? 0 : 1 / b.mass,
          total = Math.max(1e-9, ia + ib);
        for (const [body, scale] of [
          [a, -ia / total],
          [b, ib / total],
        ] as const) {
          if (!scale) continue;
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
    if (exhausted()) return 'deferred';
    if (unchanged()) {
      while (pass.correctionIndex! < pass.corrections!.length) {
        const correction = pass.corrections![pass.correctionIndex!],
          p = correction.point;
        const result = canMove(correction.body, p.x, p.y, p.z);
        if (result === 'deferred') return 'deferred';
        correction.allowed = result;
        pass.correctionIndex!++;
      }
      if (pass.contacts.length) {
        // No impulse is published twice while waiting on a deferred correction query.
        const response = resolveManifold(b, pass.contacts),
          c = pass.contacts[0];
        if (response.closing > 4) {
          queueImpact(a, c.point, response.closing, response.dissipated * 0.25);
          queueImpact(b, c.point, response.closing, response.dissipated * 0.25);
          a.sleeping = b.sleeping = false;
          a.restTime = b.restTime = 0;
        }
        for (const correction of pass.corrections!)
          if (correction.allowed) Object.assign(correction.body, correction.point);
      }
    }
    pass.pair = undefined;
    pass.query = undefined;
    pass.keys = undefined;
    pass.contacts = undefined;
    pass.corrections = undefined;
    pass.correctionIndex = 0;
    if (budget) budget.pairs--;
  }
  return 'deferred';
}
