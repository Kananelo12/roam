import { isClerkAPIResponseError } from "@clerk/expo";

import { AuthError, type AuthField } from "./types";

const INCORRECT = ["password", "Email or password is incorrect."] as const;

/** Clerk error codes we show under a specific field, with our own wording. */
const KNOWN: Record<string, readonly [AuthField, string]> = {
  form_identifier_exists: ["email", "An account with this email already exists."],
  form_password_incorrect: INCORRECT,
  form_identifier_not_found: INCORRECT,
  form_password_pwned: ["password", "This password appeared in a data breach. Choose a different one."],
  form_password_length_too_short: ["password", "Use at least 8 characters."],
  form_code_incorrect: ["code", "That code isn't right. Check your email and try again."],
  verification_expired: ["code", "That code expired. Tap Resend code for a new one."],
  too_many_requests: ["form", "Too many attempts. Wait a minute and try again."],
};

/** Turns whatever Clerk returned or threw into an AuthError tied to a field. */
export function toAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) return error;
  if (isClerkAPIResponseError(error)) {
    const first = error.errors[0];
    const known = first && KNOWN[first.code];
    if (known) return new AuthError(...known);
    return new AuthError("form", first?.longMessage ?? first?.message ?? error.message);
  }
  // Anything that isn't an API response never reached Clerk.
  if (__DEV__) console.warn("[auth] non-API error", error);
  return new AuthError("form", "Couldn't reach roam. Check your connection and try again.");
}
