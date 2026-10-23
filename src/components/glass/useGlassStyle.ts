import { forcePlainGlass } from '@/components/glass/plainGlass';
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
    edgeSoft: glass.edgeSoft[scheme],
    sharpWidth: glass.sharpWidth,
    softWidth: glass.softWidth,
    shadowRadius: glass.shadowRadius[scheme],
    shadowOffset: glass.shadowOffset[scheme],
    shadowSpread: glass.shadowSpread[scheme],
    tint: color.chrome.tint,
    fallback: color.chrome.fallback,
    shadow: color.chrome.shadow,
    rim: color.chrome.barRim,
    rimWidth: glass.rimWidth,
    rimOutside: true,
    rimSide: glass.rimSide,
    insetShade: glass.insetShade[scheme],
    insetOffset: glass.insetOffset,
    insetBlur: glass.insetBlur,
    plain: forcePlainGlass,
  };
};
