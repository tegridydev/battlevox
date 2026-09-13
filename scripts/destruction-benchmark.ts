import { STEP } from '../src/core/config';
import { beginDestructionFrame } from '../src/simulation/destruction-budget';
import { fullSquads, towerGround } from '../tests/helpers';

// Headless CPU measurements only. No renderer, server, or browser is started.
for (const towers of [1, 2]) {
  const sim = fullSquads();
  if (towers === 2) {
    sim.startBattle();
    sim.deploy();
  }
  for (let i = 0; i < towers; i++) {
    const x = 100 + i * 64;
    towerGround(sim.world, x, 100);
    sim.world.cityTower(x, 100, 24, 24, 19, 0);
    for (let z = 100; z < 124; z++)
      for (let xx = x; xx < x + 24; xx++) sim.world.removeVoxel(xx, 5, z);
  }
  const destruction: number[] = [],
    ticks: number[] = [];
  let debtFrames = 0,
    maxDebt = 0;
  let primaryPeak = 0,
    secondaryPeak = 0,
    firstIslandTick = -1;
  for (let tick = 0; tick < 360; tick++) {
    beginDestructionFrame(sim);
    const before = performance.now();
    if (towers === 2) sim.fixedUpdate(STEP);
    else {
      sim.simTime += STEP;
      sim.advanceCollapse();
      sim.updateRubble(STEP);
    }
    ticks.push(performance.now() - before);
    destruction.push(sim.destructionStats.supportMs + sim.destructionStats.physicsMs);
    maxDebt = Math.max(maxDebt, sim.destructionStats.oldestDebt);
    if (sim.destructionStats.oldestDebt >= 0.249) debtFrames++;
    sim.destructionBudget = null;
    sim.events.length = 0;
    if (firstIslandTick < 0 && sim.rubble.length) firstIslandTick = tick;
    primaryPeak = Math.max(primaryPeak, sim.rubble.filter((b) => b.primary).length);
    secondaryPeak = Math.max(secondaryPeak, sim.rubble.filter((b) => !b.primary).length);
  }
  const summary = (values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b);
    return {
      p95: +sorted[Math.floor(sorted.length * 0.95)].toFixed(3),
      max: +sorted[sorted.length - 1].toFixed(3),
    };
  };
  console.log(
    JSON.stringify({
      towers,
      soldiers: sim.actors.length,
      activeBattle: towers === 2,
      firstIslandTick,
      primaryPeak,
      debtFrames,
      maxDebt,
      discardedSimulationSeconds: sim.destructionStats.clampedTime,
      finalAwakeBodies: sim.rubble.filter((b) => !b.sleeping).length,
      finalDebt: sim.destructionStats.oldestDebt,
      secondaryPeak,
      destructionMs: summary(destruction),
      tickMs: summary(ticks),
    }),
  );
}
