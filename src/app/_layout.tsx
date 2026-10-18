import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';

import { useTheme } from '@/theme/useTheme';

const RootLayout = () => {
  const { scheme } = useTheme();

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
};

export default RootLayout;
