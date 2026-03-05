import { useEffect } from 'react';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import 'react-native-reanimated';

import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/colors';
import LoadingSpinner from '@/components/LoadingSpinner';

SplashScreen.preventAutoHideAsync();

const DevMatchDark = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark[900],
    card: Colors.dark[800],
    border: Colors.dark[700],
    primary: Colors.primary[500],
    text: Colors.white,
  },
};

function useProtectedRoute() {
  const { isAuthenticated, isHydrated, isLoading, profile } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Don't navigate until hydration is done and no auth action is in-flight
    if (!isHydrated || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inSetupGroup = segments[0] === '(setup)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      if (profile) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(setup)');
      }
    } else if (isAuthenticated && !profile && !inSetupGroup && !inAuthGroup) {
      router.replace('/(setup)');
    }
  }, [isAuthenticated, isHydrated, isLoading, profile]);
}

export default function RootLayout() {
  const { hydrate, isHydrated } = useAuth();

  useEffect(() => {
    hydrate().finally(() => {
      SplashScreen.hideAsync();
    });
  }, []);

  useProtectedRoute();

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.dark[900] }}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DevMatchDark}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(setup)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="chat/[matchId]"
            options={{ headerShown: false, animation: 'slide_from_right' }}
          />
        </Stack>
        <StatusBar style="light" />
        <Toast />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
