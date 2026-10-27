import { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { layout } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  side?: 'right' | 'top';
  size?: number;
}

export const EdgeFade = ({ side = 'right', size = layout.rowFade }: Props) => {
  const { color } = useTheme();
  const gradientId = `edge-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const top = side === 'top';

  return (
    <Svg style={top ? [styles.top, { height: size }] : [styles.right, { width: size }]} pointerEvents="none">
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1={top ? '1' : '0'} x2={top ? '0' : '1'} y2="0">
          <Stop offset="0" stopColor={color.bg.screen} stopOpacity={0} />
          <Stop offset="0.85" stopColor={color.bg.screen} stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${gradientId})`} />
    </Svg>
  );
};

const styles = StyleSheet.create({
  right: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
  },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
