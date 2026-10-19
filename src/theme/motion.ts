import { cubicBezier, Easing } from "react-native-reanimated";

/**
 * Motion curves from the expo-animation skill. Every animation in the app uses
 * these; never approximate a curve or use Easing.in on UI.
 */

/**
 * A Reanimated CSS timing function that survives NativeWind. styled() copies
 * style objects, which drops the prototype method `normalize` that Reanimated
 * reads, so it's re-exposed as an own property.
 */
const cssCurve = (x1: number, y1: number, x2: number, y2: number) => {
  const curve = cubicBezier(x1, y1, x2, y2);
  return Object.assign(Object.create(Object.getPrototypeOf(curve)), curve, {
    normalize: () => curve.normalize(),
  }) as typeof curve;
};

/** CSS transitions: entering, exiting and press feedback. */
export const CSS_EASE_OUT = cssCurve(0.23, 1, 0.32, 1);
/** CSS transitions: something moving or rotating on screen. */
export const CSS_EASE_IN_OUT = cssCurve(0.77, 0, 0.175, 1);

/** withTiming and layout animations: entering and exiting. */
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
/** withTiming and layout animations: on-screen movement and reflow. */
export const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);
