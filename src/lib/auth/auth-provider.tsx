import {
  useAuth as useClerkAuth,
  useClerk,
  useSignIn,
  useSignUp,
  useSSO,
  useUser,
} from "@clerk/expo";
import { createContext, use, useState, type ReactNode } from "react";

import { toAuthError } from "./clerk-errors";
import { AuthError, type Provider, type Session } from "./types";

/** A code was emailed and the verify screen should collect it. */
export type PendingVerification = { email: string; flow: "sign-up" | "sign-in" };

type AuthContextValue = {
  /** False until Clerk has restored any saved session. */
  isLoaded: boolean;
  session: Session | null;
  pendingVerification: PendingVerification | null;
  signUp: (input: { name: string; email: string; password: string }) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendCode: () => Promise<void>;
  /** Resolves `needsCode` when Clerk wants an emailed code to trust this device. */
  signIn: (input: { email: string; password: string }) => Promise<{ needsCode: boolean }>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Throws the AuthError for a Clerk method result that failed. */
const check = ({ error }: { error: unknown }) => {
  if (error) throw toAuthError(error);
};

/** Splits "Ada Lovelace King" into Clerk's first and last name fields. */
const splitName = (name: string) => {
  const [firstName, ...rest] = name.trim().split(/\s+/);
  const lastName = rest.join(" ");
  return lastName ? { firstName, lastName } : { firstName };
};

/**
 * Auth for the app, backed by Clerk custom flows. Screens only use useAuth();
 * the root layout's Stack.Protected guard reacts to the session, so nothing
 * here navigates.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { user } = useUser();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { startSSOFlow } = useSSO();
  const clerk = useClerk();
  const [pendingVerification, setPendingVerification] = useState<PendingVerification | null>(null);

  const session: Session | null =
    isSignedIn && user
      ? {
          userId: user.id,
          name: user.fullName ?? user.firstName ?? "",
          email: user.primaryEmailAddress?.emailAddress ?? "",
          imageUrl: user.hasImage ? user.imageUrl : null,
        }
      : null;

  // Every call runs through here, so network failures become AuthErrors too.
  const guard = async <T,>(request: () => Promise<T>) => {
    try {
      return await request();
    } catch (error) {
      throw toAuthError(error);
    }
  };

  const value: AuthContextValue = {
    isLoaded,
    session,
    pendingVerification,

    signUp: ({ name, email, password }) =>
      guard(async () => {
        const emailAddress = email.trim().toLowerCase();
        check(await signUp.password({ emailAddress, password, ...splitName(name) }));
        check(await signUp.verifications.sendEmailCode());
        setPendingVerification({ email: emailAddress, flow: "sign-up" });
      }),

    verifyEmail: (code) =>
      guard(async () => {
        if (pendingVerification?.flow === "sign-in") {
          check(await signIn.mfa.verifyEmailCode({ code }));
          if (signIn.status !== "complete") throw unfinished();
          check(await signIn.finalize());
        } else {
          check(await signUp.verifications.verifyEmailCode({ code }));
          if (signUp.status !== "complete") throw unfinished();
          check(await signUp.finalize());
        }
        setPendingVerification(null);
      }),

    resendCode: () =>
      guard(async () => {
        check(
          await (pendingVerification?.flow === "sign-in"
            ? signIn.mfa.sendEmailCode()
            : signUp.verifications.sendEmailCode()),
        );
      }),

    signIn: ({ email, password }) =>
      guard(async () => {
        const emailAddress = email.trim().toLowerCase();
        check(await signIn.password({ emailAddress, password }));

        if (signIn.status === "complete") {
          check(await signIn.finalize());
          return { needsCode: false };
        }
        if (signIn.status === "needs_client_trust") {
          check(await signIn.mfa.sendEmailCode());
          setPendingVerification({ email: emailAddress, flow: "sign-in" });
          return { needsCode: true };
        }
        if (signIn.status === "needs_second_factor") {
          throw new AuthError(
            "form",
            "Two-step verification isn't supported yet. Contact support.",
          );
        }
        throw unfinished();
      }),

    signInWithProvider: (provider) =>
      guard(async () => {
        const { createdSessionId, setActive, signUp: ssoSignUp } = await startSSOFlow({
          strategy: `oauth_${provider}`,
        });
        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
        } else if (ssoSignUp?.status === "missing_requirements") {
          throw new AuthError("form", "Couldn't finish signing in with Google. Try again or use email.");
        }
        // No session and nothing missing: the guest closed the browser. Stay put quietly.
      }),

    signOut: () => clerk.signOut(),
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

const unfinished = () =>
  new AuthError("form", "We couldn't finish signing you in. Please start again.");

export function useAuth() {
  const value = use(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
