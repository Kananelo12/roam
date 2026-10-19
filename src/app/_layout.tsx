import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import "@/global.css";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { useAppFonts } from "@/hooks/use-app-fonts";
import { AuthProvider, useAuth } from "@/lib/auth";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add your key to .env.local.\nRun: 1) clerk auth login  2) clerk link  3) clerk env pull — then restart the dev server.");
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const fontsReady = useAppFonts();

  useEffect(() => {
    if (fontsReady) SplashScreen.hideAsync();
  }, [fontsReady]);

  if (!fontsReady) return null;

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AuthProvider>
        {/* Light-only app: dark status bar content everywhere. */}
        <StatusBar style="dark" />
        <RootStack />
      </AuthProvider>
    </ClerkProvider>
  );
}

/** Signed-out guests only reach onboarding and auth; signed-in guests only reach the app. */
function RootStack() {
  const { session } = useAuth();
  const signedIn = session !== null;

  return (
    <Stack>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="home" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}