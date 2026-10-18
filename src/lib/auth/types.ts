export type Session = {
  userId: string;
  name: string;
  email: string;
};

export type AuthField = "name" | "email" | "password" | "code" | "form";

/** An auth failure tied to the field that should show it. */
export class AuthError extends Error {
  constructor(
    readonly field: AuthField,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export type Provider = "google" | "apple";
