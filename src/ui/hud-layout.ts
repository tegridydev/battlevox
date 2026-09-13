export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface HudLayout {
  vitals: Rect;
  weapon: Rect;
  squad: Rect;
  map: Rect;
  objective: Rect;
  top: Rect;
  compassY: number;
  showMap: boolean;
  showSquad: boolean;
  showObjective: boolean;
  compact: boolean;
  scale: number;
}
/** One CSS-pixel coordinate system for the DOM and canvas. Compact panels remain accessible. */
export function hudLayout(
  width: number,
  height: number,
  touch = false,
  inset = 16,
  scale = 1,
  expanded = '',
): HudLayout {
  scale = Math.max(1, Math.min(1.3, scale));
  const compact = width < 1000 * scale || height < 620 * scale;
  const gap = 12,
    side = Math.min(244 * scale, (width - inset * 2 - gap) / 2);
  const bottom = height - inset - (touch ? (height < 620 ? 128 : 184) : 20);
  const vitalsHeight = (compact ? 72 : 84) * scale;
  const vitals = {
    x: inset,
    y: Math.max(inset + 90, bottom - vitalsHeight),
    width: side,
    height: vitalsHeight,
  };
  const topWidth = Math.max(140, Math.min(560, width - inset * 2 - (compact ? 0 : 320)));
  const top = { x: (width - topWidth) / 2, y: compact ? 58 : inset, width: topWidth, height: 66 };
  const mapSize = Math.min(144 * scale, side);
  const map = { x: inset, y: vitals.y - gap - mapSize, width: mapSize, height: mapSize };
  const objective = {
    x: inset,
    y: compact ? top.y + top.height + gap : 112,
    width: side,
    height: 70 * scale,
  };
  const squadTop = objective.y + objective.height + gap;
  const squad = {
    x: inset,
    y: squadTop,
    width: side,
    height: Math.max(80, map.y - gap - squadTop),
  };
  let showMap = !compact,
    showSquad = !compact;
  const showObjective = !compact || objective.y + objective.height + gap <= vitals.y;
  if (compact && expanded) {
    const y = top.y + top.height + gap,
      available = Math.max(0, vitals.y - gap - y);
    if (expanded === 'map') {
      showMap = true;
      Object.assign(map, {
        y,
        width: Math.min(side, available),
        height: Math.min(side, available),
      });
    } else if (expanded === 'squad') {
      showSquad = true;
      Object.assign(squad, { y, width: side, height: available });
    }
  }
  const weaponHeight = Math.min(
    (compact ? 206 : 260) * scale,
    Math.max(104, bottom - (top.y + top.height + gap)),
  );
  const weaponWidth = Math.min(292 * scale, (width - inset * 2 - gap) / 2);
  return {
    vitals,
    weapon: {
      x: width - inset - weaponWidth,
      y: bottom - weaponHeight,
      width: weaponWidth,
      height: weaponHeight,
    },
    squad,
    map,
    objective,
    top,
    compassY: compact ? top.y + top.height + 9 : 101,
    showMap,
    showSquad,
    showObjective: showObjective && !(compact && expanded),
    compact,
    scale,
  };
}
export function applyHudLayout(layout: HudLayout) {
  const root = document.getElementById('gameHUD');
  root?.classList.toggle('compactHUD', layout.compact);
  root?.style.setProperty('--hud-scale', String(layout.scale));
  for (const [id, rect] of [
    ['vitals', layout.vitals],
    ['weapon', layout.weapon],
    ['squadHUD', layout.squad],
    ['objectivePanel', layout.objective],
    ['top', layout.top],
  ] as const) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (id === 'squadHUD') el.hidden = !layout.showSquad;
    if (id === 'objectivePanel') el.hidden = !layout.showObjective;
    Object.assign(el.style, {
      position: 'fixed',
      left: `${rect.x}px`,
      top: `${rect.y}px`,
      right: 'auto',
      bottom: 'auto',
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      minWidth: '0',
      transform: 'none',
    });
  }
}
