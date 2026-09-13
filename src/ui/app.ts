import { kits, weapons } from '../core/config';
import { secondaryIndex } from '../core/loadout';
import { FixedClock } from '../core/loop';
import { clamp, dist2 } from '../core/math';
import {
  ensureCareer,
  ensureItem,
  equip,
  finishCareerMatch,
  itemTracks,
  progress,
  recordXp,
  tuning,
} from '../core/progression';
import type { Kit, MatchReport, Profile, Screen } from '../core/types';
import type { AudioPort } from '../platform/audio';
import { InputController } from '../platform/input';
import { type Exclusive, ProfileSession } from '../platform/profile-session';
import {
  profileKey,
  type StoragePort,
  saveSettings,
  validateProfile,
  validateSettings,
} from '../platform/storage';
import { beginDestructionFrame } from '../simulation/destruction-budget';
import type { Simulation } from '../simulation/simulation';
import { renderCareer, renderDebrief } from './career';
import { byId, option, text } from './dom';
import { type HudViewModel } from './hud-model';
import { updateHUD } from './hud-view';
import { FieldLab } from './lab';
import { renderScores, updateScores } from './scoreboard-view';
import { ScreenLayout } from './screen-layout';
import { configureGraphics, syncSettings, updateSettingValue } from './settings-view';
import { TacticalMap } from './tactical-map';
import { updateTactical } from './tactical-view';
export interface ScenePort {
  hudState?: HudViewModel;
  mini: HTMLCanvasElement;
  displayFPS: number;
  render(dt: number): void;
  adaptiveResolution(dt: number): void;
  resize(): void;
  drawMinimap(): void;
  dispose(): void;
  lighting?: {
    preset: 'daylight' | 'afternoon' | 'overcast';
    textures: boolean;
    shadows: boolean;
    available: boolean;
    clock: number;
    setPreset(value: 'daylight' | 'afternoon' | 'overcast'): void;
  };
}
export class App {
  private abort = new AbortController();
  private clock = new FixedClock();
  private previous = 0;
  private raf = 0;
  private uiTime = 0;
  private disposed = false;
  private halted = false;
  private generation = 0;
  private matchXp = 0;
  private matchId = '';
  private matchSeed = 0;
  private profileDirty = false;
  private saveClock = 0;
  private saving = false;
  private writer: ProfileSession;
  readonly lab: FieldLab;
  readonly screens: ScreenLayout;
  private tacticalState = { rosterPage: 0 };
  private scoreFocus: HTMLElement | null = null;
  private scoreClock = 0;
  private refreshCareer() {
    renderCareer(this.profile, this.screens.career);
  }
  private labReturn: Screen = 'home';
  private modalAction: (() => void) | null = null;
  private modalFocus: HTMLElement | null = null;
  openLab() {
    if (this.sim.loading) return;
    if (this.sim.menuState !== 'lab') this.labReturn = this.sim.menuState;
    this.show('lab');
  }
  closeLab() {
    this.show(this.sim.ended ? 'results' : this.labReturn === 'lab' ? 'home' : this.labReturn);
    if (this.sim.menuState === 'play') this.input.requestLook();
  }
  confirmAction(title: string, message: string, action: () => void) {
    this.modalAction = action;
    this.modalFocus = document.activeElement as HTMLElement;
    text('dialogTitle', title);
    text('dialogMessage', message);
    byId('actionDialog').hidden = false;
    byId('overlay').inert = true;
    byId('tactical').inert = true;
    byId('dialogCancel').focus();
  }
  closeDialog(accept = false) {
    const action = this.modalAction;
    this.modalAction = null;
    byId('actionDialog').hidden = true;
    byId('overlay').inert = false;
    byId('tactical').inert = false;
    this.modalFocus?.focus();
    this.modalFocus = null;
    if (accept) action?.();
  }
  private reportSave(message: string, problem = false) {
    if (this.disposed) return;
    text('saveStatus', message);
    text('profileState', message);
    byId('profileState').classList.toggle('warning', problem);
  }
  private exportProfile() {
    const body = JSON.stringify(
      { version: '0.6.1', profile: this.profile, checkpoints: this.writer.checkpoints() },
      null,
      2,
    );
    const url = URL.createObjectURL(new Blob([body], { type: 'application/json' })),
      link = document.createElement('a');
    link.href = url;
    link.download = 'battlevox-profile.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  private applyTuning() {
    this.sim.weaponTuning = weapons.map((w) => tuning(this.profile, w.id));
    this.sim.itemTuning = Object.fromEntries(
      itemTracks.map((t) => [t.id, tuning(this.profile, t.id).ability]),
    );
  }
  savePreferences() {
    const ok = saveSettings(this.storage, this.sim.settings);
    if (!ok) this.reportSave('Settings active. Device storage is unavailable.', true);
    return ok;
  }
  flushProfile() {
    if (!this.profileDirty) return;
    this.writer.checkpoint(this.profile);
    if (this.saving) return;
    this.saving = true;
    this.saveClock = 0;
    const snapshot = validateProfile(this.profile),
      serialised = JSON.stringify(snapshot);
    void this.writer.commit(snapshot).then((result) => {
      this.saving = false;
      if (result.ok) {
        this.profileDirty = JSON.stringify(validateProfile(this.profile)) !== serialised;
        if (this.profileDirty) this.writer.checkpoint(this.profile);
        this.reportSave('Saved on this device.');
        if (this.profileDirty && !this.disposed) this.flushProfile();
      } else {
        this.profileDirty = true;
        this.reportSave(
          result.reason === 'conflict'
            ? 'Another tab changed this profile. Recover or export from Barracks.'
            : result.reason === 'checkpoint'
              ? 'Session backup saved. Device save pending.'
              : 'Storage unavailable. Export your profile.',
          true,
        );
      }
    });
  }
  readonly input: InputController;
  readonly map: TacticalMap;
  constructor(
    public sim: Simulation,
    private renderer: ScenePort,
    private audio: AudioPort,
    private storage: StoragePort | null,
    private profile: Profile,
    saved?: {
      profileBase: string | null;
      recovered: boolean;
      recoveryConflict: boolean;
      exclusiveWrite?: Exclusive;
    },
  ) {
    let base: string | null = null;
    try {
      base = saved ? saved.profileBase : (storage?.getItem(profileKey) ?? null);
    } catch {}
    this.writer = new ProfileSession(storage, base, saved?.exclusiveWrite);
    this.profileDirty = !!saved?.recovered;
    this.screens = new ScreenLayout(this.abort.signal, () => this.refreshCareer());
    this.lab = new FieldLab(this, renderer, this.abort.signal);
    this.input = new InputController(this, byId<HTMLCanvasElement>('world'));
    this.map = new TacticalMap(
      byId<HTMLCanvasElement>('tacticalMap'),
      sim,
      renderer.mini,
      (value) => {
        byId<HTMLSelectElement>('spawnSelect').value = value;
        this.readDeployment();
      },
    );
    ensureCareer(this.profile);
    this.applyTuning();
    this.bind();
    this.syncSettings();
    this.show('home');
    if (saved?.recoveryConflict)
      this.reportSave('Multiple session backups found. Choose one in Barracks.', true);
  }
  private bind() {
    const signal = this.abort.signal,
      s = this.sim;
    const click = (id: string, fn: () => void) =>
      byId(id).addEventListener('click', fn, { signal });
    click('labButton', () => this.openLab());
    for (const b of document.querySelectorAll<HTMLButtonElement>('[data-weapon-slot]'))
      b.addEventListener('click', () => s.selectWeaponSlot(Number(b.dataset.weaponSlot)), {
        signal,
      });
    click('rosterPrev', () => {
      this.tacticalState.rosterPage = Math.max(0, this.tacticalState.rosterPage - 1);
      this.updateTactical();
    });
    click('rosterNext', () => {
      this.tacticalState.rosterPage++;
      this.updateTactical();
    });
    for (const id of ['secondary', 'arsenalSecondary'])
      byId(id).addEventListener(
        'change',
        (e) => {
          s.settings.secondary = secondaryIndex(Number((e.target as HTMLSelectElement).value));
          this.syncSettings();
          this.savePreferences();
          if (s.menuState === 'deployment') this.updateTactical();
        },
        { signal },
      );
    byId('arsenalClass').addEventListener(
      'change',
      (e) => {
        s.settings = validateSettings({
          ...s.settings,
          loadout: (e.target as HTMLSelectElement).value,
        });
        this.syncSettings();
        this.savePreferences();
      },
      { signal },
    );
    click('dialogCancel', () => this.closeDialog());
    click('dialogConfirm', () => this.closeDialog(true));
    click('exportProfile', () => this.exportProfile());
    click('recoverProfile', () => {
      if (this.saving) {
        this.reportSave(
          'FINISHING THE CURRENT SAVE · RECOVERY WILL BE AVAILABLE WHEN IT COMPLETES',
          true,
        );
        return;
      }
      const key = byId<HTMLSelectElement>('checkpointChoice').value;
      const selected = this.writer.checkpoints().find((p) => p.key === key);
      this.confirmAction(
        'LOAD A SAVED PROFILE?',
        'Your current session remains in its checkpoint. Loading a profile replaces the career shown in this tab.',
        () => {
          this.writer.checkpoint(this.profile);
          this.profile = selected
            ? validateProfile(selected.profile)
            : (() => {
                try {
                  return validateProfile(JSON.parse(this.storage?.getItem(profileKey) ?? 'null'));
                } catch {
                  return validateProfile(null);
                }
              })();
          this.writer = new ProfileSession(
            this.storage,
            (() => {
              try {
                return this.storage?.getItem(profileKey) ?? null;
              } catch {
                return null;
              }
            })(),
          );
          this.profileDirty = true;
          this.applyTuning();
          this.refreshCareer();
          this.flushProfile();
        },
      );
    });
    click('deploy', () => (s.started && !s.ended ? this.show('confirm') : void this.newRound()));
    for (const id of ['newConfirmed', 'restart']) click(id, () => void this.newRound());
    for (const id of ['homeResume', 'resume', 'returnToGame']) click(id, () => this.resume());
    click('confirmBack', () => this.show('home'));
    click('pause', () => this.pause());
    click('quit', () => this.show('home'));
    click('resultHome', () => this.show('home'));
    click('redeploy', () => {
      if (s.player.alive) {
        s.player.shield = 0;
        const invulnerable = s.practiceInvulnerable;
        s.practiceInvulnerable = false;
        try {
          s.hurt(s.player, 1000, null);
        } finally {
          s.practiceInvulnerable = invulnerable;
        }
      }
      s.playing = true;
      this.openTactical('deployment');
    });
    click('mapToggle', () => this.openTactical('map'));
    click('ordersButton', () => this.openTactical('orders'));
    click('scoreButton', () =>
      byId('scoreboard').hidden ? this.showScores() : this.closeScores(),
    );
    click('closeScores', () => this.closeScores());
    click('tacticalClose', () => (s.menuState === 'deployment' ? this.pause() : this.resume()));
    for (const el of document.querySelectorAll<HTMLButtonElement>('[data-menu]'))
      el.addEventListener(
        'click',
        () => (el.dataset.menu === 'lab' ? this.openLab() : this.show(el.dataset.menu as Screen)),
        { signal },
      );
    byId('arsenal').addEventListener(
      'change',
      (event) => {
        const element = (event.target as HTMLElement).closest<HTMLSelectElement>(
          'select[data-item]',
        );
        if (!element || !equip(this.profile, element.dataset.item || '', element.value)) return;
        this.applyTuning();
        // A configuration change cancels an in-progress reload without spending ammunition.
        s.reloadTime = 0;
        this.profileDirty = true;
        this.flushProfile();
        this.refreshCareer();
      },
      { signal },
    );
    byId('callsignForm').addEventListener(
      'submit',
      (event) => {
        event.preventDefault();
        ensureCareer(this.profile).name =
          byId<HTMLInputElement>('callsign')
            .value.replace(/[\u0000-\u001f\u007f]/g, '')
            .trim()
            .slice(0, 24) || 'OPERATIVE';
        this.profileDirty = true;
        this.flushProfile();
        this.refreshCareer();
      },
      { signal },
    );
    byId('kitAction').addEventListener('click', () => s.classAbility(), { signal });
    for (const [button, panel] of [
      ['hudMapToggle', 'map'],
      ['hudSquadToggle', 'squad'],
    ] as const) {
      byId(button).addEventListener(
        'click',
        () => {
          if (innerHeight < 500 || (s.touch && innerHeight < 650)) {
            this.openTactical('map');
            return;
          }
          const open = document.body.dataset.hudPanel !== panel;
          document.body.dataset.hudPanel = open ? panel : '';
          for (const id of ['hudMapToggle', 'hudSquadToggle'])
            byId(id).setAttribute('aria-expanded', String(open && id === button));
          this.renderer.resize();
        },
        { signal },
      );
    }
    for (const el of document.querySelectorAll<HTMLButtonElement>('[data-order]'))
      el.addEventListener(
        'click',
        () => this.order(el.dataset.order as 'follow' | 'objective' | 'hold'),
        { signal },
      );
    const settingMap = {
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
      motion: 'motion',
      adaptive: 'adaptive',
      touchMode: 'touch',
      aimMode: 'aimMode',
      scenario: 'scenario',
      battleSize: 'teamSize',
      lighting: 'lighting',
      textures: 'textures',
      shadows: 'shadows',
    } as const;
    for (const [id, key] of Object.entries(settingMap))
      byId(id).addEventListener(
        'change',
        () => {
          const el = byId<HTMLInputElement>(id);
          const value =
            el.type === 'checkbox'
              ? el.checked
              : ['aimMode', 'scenario', 'lighting'].includes(key)
                ? el.value
                : Number(el.value);
          s.settings = validateSettings({ ...s.settings, [key]: value });
          this.syncSettings();
          this.savePreferences();
          this.configureGraphics();
          this.renderer.resize();
          this.audio.sync();
        },
        { signal },
      );
    for (const id of ['fov', 'brightness', 'sensitivity', 'adsSensitivity', 'volume'])
      byId(id).addEventListener('input', () => this.updateSettingValue(id), { signal });
    for (const id of ['squadSelect', 'roleSelect', 'spawnSelect', 'loadout'])
      byId(id).addEventListener('change', () => this.readDeployment(), { signal });
    click('deployNow', () => {
      this.readDeployment();
      if (s.deploy()) {
        this.audio.resume();
        this.show('play');
        this.input.requestLook();
      } else this.updateTactical();
    });
    click('zoomIn', () => {
      this.map.zoom = clamp(this.map.zoom * 1.25, 1, 4);
    });
    click('zoomOut', () => {
      this.map.zoom = clamp(this.map.zoom / 1.25, 1, 4);
    });
    click('zoomReset', () => this.map.reset());
    click('fullscreen', () => {
      try {
        const request = document.fullscreenElement
          ? document.exitFullscreen()
          : document.documentElement.requestFullscreen();
        if (request) void request.catch(() => {});
      } catch {}
    });
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.hidden) {
          this.processEvents();
          this.flushProfile();
        }
      },
      { signal },
    );
    window.addEventListener(
      'storage',
      (event) => {
        if (event.key === profileKey && event.newValue)
          this.reportSave(
            'PROFILE UPDATED IN ANOTHER TAB · THIS SESSION IS PROTECTED FROM OVERWRITE',
            true,
          );
      },
      { signal },
    );
    window.addEventListener('resize', () => this.renderer.resize(), { signal });
    byId('world').addEventListener(
      'webglcontextlost',
      (e) => {
        e.preventDefault();
        this.fail('Graphics context lost. Reload to restart, and try a lower resolution.');
      },
      { signal },
    );
    window.addEventListener(
      'pagehide',
      (event) => {
        this.processEvents();
        this.flushProfile();
        if (event.persisted) {
          this.pause();
          this.input.reset();
          cancelAnimationFrame(this.raf);
          this.raf = 0;
        } else this.dispose();
      },
      { signal },
    );
    window.addEventListener(
      'pageshow',
      (event) => {
        if (event.persisted && !this.disposed) {
          this.clock.reset();
          this.input.reset();
          this.pause();
          this.start();
        }
      },
      { signal },
    );
  }
  updateSettingValue(id: string) {
    updateSettingValue(id);
  }
  configureGraphics() {
    configureGraphics(this.sim, this.renderer);
  }
  syncSettings() {
    syncSettings(this.sim, this.renderer);
  }
  show(screen: Screen) {
    const s = this.sim;
    if (!byId('actionDialog').hidden) this.closeDialog();
    s.setScreen(screen);
    if (screen === 'lab') this.lab.sync();
    if (screen === 'barracks') {
      const selector = byId<HTMLSelectElement>('checkpointChoice');
      selector.replaceChildren(option('latest', 'Saved profile'));
      for (const p of this.writer.checkpoints())
        selector.append(
          option(
            p.key,
            `${new Date(p.updatedAt).toLocaleString()} · ${p.profile.career?.name ?? 'OPERATIVE'} · ${p.profile.career?.xp ?? 0} XP`,
          ),
        );
    }
    this.input.reset();
    if (screen !== 'play') this.input.releaseLook();
    const tactical = ['deployment', 'map', 'orders'].includes(screen);
    byId('tactical').hidden = !tactical;
    byId('overlay').hidden = tactical || screen === 'play';
    byId('gameHUD').hidden = !s.started || !['play', 'map', 'orders'].includes(screen);
    document.body.classList.toggle('inPlay', screen === 'play');
    for (const page of document.querySelectorAll<HTMLElement>('[data-page]'))
      page.hidden = page.dataset.page !== screen;
    for (const button of document.querySelectorAll<HTMLElement>('[data-menu]')) {
      const selected = button.dataset.menu === screen;
      button.classList.toggle('selected', selected);
      if (selected) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
    byId('homeResume').hidden = !s.started || s.ended;
    byId('homeResume').classList.toggle('primary', s.started && !s.ended);
    byId('deploy').classList.toggle('primary', !s.started || s.ended);
    document.body.classList.toggle('activeMatch', s.started && !s.ended);
    document.body.dataset.screen = screen;
    if (screen === 'play' && this.renderer.lighting) this.renderer.lighting.clock = 1;
    byId('noMatch').hidden = s.started && !s.ended;
    byId('carriedLoadout').hidden = !s.started;
    if (['home', 'loadouts', 'barracks', 'challenges', 'results'].includes(screen)) {
      this.refreshCareer();
      this.flushProfile();
    }
    this.closeScores();
    text(
      'profile',
      `${this.profile.games} matches · ${this.profile.wins} wins · ${this.profile.kills} kills`,
    );

    if (tactical) {
      this.tacticalState.rosterPage = 0;
      this.screens.select('tactical', screen === 'orders' ? 'orders' : 'roster');
      this.updateTactical();
    }
    this.audio.sync();
    if (screen !== 'play') {
      const panel = tactical
        ? byId('tactical')
        : (document.querySelector<HTMLElement>('[data-page]:not([hidden])') ?? byId('overlay'));
      [
        ...panel.querySelectorAll<HTMLElement>(
          'button:not(:disabled),select:not(:disabled),input:not(:disabled)',
        ),
      ]
        .find((el) => !el.closest('[hidden]'))
        ?.focus({ preventScroll: true });
    }
  }
  pause() {
    this.processEvents();
    this.flushProfile();
    if (!this.sim.started || this.sim.ended || this.sim.loading) return;
    this.show('pause');
  }
  resume() {
    if (!this.sim.started || this.sim.ended || this.sim.loading) return;
    if (!this.sim.player.alive) {
      this.openTactical('deployment');
      return;
    }
    this.audio.resume();
    this.show('play');
    this.input.requestLook();
  }
  openTactical(screen: 'deployment' | 'map' | 'orders') {
    if (!this.sim.started || this.sim.ended || this.sim.loading) return;
    if (!this.sim.player.alive) screen = 'deployment';
    if (screen === 'deployment') {
      byId<HTMLSelectElement>('spawnSelect').value =
        this.sim.spawnTarget === 'leader'
          ? 'leader'
          : `base:${this.sim.spawnChoice < 0 ? 1 : this.sim.spawnChoice}`;
      this.sim.selectedSquad = this.sim.player.squadId;
      this.sim.selectedRole =
        this.sim.squads[this.sim.player.squadId].leaderId === this.sim.player.id
          ? 'leader'
          : 'member';
      byId<HTMLSelectElement>('squadSelect').value = String(this.sim.selectedSquad);
      byId<HTMLSelectElement>('roleSelect').value = this.sim.selectedRole;
    }
    this.show(screen);
  }
  order(kind: 'follow' | 'objective' | 'hold') {
    const point = this.map.selected ?? this.sim.player;
    const goal = this.sim.world.flags.reduce(
      (best, f, i, all) => (dist2(point, f) < dist2(point, all[best]) ? i : best),
      this.sim.handling.objective,
    );
    this.sim.issueOrder(
      kind === 'hold'
        ? {
            kind,
            position: { x: point.x, y: this.sim.world.groundAt(point.x, point.z), z: point.z },
          }
        : kind === 'objective'
          ? { kind, objective: goal }
          : { kind },
    );
    this.updateTactical();
  }
  readDeployment() {
    const s = this.sim;
    s.selectedSquad = Number(byId<HTMLSelectElement>('squadSelect').value);
    s.selectedRole = byId<HTMLSelectElement>('roleSelect').value === 'member' ? 'member' : 'leader';
    const spawn = byId<HTMLSelectElement>('spawnSelect').value;
    s.spawnTarget = spawn === 'leader' ? 'leader' : 'base';
    s.spawnChoice = spawn === 'leader' ? 1 : Number(spawn.split(':')[1]);
    const kit = byId<HTMLSelectElement>('loadout').value;
    if (kit in kits) s.settings.loadout = kit as Kit;
    s.spawnError = '';
    this.savePreferences();
    this.updateTactical();
  }
  updateTactical() {
    updateTactical(this.sim, this.tacticalState, () => this.timeLeft());
  }
  updateHUD() {
    updateHUD(this.sim, this.renderer, () => this.timeLeft());
  }
  private timeLeft() {
    const left = Math.max(0, this.sim.roundLimit - this.sim.simTime);
    return `${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, '0')}`;
  }
  closeScores() {
    const wasOpen = !byId('scoreboard').hidden;
    byId('scoreboard').hidden = true;
    byId('overlay').inert = false;
    byId('tactical').inert = false;
    byId('gameHUD').inert = false;
    this.scoreFocus?.focus({ preventScroll: true });
    this.scoreFocus = null;
    if (this.sim.menuState === 'play' && this.renderer.lighting) this.renderer.lighting.clock = 1;
    if (wasOpen && this.sim.menuState === 'play') this.input.requestLook();
  }
  showScores() {
    if (!this.sim.started) return;
    this.scoreFocus = document.activeElement as HTMLElement;
    this.input.reset();
    byId('overlay').inert = true;
    byId('tactical').inert = true;
    byId('gameHUD').inert = true;
    renderScores(this.sim);
    byId('scoreboard').hidden = false;
    this.input.releaseLook();
    byId('closeScores').focus();
  }
  private updateScores() {
    updateScores(this.sim);
  }
  processEvents() {
    for (const event of this.sim.events.splice(0)) {
      this.audio.consume(event);
      if (event.type === 'xp') {
        this.sim.roundPractice ||= this.sim.practiceInvulnerable || this.sim.practiceSupplies;
        if (this.sim.roundPractice) continue;
        const before = progress(ensureCareer(this.profile).xp).level;
        const itemBefore = event.itemId
          ? progress(ensureItem(this.profile, event.itemId).xp, 30, true).level
          : 0;
        const completed = recordXp(this.profile, event);
        this.matchXp += event.points + completed.reduce((n, a) => n + a.xp, 0);
        this.profileDirty = true;
        for (const a of completed)
          this.sim.notify(
            `ASSIGNMENT COMPLETE · ${a.name.toUpperCase()} +${a.xp} XP`,
            this.sim.player.team,
          );
        const after = progress(ensureCareer(this.profile).xp).level;
        if (after > before) this.sim.notify(`CAREER RANK ${after} UNLOCKED`, this.sim.player.team);
        if (event.itemId) {
          const track = itemTracks.find((t) => t.id === event.itemId);
          if (track) {
            const level = progress(
              ensureItem(this.profile, track.id).xp,
              track.maxLevel,
              true,
            ).level;
            if (level > itemBefore)
              this.sim.notify(`${track.name} · MASTERY LEVEL ${level}`, this.sim.player.team);
          }
        }
      }
      if (event.type === 'death' && !this.sim.player.alive) this.openTactical('deployment');
      if (event.type === 'revived' && this.sim.menuState === 'deployment') this.show('play');
      if (event.type === 'finished') {
        this.matchId ||= `${Date.now()}-${this.sim.world.seed}-${this.generation}`;
        const report: MatchReport = {
          id: this.matchId,
          endedAt: Date.now(),
          seed: this.matchSeed || this.sim.settings.seed,
          seconds: this.sim.simTime,
          result:
            event.winner === null
              ? 'draw'
              : event.winner === (this.sim.player.team === 0)
                ? 'victory'
                : 'defeat',
          score: this.sim.score,
          xp: this.matchXp,
          stats: { ...this.sim.roundStats },
          medals: [],
        };
        if (!this.sim.roundPractice) {
          const result = finishCareerMatch(this.profile, report);
          if (result.duplicate) continue;
          this.profileDirty = true;
          this.flushProfile();
        } else {
          report.xp = 0;
          report.medals = [];
        }
        text(
          'roundTitle',
          event.winner === null ? 'DRAW' : event.winner ? 'AEGIS VICTORY' : 'CINDER VICTORY',
        );
        text(
          'roundStats',
          `${this.sim.roundPractice ? 'PRACTICE · NO CAREER REWARDS · ' : ''}${event.reason === 'reserves' ? 'RESERVES EXHAUSTED' : event.reason === 'control' ? 'CONTROL GOAL REACHED' : 'TIME EXPIRED'} · ${Math.floor(this.sim.controlTime[0])}s : ${Math.floor(this.sim.controlTime[1])}s · ${this.sim.score} SCORE`,
        );
        renderDebrief(report);
        this.show('results');
      }
    }
  }
  async boot() {
    await this.prepare(false);
  }
  async newRound() {
    this.audio.resume();
    await this.prepare(true);
  }
  private preparation: Promise<void> | null = null;
  private preparationIsMatch = false;
  private loadingJob: Generator<void, void, unknown> | null = null;
  private prepare(match: boolean): Promise<void> {
    if (this.disposed) return Promise.resolve();
    if (this.preparation) {
      if (match && !this.preparationIsMatch) return this.preparation.then(() => this.prepare(true));
      return this.preparation;
    }
    this.preparationIsMatch = match;
    this.preparation = this.runPreparation(match).finally(() => {
      this.preparation = null;
    });
    return this.preparation;
  }
  private async runPreparation(match: boolean) {
    const token = ++this.generation,
      s = this.sim;
    this.processEvents();
    this.flushProfile();
    if (match) {
      s.testArena = s.settings.scenario;
      s.battleTeamSize = s.settings.teamSize;
      this.map.selected = null;
      this.map.reset();
      this.matchXp = 0;
      this.matchSeed = s.settings.seed;
      this.matchId = `${Date.now()}-${s.settings.seed}-${token}`;
      this.applyTuning();
    }
    s.loading = true;
    s.playing = false;
    this.input.reset();
    this.input.releaseLook();
    byId('loading').hidden = false;
    byId('loadProgress').removeAttribute('value');
    byId('error').hidden = true;
    this.audio.sync();
    const breathe = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    try {
      text('loadLabel', 'GENERATING METROPOLIS');
      await breathe();
      if (this.disposed || token !== this.generation) return;
      const job = match ? s.resetSteps() : s.world.prepareSteps(s.settings.seed);
      this.loadingJob = job;
      let slices = 0;
      let done = false;
      while (!done) {
        const deadline = performance.now() + 8;
        do {
          done = !!job.next().done;
          slices++;
        } while (!done && performance.now() < deadline);
        text('loadLabel', `PREPARING CITY / ${slices}`);
        if (!done) await breathe();
        if (this.disposed || token !== this.generation) {
          job.return();
          return;
        }
      }
      this.loadingJob = null;
      this.renderer.drawMinimap();
      while (s.world.dirtyQueue.size) {
        s.world.rebuildPending(10);
        byId<HTMLProgressElement>('loadProgress').value =
          100 * (1 - s.world.dirtyQueue.size / s.world.chunks.length);
        text(
          'loadLabel',
          `BUILDING CITY / ${s.world.chunks.length - s.world.dirtyQueue.size} OF ${s.world.chunks.length}`,
        );
        await breathe();
        if (this.disposed || token !== this.generation) return;
      }
      s.loading = false;
      byId('loading').hidden = true;
      this.clock.reset();
      this.previous = performance.now();
      if (match) {
        this.syncSettings();
        this.openTactical('deployment');
      } else this.show('home');
    } catch (e) {
      this.loadingJob?.return();
      this.loadingJob = null;
      if (this.disposed || token !== this.generation) return;
      s.loading = false;
      this.fail(`Unable to build city: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  tick(dt: number) {
    const s = this.sim;
    if (this.disposed) return;
    try {
      beginDestructionFrame(s);
      this.clock.advance(
        dt,
        () => s.playing && !s.loading,
        (step) => s.fixedUpdate(step),
      );
      s.destructionBudget = null;
      this.processEvents();
      if (!byId('scoreboard').hidden) {
        this.scoreClock += dt;
        if (this.scoreClock >= 1) {
          this.scoreClock = 0;
          this.updateScores();
        }
      } else this.scoreClock = 0;
      this.saveClock += dt;
      if (this.saveClock >= 2) this.flushProfile();
      if (!s.loading) {
        this.sim.renderAlpha = this.sim.playing ? this.clock.alpha : 1;
        if (s.menuState === 'play' && byId('scoreboard').hidden) {
          this.renderer.render(dt);
          this.renderer.adaptiveResolution(dt);
        } else if (
          s.world.mapDirty &&
          (s.menuState === 'map' || s.menuState === 'orders' || s.menuState === 'deployment')
        ) {
          this.renderer.drawMinimap();
        }
        if (this.sim.menuState === 'lab') this.lab.update();
        this.uiTime += dt;
        if (this.uiTime >= 0.1) {
          this.uiTime = 0;
          this.updateHUD();
          if (!byId('tactical').hidden) {
            this.updateTactical();
            this.map.draw();
          }
        }
      }
    } catch (e) {
      this.fail(`Game stopped: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  start() {
    if (this.raf || this.disposed) return;
    this.previous = performance.now();
    const frame = (now: number) => {
      if (this.disposed || this.halted) return;
      this.tick(Math.max(0, (now - this.previous) / 1000));
      this.previous = now;
      if (!this.halted) this.raf = requestAnimationFrame(frame);
    };
    this.raf = requestAnimationFrame(frame);
  }
  fail(message: string) {
    this.processEvents();
    this.flushProfile();
    this.halted = true;
    this.sim.playing = false;
    this.sim.loading = false;
    this.input.reset();
    this.input.releaseLook();
    this.audio.sync();
    byId('loading').hidden = true;
    byId('error').hidden = false;
    text('error', `${message}\nReload the page to restart.`);
    byId('error').focus();
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }
  dispose() {
    if (this.disposed) return;
    this.processEvents();
    this.flushProfile();
    this.disposed = true;
    this.generation++;
    this.loadingJob?.return();
    this.loadingJob = null;
    cancelAnimationFrame(this.raf);
    this.abort.abort();
    this.input.dispose();
    this.map.dispose();
    this.sim.dispose();
    this.renderer.dispose();
    this.audio.dispose();
  }
}
