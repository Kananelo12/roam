import { router, useLocalSearchParams } from "expo-router";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import SearchIcon from "lucide-react-native/icons/search";
import { useState } from "react";
import { Pressable, View } from "react-native";
import Animated, { Keyframe, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TabBarSpacer } from "@/components/navigation/tab-bar-spacer";
import { QueryChips } from "@/components/search/query-chips";
import { ResultRow } from "@/components/search/result-row";
import { SortButton, SortMenu } from "@/components/search/sort-menu";
import { AnimatedView, Icon, IconButton, Text, TextField } from "@/components/ui";
import { stays } from "@/data/stays";
import { parseQuery, searchStays, type SortKey } from "@/lib/search";
import { EASE_IN_OUT, EASE_OUT } from "@/theme/motion";

// A new query or sort is a new list: it rises 8 px and fades in. (Sliding every row to a new
// place at once makes them cross and overlap.) Chip toggles only add or remove rows, so the
// remaining rows slide to close the gaps.
const RESULTS_ENTER = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: 8 }] },
  100: { opacity: 1, transform: [{ translateY: 0 }], easing: EASE_OUT },
}).duration(220);
const ROW_REFLOW = LinearTransition.duration(250).easing(EASE_IN_OUT);

export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [sort, setSort] = useState<SortKey>("best");

  // Keyed by the query: a new one (from Home or the field) starts with its text and every chip on.
  return <SearchResults key={q ?? ""} query={q ?? ""} sort={sort} onSortChange={setSort} />;
}

type SearchResultsProps = {
  query: string;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
};

function SearchResults({ query, sort, onSortChange }: SearchResultsProps) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState(query);
  const [off, setOff] = useState<ReadonlySet<string>>(new Set());
  const [sortOpen, setSortOpen] = useState(false);

  const chips = parseQuery(query);
  const results = searchStays(stays, chips, { off, sort });

  const toggle = (key: string) =>
    setOff((current) => {
      const next = new Set(current);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  return (
    <View className="flex-1 bg-surface">
      <View className="z-20 px-5" style={{ paddingTop: insets.top + 8 }}>
        <View className="flex-row items-center gap-3">
          <IconButton
            accessibilityLabel="Back to Home"
            icon={<Icon as={ChevronLeft} />}
            onPress={() => router.navigate("/home")}
          />
          <TextField
            shape="pill"
            className="flex-1"
            accessibilityLabel="Search stays"
            placeholder="Describe your stay"
            returnKeyType="search"
            leading={<Icon as={SearchIcon} />}
            value={text}
            onChangeText={setText}
            onSubmitEditing={() => router.setParams({ q: text.trim() })}
          />
        </View>
        <QueryChips chips={chips} off={off} onToggle={toggle} className="mt-3" />
        <View className="mt-4 flex-row items-center justify-between">
          {/* One string child: Android didn't redraw the pieces of "4 stays" when the count changed. */}
          <Text>{`${results.length} ${results.length === 1 ? "stay" : "stays"}`}</Text>
          <SortButton value={sort} open={sortOpen} onPress={() => setSortOpen((open) => !open)} />
          {sortOpen ? (
            <SortMenu value={sort} onChange={onSortChange} onClose={() => setSortOpen(false)} />
          ) : null}
        </View>
      </View>

      {sortOpen ? (
        <Pressable
          accessibilityLabel="Close sort options"
          className="absolute inset-0 z-10"
          onPress={() => setSortOpen(false)}
        />
      ) : null}

      <AnimatedView key={sort} entering={RESULTS_ENTER} className="mt-4 flex-1 px-5">
        <Animated.FlatList
          data={results}
          keyExtractor={(result) => result.stay.id}
          renderItem={({ item }) => <ResultRow result={item} />}
          itemLayoutAnimation={ROW_REFLOW}
          ItemSeparatorComponent={RowGap}
          ListFooterComponent={ListEnd}
          ListEmptyComponent={EmptyResults}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        />
      </AnimatedView>
    </View>
  );
}

function RowGap() {
  return <View className="h-4" />;
}

/** Space after the last row, clear of the Android tab bar. */
function ListEnd() {
  return (
    <>
      <RowGap />
      <TabBarSpacer />
    </>
  );
}

function EmptyResults() {
  return (
    <View className="items-center gap-2 pt-12">
      <Icon as={SearchIcon} size={32} tone="muted" />
      <Text variant="headline" className="mt-1 text-center">
        No stays match all of that
      </Text>
      <Text tone="muted" className="text-center">
        Try turning off a filter above.
      </Text>
    </View>
  );
}
