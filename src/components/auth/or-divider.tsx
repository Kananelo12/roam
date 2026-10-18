import { View } from "react-native";

import { Text } from "@/components/ui";

export function OrDivider() {
  return (
    <View className="my-5 flex-row items-center gap-4" accessible={false}>
      <View className="h-px flex-1 bg-border" />
      <Text variant="caption" tone="muted">
        or
      </Text>
      <View className="h-px flex-1 bg-border" />
    </View>
  );
}
