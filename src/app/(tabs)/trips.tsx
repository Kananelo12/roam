import { router } from "expo-router";
import Calendar from "lucide-react-native/icons/calendar";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TabBarSpacer } from "@/components/navigation/tab-bar-spacer";
import { Button, Icon, Text } from "@/components/ui";

/** Placeholder until booking exists: every guest has no trips yet. */
export default function TripsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-surface px-5" style={{ paddingTop: insets.top + 8 }}>
      <Text variant="title" accessibilityRole="header">
        Trips
      </Text>
      <View className="flex-1 items-center justify-center gap-3 pb-16">
        <Icon as={Calendar} size={32} tone="muted" />
        <Text variant="headline">No trips yet</Text>
        <Text tone="muted" className="text-center">
          Stays you book will show up here.
        </Text>
        <Button title="Find a stay" size="sm" className="mt-3" onPress={() => router.navigate("/home")} />
      </View>
      <TabBarSpacer />
    </View>
  );
}
