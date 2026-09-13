import { weapons } from '../core/config';
import { equipmentNames, loadout, scoped, zoomFor } from '../core/loadout';
import { clamp, dist2 } from '../core/math';
import type { Simulation } from '../simulation/simulation';
import type { ScenePort } from './app';
import { byId, replaceRows, text } from './dom';
import { hudViewModel, squadNumber } from './hud-model';
export function updateHUD(sim: Simulation, renderer: ScenePort, timeLeft: () => string) {
  const s = sim,
    p = s.player,
    f = s.world.flags[s.squads[p.squadId]?.route ?? s.handling.objective] ?? s.world.flags[4];
  if (!s.started) return;
  s.handling.objective = s.world.flags.indexOf(f);
  text('blueTickets', `${Math.floor(s.controlTime[0])} / ${s.controlGoal}s`);
  text('redTickets', `${Math.floor(s.controlTime[1])} / ${s.controlGoal}s`);
  text('clock', timeLeft());
  byId('blueTrack').style.width = `${clamp(s.controlTime[0] / s.controlGoal, 0, 1) * 50}%`;
  byId('redTrack').style.width = `${clamp(s.controlTime[1] / s.controlGoal, 0, 1) * 50}%`;
  for (const [index, flag] of s.world.flags.entries()) {
    const el = byId(index === 4 ? 'centreFlag' : `flag${String.fromCharCode(65 + index)}`);
    el.style.color =
      flag.owner === 0 ? 'var(--blue)' : flag.owner === 1 ? 'var(--red)' : 'var(--ink)';
    el.classList.toggle('contested', flag.contested);
    el.classList.toggle('assigned', flag === f);
  }
  text('objectiveName', `SECTOR ${f.name} / ${f.title.toUpperCase()}`);
  text(
    'objectiveTitle',
    f.contested ? 'SECTOR CONTESTED' : f.owner === p.team ? 'DEFEND SECTOR' : 'CAPTURE SECTOR',
  );
  const counts = [0, 1].map((t) => s.world.flags.filter((flag) => flag.owner === t).length);
  text(
    'objectiveDetail',
    `${Math.round(Math.sqrt(dist2(p, f)))} m · SECTORS ${counts[0]} : ${counts[1]}`,
  );
  const view = hudViewModel(s),
    hp = view.health;
  renderer.hudState = view;
  text('health', `${Math.ceil(hp)} ${p.vehicle ? 'ARMOUR' : 'HEALTH'}`);
  byId('vitals').classList.toggle('lowHealth', hp <= 30);
  const reload = byId<HTMLProgressElement>('reloadProgress');
  reload.hidden = !!p.vehicle || s.reloadTime <= 0;
  reload.value = clamp(
    1 - s.reloadTime / (weapons[s.weaponIndex].reload * s.weaponTuning[s.weaponIndex].reload),
    0,
    1,
  );
  byId('healthbar').style.width = `${clamp(hp, 0, 100)}%`;
  text('stats', `${s.kills} K / ${s.deaths} D / ${s.roundStats.assists ?? 0} A · ${s.score} PTS`);
  text(
    'stance',
    p.vehicle
      ? 'ARMOURED'
      : s.handling.ready > 0
        ? 'READYING'
        : p.crouched
          ? 'CROUCHED'
          : s.handling.sprint > 0.5
            ? 'SPRINTING'
            : s.aimAmount > 0.8
              ? 'AIMING'
              : 'READY',
  );
  text('gunname', p.vehicle ? 'APC / 40 mm CANNON' : weapons[s.weaponIndex].name);
  text('ammo', view.ammo);
  text('ammoReserve', view.reserve);
  text(
    'reloadLabel',
    s.reloadTime > 0 && !p.vehicle ? `RELOADING · ${s.reloadTime.toFixed(1)}s` : '',
  );
  byId('ammo').classList.toggle(
    'lowAmmo',
    !p.vehicle && s.ammo[s.weaponIndex] <= Math.ceil(weapons[s.weaponIndex].mag * 0.2),
  );
  text('inventory', `${s.grenades} FRAG · ${s.smokeGrenades} SMOKE`);
  text('kitLabel', view.kit.label);
  text(
    'kitState',
    view.kit.cooldown > 0
      ? `${Math.ceil(view.kit.cooldown)}s · RECHARGING`
      : view.kit.available
        ? 'READY'
        : view.kit.reason,
  );
  byId('kitState').classList.toggle('warning', !view.kit.available);
  text('supplyState', view.supply);
  text(
    'carriedLoadout',
    `CARRIED · ${s.activeKit.toUpperCase()} · ${weapons[s.equippedSecondary].name}`,
  );
  const kitAction = byId<HTMLButtonElement>('kitAction');
  kitAction.disabled = !view.kit.available;
  kitAction.title = view.kit.reason || view.kit.label;
  const squadRows = byId('hudRoster');
  while (squadRows.children.length > view.squad.length) squadRows.lastElementChild?.remove();
  for (let i = 0; i < view.squad.length; i++) {
    const member = view.squad[i],
      row =
        (squadRows.children[i] as HTMLElement | undefined) ??
        squadRows.appendChild(document.createElement('div'));
    row.className = `hudSquadRow${member.self ? ' self' : ''}${member.state === 'DOWN' ? ' down' : ''}`;
    const label = `${member.name} · ${member.kit} · ${member.state}`;
    if (row.textContent !== label) row.textContent = label;
  }
  const equipped = loadout(s),
    weapon = weapons[s.weaponIndex];
  for (const b of document.querySelectorAll<HTMLButtonElement>('[data-weapon-slot]')) {
    const slot = Number(b.dataset.weaponSlot),
      index = equipped[slot];
    b.textContent = `${slot + 1} ${index === undefined ? 'KIT' : weapons[index].name.split(' / ')[0]}`;
    b.title = slot === 2 ? equipmentNames[s.activeKit] : slot === 0 ? 'Primary weapon' : 'Sidearm';
    b.classList.toggle('selected', index === s.weaponIndex);
    b.setAttribute('aria-pressed', String(index === s.weaponIndex));
    b.disabled = !s.acceptsInput || !!p.vehicle;
  }
  text(
    'weaponStatus',
    p.vehicle
      ? 'CANNON'
      : s.handling.ready > 0
        ? 'DRAWING'
        : `${weapon.automatic ? 'AUTO' : 'SEMI'} · ${zoomFor(s)}×${weapon.zooms.length > 1 ? ' · X ZOOM' : ''}`,
  );
  document.body.classList.toggle('scopedView', s.acceptsInput && scoped(s) && s.aimAmount > 0.72);
  byId('fieldTip').hidden = !s.acceptsInput || s.simTime > 16 || s.input.aim || s.touch;
  byId('practiceBadge').hidden = !s.roundPractice;
  replaceRows(
    byId('feed'),
    s.feed.map((f) => f.text),
  );
  const awards = new Map<string, number>();
  for (const event of s.xpFeed)
    awards.set(event.label, (awards.get(event.label) ?? 0) + event.points);
  replaceRows(
    byId('xpFeed'),
    [...awards].slice(-3).map(([label, points]) => `${label} +${points}`),
  );
  const squad = s.squads[p.squadId];
  if (squad) {
    text(
      'squadName',
      `SQUAD ${squadNumber(s, squad.id)} · ${squad.leaderId === p.id ? 'LEADER' : 'MEMBER'}`,
    );
    text(
      'squadStatus',
      `${squad.memberIds.filter((id) => s.actors[id].alive).length}/10 ACTIVE · ${squad.order.kind.toUpperCase()}${squad.blocked ? ' / BLOCKED' : ''}`,
    );
  }
  const q = view.interaction;
  const hint = q.label
    ? `E · ${q.label}${q.available ? '' : ` — ${q.reason}`}`
    : s.acceptsInput && !s.touch && !document.pointerLockElement
      ? 'Click to capture mouse · drag to look if unavailable'
      : '';
  text('hint', hint);
  byId('hint').hidden = !hint;
  byId('hint').classList.toggle('unavailable', !!q.label && !q.available);
  text(
    'performance',
    `${renderer.displayFPS} FPS · ${s.actors.filter((a) => a.alive).length} ACTIVE · RESERVES ${s.tickets[0]}:${s.tickets[1]}${s.destructionStats.pendingBodies ? ` · PHYSICS ${Math.round(s.destructionStats.oldestDebt * 1000)} ms BEHIND` : ''}`,
  );
  byId('aim').classList.toggle('active', s.input.aim);
  byId('crouch').classList.toggle('active', s.input.crouch);
}
