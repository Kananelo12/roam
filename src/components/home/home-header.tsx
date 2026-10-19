import { router } from "expo-router";
import Search from "lucide-react-native/icons/search";
import { View } from "react-native";

import { Avatar, Icon, PressableScale, Text, Wordmark } from "@/components/ui";

export type HomeHeaderProps = { name: string; imageUrl: string | null };

/** The wordmark, and the avatar that opens Profile. */
export function HomeHeader({ name, imageUrl }: HomeHeaderProps) {
  return (
    <View className="flex-row items-center justify-between">
      <Wordmark size="lg" />
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Profile"
        className="rounded-full"
        onPress={() => router.navigate("/profile")}
      >
        <Avatar uri={imageUrl} name={name} />
      </PressableScale>
    </View>
  );
}

/** "Hey, Joanna" and the headline, beside the tall button that opens Search. */
export function HomeIntro({ name }: { name: string }) {
  const firstName = name.trim().split(/\s+/)[0];

  return (
    <View className="flex-row items-center gap-3">
      <View className="flex-1">
        <Text variant="lead" tone="muted">
          {firstName ? `Hey, ${firstName} 👋` : "Hey there 👋"}
        </Text>
        {/* The tight line height clips the last line's descenders on Android; the padding gives them room. */}
        <Text variant="masthead" accessibilityRole="header" className="mt-1 pb-2">
          {"Find your\nnext stay"}
        </Text>
      </View>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel="Search all stays"
        className="h-21 w-15 items-center justify-center rounded-full bg-surface-muted"
        onPress={() => router.navigate({ pathname: "/search", params: { q: "" } })}
      >
        <Icon as={Search} size={26} />
      </PressableScale>
    </View>
  );
}
