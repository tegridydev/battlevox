import { clamp } from '../core/math';
import type { GameEvent } from '../core/types';
import type { Simulation } from '../simulation/simulation';
export interface AudioPort {
  resume(): void;
  sync(): void;
  consume(event: GameEvent): void;
  dispose(): void;
}
export class GameAudio implements AudioPort {
  private audio: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private voices = 0;
  private disposed = false;
  constructor(private sim: Simulation) {}
  resume() {
    if (this.disposed) return;
    try {
      if (!this.audio) {
        this.audio = new AudioContext();
        this.master = this.audio.createGain();
        this.master.connect(this.audio.destination);
        this.noise = this.audio.createBuffer(1, this.audio.sampleRate * 0.8, this.audio.sampleRate);
        const data = this.noise.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      }
      void this.audio.resume().catch(() => {});
      this.sync();
    } catch {}
  }
  sync() {
    if (this.master)
      this.master.gain.value = this.sim.playing ? this.sim.settings.volume * 0.45 : 0;
  }
  consume(event: GameEvent) {
    if (event.type === 'sound') this.sound(event);
    else if (event.type === 'hit') this.hit(event.killed, Boolean(event.headshot));
  }
  private hit(killed: boolean, headshot = false) {
    const a = this.audio,
      m = this.master;
    if (!a || !m || a.state !== 'running' || this.voices >= 24) return;
    const t = a.currentTime,
      o = a.createOscillator(),
      g = a.createGain();
    this.voices++;
    o.frequency.setValueAtTime(killed ? (headshot ? 1100 : 880) : headshot ? 1700 : 1400, t);
    o.frequency.exponentialRampToValueAtTime(killed ? 440 : 900, t + 0.07);
    g.gain.setValueAtTime(0.075, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    o.connect(g);
    g.connect(m);
    o.onended = () => {
      this.voices--;
      o.disconnect();
      g.disconnect();
    };
    o.start(t);
    o.stop(t + 0.1);
  }
  private sound(event: Extract<GameEvent, { type: 'sound' }>) {
    const a = this.audio,
      m = this.master,
      n = this.noise;
    if (
      !a ||
      !m ||
      !n ||
      a.state !== 'running' ||
      this.voices >= 24 ||
      this.sim.settings.volume <= 0
    )
      return;
    const p = this.sim.player,
      distance = Math.hypot(p.x - event.x, p.z - event.z),
      volume = event.gain / (1 + distance * 0.09);
    if (volume < 0.015) return;
    const t = a.currentTime,
      profile: Record<string, [number, number, number]> = {
        p12: [0.08, 2400, 1.35],
        r6: [0.18, 1450, 0.8],
        mp18: [0.065, 1950, 1.65],
        ar30: [0.095, 1750, 1.15],
        mg60: [0.135, 1150, 0.85],
        dmr8: [0.23, 2250, 0.72],
        launcher: [0.3, 580, 0.7],
        cannon: [0.48, 320, 0.62],
        crack: [0.22, 3000, 0.82],
        support: [0.12, 2300, 1.3],
        ping: [0.09, 3800, 1.4],
      },
      signature = profile[event.sound],
      duration =
        signature?.[0] ?? (event.sound === 'boom' ? 0.65 : event.sound === 'step' ? 0.065 : 0.045),
      source = a.createBufferSource(),
      filter = a.createBiquadFilter(),
      g = a.createGain(),
      pan = a.createStereoPanner();
    source.buffer = n;
    source.playbackRate.value = signature?.[2] ?? 1;
    filter.type = 'lowpass';
    filter.frequency.value =
      signature?.[1] ??
      (event.sound === 'boom'
        ? 260
        : event.sound === 'step'
          ? 420
          : event.sound === 'shot'
            ? 1700
            : 3800);
    g.gain.setValueAtTime(volume, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    pan.pan.value = clamp(
      ((event.x - p.x) * Math.cos(this.sim.yaw) - (event.z - p.z) * Math.sin(this.sim.yaw)) /
        (distance + 1),
      -0.9,
      0.9,
    );
    source.connect(filter);
    filter.connect(g);
    g.connect(pan);
    pan.connect(m);
    this.voices++;
    source.onended = () => {
      this.voices--;
      source.disconnect();
      filter.disconnect();
      g.disconnect();
      pan.disconnect();
    };
    source.start(t);
    source.stop(t + duration);
  }
  dispose() {
    this.disposed = true;
    if (this.audio) void this.audio.close().catch(() => {});
    this.audio = null;
    this.master = null;
    this.noise = null;
  }
}
