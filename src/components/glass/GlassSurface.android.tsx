import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useGlassTarget } from '@/components/glass/GlassProvider';
import { glass, layout } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

interface Props {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  interactive?: boolean;
}

export const GlassSurface = ({ children, style }: Props) => {
  const { color } = useTheme();
  const target = useGlassTarget();

  return (
    <View style={[styles.clip, { borderColor: color.glassBorder }, style]}>
      <BlurView
        blurTarget={target ?? undefined}
        blurMethod={target ? 'dimezisBlurViewSdk31Plus' : 'none'}
        intensity={glass.blurIntensity}
        style={StyleSheet.absoluteFill}
      />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: color.glassTint }]} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  clip: {
    overflow: 'hidden',
    borderWidth: layout.hairline,
  },
});
