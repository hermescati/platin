import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';

import { DatabaseProvider } from '@/db/DatabaseProvider';
import { useTheme } from '@/theme/useTheme';

const RootLayout = () => {
  const { scheme } = useTheme();

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <DatabaseProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </DatabaseProvider>
    </ThemeProvider>
  );
};

export default RootLayout;
