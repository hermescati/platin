import { Stack } from 'expo-router';

import { useTheme } from '@/theme/useTheme';

export const TabStack = () => {
  const { color } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: color.background },
        headerTintColor: color.textPrimary,
        contentStyle: { backgroundColor: color.background },
      }}
    />
  );
};
