import { forcePlainGlass } from '@/components/glass/plainGlass';
import { glass } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export const useGlassStyle = () => {
  const { scheme, color } = useTheme();

  return {
    blurRadius: glass.blurRadius[scheme],
    blurRadiusY: glass.blurRadiusY[scheme],
    bezel: glass.bezel[scheme],
    refraction: glass.refraction[scheme],
    mirror: glass.mirror,
    foldTop: glass.foldTop,
    pullBottom: glass.pullBottom,
    pullBand: glass.pullBand,
    wideRadius: glass.wideRadius,
    wideMix: glass.wideMix,
    chroma: glass.chroma[scheme],
    lift: glass.lift[scheme],
    falloff: glass.falloff[scheme],
    dispersion: glass.dispersion,
    saturation: glass.saturation[scheme],
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
