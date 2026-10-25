import type { LucentColorOverrides } from 'expo-lucent';

import { palette } from '@/theme/tokens';

export const lucentColors: LucentColorOverrides = {
  dark: {
    tint: palette.accent[500],
    tabAccent: '#F8A154',
    tabActive: '#FFDC8C',
    tabActiveOver: '#FE8939',
  },
  light: {
    tint: palette.accent[700],
    tabAccent: palette.accent[700],
    tabActive: '#AF4F00',
    tabActiveOver: '#9E4302',
  },
};
