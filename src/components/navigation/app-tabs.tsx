import { NativeTabs } from "expo-router/unstable-native-tabs";

import { colors, typography } from "@/theme";

/**
 * iOS and web: the system tab bar (liquid glass on iOS 26+). Android uses the
 * custom bar in app-tabs.android.tsx, since native Android tabs can't take
 * the design's shapes. Tab switches never animate.
 */
export function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={colors.surface}
      // iOS tints the active tab; yellow on glass is unreadable, so it uses foreground.
      tintColor={colors.foreground}
      labelStyle={{
        default: { ...typography.label, color: colors.foreground },
        selected: { ...typography.label, color: colors.foreground },
      }}
    >
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search">
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="trips">
        <NativeTabs.Trigger.Icon sf="calendar" md="calendar_month" />
        <NativeTabs.Trigger.Label>Trips</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf={{ default: "person", selected: "person.fill" }} md="person" />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
