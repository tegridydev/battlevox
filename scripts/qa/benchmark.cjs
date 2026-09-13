/** Headless CPU measurements. These are simulation tick timings, never browser FPS. */
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const root = path.resolve(__dirname, '../..');
const ts = require('../compiler.cjs').loadTypeScript();
Module._extensions['.ts'] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      fileName: filename,
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    }).outputText,
    filename,
  );
const { Simulation } = require(path.join(root, 'src/simulation/simulation.ts'));
const { beginDestructionFrame } = require(path.join(root, 'src/simulation/destruction-budget.ts'));
const { navigationFrontiers } = require(path.join(root, 'src/simulation/navigation.ts'));
const secondsArg = Number(
  process.argv.find((a) => a.startsWith('--seconds='))?.split('=')[1] ?? 60,
);
if (!Number.isFinite(secondsArg) || secondsArg < 1 || secondsArg > 3600)
  throw Error('Use --seconds=1 through --seconds=3600');
const reports = [];
for (const [scenario, population] of [
  ['frontline', 60],
  ['city', 500],
]) {
  global.gc?.();
  const sim = new Simulation();
  sim.settings.scenario = scenario;
  sim.testArena = scenario;
  sim.settings.teamSize = sim.battleTeamSize = population;
  const start = performance.now();
  sim.reset();
  sim.deploy();
  const generationMs = performance.now() - start;
  const timings = [];
  let maxFrontiers = 0,
    finite = true;
  for (let tick = 0; tick < secondsArg * 30 && !sim.ended; tick++) {
    beginDestructionFrame(sim);
    const before = performance.now();
    sim.fixedUpdate(1 / 30);
    timings.push(performance.now() - before);
    sim.destructionBudget = null;
    sim.events.length = 0;
    maxFrontiers = Math.max(maxFrontiers, navigationFrontiers(sim));
    finite &&= sim.actors.every((a) => [a.x, a.y, a.z, a.hp].every(Number.isFinite));
  }
  timings.sort((a, b) => a - b);
  const at = (percentile) =>
    +timings[Math.min(timings.length - 1, Math.floor(timings.length * percentile))].toFixed(3);
  const report = {
    scenario,
    population: sim.actors.length,
    simulationSeconds: +sim.simTime.toFixed(2),
    generationMs: +generationMs.toFixed(2),
    tickMs: { p50: at(0.5), p95: at(0.95), p99: at(0.99), max: at(1) },
    finite,
    maxFrontiers,
    navigation: sim.navigationStats,
    aid: sim.testStats,
    destruction: sim.destructionStats,
    totalRigidBodies: sim.rubble.length,
    limits:
      'Main-thread time budgets are cooperative; GC and an individual generator yield can overshoot. No renderer or GPU is measured.',
  };
  reports.push(report);
  console.log(JSON.stringify(report));
  sim.dispose();
}
fs.mkdirSync(path.join(root, '.cache/qa'), { recursive: true });
fs.writeFileSync(
  path.join(root, '.cache/qa/benchmark.json'),
  JSON.stringify({ node: process.version, compiler: ts.version, reports }, null, 2),
);
if (reports.some((r) => !r.finite || r.maxFrontiers > 64 || r.destruction.clampedTime !== 0))
  process.exitCode = 1;
