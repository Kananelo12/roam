import { Image } from "expo-image";
import type { LucideIcon } from "lucide-react-native";
import Bath from "lucide-react-native/icons/bath";
import CarFront from "lucide-react-native/icons/car-front";
import Flame from "lucide-react-native/icons/flame";
import MapPin from "lucide-react-native/icons/map-pin";
import MountainSnow from "lucide-react-native/icons/mountain-snow";
import PawPrint from "lucide-react-native/icons/paw-print";
import Snowflake from "lucide-react-native/icons/snowflake";
import Star from "lucide-react-native/icons/star";
import Sunset from "lucide-react-native/icons/sunset";
import Utensils from "lucide-react-native/icons/utensils";
import WavesLadder from "lucide-react-native/icons/waves-ladder";
import Wifi from "lucide-react-native/icons/wifi";
import { PixelRatio, StyleSheet, View } from "react-native";

import { Badge, Icon, Text } from "@/components/ui";
import { photoUrl, type Feature } from "@/data/stays";
import { amenityLabels, type SearchResult } from "@/lib/search";

const features: Record<Feature, { label: string; icon: LucideIcon }> = {
  "hot-tub": { label: amenityLabels["hot-tub"], icon: Bath },
  pool: { label: amenityLabels.pool, icon: WavesLadder },
  fireplace: { label: amenityLabels.fireplace, icon: Flame },
  wifi: { label: amenityLabels.wifi, icon: Wifi },
  "ocean-view": { label: amenityLabels["ocean-view"], icon: Sunset },
  kitchen: { label: amenityLabels.kitchen, icon: Utensils },
  parking: { label: amenityLabels.parking, icon: CarFront },
  "ski-in": { label: amenityLabels["ski-in"], icon: MountainSnow },
  "air-conditioning": { label: amenityLabels["air-conditioning"], icon: Snowflake },
  pets: { label: "Pet Friendly", icon: PawPrint },
};

/** Photo width in the row (w-36), for requesting a right-sized image. */
const PHOTO_WIDTH = 144;

/** One search result. Not tappable until stay details exist. */
export function ResultRow({ result: { stay, badges } }: { result: SearchResult }) {
  const place = `${stay.city}, ${stay.region}`;
  const rating = stay.rating.toFixed(1);

  return (
    <View
      accessible
      accessibilityLabel={`${stay.title}, ${place}, rated ${rating} from ${stay.reviewCount} reviews, $${stay.pricePerNight} a night`}
      className="flex-row gap-3"
    >
      <View className="h-37 w-36 overflow-hidden rounded-lg bg-surface-muted">
        <Image
          source={photoUrl(stay, PHOTO_WIDTH * PixelRatio.get())}
          contentFit="cover"
          transition={200}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View className="flex-1 justify-center gap-1.5">
        <Text variant="listing" numberOfLines={2}>
          {stay.title}
        </Text>
        <View className="flex-row items-center gap-1.5">
          <Icon as={MapPin} size={16} tone="muted" />
          <Text variant="caption" tone="muted" numberOfLines={1} className="flex-1">
            {place}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Icon as={Star} size={16} tone="primary" filled />
          <Text variant="callout">{rating}</Text>
          <Text tone="muted">({stay.reviewCount})</Text>
        </View>
        {/* One line of badges: on narrow phones a badge that would wrap is hidden instead. */}
        <View className="h-7 flex-row flex-wrap gap-1.5 overflow-hidden">
          {badges.map((feature) => (
            <Badge
              key={feature}
              size="sm"
              label={features[feature].label}
              icon={<Icon as={features[feature].icon} size={14} />}
            />
          ))}
        </View>
        <View className="flex-row items-baseline gap-1">
          <Text variant="headline">${stay.pricePerNight}</Text>
          <Text variant="caption" tone="muted">
            / night
          </Text>
        </View>
      </View>
    </View>
  );
}
