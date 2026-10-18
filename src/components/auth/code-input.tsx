import { useRef, useState } from "react";
import { Pressable, TextInput, View } from "react-native";

import { Text } from "@/components/ui";
import { cn } from "@/lib/cn";

export const CODE_LENGTH = 6;

type CodeInputProps = {
  value: string;
  onChangeText: (code: string) => void;
  error?: string;
};

/**
 * Six boxes over one hidden input, so typing, deleting, paste and OTP
 * autofill all behave like a normal field.
 */
export function CodeInput({ value, onChangeText, error }: CodeInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const active = Math.min(value.length, CODE_LENGTH - 1);

  return (
    <View className="gap-1.5">
      <Pressable
        accessible={false}
        onPress={() => {
          const input = inputRef.current;
          // focus() is a no-op on a focused input, so re-focus to bring back a dismissed keyboard.
          if (input?.isFocused()) input.blur();
          input?.focus();
        }}
      >
        <View className="flex-row justify-between gap-2">
          {Array.from({ length: CODE_LENGTH }, (_, i) => (
            <View
              key={i}
              className={cn(
                "h-15 flex-1 items-center justify-center rounded-lg border",
                error
                  ? "border-danger bg-surface-muted"
                  : focused && i === active
                    ? "border-secondary-strong bg-secondary-soft"
                    : "border-transparent bg-surface-muted",
              )}
            >
              <Text variant="title">{value[i] ?? ""}</Text>
            </View>
          ))}
        </View>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={(text) => onChangeText(text.replace(/\D/g, "").slice(0, CODE_LENGTH))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoFocus
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="one-time-code"
          maxLength={CODE_LENGTH}
          caretHidden
          accessibilityLabel="Verification code"
          accessibilityHint={error}
          className="absolute inset-0 opacity-0"
        />
      </Pressable>
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
