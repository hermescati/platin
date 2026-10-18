export type ColorSchemeName = 'light' | 'dark';

export interface Palette {
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
}

export const palettes: Record<ColorSchemeName, Palette> = {
  light: {
    background: '#FFFFFF',
    surface: '#F2F2F5',
    border: '#E0E1E6',
    textPrimary: '#0B0B0F',
    textSecondary: '#60646C',
    accent: '#5B5BD6',
  },
  dark: {
    background: '#000000',
    surface: '#1A1A1F',
    border: '#2E3135',
    textPrimary: '#F5F5F7',
    textSecondary: '#B0B4BA',
    accent: '#9B9EF0',
  },
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const radius = { sm: 6, md: 10, lg: 14, xl: 20, pill: 999 } as const;

export const fontSize = { xs: 11, sm: 13, md: 15, lg: 17, xl: 22, xxl: 28 } as const;
