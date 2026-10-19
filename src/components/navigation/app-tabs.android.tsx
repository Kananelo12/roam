import { BlurTargetView, BlurView } from "expo-blur";
import { usePathname } from "expo-router";
import {
  TabList,
  TabSlot,
  TabTrigger,
  Tabs,
  type TabTriggerSlotProps,
} from "expo-router/ui";
import type { LucideIcon } from "lucide-react-native";
import Calendar from "lucide-react-native/icons/calendar";
import House from "lucide-react-native/icons/house";
import Search from "lucide-react-native/icons/search";
import User from "lucide-react-native/icons/user";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { StyleSheet, View, type LayoutRectangle } from "react-native";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon, PressableScale, Text } from "@/components/ui";
import { colors } from "@/theme";
import { EASE_IN_OUT } from "@/theme/motion";

import {
  TAB_BAR_GAP,
  TAB_BAR_PADDING,
  TAB_INDICATOR_SIZE,
} from "./tab-bar-metrics";

const tabs: {
  name: string;
  href: "/home" | "/search" | "/trips" | "/profile";
  label: string;
  icon: LucideIcon;
  fillable: boolean;
}[] = [
  { name: "home", href: "/home", label: "Home", icon: House, fillable: true },
  {
    name: "search",
    href: "/search",
    label: "Search",
    icon: Search,
    fillable: false,
  },
  {
    name: "trips",
    href: "/trips",
    label: "Trips",
    icon: Calendar,
    fillable: false,
  },
  {
    name: "profile",
    href: "/profile",
    label: "Profile",
    icon: User,
    fillable: true,
  },
];

/**
 * Android: a floating, fully rounded bar with a yellow circle that slides to
 * the active tab, as designed. Built on expo-router's headless tabs, because
 * native Android tabs only let the indicator's color change.
 */
export function AppTabs() {
  // Android blurs only what's inside a BlurTargetView, so the screens render in one.
  const screens = useRef<View>(null);

  return (
    <Tabs>
      <BlurTargetView ref={screens} style={styles.screens}>
        <TabSlot />
      </BlurTargetView>
      <TabList asChild>
        <TabBar blurTarget={screens}>
          {tabs.map(({ name, href, label, icon, fillable }) => (
            <TabTrigger key={name} name={name} href={href} asChild>
              <TabButton label={label} icon={icon} fillable={fillable} />
            </TabTrigger>
          ))}
        </TabBar>
      </TabList>
    </Tabs>
  );
}

function TabBar({
  children,
  blurTarget,
}: {
  children: ReactNode;
  blurTarget: RefObject<View | null>;
}) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const active = Math.max(
    0,
    tabs.findIndex((tab) => pathname.startsWith(tab.href)),
  );
  // Each tab's frame, measured once with onLayout (never per frame).
  const [frames, setFrames] = useState<(LayoutRectangle | undefined)[]>([]);
  const x = useSharedValue(0);
  // Hidden until the first measurement places it, so it never flies in from the left edge.
  const placed = useSharedValue(false);

  const frame = frames[active];
  useEffect(() => {
    if (!frame) return;
    const target = frame.x + (frame.width - TAB_INDICATOR_SIZE) / 2;
    if (!placed.get()) {
      x.set(target);
      placed.set(true);
      return;
    }
    // The skill's tab-indicator recipe: on-screen movement, ease-in-out, 250 ms.
    x.set(
      withTiming(target, {
        duration: 250,
        easing: EASE_IN_OUT,
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [frame, placed, x]);

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: placed.get() ? 1 : 0,
    transform: [{ translateX: x.get() }],
  }));

  return (
    <View
      accessibilityRole="tablist"
      className="absolute left-2 right-2 h-19 flex-row rounded-full border border-border p-1.5 shadow-floating"
      style={{ bottom: insets.bottom + TAB_BAR_GAP }}
    >
      {/* Frosted glass: the screens blurred behind a white tint. Clipped in its own layer so
          the bar keeps its shadow. The blur is static; never animate its intensity. */}
      <View className="absolute inset-0 overflow-hidden rounded-full">
        <BlurView
          blurTarget={blurTarget}
          blurMethod="dimezisBlurViewSdk31Plus"
          tint="light"
          intensity={50}
          style={StyleSheet.absoluteFill}
        />
      </View>
      {/* Absolute and childless, so sliding it never re-lays-out the tabs. Plain Reanimated
          (not AnimatedView): styled() would read the animated style during render. */}
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      {tabs.map((tab, index) => (
        <TabFrame
          key={tab.name}
          onFrame={(layout) =>
            setFrames((current) => {
              const next = [...current];
              next[index] = layout;
              return next;
            })
          }
        >
          {(children as ReactNode[])[index]}
        </TabFrame>
      ))}
    </View>
  );
}

const styles = {
  screens: { flex: 1 },
  indicator: {
    position: "absolute",
    left: 0,
    top: TAB_BAR_PADDING,
    width: TAB_INDICATOR_SIZE,
    height: TAB_INDICATOR_SIZE,
    borderRadius: TAB_INDICATOR_SIZE / 2,
    backgroundColor: colors.primary,
  },
} as const;

/** Measures one tab's frame within the bar. */
function TabFrame({
  children,
  onFrame,
}: {
  children: ReactNode;
  onFrame: (frame: LayoutRectangle) => void;
}) {
  return (
    <View className="flex-1" onLayout={(e) => onFrame(e.nativeEvent.layout)}>
      {children}
    </View>
  );
}

type TabButtonProps = TabTriggerSlotProps & {
  label: string;
  icon: LucideIcon;
  fillable: boolean;
};

function TabButton({
  label,
  icon,
  fillable,
  isFocused = false,
  style: _slotStyle,
  ...props
}: TabButtonProps) {
  return (
    <PressableScale
      {...props}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      className="h-16 items-center justify-center gap-0.5"
    >
      <Icon as={icon} size={24} filled={fillable && isFocused} />
      <Text variant="label">{label}</Text>
    </PressableScale>
  );
}
