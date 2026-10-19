import { Image } from "expo-image";
import MapPin from "lucide-react-native/icons/map-pin";
import Star from "lucide-react-native/icons/star";
import { PixelRatio, StyleSheet, useWindowDimensions, View } from "react-native";

import { Icon, Text } from "@/components/ui";
import { photoUrl, type Stay } from "@/data/stays";
import { colors } from "@/theme";

// Darkens the bottom of the photo so the white title reads on any image.
const scrim = {
  experimental_backgroundImage: `linear-gradient(to bottom, transparent, ${colors.photoScrim})`,
};

/** A full-width photo card for the Home feed. Not tappable until stay details exist. */
export function StayCard({ stay }: { stay: Stay }) {
  const { width } = useWindowDimensions();
  const place = `${stay.city}, ${stay.region}`;

  return (
    <View
      accessible
      accessibilityLabel={`${stay.title}, ${place}, rated ${stay.rating.toFixed(1)}`}
      className="h-66 overflow-hidden rounded-2xl bg-surface-muted"
    >
      <Image
        source={photoUrl(stay, width * PixelRatio.get())}
        contentFit="cover"
        transition={200}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" className="absolute inset-x-0 bottom-0 h-3/5" style={scrim} />
      <View className="absolute right-3 top-3 h-10 flex-row items-center gap-1.5 rounded-full bg-surface px-3">
        <Icon as={Star} size={18} filled />
        <Text variant="headline">{stay.rating.toFixed(1)}</Text>
      </View>
      {/* The right inset keeps the title wrapping as designed, where the details chevron will go. */}
      <View className="absolute bottom-5 left-5 right-20 gap-1">
        <View className="flex-row items-center gap-2">
          <Icon as={MapPin} size={16} tone="inverse" />
          <Text variant="caption" tone="inverse">
            {place}
          </Text>
        </View>
        <Text variant="feature" tone="inverse" numberOfLines={2}>
          {stay.title}
        </Text>
      </View>
    </View>
  );
}
