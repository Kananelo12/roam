import type { ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";

import { cn } from "@/lib/cn";

import { Text } from "./text";

/** Selected fill: lavender for filters, yellow for the active category. */
const selectedTones = {
  secondary: "bg-secondary",
  primary: "bg-primary",
} as const;

const sizes = {
  md: { container: "h-12 gap-2 px-5", text: "button" },
  sm: { container: "h-10 gap-1.5 px-4", text: "caption" },
} as const;

export type ChipProps = Omit<PressableProps, "children"> & {
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
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={cn(
        "flex-row items-center rounded-full active:opacity-70",
        selected ? selectedTones[selectedTone] : "bg-surface-muted",
        sizes[size].container,
        className,
      )}
      {...props}
    >
      {icon}
      <Text variant={sizes[size].text}>{label}</Text>
    </Pressable>
  );
}
