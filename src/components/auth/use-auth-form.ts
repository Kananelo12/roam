import { useState } from "react";

import { AuthError, type Provider } from "@/lib/auth";

type Rule = (value: string) => string | undefined;
type Busy = "submit" | Provider | null;

/**
 * Form state for the auth screens: values, per-field errors, and the request
 * in flight. Validation runs on submit; after that a field with an error is
 * re-checked as the guest types. Auth errors land on the field they name.
 */
export function useAuthForm<F extends string>(initial: Record<F, string>, rules: Record<F, Rule>) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<F | "form", string>>>({});
  const [busy, setBusy] = useState<Busy>(null);

  const setField = (field: F) => (text: string) => {
    setValues((v) => ({ ...v, [field]: text }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: rules[field](text), form: undefined }));
  };

  const validate = () => {
    const found = Object.fromEntries(
      (Object.keys(rules) as F[]).map((field) => [field, rules[field](values[field])]),
    ) as Partial<Record<F | "form", string>>;
    setErrors(found);
    return Object.values(found).every((message) => !message);
  };

  const run = async (kind: Exclude<Busy, null>, request: () => Promise<void>) => {
    if (busy) return;
    setBusy(kind);
    try {
      await request();
    } catch (error) {
      if (!(error instanceof AuthError)) throw error;
      setErrors((e) => ({ ...e, [error.field]: error.message }));
    } finally {
      setBusy(null);
    }
  };

  return { values, errors, busy, setField, validate, run };
}
