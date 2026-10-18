/**
 * JS mirror of the color tokens in src/global.css, for props that cannot take
 * a className (icon tintColor, StatusBar, Reanimated styles).
 * global.css is the source of truth: change a value there first, then here.
 * Everywhere else, use the utility classes (bg-primary, text-foreground, ...).
 */
export const colors = {
  white: "#ffffff",
  black: "#000000",
  primary: "#ffc629",
  primarySoft: "#fff6da",
  onPrimary: "#0b0b1a",
  secondary: "#c9b4ff",
  secondarySoft: "#f3eeff",
  secondaryStrong: "#6a4cf5",
  onSecondary: "#0b0b1a",
  foreground: "#0b0b1a",
  mutedForeground: "#6b7280",
  placeholder: "#9ca3af",
  surface: "#ffffff",
  surfaceMuted: "#f4f5f7",
  border: "#e5e7eb",
  glass: "rgba(255, 255, 255, 0.7)",
  success: "#1f9d55",
  successSoft: "#e7f6ed",
  danger: "#e5484d",
  dangerSoft: "#fdecee",
  info: "#3b5bdb",
  infoSoft: "#eaefff",
} as const;
