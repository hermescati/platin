import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { NativeGlassView } from '@/components/glass/NativeGlass';
import type { GlassTransform } from '@/components/glass/types';
import { useGlassStyle } from '@/components/glass/useGlassStyle';
import { glass } from '@/theme/tokens';

interface Props {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  transform?: GlassTransform;
  interactive?: boolean;
}

export const GlassSurface = ({ children, style, radius = 0, transform }: Props) => {
  const glassStyle = useGlassStyle();

  const shellStyle = useAnimatedStyle(() =>
    transform
      ? {
          transform: [
            { translateX: transform.translateX.get() },
            { translateY: transform.translateY.get() },
            { scaleX: transform.scaleX.get() },
            { scaleY: transform.scaleY.get() },
          ],
        }
      : {},
  );

  return (
    <Animated.View style={[style, shellStyle]}>
      <NativeGlassView
        style={styles.glass}
        pointerEvents="none"
        inset={glass.pad}
        cornerRadius={radius}
        {...glassStyle}
      />
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  glass: {
    position: 'absolute',
    top: -glass.pad,
    left: -glass.pad,
    right: -glass.pad,
    bottom: -glass.pad,
  },
});
