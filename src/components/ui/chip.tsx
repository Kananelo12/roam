import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { colors } from "@/theme";

import { PressableScale, type PressableScaleProps } from "./pressable-scale";
import { Text } from "./text";

/** Selected fill: lavender for filters, yellow for the active category. */
const selectedTones = {
  secondary: colors.secondary,
  primary: colors.primary,
} as const;

const sizes = {
  md: { container: "h-12 gap-2 px-5", text: "button" },
  sm: { container: "h-10 gap-1.5 px-4", text: "caption" },
} as const;

export type ChipProps = Omit<PressableScaleProps, "children" | "fill"> & {
  label: string;
  selected?: boolean;
  selectedTone?: keyof typeof selectedTones;
  size?: keyof typeof sizes;
  icon?: ReactNode;
  /** Layout only (margins, flex). */
  className?: string;
};

export function Chip({
  label,
  selected = false,
  selectedTone = "secondary",
  size = "md",
  icon,
  className,
  ...props
}: ChipProps) {
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={cn("flex-row items-center rounded-full", sizes[size].container, className)}
      // A fill rather than a class, so it cross-fades when selection changes.
      fill={selected ? selectedTones[selectedTone] : colors.surfaceMuted}
      {...props}
    >
      {icon}
      <Text variant={sizes[size].text}>{label}</Text>
    </PressableScale>
  );
}
