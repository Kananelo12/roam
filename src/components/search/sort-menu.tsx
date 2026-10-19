import Check from "lucide-react-native/icons/check";
import ChevronDown from "lucide-react-native/icons/chevron-down";
import { Pressable, View } from "react-native";
import Animated, { Keyframe, useReducedMotion } from "react-native-reanimated";

import { AnimatedView, Icon, PressableScale, Text } from "@/components/ui";
import type { SortKey } from "@/lib/search";
import { CSS_EASE_IN_OUT, EASE_OUT } from "@/theme/motion";

export const sortLabels: Record<SortKey, string> = {
  best: "Best match",
  price: "Price: low to high",
  rating: "Rating",
};
const sortKeys = Object.keys(sortLabels) as SortKey[];

// The menu grows from its anchor (top right) and fades; it leaves a little faster than it came.
const MENU_ENTER = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.96 }] },
  100: { opacity: 1, transform: [{ scale: 1 }], easing: EASE_OUT },
}).duration(180);
const MENU_EXIT = new Keyframe({
  0: { opacity: 1, transform: [{ scale: 1 }] },
  100: { opacity: 0, transform: [{ scale: 0.96 }], easing: EASE_OUT },
}).duration(140);

/** "Sort by Best match", with its chevron turning as the menu opens. */
export function SortButton({ value, open, onPress }: { value: SortKey; open: boolean; onPress: () => void }) {
  const reduced = useReducedMotion();

  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel={`Sort by ${sortLabels[value]}`}
      accessibilityState={{ expanded: open }}
      hitSlop={12}
      className="flex-row items-center gap-1"
      onPress={onPress}
    >
      <Text variant="caption" tone="muted">
        Sort by
      </Text>
      <Text variant="subhead">{sortLabels[value]}</Text>
      <Animated.View
        style={{
          transform: [{ rotate: open && !reduced ? "180deg" : "0deg" }],
          transitionProperty: "transform",
          transitionDuration: 200,
          transitionTimingFunction: CSS_EASE_IN_OUT,
        }}
      >
        <Icon as={ChevronDown} size={18} />
      </Animated.View>
    </PressableScale>
  );
}

export type SortMenuProps = {
  value: SortKey;
  onChange: (sort: SortKey) => void;
  onClose: () => void;
};

/**
 * The open menu, anchored under the sort button. Render it only while open;
 * the screen adds a backdrop that closes it.
 */
export function SortMenu({ value, onChange, onClose }: SortMenuProps) {
  return (
    <AnimatedView
        entering={MENU_ENTER}
        exiting={MENU_EXIT}
        accessibilityRole="menu"
        className="absolute right-0 top-9 w-50 rounded-xl bg-surface py-1 shadow-raised"
        style={{ transformOrigin: "top right" }}
      >
        {sortKeys.map((key) => {
          const selected = key === value;
          return (
            <Pressable
              key={key}
              accessibilityRole="menuitem"
              accessibilityState={{ selected }}
              className="h-11 flex-row items-center justify-between px-4 active:bg-surface-muted"
              onPress={() => {
                onChange(key);
                onClose();
              }}
            >
              <Text variant={selected ? "subhead" : "body"}>{sortLabels[key]}</Text>
              {selected ? <Icon as={Check} size={18} /> : <View />}
            </Pressable>
          );
        })}
    </AnimatedView>
  );
}
