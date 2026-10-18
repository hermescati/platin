export type ColorSchemeName = 'light' | 'dark';

export interface Palette {
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentSoft: string;
  glassTint: string;
  glassBorder: string;
}

export const palettes: Record<ColorSchemeName, Palette> = {
  light: {
    background: '#FFFFFF',
    surface: '#F2F2F5',
    border: '#E0E1E6',
    textPrimary: '#0B0B0F',
    textSecondary: '#60646C',
    accent: '#5B5BD6',
    accentSoft: 'rgba(91, 91, 214, 0.14)',
    glassTint: 'rgba(255, 255, 255, 0.55)',
    glassBorder: 'rgba(0, 0, 0, 0.08)',
  },
  dark: {
    background: '#000000',
    surface: '#1A1A1F',
    border: '#2E3135',
    textPrimary: '#F5F5F7',
    textSecondary: '#B0B4BA',
    accent: '#9B9EF0',
    accentSoft: 'rgba(155, 158, 240, 0.18)',
    glassTint: 'rgba(28, 28, 32, 0.55)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
  },
};

export const spacing = { xxs: 2, xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radius = { sm: 6, md: 10, lg: 14, xl: 20, pill: 999 } as const;

export const fontSize = { xs: 11, sm: 13, md: 15, lg: 17, xl: 22, xxl: 28 } as const;

export const layout = { tabBarHeight: 64, tabIconSize: 24, hairline: 1 } as const;

export const glass = { blurIntensity: 60 } as const;
