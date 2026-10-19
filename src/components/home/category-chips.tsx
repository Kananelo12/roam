import type { LucideIcon } from "lucide-react-native";
import Building from "lucide-react-native/icons/building";
import House from "lucide-react-native/icons/house";
import TreePalm from "lucide-react-native/icons/tree-palm";
import TreePine from "lucide-react-native/icons/tree-pine";
import Waves from "lucide-react-native/icons/waves-horizontal";
import { View } from "react-native";

import { Chip, Icon } from "@/components/ui";
import type { StayType } from "@/data/stays";
import { cn } from "@/lib/cn";

const categories: { type: StayType | null; label: string; icon: LucideIcon }[] = [
  { type: null, label: "All Stays", icon: House },
  { type: "cabin", label: "Cabins", icon: TreePine },
  { type: "beach", label: "Beach", icon: Waves },
  { type: "city", label: "City", icon: Building },
  { type: "villa", label: "Villas", icon: TreePalm },
];

export type CategoryChipsProps = {
  value: StayType | null;
  onChange: (type: StayType | null) => void;
  className?: string;
};

/** Single-select stay types; one is always selected. */
export function CategoryChips({ value, onChange, className }: CategoryChipsProps) {
  return (
    <View className={cn("flex-row flex-wrap gap-2", className)}>
      {categories.map(({ type, label, icon }) => {
        const selected = value === type;
        return (
          <Chip
            key={label}
            label={label}
            selected={selected}
            selectedTone="primary"
            icon={<Icon as={icon} size={20} filled={selected} />}
            onPress={() => onChange(type)}
          />
        );
      })}
    </View>
  );
}
