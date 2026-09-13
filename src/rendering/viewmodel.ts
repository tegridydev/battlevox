import type { Vec3 } from '../core/types';
export interface ViewmodelProfile {
  hip: Vec3;
  ads: Vec3;
  scale: number;
  pivot: number;
  reloadTilt: number;
  recoil: number;
}
export const viewmodels: readonly ViewmodelProfile[] = [
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
export const viewmodelFov = Math.PI / 3;
/** Rotate every part centre around the same reload pivot, before camera transformation. */
export function viewmodelPoint(
  p: Vec3,
  profile: ViewmodelProfile,
  aim: number,
  reload: number,
  recoil: number,
  bob = 0,
): Vec3 {
  const t = -reload * profile.reloadTilt,
    c = Math.cos(t),
    s = Math.sin(t);
  const z = p.z - profile.pivot;
  return {
    x: p.x * profile.scale + profile.hip.x + (profile.ads.x - profile.hip.x) * aim,
    y:
      (c * p.y + s * z) * profile.scale +
      profile.hip.y +
      (profile.ads.y - profile.hip.y) * aim -
      reload * 0.16 +
      bob,
    z:
      (-s * p.y + c * z + profile.pivot) * profile.scale +
      profile.hip.z +
      (profile.ads.z - profile.hip.z) * aim -
      recoil * profile.recoil,
  };
}
