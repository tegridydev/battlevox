import { defaults } from '../core/config';
import { secondaryIndex } from '../core/loadout';
import { clamp } from '../core/math';
import { validateCareer } from '../core/progression';
import { teamSize } from '../core/scenarios';
import type { Profile, Settings } from '../core/types';
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
  key?(index: number): string | null;
  readonly length?: number;
}
export const settingsKey = 'battlevox-metropolis-settings',
  profileKey = 'battlevox-metropolis-profile';
export const journalPrefix = profileKey + '-pending-';
export interface ProfileCheckpoint {
  key: string;
  base: string | null;
  profile: Profile;
  updatedAt: number;
}
export function readCheckpoints(storage: StoragePort | null): ProfileCheckpoint[] {
  const result: ProfileCheckpoint[] = [];
  try {
    for (let i = 0; i < Math.min(storage?.length ?? 0, 512); i++) {
      const key = storage?.key?.(i);
      if (!key?.startsWith(journalPrefix)) continue;
      try {
        const raw = JSON.parse(storage!.getItem(key) ?? 'null');
        if (
          raw &&
          (raw.base === null || typeof raw.base === 'string') &&
          Number.isFinite(raw.updatedAt) &&
          raw.profile
        )
          result.push({
            key,
            base: raw.base,
            profile: validateProfile(raw.profile),
            updatedAt: raw.updatedAt,
          });
      } catch {}
    }
  } catch {}
  return result.sort((a, b) => b.updatedAt - a.updatedAt);
}
function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
export function validateSettings(value: unknown): Settings {
  const raw = record(value),
    out = { ...defaults };
  const limits = {
    seed: [1, 4294967295],
    quality: [0.5, 1.35],
    distance: [180, 500],
    fov: [65, 105],
    brightness: [0.75, 1.35],
    sensitivity: [0.3, 2.5],
    volume: [0, 1],
    adsSensitivity: [0.2, 1],
  } as const;
  for (const key of Object.keys(limits) as (keyof typeof limits)[]) {
    const v = raw[key];
    if (typeof v === 'number' && Number.isFinite(v))
      out[key] = clamp(v, limits[key][0], limits[key][1]);
  }
  out.seed = Math.floor(out.seed);
  if (raw.hudScale === 1.15 || raw.hudScale === 1.3) out.hudScale = raw.hudScale;
  out.secondary = secondaryIndex(raw.secondary);
  for (const key of ['motion', 'adaptive', 'touch', 'textures', 'shadows'] as const)
    if (typeof raw[key] === 'boolean') out[key] = raw[key];
  if (typeof raw.minutes === 'number' && [10, 25, 45].includes(raw.minutes))
    out.minutes = raw.minutes;
  if (['assault', 'medic', 'support', 'engineer', 'recon'].includes(String(raw.loadout)))
    out.loadout = raw.loadout as Settings['loadout'];
  if (raw.scenario === 'frontline' || raw.scenario === 'city') out.scenario = raw.scenario;
  if (typeof raw.teamSize === 'number' && Number.isFinite(raw.teamSize))
    out.teamSize = teamSize(raw.teamSize);
  if (raw.lighting === 'afternoon' || raw.lighting === 'overcast') out.lighting = raw.lighting;
  if (raw.aimMode === 'hold' || raw.aimMode === 'toggle') out.aimMode = raw.aimMode;
  return out;
}
export function validateProfile(value: unknown): Profile {
  const raw = record(value),
    out: Profile = { games: 0, wins: 0, kills: 0, best: 0 };
  for (const k of ['games', 'wins', 'kills', 'best'] as const) {
    const v = raw[k];
    if (typeof v === 'number' && Number.isSafeInteger(v) && v >= 0) out[k] = v;
  }
  out.wins = Math.min(out.wins, out.games);
  if (raw.career) out.career = validateCareer(raw.career);
  return out;
}
export function loadStorage(storage: StoragePort | null) {
  let settings = validateSettings(null),
    profile = validateProfile(null);
  try {
    settings = validateSettings(JSON.parse(storage?.getItem(settingsKey) || 'null'));
  } catch {}
  let profileBase: string | null = null;
  try {
    profileBase = storage?.getItem(profileKey) ?? null;
    profile = validateProfile(JSON.parse(profileBase || 'null'));
  } catch {}
  const pending = readCheckpoints(storage),
    recoverable = pending.filter((p) => p.base === profileBase);
  // Ambiguous concurrent sessions require an explicit recovery choice, never a counter merge.
  const unique = [...new Map(recoverable.map((p) => [JSON.stringify(p.profile), p])).values()];
  if (unique.length === 1) profile = unique[0].profile;
  return {
    settings,
    profile,
    profileBase,
    recovered: unique.length === 1,
    recoveryConflict: unique.length > 1,
  };
}
export function saveSettings(storage: StoragePort | null, value: Settings) {
  try {
    if (!storage) return false;
    storage.setItem(settingsKey, JSON.stringify(validateSettings(value)));
    return true;
  } catch {
    return false;
  }
}
export function saveProfile(storage: StoragePort | null, value: Profile) {
  try {
    if (!storage) return false;
    storage.setItem(profileKey, JSON.stringify(validateProfile(value)));
    return true;
  } catch {
    return false;
  }
}
