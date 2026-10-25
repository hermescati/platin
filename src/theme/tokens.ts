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
  },
};

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
  hairline: 1,
  coverAspectRatio: 3 / 4,
  libraryColumns: 3,
  coverIconSize: 32,
  searchCoverWidth: 48,
  sheetCoverWidth: 72,
  detailCoverWidth: 160,
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
  },
  fade: 200,
  scale: { press: 0.97, liftCover: 1.06, liftCard: 1.03, enter: 0.95 },
  stagger: 40,
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
