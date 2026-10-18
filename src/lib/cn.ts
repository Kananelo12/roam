/**
 * Joins class names, dropping falsy values.
 * NativeWind resolves conflicting classes by stylesheet order, not by position
 * in the string, so callers should only append layout classes (margin, flex,
 * width) - never re-color a component through className.
 */
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
