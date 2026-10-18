/**
 * In-memory stand-in for Clerk, shaped like its sign-up and sign-in steps.
 * Replaced by Clerk in the auth plan; screens only see it through useAuth().
 * State lives in memory, so reloading the app signs the guest out.
 */
import { AuthError, type Provider, type Session } from "./types";

/** Clerk's test verification code. */
export const MOCK_CODE = "424242";

const DELAY_MS = 800;

type Account = Session & { password: string };

const accounts = new Map<string, Account>([
  [
    "guest@roam.dev",
    { userId: "user_demo", name: "Demo Guest", email: "guest@roam.dev", password: "password123" },
  ],
]);

let pending: Account | null = null;

const wait = () => new Promise((resolve) => setTimeout(resolve, DELAY_MS));
const normalize = (email: string) => email.trim().toLowerCase();
const toSession = ({ userId, name, email }: Account): Session => ({ userId, name, email });
const newUserId = () => `user_${Math.random().toString(36).slice(2, 10)}`;

export async function signUp(input: { name: string; email: string; password: string }) {
  await wait();
  const email = normalize(input.email);
  if (accounts.has(email)) {
    throw new AuthError("email", "An account with this email already exists.");
  }
  pending = { userId: newUserId(), name: input.name.trim(), email, password: input.password };
  return { email };
}

export async function verifyEmail(code: string): Promise<Session> {
  await wait();
  if (!pending) throw new AuthError("form", "Your sign-up expired. Please start again.");
  if (code !== MOCK_CODE) {
    throw new AuthError("code", "That code isn't right. Check your email and try again.");
  }
  const account = pending;
  accounts.set(account.email, account);
  pending = null;
  return toSession(account);
}

export async function resendCode() {
  await wait();
}

export async function signIn(input: { email: string; password: string }): Promise<Session> {
  await wait();
  const account = accounts.get(normalize(input.email));
  if (!account || account.password !== input.password) {
    throw new AuthError("password", "Email or password is incorrect.");
  }
  return toSession(account);
}

export async function signInWithProvider(provider: Provider): Promise<Session> {
  await wait();
  return {
    userId: `user_${provider}_demo`,
    name: provider === "google" ? "Google Guest" : "Apple Guest",
    email: `${provider}.guest@roam.dev`,
  };
}
