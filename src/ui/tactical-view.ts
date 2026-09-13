import { weapons } from '../core/config';
import { kitWeapons } from '../core/loadout';
import { scenario } from '../core/scenarios';
import type { Simulation } from '../simulation/simulation';
import { byId, option, text } from './dom';
export function updateTactical(
  sim: Simulation,
  state: { rosterPage: number },
  timeLeft: () => string,
) {
  const s = sim,
    isDeployment = s.menuState === 'deployment',
    selector = byId<HTMLSelectElement>('squadSelect');
  const spawnSelect = byId<HTMLSelectElement>('spawnSelect'),
    operation = scenario(s.testArena);
  for (let i = 0; i < 3; i++) {
    const gate = spawnSelect.querySelector<HTMLOptionElement>(`option[value="base:${i}"]`);
    if (gate) gate.textContent = `${operation.name} / ${['North', 'Centre', 'South'][i]} gate`;
  }
  if (selector.options.length !== s.squads.filter((q) => q.team === s.player.team).length) {
    selector.replaceChildren(
      ...s.squads
        .filter((q) => q.team === s.player.team)
        .map((q) =>
          option(
            String(q.id),
            `${q.team === 0 ? 'AEGIS' : 'CINDER'} ${String((q.id % Math.max(1, s.battleTeamSize / 10)) + 1).padStart(2, '0')}`,
          ),
        ),
    );
    selector.value = String(s.selectedSquad);
  }
  selector.disabled = !isDeployment;
  byId<HTMLSelectElement>('roleSelect').disabled = !isDeployment;
  byId('roleLabel').hidden = !isDeployment;
  byId('deploymentBar').hidden = !isDeployment;
  byId('returnToGame').hidden = isDeployment;
  byId('orderControls').hidden = isDeployment;
  text(
    'tacticalTitle',
    isDeployment ? 'DEPLOYMENT' : s.menuState === 'orders' ? 'SQUAD COMMAND' : 'TACTICAL MAP',
  );
  text(
    'tacticalClock',
    `${timeLeft()} · ${s.initialDeployment ? 'AWAITING DEPLOYMENT' : 'BATTLE LIVE'}`,
  );
  const squad = s.squads[isDeployment ? s.selectedSquad : s.player.squadId];
  if (!squad) return;
  const roster = byId('roster');
  while (roster.children.length < 10) roster.append(document.createElement('div'));
  const rosterSize = 10;
  const rosterPages = Math.max(1, Math.ceil(squad.memberIds.length / rosterSize));
  state.rosterPage = Math.max(0, Math.min(rosterPages - 1, state.rosterPage));
  const ids = squad.memberIds.slice(
    state.rosterPage * rosterSize,
    (state.rosterPage + 1) * rosterSize,
  );
  for (const row of roster.children) (row as HTMLElement).hidden = true;
  text('rosterPage', `${state.rosterPage + 1} / ${rosterPages}`);
  byId<HTMLButtonElement>('rosterPrev').disabled = state.rosterPage === 0;
  byId<HTMLButtonElement>('rosterNext').disabled = state.rosterPage === rosterPages - 1;
  byId('tab-tactical-orders').hidden = isDeployment;
  for (const [i, id] of ids.entries()) {
    const a = s.actors[id],
      row = roster.children[i] as HTMLElement;
    row.hidden = false;
    row.className = `rosterRow${a.player ? ' you' : ''}${a.alive ? '' : ' down'}`;
    const label = `${id === squad.leaderId ? '★ ' : ''}${a.player ? 'YOU' : `${a.team === 0 ? 'AEGIS' : 'CINDER'} ${String((id % s.battleTeamSize) + 1).padStart(3, '0')}`} · ${a.alive ? `${Math.ceil(a.hp)} HP` : (a.reviveUntil ?? 0) > s.simTime ? 'DOWN / REVIVABLE' : 'DEPLOYING'} · ${(a.kit ?? 'assault').toUpperCase()}`;
    if (row.textContent !== label) row.textContent = label;
  }
  const leader = squad.leaderId === s.player.id;
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-order]')) {
    button.disabled = !leader || !s.player.alive;
    button.classList.toggle('selected', button.dataset.order === squad.order.kind);
    button.setAttribute('aria-pressed', String(button.dataset.order === squad.order.kind));
  }
  text(
    'orderStatus',
    `${squad.order.kind.toUpperCase()} / SECTOR ${s.world.flags[squad.route].name}${squad.routing ? ' · ROUTING' : squad.blocked ? ' · ROUTE BLOCKED / RETRYING' : ''}${leader ? '' : ' · Orders issued by squad leader'}`,
  );
  if (isDeployment) {
    let reason = '';
    if (s.spawnTarget === 'leader') {
      if (s.selectedRole === 'leader') reason = 'Squad leaders deploy at base';
      else if (squad.leaderId === s.player.id)
        reason = 'Choose a base gate when handing over leadership';
      else reason = s.leaderSpawn({ ...s.player, squadId: squad.id }).reason;
    }
    if (s.tickets[s.player.team] <= 0) reason = 'No reserves available';
    else if (s.player.respawn > 0) reason = `REINFORCEMENTS IN ${Math.ceil(s.player.respawn)}s`;
    text('spawnStatus', reason || s.spawnError || 'READY TO DEPLOY');
    byId<HTMLButtonElement>('deployNow').disabled = Boolean(reason) || s.player.alive;
    text(
      'kitDescription',
      `${kitWeapons(s.settings.loadout, s.settings.secondary)
        .map((i) => weapons[i].name.split(' / ')[0])
        .join(' · ')}`,
    );
  }
}
