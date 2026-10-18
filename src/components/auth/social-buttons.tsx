import { View } from "react-native";

import { AppleLogo, Button, GoogleLogo } from "@/components/ui";
import type { Provider } from "@/lib/auth";

type SocialButtonsProps = {
  onPress: (provider: Provider) => void;
  /** The request in flight, if any: its button spins and the rest disable. */
  busy: "submit" | Provider | null;
};

export function SocialButtons({ onPress, busy }: SocialButtonsProps) {
  return (
    <View className="gap-3">
      <Button
        title="Continue with Google"
        variant="secondary"
        leading={<GoogleLogo />}
        loading={busy === "google"}
        disabled={busy !== null}
        onPress={() => onPress("google")}
      />
      <Button
        title="Continue with Apple"
        variant="secondary"
        leading={<AppleLogo />}
        loading={busy === "apple"}
        disabled={busy !== null}
        onPress={() => onPress("apple")}
      />
    </View>
  );
}
