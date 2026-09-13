import { angleWrap, clamp, lerp } from './math';
import type { Vec3 } from './types';

interface Pose extends Vec3 {
  yaw: number;
  alive?: boolean;
  poseEpoch?: number;
  turret?: number;
}
interface Sample extends Pose {}
/** Presentation history never changes authoritative collision or AI coordinates. */
export class PoseHistory {
  private previous = new WeakMap<Pose, Sample>();
  private views = new WeakMap<Pose, Pose>();
  capture(entities: readonly Pose[]) {
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
  interpolate<T extends Pose>(entity: T, alpha: number): T {
    const old = this.previous.get(entity);
    if (
      !old ||
      old.alive !== entity.alive ||
      old.poseEpoch !== entity.poseEpoch ||
      Math.hypot(entity.x - old.x, entity.y - old.y, entity.z - old.z) > 4
    )
      return entity;
    const t = clamp(Number.isFinite(alpha) ? alpha : 1, 0, 1);
    let view = this.views.get(entity) as T | undefined;
    if (!view) {
      view = { ...entity };
      this.views.set(entity, view);
    } else Object.assign(view, entity);
    view.x = lerp(old.x, entity.x, t);
    view.y = lerp(old.y, entity.y, t);
    view.z = lerp(old.z, entity.z, t);
    view.yaw = old.yaw + angleWrap(entity.yaw - old.yaw) * t;
    if (old.turret !== undefined && entity.turret !== undefined)
      view.turret = old.turret + angleWrap(entity.turret - old.turret) * t;
    return view;
  }
}
