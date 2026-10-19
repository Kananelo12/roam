/**
 * JS mirror of type tokens in src/global.css, for props that cannot take a
 * className (native tab bar labels). global.css is the source of truth.
 */
export const typography = {
  /** `text-label` in `font-body-medium`. */
  label: { fontFamily: "Urbanist-Medium", fontSize: 12 },
} as const;
