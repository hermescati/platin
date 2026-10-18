import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';

import { DatabaseProvider } from '@/db/DatabaseProvider';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

const RootLayout = () => {
  const { scheme } = useTheme();

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <DatabaseProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="add-game"
            options={{
              presentation: 'formSheet',
              sheetAllowedDetents: 'fitToContents',
              sheetGrabberVisible: true,
              sheetCornerRadius: radius.sheet,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          />
        </Stack>
      </DatabaseProvider>
    </ThemeProvider>
  );
};

export default RootLayout;
