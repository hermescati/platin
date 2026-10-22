import type { Palette } from '@/theme/tokens';

export type Tone = keyof Palette['text'] | 'accent' | 'danger';

export const toneColor = (color: Palette, tone: Tone): string => {
  if (tone === 'accent') return color.accent.default;
  if (tone === 'danger') return color.status.danger;
  return color.text[tone];
};
