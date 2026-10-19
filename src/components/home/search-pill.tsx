import { router } from "expo-router";
import ArrowUpRight from "lucide-react-native/icons/arrow-up-right";
import Sparkles from "lucide-react-native/icons/sparkles";
import { useState } from "react";
import { TextInput, View } from "react-native";

import { Icon, IconButton, Text } from "@/components/ui";
import { cn } from "@/lib/cn";
import { colors } from "@/theme";

const EXAMPLE = "quiet pet friendly cabin with hot tub";

/** The one-sentence search. Submitting opens the Search tab with the sentence as `q`. */
export function SearchPill({ className }: { className?: string }) {
  const [text, setText] = useState("");
  const submit = () => router.navigate({ pathname: "/search", params: { q: text.trim() } });

  return (
    <View
      className={cn("h-15 flex-row items-center gap-3 rounded-full bg-secondary pl-5 pr-2", className)}
    >
      <Icon as={Sparkles} size={20} />
      <View className="h-full flex-1 justify-center">
        {/* Drawn by hand: Android wraps a native placeholder onto two lines on narrow phones.
            It's foreground, not placeholder grey, because the example is part of the design. */}
        {text ? null : (
          <Text variant="caption" numberOfLines={1} className="absolute inset-x-0" importantForAccessibility="no">
            {EXAMPLE}
          </Text>
        )}
        <TextInput
          accessibilityLabel="Describe your stay"
          accessibilityHint={`For example, ${EXAMPLE}`}
          className="h-full font-body-medium text-caption text-foreground"
          selectionColor={colors.secondaryStrong}
          returnKeyType="search"
          value={text}
          onChangeText={setText}
          onSubmitEditing={submit}
        />
      </View>
      <IconButton
        accessibilityLabel="Search"
        variant="surface-flat"
        size="sm"
        icon={<Icon as={ArrowUpRight} />}
        onPress={submit}
      />
    </View>
  );
}
