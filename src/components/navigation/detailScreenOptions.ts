import type { NativeStackNavigationOptions } from 'expo-router';

import type { Palette } from '@/theme/tokens';

export const detailScreenOptions = (_color: Palette): NativeStackNavigationOptions => ({
  headerShown: true,
  headerTransparent: true,
  headerBackButtonDisplayMode: 'minimal',
  title: '',
});
