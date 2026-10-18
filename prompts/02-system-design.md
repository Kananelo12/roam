# 02 · System design

Status: approved

## Goal

Agree on how Roam v1 fits together: screens, routes, services, data model, request flows and secrets. Then every later feature plan builds on one shared blueprint. When this plan is done, the roadmap of feature plans (Steps) is fixed and each feature can be planned on its own.

## Decisions

Ownership comes from AGENTS.md "Who owns what". This plan adds:

- **Guest data lives in Sanity:** `guest`, `booking` and `savedStay` documents, keyed by Clerk user ID. Only API routes write them, using the write token.
- **The Sanity dataset is private, and the app never queries Sanity directly.** Every read and write goes through API routes, which verify the Clerk session first. This keeps guest documents unreadable from the public API and lets bookings reference properties. Image URLs are built server-side; Sanity CDN asset URLs are public by design.
- **Booking v1 is a request with no payment.** The guest picks dates and a guest count and confirms. That creates a `booking` with status `requested`, which shows in Trips. "Payment methods" stays a placeholder row.
- **Signed-in only.** Search, details, Q&A, saved stays and trips all call API routes, which require a session. Onboarding "Skip" goes to auth, not into the app.
- **API routes are Expo Router API routes** (`src/app/api/**+api.ts`) hosted on EAS Hosting. `app.json` `web.output` changes from `static` to `server` when the first API route lands. Confirm against the SDK 57 docs.
- **Server-only code lives in `src/server/`**: the Sanity client, the Clerk verification helper, the Jev client and the query builders. Nothing in `src/server/` is imported by screens.
- **The app calls the API through one typed client** in `src/lib/api.ts`. It attaches the Clerk session token, and it uses the configured Expo Router `origin` on native.
- **Data fetching uses TanStack Query** (`@tanstack/react-query`), following the expo-data-fetching skill. It's a new dependency, so it's confirmed in the app-shell plan.
- **Navigation:**
  - The `(onboarding)` and `(auth)` groups are stacks.
  - `(tabs)` holds Home, Search, Trips and Profile in a glass tab bar.
  - `stay/[id]` is a stack screen above the tabs.
  - Policy Q&A is a sheet on `stay/[id]`.
- **Search pipeline:**
  1. Code parses price, guest count and dates from the sentence.
  2. Jev answers typed questions to pick the stay type, amenities, pets and place from candidates code found.
  3. Code builds a GROQ filter with params.
  4. `score()` with `text::semanticSimilarity()` ranks the results on the soft intent.
  5. Chips show the parsed constraints, and toggling a chip re-runs the query with structured filters.
  6. Sort defaults to "Best match".
- **Policy Q&A pipeline:**
  1. Jev picks which topics or policies answer the question (Choice).
  2. The API fetches the matching text from the Sanity Context endpoint (Knowledge Base mode, organization token).
  3. It returns the text word for word with its source.
  4. If nothing matches, the answer says so and points to support.
- **Profile stats:** trip and saved counts come from Sanity. The "Rating" stat and the "Roam Explorer" badge are placeholders until a reviews feature exists.

### Data model (Sanity)

- **`property`:**
  - title, slug, type (cabin, villa, home, apartment, A-frame…)
  - location: city, region, country, geopoint
  - pricePerNight (number), maxGuests, bedrooms
  - amenities: list of tags from a fixed list
  - petsAllowed, description (the embedding source), images (Sanity image array)
  - rating, reviewCount
  - host → `host`; policies → `policy`[]
- **`host`:** name, avatar, superhost, bio.
- **`policy`:** title, category (cancellation, house-rules, pets, check-in, other), body (portable text). Policies are shared across stays or specific to one.
- **`guest`:** clerkUserId (unique), homeCity.
- **`booking`:** guest → `guest`, property → `property`, checkIn, checkOut, guests, nightlyPrice snapshot, total, status (requested, cancelled), createdAt.
- **`savedStay`:** guest → `guest`, property → `property`, createdAt. A guest can save a property only once.

### API routes (all verify the Clerk session)

| Route | Purpose |
|---|---|
| `GET /api/stays` | Home feed and category filter |
| `POST /api/search` | Sentence plus chip filters in; ranked stays and parsed constraints out |
| `GET /api/stays/[id]` | Stay details with host and policies |
| `POST /api/stays/[id]/ask` | Question in; verbatim answers with sources, or "no answer" |
| `GET/POST/DELETE /api/saved` | List, save and unsave stays |
| `GET/POST /api/bookings` | List trips; create a booking request |
| `GET/PATCH /api/me` | Guest profile and counts; update home city |

### Secrets and config

Names go in `.env.example`, without values.

- **Public:**
  - `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `EXPO_PUBLIC_POSTHOG_KEY`
  - `EXPO_PUBLIC_POSTHOG_HOST`
- **Server only:**
  - `CLERK_SECRET_KEY`
  - `SANITY_PROJECT_ID`
  - `SANITY_DATASET`
  - `SANITY_READ_TOKEN`
  - `SANITY_WRITE_TOKEN`
  - `SANITY_CONTEXT_URL`
  - `SANITY_ORG_TOKEN`
  - `TYPESAFE_AI_API_KEY`

## Out of scope

- Payments, host-side tools, messaging and reviews.
- Push notifications. The "Notifications" profile row is a placeholder.
- The map view. The List/Map segmented control shows List only in v1.
- Dark mode.
- Offline support.

## Steps

Each step is its own feature. Run the full AGENTS.md workflow for each one, writing `prompts/NN-<name>.md` and getting approval before any code. Every step leaves the app working.

### 1. App shell and navigation

Build these route groups with Expo Router (read the expo-router skill and the SDK 57 docs):
- `(onboarding)`, with three slides matching `prompt-imgs/onboarding.png`.
- `(auth)`, with screens stubbed.
- `(tabs)`: Home, Search, Trips, Profile.
- `stay/[id]`.

Build the glass tab bar from the design, using the yellow active pill and `glass` token (see 04). Add placeholder screens using the design-system components.

Add TanStack Query and the typed API client stub (`src/lib/api.ts`).

Done when every route is reachable and the tab bar matches the designs.

### 2. Content model and seed data

Create the Sanity Studio in `studio/` with the `property`, `host` and `policy` schemas above. Set the dataset to private. Deploy the schema and Studio through the Sanity MCP.

Write a local seed script, using the write token, that creates about 20 realistic California stays with hosts, policies and images. Generate the property copy with Agent Actions.

Done when Studio shows the seeded content.

### 3. Authentication

Set up Clerk through the Clerk CLI, using the Clerk MCP for current Expo patterns. Build custom sign-up and sign-in screens matching `prompt-imgs/auth.png`: email and password, Google, and Apple. Gate `(tabs)` and `stay/[id]` on a session, and route "Skip" to auth.

Add a `src/server/auth.ts` helper that verifies the session in API routes, and create the `guest` document on first sign-in.

Done when a new user can sign up, sign out and sign in.

### 4. API foundation

Switch `web.output` to `server`, configure the native `origin`, and deploy to EAS Hosting.

Implement `GET /api/me` end to end: Clerk verification, the Sanity read and the typed client.

Set up one error shape and handle loading, error and empty states.

Add `.env.example`.

Done when Profile shows the signed-in user's name from Clerk and counts from Sanity.

### 5. Browse and stay details

Implement `GET /api/stays` and `GET /api/stays/[id]`.

Build Home from `prompt-imgs/home.png`: greeting, AI search bar, category chips, featured listing cards. Build the stay screen from `prompt-imgs/property-details.png`: gallery, amenities, policy cards, host row, price bar.

Done when you can open a seeded stay from Home.

### 6. Natural-language search

Implement `POST /api/search` with the search pipeline above: code parsing, Jev typed questions, a GROQ filter with params, embeddings ranking, and Dataset Embeddings enabled on `property`.

Build Search from `prompt-imgs/search.png`: query field, chips from parsed constraints, result count, sort, result cards.

Done when the sentence "quiet pet friendly cabin with a hot tub under $300 a night" returns only pet-friendly cabins with hot tubs under $300, ranked by quietness.

### 7. Policy Q&A

Create the Context endpoint in the Dashboard's Context app (Knowledge Base mode).

Implement `POST /api/stays/[id]/ask` with the Q&A pipeline above. Add the "Ask about policies" sheet on the stay screen, which shows verbatim answers with their source and a support link when nothing matches.

Done when you can ask about pets, cancellation and check-in, and each answer quotes the policy text exactly.

### 8. Saved stays

Implement `/api/saved`. Make the heart on cards and the stay screen toggle optimistically, and add a saved list reachable from Profile.

Done when a stay you save persists across restarts.

### 9. Booking requests and Trips

Implement `/api/bookings`. Add a date and guest picker sheet from "Book this stay", using native `@expo/ui` pickers, and show a confirmation. Build the Trips tab with upcoming and past trips.

Done when a booked stay appears in Trips with correct dates and total.

### 10. Profile

Build Profile from `prompt-imgs/profile.png`: header, stats, account and preferences rows, sign out. Placeholder rows open a "coming soon" state.

Done when the profile shows real counts.

### 11. Analytics

Add PostHog, identified through Clerk. Track screen views and key events (search run, stay opened, question asked, saved, booking requested) without any typed text or personal data. PostHog failures never block the app.

Done when events appear in PostHog.

## Verification

- Each step's own plan passes its Verification before the next step starts.
- No secret is reachable from the app bundle. Check by grepping the exported bundle for every server-only variable name and value.
- An unauthenticated request to every API route returns 401.
- End to end: a new user goes through onboarding and signs up, searches "quiet pet friendly cabin with a hot tub under $300 a night", opens the top result, asks "can I bring my dog?" and gets the exact pet policy text, saves the stay, books it for two nights, and sees it in Trips with the right total.

## AGENTS.md updates

Under **Who owns what**:

- **Guest data:** Sanity `guest`, `booking` and `savedStay` documents, keyed by Clerk user ID and written only from API routes.
- **Bookings:** v1 creates booking requests with no payment.

Under **Rules**:

- The Sanity dataset is private. The app never queries Sanity directly; every read and write goes through an API route.
- Server-only code lives in `src/server/` and is never imported by screens.
- Screens call the API only through `src/lib/api.ts`.
