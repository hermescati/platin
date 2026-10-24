import { forcePlainGlass } from '@/components/glass/plainGlass';
import { glass } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export const useGlassStyle = () => {
  const { scheme, color } = useTheme();

  return {
    blurRadius: glass.blurRadius[scheme],
    bezel: glass.bezel[scheme],
    refraction: glass.refraction[scheme],
    pullBottom: glass.pullBottom[scheme],
    pullBand: glass.pullBand[scheme],
    pullTop: glass.pullTop[scheme],
    pullTopBand: glass.pullTopBand[scheme],
    refractionYScale: glass.refractionYScale[scheme],
    wideRadius: glass.wideRadius[scheme],
    wideMix: glass.wideMix[scheme],
    chroma: glass.chroma[scheme],
    toneOn: glass.tone[scheme].on,
    toneBase: glass.tone[scheme].base,
    toneGain: glass.tone[scheme].gain,
    toneGamma: glass.tone[scheme].gamma,
    frostBase: glass.tone[scheme].frostBase,
    frostGain: glass.tone[scheme].frostGain,
    frostGamma: glass.tone[scheme].frostGamma,
    frostChroma: glass.tone[scheme].frostChroma,
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
