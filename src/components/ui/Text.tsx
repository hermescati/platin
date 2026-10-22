import { Text as NativeText, type TextProps } from 'react-native';

import { typography } from '@/theme/tokens';
import { toneColor, type Tone } from '@/theme/tone';
import { useTheme } from '@/theme/useTheme';

export type TextVariant = keyof typeof typography;

interface Props extends TextProps {
  variant?: TextVariant;
  tone?: Tone;
}

export const Text = ({ variant = 'body', tone = 'primary', style, ...rest }: Props) => {
  const { color } = useTheme();
  return <NativeText style={[typography[variant], { color: toneColor(color, tone) }, style]} {...rest} />;
};
