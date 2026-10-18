/**
 * Brand font files. Each file is named after its PostScript name so the same
 * fontFamily string resolves on iOS, Android and web. Loaded at runtime by
 * useAppFonts (Expo Go can't use the expo-font config plugin).
 * The matching `font-*` utilities live in src/global.css.
 */
export const fontFiles = {
  "Urbanist-Regular": require("@/assets/fonts/Urbanist-Regular.ttf"),
  "Urbanist-Medium": require("@/assets/fonts/Urbanist-Medium.ttf"),
  "Urbanist-SemiBold": require("@/assets/fonts/Urbanist-SemiBold.ttf"),
  "Urbanist-Bold": require("@/assets/fonts/Urbanist-Bold.ttf"),
  "Urbanist-ExtraBold": require("@/assets/fonts/Urbanist-ExtraBold.ttf"),
};
