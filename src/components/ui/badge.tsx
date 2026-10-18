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

export type BadgeProps = {
  label: string;
  tone?: keyof typeof tones;
  icon?: ReactNode;
  /** Layout only (margins, alignment). */
  className?: string;
};

export function Badge({ label, tone = "neutral", icon, className }: BadgeProps) {
  return (
    <View
      className={cn(
        "h-9 flex-row items-center gap-1.5 self-start rounded-full px-4",
        tones[tone].container,
        className,
      )}
    >
      {icon}
      <Text variant="caption" tone={tones[tone].text}>
        {label}
      </Text>
    </View>
  );
}
