import { NativeTabs } from "expo-router/unstable-native-tabs";
import { Platform } from "react-native";

import { colors, typography } from "@/theme";

/**
 * The platform's own tab bar: Material 3 on Android (yellow indicator behind
 * the active icon), the system bar on iOS. Tab switches never animate.
 */
export default function TabsLayout() {
  return (
    <NativeTabs
      backgroundColor={colors.surface}
      // iOS tints the active tab; yellow on glass is unreadable, so it uses foreground.
      tintColor={colors.foreground}
      indicatorColor={colors.primary}
      iconColor={
        Platform.OS === "android" ? { default: colors.foreground, selected: colors.onPrimary } : undefined
      }
      labelStyle={{
        default: { ...typography.label, color: colors.foreground },
        selected: { ...typography.label, color: colors.foreground },
      }}
      labelVisibilityMode="labeled"
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
