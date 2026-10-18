export type ColorSchemeName = 'light' | 'dark';

export interface Palette {
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  glassTint: string;
  glassSheen: string;
  glassRimTop: string;
  glassRimBottom: string;
  glassGlow: string;
  glassShadow: string;
  lens: string;
  lensActive: string;
  lensInnerShadow: string;
  lensGlow: string;
  tabLegibilityShadow: string;
}

export const palettes: Record<ColorSchemeName, Palette> = {
  light: {
    background: '#FFFFFF',
    surface: '#F2F2F5',
    border: '#E0E1E6',
    textPrimary: '#0B0B0F',
    textSecondary: '#60646C',
    accent: '#5B5BD6',
    glassTint: 'rgba(255, 255, 255, 0.6)',
    glassSheen: 'rgba(255, 255, 255, 0.70)',
    glassRimTop: 'rgba(255, 255, 255, 0.85)',
    glassRimBottom: 'rgba(0, 0, 0, 0.06)',
    glassGlow: 'rgba(255, 255, 255, 0.5)',
    glassShadow: 'rgba(0, 0, 0, 0.14)',
    lens: 'rgba(0, 0, 0, 0.07)',
    lensActive: 'rgba(255, 255, 255, 0.28)',
    lensInnerShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.7)',
    tabLegibilityShadow: 'rgba(255, 255, 255, 0.6)',
    lensGlow:
      'inset 1.5px 1.5px 0 rgba(255, 255, 255, 0.95), inset -1.5px -1.5px 0 rgba(255, 255, 255, 0.5), inset 0 0 12px rgba(255, 255, 255, 0.35)',
  },
  dark: {
    background: '#000000',
    surface: '#1A1A1F',
    border: '#2E3135',
    textPrimary: '#F5F5F7',
    textSecondary: '#B0B4BA',
    accent: '#9B9EF0',
    glassTint: 'rgba(16, 16, 20, 0.62)',
    glassSheen: 'rgba(255, 255, 255, 0.04)',
    glassRimTop: 'rgba(255, 255, 255, 0.22)',
    glassRimBottom: 'rgba(255, 255, 255, 0.03)',
    glassGlow: 'rgba(255, 255, 255, 0.06)',
    glassShadow: 'rgba(0, 0, 0, 0.45)',
    lens: 'rgba(255, 255, 255, 0.14)',
    lensActive: 'rgba(255, 255, 255, 0.07)',
    lensInnerShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.22)',
    tabLegibilityShadow: 'rgba(0, 0, 0, 0.55)',
    lensGlow:
      'inset 1.5px 1.5px 0 rgba(255, 255, 255, 0.6), inset -1.5px -1.5px 0 rgba(255, 255, 255, 0.22), inset 0 0 12px rgba(255, 255, 255, 0.08)',
  },
};

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radius = { sm: 6, md: 10, lg: 14, xl: 20, sheet: 28, pill: 999 } as const;

export const opacity = { pressed: 0.7, disabled: 0.5 } as const;

export const fontSize = { xs: 11, sm: 13, md: 15, lg: 17, xl: 22, xxl: 28 } as const;

export const layout = {
  tabBarHeight: 58,
  tabBarCompactHeight: 44,
  tabBarCompactWidthRatio: 0.72,
  tabLabelHeight: 14,
  tabBarSideInset: 30,
  tabBarGap: 10,
  legibilityShadowRadius: 4,
  tabIconSize: 24,
  searchIconSize: 30,
  searchFieldIconSize: 22,
  hairline: 1,
  glassRim: 1,
  coverAspectRatio: 3 / 4,
  libraryColumns: 3,
  coverIconSize: 32,
  searchCoverWidth: 48,
  sheetCoverWidth: 72,
} as const;

export const glass = {
  blurIntensity: 30,
  pad: 28,
  blend: 8,
  glowRadius: 8,
  rimWidth: 1.5,
  shadowRadius: 12,
  shadowOffset: 6,
  blurRadius: 8,
  bezel: 20,
  refraction: 14,
  lensBlurRadius: 1.5,
  lensBezel: 14,
  lensRefraction: 8,
  lensMagnify: 0.15,
} as const;

export const motion = {
  springs: {
    lens: { duration: 500, dampingRatio: 0.9 },
    lift: { duration: 320, dampingRatio: 0.6 },
    track: { duration: 110, dampingRatio: 1 },
    morph: { duration: 420, dampingRatio: 1 },
    edgeLead: { duration: 240, dampingRatio: 0.8 },
    edgeTrail: { duration: 520, dampingRatio: 0.5 },
    edgeSettle: { duration: 560, dampingRatio: 0.45 },
    searchMorph: { duration: 560, dampingRatio: 0.7 },
  },
  lensLift: 1.25,
  edgeEpsilon: 0.25,
  minLensSquash: 0.7,
  itemMagnify: 0.2,
  tapHold: 140,
  pressGrow: 0.2,
  searchDetach: 0.35,
  searchPulse: 0.15,
  pressSquashX: 0.08,
  pressSquashY: 0.16,
  nudgeMax: 4,
  nudgeRange: 60,
  nudgeFollow: 1,
  dragThreshold: 4,
  labelFadeRate: 1.8,
  collapseDistance: 24,
  collapseTopOffset: 24,
} as const;

export const cover = {
  placeholders: ['#3B3F8F', '#7A3E6B', '#2F6F68', '#8A5A2B', '#4E6A2F', '#6B3A4A', '#2D5B8A', '#5C4B8A'],
  text: '#FFFFFF',
  icon: 'rgba(255, 255, 255, 0.35)',
  badge: 'rgba(0, 0, 0, 0.55)',
} as const;
