import { glass } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export const useGlassStyle = () => {
  const { scheme, color } = useTheme();

  return {
    blurRadius: glass.blurRadius,
    bezel: glass.bezel,
    refraction: glass.refraction,
    falloff: glass.falloff,
    dispersion: glass.dispersion,
    saturation: glass.saturation,
    adaptive: glass.adaptive[scheme],
    lightAngle: glass.lightAngle,
    specular: glass.specular,
    highlightWidth: glass.highlightWidth,
    edgeSharp: glass.edgeSharp,
    edgeSoft: glass.edgeSoft,
    sharpWidth: glass.sharpWidth,
    softWidth: glass.softWidth,
    shadowRadius: glass.shadowRadius,
    shadowOffset: glass.shadowOffset,
    tint: color.chrome.tint,
    fallback: color.chrome.fallback,
    shadow: color.chrome.shadow,
    rim: color.chrome.barRim,
  };
};
