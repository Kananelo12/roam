import { ScrollView } from "react-native";

import { Chip } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { QueryChip } from "@/lib/search";

export type QueryChipsProps = {
  chips: QueryChip[];
  /** Keys of the constraints the guest turned off. */
  off: ReadonlySet<string>;
  onToggle: (key: string) => void;
  className?: string;
};

/** What the search understood, one chip per constraint. Tapping one turns it off and back on. */
export function QueryChips({ chips, off, onToggle, className }: QueryChipsProps) {
  if (chips.length === 0) return null;

  return (
    // Bleeds past the screen gutter so chips scroll to the edge, as designed.
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={cn("-mx-5 grow-0", className)}
      contentContainerClassName="gap-2 px-5"
      keyboardShouldPersistTaps="handled"
    >
      {chips.map((chip) => (
        <Chip
          key={chip.key}
          label={chip.label}
          size="sm"
          selected={!off.has(chip.key)}
          accessibilityHint={off.has(chip.key) ? "Turns this filter back on" : "Turns this filter off"}
          onPress={() => onToggle(chip.key)}
        />
      ))}
    </ScrollView>
  );
}
