import type { Career, CareerStat, GameEvent, Mastery, MatchReport, Profile } from './types';
export interface Upgrade {
  id: string;
  name: string;
  level: number;
  description: string;
  spread?: number;
  kick?: number;
  reload?: number;
  ability?: number;
}
export interface ItemTrack {
  id: string;
  name: string;
  category: 'weapon' | 'equipment' | 'vehicle';
  maxLevel: number;
  unlocks: Upgrade[];
}
const specialisations: Upgrade[] = [
  {
    id: 'standard',
    name: 'Standard issue',
    level: 1,
    description: 'Factory configuration. No handling modifiers.',
  },
  {
    id: 'control',
    name: 'Recoil control',
    level: 3,
    description: '15% less recoil. 5% wider dispersion.',
    kick: 0.85,
    spread: 1.05,
  },
  {
    id: 'reload',
    name: 'Quick handling',
    level: 6,
    description: '12% faster reload. 8% more recoil.',
    reload: 0.88,
    kick: 1.08,
  },
  {
    id: 'precision',
    name: 'Precision package',
    level: 10,
    description: '15% tighter dispersion. 10% slower reload.',
    spread: 0.85,
    reload: 1.1,
  },
];
const equipment = (id: string, name: string, description: string): ItemTrack => ({
  id,
  name,
  category: 'equipment',
  maxLevel: 20,
  unlocks: [
    { id: 'standard', name: 'Standard kit', level: 1, description },
    {
      id: 'handling',
      name: 'Field proficiency',
      level: 5,
      description: '10% shorter equipment cooldown.',
      ability: 0.9,
    },
    {
      id: 'specialist',
      name: 'Specialist drills',
      level: 12,
      description: '20% shorter equipment cooldown.',
      ability: 0.8,
    },
  ],
});
export const itemTracks: ItemTrack[] = [
  ...[
    ['ar30', 'AR-30'],
    ['mg60', 'MG-60'],
    ['at1', 'AT-1'],
    ['dmr8', 'DMR-8'],
    ['p12', 'P-12'],
    ['r6', 'R-6'],
    ['mp18', 'MP-18'],
  ].map(
    ([id, name]): ItemTrack => ({
      id,
      name,
      category: 'weapon',
      maxLevel: 30,
      unlocks: specialisations.map((u) =>
        id === 'at1' && u.id === 'precision'
          ? {
              id: u.id,
              name: 'Rapid loading',
              level: u.level,
              description: '18% faster reload. 15% more recoil.',
              reload: 0.82,
              kick: 1.15,
            }
          : { ...u },
      ),
    }),
  ),
  equipment(
    'frag',
    'M67 FRAG',
    'Standard fragmentation grenade. Level with damage and eliminations.',
  ),
  equipment('field_dressing', 'FIELD DRESSING', 'Self aid. No XP for using a kit at full health.'),
  equipment('medkit', 'MEDIC KIT', 'Heal or revive a nearby squadmate with F.'),
  equipment('ammo_pack', 'AMMO PACK', 'Resupply a nearby friendly with F.'),
  equipment('engineer_tool', 'ENGINEER TOOL', 'Repair friendly armour or place cover with V.'),
  equipment('spotter', 'RECON OPTICS', 'Spot a visible target with Z. F performs a recon scan.'),
  {
    id: 'apc',
    name: 'M12 APC',
    category: 'vehicle',
    maxLevel: 30,
    unlocks: [
      {
        id: 'standard',
        name: 'Standard crew',
        level: 1,
        description: 'Standard cannon reload cycle.',
      },
      {
        id: 'crew',
        name: 'Crew drills',
        level: 8,
        description: '10% shorter player cannon reload cycle.',
        ability: 0.9,
      },
    ],
  },
];
export const stats: CareerStat[] = [
  'kills',
  'assists',
  'headshots',
  'captures',
  'heals',
  'repairs',
  'resupplies',
  'revives',
  'vehicleKills',
  'orders',
  'spots',
  'deaths',
];
export interface Assignment {
  id: string;
  name: string;
  stat: CareerStat | 'games' | 'wins';
  target: number;
  xp: number;
  description: string;
}
export const assignments: Assignment[] = [
  {
    id: 'first_blood',
    name: 'First contact',
    stat: 'kills',
    target: 10,
    xp: 400,
    description: 'Eliminate 10 enemies.',
  },
  {
    id: 'sharpshooter',
    name: 'Precision matters',
    stat: 'headshots',
    target: 20,
    xp: 800,
    description: 'Confirm 20 headshot eliminations.',
  },
  {
    id: 'teamwork',
    name: 'Combined effort',
    stat: 'assists',
    target: 25,
    xp: 700,
    description: 'Earn 25 damage assists.',
  },
  {
    id: 'capture',
    name: 'Take the block',
    stat: 'captures',
    target: 10,
    xp: 1000,
    description: 'Participate in 10 sector captures.',
  },
  {
    id: 'medic',
    name: 'Leave nobody behind',
    stat: 'revives',
    target: 10,
    xp: 1000,
    description: 'Revive 10 friendly soldiers.',
  },
  {
    id: 'healer',
    name: 'Field medicine',
    stat: 'heals',
    target: 20,
    xp: 600,
    description: 'Heal wounded teammates 20 times.',
  },
  {
    id: 'support',
    name: 'Keep them firing',
    stat: 'resupplies',
    target: 20,
    xp: 600,
    description: 'Perform 20 useful ammunition resupplies.',
  },
  {
    id: 'engineer',
    name: 'Field service',
    stat: 'repairs',
    target: 20,
    xp: 700,
    description: 'Complete 20 useful armour repairs.',
  },
  {
    id: 'armour',
    name: 'Armour hunter',
    stat: 'vehicleKills',
    target: 10,
    xp: 1000,
    description: 'Destroy 10 hostile vehicles.',
  },
  {
    id: 'orders',
    name: 'Follow through',
    stat: 'orders',
    target: 10,
    xp: 700,
    description: 'Complete 10 squad capture orders.',
  },
  {
    id: 'victory',
    name: 'Operational success',
    stat: 'wins',
    target: 5,
    xp: 1500,
    description: 'Win five operations.',
  },
  {
    id: 'veteran',
    name: 'City veteran',
    stat: 'games',
    target: 20,
    xp: 2000,
    description: 'Complete 20 operations.',
  },
];
export const medalDefinitions = [
  { id: 'combat', name: 'Combat ribbon', stat: 'kills', threshold: 10 },
  { id: 'objective', name: 'Sector ribbon', stat: 'captures', threshold: 2 },
  { id: 'lifesaver', name: 'Lifesaver ribbon', stat: 'revives', threshold: 3 },
  { id: 'marksman', name: 'Marksman ribbon', stat: 'headshots', threshold: 5 },
  { id: 'logistics', name: 'Logistics ribbon', stat: 'resupplies', threshold: 5 },
  { id: 'armour', name: 'Armour ribbon', stat: 'vehicleKills', threshold: 2 },
] as const;
export const xpForRank = (level: number) =>
  level <= 1 ? 0 : Math.round(900 * (level - 1) ** 1.55);
export const xpForItemLevel = (level: number) =>
  level <= 1 ? 0 : Math.round(180 * (level - 1) ** 1.42);
export function progress(xp: number, max = 100, item = false) {
  const curve = item ? xpForItemLevel : xpForRank;
  let level = 1;
  while (level < max && xp >= curve(level + 1)) level++;
  const current = Math.max(0, xp - curve(level)),
    needed = level === max ? 0 : curve(level + 1) - curve(level);
  return { level, current, needed, ratio: needed ? Math.min(1, current / needed) : 1 };
}
export function ensureCareer(p: Profile): Career {
  return (p.career ??= {
    version: 3,
    name: 'OPERATIVE',
    xp: 0,
    stats: {},
    items: {},
    claimed: [],
    medals: {},
    history: [],
  });
}
export function ensureItem(p: Profile, id: string): Mastery {
  const c = ensureCareer(p);
  if (!itemTracks.some((t) => t.id === id)) return { xp: 0, equipped: 'standard' };
  return (c.items[id] ??= { xp: 0, equipped: 'standard' });
}
export function upgrades(p: Profile, id: string) {
  const track = itemTracks.find((t) => t.id === id);
  if (!track) return [];
  const level = progress(ensureItem(p, id).xp, track.maxLevel, true).level;
  return track.unlocks.filter((u) => u.level <= level);
}
export function equip(p: Profile, id: string, choice: string) {
  if (!upgrades(p, id).some((u) => u.id === choice)) return false;
  ensureItem(p, id).equipped = choice;
  return true;
}
export function tuning(p: Profile, id: string) {
  const u = upgrades(p, id).find((u) => u.id === ensureItem(p, id).equipped);
  return {
    spread: u?.spread ?? 1,
    kick: u?.kick ?? 1,
    reload: u?.reload ?? 1,
    ability: u?.ability ?? 1,
  };
}
const safeInt = (v: unknown, max = 1000000000) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0;
const object = (v: unknown): Record<string, unknown> =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
const readStats = (v: unknown) => Object.fromEntries(stats.map((k) => [k, safeInt(object(v)[k])]));
export function validateCareer(value: unknown): Career {
  const raw = object(value),
    c = ensureCareer({ games: 0, wins: 0, kills: 0, best: 0 });
  c.xp = safeInt(raw.xp);
  c.name =
    typeof raw.name === 'string'
      ? raw.name.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 24) || 'OPERATIVE'
      : 'OPERATIVE';
  c.stats = readStats(raw.stats);
  // Previous v2 profiles kept several counters at the career root.
  if (raw.version === 2) {
    c.stats.captures = safeInt(raw.captures);
    c.stats.deaths = safeInt(raw.deaths);
    c.stats.vehicleKills = safeInt(raw.vehicleKills);
  }
  for (const track of itemTracks) {
    const item = object(object(raw.items)[track.id]),
      xp = safeInt(item.xp);
    const equipped =
      track.unlocks.find(
        (u) => u.id === item.equipped && u.level <= progress(xp, track.maxLevel, true).level,
      )?.id ?? 'standard';
    c.items[track.id] = { xp, equipped };
  }
  c.claimed = assignments
    .filter((a) => Array.isArray(raw.claimed) && raw.claimed.includes(a.id))
    .map((a) => a.id);
  c.medals = Object.fromEntries(
    medalDefinitions.map((m) => [m.id, safeInt(object(raw.medals)[m.id])]),
  );
  if (Array.isArray(raw.history)) {
    for (const entry of raw.history.slice(0, 40)) {
      const r = object(entry);
      if (typeof r.id !== 'string' || !['victory', 'defeat', 'draw'].includes(String(r.result)))
        continue;
      c.history.push({
        id: r.id.slice(0, 80),
        endedAt: safeInt(r.endedAt, 10000000000000),
        seed: safeInt(r.seed, 4294967295),
        seconds: safeInt(r.seconds),
        result: r.result as MatchReport['result'],
        score: safeInt(r.score),
        xp: safeInt(r.xp),
        stats: readStats(r.stats),
        medals: medalDefinitions
          .filter((m) => Array.isArray(r.medals) && r.medals.includes(m.id))
          .map((m) => m.id),
      });
    }
  }
  return c;
}
export function assignmentValue(p: Profile, a: Assignment) {
  return a.stat === 'games' || a.stat === 'wins'
    ? p[a.stat]
    : a.stat === 'kills'
      ? p.kills
      : (ensureCareer(p).stats[a.stat] ?? 0);
}
export function claimAssignments(p: Profile) {
  const c = ensureCareer(p),
    earned: Assignment[] = [];
  for (const a of assignments)
    if (!c.claimed.includes(a.id) && assignmentValue(p, a) >= a.target) {
      c.claimed.push(a.id);
      c.xp = safeInt(c.xp + a.xp);
      earned.push(a);
    }
  return earned;
}
export function recordXp(
  p: Profile,
  e: Extract<
    GameEvent,
    {
      type: 'xp';
    }
  >,
) {
  const c = ensureCareer(p),
    points = safeInt(e.points),
    count = safeInt(e.count);
  c.xp = safeInt(c.xp + points);
  if (e.itemId && itemTracks.some((t) => t.id === e.itemId)) {
    const item = ensureItem(p, e.itemId);
    item.xp = safeInt(item.xp + points);
  }
  if (e.stat) {
    c.stats[e.stat] = safeInt((c.stats[e.stat] ?? 0) + count);
    if (e.stat === 'kills') p.kills = safeInt(p.kills + count);
  }
  return claimAssignments(p);
}
export function finishCareerMatch(p: Profile, report: MatchReport) {
  const c = ensureCareer(p);
  if (c.history.some((r) => r.id === report.id))
    return { bonus: 0, assignments: [], duplicate: true };
  report.medals = medalDefinitions
    .filter((m) => (report.stats[m.stat] ?? 0) >= m.threshold)
    .map((m) => m.id);
  for (const id of report.medals) c.medals[id] = (c.medals[id] ?? 0) + 1;
  const bonus = 500 + (report.result === 'victory' ? 500 : 0) + report.medals.length * 150;
  c.xp += bonus;
  p.games++;
  if (report.result === 'victory') p.wins++;
  p.best = Math.max(p.best, report.score);
  const earned = claimAssignments(p);
  report.xp += bonus + earned.reduce((n, a) => n + a.xp, 0);
  c.history.unshift(report);
  c.history.length = Math.min(40, c.history.length);
  return { bonus, assignments: earned, duplicate: false };
}
