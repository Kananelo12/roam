import { Redirect } from "expo-router";
import ArrowRight from "lucide-react-native/icons/arrow-right";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { AuthScreen } from "@/components/auth/auth-screen";
import { CODE_LENGTH, CodeInput } from "@/components/auth/code-input";
import { Button, Icon, Text } from "@/components/ui";
import { AuthError, useAuth } from "@/lib/auth";

const RESEND_COOLDOWN_S = 30;

/** Clerk dev instances accept this code for +clerk_test emails without sending mail. */
const TEST_CODE = "424242";

export default function VerifyEmailScreen() {
  const { pendingVerification, verifyEmail, resendCode } = useAuth();
  // Captured once: a successful verify clears pendingVerification while this screen unmounts.
  const [pending] = useState(pendingVerification);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!pending) return <Redirect href="/sign-up" />;
  const { email, flow } = pending;

  // On success the session starts and the root layout's guard routes to home.
  const verify = async (value: string) => {
    if (verifying) return;
    if (value.length < CODE_LENGTH) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setVerifying(true);
    try {
      await verifyEmail(value);
    } catch (e) {
      if (!(e instanceof AuthError)) throw e;
      // Clear the boxes so the guest can type the code again straight away.
      setCode("");
      setError(e.message);
    } finally {
      setVerifying(false);
    }
  };

  const onChangeCode = (value: string) => {
    if (verifying) return;
    setCode(value);
    if (value.length > 0) setError(undefined);
    if (value.length === CODE_LENGTH) verify(value);
  };

  const resend = async () => {
    setResending(true);
    try {
      await resendCode();
      setResent(true);
      setCooldown(RESEND_COOLDOWN_S);
    } catch (e) {
      if (!(e instanceof AuthError)) throw e;
      setError(e.message);
    } finally {
      setResending(false);
    }
  };

  const seconds = `0:${String(cooldown).padStart(2, "0")}`;

  return (
    <AuthScreen
      title={"Check your\nemail"}
      body={
        <>
          We sent a 6-digit code to <Text variant="subhead">{email}</Text>.{" "}
          {flow === "sign-in" ? "Enter it below to confirm it's you." : "Enter it below to verify your account."}
        </>
      }
    >
      <CodeInput value={code} onChangeText={onChangeCode} error={error} />
      {__DEV__ && email.includes("+clerk_test") ? (
        <Text variant="label" tone="muted" className="mt-3">
          Test emails with +clerk_test use code {TEST_CODE}
        </Text>
      ) : null}

      <Button
        title="Verify email"
        className="mt-6"
        trailing={<Icon as={ArrowRight} />}
        loading={verifying}
        onPress={() => verify(code)}
      />

      <View className="mt-6 flex-row items-center justify-center gap-2">
        <Text variant="caption" tone="muted">
          {resent ? "We sent a new code." : "Didn't get it?"}
        </Text>
        {cooldown > 0 ? (
          <Text variant="callout" tone="muted">
            Resend in {seconds}
          </Text>
        ) : (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            disabled={resending}
            className="active:opacity-60 disabled:opacity-40"
            onPress={resend}
          >
            <Text variant="callout" className="underline">
              Resend code
            </Text>
          </Pressable>
        )}
      </View>
    </AuthScreen>
  );
}
