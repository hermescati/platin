import { useId } from 'react';
import Svg, { Circle, Defs, G, Mask, Path, Rect } from 'react-native-svg';

import { glyphs, type IconName } from '@/components/icon/glyphs';
import type { Glyph, GlyphShape } from '@/components/icon/types';
import { icon, palette } from '@/theme/tokens';
import { toneColor, type Tone } from '@/theme/tone';
import { useTheme } from '@/theme/useTheme';

export type { IconName };

interface Props {
  name: IconName;
  size?: number;
  variant?: 'outline' | 'fill';
  weight?: 'light' | 'regular' | 'bold';
  tone?: Tone;
  color?: string;
  label?: string;
}

interface PaintProps {
  fill: string;
  stroke: string;
  strokeWidth?: number;
}

const renderShape = (shape: GlyphShape, key: number, paint: PaintProps) => {
  if (shape.kind === 'path') return <Path key={key} d={shape.d} {...paint} />;
  if (shape.kind === 'circle') return <Circle key={key} cx={shape.cx} cy={shape.cy} r={shape.r} {...paint} />;
  return <Rect key={key} x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={shape.rx} {...paint} />;
};

const renderShapes = (shapes: readonly GlyphShape[] | undefined, paint: PaintProps) =>
  shapes?.map((shape, index) => renderShape(shape, index, paint));

export const Icon = ({
  name,
  size = icon.size,
  variant = 'outline',
  weight = 'regular',
  tone = 'primary',
  color,
  label,
}: Props) => {
  const theme = useTheme();
  const maskId = `icon-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const ink = color ?? toneColor(theme.color, tone);
  const strokeWidth = icon.stroke[weight] * (size <= icon.smallSize ? icon.smallStrokeScale : 1);
  const glyph: Glyph = glyphs[name];
  const fill = variant === 'fill' ? glyph.fill : undefined;
  const stroke: PaintProps = { fill: 'none', stroke: ink, strokeWidth };
  const dot: PaintProps = { fill: ink, stroke: 'none' };

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${icon.grid} ${icon.grid}`}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={label !== undefined}
      accessibilityRole={label ? 'image' : undefined}
      accessibilityLabel={label}>
      {fill ? (
        <>
          <Defs>
            <Mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={icon.grid} height={icon.grid}>
              <Rect width={icon.grid} height={icon.grid} fill={palette.neutral[0]} />
              {renderShapes(fill.knockouts, { fill: 'none', stroke: palette.neutral[1000], strokeWidth: strokeWidth * icon.knockoutScale })}
              {renderShapes(fill.knockoutDots, { fill: palette.neutral[1000], stroke: 'none' })}
            </Mask>
          </Defs>
          <G mask={`url(#${maskId})`}>{renderShapes(fill.shapes, dot)}</G>
          {renderShapes(fill.strokes, stroke)}
        </>
      ) : (
        <>
          {renderShapes(glyph.outline.strokes, stroke)}
          {renderShapes(glyph.outline.dots, dot)}
        </>
      )}
    </Svg>
  );
};
