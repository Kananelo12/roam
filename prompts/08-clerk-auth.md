# 08 · Clerk auth

Status: done

## Goal

Real accounts replace the mock. A guest signs up with name, email and password, then verifies the email with a 6-digit code. They can sign in with email and password, entering an emailed code when Clerk asks to verify a new device, or continue with Google. The session survives app restarts, routes stay gated, and Sign out ends the session. The custom screens from plan 07 stay.

## Decisions

- **Clerk custom flows, not prebuilt `AuthView`.** The app runs in Expo Go and keeps its own screens. `@clerk/expo` is 4.13.0 (installed). Use the current method-based API: `useSignIn()` / `useSignUp()` return `{ signIn | signUp, errors, fetchStatus }`. Calls look like `signUp.password()`, `signUp.verifications.sendEmailCode()` / `verifyEmailCode()`, `signIn.password()`, `signIn.mfa.sendEmailCode()` / `verifyEmailCode()` and `finalize()`. Each method resolves to `{ error }`. Never use the legacy `@clerk/expo/legacy` API (`prepareFirstFactor`, `attemptFirstFactor`, `setActive` from `useSignIn`).
- **Screens keep calling only our `useAuth()`.** `src/lib/auth/auth-provider.tsx` is rebuilt on Clerk's hooks. `mock-auth.ts` and `MOCK_CODE` are deleted. Clerk's own `useAuth` is imported as `useClerkAuth` inside `src/lib/auth/` only.
- **Instance settings** (read from `/v1/environment` on `capable-hagfish-3225.clerk.accounts.dev`):
  - Email + password is on, and email verification is by code.
  - Google is on; Apple is off.
  - Name fields are off, and the minimum password length is 15.
- **Names (user's choice):** the user turns on First and last name in the Clerk Dashboard. Sign-up splits the full name at the first space into `firstName` and `lastName` (the last name is omitted if empty) and passes them to `signUp.password()`. Home shows `user.firstName`.
- **Password minimum (user's choice):** the user sets it to 8 in the Dashboard. App validation stays at 8.
- **Sign-in (user's choice):** email + password. If `signIn.status === "needs_client_trust"` (new-device check), send `signIn.mfa.sendEmailCode()` and push `/verify-email`. That screen verifies with `signIn.mfa.verifyEmailCode()`. `needs_second_factor` isn't configured; if it shows up anyway, show a form error: "Two-step verification isn't supported yet. Contact support."
- **Verify-email serves both flows.** `useAuth()` exposes `pendingVerification: { email, flow: "sign-up" | "sign-in" } | null`, replacing `pendingEmail`. `verifyEmail(code)` and `resendCode()` call the matching flow. The copy is the same, except the sign-in body ends "Enter it below to confirm it's you." If there's nothing pending, the screen redirects to `/sign-up`, as before.
- **Session completes with `finalize()` without `navigate`.** The `Stack.Protected` guard in the root layout does the navigation, as in plan 07. No session tasks (orgs, forced MFA) are configured.
- **Google (user's choice):** browser SSO through `useSSO()` from `@clerk/expo` (stable, works in Expo Go). When `createdSessionId` is set, call `setActive({ session })`. A cancel resolves with no session and shows nothing. If `signUp.status === "missing_requirements"`, show "Couldn't finish signing in with Google. Try again or use email." `src/app/+native-intent.tsx` handles the `sso-callback` deep link back from the browser. While the app is alive, it returns `null`, so the router ignores the link and `useSSO` finishes. If Android killed the app while the browser was open, it returns `/sign-in?sso=interrupted`, and sign-in shows "Google sign-in was interrupted. Try again." until Google is tapped again. There's no `sso-callback` route. The experimental `@clerk/expo/experimental` `useSSO` isn't used.
- **Apple is hidden** because it's off in Clerk. `SocialButtons` renders Google only, which differs from the design until a social plan adds Apple.
- **Persistence:** `tokenCache` from `@clerk/expo/token-cache` on `ClerkProvider` (already in place). It needs `expo-secure-store`, which isn't installed yet. Both new packages are in Expo Go.
- **Loading:** the splash screen stays up until fonts are loaded **and** Clerk's `isLoaded` is true, so a signed-in guest never flashes onboarding at cold start.
- **`Session`** stays `{ userId, name, email }`. It's built from `useUser()`: `name` = `fullName ?? firstName ?? ""`, `email` = `primaryEmailAddress.emailAddress`.
- **Error mapping** (Clerk `error.errors[0].code` → field and message):
  - `form_identifier_exists` → email: "An account with this email already exists."
  - `form_password_incorrect`, `form_identifier_not_found` → password: "Email or password is incorrect."
  - `form_password_pwned` → password: "This password appeared in a data breach. Choose a different one."
  - `form_password_length_too_short` → password: "Use at least 8 characters."
  - `form_code_incorrect` → code: "That code isn't right. Check your email and try again."
  - `verification_expired` → code: "That code expired. Tap Resend code for a new one."
  - `too_many_requests` → form: "Too many attempts. Wait a minute and try again."
  - Anything else → form: Clerk's `longMessage ?? message`.
  - A network failure → form: "Couldn't reach roam. Check your connection and try again."
- **Bot protection:** sign-up renders `<View nativeID="clerk-captcha" />`. Captcha is off for this instance, but Clerk needs the mount point if it's turned on.
- **Dev hint:** in `__DEV__`, verify-email shows "Test emails with +clerk_test use code 424242" when the email contains `+clerk_test`. This replaces the mock hint.
- **Secrets:** only `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` reaches the app. `CLERK_SECRET_KEY` stays in `.env.local` for future API routes. Add `.env.example` with both names and no values.
- **The `@clerk/expo` config plugin waits for the first development build.** It isn't needed in Expo Go.
- **The Clerk MCP isn't connected in this session** (it needs `/mcp` authorization). Patterns come from the Clerk Expo skill, checked against the installed 4.13 types.

## Out of scope

- Apple sign-in, native Google (`useSignInWithGoogle`), forgot or reset password, MFA, passkeys, biometrics.
- PostHog identify (the analytics plan).
- API routes that verify the session (there are none yet).
- Profile editing.

## Steps

### 1. Dependencies and env

- `npx expo install expo-secure-store expo-auth-session`. Confirm the `expo-secure-store` plugin is in `app.json` (add it if `expo install` didn't).
- Add `.env.example` with `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=` and `CLERK_SECRET_KEY=`.

Done when `npx expo-doctor` reports no new issues and `tsc` passes.

### 2. Clerk-backed auth module

In `src/lib/auth/`:

- `clerk-errors.ts`: `toAuthError(error)` with the mapping above. It returns an `AuthError`.
- `auth-provider.tsx`:
  - Use `useClerkAuth`, `useUser`, `useSignIn`, `useSignUp`, `useSSO` and `useClerk`.
  - Expose `isLoaded`, `session`, `pendingVerification`, `signUp`, `verifyEmail`, `resendCode`, `signIn` (resolves `{ needsCode: boolean }`), `signInWithProvider("google")` and `signOut`.
  - Each action throws an `AuthError` when Clerk returns an error, so the screens' existing `useAuthForm` and `AuthError` handling keep working.
  - `pendingVerification` lives in provider state. It's set after a code is sent and cleared on `finalize`.
- `types.ts`: `Provider = "google"`.
- `index.ts`: drop the `MOCK_CODE` export.
- Delete `mock-auth.ts`.

### 3. Root layout

- Move `import "@/global.css"` back to the top. Shorten the missing-key error to one line pointing at `.env.example`.
- `RootStack` reads `isLoaded`, returns `null` until it's true, and hides the splash once fonts and Clerk are both ready.
- The guard stays on `session !== null`.
- Add `src/app/+native-intent.tsx` for the `sso-callback` deep link (ignore it while alive; send a cold start to `/sign-in?sso=interrupted`).

### 4. Screens

- `sign-up.tsx`: add the captcha view. After `signUp()`, push `/verify-email` as today.
- `sign-in.tsx`: if `signIn()` returns `needsCode`, push `/verify-email`.
- `verify-email.tsx`: read `pendingVerification`, show the copy for the flow, and replace the mock hint with the `+clerk_test` hint.
- `social-buttons.tsx`: Google only. In sign-up and sign-in, call `signInWithProvider("google")`.
- `home.tsx`: unchanged, apart from following any `useAuth()` shape changes.

## Verification

- `npx tsc --noEmit` and `npx expo lint` pass.
- On the Android phone in Expo Go, through the user's dev server on 8081, using `+clerk_test` emails (code `424242`, no real inbox):
  1. Sign up `roam+clerk_test@example.com` with a name and an 8+ character password. Verify-email shows the email. `111111` shows the code error, and `424242` lands on home with the first name.
  2. Sign up the same email again: "An account with this email already exists."
  3. A breached password such as `password123`: the breach error shows under the password.
  4. Sign out → onboarding. Back doesn't reach home.
  5. Sign in with a wrong password: the incorrect error shows. Sign in with the right password: home (or verify-email if Clerk asks for a new-device check, then `424242` → home).
  6. Kill Expo Go and reopen the app: home shows with no onboarding flash (the session persisted).
  7. Resend on verify-email: the cooldown restarts and "We sent a new code." shows.
  8. Continue with Google: the browser opens, the account is picked, home shows. Cancelling shows nothing and stays on the screen.
  9. Airplane mode, then sign in: the connection error shows.
- The users from cases 1 and 8 appear in the Clerk Dashboard with their names.
- End to end: onboarding → sign up → verify → home → sign out → sign in → home → restart the app → still home.

## AGENTS.md updates

- **Who owns what → Auth:** replace the mock line with: Clerk custom flows (`@clerk/expo`, method-based `useSignIn`/`useSignUp` API, never `@clerk/expo/legacy`) behind our `useAuth()` in `src/lib/auth/`. Screens use only `useAuth()`. Email + password with code verification, and Google via `useSSO()`. Sessions persist via `tokenCache` (`expo-secure-store`). Test with `+clerk_test` emails and code `424242`.
- **Expo:** the root layout waits for Clerk's `isLoaded` before rendering the guarded stack. `+native-intent.tsx` handles the `sso-callback` deep link: ignored while the app is alive, sign-in with a retry message after a cold start.
- **Rules:** sign-up screens render `<View nativeID="clerk-captcha" />`.

## Result

Done. Clerk custom flows replace the mock behind `useAuth()`, and the screens from plan 07 are unchanged apart from the flow hooks.

- **The user ran on the phone:** sign-up with a `+clerk_test` email and code `424242` → home; sign out; sign in; kill and reopen (session persisted, no onboarding flash); Google sign-in.
- **Clerk MCP:** both users exist with first and last names. The email user was verified by `email_code`, and the Google user is linked to `oauth_google`. Instance: names on (optional), password minimum 8.
- **Fixed after the phone check:** Google sign-in showed a white screen, then the splash and onboarding. The phone (SM-A075F) runs low on memory, and Android's low-memory killer closed Expo Go about 2 s after Chrome opened (logcat: `lowmemorykiller: Process … was reaped`, then `host.exp.exponent has died`). The browser's callback then cold-started the app, and the pending `startSSOFlow` was gone. Finishing the flow after a cold start (reloading the sign-in with the link's `rotating_token_nonce`) was tried and dropped: one link arrived with the nonce and Clerk then threw, and another arrived with no query at all. User's choice: a cold start now lands on sign-in with "Google sign-in was interrupted. Try again."
- **Google, checked on the phone by Claude:** Expo Go survived → signed in as the Google user and landed on home ✅. Expo Go killed on purpose (`am kill`) → sign-in showed the interrupted message ✅. The message cleared when Google was tapped again ✅.
- **Later:** native Google sign-in (`useSignInWithGoogle`, an account sheet with no browser) with the first development build removes the browser round trip.
- **Not checked:** the new-device code path (`needs_client_trust`) wasn't triggered, the error cases (breached password, airplane mode) weren't run, and iOS wasn't tested.
- **Differences from the design:** Apple is hidden until it's enabled in Clerk.
