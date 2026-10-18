# 03 · NativeWind

Status: done

> Written retroactively. The setup was built and committed (`ee4629c`) without a plan, which broke the workflow in AGENTS.md. This file records what was built so later plans can rely on it.

## Goal

Style every screen with Tailwind classes (`className`) on iOS, Android and web, using NativeWind v5. Setup follows https://www.nativewind.dev/v5/getting-started/installation.

## Decisions

- NativeWind v5 release candidate: `nativewind@5.0.0-rc.0` with `react-native-css@3.1.0-rc.0`, pinned exact. The docs say the two must be installed together and never with an unpinned engine.
- The RC is tested against Expo 57.0.22, RN 0.86.3, React 19.2.3, Reanimated 4.5.1 and Worklets 0.10.1, which matches this project. The docs mark it not for production, so revisit before release.
- Tailwind v4 dev dependencies are pinned exact: `tailwindcss@4.1.12`, `@tailwindcss/postcss@4.1.12`, `postcss`, `lightningcss@1.30.1`.
- `package.json` has `"overrides": { "lightningcss": "1.30.1" }`. Without it, global.css can fail with deserialization errors.
- The NativeWind packages went in with `npm install --save-exact`, as the NativeWind docs specify, not with `npx expo install`. Expo only selects the native peers: reanimated, worklets, safe-area-context, expo-system-ui.
- `src/global.css` uses the split Tailwind imports (theme, preflight, then unlayered utilities), not `@import "tailwindcss"`. This keeps React Native Web defaults from overriding utilities.
- The CSS is imported once, in `src/app/_layout.tsx`.
- `nativewind-env.d.ts` sits at the root, holds the `react-native-css/types` reference, and is listed in tsconfig `include`. NativeWind manages this file, so don't edit it.
- There is no Babel config and no `tailwind.config.js`. Those were v4 setup.

## Out of scope

- Design tokens and shared components (see 04-design-system).
- Dark-mode theming.

## Steps

### 1. Install packages

Run `npm install --save-exact nativewind@5.0.0-rc.0 react-native-css@3.1.0-rc.0`.

Then run `npx expo install react-native-reanimated react-native-worklets react-native-safe-area-context expo-system-ui`.

Then run `npm install --save-dev --save-exact tailwindcss@4.1.12 @tailwindcss/postcss@4.1.12 postcss lightningcss@1.30.1`.

Add `"overrides": { "lightningcss": "1.30.1" }` to `package.json` and run `npm install`.

Done when `npm ls nativewind react-native-css lightningcss tailwindcss` shows exactly those versions, with lightningcss marked "overridden".

### 2. Config files

Create `postcss.config.mjs` with the content below. Use the `.mjs` name: Expo doesn't discover `.cjs`.

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

Create `metro.config.js`:

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = withNativewind(config);
```

Create `src/global.css`:

```css
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";

@import "nativewind/theme";
```

Create `nativewind-env.d.ts` with `/// <reference types="react-native-css/types" />`.

`app.json` must keep `"userInterfaceStyle"` set. It was `automatic` at the time.

### 3. Wire up and smoke test

Add `import "@/global.css";` at the top of `src/app/_layout.tsx`.

Convert `src/app/index.tsx` to use `className`, for example `flex-1 items-center justify-center bg-white` with `text-xl font-bold text-blue-500`.

Run `npx expo start --clear` once. That adds `nativewind-env.d.ts` to the tsconfig `include` list.

## Verification

- `npx tsc --noEmit` passes.
- `npx expo lint` passes.
- `npx expo export --platform web --platform android` bundles both platforms.
- The web CSS contains generated utilities, for example `.text-blue-500{color:var(--color-blue-500)}`.
- End to end: the home screen renders centered, styled text on iOS. This was never checked on a device or simulator.

## AGENTS.md updates

Under a new **Styling** section:

- NativeWind v5 RC (`nativewind` + `react-native-css`) and Tailwind 4.1.12 are pinned exact, with a `lightningcss` override. Upgrade them together, following the NativeWind upgrade guide, never one at a time.
- Style with `className`. After CSS or Metro config changes, restart with `npx expo start --clear`.

## Result

The NativeWind v5 RC is installed and configured as above, committed in `ee4629c`. Type check, lint, and the web and Android exports passed. It has not been checked on a device or simulator. Later work replaced the smoke-test screen and the default palette (see 04-design-system).
