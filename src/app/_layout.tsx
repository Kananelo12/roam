import "@/global.css";

import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { useAppFonts } from "@/hooks/use-app-fonts";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const fontsReady = useAppFonts();

  useEffect(() => {
    if (fontsReady) SplashScreen.hideAsync();
  }, [fontsReady]);

  if (!fontsReady) return null;

  return <Stack />;
}
