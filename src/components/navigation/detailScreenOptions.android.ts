import type { NativeStackNavigationOptions } from 'expo-router';

import type { Palette } from '@/theme/tokens';

export const detailScreenOptions = (color: Palette): NativeStackNavigationOptions => ({
  headerShown: true,
  headerShadowVisible: false,
  headerStyle: { backgroundColor: color.bg.screen },
  headerTintColor: color.text.primary,
  contentStyle: { backgroundColor: color.bg.screen },
  title: '',
});
