# Roam

Expo React Native rental app. Guests describe a stay in one sentence ("quiet pet friendly cabin with a hot tub under $300 a night") and get ranked stays back. They can also ask booking and policy questions about a stay, answered with exact text from Roam's own content.

This file is the project's memory: it holds every decision that is still true. Plans in `prompts/` are history.

## Commands

```bash
npx expo install <package>  # ALWAYS use instead of npm install: resolves SDK-compatible versions
npx expo start              # dev server (open in Expo Go on the Android phone)
npx expo lint               # lint
npx tsc --noEmit            # type check
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
npx eas-cli@latest <cmd>    # EAS builds, submits, and updates (use instead of bare `eas`)
```

## Expo

- Expo ships breaking changes every SDK release, so don't trust memory. Before touching an Expo, EAS, or React Native API, check the `expo` major version in `package.json` and read `https://docs.expo.dev/versions/v<major>.0.0/`. For anything else, start from https://docs.expo.dev/llms.txt and follow its links.
- Routes live in `src/app/`: every file is a screen and `_layout.tsx` files define navigators. API routes are `src/app/api/*+api.ts`. Keep components, hooks, and utils outside `src/app/`.
- `/` is onboarding in the `(onboarding)` group. Auth lives in the `(auth)` group (`/sign-up`, `/verify-email`, `/sign-in`). Onboarding's buttons and Skip all go to `/sign-up`.
- Routes are gated with `Stack.Protected` in the root layout: `(onboarding)` and `(auth)` only while signed out, app routes (`/home` for now) only while signed in. Signing in or out changes the session; the guard does the navigation, so screens never route after auth.
- If `tsc` reports a valid route as missing or lists component files as routes, the typed-routes file went stale during hot reload: delete `.expo/types/router.d.ts` and ask the user to restart their dev server.
- Use the user's running dev server (usually port 8081) for phone checks; never start another one. Before every adb tap, confirm Expo Go is in the foreground, and only type when the keyboard is up.
- `ios/` and `android/` are generated. Never create or edit them by hand; configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. The app runs in Expo Go today. After adding a library that Expo Go doesn't include, switch to a development build (`npx eas-cli@latest build --profile development --platform android`).

## Styling

- NativeWind v5 RC (`nativewind` + `react-native-css`) and Tailwind 4.1.12 are pinned exact, with a `lightningcss` override in `package.json`. Upgrade them together, following the NativeWind upgrade guide, never one at a time.
- Style with `className`. After CSS or Metro config changes, or after installing a package, restart with `npx expo start --clear`.
- Tokens live only in the `@theme` block in `src/global.css`. Tailwind's defaults are reset, so add a token there before using a new value. Never hardcode hex, font size, or spacing in components.
- rem is 16 on every platform, and spacing follows the 4pt Tailwind scale. The screen gutter is `px-5`.
- Line-height tokens are unitless ratios. NativeWind multiplies `var()`-based line heights by the font size on native.
- Weight comes from the font family (`font-body*`, `font-display*`), never `font-bold` or `fontWeight`. Fonts load at runtime with `useAppFonts` while the app runs in Expo Go.
- Build screens from `src/components/ui`. Text renders through `Text`. A component's `className` is for layout only; color comes from its `variant` and `tone` props.
- Icons are Lucide, rendered through `Icon` and imported one icon at a time (`lucide-react-native/icons/<name>`), never from the package index.
- `src/theme/colors.ts` mirrors the colors for props that can't take a class. Update it whenever `global.css` colors change.
- The app is light-only (`userInterfaceStyle: light`).
- The logo is `components/ui/Wordmark` (`size` `sm` or `lg`, `tone` `default` or `inverse`). Never set "roam" in a text style. `assets/brand/roam-wordmark.svg` and `wordmark-path.ts` are generated from Urbanist Black by `scripts/generate-wordmark.mjs`; edit the script and rerun it, never the outputs.
- Third-party brand marks (such as the Google G) live in `assets/brand/` and render through an SVG path component in `components/ui` (`GoogleLogo`). Their colors stay with the paths, not in tokens.
- Photos render through `expo-image` from remote URLs (Unsplash placeholders until stays come from Sanity).

## Who owns what

Each tool has one job. Ask before moving a responsibility to a different tool.

- **Auth:** Clerk is the source of truth. The app keeps its own custom auth screens. Set Clerk up through the Clerk CLI and use the Clerk MCP for current Expo patterns. Until then, auth is mocked in `src/lib/auth/mock-auth.ts` (code `424242`, demo `guest@roam.dev` / `password123`) behind `useAuth()`. Screens use only `useAuth()`, so Clerk replaces that module, not the screens.
- **Content:** Sanity (properties, hosts, policies, house rules). Studio is a standalone app in `studio/`. Schema deploys and content changes go through the Sanity MCP, and generated property copy uses Agent Actions.
- **Exact constraints** (price, guests, type, amenities, pets, place): GROQ filters, with values always passed as params.
- **Soft intent** (quiet, cozy, secluded): Dataset Embeddings via `text::semanticSimilarity()` inside `score()`.
- **Policy knowledge:** a Sanity Context endpoint in Knowledge Base mode. Context endpoints are created in the Dashboard's Context app and read with an organization token (Context Viewer), per https://www.sanity.io/docs/ai/context-migration-guide. One endpoint serves one mode. The Context skill still describes `sanity.agentContext` Studio documents with a project token; that route is deprecated, so don't use it.
- **Typed decisions** (which stay topics and policies answer a question): Jev, called from API routes through the AI SDK's `experimental_evaluate` with the `@ai-sdk/typesafe-ai` provider and `TYPESAFE_AI_API_KEY`. No Vercel AI Gateway. Keep `ai` and `@ai-sdk/typesafe-ai` pinned to exact versions, since the API is experimental.
- **Answer text:** none generated. Answers show the stay's own fields and policy text word for word, with their source. No LLM runs in the app.
- **Analytics:** PostHog, identified through Clerk.

## Rules

- Secret keys (Clerk secret key, TypeSafe key, Sanity organization token, Sanity write token) never reach the app bundle. Use them only in API routes and local scripts such as seeding. Never put them behind `EXPO_PUBLIC_`, which is bundled into the app. Never commit `.env`. Keep variable names, without values, in `.env.example`.
- Sanity Context needs a deployed Studio for the dataset. Redeploy Studio from `studio/` after schema changes.
- Jev is not an agent. It answers typed questions (Choice, Noul, Score) with probabilities. It never writes GROQ, calls tools, or generates text. Code builds queries from its answers.
- Prices, guest counts, and dates are parsed in code. Jev may choose between candidates code found, but never produces the value.
- Embeddings rank, they don't filter, and they only see the document itself (no references). Hard constraints are always GROQ filters, and text that should affect ranking lives on the property document.
- Policy answers show only text from the stay's data and Roam's policies, word for word. If nothing answers the question, say so and point to support.
- API routes verify the Clerk session before doing any work.
- PostHog failures never block the app. Never send what guests type, tokens, or personal data in events.
- Let Sanity generate document IDs. Model relationships as references.
- Ask before adding a dependency or service, changing the Sanity schema once content exists, or deleting data. Prefer Expo modules over third-party libraries.
- Whenever you need input from the user, ask through your tool's built-in question panel so they pick from options instead of typing. Give two to four clear options with the recommended one first. Fall back to plain text only if no such panel exists.

## How we build features

For a new feature or a change across several files. Small fixes and questions skip this.

1. **Understand.** Read the code involved. Open an earlier plan only if this feature builds directly on it (pick by file name). Read the current docs pages for the APIs you'll use, and load a matching skill if one exists (e.g. the Expo, Clerk, Sanity, Sanity Context, or TypeSafe skills). Don't write version-specific APIs from memory.
2. **Ask.** If a real decision is unclear (scope, visible behavior, data shape), ask in the question panel, batching questions into one round and following up only if the answers raise new ones. Pick defaults for the rest and list them. If a decision in this file looks wrong, raise it instead of changing it.
3. **Plan.** Copy `prompts/TEMPLATE.md` to `prompts/NN-feature-name.md` (next number) and fill it in. The plan must be self-contained, so a fresh session can build it from this file plus the plan alone.
4. **IMPORTANT: stop and wait.** Write no app code until the user approves the plan. Ask for approval in the question panel (approve, or request changes). If they request changes, update the plan and ask again. On approval, set `Status: approved`.
5. **Build** step by step, checking each one. If a step turns out wrong, stop and explain instead of redesigning.
6. **Close out.**
   - Run the plan's Verification and give the report described under Reporting.
   - Add a short `## Result` to the plan and set `Status: done`.
   - Update this file: put each lasting decision in the section it belongs to. Replace or remove rules that are no longer true instead of appending. Keep this file under 150 lines.

## Building from designs

Designs are attached in the chat. Screens must match them exactly: layout, spacing, sizes, colors, type, radii, icons, and copy.

- Icons, fonts, and brand images come from `assets/` or the chosen icon library, never recreated from a screenshot. Sample property photos may be remote placeholder images. If an asset is missing, use a marked placeholder and list it.
- Map every color, font, spacing value, and radius to a design-system token. List values with no token in the plan as proposed new tokens instead of hardcoding them. When creating the design system itself, derive the tokens from the designs.
- UI plans describe the design (elements, states, tokens, assets) well enough to build without the image. If building in a new session, ask for the design to be attached again.
- After building, open the screen in Expo Go on the user's Android phone, connected over USB with debugging on. When it isn't the first screen, deep link with `adb shell am start -a android.intent.action.VIEW -d "<expo-go-url>/--/<path>"`. Take a screenshot with `adb exec-out screencap -p > <path>` and compare it with the design. List every difference, fix, and repeat. Report which values were estimated from an image.
- Development is on Windows, so there's no local iOS simulator. Check iOS on the EAS cloud simulator before releases.

## Reporting

End every piece of work that changes code (features and fixes, not answers to questions) with this report. Use these headings in this order, and leave out any section that would be empty.

- **Done:** one line on the outcome, then the files changed and what changed in each.
- **Verified:** each check with ✅ or ❌ and its evidence (command output, screenshot). List what wasn't checked as ❌ with the reason. Never mark something ✅ without running it.
- **You need to:** numbered actions only the user can take, such as keys, dashboard settings, manual steps in Sanity, or assets to provide.
- **Test it yourself:** numbered steps to reproduce the result from a fresh start, ending with `Expected:` and what the user should see.
- **Notes:** defaults picked, trade-offs, and anything left for later.

## Checks

- Lint and type check pass before any task is called done.
- Screens that load data handle loading, error, and empty states.
- AI features are tried against realistic inputs, and failures are explained by cause: missing data, the decision Jev made, the query, or the code.
