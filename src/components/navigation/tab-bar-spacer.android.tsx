import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TAB_BAR_GAP, TAB_BAR_HEIGHT } from "./tab-bar-metrics";

/**
 * Android: the tab bar floats over content, so the end of every tab screen
 * leaves room for it. Put it last in a screen's scroll content or container.
 */
export function TabBarSpacer() {
  const insets = useSafeAreaInsets();
  return <View style={{ height: TAB_BAR_HEIGHT + TAB_BAR_GAP + insets.bottom }} />;
}
