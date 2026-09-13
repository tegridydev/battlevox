import type { SmokeCloud } from '../core/types';
import { smokeRadius } from '../simulation/perception';
import type { Program } from './renderer';
/** Fixed buffers are filled once per frame and shared by sky, terrain and actors. */
export class SmokeUniforms {
  private spheres = new Float32Array(12 * 4);
  private fade = new Float32Array(12);
  private count = 0;
  update(clouds: readonly SmokeCloud[]) {
    this.count = 0;
    for (const c of clouds) {
      const radius = smokeRadius(c);
      if (radius <= 0 || this.count >= 12) continue;
      const n = this.count++,
        i = n * 4;
      this.spheres[i] = c.x;
      this.spheres[i + 1] = c.y;
      this.spheres[i + 2] = c.z;
      this.spheres[i + 3] = radius;
      this.fade[n] = Math.min(1, c.life / 2);
    }
  }
  bind(gl: WebGL2RenderingContext, program: Program) {
    gl.uniform1i(program.extra.uSmokeCount, this.count);
    if (!this.count) return;
    gl.uniform4fv(program.extra['uSmoke[0]'], this.spheres);
    gl.uniform1fv(program.extra['uSmokeFade[0]'], this.fade);
  }
}
