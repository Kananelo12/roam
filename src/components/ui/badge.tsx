import type { ReactNode } from "react";
import { View } from "react-native";

import { cn } from "@/lib/cn";

import { Text, type TextTone } from "./text";

const tones = {
  highlight: { container: "bg-primary-soft", text: "default" }, // Guest favorite
  success: { container: "bg-success-soft", text: "success" }, // New
  danger: { container: "bg-danger-soft", text: "danger" }, // 20% off
  info: { container: "bg-info-soft", text: "info" }, // Superhost
  neutral: { container: "bg-surface-muted", text: "default" }, // amenities
} as const satisfies Record<string, { container: string; text: TextTone }>;

const sizes = {
  md: { container: "h-9 gap-1.5 px-4", text: "caption" },
  sm: { container: "h-7 gap-1 px-3", text: "label" }, // amenities in result rows
} as const;

export type BadgeProps = {
  label: string;
  tone?: keyof typeof tones;
  size?: keyof typeof sizes;
  icon?: ReactNode;
  /** Layout only (margins, alignment). */
  className?: string;
};

export function Badge({ label, tone = "neutral", size = "md", icon, className }: BadgeProps) {
  return (
    <View
      className={cn(
        "flex-row items-center self-start rounded-full",
        sizes[size].container,
        tones[tone].container,
        className,
      )}
    >
      {icon}
      <Text variant={sizes[size].text} tone={tones[tone].text}>
        {label}
      </Text>
    </View>
  );
}
