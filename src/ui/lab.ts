import { weapons } from '../core/config';
import { scenario } from '../core/scenarios';
import { validateSettings } from '../platform/storage';
import { equipmentLimits } from '../simulation/equipment';
import { npcState, reservationCount } from '../simulation/npc-state';
import type { App, ScenePort } from './app';
import { byId, text } from './dom';

/** App owns this screen, its input state, listeners and restart path. */
export class FieldLab {
  constructor(
    private app: App,
    private scene: ScenePort,
    signal: AbortSignal,
  ) {
    const sim = app.sim;
    byId('labReport').addEventListener('change', () => this.update(), { signal });
    byId('labClose').addEventListener('click', () => app.closeLab(), { signal });
    byId('labRestart').addEventListener('click', () => app.show('confirm'), { signal });
    byId('labReposition').addEventListener(
      'click',
      () => {
        if (!sim.started || sim.ended || !sim.player.alive) {
          text('labActionStatus', 'Deploy a living soldier before repositioning.');
          return;
        }
        const result = sim.safeSpawn(sim.player, true);
        if (result) sim.roundPractice = true;
        sim.spatial();
        this.update();
        text(
          'labActionStatus',
          result
            ? 'Repositioned. Career XP is disabled for this round.'
            : 'No safe landing is available.',
        );
      },
      { signal },
    );
    byId('labCheckResult').hidden = true;
    byId('labCheck').addEventListener(
      'click',
      () => {
        const results = byId('labCheckResult');
        if (!results.hidden) {
          results.hidden = true;
          byId('labTelemetry').hidden = false;
          text('labCheck', 'RUN CHECKS');
        } else {
          this.check();
          results.hidden = false;
          byId('labTelemetry').hidden = true;
          text('labCheck', 'BACK TO METRICS');
        }
      },
      { signal },
    );
    for (const [id, key] of [
      ['labScenario', 'scenario'],
      ['labPopulation', 'teamSize'],
    ] as const)
      byId(id).addEventListener(
        'change',
        () => {
          const value = byId<HTMLSelectElement>(id).value;
          sim.settings = validateSettings({
            ...sim.settings,
            [key]: key === 'teamSize' ? Number(value) : value,
          });
          app.savePreferences();
          app.syncSettings();
          this.sync();
        },
        { signal },
      );
    byId('labInvulnerable').addEventListener(
      'change',
      () => {
        sim.practiceInvulnerable = byId<HTMLInputElement>('labInvulnerable').checked;
        sim.roundPractice ||= sim.practiceInvulnerable || sim.practiceSupplies;
        this.update();
      },
      { signal },
    );
    byId('labSupplies').addEventListener(
      'change',
      () => {
        sim.practiceSupplies = byId<HTMLInputElement>('labSupplies').checked;
        sim.roundPractice ||= sim.practiceInvulnerable || sim.practiceSupplies;
        this.update();
      },
      { signal },
    );
  }
  sync() {
    const s = this.app.sim;
    byId<HTMLSelectElement>('labScenario').value = s.settings.scenario;
    byId<HTMLSelectElement>('labPopulation').value = String(s.settings.teamSize);
    byId<HTMLInputElement>('labInvulnerable').checked = s.practiceInvulnerable;
    byId<HTMLInputElement>('labSupplies').checked = s.practiceSupplies;
    this.update();
  }
  snapshot() {
    const s = this.app.sim,
      live = s.actors.filter((a) => a.alive),
      tasks: Record<string, number> = {};
    let oldestDecision = 0;
    for (const a of live)
      if (!a.player) {
        const b = npcState(a);
        if (b.task) tasks[b.task.kind] = (tasks[b.task.kind] ?? 0) + 1;
        oldestDecision = Math.max(oldestDecision, s.simTime - b.lastThink);
      }
    return {
      version: '0.6.1',
      scenario: s.testArena,
      simulationSeconds: s.simTime,
      population: s.actors.length,
      alive: live.length,
      squads: s.squads.length,
      equipment: {
        smoke: s.smokeClouds.length,
        deployables: s.deployables.length,
        player: {
          weapon: weapons[s.weaponIndex].id,
          magazines: [...s.ammo],
          reserves: [...s.reserves],
          secondary: s.equippedSecondary,
          smoke: s.smokeGrenades,
        },
      },
      squad: (s.squads[s.player.squadId]?.memberIds ?? []).map((id) => {
        const a = s.actors[id],
          b = npcState(a);
        return {
          id,
          kit: a.kit,
          alive: a.alive,
          task: b.task ? `${b.task.kind} / ${b.task.phase}` : a.action || a.tactic,
          weapon: weapons[a.activeWeapon]?.id,
          rockets: a.rockets,
          grenades: a.fragCharges,
          smoke: a.smokes,
        };
      }),
      tasks,
      reservations: reservationCount(s),
      oldestDecision,
      aid: { ...s.testStats },
      navigation: {
        ...s.navigationStats,
        pending: s.world.navDirty || !!s.world.navigationTask,
        sourceRevision: s.world.navRevision,
        publishedSourceRevision: s.world.publishedNavSourceRevision,
      },
      destruction: {
        ...s.destructionStats,
        bodies: s.rubble.length,
        voxels: s.rubble.reduce((n, b) => n + b.voxels.length, 0),
      },
      meshing: { ...s.world.meshStats },
      graphics: {
        fps: this.scene.displayFPS,
        shadows: !!(this.scene.lighting?.shadows && this.scene.lighting?.available),
      },
      practice: { invulnerable: s.practiceInvulnerable, supplies: s.practiceSupplies },
    };
  }
  update() {
    if (this.app.sim.menuState !== 'lab') return;
    const d = this.snapshot(),
      s = this.app.sim;
    text(
      'labTelemetry',
      `${scenario(s.testArena).name} · ${d.population} soldiers / ${d.alive} active\n${d.squads} squads · ${d.graphics.fps} FPS\nPhysics: ${d.destruction.bodies} bodies / ${d.destruction.voxels.toLocaleString()} cells\nOldest physics debt: ${Math.round(d.destruction.oldestDebt * 1000)} ms\nLast physical progress: ${d.destruction.staleTime.toFixed(2)} s · steps ${d.destruction.advancedSteps}\nTerrain meshes queued: ${d.meshing.pending}\nNavigation: ${d.navigation.pending ? 'rebuilding' : 'published'} · ${d.navigation.expanded} local nodes\nLocal routes completed: ${d.navigation.completed} · lift trips: ${d.navigation.liftTrips}`,
    );
    text(
      'labAI',
      `Active aid tasks: ${
        Object.entries(d.tasks)
          .map(([k, v]) => `${k.toLowerCase()} ${v}`)
          .join(' / ') || 'none'
      }\nReservations: ${d.reservations}\nRevives ${d.aid.revives} · heals ${d.aid.heals} · repairs ${d.aid.repairs} · supplies ${d.aid.resupplies}\nRockets ${d.aid.rockets} · frags ${d.aid.grenades} · sidearm shots ${d.aid.sidearmShots}\nSmoke ${d.equipment.smoke} · medical bags ${d.aid.medicalBags} · ammo crates ${d.aid.ammoCrates}\nFriendly shots withheld: ${d.aid.shotsBlocked}\nOldest decision: ${Math.max(0, d.oldestDecision).toFixed(2)} s`,
    );
    if (byId<HTMLSelectElement>('labReport').value === 'squad')
      text(
        'labAI',
        d.squad
          .map(
            (a) =>
              `${String(a.id).padStart(2, '0')} ${a.kit?.slice(0, 3).toUpperCase().padEnd(3)}  ${a.alive ? (a.task || 'ADVANCE').slice(0, 28) : 'DOWN'}`,
          )
          .join('\n') || 'Start a battle to inspect your squad.',
      );
    text(
      'practiceNotice',
      s.roundPractice
        ? 'PRACTICE ROUND · CAREER XP DISABLED'
        : 'STANDARD RULES · CAREER XP ENABLED',
    );
    byId<HTMLButtonElement>('labReposition').disabled = !s.started || s.ended || !s.player.alive;
  }
  check() {
    const s = this.app.sim,
      checks: [string, boolean][] = [
        [
          'Player magazines',
          s.ammo.every((n, i) => Number.isInteger(n) && n >= 0 && n <= weapons[i].mag),
        ],
        [
          'NPC equipment',
          s.actors.every(
            (a) =>
              a.player ||
              !a.alive ||
              (a.clip >= 0 &&
                a.clip <= weapons[a.primaryWeapon].mag &&
                a.secondaryClip >= 0 &&
                a.secondaryClip <= weapons[a.secondaryWeapon].mag &&
                a.rockets >= 0 &&
                a.rockets <= 3 &&
                a.fragCharges >= 0 &&
                a.fragCharges <= 2 &&
                a.smokes >= 0 &&
                a.smokes <= 2),
          ),
        ],
        [
          'Smoke and supplies',
          s.smokeClouds.length <= equipmentLimits.smokeClouds &&
            s.deployables.length <= equipmentLimits.deployables,
        ],
        ['Actor coordinates', s.actors.every((a) => [a.x, a.y, a.z, a.hp].every(Number.isFinite))],
        [
          'Vehicle ownership',
          s.vehicles.every((v) => !v.driver || (v.driver.alive && v.driver.vehicle === v)) &&
            s.actors.every((a) => !a.vehicle || a.vehicle.driver === a),
        ],
        [
          'Squad membership',
          new Set(s.squads.flatMap((q) => q.memberIds)).size === s.actors.length,
        ],
        [
          'Rubble state',
          s.rubble.every(
            (b) => [b.x, b.y, b.z, b.pendingDt, b.mass].every(Number.isFinite) && b.pendingDt >= 0,
          ),
        ],
      ];
    text(
      'labCheckResult',
      checks.map(([label, ok]) => `${ok ? 'PASS' : 'FAIL'} / ${label}`).join('\n'),
    );
  }
}
