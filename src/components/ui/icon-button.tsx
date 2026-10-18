import type { ReactNode } from "react";
import { Pressable, type PressableProps } from "react-native";

import { cn } from "@/lib/cn";

const variants = {
  muted: "bg-surface-muted", // on white surfaces
  surface: "bg-surface shadow-card", // floating over photos
  primary: "bg-primary",
} as const;

const sizes = {
  md: "size-14",
  sm: "size-11",
} as const;

export type IconButtonProps = Omit<PressableProps, "children"> & {
  icon: ReactNode;
  /** Required: icon-only controls have no visible text label. */
  accessibilityLabel: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** Layout only (margins, positioning). */
  className?: string;
};

export function IconButton({
  icon,
  variant = "muted",
  size = "md",
  className,
  ...props
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={cn(
        "items-center justify-center rounded-full active:opacity-70 disabled:opacity-40",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {icon}
    </Pressable>
  );
}
