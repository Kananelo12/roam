# 07 · Auth screens (mocked)

Status: done

## Goal

A guest can create an account, verify their email with a 6-digit code, sign in, and sign out, all on screens that match `prompt-imgs/auth.png`. Authentication is mocked behind one module that mirrors Clerk's steps, so the Clerk plan only swaps that module.

## Decisions

- **Three screens in the `(auth)` stack:** `sign-up` (from the design), `verify-email` and `sign-in`. Verification and sign-in are derived from the sign-up layout, since only sign-up is designed.
- **Mock auth mirrors Clerk's flow** (user's choice):
  - Sign-up creates a pending account.
  - Code `424242` (Clerk's test code) verifies it; any other code fails.
  - Sign-in checks the stored email and password.
  - Every call waits about 800 ms, so loading states show.
  - A demo account, `guest@roam.dev` / `password123`, is seeded so sign-in works without signing up first.
  - State is in memory, so reloading the app signs the guest out.
- **The mock lives in `src/lib/auth/`** behind a `useAuth()` hook. Screens never import the mock directly.
- **Google and Apple sign in instantly as a demo guest** while mocked (user's choice).
- **Apple is shown on both platforms**, as designed (user's choice). The logo is Apple's official mark, added to `assets/brand/` and rendered by `components/ui/AppleLogo`, like the Google G. It's one color, so it uses the `foreground` token.
- **After sign-in or verification, guests land on a placeholder `/home`** that shows "Signed in as <name>" and a Sign out button (user's choice). The tab shell replaces it later.
- **Routing is gated with `Stack.Protected`** in the root layout (available in SDK 57; `redirectTo` is SDK 58+ and not used):
  - `guard={!session}` wraps `(onboarding)` and `(auth)`.
  - `guard={!!session}` wraps `home`.
  - When a session starts, the router leaves auth for `/home`. On sign-out it returns to onboarding and clears the protected history.
  - `/design-system` stays unguarded.
- **Validation runs in code, not a library.** It runs on submit, then re-checks a field live once it has shown an error.
  - Name: at least 2 characters after trimming. Message: "Enter your full name."
  - Email: matches `name@domain.tld`. Message: "Enter a valid email address."
  - Sign-up password: at least 8 characters. Message: "Use at least 8 characters."
  - Sign-in password: not empty. Message: "Enter your password."
- **Server-side errors from the mock** are shown under the field they belong to:
  - Email already used: "An account with this email already exists."
  - Wrong sign-in: "Email or password is incorrect." (under the password field)
  - Wrong code: "That code isn't right. Check your email and try again."
- **Form behavior:**
  - The return key moves to the next field, and on the last field it submits.
  - Fields set `autoComplete` and `textContentType` (`name`, `email`, `new-password` or `current-password`, `one-time-code`).
  - The password eye toggle has the label "Show password" or "Hide password". Hidden shows `eye-off`, as in the design.
  - Screens scroll with the keyboard (`KeyboardAvoidingView` + `ScrollView` with `keyboardShouldPersistTaps="handled"`). No new dependency.
  - While a request runs, the submit button shows its spinner and the social buttons are disabled.
- **Verification screen:**
  - Six code boxes over one hidden `TextInput` (number pad, paste-friendly), auto-submitting at 6 digits.
  - "Resend code" has a 30 s cooldown ("Resend in 0:24").
  - Back returns to sign-up with the fields still filled.
  - In development, a muted hint shows "Mock code: 424242".
- **Navigation:**
  - Sign-up → push `/verify-email`.
  - The footer links switch between sign-up and sign-in with `replace`.
  - Back on sign-up or sign-in returns to onboarding.
- **The title breaks after the first word** ("Create\nyour account", "Welcome\nback", "Check your\nemail"), as in the design.
- **Forgot password** is out of scope; no link is shown.

### Design spec

Measured at about 0.58 dp per image px. Values marked * are estimates.

| Element | Spec | Tokens / components |
|---|---|---|
| Header | `insets.top + 12`. Back button at the left, wordmark at the right | — |
| Back button | 44 circle, white, 1px border | New `IconButton` variant `outline` (`border border-border bg-surface`), size `sm`, `chevron-left` |
| Wordmark | Right-aligned | `Wordmark size="sm"` |
| Title | 32* below the header | `Text variant="hero"` |
| Body | 12 below the title | `body`, `muted` |
| Fields | 24 below the body, 14* apart. Each 60* high, 20 padding, 24* between icon and text | `TextField` with `label`. Icons `user`, `mail`, `lock` (22) |
| Password toggle | Trailing `eye-off` / `eye` | `Icon`, in a `Pressable` with 8 hitSlop |
| Primary button | 24 below the fields, trailing `arrow-right` | `Button variant="primary"` |
| Divider | 20* above and below. Hairlines with a centered "or" | `bg-border` lines, `caption` `muted` |
| Social buttons | 12 apart | `Button variant="secondary"` with `GoogleLogo` / `AppleLogo` |
| Footer | At the bottom, 32 minimum gap. "Already have an account?" plus underlined "Sign in" | `caption` `muted` + `callout` |
| Field error | 1px danger border, with the message 6 below in danger | New `TextField` `error` prop, `caption` `danger` |
| Code box | 48 × 60*, 8 apart, rounded `lg`. Digit in `title`. Focused and error states as fields | `surface-muted`, `secondary-soft` / `secondary-strong`, `danger` |

Changes to shared components:

- **`TextField` labeled variant:** 60 high (`h-15`), `px-5`, `gap-6`, instead of 72 / `px-4` / `gap-4`. Plan 04 estimated 72; this design measures about 60. Only auth uses the labeled variant.
- **`TextField`** gains an `error` prop (danger border, message below, the message added to the accessibility hint) and a `ref` prop, for focus chaining.
- **`IconButton`** gains an `outline` variant.

Differences kept, as on onboarding:

- Buttons are 56 high; the design measures about 52 and 46.
- Body line height is 24; the design measures about 22.
- Social logos sit beside their centered labels. In the design, they're pinned further left.

No new tokens.

## Out of scope

- Clerk and real Google/Apple OAuth (the Clerk plan).
- Forgot or reset password.
- Persisting the session across app restarts.
- The tab shell; `/home` is a placeholder.

## Steps

### 1. Shared components

- Update `TextField`: the labeled sizing above, plus `error` and `ref` props. The `className` moves to an outer wrapper that also holds the error text.
- Add the `outline` variant to `IconButton`.
- Add `assets/brand/apple-logo.svg` and `components/ui/apple-logo.tsx` (an `AppleLogo` with `size`, default 22, filled `colors.foreground`, not accessible). Export it.
- Add the error state and the new `IconButton` variant to `/design-system`.

Done when `/design-system` shows both and the type check passes.

### 2. Mock auth

Create `src/lib/auth/`:

- `types.ts`: `Session` (`userId`, `name`, `email`), and `AuthError` (`field`: `name`, `email`, `password`, `code` or `form`; plus `message`).
- `mock-auth.ts`: an in-memory user map seeded with the demo account, one pending sign-up, an 800 ms delay, and these functions: `signUp({ name, email, password })`, `verifyEmail(code)`, `resendCode()`, `signIn({ email, password })`, `signInWithProvider("google" | "apple")`. Emails are compared lowercased and trimmed. Header comment: "Replaced by Clerk in the auth plan."
- `auth-provider.tsx`: `AuthProvider` holds `session` and `pendingEmail` in state. `useAuth()` exposes them, wraps each call so the session is set on success, and adds `signOut()`.
- `validation.ts`: the rules and messages above, as pure functions.

Wrap the root layout in `AuthProvider`.

### 3. Routes and gating

- In the root `_layout.tsx`, render the `Stack` from a child component that reads `useAuth()`. Wrap `(onboarding)` and `(auth)` in `Stack.Protected guard={!session}`, and `home` in `guard={!!session}`.
- Add `src/app/home.tsx`: the large wordmark, `hero` "You're in, <first name>", a `muted` line ("This is a placeholder until the app shell is built."), and a secondary Sign out button.
- Delete `src/components/auth/auth-stub.tsx`.

Done when signing in by code moves to `/home`, and Sign out returns to `/`.

### 4. Auth screens

Shared parts go in `src/components/auth/`:

- `auth-header.tsx`: back button and wordmark.
- `auth-screen.tsx`: safe-area, keyboard-avoiding scroll container with `px-5`.
- `or-divider.tsx`.
- `social-buttons.tsx`: Google and Apple.
- `auth-footer-link.tsx`.
- `password-field.tsx`: a `TextField` with the toggle.
- `code-input.tsx`: the six boxes.

Screens:

- `sign-up.tsx`:
  - Title "Create\nyour account". Body "Join roam to save your stays, get personalized recommendations and access them across all your devices."
  - Fields: Full name ("e.g. Adrian Hajdin"), Email address ("you@example.com"), Password ("At least 8 characters").
  - Submit: "Create account".
- `verify-email.tsx`:
  - Title "Check your\nemail". Body "We sent a 6-digit code to <email>. Enter it below to verify your account."
  - The code input, then "Verify email", then "Didn't get it? Resend code".
  - If there's no pending sign-up (e.g. after a deep link), it shows `<Redirect href="/sign-up" />`.
- `sign-in.tsx`:
  - Title "Welcome\nback". Body "Sign in to see your saved stays, trips and recommendations."
  - Fields: Email address and Password ("Your password").
  - Submit: "Sign in".
  - Footer: "New to roam? Create an account".

### 5. Visual and flow check

Run `npx expo start --clear` and open the app in Expo Go on the Android phone. Before every tap, take a screenshot to confirm the phone is showing the app. If it shows anything else, stop and ask.

Capture each screen, including error states and the keyboard open on sign-up, and compare sign-up element by element with the spec. Fix, and repeat.

## Verification

- `npx tsc --noEmit` and `npx expo lint` pass.
- Cases:
  1. Submit an empty sign-up: three inline errors show, and they clear as each field is fixed.
  2. Sign up with `guest@roam.dev`: the email error shows.
  3. Sign up with a new email: verify-email opens and shows that email.
  4. Enter `111111`: the code error shows. Enter `424242`: `/home` shows "You're in, <name>".
  5. Sign out: onboarding shows, and Back doesn't return to home.
  6. Sign in with a wrong password: the incorrect-password error shows. Sign in with `guest@roam.dev` / `password123`: home shows.
  7. Continue with Google, then Apple, from both sign-up and sign-in: home shows.
  8. Resend: the cooldown counts down, and the button re-enables at 0.
  9. Back from verify-email: sign-up shows with its fields still filled.
  10. The password toggle reveals and hides the password.
  11. Return-key chaining submits the form.
- Screens scroll with the keyboard open, and nothing is hidden behind it.
- End to end: onboarding → Get started → sign up → verify with 424242 → home → sign out → onboarding → Skip → Sign in link → sign in as the demo guest → home.

## AGENTS.md updates

Under **Who owns what**, Auth: until the Clerk plan, auth is mocked in `src/lib/auth/mock-auth.ts` behind `useAuth()`. Screens use only `useAuth()`, so Clerk replaces the module, not the screens.

Under **Expo**: routes are gated with `Stack.Protected` in the root layout. `(onboarding)` and `(auth)` are available only while signed out, and app routes only while signed in. This replaces the onboarding/auth line from 06.

## Result

Done. Sign-up, verify-email and sign-in match auth.png's layout, run on the Clerk-shaped mock behind `useAuth()`, and are gated with `Stack.Protected`. Checked on the Android phone (SM-A075F, 360 dp) in Expo Go, through the user's dev server on 8081.

- **Verification cases 1–11 all passed on the phone:**
  - Empty errors, duplicate email, and the wrong and right codes.
  - Sign out with no way back to home, and wrong and right passwords.
  - Google from sign-up and Apple from sign-in.
  - The resend cooldown and "We sent a new code.".
  - Fields kept after Back from verify.
  - The password toggle, and Next/Done chaining.
- **Fixed during the phone check:**
  - **Labeled fields only focused when the thin input line was tapped.** The whole field now focuses its input. It also re-focuses an already-focused input to bring back a dismissed keyboard. (`TextField` and `CodeInput`)
  - **A wrong code closed the keyboard and left six digits to delete.** The cause was `editable={false}` blurring the input on Android. Input now stays focused while verifying, and a wrong code clears the boxes. The verify screen keeps its own state instead of `useAuthForm`.
  - **The status bar was white on white on home.** `StatusBar style="dark"` now lives in the root layout.
- **Remaining differences from the design, kept on purpose:**
  - 56 dp buttons (design about 52 and 46).
  - Body line height 24 (design about 22).
  - Social logos beside their centered labels.
- **Estimated from the image:** values marked * in the spec, and the 60 dp labeled field height.
- **Not checked:** iOS (EAS cloud simulator before releases), and screen readers.
- **Session is in memory,** so any full reload (including some edits during development) signs the guest out.
