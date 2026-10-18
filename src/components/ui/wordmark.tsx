import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { colors } from "@/theme";

import { wordmark } from "./wordmark-path";

const sizes = {
  sm: 20, // auth header
  lg: 36, // Home, Profile, Onboarding
} as const;

const tones = {
  default: colors.foreground,
  inverse: colors.white,
} as const;

export type WordmarkProps = {
  size?: keyof typeof sizes;
  tone?: keyof typeof tones;
  /** Layout only (margins, alignment). */
  className?: string;
};

/** The Roam logo. Never set "roam" in a text style - use this. */
export function Wordmark({ size = "lg", tone = "default", className }: WordmarkProps) {
  const height = sizes[size];
  const width = (height * wordmark.width) / wordmark.height;

  return (
    <View accessible accessibilityRole="image" accessibilityLabel="roam" className={className}>
      <Svg width={width} height={height} viewBox={`0 0 ${wordmark.width} ${wordmark.height}`}>
        <Path d={wordmark.d} fill={tones[tone]} />
      </Svg>
    </View>
  );
}
