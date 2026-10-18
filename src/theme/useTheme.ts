import { useColorScheme } from 'react-native';

import { palettes, type ColorSchemeName, type Palette } from '@/theme/tokens';

interface Theme {
  scheme: ColorSchemeName;
  color: Palette;
}

export const useTheme = (): Theme => {
  const scheme: ColorSchemeName = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { scheme, color: palettes[scheme] };
};
