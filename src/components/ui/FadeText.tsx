import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Text, type TextVariant } from '@/components/ui/Text';
import type { Tone } from '@/theme/tone';
import { layout } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  children: string;
  variant?: TextVariant;
  tone?: Tone;
  background?: string;
}

export const FadeText = ({ children, variant, tone, background }: Props) => {
  const { color } = useTheme();
  const gradientId = `fade-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const edge = background ?? color.bg.screen;

  return (
    <View>
      <Text variant={variant} tone={tone} numberOfLines={1} ellipsizeMode="clip">
        {children}
      </Text>
      <Svg style={styles.fade} pointerEvents="none">
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={edge} stopOpacity={0} />
            <Stop offset="1" stopColor={edge} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  fade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: layout.fadeEdge,
  },
});
