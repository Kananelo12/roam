import { router } from "expo-router";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import { View } from "react-native";

import { Icon, IconButton, Wordmark } from "@/components/ui";

export function AuthHeader() {
  return (
    <View className="flex-row items-center justify-between">
      <IconButton
        variant="outline"
        size="sm"
        accessibilityLabel="Back"
        icon={<Icon as={ChevronLeft} />}
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
      />
      <Wordmark size="sm" />
    </View>
  );
}
