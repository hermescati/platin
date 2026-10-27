import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { LucentProvider } from 'expo-lucent';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { detailScreenOptions } from '@/navigation/detailScreenOptions';
import { DatabaseProvider } from '@/db/DatabaseProvider';
import { fonts } from '@/theme/fonts';
import { lucentColors } from '@/theme/lucent';
import { radius } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const { scheme, color } = useTheme();
  const [fontsLoaded, fontError] = useFonts({ [fonts.brand]: SpaceGrotesk_700Bold });
  const fontsReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (fontsReady) SplashScreen.hideAsync();
  }, [fontsReady]);

  if (!fontsReady) return null;

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <LucentProvider colors={lucentColors}>
        <DatabaseProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="game/[id]" options={detailScreenOptions(color)} />
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
      </LucentProvider>
    </ThemeProvider>
  );
};

export default RootLayout;
