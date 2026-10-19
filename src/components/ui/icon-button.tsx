import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { PressableScale, type PressableScaleProps } from "./pressable-scale";

const variants = {
  muted: "bg-surface-muted", // on white surfaces
  surface: "bg-surface shadow-card", // floating over photos
  "surface-flat": "bg-surface", // inside a colored field (Home search pill)
  outline: "border border-border bg-surface", // headers on white (auth back button)
  primary: "bg-primary",
} as const;

const sizes = {
  md: "size-14",
  sm: "size-11",
} as const;

export type IconButtonProps = Omit<PressableScaleProps, "children" | "fill"> & {
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
    <PressableScale
      accessibilityRole="button"
      className={cn(
        "items-center justify-center rounded-full disabled:opacity-40",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {icon}
    </PressableScale>
  );
}
