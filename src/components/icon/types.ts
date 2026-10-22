export type GlyphShape =
  | { kind: 'path'; d: string }
  | { kind: 'circle'; cx: number; cy: number; r: number }
  | { kind: 'rect'; x: number; y: number; width: number; height: number; rx: number };

interface OutlineGlyph {
  strokes?: readonly GlyphShape[];
  dots?: readonly GlyphShape[];
}

interface FillGlyph {
  shapes: readonly GlyphShape[];
  knockouts?: readonly GlyphShape[];
  knockoutDots?: readonly GlyphShape[];
  strokes?: readonly GlyphShape[];
}

export interface Glyph {
  outline: OutlineGlyph;
  fill?: FillGlyph;
}
