import { router } from "expo-router";
import { View } from "react-native";

import { Button, Text } from "@/components/ui";

export default function Index() {
  return (
    <View className="flex-1 justify-center gap-6 bg-surface px-5">
      <Text variant="display">Find your next stay</Text>
      <Text tone="muted">Find unforgettable stays for every kind of trip.</Text>
      <Button title="View design system" onPress={() => router.push("/design-system")} />
    </View>
  );
}
