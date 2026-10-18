import { View } from "react-native";

import { cn } from "@/lib/cn";

type ProgressBarsProps = {
  count: number;
  active: number;
};

export function ProgressBars({ count, active }: ProgressBarsProps) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Slide ${active + 1} of ${count}`}
      className="flex-row gap-2"
    >
      {Array.from({ length: count }, (_, i) => (
        <View key={i} className={cn("h-1.5 w-8 rounded-full", i === active ? "bg-secondary" : "bg-border")} />
      ))}
    </View>
  );
}
