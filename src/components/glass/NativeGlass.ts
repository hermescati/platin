import { requireNativeView } from 'expo';
import type { ColorValue, ViewProps } from 'react-native';
import Animated from 'react-native-reanimated';

export interface NativeGlassViewProps extends ViewProps {
  group?: string;
  underlay?: string;
  overlay?: string;
  shapes?: number[];
  inset?: number;
  cornerRadius?: number;
  blend?: number;
  blurRadius: number;
  bezel: number;
  refraction: number;
  refractOutward?: boolean;
  refractOutwardY?: boolean;
  refractionYScale?: number;
  falloff?: number;
  dispersion?: number;
  magnify?: number;
  saturation?: number;
  adaptive?: number;
  dim?: number;
  lightAngle?: number;
  specular?: number;
  highlightWidth?: number;
  edgeSharp?: number;
  edgeSoft?: number;
  sharpWidth?: number;
  softWidth?: number;
  glowX?: number;
  glowY?: number;
  glowSpread?: number;
  glowStrength?: number;
  shadowRadius?: number;
  shadowOffset?: number;
  shadowSpread?: number;
  pinch?: number;
  pinchWidth?: number;
  pinchSpread?: number;
  rimPrism?: number;
  rimWidth?: number;
  rimOutside?: boolean;
  rimSide?: number;
  insetShade?: number;
  insetOffset?: number;
  insetBlur?: number;
  pinchLeft?: number;
  pinchRight?: number;
  sampleMaxX?: number;
  ellipse?: number;
  clipLeft?: number;
  clipTop?: number;
  clipRight?: number;
  clipBottom?: number;
  clipScaleX?: number;
  clipScaleY?: number;
  clipSoft?: number;
  clipOn?: number;
  tint?: ColorValue;
  rim?: ColorValue;
  fallback?: ColorValue;
  shadow?: ColorValue;
  plain?: boolean;
}

interface NativeGlassBlurProps extends ViewProps {
  radius?: number;
}

interface NativeGlassBackdropProps extends ViewProps {
  group?: string;
  offscreen?: boolean;
}

export const NativeGlassView = requireNativeView<NativeGlassViewProps>('PlatinGlass', 'PlatinGlassView');

export const AnimatedNativeGlassView = Animated.createAnimatedComponent(NativeGlassView);

export const NativeGlassBackdrop = requireNativeView<NativeGlassBackdropProps>('PlatinGlass', 'PlatinGlassBackdropView');

export const NativeGlassBlur = requireNativeView<NativeGlassBlurProps>('PlatinGlass', 'PlatinGlassBlurView');

export const AnimatedNativeGlassBlur = Animated.createAnimatedComponent(NativeGlassBlur);
