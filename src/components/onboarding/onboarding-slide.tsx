import { Image } from "expo-image";
import MapPin from "lucide-react-native/icons/map-pin";
import { StyleSheet, View } from "react-native";

import { Icon, Text } from "@/components/ui";
import { colors } from "@/theme";

import { ProgressBars } from "./progress-bars";
import { SheetCurve } from "./sheet-curve";
import type { Slide } from "./slides";

type OnboardingSlideProps = {
  slide: Slide;
  index: number;
  count: number;
  width: number;
  height: number;
};

/** One onboarding page: full-bleed photo, location pill, and the curved sheet with its copy. */
export function OnboardingSlide({ slide, index, count, width, height }: OnboardingSlideProps) {
  return (
    <View style={{ width, height }}>
      <Image
        source={{ uri: slide.photo }}
        contentFit="cover"
        transition={300}
        cachePolicy="memory-disk"
        accessible={false}
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceMuted }]}
      />

      <View className="flex-1 justify-end px-6 pb-5">
        <View className="h-10 flex-row items-center gap-2 self-start rounded-full border border-glass-border bg-scrim px-4">
          <Icon as={MapPin} size={16} tone="inverse" filled />
          <Text variant="caption" tone="inverse">
            {slide.location}
          </Text>
        </View>
      </View>

      <SheetCurve width={width} />
      <View className="gap-3 bg-surface px-6">
        <ProgressBars count={count} active={index} />
        <Text variant="hero" accessibilityRole="header" className="mt-2">
          {slide.title}
        </Text>
        <Text tone="muted">{slide.body}</Text>
      </View>
    </View>
  );
}
