import type { ReactNode } from "react";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui";

import { AuthHeader } from "./auth-header";

type AuthScreenProps = {
  title: string;
  body: ReactNode;
  children: ReactNode;
  /** Pinned to the bottom of the scroll content, e.g. the switch link. */
  footer?: ReactNode;
};

/** Layout shared by the auth screens: header, title, body, then the form, scrolling above the keyboard. */
export function AuthScreen({ title, body, children, footer }: AuthScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-surface">
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="grow px-5"
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }}
      >
        <AuthHeader />
        <View className="mt-8 gap-3">
          <Text variant="hero" accessibilityRole="header">
            {title}
          </Text>
          <Text tone="muted">{body}</Text>
        </View>
        <View className="mt-6">{children}</View>
        {footer ? <View className="mt-auto pt-8">{footer}</View> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
