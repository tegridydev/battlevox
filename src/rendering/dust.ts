import type { DustCloud, Vec3 } from '../core/types';
import type { Program } from './renderer';

/** Cosmetic dust has a fixed GPU cost and never changes AI perception. */
export class DustUniforms {
  readonly spheres = new Float32Array(16);
  readonly fade = new Float32Array(4);
  count = 0;
  update(clouds: readonly DustCloud[], eye: Vec3) {
    const nearest = clouds
      .filter((d) => d.life > 0 && Math.hypot(d.x - eye.x, d.y - eye.y, d.z - eye.z) < 100)
      .sort(
        (a, b) =>
          Math.hypot(a.x - eye.x, a.y - eye.y, a.z - eye.z) -
          Math.hypot(b.x - eye.x, b.y - eye.y, b.z - eye.z),
      )
      .slice(0, 4);
    this.count = nearest.length;
    for (let n = 0; n < this.count; n++) {
      const d = nearest[n],
        age = 1 - d.life / d.max;
      this.spheres.set([d.x, d.y, d.z, d.radius], n * 4);
      this.fade[n] = Math.max(0, Math.min(1, age * 7) * (1 - age) * d.strength);
    }
  }
  bind(gl: WebGL2RenderingContext, program: Program) {
    gl.uniform1i(program.extra.uDustCount, this.count);
    if (!this.count) return;
    gl.uniform4fv(program.extra['uDust[0]'], this.spheres);
    gl.uniform1fv(program.extra['uDustFade[0]'], this.fade);
  }
}
