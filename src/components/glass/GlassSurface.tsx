import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import type { GlassTransform } from '@/components/glass/types';
import { glass } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  radius?: number;
  transform?: GlassTransform;
  interactive?: boolean;
}

const hasLiquidGlass = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

export const GlassSurface = ({ children, style, radius = 0, transform, interactive = false }: Props) => {
  const { scheme } = useTheme();
  const transformStyle = useAnimatedStyle(() =>
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

  if (hasLiquidGlass) {
    return (
      <Animated.View style={[style, transformStyle]}>
        <GlassView glassEffectStyle="regular" isInteractive={interactive} style={[styles.fill, { borderRadius: radius }]}>
          {children}
        </GlassView>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[style, transformStyle]}>
      <BlurView
        intensity={glass.blurIntensity}
        tint={scheme === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
        style={[styles.fill, styles.clip, { borderRadius: radius }]}>
        {children}
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  clip: {
    overflow: 'hidden',
  },
});
