import { styled } from "nativewind";
import { useState, type ComponentType, type ReactNode } from "react";
import { Pressable, type ColorValue, type PressableProps, type StyleProp } from "react-native";
import Animated, { useReducedMotion, type CSSStyle } from "react-native-reanimated";

import { CSS_EASE_OUT } from "@/theme/motion";

type AnimatedPressableProps = Omit<PressableProps, "style"> & {
  className?: string;
  style?: StyleProp<CSSStyle>;
};

// NativeWind only maps className on react-native's own components, so the animated one opts in.
// The cast skips styled()'s generic inference, which is too deep for Reanimated's prop types.
const AnimatedPressable = styled(
  Animated.createAnimatedComponent(Pressable) as ComponentType<AnimatedPressableProps>,
  { className: "style" },
) as ComponentType<AnimatedPressableProps>;

export type PressableScaleProps = Omit<PressableProps, "children" | "style"> & {
  children?: ReactNode;
  className?: string;
  /** Background that cross-fades (150 ms) when it changes, e.g. a chip's selected fill. */
  fill?: ColorValue;
};

/**
 * Every button-like pressable: shrinks to 0.97 while pressed (120 ms), so the
 * label, icon and fill move together. Reduced motion keeps it still.
 */
export function PressableScale({ fill, onPressIn, onPressOut, ...props }: PressableScaleProps) {
  const [pressed, setPressed] = useState(false);
  const reduced = useReducedMotion();

  return (
    <AnimatedPressable
      pressRetentionOffset={16}
      onPressIn={(e) => {
        setPressed(true);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        onPressOut?.(e);
      }}
      style={{
        transform: [{ scale: pressed && !reduced ? 0.97 : 1 }],
        ...(fill === undefined ? null : { backgroundColor: fill }),
        transitionProperty: ["transform", "backgroundColor"],
        transitionDuration: [120, 150],
        transitionTimingFunction: CSS_EASE_OUT,
      }}
      {...props}
    />
  );
}
