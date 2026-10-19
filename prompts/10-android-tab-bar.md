# 10 · Android tab bar from the design

Status: done

## Goal

On Android, the tab bar matches the design: a floating bar with fully rounded ends and a full-circle yellow highlight behind the active tab. iOS keeps the system `NativeTabs` bar.

## Decisions

- **Android uses a custom bar** (user's choice). `NativeTabs` on Android only exposes the indicator's color, not its shape or the bar's corners (react-native-screens `TabsAppearanceApplicator.kt`), so it can't match the design.
- **Platform split by component, not route:** `src/app/(tabs)/_layout.tsx` renders `<AppTabs />`. `src/components/navigation/app-tabs.tsx` is today's `NativeTabs` (iOS, web). `app-tabs.android.tsx` is the custom bar built on expo-router's headless tabs (`Tabs`, `TabSlot`, `TabList`, `TabTrigger` from `expo-router/ui`). Metro picks the file by platform. Routes and URLs don't change. No new dependency, and it works in Expo Go.
- **The bar floats over content.** Screens add bottom padding from a new `useTabBarInset()` hook, which returns the bar's height plus its bottom gap on Android and 0 elsewhere (`NativeTabs` already insets content). Used by Home's `ScrollView`, Search's list footer, and the Trips and Profile containers.
- **Motion** (user's choice, against the skill's 100+/day gate): the circle slides to the new tab using the skill's tab-indicator recipe: `translateX` with `withTiming` 250 ms `EASE_IN_OUT` on the UI thread, on an absolute, childless circle. Screen content still switches instantly. Reduced motion jumps instead (`ReduceMotion.System`). Each tab presses through `PressableScale` (0.97, 120 ms). No haptics.
- **Icons are Lucide**, as in the designs: `house`, `search`, `calendar`, `user`. The active icon is filled where the shape allows (`house`, `user`); `search` and `calendar` stay outlined, as `prompt-imgs/search.png` shows for Search.
- **Accessibility:** each tab has `accessibilityRole="tab"`, `accessibilityState={{ selected }}` and its label. Targets are the full tab width × 64.

### Design spec

Measured from `prompt-imgs/home.png` at about 0.572 dp per px. Values marked * are estimates.

| Element | Spec | Tokens |
|---|---|---|
| Bar | Absolute, `left-2 right-2`*, bottom `insets.bottom + 8`*. 76* high (`h-19`), `rounded-full`, `p-1.5`, `flex-row` | `bg-glass`, `shadow-floating`, 1px `border-border`* |
| Tab | `flex-1`, centered | `PressableScale` |
| Highlight | 64 circle (`size-16`)*, absolute and childless behind the tabs. Its x is the active tab's center (equal-width tabs, bar width from `onLayout`), from `usePathname()` | `bg-primary` |
| Icon | 24*, 2 above the label | `Icon`, `foreground` |
| Label | Home, Search, Trips, Profile | `Text variant="label"` |

The frosted blur comes from `expo-blur` (see Result). No new tokens.

## Out of scope

- Changing the iOS bar.
- A morphing (stretching) highlight.
- A bar that hides on scroll.

## Steps

### 1. Split the tabs by platform

- Move the `NativeTabs` from `(tabs)/_layout.tsx` into `src/components/navigation/app-tabs.tsx`. The layout renders `<AppTabs />`.
- Add `src/components/navigation/use-tab-bar-inset.ts` (returns 0) and `use-tab-bar-inset.android.ts` (bar height + `insets.bottom` + gap).

Done when iOS/web behavior is unchanged and the type check passes.

### 2. Android bar

- `app-tabs.android.tsx`: `<Tabs>` with a `<TabSlot />` filling the screen and a `<TabList asChild>` wrapping the bar view. Add 4 `TabTrigger`s (`name`, `href`, `asChild`) into a `TabButton` that reads `isFocused` and renders the highlight, icon and label from the spec.
- Apply `useTabBarInset()` in Home, Search, Trips and Profile.

Done when a phone screenshot matches the design's bar and no content hides behind it.

## Verification

- `npx expo lint` and `npx tsc --noEmit` pass.
- On the phone: take screenshots of Home, Search, Trips and Profile, each showing the circle on the right tab. Compare them with `prompt-imgs/home.png` and `search.png`. Scroll Home and Search to the end: the last card or row clears the bar. Tap each tab. The deep link `/search?q=cabins` still opens Search with chips. Home's pill still opens Search. The Profile avatar still opens Profile.
- Check that TalkBack reads each tab as "Home, tab, selected" (or not selected).

## AGENTS.md updates

- **Expo:** replace "a `NativeTabs` bar" in the tabs bullet with "`NativeTabs` on iOS; on Android a custom floating bar on `expo-router/ui` headless tabs (`components/navigation/app-tabs.android.tsx`), because native Android tabs can't take the design's shapes. Screens pad their bottom with `useTabBarInset()`."

## Result

Built and checked on the phone (Android, 360 dp) in Expo Go. Lint and the type check pass. Changes from the plan:

- **The bar is frosted with `expo-blur`** (`~57.0.3`, added at the user's request after a first pass with plain 70% `glass` let content show through behind the labels). Android blurs only what's inside a `BlurTargetView`, so `TabSlot` renders in one, and the bar's static `BlurView` (`dimezisBlurViewSdk31Plus`, `tint="light"`, intensity 60) points at it. A `glass` layer on top washed the blur out to near-white, so the blur's light tint alone does the frosting. On Android 11 and older, this method shows a plain translucent bar instead.
- **The sliding circle is a plain `Animated.View`.** Passed through `AnimatedView` (`styled()`), its `useAnimatedStyle()` was read during render, and Reanimated warned "Reading from `value` during render". The bar and tab frames are plain `View`s. The circle's size, padding and color come from `tab-bar-metrics.ts` and `colors.ts`.
- **The content inset is a `TabBarSpacer` component** (`.android.tsx` for Android, `null` elsewhere), placed last in each screen, instead of a `useTabBarInset()` hook.
- **The circle is placed without animating on first measure**, and fades in once placed, so it never slides in from the left edge. Afterwards it slides 250 ms `EASE_IN_OUT` (reduced motion: `ReduceMotion.System`).

Not verified: TalkBack readout, reduced motion on device, and how the slide feels (Expo Go isn't a performance build).
