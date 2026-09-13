/** Deterministic, offline material atlas. R stores albedo variation, A roughness.
 * No image decoding, fetch, random simulation state, or third-party assets. */
export const MATERIAL_LAYERS = 19;
export function createMaterialTexture(gl: WebGL2RenderingContext) {
  const size = 128,
    data = new Uint8Array(size * size * MATERIAL_LAYERS * 4);
  const rand = (x: number, y: number, m: number) => {
    let h =
      Math.imul(x + 271, 374761393) ^ Math.imul(y + 151, 668265263) ^ Math.imul(m + 7, 1274126177);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };
  for (let m = 0; m < MATERIAL_LAYERS; m++)
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const u = x / size,
          v = y / size,
          grain = rand(x, y, m),
          coarse = rand(x >> 3, y >> 3, m);
        let value = 0.59 + (grain - 0.5) * 0.055,
          rough = 0.86;
        if (m === 1 || m === 4 || m === 15) {
          // Cast concrete: fine aggregate, formwork seams and isolated pores.
          value += (coarse - 0.5) * 0.032;
          if (x < 2 || y < 2) value -= 0.055;
          if (grain < 0.018) value -= 0.13;
          if (y === 4 && x % 32 < 3) value -= 0.075;
        } else if (m === 5) {
          const row = Math.floor(v * 4),
            bx = (u * 2 + (row % 2) * 0.5) % 1,
            by = (v * 4) % 1;
          const mortar = bx < 0.038 || by < 0.055;
          value = mortar
            ? 0.39
            : 0.56 +
              (rand(Math.floor(u * 2 + (row % 2) * 0.5), row, m) - 0.5) * 0.16 +
              (grain - 0.5) * 0.055;
          if (!mortar && (bx < 0.07 || by > 0.93)) value -= 0.055;
        } else if (m === 6) {
          const plank = Math.floor(u * 4),
            seam = (u * 4) % 1;
          value =
            0.57 +
            (rand(plank, 0, m) - 0.5) * 0.1 +
            Math.sin(u * 220 + Math.sin(v * 9) * 1.2) * 0.027 +
            (grain - 0.5) * 0.03;
          if (seam < 0.028) value = 0.29;
          rough = 0.78;
        } else if (m === 8) {
          value = 0.57 + (grain - 0.5) * 0.16 + (coarse - 0.5) * 0.02;
          if (grain > 0.978) value += 0.16;
          rough = 0.96;
        } else if (m === 9) {
          const row = Math.floor(v * 3),
            xx = (u * 2 + (row % 2) * 0.5) % 1,
            yy = (v * 3) % 1;
          value =
            0.48 + 0.13 * Math.sin(xx * Math.PI) * Math.sin(yy * Math.PI) + (grain - 0.5) * 0.045;
          if (x % 3 === 0 || y % 3 === 0) value -= 0.022;
        } else if (m === 10 || m === 12 || m === 13) {
          value = 0.59 + (grain - 0.5) * 0.022;
          rough = m === 12 ? 0.36 : 0.56;
          if (x < 2 || y < 2) value -= 0.095;
          const dx = Math.min(Math.abs(x - 7), Math.abs(x - 120)),
            dy = Math.min(Math.abs(y - 7), Math.abs(y - 120));
          if (dx * dx + dy * dy < 6) value = 0.39;
          if (m === 10) value += Math.cos(u * Math.PI * 32) * 0.045;
        } else if (m === 11 || m === 16) {
          value = 0.62;
          rough = 0.14;
          if (x < 3 || y < 3) value = 0.3;
          else if (x < 5 || y < 5) value = 0.8;
          value += (1 - v) * 0.055;
        } else if (m === 2 || m === 3 || m === 7) {
          value = 0.56 + (grain - 0.5) * 0.15 + (coarse - 0.5) * 0.11;
          if (m === 3) value += Math.sin((u + v) * 160) * 0.025;
        } else if (m === 14) {
          value = 0.61 + (grain - 0.5) * 0.03;
          rough = 0.73;
        } else if (m === 17) {
          value = 0.61;
          rough = 0.2;
        }
        if (m === 18) {
          value = 0.57 + (coarse - 0.5) * 0.18 + (grain - 0.5) * 0.04;
          if ((x + y) % 4 === 0) value -= 0.06;
          rough = 0.96;
        }
        const i = ((m * size + y) * size + x) * 4,
          c = Math.max(0, Math.min(255, Math.round(value * 255)));
        data[i] = data[i + 1] = data[i + 2] = c;
        data[i + 3] = Math.round(rough * 255);
      }
  const t = gl.createTexture();
  if (!t) throw Error('Unable to allocate material textures');
  try {
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, t);
    gl.texImage3D(
      gl.TEXTURE_2D_ARRAY,
      0,
      gl.RGBA8,
      size,
      size,
      MATERIAL_LAYERS,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      data,
    );
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
    const ext = gl.getExtension('EXT_texture_filter_anisotropic');
    if (ext)
      gl.texParameterf(
        gl.TEXTURE_2D_ARRAY,
        ext.TEXTURE_MAX_ANISOTROPY_EXT,
        Math.min(4, gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)),
      );
    return t;
  } catch (error) {
    gl.deleteTexture(t);
    throw error;
  }
}
