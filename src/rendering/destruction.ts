import type { RubbleBody } from '../core/types';
import { rubbleBounds, turnSection } from '../simulation/rubble-shape';
import { prepareSectionMesh, sectionMeshes } from '../simulation/section-mesh';
import { insideFrustum } from './frustum';
import type { Renderer } from './renderer';

const meshJobs = new WeakMap<
  RubbleBody,
  { version: number; job: Generator<void, void, unknown> }
>();

export function prepareRubble(renderer: Renderer) {
  const { sim, gl } = renderer,
    live = new Set(sim.rubble);
  for (const [body, gpu] of renderer.gpuSections)
    if (!live.has(body)) {
      gl.deleteVertexArray(gpu.vao);
      gl.deleteBuffer(gpu.buffer);
      renderer.gpuSections.delete(body);
    }
  const deadline = performance.now() + 2;
  for (const body of sim.rubble) {
    const bounds = rubbleBounds(body),
      camera = sim.camera;
    const distance = Math.hypot(
      Math.max(bounds.min.x - camera.x, 0, camera.x - bounds.max.x),
      Math.max(bounds.min.z - camera.z, 0, camera.z - bounds.max.z),
    );
    const visible =
      distance <= sim.settings.distance && insideFrustum(renderer.cameraPlanes, bounds);
    const caster = renderer.lighting.shadows && renderer.lighting.available && distance < 230;
    if (!body.voxels.length || (!visible && !caster)) continue;
    let gpu = renderer.gpuSections.get(body);
    if (!gpu) {
      const vao = gl.createVertexArray(),
        buffer = gl.createBuffer();
      if (!vao || !buffer) {
        if (vao) gl.deleteVertexArray(vao);
        if (buffer) gl.deleteBuffer(buffer);
        throw Error('Unable to allocate section mesh');
      }
      gpu = { vao, buffer, version: -1, count: 0 };
      renderer.gpuSections.set(body, gpu);
    }
    gl.bindVertexArray(gpu.vao);
    if (gpu.version !== body.geometryVersion) {
      let mesh = sectionMeshes.get(body);
      if (mesh?.version !== body.geometryVersion && performance.now() < deadline) {
        let pending = meshJobs.get(body);
        if (!pending || pending.version !== body.geometryVersion) {
          pending = {
            version: body.geometryVersion,
            job: prepareSectionMesh(body, sim.world.colours),
          };
          meshJobs.set(body, pending);
        }
        do {
          if (pending.job.next().done) {
            meshJobs.delete(body);
            break;
          }
        } while (performance.now() < deadline);
        mesh = sectionMeshes.get(body);
      }
      if (
        mesh?.version === body.geometryVersion &&
        (gpu.version < 0 || performance.now() < deadline)
      ) {
        gl.bindBuffer(gl.ARRAY_BUFFER, gpu.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, mesh.data, gl.STATIC_DRAW);
        for (let i = 0; i < 3; i++) {
          gl.enableVertexAttribArray(i);
          gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 40, i * 12);
        }
        gl.enableVertexAttribArray(3);
        gl.vertexAttribPointer(3, 1, gl.FLOAT, false, 40, 36);
        gpu.count = mesh.data.length / 10;
        gpu.version = body.geometryVersion;
      }
    }
  }
}
export function drawRubble(renderer: Renderer) {
  renderer.bind(renderer.sectionProgram, renderer.viewVP, renderer.sim.camera);
  const gl = renderer.gl;
  for (const [body, gpu] of renderer.gpuSections) {
    if (!body.voxels.length || !insideFrustum(renderer.cameraPlanes, rubbleBounds(body))) continue;
    const bounds = rubbleBounds(body),
      cam = renderer.sim.camera;
    if (
      Math.hypot(
        Math.max(bounds.min.x - cam.x, 0, cam.x - bounds.max.x),
        Math.max(bounds.min.z - cam.z, 0, cam.z - bounds.max.z),
      ) > renderer.sim.settings.distance
    )
      continue;
    gl.bindVertexArray(gpu.vao);
    gl.uniform3f(
      renderer.sectionProgram.extra.uMaterialOrigin,
      body.materialOrigin.x,
      body.materialOrigin.y,
      body.materialOrigin.z,
    );
    const x = turnSection(body, { x: 1, y: 0, z: 0 }),
      y = turnSection(body, { x: 0, y: 1, z: 0 }),
      z = turnSection(body, { x: 0, y: 0, z: 1 });
    const centre = body.centre,
      offset = turnSection(body, centre);
    const model = new Float32Array([
      x.x,
      x.y,
      x.z,
      0,
      y.x,
      y.y,
      y.z,
      0,
      z.x,
      z.y,
      z.z,
      0,
      body.x + centre.x - offset.x,
      body.y + centre.y - offset.y,
      body.z + centre.z - offset.z,
      1,
    ]);
    gl.uniformMatrix4fv(renderer.sectionProgram.model, false, model);
    gl.drawArrays(gl.TRIANGLES, 0, gpu.count);
  }
}
