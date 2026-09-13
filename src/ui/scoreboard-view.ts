import type { Simulation } from '../simulation/simulation';
import { byId, text } from './dom';
import { squadNumber } from './hud-model';
export function updateScores(sim: Simulation) {
  const s = sim,
    p = s.player;
  const peers = s.actors.filter((a) => a.team === p.team);
  const rank =
    1 +
    peers.filter(
      (a) =>
        a.frags > p.frags ||
        (a.frags === p.frags && (a.deaths < p.deaths || (a.deaths === p.deaths && a.id < p.id))),
    ).length;
  text(
    'scoreSummary',
    `YOU · #${rank} / ${peers.length} · ${s.kills} K / ${s.deaths} D · ${s.score} PTS`,
  );
  for (const row of byId('scoreContent').querySelectorAll<HTMLElement>('[data-score-actor]')) {
    const a = s.actors[Number(row.dataset.scoreActor)];
    if (!a) continue;
    const label = `${a.player ? 'YOU' : String((a.id % s.battleTeamSize) + 1).padStart(2, '0')} · ${(a.kit ?? 'assault').toUpperCase()}${a.alive ? '' : ' · DOWN'}`;
    if (row.firstElementChild?.textContent !== label) row.firstElementChild!.textContent = label;
    const score = `${a.frags} / ${a.deaths}`;
    if (row.lastElementChild?.textContent !== score) row.lastElementChild!.textContent = score;
  }
  [...byId('scoreContent').children].forEach((section, team) => {
    const heading = section.querySelector('h3');
    if (heading)
      heading.textContent = `${team === 0 ? 'AEGIS' : 'CINDER'} · ${s.tickets[team]} RESERVES`;
  });
}
export function renderScores(sim: Simulation) {
  const s = sim,
    content = byId('scoreContent');
  const ranked = s.actors
    .filter((a) => a.team === s.player.team)
    .sort((a, b) => b.frags - a.frags || a.deaths - b.deaths || a.id - b.id);
  text(
    'scoreSummary',
    `YOU · #${ranked.findIndex((a) => a === s.player) + 1} / ${ranked.length} · ${s.kills} K / ${s.deaths} D · ${s.score} PTS`,
  );
  content.replaceChildren();
  for (const team of [0, 1]) {
    const section = document.createElement('section'),
      heading = document.createElement('h3'),
      list = document.createElement('div');
    heading.textContent = `${team === 0 ? 'AEGIS' : 'CINDER'} · ${s.tickets[team]} RESERVES`;
    list.className = 'scoreList';
    list.tabIndex = 0;
    list.setAttribute('aria-label', `${team === 0 ? 'AEGIS' : 'CINDER'} roster`);
    const actors = s.actors
      .filter((a) => a.team === team)
      .sort((a, b) => a.squadId - b.squadId || b.frags - a.frags || a.id - b.id);
    let squad = -1;
    for (const a of actors) {
      if (a.squadId !== squad) {
        squad = a.squadId;
        const group = document.createElement('h4');
        group.textContent = `SQUAD ${squadNumber(s, squad)}`;
        list.append(group);
      }
      const row = document.createElement('div'),
        name = document.createElement('span'),
        score = document.createElement('strong');
      row.className = `scoreRow${a.player ? ' self' : ''}`;
      row.dataset.scoreActor = String(a.id);
      name.textContent = `${a.player ? 'YOU' : String((a.id % s.battleTeamSize) + 1).padStart(2, '0')} · ${(a.kit ?? 'assault').toUpperCase()}${a.alive ? '' : ' · DOWN'}`;
      score.textContent = `${a.frags} / ${a.deaths}`;
      row.append(name, score);
      list.append(row);
    }
    section.append(heading, list);
    content.append(section);
  }
}
