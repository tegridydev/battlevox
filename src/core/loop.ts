import { STEP } from './config';
/** Fixed simulation steps, independent of animation scheduling and wall-clock jitter. */
export class FixedClock {
  private accumulator = 0;
  get alpha() {
    return this.accumulator / STEP;
  }
  advance(elapsed: number, running: () => boolean, step: (dt: number) => void) {
    if (!Number.isFinite(elapsed) || elapsed < 0) return;
    if (!running()) {
      this.accumulator = 0;
      return;
    }
    this.accumulator += Math.min(elapsed, 0.1);
    let count = 0;
    while (this.accumulator + 1e-9 >= STEP && count++ < 3 && running()) {
      step(STEP);
      this.accumulator = Math.max(0, this.accumulator - STEP);
    }
    this.accumulator = Math.min(this.accumulator, STEP);
  }
  reset() {
    this.accumulator = 0;
  }
}
