# 06 · Onboarding

Status: done

## Goal

A first-time guest opens Roam and sees three swipeable onboarding slides that match `prompt-imgs/onboarding.png`. "Get started", "Continue with Google" and "Skip" take them into the auth flow, which is a stubbed sign-up and sign-in pair until the Clerk plan builds it.

## Decisions

- **Three slides.** Slide 1 uses the design's copy exactly. Slides 2 and 3 reuse its layout with new copy and photos (written here, approved by the user).
- **Slides change by swiping and auto-advance every 5 s.** Auto-advance stops for good once the guest drags, and never starts when Reduce Motion is on. After the last slide it wraps to the first.
- **"Get started", "Continue with Google" and "Skip" all open `/sign-up`** from any slide (02: Skip goes to auth, not into the app). Google sign-in itself comes with Clerk.
- **Auth screens are stubs** in an `(auth)` stack group: `sign-up` and `sign-in`, each with a back button, the small wordmark, the auth.png title, a muted "coming soon" line and a link to the other screen. The full auth.png UI is built in the auth plan.
- **Onboarding is the `/` route**: `src/app/(onboarding)/index.tsx` replaces `src/app/index.tsx`. The temporary "View design system" button goes away; `/design-system` stays reachable by deep link. No "seen onboarding" flag is stored; the auth plan decides the redirect once sessions exist.
- **Photos are remote Unsplash images** rendered with `expo-image` (already installed), `contentFit="cover"`, with a short cross-fade and `cachePolicy="memory-disk"`. URLs use `?w=1200&q=80&fm=jpg&fit=crop`. Each was checked to return 200:
  1. `photo-1510798831971-661eb04b3739`: lit lakeside cabin in snowy pines.
  2. `photo-1564013799919-ab600027ffc6`: white villa with pool.
  3. `photo-1542718610-a1d656d1884c`: cabin at sunset.
- **Google "G" logo**: the official multicolor mark from Google's sign-in branding guidelines, saved as `assets/brand/google-g.svg` and rendered by `components/ui/GoogleLogo` with the same paths through `react-native-svg` (no SVG transformer dependency).
- **No new dependencies.** The pager is a horizontal `FlatList` with `pagingEnabled`. The sheet's curved top is a `react-native-svg` path.
- **This screen uses a 24 gutter (`px-6`), not `px-5`.** The design's wordmark, pill and buttons all sit about 24 from the edge.

### Slide copy

| # | Location pill | Title | Body |
|---|---|---|---|
| 1 | Whistler, BC | Find a stay that fits your story | From mountain cabins to oceanfront villas, roam helps you find unforgettable stays for every kind of trip. |
| 2 | Malibu, CA | Say it the way you'd say it | Describe your trip in one sentence, like "quiet pet friendly cabin with a hot tub under $300 a night", and roam ranks the stays that fit. |
| 3 | Lake Tahoe, CA | Answers straight from the source | Ask about pets, check-in or cancellations and see the stay's own policy, word for word. |

### Design spec

Measured from the image at about 0.62 px per dp (393 dp wide). Values marked * are estimates.

| Element | Spec | Tokens |
|---|---|---|
| Photo | Fills the page edge to edge, behind the status bar and the sheet's curve | — |
| Status bar | Dark content | `expo-status-bar` `style="dark"` |
| Wordmark | Top left, `insets.top + 12`*, left 24 | `Wordmark size="lg"` |
| Skip | Pill 44 high*, 20 horizontal padding, top right aligned with the wordmark | `bg-glass`, `callout` text |
| Location pill | 40 high*, 16 horizontal padding, 8 gap, 20* above the sheet, left 24. Filled `map-pin` 16, white | new `bg-scrim` + 1px new `border-glass-border`, `caption` `inverse` text |
| Sheet | White, fills to the bottom. Top edge: 32 radius at the left, then a smooth curve falling 48* to the right edge | `surface` |
| Progress | Three bars 32 × 6*, 8 gap, fully rounded. Active lavender, inactive grey | `bg-secondary`, `bg-border` |
| Title | 36 / 39, tracking -1*, ExtraBold. 20 below the progress bars | new `hero` text token and `Text` variant |
| Body | 12 below the title | `body` variant, `muted` tone |
| Get started | 20 below the body. Full width, trailing `arrow-right` | `Button variant="primary"` (56 high) |
| Continue with Google | 12 below. Full width, leading Google G (22) | `Button variant="secondary"` |
| Bottom | `insets.bottom + 16`* below the last button | — |

Differences kept on purpose, to stay on the design system:

- The design's buttons are about 50 high; `Button md` is 56.
- The design's yellow reads more orange than `primary` #FFC629.
- The design's body line height is about 20; `body` is 24.
- The active bar reads a little deeper than `secondary` #C9B4FF.

### Proposed new tokens

| Token | Value | Use |
|---|---|---|
| `--text-hero` | 36px, line height 1.0833 (39), tracking -1px | Onboarding titles. Paired with `font-display-heavy` in a new `hero` `Text` variant |
| `--color-scrim` | rgb(11 11 26 / 0.45) | Dark glass pills over photos |
| `--color-glass-border` | rgb(255 255 255 / 0.35) | Hairline on glass pills over photos |

Both colors are mirrored in `src/theme/colors.ts`.

## Out of scope

- Clerk, Google sign-in and the real auth.png screens (roadmap step 3).
- Remembering that onboarding was seen, and redirecting signed-in guests.
- The tab shell and the other app-shell routes from 02 step 1.
- Haptics and parallax on swipe.

## Steps

### 1. Tokens and primitives

In `src/global.css` `@theme`, add `--text-hero` (with its `--line-height` and `--letter-spacing`), `--color-scrim` and `--color-glass-border` as above. Mirror the colors in `src/theme/colors.ts` as `scrim` and `glassBorder`. Add `hero: "font-display-heavy text-hero"` to the `Text` variants.

Add `assets/brand/google-g.svg` (the official four-color G, 48 × 48 viewBox). Add `src/components/ui/google-logo.tsx`: a `GoogleLogo` with a `size` prop (default 22) that renders the same four paths with `react-native-svg`, marked `accessible={false}`. Export it from `components/ui/index.ts`.

Done when `/design-system` still renders and type check passes.

### 2. Routes

- Delete `src/app/index.tsx`.
- Add `src/app/(onboarding)/_layout.tsx`: a `Stack` with `headerShown: false`.
- Add `src/app/(auth)/_layout.tsx`: a `Stack` with `headerShown: false` and a `surface` content background.
- Add `src/app/(auth)/sign-up.tsx` and `sign-in.tsx` stubs, in a `SafeAreaView` with `px-5`:
  - A header row with `IconButton` (`chevron-left`, label "Back") calling `router.back()` and `Wordmark size="sm"` on the right.
  - The title as `hero` (auth.png's heading is about 36 heavy): "Create your account" or "Welcome back".
  - A `muted` body line: "Sign-up is coming soon." or "Sign-in is coming soon."
  - A link to the other screen ("Already have an account? Sign in" / "New to roam? Create an account"), using `router.replace`.
- In `src/app/_layout.tsx`, give the root `Stack` `headerShown: false` for the `(onboarding)` and `(auth)` groups only, so `/design-system` keeps its header.

Done when `/`, `/sign-up` and `/sign-in` open by deep link.

### 3. Onboarding screen

Put screen parts in `src/components/onboarding/`:

- `slides.ts`: the three slides (id, photo URL, location, title, body) from the copy table.
- `sheet-curve.tsx`: an `Svg` the page width wide and 48 high, filled `colors.surface`. Path: start at the bottom left, rise to a 32 radius corner at the top left, then a cubic curve that falls to the bottom right. It sits right on top of the white sheet, so the two read as one shape.
- `progress-bars.tsx`: three bars, `bg-secondary` for the active index and `bg-border` otherwise. `accessibilityRole="progressbar"` with "Slide N of 3".
- `onboarding-slide.tsx`: one page, the full window width. An absolutely positioned `expo-image` fills the page. A `flex-1` spacer holds the location pill at its bottom left. Below it come the curve, then the sheet (`bg-surface px-6`) with the progress bars, title and body.

`src/app/(onboarding)/index.tsx`:

- A horizontal `FlatList` of slides with `pagingEnabled`, no scroll indicator, `getItemLayout`, and the active index taken from `onMomentumScrollEnd`.
- A footer outside the pager (`bg-surface px-6 pt-5`, bottom padding `insets.bottom + 16`, `gap-3`) holding "Get started" and "Continue with Google". Both `router.push("/sign-up")`.
- An absolutely positioned top overlay at `insets.top + 12`, `px-6`, with `Wordmark size="lg"` and the Skip pill (a `Pressable` with `accessibilityRole="button"`, `active:opacity-80`). Skip also pushes `/sign-up`.
- Auto-advance with a 5 s interval that calls `scrollToIndex` on the next slide, wrapping to the first. Clear it on `onScrollBeginDrag` and on unmount. Skip it when Reanimated's `useReducedMotion()` is true.
- `StatusBar style="dark"`.

Done when the slides swipe, auto-advance, and each button opens sign-up.

### 4. Visual check

Run `npx expo start --clear` and open `/` in Expo Go on the Android phone. Capture slide 1 with `adb exec-out screencap -p > <scratchpad>/onboarding-1.png`, then swipe with `adb shell input swipe` and capture slides 2 and 3. Compare slide 1 element by element with the design spec. List every difference, fix, and repeat. Deep link `/sign-up` and capture it too.

## Verification

- `npx tsc --noEmit` and `npx expo lint` pass.
- `npx expo export --platform android` succeeds.
- On the phone:
  - Slide 1 matches the design, with each remaining difference listed.
  - Swiping moves the pages and the progress bars follow.
  - Auto-advance runs and stops after a drag.
  - Get started, Google and Skip each open sign-up, and back returns to the same slide.
  - The links switch between sign-up and sign-in.
- Photos still load after a restart (from cache), and the screen stays readable while a photo loads (no blank sheet).
- End to end: a fresh launch opens onboarding, the guest swipes to slide 3, taps Get started, lands on "Create your account", taps "Sign in", then taps back to return to onboarding.

## AGENTS.md updates

Under **Styling**:
- Photos come from remote URLs through `expo-image` until stays come from Sanity.
- Third-party brand marks (such as the Google G) live in `assets/brand/` and render through an SVG path component in `components/ui`.

Add an **App structure** line (or fold it into Expo):
- `/` is onboarding in the `(onboarding)` group. Auth lives in the `(auth)` group (`/sign-up`, `/sign-in`). Onboarding's CTAs and Skip all go to `/sign-up`.

## Result

Done. Onboarding is the `/` route with three swipeable, auto-advancing slides, and every button leads to the stubbed `(auth)` group. Checked on the Android phone (SM-A075F, 360 dp wide) in Expo Go.

- **Fixed after the visual check:**
  - Slide 3 showed the wrong photo (an aerial beach); it now uses `photo-1542718610-a1d656d1884c`.
  - The auth stub titles used `display` (56), which was far larger than auth.png. They now use `hero`.
- **Verified on the phone:** slide 1 layout, slide 2, slide 3, swipe, auto-advance, Get started → sign-up, the Sign in link, and the back button returning to the same slide.
- **Not verified on the phone:** taps on Skip and Continue with Google, and the hardware Back key. The phone was in use during the check and those taps landed in another app. They call the same handler as Get started.
- **Remaining differences from the design, by eye:**
  - The wordmark is about 8% wider than the design (`lg` is 36 high; the design is about 33).
  - The filled Lucide `map-pin` is solid, with no dot.
  - The body line height is 24 (design about 20), the buttons are 56 high (design about 50), and the yellow is the token, not the design's more orange tone. All three were kept on purpose (see Decisions).
  - Titles wrap differently on a 360 dp phone than on the 393 dp mockup.
- **Estimated from the image:** every value marked * in the spec, the curve shape, and the hero size.
- **Photos load over the network on first launch,** so a slide shows the `surface-muted` fill for a moment until its photo arrives.
- **Typed routes:** hot reload on Windows wrote a stale `.expo/types/router.d.ts`, which failed `tsc`. A clean dev-server start fixed it (noted in AGENTS.md).
