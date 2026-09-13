import { describe, expect, test } from 'bun:test';
import { defaults } from '../../src/core/config';
import { FixedClock } from '../../src/core/loop';
import { direction, matrix } from '../../src/core/math';
import {
  loadStorage,
  saveSettings,
  validateProfile,
  validateSettings,
} from '../../src/platform/storage';

describe('settings boundary', () => {
  test('rejects malformed and non-finite values and preserves zero volume', () => {
    const settings = validateSettings({
      seed: Infinity,
      volume: 0,
      fov: 900,
      loadout: '<img>',
      minutes: 7,
      touch: 'true',
      aimMode: 'hold',
    });
    expect(settings.seed).toBe(defaults.seed);
    expect(settings.volume).toBe(0);
    expect(settings.fov).toBe(105);
    expect(settings.loadout).toBe('assault');
    expect(settings.minutes).toBe(10);
    expect(settings.touch).toBe(false);
    expect(settings.aimMode).toBe('hold');
  });
  test('uses hold ADS by default and preserves an explicit toggle preference', () => {
    expect(validateSettings({ seed: 5, loadout: 'engineer' }).aimMode).toBe('hold');
    expect(validateSettings({ aimMode: 'toggle' }).aimMode).toBe('toggle');
  });
  test('handles malformed and blocked storage independently', () => {
    const storage = {
      getItem(key: string) {
        if (key.includes('settings')) return '{';
        return '{"games":3,"wins":2}';
      },
      setItem() {
        throw Error('blocked');
      },
    };
    expect(loadStorage(storage).profile.wins).toBe(2);
    expect(() => saveSettings(storage, defaults)).not.toThrow();
    expect(loadStorage(null).settings).toEqual(defaults);
  });
  test('validates profile counts', () => {
    expect(validateProfile({ games: 3, wins: 8, kills: -1, best: 1.5 })).toEqual({
      games: 3,
      wins: 3,
      kills: 0,
      best: 0,
    });
  });
});
test('fixed clock caps catch-up, pauses, and rejects non-finite elapsed time', () => {
  const c = new FixedClock();
  let steps = 0;
  c.advance(
    1,
    () => true,
    () => steps++,
  );
  expect(steps).toBe(3);
  c.advance(
    0.02,
    () => false,
    () => steps++,
  );
  c.advance(
    0.02,
    () => true,
    () => steps++,
  );
  expect(steps).toBe(3);
  c.advance(
    NaN,
    () => true,
    () => steps++,
  );
  expect(steps).toBe(3);
});
test('projection uses finite camera matrices and unit directions', () => {
  const d = direction(0.7, 0.3);
  expect(Math.hypot(d.x, d.y, d.z)).toBeCloseTo(1);
  expect(
    [...matrix({ x: 10, y: 2, z: 3, yaw: 0.7, pitch: 0.3 }, 16 / 9, 1.4)].every(Number.isFinite),
  ).toBe(true);
});

test('fresh settings match the published match and display defaults', () => {
  const settings = loadStorage(null).settings;
  expect({
    scenario: settings.scenario,
    teamSize: settings.teamSize,
    seed: settings.seed,
    minutes: settings.minutes,
    lighting: settings.lighting,
    hudScale: settings.hudScale,
    quality: settings.quality,
    distance: settings.distance,
    brightness: settings.brightness,
    fov: settings.fov,
    textures: settings.textures,
    shadows: settings.shadows,
    adaptive: settings.adaptive,
  }).toEqual({
    scenario: 'frontline',
    teamSize: 60,
    seed: 872426,
    minutes: 10,
    lighting: 'daylight',
    hudScale: 1,
    quality: 0.85,
    distance: 480,
    brightness: 1,
    fov: 105,
    textures: true,
    shadows: false,
    adaptive: true,
  });
  expect(validateSettings({ scenario: 'invalid', teamSize: NaN }).scenario).toBe('frontline');
  expect(validateSettings({ scenario: 'invalid', teamSize: NaN }).teamSize).toBe(60);
});
test('existing saved match and display choices survive the new defaults', () => {
  const saved = {
    scenario: 'city',
    teamSize: 500,
    seed: 872419,
    minutes: 25,
    lighting: 'overcast',
    hudScale: 1.15,
    quality: 1.1,
    distance: 340,
    brightness: 0.9,
    fov: 85,
    textures: false,
    shadows: true,
    adaptive: false,
  } as const;
  const settings = loadStorage({
    getItem: (key) => (key.includes('settings') ? JSON.stringify(saved) : null),
    setItem() {},
  }).settings;
  for (const [key, value] of Object.entries(saved))
    expect(settings[key as keyof typeof settings]).toEqual(value);
});
