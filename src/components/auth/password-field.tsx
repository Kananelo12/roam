import Eye from "lucide-react-native/icons/eye";
import EyeOff from "lucide-react-native/icons/eye-off";
import Lock from "lucide-react-native/icons/lock";
import { useState } from "react";
import { Pressable } from "react-native";

import { Icon, TextField, type TextFieldProps } from "@/components/ui";

/** A labeled password field with a show/hide toggle. Hidden shows eye-off, as designed. */
export function PasswordField(props: Omit<TextFieldProps, "secureTextEntry" | "leading" | "trailing">) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      leading={<Icon as={Lock} />}
      trailing={
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={visible ? "Hide password" : "Show password"}
          hitSlop={8}
          onPress={() => setVisible((v) => !v)}
        >
          <Icon as={visible ? Eye : EyeOff} />
        </Pressable>
      }
      {...props}
    />
  );
}
