import type { TextStyle } from 'react-native';

import { fonts } from '@/theme/fonts';

export type ColorSchemeName = 'light' | 'dark';

const withAlpha = (hex: string, alpha: number): string => {
  const value = parseInt(hex.slice(1), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
};

export const palette = {
  neutral: {
    0: '#FFFFFF',
    50: '#F4F5F9',
    100: '#E7E7EC',
    200: '#D4D4D8',
    300: '#BABABE',
    400: '#9B9B9F',
    500: '#7B7B7F',
    600: '#5E5F62',
    700: '#444548',
    800: '#2F2F32',
    900: '#1E1E21',
    950: '#111114',
    1000: '#000000',
  },
  accent: {
    50: '#FFF4EF',
    100: '#FEEADF',
    200: '#FED6C1',
    300: '#FFBF9C',
    400: '#FEA572',
    500: '#FF8433',
    600: '#DC6A16',
    700: '#B65402',
    800: '#8E4000',
    900: '#692E01',
    950: '#461C00',
  },
  green: {
    50: '#ECFCED',
    100: '#D1F7D3',
    200: '#A2EEAA',
    300: '#6CE27E',
    400: '#30D158',
    500: '#04BA44',
    600: '#019D38',
    700: '#02822D',
    800: '#006621',
    900: '#014C17',
    950: '#01340E',
  },
  blue: {
    50: '#F2F7FE',
    100: '#D8E9FF',
    200: '#B3D3FE',
    300: '#8ABCFE',
    400: '#5AA2FE',
    500: '#0A84FF',
    600: '#0371DC',
    700: '#035EBA',
    800: '#004A96',
    900: '#003976',
    950: '#002957',
  },
  yellow: {
    50: '#FCF7E3',
    100: '#FFF2C2',
    200: '#FFE689',
    300: '#FFD60A',
    400: '#E4BF01',
    500: '#C7A605',
    600: '#A78B09',
    700: '#887101',
    800: '#695701',
    900: '#4D4002',
    950: '#332900',
  },
  red: {
    50: '#FEF4F4',
    100: '#FEE1E1',
    200: '#FFC4C5',
    300: '#FEA3A6',
    400: '#FE7A84',
    500: '#FF3B5C',
    600: '#DF234A',
    700: '#BC163B',
    800: '#960F2D',
    900: '#740821',
    950: '#540315',
  },
  ice: {
    50: '#F0F8FE',
    100: '#DEF0FF',
    200: '#BFE3FF',
    300: '#A3D0F2',
    400: '#8EBADC',
    500: '#78A4C5',
    600: '#608BAB',
    700: '#487291',
    800: '#305977',
    900: '#20425B',
    950: '#122D3F',
  },
  gold: {
    50: '#FDF6EA',
    100: '#FDEBD0',
    200: '#FBD9A3',
    300: '#F6C472',
    400: '#EAB046',
    500: '#D89B1E',
    600: '#B88100',
    700: '#966901',
    800: '#745104',
    900: '#563B01',
    950: '#3A2600',
  },
  bronze: {
    50: '#FEF5F0',
    100: '#F9DFD2',
    200: '#F2C2A8',
    300: '#E6A37E',
    400: '#D38559',
    500: '#B8693A',
    600: '#A1582C',
    700: '#894922',
    800: '#6E3B1B',
    900: '#572D14',
    950: '#40210E',
  },
} as const;

const { neutral: n, accent: a, green: g, blue: b, yellow: y, red: r, ice } = palette;
const white = n[0];
const black = n[1000];

export interface Palette {
  bg: {
    screen: string;
    surface: string;
    raised: string;
    raisedPressed: string;
    sheet: string;
    sheetGroup: string;
    toast: string;
  };
  text: { primary: string; secondary: string; tertiary: string; placeholder: string; onAccent: string };
  line: { hairline: string; track: string; strong: string };
  overlay: { scrim: string };
  accent: { default: string; fill: string; pressed: string; tint: string };
  status: {
    success: string;
    successTint: string;
    info: string;
    infoTint: string;
    warning: string;
    warningTint: string;
    danger: string;
    dangerTint: string;
  };
  tier: { story: string; complete: string; platinum: string; platinumTint: string };
  glass: {
    fill: string;
    fillPressed: string;
    rim: string;
    highlight: string;
    tintFill: string;
    tintFillPressed: string;
    tintRim: string;
  };
  menu: { fill: string };
  cover: { badge: string; edge: string };
  shadow: { lifted: string; glass: string; floating: string; floatingNear: string; floatingHighlight: string };
  heat: { low: string; mid: string; high: string };
  chrome: {
    tint: string;
    fallback: string;
    shadow: string;
    lens: string;
    lensActive: string;
    lensInnerShadow: string;
    lensGlow: string;
    lensRim: string;
    barRim: string;
    pressFill: string;
    pressLift: string;
    lensTint: string;
    lensGlideTint: string;
    lensGlideRim: string;
    tabAccent: string;
    tabActive: string;
    tabActiveOver: string;
    lensRimEarly: string;
    lensTintEarly: string;
    lensShadow: string;
    legibilityShadow: string;
  };
}

export const palettes: Record<ColorSchemeName, Palette> = {
  dark: {
    bg: {
      screen: n[1000],
      surface: n[900],
      raised: n[800],
      raisedPressed: n[700],
      sheet: n[900],
      sheetGroup: n[800],
      toast: n[950],
    },
    text: { primary: n[0], secondary: n[400], tertiary: n[500], placeholder: 'rgba(235, 235, 245, 0.3)', onAccent: n[950] },
    line: { hairline: withAlpha(white, 0.1), track: withAlpha(white, 0.08), strong: withAlpha(white, 0.22) },
    overlay: { scrim: withAlpha(black, 0.55) },
    accent: { default: a[500], fill: a[500], pressed: a[600], tint: withAlpha(a[500], 0.14) },
    status: {
      success: g[400],
      successTint: withAlpha(g[400], 0.14),
      info: b[400],
      infoTint: withAlpha(b[400], 0.14),
      warning: y[300],
      warningTint: withAlpha(y[300], 0.14),
      danger: r[500],
      dangerTint: withAlpha(r[500], 0.16),
    },
    tier: { story: g[400], complete: a[500], platinum: ice[200], platinumTint: withAlpha(ice[200], 0.16) },
    glass: {
      fill: withAlpha('#2C2C30', 0.2),
      fillPressed: withAlpha('#0E0E10', 0.75),
      rim: withAlpha(white, 0.14),
      highlight: withAlpha(white, 0.18),
      tintFill: withAlpha(a[500], 0.22),
      tintFillPressed: withAlpha(a[500], 0.14),
      tintRim: withAlpha('#FF9650', 0.55),
    },
    menu: { fill: withAlpha('#242428', 0.4) },
    cover: { badge: withAlpha(black, 0.55), edge: withAlpha(black, 0) },
    shadow: {
      lifted: withAlpha(black, 0.6),
      glass: withAlpha(black, 0.35),
      floating: withAlpha(black, 0.6),
      floatingNear: withAlpha(black, 0),
      floatingHighlight: withAlpha(white, 0.08),
    },
    heat: { low: withAlpha(a[500], 0.28), mid: withAlpha(a[500], 0.55), high: a[500] },
    chrome: {
      tint: 'rgba(90, 90, 90, 0)',
      fallback: n[800],
      shadow: 'rgba(0, 0, 0, 0.12)',
      lens: 'rgba(0, 0, 0, 0)',
      lensActive: 'rgba(0, 0, 0, 0)',
      lensInnerShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.06)',
      lensRim: 'rgba(255, 255, 255, 0.16)',
      barRim: 'rgba(255, 255, 255, 0)',
      pressFill: 'rgba(255, 255, 255, 0.38)',
      pressLift: 'rgba(255, 255, 255, 0.038)',
      lensTint: 'rgba(0, 0, 0, 0.2)',
      lensGlideTint: 'rgba(0, 0, 0, 0.04)',
      lensGlideRim: 'rgba(0, 0, 0, 0.55)',
      tabAccent: '#F8A154',
      tabActive: '#FFDC8C',
      tabActiveOver: '#FE8939',
      lensRimEarly: 'rgba(255, 255, 255, 0.16)',
      lensTintEarly: 'rgba(255, 255, 255, 0)',
      lensShadow: 'rgba(0, 0, 0, 0)',
      lensGlow:
        'inset 1.5px 1.5px 0 rgba(255, 255, 255, 0.6), inset -1.5px -1.5px 0 rgba(255, 255, 255, 0.22), inset 0 0 12px rgba(255, 255, 255, 0.08)',
      legibilityShadow: 'rgba(0, 0, 0, 0.55)',
    },
  },
  light: {
    bg: {
      screen: n[0],
      surface: n[50],
      raised: n[100],
      raisedPressed: n[200],
      sheet: n[0],
      sheetGroup: n[50],
      toast: n[0],
    },
    text: { primary: n[1000], secondary: n[600], tertiary: n[500], placeholder: 'rgba(60, 60, 67, 0.3)', onAccent: n[950] },
    line: { hairline: withAlpha(black, 0.1), track: withAlpha(black, 0.06), strong: withAlpha(black, 0.16) },
    overlay: { scrim: withAlpha(black, 0.2) },
    accent: { default: a[700], fill: a[500], pressed: a[600], tint: withAlpha(a[500], 0.16) },
    status: {
      success: g[700],
      successTint: withAlpha(g[500], 0.14),
      info: b[700],
      infoTint: withAlpha(b[500], 0.12),
      warning: y[800],
      warningTint: withAlpha(y[400], 0.2),
      danger: r[700],
      dangerTint: withAlpha(r[500], 0.12),
    },
    tier: { story: g[700], complete: a[700], platinum: ice[700], platinumTint: withAlpha(ice[500], 0.16) },
    glass: {
      fill: withAlpha('#F6F6F8', 0.3),
      fillPressed: withAlpha('#DEDEE4', 0.85),
      rim: withAlpha(black, 0.06),
      highlight: withAlpha(white, 1),
      tintFill: withAlpha(a[500], 0.16),
      tintFillPressed: withAlpha(a[500], 0.26),
      tintRim: withAlpha('#D66818', 0.45),
    },
    menu: { fill: withAlpha('#FAFAFC', 0.5) },
    cover: { badge: withAlpha(black, 0.55), edge: withAlpha(black, 0.12) },
    shadow: {
      lifted: withAlpha(black, 0.22),
      glass: withAlpha(black, 0.06),
      floating: withAlpha(black, 0.16),
      floatingNear: withAlpha(black, 0.08),
      floatingHighlight: withAlpha(white, 0),
    },
    heat: { low: withAlpha(a[500], 0.22), mid: withAlpha(a[500], 0.5), high: a[500] },
    chrome: {
      tint: 'rgba(245, 245, 245, 0.61)',
      fallback: n[50],
      shadow: 'rgba(0, 0, 0, 0.012)',
      lens: 'rgba(0, 0, 0, 0.07)',
      lensActive: 'rgba(255, 255, 255, 0.28)',
      lensInnerShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.7)',
      lensRim: 'rgba(0, 0, 0, 0.16)',
      barRim: 'rgba(0, 0, 0, 0.12)',
      pressFill: 'rgba(255, 255, 255, 1)',
      pressLift: 'rgba(255, 255, 255, 0.25)',
      lensTint: 'rgba(0, 0, 0, 0.025)',
      lensGlideTint: 'rgba(0, 0, 0, 0.025)',
      lensGlideRim: 'rgba(0, 0, 0, 0.16)',
      tabAccent: a[700],
      tabActive: '#AF4F00',
      tabActiveOver: '#9E4302',
      lensRimEarly: 'rgba(0, 0, 0, 0.06)',
      lensTintEarly: 'rgba(255, 255, 255, 0)',
      lensShadow: 'rgba(0, 0, 0, 0.05)',
      lensGlow:
        'inset 1.5px 1.5px 0 rgba(255, 255, 255, 0.95), inset -1.5px -1.5px 0 rgba(255, 255, 255, 0.5), inset 0 0 12px rgba(255, 255, 255, 0.35)',
      legibilityShadow: 'rgba(255, 255, 255, 0)',
    },
  },
};

export const searchFieldText = {
  dark: { fontWeight: '400' },
  light: { fontWeight: '500' },
} as const;

export const typography = {
  display: { fontSize: 40, lineHeight: 44, fontFamily: fonts.brand },
  largeTitle: { fontSize: 34, lineHeight: 40, fontFamily: fonts.brand },
  gameTitle: { fontSize: 30, lineHeight: 36, fontFamily: fonts.brand },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  title3: { fontSize: 20, lineHeight: 24, fontWeight: '600' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400' },
  subhead: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  subheadEmphasized: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  footnoteEmphasized: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  captionEmphasized: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  eyebrow: { fontSize: 13, lineHeight: 18, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  statHero: { fontSize: 34, lineHeight: 40, fontWeight: '700', fontFamily: fonts.numbers, fontVariant: ['tabular-nums'] },
  stat: { fontSize: 22, lineHeight: 28, fontWeight: '700', fontFamily: fonts.numbers, fontVariant: ['tabular-nums'] },
  statSmall: { fontSize: 15, lineHeight: 20, fontWeight: '600', fontFamily: fonts.numbers, fontVariant: ['tabular-nums'] },
} as const satisfies Record<string, TextStyle>;

export const space = {
  2: 2,
  4: 4,
  6: 6,
  8: 8,
  16: 16,
  24: 24,
  32: 32,
  40: 40,
  48: 48,
  64: 64,
  gutter: 16,
  section: 32,
  headerToContent: 24,
  titleToContent: 16,
  stack: 8,
  inset: 16,
  sheetInset: 8,
  popover: 6,
  aboveDock: 12,
} as const;

export const radius = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, sheet: 40, full: 999 } as const;

export const icon = {
  grid: 24,
  size: 24,
  stroke: { light: 1.45, regular: 1.75, bold: 2.3 },
  smallSize: 16,
  smallStrokeScale: 1.15,
  knockoutScale: 1.1,
} as const;

export const opacity = { pressed: 0.7, disabled: 0.5 } as const;

export const layout = {
  tabBarHeight: 62,
  tabBarCompactHeight: 48,
  tabLabelHeight: 14,
  tabLabelSize: 10,
  tabBarSideInset: 21,
  tabBarBottomOffsetAndroid: 32,
  tabBarMaxWidth: 360,
  tabBarInlinePadding: 7,
  bubbleRestWidth: 76,
  bubbleRestHeight: 54,
  tabBarGap: 8,
  searchModeHeight: 48,
  searchModeGap: 12,
  gestureNavInsetMax: 32,
  legibilityShadowRadius: 4,
  tabIconSize: 28,
  searchIconSize: 28,
  closeIconSize: 44,
  searchFieldIconSize: 24,
  searchFieldInset: 10,
  hairline: 1,
  glassRim: 1,
  coverAspectRatio: 3 / 4,
  libraryColumns: 3,
  coverIconSize: 32,
  searchCoverWidth: 48,
  sheetCoverWidth: 72,
  detailCoverWidth: 160,
} as const;

export const glass = {
  blurIntensity: 30,
  pad: 28,
  blend: 8,
  shadowRadius: { dark: 12, light: 8 },
  shadowOffset: { dark: 6, light: 11 },
  shadowSpread: { dark: 0, light: -6 },
  blurRadius: { dark: 1, light: 2 },
  bezel: { dark: 34, light: 34 },
  refraction: { dark: 22, light: 22 },
  falloff: { dark: 1, light: 1 },
  pullBottom: { dark: 4, light: 8 },
  pullBand: { dark: 8, light: 17 },
  pullTop: { dark: 10, light: 0 },
  pullTopBand: { dark: 20, light: 1 },
  refractionYScale: { dark: 0.3, light: 0.5 },
  wideRadius: { dark: 16, light: 32 },
  wideMix: { dark: 0.35, light: 0.6 },
  chroma: { dark: 1.8, light: 2.2 },
  tone: {
    dark: { on: 1, base: 0.125, gain: 0.593, gamma: 0.705, frostBase: 0.035, frostGain: 0.518, frostGamma: 1, frostChroma: 2.6 },
    light: { on: 0, base: 0, gain: 1, gamma: 1, frostBase: 0, frostGain: 1, frostGamma: 1, frostChroma: 1 },
  },
  dispersion: 0,
  saturation: { dark: 1, light: 1 },
  adaptive: { dark: 0, light: 0 },
  lightAngle: 30,
  specular: 0,
  highlightWidth: 2,
  edgeSharp: 0.18,
  edgeSoft: { dark: 0.08, light: 0.02 },
  sharpWidth: 1.17,
  softWidth: 2.2,
  rimWidth: 1.6,
  rimSide: 3,
  insetShade: { dark: 0, light: 0 },
  insetOffset: 10,
  insetBlur: 10,
  lensBlurRadius: 0,
  popBlend: 22,
  lensBezel: 10,
  lensRefraction: 7,
  lensIconBend: 0.8,
  lensIconPrism: 1.2,
  lensRefractionYScale: 1,
  lensPinch: 18,
  lensPinchWidth: 11,
  lensPinchSpread: 0.26,
  lensRimPrism: { dark: 0.5, light: 0.2 },
  lensShadowRadius: 8,
  lensShadowOffset: 4,
  lensPinchSideReach: 0.25,
  lensPad: 12,
  lensFrost: 1,
  inkLuma: { dark: { from: 0.04, to: 0.55, step: 0.1 }, light: { from: 0.72, to: 0.9, step: 0.1 } },
  lensFrostClear: { dark: 0.55, light: 0.08 },
  lensFrostRadius: { dark: 16, light: 4 },
  lensFalloff: 0,
  lensDispersion: 0.95,
  lensMagnify: 0.2,
  lensSpecular: 0.22,
  lensEdgeShade: { dark: -0.45, light: -0.04 },
  lensGlideEdge: { dark: 0.12, light: -0.04 },
  lensGlideColour: { dark: 0.35, light: 1 },
  lensGlidePinch: { dark: 0.3, light: 1 },
  lensRimSide: { dark: 1, light: 3 },
  lensRimWidth: { dark: 2, light: 1.25 },
  lensShadeWidth: 1,
  liftBlend: 0,
  meltBlend: 12,
  pressBlend: 6,
  pressGlow: 0.1,
  pressGlowSpread: 62,
} as const;

export const motion = {
  springs: {
    track: { duration: 110, dampingRatio: 1 },
    snappy: { duration: 160, dampingRatio: 1 },
    pop: { duration: 220, dampingRatio: 1 },
    settle: { duration: 320, dampingRatio: 0.8 },
    morph: { duration: 420, dampingRatio: 1 },
    present: { duration: 500, dampingRatio: 1 },
    celebrate: { duration: 600, dampingRatio: 0.6 },
    lens: { duration: 380, dampingRatio: 1 },
    lift: { duration: 220, dampingRatio: 1 },
    tapLift: { duration: 330, dampingRatio: 1 },
    tapDip: { duration: 120, dampingRatio: 0.5, overshootClamping: true },
    landIn: { duration: 160, dampingRatio: 1, energyThreshold: 2e-3 },
    landOut: { duration: 430, dampingRatio: 1 },
    dripFade: { duration: 200, dampingRatio: 1 },
    compactPopIn: { duration: 140, dampingRatio: 1 },
    compactPopOut: { duration: 300, dampingRatio: 1 },
    landFall: { duration: 190, dampingRatio: 1 },
    tapRise: { duration: 180, dampingRatio: 1, energyThreshold: 2e-3 },
    release: { duration: 360, dampingRatio: 1 },
    tapSettle: { duration: 260, dampingRatio: 1 },
    edgeLead: { duration: 200, dampingRatio: 1 },
    edgeTrail: { duration: 320, dampingRatio: 0.85 },
    edgeSettle: { duration: 320, dampingRatio: 1 },
    searchMorph: { duration: 220, dampingRatio: 1 },
    searchOpen: { duration: 380, dampingRatio: 1 },
    searchBumpIn: { duration: 110, dampingRatio: 1 },
    searchBumpOut: { duration: 300, dampingRatio: 1 },
    searchPop: { duration: 420, dampingRatio: 1 },
    searchAbsorb: { duration: 160, dampingRatio: 1 },
    press: { duration: 160, dampingRatio: 1 },
    closeFlash: { duration: 300, dampingRatio: 1 },
    stretch: { duration: 340, dampingRatio: 0.55 },
    jellyLead: { duration: 240, dampingRatio: 0.75 },
    barPressIn: { duration: 160, dampingRatio: 1 },
    barGrowIn: { duration: 130, dampingRatio: 1 },
    barPressOut: { duration: 220, dampingRatio: 1 },
    jellyTrail: { duration: 340, dampingRatio: 0.6 },
    jellySettle: { duration: 420, dampingRatio: 0.55 },
  },
  fade: 200,
  scale: { press: 0.97, liftCover: 1.06, liftCard: 1.03, enter: 0.95 },
  stagger: 40,
  lensLift: { x: 1.36, y: 1.38 },
  deflateTravel: 1.2,
  deflateRamp: 0.8,
  deflateSpeed: 0.6,
  jelly: { period: 0.36, damping: 0.24, stretch: 0.14, kick: 0.065, thin: 0.6, max: 0.3, smoothing: 30, lean: 0.55, endZone: 0.04 },
  squish: {
    period: 0.5,
    damping: 0.36,
    impact: 0.24,
    speedCap: 12,
    bulge: 1.1,
    barBulge: 14,
    flatRate: 3.5,
    flatRound: 0.15,
    leadRound: 0.88,
    max: 0.3,
    memory: 3,
    contact: 2,
  },
  lensPushTravel: 4,
  endMelt: 0.7,
  meltReach: 12,
  lensMoveSpeed: 9,
  edgeEpsilon: 0.25,
  minLensSquash: 0.7,
  itemMagnify: 0,
  canal: { overflow: 2, give: 0.3, spread: 0.8, soft: 6 },
  tapSlide: {
    canal: 0,
    drop: 0.5,
    lead: 490,
    leadPerSlot: 140,
    leadDamping: 0.9,
    farDamping: 0.78,
    trail: 600,
    trailPerSlot: 105,
    arrival: 0.92,
    holdDelay: 160,
    minSquash: 0.78,
    jellyX: 0.35,
    jellyY: 0.5,
    wallSpread: 0.2,
    impact: 1.2,
    glassRamp: 5,
    pinch: 0.2,
    bend: 0.6,
  },
  barGrow: { x: 6, y: 2.5, towardSearch: 1, held: 1.25 },
  dragSettle: { near: 0.15, colour: 0.5 },
  lensEdgeReach: -1.6,
  switchTravel: {
    duration: 440,
    perSlot: 20,
    dampingRatio: 1,
    kick: 0,
    kickPerSlot: 0,
    delay: 0,
    height: 0.92,
    colour: 0.7,
    optics: 1,
    wide: 1.1,
    hold: 50,
    squishPeriod: 0.75,
    squishDamping: 0.75,
    squishKick: 0.35,
    contactZone: 0.1,
    railGap: 2,
    heightToWidth: 0.5,
    squishBulge: 2.6,
    clearFrom: 0.35,
  },
  highlightFade: { from: 0.3, to: 0.2 },
  tapLanding: { wide: 0.14, flat: 0.12, drop: 6, tint: 0.5, hold: 1.5, glassHold: 4, iconHold: 4, iconBend: 2, iconDepth: 2.3, iconSpread: 0.2, dripDelay: 70 },
  tapLens: {
    ellipse: 0.35,
    revealOverhang: 5.5,
    dip: 0.3,
    dipFrom: 0.5,
    firmPress: 0.5,
    liftY: 1.31,
    holdLiftY: 1.31,
    fallGrey: { from: 0.15, to: 0.6 },
  },
  pressGrow: 0.26,
  pressIconDim: { dark: 0.4, light: 0.9 },
  backTravel: { handoff: 0.001, settle: 0.995, textRate: 2, textDelay: 0.6 },
  searchClose: { fadeFrom: 0.35 },
  searchMorph: { heightLag: 2.2, openVelocity: 3 },
  searchBump: { at: 0.55, overshoot: 3, squish: 4 },
  searchTabs: { fade: 1, closeFade: 1, blur: 10, pressFade: 1.5, textBlur: 8 },
  searchPop: { delay: 110, shift: 28, hiddenScale: 0.96, tuckScale: 0.78, glyphScale: 1 },
  pressSquashX: 0,
  pressSquashY: 0,
  nudgeMax: 4,
  nudgeRange: 60,
  nudgeFollow: 1,
  dragThreshold: 4,
  labelFadeRate: 1.8,
  collapseDistance: 24,
  compactPop: { delay: 110, depth: 0.06 },
  collapseTopOffset: 24,
} as const;

export const cover = {
  placeholders: [
    palette.accent[800],
    palette.blue[800],
    palette.green[800],
    palette.red[800],
    palette.ice[800],
    palette.gold[800],
    palette.bronze[800],
    palette.yellow[800],
  ],
  text: palette.neutral[0],
  icon: withAlpha(palette.neutral[0], 0.35),
  badge: withAlpha(palette.neutral[1000], 0.55),
} as const;
