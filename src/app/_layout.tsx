import "@/global.css";

import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { useAppFonts } from "@/hooks/use-app-fonts";
import { AuthProvider, useAuth } from "@/lib/auth";

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Copy .env.example to .env.local and fill it in.");
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
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
  const fontsReady = useAppFonts();
  const { isLoaded, session } = useAuth();
  // Wait for Clerk to restore a saved session, so signed-in guests never see onboarding flash.
  const ready = fontsReady && isLoaded;
  const signedIn = session !== null;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
