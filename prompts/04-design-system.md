# 04 · Design system

Status: done

> Steps 1–4 were built before this plan existed, which broke the workflow. The plan was written afterwards, approved, and then steps 5–7 were built.

## Goal

Every screen draws from one set of tokens and a small set of shared components that match the Roam design system reference: colors, type, spacing, radii, shadows, buttons, chips, fields and badges. Screens use components and never repeat raw values.

## Decisions

- **Tokens live in `src/global.css` as a Tailwind v4 `@theme` block.** This is the NativeWind idiom (03-nativewind), so there is no separate `theme.ts` token file.
- **Default Tailwind tokens are reset** with `--color-*`, `--text-*`, `--radius-*`, `--shadow-*` and `--font-weight-*` set to `initial`. Only Roam tokens exist, so `text-blue-500` or `font-bold` generates nothing.
- **rem is pinned to 16px** (`:root { font-size: 16px }`). NativeWind's native default is 14, which made `p-4` 14 on native and 16 on web. Spacing uses Tailwind's 4pt scale (`p-1` = 4, `p-4` = 16, `p-5` = 20).
- **Typeface: Urbanist**, a placeholder pick. The reference says only "Geometric Sans", and Urbanist was the closest match judged from the logo and headings. Static TTFs (Regular, Medium, SemiBold, Bold, ExtraBold) live in `assets/fonts/`, each named after its PostScript name so one family string works on iOS, Android and web. The OFL license is included.
- **Fonts load at runtime on every platform.** You test in Expo Go, which can't use the `expo-font` config plugin. `useFonts` runs in the root layout, and the splash screen stays up on native until the fonts load. Web never blocks, so static rendering still works. Move to the config plugin once the app uses dev builds.
- **Weight comes from the family, never `fontWeight`.** Utilities: `font-body` (Regular), `font-body-medium`, `font-body-semibold`, `font-display` (Bold), `font-display-heavy` (ExtraBold).
- **Light mode only.** Every design is light, so `app.json` `userInterfaceStyle` changed from `automatic` to `light`. Dark mode would be a later plan that overrides the color variables.
- **Tailwind scans `src/` only** (`source(none)` + `@source "./"`), so docs and skill files don't generate classes.
- **A JS color mirror**, `src/theme/colors.ts`, exists only for props that can't take a class: icon `tintColor`, `ActivityIndicator`, `selectionColor`, Reanimated. global.css stays the source of truth.
- **Component `className` is for layout only.** NativeWind resolves conflicting classes by stylesheet order, not string order, so colors are chosen through `variant` and `tone` props. `cn()` in `src/lib/cn.ts` only joins classes; there is no tailwind-merge.
- **Icons: Lucide** (`lucide-react-native` + `react-native-svg`, approved), because it matches the rounded outline icons in the designs. Every icon goes through `components/ui/Icon`.
- **Visual check: your Android phone over adb.** Screenshots are taken with `adb exec-out screencap -p` while the app runs in Expo Go, and iOS is checked on the EAS cloud simulator before releases. This replaces the iOS-simulator rule in AGENTS.md.

### Tokens

Values marked * were sampled from the image, not given on the palette. Please confirm them.

| Token | Value | Use |
|---|---|---|
| `primary` | #FFC629 | Primary actions, active states, rating stars |
| `primary-soft`* | #FFF6DA | "Guest favorite" badge |
| `on-primary` | #0B0B1A | Text on yellow |
| `secondary` | #C9B4FF | Selected filter chip, highlights |
| `secondary-soft`* | #F3EEFF | Policy cards, focused field fill |
| `secondary-strong`* | #6A4CF5 | Policy icons, chevrons, focused field border |
| `foreground` | #0B0B1A | Headings, primary text |
| `muted-foreground` | #6B7280 | Body/secondary text |
| `placeholder`* | #9CA3AF | Input placeholders |
| `surface` | #FFFFFF | Cards, sheets, modals |
| `surface-muted` | #F4F5F7 | App background, inputs, chips, icon buttons |
| `border` | #E5E7EB | Dividers, borders |
| `glass` | rgba(255,255,255,0.7) | Tab bar, glass surfaces |
| `success` / `success-soft`* | #1F9D55 / #E7F6ED | Success alert, "New" badge |
| `danger` / `danger-soft`* | #E5484D / #FDECEE | Error alert, "20% off" badge |
| `info` / `info-soft`* | #3B5BDB / #EAEFFF | "Superhost" badge |

Each type style is set by the family + size class pair the `Text` component applies:

| Style | Size / line height / tracking | Font |
|---|---|---|
| `display` | 56 / 56 / -1.5 | Bold |
| `title` | 30 / 36 / -0.6 | Bold |
| `headline` | 20 / 26 / -0.2 | Bold |
| `subhead` | 16 / 24 | SemiBold |
| `callout` | 16 / 24 | Medium |
| `body` | 16 / 24 | Regular |
| `button` | 17 / 22 | Medium |
| `caption` | 14 / 20 | Medium |
| `label` | 12 / 16 | Medium |

Radii:

| Token | Value | Use |
|---|---|---|
| `sm` | 8 | Small icon tiles |
| `md` | 12 | Alerts, thumbnails |
| `lg` | 16 | Inputs, listing images |
| `xl` | 20 | Policy cards, list groups |
| `2xl` | 24 | Listing cards, sheets |
| `3xl` | 32 | Hero media |
| `full` | — | Pills and circles: buttons, chips, badges, icon buttons |

Non-pill radii pair with `corner-squircle`, which sets `borderCurve: continuous`.

Shadows:
- `shadow-card`: 0 1 2 at 4% plus 0 4 16 at 6%.
- `shadow-raised`: 0 8 24 at 10%.
- `shadow-floating`: 0 12 32 at 14%.

All three use the ink color #0B0B1A.

Screen gutter is 20 (`px-5`).

## Out of scope

- The glass tab bar, which belongs in the app-shell plan.
- Toggle, segmented control and stepper. These use native `@expo/ui` controls and are not wrapped.
- Listing, policy and profile cards, and alerts. They become shared components once a second screen needs them.
- Dark mode.
- A brand logo asset. The "roam" wordmark is set in `font-display-heavy` until a logo file is provided.

## Steps

### 1. Tokens (built)

Write `src/global.css` with the 03 imports, but change the utilities import to `source(none)` and add `@source "./";` after `@import "nativewind/theme";`.

Add `:root { font-size: 16px; }`.

Add an `@theme` block containing every token in the tables above. Use `--text-<name>`, `--text-<name>--line-height` and `--text-<name>--letter-spacing` in px. Reset the default palettes with `initial`.

Done when an Android export with `--no-bytecode --no-minify` shows, for example, `p-5` → `padding: 20`, `text-display` → `fontSize: 56` with lineHeight 56 and letterSpacing -1.5, `corner-squircle` → `borderCurve: continuous`, and `shadow-card` → two boxShadow layers.

### 2. Fonts (built, then switched to runtime loading)

Copy the Urbanist static TTFs from `@expo-google-fonts/urbanist` (unpack them with `npm pack`; don't add the package as a dependency). Save them as `assets/fonts/Urbanist-<Weight>.ttf`.

Set `userInterfaceStyle` to `light` in `app.json`. Don't use the `expo-font` config plugin while the app runs in Expo Go.

Create `src/theme/fonts.ts`, which maps family names to `require()`s. Then create `src/hooks/use-app-fonts.ts`, which calls `useFonts(fontFiles)` and returns `ready`: always true on web, and true on native once the fonts load or fail.

In `src/app/_layout.tsx`, call `SplashScreen.preventAutoHideAsync()` at module scope, call `hideAsync()` once ready, and render nothing until then.

### 3. Primitives (built)

All primitives live in `src/components/ui/` and are exported from `index.ts`. Every one takes `className` for layout, gives pressed feedback with `active:` and handles `disabled:`.

- **`Text`:** `variant` (the type styles above) and `tone` (`default`, `muted`, `accent`, `success`, `danger`, `info`, `inverse`).
- **`Button`:** `variant` primary (yellow fill) or secondary (white, 1px `border`). `size` md is 56 high with 24 padding and `button` text; sm is 40 high with 20 padding and `caption` text. Takes `leading` and `trailing` icons; trailing is pinned to the edge so the label stays centered. Shows a spinner while `loading`. Fully rounded. Exposes accessibility role and state.
- **`IconButton`:** a circle, 56 or 44. Variants: `muted` (surface-muted), `surface` (white with `shadow-card`, for use over photos), `primary`. `accessibilityLabel` is required.
- **`Chip`:** a pill, 48 high (md) or 40 (sm). Unselected uses `surface-muted`. When selected, `selectedTone` sets the fill: `secondary` (lavender, for filters) or `primary` (yellow, for categories). Optional icon. Sets `accessibilityState.selected`.
- **`Badge`:** a pill with `caption` text. Tones: `highlight`, `success`, `danger`, `info`, `neutral`. Optional icon.
- **`TextField`:** 56 high, `rounded-lg`, `surface-muted` with a transparent border. When focused it switches to `secondary-soft` fill with a `secondary-strong` border. Has `leading` and `trailing` slots and uses `placeholder:text-placeholder`.

### 4. Preview route (built)

Create `src/app/design-system.tsx`, which renders every token and primitive in the reference sections: typography, buttons, inputs, chips, badges, surfaces.

Point `src/app/index.tsx` to it with a temporary button until the app shell exists.

### 5. Labeled field variant

The auth design shows two-line fields: a 16 Medium label above a placeholder, about 72 high. Add a `label` prop to `TextField`. When it's set, stack the label (the new `callout` style: 16 Medium, `foreground`) over the input inside the same container, 72 high (`h-18`). The label also becomes the input's accessibility label.

### 6. Icon library (Lucide)

Run `npx expo install lucide-react-native react-native-svg`. Add an `Icon` wrapper in `src/components/ui/icon.tsx` that has a `size` default of 22, takes a `tone` that maps to the colors mirror, and uses stroke width 2. Replace SF Symbols in the preview route.

### 7. Visual check

Run `npx expo start` and open `/design-system` in Expo Go on the Android phone. Capture it with `adb exec-out screencap -p > <scratchpad>/ds.png`, scrolling with `adb shell input swipe` to reach each section. Compare it section by section with the reference sheet. List and fix each difference, then repeat.

## Verification

- `npx tsc --noEmit` and `npx expo lint` pass.
- `npx expo export --platform android --platform web` succeeds. The Android bundle includes the five Urbanist files, because they load at runtime.
- The Android bundle has the native style rules listed in step 1.
- The `/design-system` route renders statically on web.
- Primitives were tried: pressing a chip moves the selection, a focused field shows the lavender state, and a loading button shows a spinner and blocks presses.
- End to end: Expo Go on the Android phone shows `/design-system` in Urbanist and matches the reference sheet, with every remaining difference listed.

## AGENTS.md updates

Under **Styling**:

- Tokens live only in `src/global.css` `@theme`. Tailwind defaults are reset, so add a token there before using a new value. Never hardcode hex, font size or spacing in components.
- rem is 16 on every platform, and spacing follows the 4pt Tailwind scale. The screen gutter is `px-5`.
- Weights come from the font family (`font-body*` and `font-display*`), never `font-bold` or `fontWeight`.
- Text renders through `components/ui/Text`. Component `className` is for layout only; color comes from the `variant` and `tone` props.
- `src/theme/colors.ts` mirrors the colors for non-className props. Update it whenever `global.css` colors change.
- The app is light-only (`userInterfaceStyle: light`).
- Line-height tokens are unitless ratios. NativeWind multiplies `var()`-based line heights by the font size on native, so `56px` renders as 56 × 56.
- Icons come from Lucide through `components/ui/Icon`, imported one icon at a time (`lucide-react-native/icons/<name>`). The package index pulls in every icon, about 1,900 modules.
- Fonts load at runtime with `useAppFonts` while the app runs in Expo Go. Move to the `expo-font` config plugin with dev builds.

## Result

Done. Tokens, Urbanist fonts, the `Text`, `Button`, `IconButton`, `Chip`, `Badge`, `TextField` (with the labeled variant) and `Icon` primitives, and the `/design-system` preview route are built. They were checked on the Android phone (SM-A075F) in Expo Go.

- **Native line-height bug:** the first phone check showed headings and buttons missing on native while web looked right. Line heights written in px were multiplied by the font size. They were converted to unitless ratios, and the phone was rechecked.
- **Fixed after the visual check:**
  - The loading button no longer fades like a disabled one.
  - Badges were raised to 36 high (`h-9 px-4`) to match the reference.
- **Remaining differences from the reference, by eye:**
  - Button labels look slightly heavier in the reference render than the Medium the spec names. The spec was kept.
  - The filled Lucide `house` loses its door cut-out in the selected category chip.
  - The loading spinner captured as a dot, although its laid-out size is a normal 20dp. It may only be Android animation settings, so check it by eye.
- **Estimated from the image:** the * colors in the token table, the radii, the shadows, the badge height, and Urbanist as the typeface.
- **Not checked:** iOS, which per AGENTS.md is done on the EAS cloud simulator before releases.
