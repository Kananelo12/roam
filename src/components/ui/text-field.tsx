import { useRef, useState, type ReactNode, type Ref } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";

import { cn } from "@/lib/cn";
import { colors } from "@/theme";

import { Text } from "./text";

export type TextFieldProps = TextInputProps & {
  ref?: Ref<TextInput>;
  /** Label stacked above the input inside the field (auth forms). */
  label?: string;
  /** Icon at the start, e.g. search or person. */
  leading?: ReactNode;
  /** Control at the end, e.g. filters or a show-password toggle. */
  trailing?: ReactNode;
  /** `pill` for standalone search fields; forms keep `rounded`. */
  shape?: "rounded" | "pill";
  /** Validation message: shown under the field with a danger border. */
  error?: string;
  /** Layout only, applied to the outer wrapper. */
  className?: string;
};

export function TextField({
  ref,
  label,
  leading,
  trailing,
  shape = "rounded",
  error,
  className,
  onFocus,
  onBlur,
  ...props
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput | null>(null);

  // Keep our own handle (so a tap anywhere on the field focuses it) and forward the caller's.
  const setRef = (node: TextInput | null) => {
    inputRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const input = (
    <TextInput
      ref={setRef}
      accessibilityLabel={label}
      accessibilityHint={error}
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
    <View className={cn("gap-1.5", className)}>
      <Pressable
        accessible={false}
        onPress={() => {
          const input = inputRef.current;
          // focus() is a no-op on a focused input, so re-focus to bring back a dismissed keyboard.
          if (input?.isFocused()) input.blur();
          input?.focus();
        }}
        className={cn(
          "flex-row items-center border",
          shape === "pill" ? "rounded-full" : "rounded-lg",
          label ? "h-15 gap-6 px-5" : "h-14 gap-3 px-4",
          error
            ? cn("border-danger", focused ? "bg-secondary-soft" : "bg-surface-muted")
            : focused
              ? "border-secondary-strong bg-secondary-soft"
              : "border-transparent bg-surface-muted",
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
      </Pressable>
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
