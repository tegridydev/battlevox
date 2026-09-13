import { D, defaults, W } from '../src/core/config';
import { Simulation } from '../src/simulation/simulation';
import { World } from '../src/world/world';
// Historical physics fixtures use an explicit setup independent of player defaults.
export const fixtureSettings = {
  ...defaults,
  scenario: 'city' as const,
  teamSize: 500,
  seed: 872419,
  minutes: 25,
  shadows: true,
  distance: 340,
  fov: 85,
};

export function flatWorld() {
  const world = new World();
  world.vox.fill(1, 0, W * D);
  world.columnTop.fill(1);
  world.navHeight.fill(1);
  world.navOpen.fill(1);
  world.vehicleOpen.fill(1);
  world.fields = Array.from({ length: 9 }, () => new Uint16Array((W * D) / 4));
  world.vehicleFields = Array.from({ length: 9 }, () => new Uint16Array((W * D) / 4));
  world.navDirty = false;
  return world;
}
export function smallSimulation() {
  const sim = new Simulation({ ...fixtureSettings }, flatWorld());
  sim.actors = Array.from({ length: 20 }, (_, id) => sim.makeActor(id, id < 10 ? 0 : 1, id === 0));
  sim.player = sim.actors[0];
  for (const a of sim.actors) {
    a.x = 30 + a.id * 3;
    a.y = 1;
    a.z = 30;
    a.alive = true;
    a.shield = 0;
    a.lastHit = -100;
  }
  sim.started = true;
  sim.initialDeployment = false;
  sim.playing = true;
  sim.menuState = 'play';
  sim.spatial();
  return sim;
}
export function fullSquads() {
  const s = new Simulation({ ...fixtureSettings }, flatWorld());
  s.actors = Array.from({ length: 1000 }, (_, id) => s.makeActor(id, id < 500 ? 0 : 1, id === 0));
  s.player = s.actors[0];
  s.createSquads();
  s.started = true;
  s.initialDeployment = false;
  s.playing = true;
  s.menuState = 'play';
  return s;
}

/** Generated towers sit on terrain at y=3; flat movement fixtures otherwise have ground at y=1. */
export function towerGround(world: World, x = 100, z = 100, width = 24, depth = 24) {
  for (let zz = z; zz < z + depth; zz++)
    for (let xx = x; xx < x + width; xx++) {
      world.foundationTop[zz * W + xx] = 3;
      world.setRaw(xx, 1, zz, 2);
      world.setRaw(xx, 2, zz, 2);
    }
}
