import { styled } from "nativewind";
import type { ComponentType } from "react";
import type { ViewProps } from "react-native";
import Animated, {
  type BaseAnimationBuilder,
  type EntryOrExitLayoutType,
  type LayoutAnimationFunction,
} from "react-native-reanimated";

export type AnimatedViewProps = ViewProps & {
  className?: string;
  entering?: EntryOrExitLayoutType;
  exiting?: EntryOrExitLayoutType;
  layout?: BaseAnimationBuilder | LayoutAnimationFunction | typeof BaseAnimationBuilder;
};

/**
 * Reanimated's View with className support (NativeWind only maps react-native's
 * own components). Use it for layout animations: entering, exiting, layout.
 * Never pass it a useAnimatedStyle() result: styled() reads styles during
 * render. Animate those on a plain Animated.View.
 * Typed by hand: Reanimated's full AnimatedProps is too deep for styled().
 */
export const AnimatedView = styled(Animated.View as unknown as ComponentType<AnimatedViewProps>, {
  className: "style",
}) as ComponentType<AnimatedViewProps>;
