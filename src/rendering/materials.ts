import type { Colour } from '../core/types';
/** Cut interiors are deliberately matte and lighter than weathered exterior surfaces. */
export const materialResponse: Readonly<Record<number, { fracture: Colour; shadow: number }>> = {
  4: { fracture: [0.64, 0.62, 0.57], shadow: 0.68 },
  5: { fracture: [0.64, 0.46, 0.38], shadow: 0.67 },
  6: { fracture: [0.65, 0.49, 0.31], shadow: 0.72 },
  8: { fracture: [0.35, 0.36, 0.37], shadow: 0.74 },
  11: { fracture: [0.54, 0.7, 0.75], shadow: 0.82 },
  12: { fracture: [0.48, 0.51, 0.52], shadow: 0.74 },
};
export function fracturePalette(colours: Colour[]): Colour[] {
  const palette = [...colours];
  for (let m = 1; m < colours.length; m++)
    palette[m + 32] = materialResponse[m]?.fracture ?? [
      Math.min(1, colours[m][0] * 1.1),
      Math.min(1, colours[m][1] * 1.1),
      Math.min(1, colours[m][2] * 1.1),
    ];
  return palette;
}
