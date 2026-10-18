import { useState, type ReactNode } from "react";
import { TextInput, View, type TextInputProps } from "react-native";

import { cn } from "@/lib/cn";
import { colors } from "@/theme";

import { Text } from "./text";

export type TextFieldProps = TextInputProps & {
  /** Label stacked above the input inside the field (auth forms). */
  label?: string;
  /** Icon at the start, e.g. search or person. */
  leading?: ReactNode;
  /** Control at the end, e.g. filters or a show-password toggle. */
  trailing?: ReactNode;
  /** Layout only, applied to the field container. */
  className?: string;
};

export function TextField({
  label,
  leading,
  trailing,
  className,
  onFocus,
  onBlur,
  ...props
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  const input = (
    <TextInput
      accessibilityLabel={label}
      className={cn(
        "font-body text-body text-foreground placeholder:text-placeholder",
        label ? "p-0" : "h-full flex-1",
      )}
      selectionColor={colors.secondaryStrong}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...props}
    />
  );

  return (
    <View
      className={cn(
        "flex-row items-center gap-3 rounded-lg border px-4",
        label ? "h-18 gap-4" : "h-14",
        focused ? "border-secondary-strong bg-secondary-soft" : "border-transparent bg-surface-muted",
        className,
      )}
    >
      {leading}
      {label ? (
        <View className="flex-1 gap-0.5">
          <Text variant="callout">{label}</Text>
          {input}
        </View>
      ) : (
        input
      )}
      {trailing}
    </View>
  );
}
