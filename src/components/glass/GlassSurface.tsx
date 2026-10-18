import { BlurView } from 'expo-blur';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { glass } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  interactive?: boolean;
}

const hasLiquidGlass = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

export const GlassSurface = ({ children, style, interactive = false }: Props) => {
  const { scheme } = useTheme();

  if (hasLiquidGlass) {
    return (
      <GlassView glassEffectStyle="regular" isInteractive={interactive} style={style}>
        {children}
      </GlassView>
    );
  }

  return (
    <BlurView
      intensity={glass.blurIntensity}
      tint={scheme === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
      style={[styles.clip, style]}>
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
  },
});
