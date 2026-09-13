/** Canvas cannot resolve CSS var() expressions. Read the same semantic tokens once per view. */
export function canvasTheme() {
  const style = typeof document === 'undefined' ? null : getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => style?.getPropertyValue(name).trim() || fallback;
  return {
    ink: read('--ink', '#eef3fa'),
    muted: read('--muted', '#9cacc2'),
    line: read('--line', '#2a384d'),
    panel: read('--panel', '#101722f2'),
    deep: read('--deep', '#090d14'),
    accent: read('--accent', '#68d5e8'),
    ally: read('--blue', '#7cbcff'),
    enemy: read('--red', '#ff9479'),
    squad: read('--squad', '#a4d484'),
    warning: read('--warning', '#edc580'),
    danger: read('--danger', '#ff7d8d'),
    career: read('--career', '#b9a2ff'),
  };
}
export function alphaColour(hex: string, alpha: number): string {
  if (/^#[0-9a-f]{6,8}$/i.test(hex)) {
    const n = Number.parseInt(hex.slice(1, 7), 16);
    return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, alpha))})`;
  }
  return hex;
}
