import { expect, test } from 'bun:test';
import { weapons } from '../../src/core/config';
import { atTeamBase, scenarios } from '../../src/core/scenarios';
import type { Vehicle } from '../../src/core/types';
import { identity } from '../../src/simulation/rotation';
import { sectionOverlap } from '../../src/simulation/rubble-shape';
import { type ImpactPose, sectionImpact } from '../../src/simulation/section-impact';
import { smallSimulation } from '../helpers';

function rotatingSection(gap = false) {
  const sim = smallSimulation();
  sim.spawnRubble(
    (gap ? [0, 8] : Array.from({ length: 9 }, (_, i) => i)).map((x) => ({
      x: 100 + x,
      y: 10,
      z: 100,
      material: 4,
    })),
    undefined,
    true,
  );
  const body = sim.rubble[0];
  const old: ImpactPose = {
    x: body.x,
    y: body.y,
    z: body.z,
    orientation: identity(),
    omega: { x: 0, y: 8, z: 0 },
    vx: 0,
    vy: 0,
    vz: 0,
  };
  body.yaw = Math.PI / 2;
  return { sim, body, old };
}

test('rotation-only sweep hits an actor between clear endpoint poses', () => {
  const { sim, body, old } = rotatingSection();
  try {
    const target = { x: 107.3, y: 10, z: 97.7 };
    expect(sectionOverlap(body, target, 0.3, 1.8)).toBe(false);
    body.yaw = 0;
    expect(sectionOverlap(body, target, 0.3, 1.8)).toBe(false);
    body.yaw = Math.PI / 2;
    const hit = sectionImpact(body, old, target, 0.3, 1.8);
    expect(hit).not.toBeNull();
    expect(hit!.speed).toBeGreaterThan(20);
  } finally {
    sim.dispose();
  }
});

test('rotating occupied geometry preserves the gap around its centre', () => {
  const { sim, body, old } = rotatingSection(true);
  try {
    expect(sectionImpact(body, old, { x: 104.5, y: 10, z: 100.5 }, 0.3, 1.8)).toBeNull();
  } finally {
    sim.dispose();
  }
});

test('translation sweep detects intervening actors without endpoint overlap', () => {
  const { sim, body, old } = rotatingSection();
  try {
    body.yaw = 0;
    body.z += 10;
    old.vz = 25;
    old.omega.y = 0;
    const hit = sectionImpact(body, old, { x: 104, y: 10, z: 105 }, 0.3, 1.8);
    expect(hit).not.toBeNull();
    expect(hit!.speed).toBeCloseTo(25);
  } finally {
    sim.dispose();
  }
});

for (const protectedActor of [false, true])
  test(`live rotating debris respects shielding=${protectedActor} and records hits once`, () => {
    const sim = smallSimulation();
    try {
      for (const actor of sim.actors) actor.alive = false;
      const actor = sim.actors[10];
      Object.assign(actor, {
        alive: true,
        hp: 1000,
        x: 108,
        y: 10,
        z: 99.5,
        shield: protectedActor ? 3 : 0,
      });
      sim.spatial();
      sim.spawnRubble(
        Array.from({ length: 9 }, (_, x) => ({ x: 100 + x, y: 10, z: 100, material: 4 })),
        undefined,
        true,
      );
      const body = sim.rubble[0];
      body.omega.y = 8;
      for (let i = 0; i < 8; i++) sim.updateRubble(1 / 120);
      expect(protectedActor ? actor.hp === 1000 : actor.hp < 1000).toBe(true);
      expect(body.hitActors.has(actor.id)).toBe(!protectedActor);
      const hp = actor.hp;
      for (let i = 0; i < 8; i++) sim.updateRubble(1 / 120);
      expect(actor.hp).toBe(hp);
    } finally {
      sim.dispose();
    }
  });

function pushFixture() {
  const sim = smallSimulation();
  for (const a of sim.actors) a.alive = false;
  const a = sim.actors[1],
    b = sim.actors[2];
  Object.assign(a, { alive: true, x: 52.4, y: 1, z: 50.5 });
  const vehicle = {
    x: 50.5,
    y: 1,
    z: 50.5,
    radius: 1.85,
    height: 1.95,
    alive: true,
    team: 0,
  } as Vehicle;
  return { sim, a, b, vehicle };
}
for (const movingOther of [false, true])
  test(`vehicle push rejects ${movingOther ? 'colliding proposed moves' : 'stationary infantry'} atomically`, () => {
    const { sim, a, b, vehicle } = pushFixture();
    try {
      Object.assign(b, { alive: true, x: movingOther ? 52.95 : 53.65, y: 1, z: 50.5 });
      const before = [a.x, a.z, b.x, b.z];
      expect(sim.pushInfantry(vehicle, 51, 1, 50.5)).toBe(false);
      expect([a.x, a.z, b.x, b.z]).toEqual(before);
    } finally {
      sim.dispose();
    }
  });
test('vehicle pushes retain valid spacing and ignore soldiers on other floors', () => {
  const { sim, a, b, vehicle } = pushFixture();
  try {
    Object.assign(b, { alive: true, x: 53.65, y: 5, z: 50.5 });
    expect(sim.pushInfantry(vehicle, 51, 1, 50.5)).toBe(true);
    expect(a.x).toBeGreaterThan(53.17);
    expect(b.x).toBe(53.65);
  } finally {
    sim.dispose();
  }
});

for (const id of ['city', 'frontline'] as const)
  for (const team of [0, 1] as const) {
    test(`${id} team ${team} resupplies at its active home and preserves loaded ammunition`, () => {
      const sim = smallSimulation();
      try {
        sim.testArena = id;
        sim.settings.scenario = id === 'city' ? 'frontline' : 'city';
        sim.player.team = team;
        sim.player.x = scenarios[id].homes[team];
        sim.player.z = 30;
        sim.reserves.fill(0);
        sim.ammo.fill(1);
        sim.grenades = 0;
        sim.smokeGrenades = 0;
        sim.player.supply = 5.9;
        sim.capture(0.2);
        expect(sim.reserves).toEqual(weapons.map((w) => w.reserve));
        expect(sim.ammo.every((n) => n === 1)).toBe(true);
        expect(sim.grenades).toBe(3);
        expect(sim.smokeGrenades).toBe(2);
        const boundary = scenarios[id].homes[team] + (team === 0 ? 30 : -30);
        expect(atTeamBase(id, team, boundary)).toBe(false);
        expect(atTeamBase(id, team, boundary + (team === 0 ? -0.01 : 0.01))).toBe(true);
        sim.player.x = boundary;
        sim.reserves.fill(0);
        sim.player.supply = 5.9;
        sim.capture(0.2);
        expect(sim.reserves.every((n) => n === 0)).toBe(true);
        expect(sim.player.supply).toBe(0);
        sim.player.x = scenarios[id].homes[team];
        sim.player.lastHit = sim.simTime;
        sim.player.supply = 5.9;
        sim.capture(0.2);
        expect(sim.reserves.every((n) => n === 0)).toBe(true);
      } finally {
        sim.dispose();
      }
    });
  }
