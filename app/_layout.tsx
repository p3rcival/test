import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

// Remove the direct export of the loader to prevent duplicate calls:
// export const loader = SplashScreen.preventAutoHideAsync;

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  // Prevent auto-hiding of the splash screen safely within a useEffect.
  useEffect(() => {
    const prepareSplash = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
      } catch (err) {
        console.warn('Error preventing splash auto-hide:', err);
      }
    };

    prepareSplash();
  }, []);

  // Hide the splash screen once fonts are loaded (or if there's an error).
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
