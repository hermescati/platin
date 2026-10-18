import { glass } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export const useGlassStyle = () => {
  const { color } = useTheme();

  return {
    blurRadius: glass.blurRadius,
    bezel: glass.bezel,
    refraction: glass.refraction,
    glowRadius: glass.glowRadius,
    rimWidth: glass.rimWidth,
    shadowRadius: glass.shadowRadius,
    shadowOffset: glass.shadowOffset,
    tint: color.glassTint,
    sheen: color.glassSheen,
    rimTop: color.glassRimTop,
    rimBottom: color.glassRimBottom,
    glow: color.glassGlow,
    shadow: color.glassShadow,
  };
};
