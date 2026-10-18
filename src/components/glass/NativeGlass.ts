import { requireNativeView } from 'expo';
import type { ColorValue, ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';

export interface NativeGlassViewProps extends ViewProps {
  group?: string;
  shapes?: number[];
  inset?: number;
  cornerRadius?: number;
  blend?: number;
  blurRadius: number;
  bezel: number;
  refraction: number;
  magnify?: number;
  glowRadius?: number;
  rimWidth?: number;
  shadowRadius?: number;
  shadowOffset?: number;
  tint?: ColorValue;
  sheen?: ColorValue;
  rimTop?: ColorValue;
  rimBottom?: ColorValue;
  glow?: ColorValue;
  shadow?: ColorValue;
}

interface NativeGlassBackdropProps extends ViewProps {
  group?: string;
}

export const NativeGlassView = requireNativeView<NativeGlassViewProps>('QuestlogGlass', 'QuestlogGlassView');

export const AnimatedNativeGlassView = Animated.createAnimatedComponent(NativeGlassView);

export const NativeGlassBackdrop = requireNativeView<NativeGlassBackdropProps>('QuestlogGlass', 'QuestlogGlassBackdropView');
