import { router, type Href } from "expo-router";
import { Pressable, View } from "react-native";

import { Text } from "@/components/ui";

type AuthFooterLinkProps = {
  prompt: string;
  label: string;
  href: Href;
};

/** "Already have an account? Sign in": swaps between sign-up and sign-in. */
export function AuthFooterLink({ prompt, label, href }: AuthFooterLinkProps) {
  return (
    <View className="flex-row items-center justify-center gap-2">
      <Text variant="caption" tone="muted">
        {prompt}
      </Text>
      <Pressable
        accessibilityRole="link"
        hitSlop={8}
        className="active:opacity-60"
        onPress={() => router.replace(href)}
      >
        <Text variant="callout" className="underline">
          {label}
        </Text>
      </Pressable>
    </View>
  );
}
