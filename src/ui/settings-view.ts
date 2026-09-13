import { scenario } from '../core/scenarios';
import type { Settings } from '../core/types';
import type { Simulation } from '../simulation/simulation';
import type { ScenePort } from './app';
import { byId, text } from './dom';
export function updateSettingValue(id: string) {
  const value = Number(byId<HTMLInputElement>(id).value);
  text(
    `${id}Value`,
    id === 'fov'
      ? `${value}°`
      : id === 'volume'
        ? `${Math.round(value * 100)}%`
        : `${value.toFixed(2)}×`,
  );
}
export function configureGraphics(sim: Simulation, renderer: ScenePort) {
  const l = renderer.lighting,
    s = sim.settings;
  if (l) {
    l.textures = s.textures;
    l.shadows = s.shadows;
    l.setPreset(s.lighting);
  }
}
export function syncSettings(sim: Simulation, renderer: ScenePort) {
  const s = sim.settings;
  for (const [id, key] of Object.entries({
    mapSeed: 'seed',
    duration: 'minutes',
    quality: 'quality',
    hudScale: 'hudScale',
    distance: 'distance',
    fov: 'fov',
    brightness: 'brightness',
    sensitivity: 'sensitivity',
    adsSensitivity: 'adsSensitivity',
    volume: 'volume',
    aimMode: 'aimMode',
    secondary: 'secondary',
    arsenalSecondary: 'secondary',
    arsenalClass: 'loadout',
    loadout: 'loadout',
    scenario: 'scenario',
    battleSize: 'teamSize',
    lighting: 'lighting',
  })) {
    byId<HTMLInputElement>(id).value = String(s[key as keyof Settings]);
  }
  for (const [id, key] of Object.entries({
    motion: 'motion',
    adaptive: 'adaptive',
    touchMode: 'touch',
    textures: 'textures',
    shadows: 'shadows',
  }))
    byId<HTMLInputElement>(id).checked = Boolean(s[key as keyof Settings]);
  for (const id of ['fov', 'brightness', 'sensitivity', 'adsSensitivity', 'volume'])
    updateSettingValue(id);
  document.body.classList.toggle('touch', s.touch);
  text('scenarioName', scenario(s.scenario).name.toUpperCase());
  text('scenarioMeta', s.scenario === 'frontline' ? 'Central district' : 'Full city');
  configureGraphics(sim, renderer);
}
