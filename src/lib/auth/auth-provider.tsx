import { createContext, use, useState, type ReactNode } from "react";

import * as mock from "./mock-auth";
import type { Provider, Session } from "./types";

type AuthContextValue = {
  session: Session | null;
  /** Email of the sign-up waiting for its code, if any. */
  pendingEmail: string | null;
  signUp: (input: { name: string; email: string; password: string }) => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
  resendCode: () => Promise<void>;
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const value: AuthContextValue = {
    session,
    pendingEmail,
    signUp: async (input) => {
      const { email } = await mock.signUp(input);
      setPendingEmail(email);
    },
    verifyEmail: async (code) => {
      const next = await mock.verifyEmail(code);
      setPendingEmail(null);
      setSession(next);
    },
    resendCode: mock.resendCode,
    signIn: async (input) => setSession(await mock.signIn(input)),
    signInWithProvider: async (provider) => setSession(await mock.signInWithProvider(provider)),
    signOut: () => setSession(null),
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth() {
  const value = use(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
