import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TabBarSpacer } from "@/components/navigation/tab-bar-spacer";
import { Avatar, Button, Text } from "@/components/ui";
import { useAuth } from "@/lib/auth";

/** Placeholder until the Profile design is built: who's signed in, and Sign out. */
export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { session, signOut } = useAuth();

  return (
    <View className="flex-1 bg-surface px-5 pb-6" style={{ paddingTop: insets.top + 8 }}>
      <Text variant="title" accessibilityRole="header">
        Profile
      </Text>
      <View className="mt-8 items-center gap-1">
        <Avatar uri={session?.imageUrl ?? null} name={session?.name ?? ""} className="mb-3" />
        <Text variant="headline">{session?.name}</Text>
        <Text tone="muted">{session?.email}</Text>
      </View>
      <Button title="Sign out" variant="secondary" className="mt-auto" onPress={signOut} />
      <TabBarSpacer />
    </View>
  );
}
