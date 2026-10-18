import type { LucideIcon } from "lucide-react-native";

import { colors } from "@/theme";

const tones = {
  default: colors.foreground,
  muted: colors.mutedForeground,
  accent: colors.secondaryStrong,
  primary: colors.primary,
  success: colors.success,
  danger: colors.danger,
  info: colors.info,
  inverse: colors.white,
} as const;

export type IconTone = keyof typeof tones;

export type IconProps = {
  /**
   * A Lucide icon, imported per icon so the bundle only carries what's used:
   * `import Search from "lucide-react-native/icons/search"`.
   */
  as: LucideIcon;
  size?: number;
  tone?: IconTone;
  /** Solid shapes like the active tab or rating star. */
  filled?: boolean;
};

/** Every icon in the app renders through this, so stroke and color stay consistent. */
export function Icon({ as: Glyph, size = 22, tone = "default", filled = false }: IconProps) {
  const color = tones[tone];

  return <Glyph size={size} color={color} strokeWidth={2} fill={filled ? color : "none"} />;
}
