import { GameAudio } from './platform/audio';
import { loadStorage, type StoragePort, settingsKey } from './platform/storage';
import { Renderer } from './rendering/renderer';
import { Simulation } from './simulation/simulation';
import { App } from './ui/app';

function boot() {
  let storage: StoragePort | null = null;
  try {
    storage = window.localStorage;
  } catch {}
  const saved = loadStorage(storage);
  let hasSavedSettings = false;
  try {
    const raw = JSON.parse(storage?.getItem(settingsKey) ?? 'null');
    hasSavedSettings = !!raw && typeof raw === 'object' && !Array.isArray(raw);
  } catch {}
  if (!hasSavedSettings) {
    saved.settings.touch = matchMedia('(pointer: coarse)').matches;
    saved.settings.scenario = 'frontline';
    saved.settings.teamSize = 60;
    saved.settings.loadout = 'engineer';
  }
  const sim = new Simulation(saved.settings);
  try {
    const renderer = new Renderer(
        sim,
        document.getElementById('world') as HTMLCanvasElement,
        document.getElementById('hud') as HTMLCanvasElement,
      ),
      app = new App(sim, renderer, new GameAudio(sim), storage, saved.profile, saved);
    if (new URLSearchParams(location.search).get('diagnostics') === '1')
      Object.defineProperty(window, 'battlevoxDiagnostics', {
        value: { app, sim, renderer },
        configurable: true,
      });
    app.start();
    void app.boot();
  } catch (e) {
    const loading = document.getElementById('loading'),
      error = document.getElementById('error');
    if (loading) loading.hidden = true;
    if (error) {
      error.hidden = false;
      error.textContent = `Unable to start Battlevox: ${e instanceof Error ? e.message : String(e)}`;
    }
  }
}
if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
