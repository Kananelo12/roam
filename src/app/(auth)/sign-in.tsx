import ArrowRight from "lucide-react-native/icons/arrow-right";
import Mail from "lucide-react-native/icons/mail";
import { useRef } from "react";
import { View, type TextInput } from "react-native";

import { AuthFooterLink } from "@/components/auth/auth-footer-link";
import { AuthScreen } from "@/components/auth/auth-screen";
import { OrDivider } from "@/components/auth/or-divider";
import { PasswordField } from "@/components/auth/password-field";
import { SocialButtons } from "@/components/auth/social-buttons";
import { useAuthForm } from "@/components/auth/use-auth-form";
import { Button, Icon, Text, TextField } from "@/components/ui";
import { useAuth, validateEmail, validatePassword } from "@/lib/auth";

export default function SignInScreen() {
  const { signIn, signInWithProvider } = useAuth();
  const passwordRef = useRef<TextInput>(null);
  const form = useAuthForm(
    { email: "", password: "" },
    { email: validateEmail, password: validatePassword },
  );

  // A successful sign-in starts a session; the root layout's guard then routes to home.
  const submit = () => {
    if (!form.validate()) return;
    form.run("submit", () => signIn(form.values));
  };

  return (
    <AuthScreen
      title={"Welcome\nback"}
      body="Sign in to see your saved stays, trips and recommendations."
      footer={<AuthFooterLink prompt="New to roam?" label="Create an account" href="/sign-up" />}
    >
      <View className="gap-3.5">
        <TextField
          label="Email address"
          placeholder="you@example.com"
          value={form.values.email}
          onChangeText={form.setField("email")}
          error={form.errors.email}
          leading={<Icon as={Mail} />}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <PasswordField
          ref={passwordRef}
          label="Password"
          placeholder="Your password"
          value={form.values.password}
          onChangeText={form.setField("password")}
          error={form.errors.password}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={submit}
        />
      </View>

      {form.errors.form ? (
        <Text variant="caption" tone="danger" className="mt-4">
          {form.errors.form}
        </Text>
      ) : null}

      <Button
        title="Sign in"
        className="mt-6"
        trailing={<Icon as={ArrowRight} />}
        loading={form.busy === "submit"}
        disabled={form.busy !== null && form.busy !== "submit"}
        onPress={submit}
      />
      <OrDivider />
      <SocialButtons busy={form.busy} onPress={(p) => form.run(p, () => signInWithProvider(p))} />
    </AuthScreen>
  );
}
