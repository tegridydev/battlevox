import { expect, test } from 'bun:test';
import { ensureCareer } from '../../src/core/progression';
import type { Profile } from '../../src/core/types';
import { type Exclusive, ProfileSession } from '../../src/platform/profile-session';
import {
  loadStorage,
  profileKey,
  readCheckpoints,
  type StoragePort,
  saveProfile,
  validateSettings,
} from '../../src/platform/storage';

class MemoryStore implements StoragePort {
  data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  key(i: number) {
    return [...this.data.keys()][i] ?? null;
  }
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
}
const profile = (xp = 0): Profile => {
  const p: Profile = { games: 0, wins: 0, kills: 0, best: 0 };
  ensureCareer(p).xp = xp;
  return p;
};
const exclusive: Exclusive = async (job) => job();
test('0.6 concurrent save sessions preserve the loser checkpoint instead of overwriting progress', async () => {
  const store = new MemoryStore(),
    a = new ProfileSession(store, null, exclusive),
    b = new ProfileSession(store, null, exclusive);
  const [one, two] = await Promise.all([a.commit(profile(100)), b.commit(profile(200))]);
  expect(one.ok).toBe(true);
  expect(two.ok).toBe(false);
  if (!two.ok) expect(two.reason).toBe('conflict');
  expect(loadStorage(store).profile.career!.xp).toBe(100);
  expect(readCheckpoints(store).some((p) => p.profile.career!.xp === 200)).toBe(true);
});
test('0.6 a newer pagehide checkpoint survives a queued canonical write', async () => {
  const store = new MemoryStore();
  let release!: () => void;
  const gate: Exclusive = async (job) => {
    await new Promise<void>((resolve) => {
      release = resolve;
    });
    return job();
  };
  const writer = new ProfileSession(store, null, gate),
    job = writer.commit(profile(100));
  writer.checkpoint(profile(200));
  release();
  await job;
  expect(JSON.parse(store.getItem(profileKey)!).career.xp).toBe(100);
  const saved = loadStorage(store);
  expect(saved.profile.career!.xp).toBe(200);
  expect(saved.recovered).toBe(true);
});
test('0.6 unavailable save locking retains a recoverable synchronous checkpoint', async () => {
  const store = new MemoryStore(),
    writer = new ProfileSession(store, null, async () => {
      throw Error('Unavailable');
    });
  const result = await writer.commit(profile(99));
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.reason).toBe('checkpoint');
  expect(loadStorage(store).profile.career!.xp).toBe(99);
});
test('0.6 ambiguous checkpoints require explicit choice rather than adding conflicting XP', () => {
  const store = new MemoryStore();
  new ProfileSession(store, null, exclusive).checkpoint(profile(100));
  new ProfileSession(store, null, exclusive).checkpoint(profile(200));
  const saved = loadStorage(store);
  expect(saved.recoveryConflict).toBe(true);
  expect(saved.recovered).toBe(false);
  expect(saved.profile.career).toBeUndefined();
});
test('0.6 malformed storage and hostile settings remain bounded and usable', () => {
  const store = new MemoryStore();
  store.setItem(profileKey, '{bad');
  expect(loadStorage(store).profile.games).toBe(0);
  const settings = validateSettings({
    teamSize: Infinity,
    scenario: 'unknown',
    lighting: 'unknown',
    quality: 99,
  });
  expect(settings.teamSize).toBe(60);
  expect(settings.scenario).toBe('frontline');
  expect(settings.quality).toBe(1.35);
  const broken: StoragePort = {
    getItem() {
      throw Error('Denied');
    },
    setItem() {
      throw Error('Denied');
    },
  };
  expect(saveProfile(broken, profile(1))).toBe(false);
  expect(new ProfileSession(broken, null, exclusive).checkpoint(profile(1))).toBe(false);
});
