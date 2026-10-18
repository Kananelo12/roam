import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { cn } from "@/lib/cn";

const variants = {
  display: "font-display text-display", // hero headlines, 56/56
  hero: "font-display-heavy text-hero", // onboarding titles, 36/39
  title: "font-display text-title", // screen and section headings, 30/36
  headline: "font-display text-headline", // card titles, prices, 20/26
  subhead: "font-body-semibold text-body", // row titles, 16/24
  callout: "font-body-medium text-body", // field labels, list rows, 16/24
  body: "font-body text-body", // paragraphs, 16/24
  button: "font-body-medium text-button", // button labels, 17/22
  caption: "font-body-medium text-caption", // metadata, locations, 14/20
  label: "font-body-medium text-label", // tab labels, fine print, 12/16
} as const;

const tones = {
  default: "text-foreground",
  muted: "text-muted-foreground",
  accent: "text-secondary-strong",
  success: "text-success",
  danger: "text-danger",
  info: "text-info",
  inverse: "text-white",
} as const;

export type TextVariant = keyof typeof variants;
export type TextTone = keyof typeof tones;

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  /** Layout only (margins, alignment). Use `tone` for color. */
  className?: string;
};

/** Every piece of copy in the app renders through this component. */
export function Text({ variant = "body", tone = "default", className, ...props }: TextProps) {
  return <RNText className={cn(variants[variant], tones[tone], className)} {...props} />;
}
