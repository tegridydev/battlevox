import { weapons } from '../core/config';
import {
  assignments,
  assignmentValue,
  ensureCareer,
  ensureItem,
  itemTracks,
  medalDefinitions,
  progress,
  upgrades,
} from '../core/progression';
import type { MatchReport, Profile } from '../core/types';
import { byId, option, text } from './dom';
export interface CareerViewState {
  item: string;
  assignments: number;
  stats: number;
  medals: number;
  history: number;
}
const escape = (s: unknown) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
const num = (n: number) => Math.floor(n).toLocaleString();
const bar = (ratio: number) =>
  `<div class="xpBar"><i style="width:${Math.max(0, Math.min(100, ratio * 100))}%"></i></div>`;
const ribbon = (id: string, count: number) => {
  const m = medalDefinitions.find((m) => m.id === id);
  return `<article class="medal ${count ? 'earned' : 'locked'}"><div class="ribbonIcon" aria-hidden="true">${count ? '◆' : '◇'}</div><b>${escape(m?.name ?? id)}</b><span>${count ? `${count} earned` : `${m?.threshold} ${m?.stat} in one round`}</span></article>`;
};
function paged<T>(
  rows: readonly T[],
  key: 'assignments' | 'stats' | 'medals' | 'history',
  size: number,
  state: CareerViewState,
): readonly T[] {
  const count = Math.max(1, Math.ceil(rows.length / size));
  state[key] = Math.max(
    0,
    Math.min(count - 1, Number.isFinite(state[key]) ? Math.floor(state[key]) : 0),
  );
  const element = byId(`${key}Pager`),
    buttons = element.querySelectorAll<HTMLButtonElement>('button');
  buttons[0].disabled = state[key] === 0;
  buttons[1].disabled = state[key] === count - 1;
  element.querySelector('output')!.textContent = `${state[key] + 1} / ${count}`;
  element.hidden = count === 1;
  return rows.slice(state[key] * size, (state[key] + 1) * size);
}
export function renderCareer(
  profile: Profile,
  state: CareerViewState = { item: 'ar30', assignments: 0, stats: 0, medals: 0, history: 0 },
) {
  const c = ensureCareer(profile),
    rank = progress(c.xp),
    small = window.innerWidth < 700,
    short = window.innerHeight < 620;
  text('headerRank', String(rank.level).padStart(2, '0'));
  text('headerName', c.name);
  if (document.activeElement !== byId('callsign'))
    byId<HTMLInputElement>('callsign').value = c.name;
  byId('careerSummary').innerHTML =
    `<div class="rankSummary"><strong>${String(rank.level).padStart(2, '0')}</strong><div><b>${escape(c.name)}</b><span>${num(c.xp)} XP</span></div></div>${bar(rank.ratio)}<div class="miniStats"><span><b>${num(profile.games)}</b>Matches</span><span><b>${num(profile.wins)}</b>Wins</span><span><b>${num(profile.kills)}</b>Kills</span></div>`;
  const active = [...assignments].sort(
    (a, b) => Number(c.claimed.includes(a.id)) - Number(c.claimed.includes(b.id)),
  );
  byId('homeAssignments').innerHTML = active
    .slice(0, 2)
    .map((a) => {
      const n = assignmentValue(profile, a);
      return `<div class="miniAssignment"><div><b>${escape(a.name)}</b><span>${Math.min(n, a.target)} / ${a.target}</span></div>${bar(n / a.target)}</div>`;
    })
    .join('');
  byId('homeMastery').innerHTML = itemTracks
    .filter((t) => t.category === 'weapon')
    .sort((a, b) => ensureItem(profile, b.id).xp - ensureItem(profile, a.id).xp)
    .slice(0, 3)
    .map((t) => {
      const v = progress(ensureItem(profile, t.id).xp, t.maxLevel, true);
      return `<div class="miniMastery"><b>${escape(t.name)}</b><span>Lv ${v.level}</span>${bar(v.ratio)}</div>`;
    })
    .join('');
  const selector = byId<HTMLSelectElement>('arsenalItem');
  if (selector.options.length !== itemTracks.length)
    selector.replaceChildren(...itemTracks.map((t) => option(t.id, t.name)));
  const t = itemTracks.find((t) => t.id === state.item) ?? itemTracks[0];
  state.item = t.id;
  selector.value = t.id;
  const item = ensureItem(profile, t.id),
    v = progress(item.xp, t.maxLevel, true),
    unlocked = upgrades(profile, t.id),
    chosen = unlocked.find((u) => u.id === item.equipped) ?? unlocked[0];
  const weapon = weapons.find((w) => w.id === t.id),
    index = weapons.findIndex((w) => w.id === t.id);
  const metrics = weapon
    ? `<div class="weaponMetrics"><span><b>${weapon.mag}</b>Magazine</span><span><b>${weapon.automatic ? 'Auto' : 'Semi'}</b>Fire mode</span><span><b>${weapon.zooms.join(' / ')}×</b>Optic</span><span><b>${weapon.range} m</b>Range</span></div>`
    : '';
  const comparison = weapon
    ? `<details class="weaponCompare"><summary>Compare ${index >= 4 ? 'sidearms' : 'primary weapons'}</summary><table><thead><tr><th>Weapon</th><th>Magazine</th><th>Range</th><th>Reload</th></tr></thead><tbody>${weapons
        .filter((_, i) => (index >= 4 ? i >= 4 : i < 4))
        .map(
          (w) =>
            `<tr${w === weapon ? ' class="selected"' : ''}><th>${escape(w.name.split(' / ')[0])}</th><td>${w.mag}</td><td>${w.range} m</td><td>${w.reload}s</td></tr>`,
        )
        .join(
          '',
        )}</tbody></table><small>Base weapon values. Specialisation modifiers apply separately.</small></details>`
    : '';
  byId('arsenal').innerHTML =
    `<article class="loadoutCard"><div class="equipmentArt ${t.category}"><div class="weaponShape shape${index}" aria-hidden="true"></div><b>${escape(t.name)}</b></div><div class="loadoutBody"><span class="eyebrow">${t.category} · Level ${v.level} / ${t.maxLevel}</span><h2>${escape(t.name)}</h2>${bar(v.ratio)}<small>${v.needed ? `${num(v.current)} / ${num(v.needed)} XP` : 'Mastery complete'}</small>${metrics}${comparison}<p>${escape(chosen?.description ?? '')}</p><label>Specialisation<select data-item="${t.id}" aria-label="${escape(t.name)} specialisation">${t.unlocks.map((u) => `<option value="${u.id}"${chosen?.id === u.id ? ' selected' : ''}${u.level > v.level ? ' disabled' : ''}>${escape(u.name)}${u.level > v.level ? ` · Lv ${u.level}` : ''}</option>`).join('')}</select></label><div class="unlockRow">${t.unlocks.map((u) => `<span class="${u.level <= v.level ? 'available' : 'locked'}">Lv ${u.level}</span>`).join('')}</div></div></article>`;
  byId('assignments').innerHTML = paged(
    assignments,
    'assignments',
    small
      ? short || window.innerHeight < 720
        ? 1
        : 2
      : short
        ? 2
        : window.innerWidth > 1050
          ? 6
          : 4,
    state,
  )
    .map((a) => {
      const n = assignmentValue(profile, a),
        done = c.claimed.includes(a.id);
      return `<article class="assignmentCard ${done ? 'completed' : ''}"><div class="assignmentTop"><span>${done ? 'Completed' : 'In progress'}</span><b>+${num(a.xp)} XP</b></div><h2>${escape(a.name)}</h2><p>${escape(a.description)}</p>${bar(n / a.target)}<div class="assignmentBottom">${num(Math.min(n, a.target))} / ${num(a.target)}</div></article>`;
    })
    .join('');
  const cells = [
    ['Rank', rank.level],
    ['Career XP', num(c.xp)],
    ['Kills', profile.kills],
    ['Assists', c.stats.assists ?? 0],
    ['Captures', c.stats.captures ?? 0],
    ['Revives', c.stats.revives ?? 0],
    ['Headshots', c.stats.headshots ?? 0],
    ['Vehicles destroyed', c.stats.vehicleKills ?? 0],
    ['Deaths', c.stats.deaths ?? 0],
    ['Resupplies', c.stats.resupplies ?? 0],
    ['Heals', c.stats.heals ?? 0],
    ['Repairs', c.stats.repairs ?? 0],
  ];
  byId('careerStats').innerHTML = paged(cells, 'stats', small ? 6 : short ? 8 : 12, state)
    .map(
      ([label, value]) =>
        `<article class="statCard"><strong>${value}</strong><span>${label}</span></article>`,
    )
    .join('');
  byId('medals').innerHTML = paged(
    medalDefinitions,
    'medals',
    small && window.innerHeight < 700 ? 4 : 6,
    state,
  )
    .map((m) => ribbon(m.id, c.medals[m.id] ?? 0))
    .join('');
  const history = paged(c.history, 'history', short ? 2 : small ? 3 : 5, state);
  byId('matchHistory').innerHTML = c.history.length
    ? `<div class="historyHeading"><span>Match</span><span>Result</span><span>K / D / A</span><span>Score / XP</span></div>${history.map((m) => `<article class="historyRow"><div><b>${escape(new Date(m.endedAt).toLocaleDateString())}</b><small>${Math.floor(m.seconds / 60)}:${String(Math.floor(m.seconds % 60)).padStart(2, '0')} · Seed ${m.seed}</small></div><b class="${m.result}">${m.result}</b><span>${m.stats.kills ?? 0} / ${m.stats.deaths ?? 0} / ${m.stats.assists ?? 0}</span><div><b>${num(m.score)} pts</b><small>+${num(m.xp)} XP · ${m.stats.captures ?? 0} captures</small></div></article>`).join('')}`
    : '<p class="emptyState">No completed matches.</p>';
}
export function renderDebrief(report: MatchReport) {
  const contribution = (title: string, values: [string, number][]) =>
    `<section><h3 class="contributionTitle">${title}</h3><div class="debriefStats">${values.map(([label, value]) => `<span><b>${num(value)}</b>${label}</span>`).join('')}</div></section>`;
  byId('roundXp').innerHTML =
    `<div><span class="eyebrow">XP EARNED</span><strong class="xpTotal">+${num(report.xp)}</strong><p>${num(report.score)} score · ${Math.floor(report.seconds / 60)} minutes in the field</p></div><div class="contributionGroups">${contribution(
      'Combat',
      [
        ['Kills', report.stats.kills ?? 0],
        ['Assists', report.stats.assists ?? 0],
        ['Headshots', report.stats.headshots ?? 0],
      ],
    )}${contribution('Objectives', [
      ['Captures', report.stats.captures ?? 0],
      ['Orders', report.stats.orders ?? 0],
    ])}${contribution('Team support', [
      ['Revives', report.stats.revives ?? 0],
      ['Heals', report.stats.heals ?? 0],
      ['Resupplies', report.stats.resupplies ?? 0],
      ['Repairs', report.stats.repairs ?? 0],
    ])}</div>`;
  byId('roundMedals').innerHTML = report.medals.length
    ? report.medals.map((id) => ribbon(id, 1)).join('')
    : '<p class="emptyState">No ribbons earned.</p>';
}
