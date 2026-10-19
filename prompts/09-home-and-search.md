# 09 · Home, Search and the tab shell

Status: done

## Goal

Signed-in guests land on a Home screen that matches the attached design (also saved as `prompt-imgs/home.png`). It shows a greeting, a one-sentence search pill, category chips, and a feed of realistic local stays. When a guest types a sentence and submits, the app switches to the Search tab, which matches `prompt-imgs/search.png` and shows ranked results. The app gets its native tab bar (Home, Search, Trips, Profile). Motion is subtle and follows the `expo-animation` skill.

## Decisions

- **Tabs are `NativeTabs`** from `expo-router/unstable-native-tabs`, in a new `src/app/(tabs)/` group with `home`, `search`, `trips`, `profile`. URLs stay `/home`, `/search`, `/trips`, `/profile`. The root guard protects `(tabs)` instead of `home`. `src/app/home.tsx` moves into the group.
- **Tab bar styling:** Android uses Material 3: `indicatorColor` primary, selected icon `onPrimary`, other icons `foreground`, labels Urbanist-Medium 12, background `surface`. iOS gets the system tab bar (liquid glass on 26+) with tint `foreground`, because yellow on glass is unreadable. Icons: `sf` house/house.fill, magnifyingglass, calendar, person/person.fill; `md` home, search, calendar_month, person. The Search tab gets no `role="search"`, so the four tabs stay equal, as designed.
- **Card taps are out of scope** (user's choice). Cards and result rows can't be tapped, and the card's chevron button is left out until the property-details plan.
- **Search parses the sentence the way the real search will** (user's choice). Code reads hard constraints from the text and filters on them: max price, guest count, stay type, pets, amenities, place. Soft words (quiet, cozy, secluded, romantic…) only change the ranking, by matching each stay's `vibes` and description. This mirrors the later GROQ filters + embeddings split, so a later plan only swaps the data source behind `searchStays()`.
- **Trips and Profile are placeholders** (user's choice). Trips shows an empty state with a "Find a stay" button. Profile shows the avatar, name, email and a Sign out button, moved from today's `/home`.
- **Search extras** (user's choice): Sort works (Best match, Price: low to high, Rating). The filters button and the heart buttons are hidden until those features exist.
- **Home → Search:** submitting the pill (arrow or keyboard "search") calls `router.navigate({ pathname: "/search", params: { q } })`. An empty pill opens Search with no query. The pill keeps its text. The tall search button beside the headline also opens Search with no query.
- **Search screen state:** `q` comes from the URL params. The search field is editable, and submitting runs `router.setParams({ q })`. Results update on submit, not per keystroke. With no query it lists every stay, best rated first.
- **Search chips are the parsed constraints** ("Cabins", "Under $300", "Pet Friendly", "Quiet"…). All start selected (lavender). Tapping one turns that constraint off (grey) and back on, and the results update. Chips scroll horizontally. A new query resets them.
- **The back button on Search** navigates to `/home`.
- **Home category chips** (All Stays, Cabins, Beach, City, Villas) filter the feed by stay type. One is always selected (yellow), and its icon is filled. They wrap onto two rows, as designed.
- **The avatar** is the Clerk profile photo when `user.hasImage`, otherwise initials on `primary`. `Session` gains `imageUrl: string | null`. Tapping the avatar opens `/profile`.
- **The greeting** is "Hey, {first name} 👋". With no first name it is "Hey there 👋".
- **The pill's example text is the placeholder** ("quiet pet friendly cabin with hot tub"), in `foreground`, as designed. Typed text is also `foreground`.
- **Local data:** 12 stays in `src/data/stays.ts` (4 cabins, 3 beach, 2 city, 3 villas, across California plus a few other US places), shaped like the future Sanity property document. Photos are remote Unsplash URLs, each checked with `curl -I` before use.
- **Loading and error states:** local search is synchronous, so neither exists yet. They arrive with the Sanity plan. The empty state is built: "No stays match all of that" plus "Try turning off a filter above."
- **No new dependencies.** Reanimated 4.5.1 is installed. No haptics, so `expo-haptics` isn't added.

### Motion

Each item passed the skill's gate (frequency, then purpose). Reduced motion keeps opacity and color changes and drops translate and scale.

| What | Tier and purpose | Implementation |
|---|---|---|
| Press feedback on `Button`, `Chip`, `IconButton`, avatar, pill arrow | Tens/day, feedback | New `PressableScale`: scale 0.97 on press-in, Reanimated CSS transition on `transform`, 120 ms, `cubicBezier(0.23, 1, 0.32, 1)`. Replaces `active:opacity-70`. `pressRetentionOffset` 16. Skipped under reduced motion. |
| Chip selected fill | Tens/day, state indication | CSS transition on `backgroundColor`, 150 ms, same curve. Colors come from `colors.ts`. |
| Home header entrance (greeting, headline, pill, chips) | Once per sign-in, delight | `FadeInDown` with a 12 px start offset, 300 ms, `EASE_OUT`, staggered 40 ms. Module-scope builders. |
| Home feed after a category change | Occasional, preventing a jarring change | Cards (a mapped list in a `ScrollView`, not virtualized) use `FadeIn` 180 ms in and `FadeOut` 120 ms out, and `LinearTransition` 220 ms `EASE_IN_OUT` closes the gaps. |
| New search results | Asked-for content, spatial consistency | The list container is keyed by the submitted query. It fades in and rises 8 px in 220 ms `EASE_OUT`. No `entering` on `FlatList` rows. |
| Sort or chip toggle reorders rows | Occasional, spatial consistency | `Animated.FlatList` with `itemLayoutAnimation={LinearTransition.duration(250).easing(EASE_IN_OUT)}`. |
| Sort menu | Occasional, spatial consistency | An inline menu under "Sort by". It enters with fade plus scale 0.96→1 from the top right in 180 ms `EASE_OUT`, and exits in 140 ms. The chevron rotates 180° (CSS transition, 200 ms). A full-screen `Pressable` behind it closes it. |
| Tab switches | 100+/day | **No animation.** The native tab bar's default. |

### Design spec

Measured at about 0.572 dp per image px (home) and 0.547 (search). Values marked * are estimates.

**Home**

| Element | Spec | Tokens / components |
|---|---|---|
| Screen | `bg-surface`, `px-5`, top `insets.top + 8`*. Vertical `ScrollView`, bottom padding 24 | — |
| Header row | Wordmark left, avatar right, `items-center` | `Wordmark size="lg"` (36 high; design measures about 30) |
| Avatar | 88 circle (`size-22`) | New `ui/Avatar` (`expo-image`, initials fallback in `title` on `bg-primary`) |
| Greeting | 8* below the header, muted | New variant `lead` (`font-body-semibold text-headline`), `tone="muted"` |
| Headline | 4* below. "Find your\nnext stay" | New token `masthead` (46 / 40, -1.5 tracking), new variant `masthead` (`font-display-heavy`) |
| Search button | 60 × 84 capsule (`w-15 h-21 rounded-full`), `bg-surface-muted`, beside the greeting + headline column, `items-center` | `PressableScale`, `Icon` `search` 26* |
| AI pill | 16* below. 60 high, full width, `rounded-full`, `bg-secondary`. `pl-5`, `pr-2`, `gap-3` | `sparkles` 20, `TextInput` `font-body-medium text-body`, returnKeyType `search` |
| Pill arrow | 44 white circle at the end | `IconButton` new variant `surface-flat` (`bg-surface`, no shadow), `sm`, `arrow-up-right` |
| Category chips | 12* below the pill. `flex-row flex-wrap gap-2`, 48 high | `Chip size="md" selectedTone="primary"`. Icons `house`, `tree-pine`, `waves-horizontal`, `building`, `tree-palm` (20, filled when selected) |
| Feed | 16* below the chips, cards 20 apart | — |
| Stay card | 264 high (`h-66`), `rounded-2xl`, `overflow-hidden`. Photo fills it | `expo-image`, `contentFit="cover"`, 200 ms image transition |
| Card scrim | Bottom 60%: linear gradient from transparent to `photo-scrim` | New token `--color-photo-scrim: rgb(11 11 26 / 0.72)`*. `experimental_backgroundImage` (RN 0.86) |
| Rating pill | Top right, 12 in. 40 high, `px-3`, `gap-1.5`, `bg-surface`, `rounded-full` | `star` 18 filled `foreground`, `headline` |
| Card text | Bottom left, 20 in, right edge 20 | Location row: `map-pin` 16 `inverse` + `caption inverse`, then a 4 gap, then the title in new token/variant `feature` (28 / 28, -0.6), `inverse`, max 2 lines |

**Search**

| Element | Spec | Tokens / components |
|---|---|---|
| Header | top `insets.top + 8`*. Back button + search field, `gap-3` | `IconButton md muted chevron-left` |
| Search field | flex-1, 56 high, `rounded-full`, leading `search` | `TextField` new prop `shape="pill"` (rounded-full instead of rounded-lg), returnKeyType `search` |
| Chips | 12 below. Horizontal `ScrollView`, `gap-2`, scrolls past the gutters | `Chip size="sm"` (40), lavender when on |
| Count + sort | 16 below. "12 stays" (`body`) left, "Sort by **Best match** ⌄" right | `caption muted` + `subhead` + `chevron-down` 18 |
| Sort menu | Under the sort row, right-aligned, 200 wide, `rounded-xl`, `bg-surface`, `shadow-raised`, 3 rows 44 high, selected row in `subhead` with `check` | — |
| Result row | `flex-row gap-3`, rows 16 apart | — |
| Row photo | 144 × 148 (`w-36 h-37`), `rounded-lg` | `expo-image` |
| Row text | Title: new token/variant `listing` (18 / 20, -0.3), 2 lines. Then 6 gap and location (`map-pin` 16 muted + `caption muted`). Then rating (`star` 16 filled `primary`, `callout` "4.9" + `body muted` "(342)"). Then up to 2 amenity badges. Then price `headline` "$289" + `caption muted` "/ night" | `Badge` new `size="sm"` (`h-7 px-3 gap-1`, `label` text, icon 14) |
| Amenity icons | Hot tub `bath`, pets `paw-print`, pool `waves-ladder`, fireplace `flame`, wifi `wifi`, ocean view `sunset`, kitchen `utensils`, parking `car-front`, ski-in `mountain-snow`, AC `snowflake` | Matched amenities show first |
| Empty | Centered under the count, 48 from the top: `search` 32 muted, `headline` "No stays match all of that", `body muted` "Try turning off a filter above." | — |

**Trips and Profile:** `px-5`, top `insets.top + 8`, `title` heading. Trips: a `calendar` 32 icon, `headline` "No trips yet", `body muted` "Stays you book will show up here.", then `Button` "Find a stay" → `/home`. Profile: `Avatar` 88, `headline` name, `body muted` email, then a secondary "Sign out" `Button` at the bottom.

**Proposed new tokens** (in `global.css`, mirrored in `colors.ts` where they are colors):

- `--text-masthead: 46px`, line height `0.8696` (40), tracking `-1.5px`. Home headline. The design has 46 / 38. 40 avoids Android clipping the glyph tops.
- `--text-feature: 28px`, line height `1` (28), tracking `-0.6px`. Card titles over photos.
- `--text-listing: 18px`, line height `1.1111` (20), tracking `-0.3px`. Result row titles.
- `--color-photo-scrim: rgb(11 11 26 / 0.72)`. Legibility gradient on photos.

**Differences kept:**

- The tab bar is the platform's native bar, not the floating glass pill in the design (the user asked for native tabs). Android shows a yellow Material indicator behind the active icon. Icons are SF Symbols / Material Symbols, not Lucide.
- Chip labels use `button` (17); the design measures about 15.
- The wordmark is 36 high; the design measures about 30.
- The card chevron, the filters button and the hearts are left out (decisions above).

## Out of scope

- Property details screen and card taps.
- Sanity content, GROQ, embeddings, Jev and the search API route. Data and search are local.
- Filters sheet, saved stays (hearts), Trips content, the Profile design.
- Dates, maps, pagination.
- Haptics.

## Steps

### 1. Tokens and shared components

- `global.css`: add `masthead`, `feature`, `listing` and `photo-scrim`. Add `photoScrim` to `colors.ts`.
- `Text`: add variants `masthead` (`font-display-heavy text-masthead`), `feature` (`font-display text-feature`), `listing` (`font-display text-listing`), `lead` (`font-body-semibold text-headline`).
- New `ui/pressable-scale.tsx`: a `Pressable` whose content scales to 0.97 on press. Static classes go through `className` on `Animated.View` (react-native-css supports Reanimated's built-in components). Transform and transition go in `style`. If `className` on `Animated.View` doesn't style on device, stop and report. The fallback is an outer `Animated.View` for scale with an inner styled `View`.
- Move `Button`, `Chip` and `IconButton` onto `PressableScale`, dropping `active:opacity-70`. Chip background moves to a `style` color with a 150 ms transition.
- `IconButton`: add variant `surface-flat`. `Badge`: add `size` (`md` default, `sm`). `TextField`: add `shape` (`rounded` default, `pill`).
- New `ui/avatar.tsx`: `uri`, `name`, `size` (`lg` 88, `md` 56). Export everything from `ui/index.ts`.
- Add the new variants and components to `/design-system`.

Done when `/design-system` shows them on the phone, and lint and the type check pass.

### 2. Data and search

- `src/data/stays.ts`: the `Stay` type: `id`, `title`, `type` (`cabin | beach | city | villa`), `city`, `region` (state code), `regionName`, `pricePerNight`, `rating`, `reviewCount`, `maxGuests`, `petsAllowed`, `amenities: Amenity[]`, `vibes: string[]`, `description`, `imageUrl`. Add 12 stays, including "Modern Cabin with Hot Tub" (Lake Arrowhead, CA, $289, 4.9 / 342), "Oceanview Villa with Private Pool" (Malibu, CA, $412), "A-Frame in the Redwoods" (Monte Rio, CA, $236) and "Designer Home in Wine Country" (Healdsburg, CA), plus 8 more across the four types and some non-California places. Prices range from about $140 to $650. Check every Unsplash URL with `curl -I`.
- `src/lib/search/parse-query.ts`: a pure `parseQuery(text)` that returns `{ maxPrice?, guests?, types[], pets, amenities[], places[], soft[] }` and the chip list (`{ key, label }`). It covers "under/below/less than/max $300", "$300 a night", "for 4", "4 guests/people", type words and plurals ("cabin(s)", "beach house", "villa", "apartment|loft|city" → city), "pet(s) friendly|dog|cat", the amenity synonyms ("hot tub|jacuzzi|spa", "pool", "fireplace", "wifi", "ocean view|oceanfront|sea view", "kitchen", "parking", "ski", "ac|air conditioning"), places (any `city`, `region`, `regionName` in the data, e.g. "california", "malibu"), and soft words (everything else that's not a stop word).
- `src/lib/search/search-stays.ts`: `searchStays(stays, parsed, { off: Set<string>, sort })`. It filters on the hard constraints that are on, then scores `soft` matches against `vibes` (weight 2) and `description` (weight 1), with rating as the tie-break. `sort`: `best | price | rating`. It returns the stays plus their matched amenities, for the badges.
- `src/lib/search/index.ts` exports both. A header comment says the Sanity plan replaces the internals with GROQ + embeddings behind the same call.

Done when a scratch run of 6 realistic sentences gives the expected results. The sentences: the placeholder, "cabins in california under $300", "beach house for 6 with a pool", "cozy city loft", "villa", and "quiet igloo on the moon" (empty). Note any surprises in the plan.

### 3. Tab shell

- Create `src/app/(tabs)/_layout.tsx` with `NativeTabs` and the four triggers styled as above.
- Move `home.tsx` into `(tabs)`, and add placeholder `search.tsx`, `trips.tsx` and `profile.tsx`.
- In the root layout, guard `(tabs)` instead of `home`.
- Add `imageUrl` to `Session` (from `user.hasImage ? user.imageUrl : null`).
- Build Trips and Profile as specced. Sign out moves to Profile.

Done when sign-in lands on Home with the tab bar, every tab opens, and Sign out on Profile returns to onboarding.

### 4. Home

Build `(tabs)/home.tsx` from the spec, with parts in `src/components/home/`: `home-header.tsx`, `search-pill.tsx`, `category-chips.tsx` and `stay-card.tsx`. Add the header entrance and the feed transitions from the Motion table.

Done when the phone screenshot matches the design (differences listed), the categories filter, and the pill opens Search.

### 5. Search

Build `(tabs)/search.tsx` from the spec, with parts in `src/components/search/`: `search-header.tsx`, `query-chips.tsx`, `sort-menu.tsx` and `result-row.tsx`. Add the result, reorder and sort-menu motion.

Done when the screenshot matches the design (minus the hidden extras), and chips, sort, a new query and the empty state all work.

## Verification

- `npx expo lint` and `npx tsc --noEmit` pass.
- Run the search scratch check from step 2, and explain any miss by its cause (data, parser or ranking).
- On the phone in Expo Go, take screenshots of Home, Home → Cabins, Search with the placeholder query, Search empty, the open sort menu, Trips and Profile. Compare them with the designs and list the differences.
- Motion: press a chip (scale and color), change categories (cards fade and reflow), submit a new search (the list rises in), change the sort (rows slide into place), and switch tabs (no animation). Turn on Android "Remove animations" and check that nothing translates or scales.
- End to end: sign in → type "pet friendly cabin under $300" → submit → Search shows only cabins at or under $300 that allow pets → turn off "Under $300" → more cabins appear → Sort by Price → rows reorder → back → Home still has the text → Profile → Sign out → onboarding.

## AGENTS.md updates

- **Expo:** replace "app routes (`/home` for now)" with "app routes live in the `(tabs)` group (NativeTabs: `/home`, `/search`, `/trips`, `/profile`)".
- **Styling:** add a motion rule: press feedback comes from `PressableScale` (0.97, 120 ms). Animate with Reanimated CSS transitions and layout animations, using the skill's curves. Tab switches never animate. Reduced motion drops translate and scale.
- **Who owns what / Rules:** note that until the Sanity plan, stays are local (`src/data/stays.ts`) and `searchStays()` stands in for GROQ + embeddings, with the same hard/soft split.

## Result

Built as planned on the user's Android phone (360 dp wide) in Expo Go. Lint and the type check pass. Changes from the plan, found while building:

- **NativeWind and Reanimated.** `className` only maps onto react-native's components, so `PressableScale` and the new `ui/AnimatedView` wrap Reanimated components with `styled()`. `styled()` copies style objects, which drops `cubicBezier()`'s prototype and crashes CSS transitions ("Invalid parametrized timing function"). The curves now live in `src/theme/motion.ts`, with `normalize` as an own property. `Chip` animates its fill through `PressableScale`'s `fill` prop, so the press transition and the fill transition share one `transitionProperty` list.
- **Sort doesn't slide rows.** Reordering every row at once made them cross and overlap mid-flight. A sort change now re-enters the list (fade + 8 px rise), like a new query. `itemLayoutAnimation` still closes gaps on chip toggles.
- **Search state resets by key.** Resetting state during render didn't clear the controlled field on Android. The body is a child keyed by `q`; sort lives in the parent and carries over.
- **Android fixes:** the masthead gets `pb-2`, because its 40 line height clipped the "y" in "stay". The pill's example text is a `Text` behind the input, because the native placeholder wrapped onto two lines at 360 dp. The pill text is `caption` (14) rather than `body`. The count is one string, because "{n} stays" lost its word when the number changed. Result badges are capped at one line; on narrow phones a second badge that would wrap is hidden.
- **Step 2 check:** soft words never filter, so "quiet igloo on the moon" returns all 12 stays ranked, not the empty state. This is correct under the hard/soft rule. The empty state is reached by hard constraints, e.g. "pet friendly villa under $300". Every other sentence returned the expected stays.
- `Session` gained `imageUrl`. `src/theme/typography.ts` mirrors the label type for the native tab bar.

Not verified: iOS (no simulator run), reduced motion on device (it needs a system setting changed on the user's phone), and sign-out from Profile (it would end the user's Google session).
