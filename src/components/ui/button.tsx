import type { ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";

import { cn } from "@/lib/cn";
import { colors } from "@/theme";

import { PressableScale, type PressableScaleProps } from "./pressable-scale";
import { Text } from "./text";

const variants = {
  primary: { container: "bg-primary", spinner: colors.onPrimary },
  secondary: { container: "border border-border bg-surface", spinner: colors.foreground },
} as const;

const sizes = {
  md: { container: "h-14 gap-3 px-6", text: "button", trailing: "right-6" },
  sm: { container: "h-10 gap-2 px-5", text: "caption", trailing: "right-5" },
} as const;

export type ButtonProps = Omit<PressableScaleProps, "children" | "fill"> & {
  title: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** Icon before the label, e.g. a provider logo. */
  leading?: ReactNode;
  /** Icon pinned to the trailing edge, e.g. an arrow. The label stays centered. */
  trailing?: ReactNode;
  loading?: boolean;
  /** Layout only (margins, flex, width). */
  className?: string;
};

export function Button({
  title,
  variant = "primary",
  size = "md",
  leading,
  trailing,
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = !!disabled || loading;

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(
        "flex-row items-center justify-center rounded-full",
        // Loading blocks presses but keeps full strength so the spinner reads clearly.
        disabled && !loading && "opacity-40",
        variants[variant].container,
        sizes[size].container,
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variants[variant].spinner} />
      ) : (
        <>
          {leading}
          <Text variant={sizes[size].text}>{title}</Text>
          {trailing ? <View className={cn("absolute", sizes[size].trailing)}>{trailing}</View> : null}
        </>
      )}
    </PressableScale>
  );
}
