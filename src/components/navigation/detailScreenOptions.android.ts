import type { NativeStackNavigationOptions } from 'expo-router';

import type { Palette } from '@/theme/tokens';

export const detailScreenOptions = (color: Palette): NativeStackNavigationOptions => ({
  headerShown: true,
  headerShadowVisible: false,
  headerStyle: { backgroundColor: color.background },
  headerTintColor: color.textPrimary,
  contentStyle: { backgroundColor: color.background },
  title: '',
});
