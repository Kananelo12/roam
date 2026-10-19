import { router } from "expo-router";
import ArrowRight from "lucide-react-native/icons/arrow-right";
import Mail from "lucide-react-native/icons/mail";
import User from "lucide-react-native/icons/user";
import { useRef } from "react";
import { View, type TextInput } from "react-native";

import { AuthFooterLink } from "@/components/auth/auth-footer-link";
import { AuthScreen } from "@/components/auth/auth-screen";
import { OrDivider } from "@/components/auth/or-divider";
import { PasswordField } from "@/components/auth/password-field";
import { SocialButtons } from "@/components/auth/social-buttons";
import { useAuthForm } from "@/components/auth/use-auth-form";
import { Button, Icon, Text, TextField } from "@/components/ui";
import { useAuth, validateEmail, validateName, validateNewPassword } from "@/lib/auth";

export default function SignUpScreen() {
  const { signUp, signInWithProvider } = useAuth();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const form = useAuthForm(
    { name: "", email: "", password: "" },
    { name: validateName, email: validateEmail, password: validateNewPassword },
  );

  const submit = () => {
    if (!form.validate()) return;
    form.run("submit", async () => {
      await signUp(form.values);
      router.push("/verify-email");
    });
  };

  return (
    <AuthScreen
      title={"Create\nyour account"}
      body="Join roam to save your stays, get personalized recommendations and access them across all your devices."
      footer={<AuthFooterLink prompt="Already have an account?" label="Sign in" href="/sign-in" />}
    >
      <View className="gap-3.5">
        <TextField
          label="Full name"
          placeholder="e.g. Adrian Hajdin"
          value={form.values.name}
          onChangeText={form.setField("name")}
          error={form.errors.name}
          leading={<Icon as={User} />}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <TextField
          ref={emailRef}
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
          placeholder="At least 8 characters"
          value={form.values.password}
          onChangeText={form.setField("password")}
          error={form.errors.password}
          autoComplete="new-password"
          textContentType="newPassword"
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
        title="Create account"
        className="mt-6"
        trailing={<Icon as={ArrowRight} />}
        loading={form.busy === "submit"}
        disabled={form.busy !== null && form.busy !== "submit"}
        onPress={submit}
      />
      <OrDivider />
      <SocialButtons busy={form.busy} onPress={(p) => form.run(p, () => signInWithProvider(p))} />
      {/* Mount point for Clerk's bot protection when it's turned on. */}
      <View nativeID="clerk-captcha" />
    </AuthScreen>
  );
}
