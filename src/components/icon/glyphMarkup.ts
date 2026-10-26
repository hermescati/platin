import { glyphs, type IconName } from '@/components/icon/glyphs';
import type { Glyph, GlyphShape } from '@/components/icon/types';
import { icon } from '@/theme/tokens';

type Weight = keyof typeof icon.stroke;

const ink = '#000000';

const shapeMarkup = (shape: GlyphShape, paint: string) => {
  if (shape.kind === 'path') return `<path d="${shape.d}" ${paint}/>`;
  if (shape.kind === 'circle') return `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" ${paint}/>`;
  return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" rx="${shape.rx}" ${paint}/>`;
};

const shapesMarkup = (shapes: readonly GlyphShape[] | undefined, paint: string) =>
  (shapes ?? []).map((shape) => shapeMarkup(shape, paint)).join('');

export const glyphMarkup = (name: IconName, variant: 'outline' | 'fill' = 'outline', weight: Weight = 'regular') => {
  const glyph: Glyph = glyphs[name];
  const stroke = `fill="none" stroke="${ink}" stroke-width="${icon.stroke[weight]}"`;
  const solid = `fill="${ink}" stroke="none"`;
  const fill = variant === 'fill' ? glyph.fill : undefined;
  const body = fill
    ? shapesMarkup(fill.shapes, solid) + shapesMarkup(fill.strokes, stroke)
    : shapesMarkup(glyph.outline.strokes, stroke) + shapesMarkup(glyph.outline.dots, solid);
  return `<svg viewBox="0 0 ${icon.grid} ${icon.grid}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
};
