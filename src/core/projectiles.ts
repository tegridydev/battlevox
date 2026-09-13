import type { Projectile } from './types';
/** Launch, prediction and simulation must use the same values. */
export const projectileSpec: Record<
  Projectile['type'],
  {
    speed: number;
    gravity: number;
    lift: number;
    fuse: number;
    radius: number;
  }
> = {
  rocket: { speed: 49, gravity: 0.65, lift: 0, fuse: 5, radius: 4.8 },
  shell: { speed: 43, gravity: 3, lift: 0, fuse: 5, radius: 4.2 },
  grenade: { speed: 17, gravity: 19, lift: 4, fuse: 2.7, radius: 3.6 },
  smoke: { speed: 17, gravity: 19, lift: 4, fuse: 1.25, radius: 4.6 },
};
