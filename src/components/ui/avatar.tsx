import { Image } from "expo-image";
import { View } from "react-native";

import { cn } from "@/lib/cn";

import { Text } from "./text";

const sizes = {
  lg: { container: "size-22", text: "title" }, // Home header, Profile
  md: { container: "size-14", text: "headline" },
} as const;

export type AvatarProps = {
  /** Profile photo; initials show when it's missing. */
  uri: string | null;
  name: string;
  size?: keyof typeof sizes;
  /** Layout only (margins, alignment). */
  className?: string;
};

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export function Avatar({ uri, name, size = "lg", className }: AvatarProps) {
  return (
    <View
      className={cn(
        "items-center justify-center overflow-hidden rounded-full bg-primary",
        sizes[size].container,
        className,
      )}
    >
      {uri ? (
        <Image source={uri} contentFit="cover" transition={200} style={{ width: "100%", height: "100%" }} />
      ) : (
        <Text variant={sizes[size].text}>{initialsOf(name)}</Text>
      )}
    </View>
  );
}
