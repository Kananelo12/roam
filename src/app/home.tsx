import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button, Text, Wordmark } from "@/components/ui";
import { useAuth } from "@/lib/auth";

/** Placeholder landing after sign-in until the app shell exists. */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { session, signOut } = useAuth();
  const firstName = session?.name.split(" ")[0] ?? "";

  return (
    <View
      className="flex-1 bg-surface px-5"
      style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }}
    >
      <Wordmark size="lg" />
      <View className="mt-10 gap-3">
        <Text variant="hero" accessibilityRole="header">
          You&apos;re in, {firstName}
        </Text>
        <Text tone="muted">Signed in as {session?.email}.</Text>
        <Text tone="muted">This is a placeholder until the app shell is built.</Text>
      </View>
      <Button title="Sign out" variant="secondary" className="mt-auto" onPress={signOut} />
    </View>
  );
}
