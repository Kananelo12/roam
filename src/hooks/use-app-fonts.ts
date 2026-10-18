import { useFonts } from "expo-font";
import { Platform } from "react-native";

import { fontFiles } from "@/theme/fonts";

/**
 * Loads the brand fonts at runtime (works in Expo Go; the expo-font config
 * plugin needs a dev build). Native waits for the fonts behind the splash
 * screen; web never blocks so static HTML still renders, and fonts swap in.
 * A load error doesn't block the app - text falls back to the system font.
 */
export function useAppFonts() {
  const [loaded, error] = useFonts(fontFiles);

  return Platform.OS === "web" || loaded || error != null;
}
