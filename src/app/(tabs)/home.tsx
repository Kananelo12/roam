import { useState } from "react";
import { ScrollView, View } from "react-native";
import { FadeIn, FadeOut, Keyframe, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryChips } from "@/components/home/category-chips";
import { HomeHeader, HomeIntro } from "@/components/home/home-header";
import { SearchPill } from "@/components/home/search-pill";
import { StayCard } from "@/components/home/stay-card";
import { AnimatedView } from "@/components/ui";
import { stays, type StayType } from "@/data/stays";
import { useAuth } from "@/lib/auth";
import { EASE_IN_OUT, EASE_OUT } from "@/theme/motion";

// The header settles in once per sign-in: a 12 px rise and fade, 40 ms apart.
const rise = (index: number) =>
  new Keyframe({
    0: { opacity: 0, transform: [{ translateY: 12 }] },
    100: { opacity: 1, transform: [{ translateY: 0 }], easing: EASE_OUT },
  })
    .duration(300)
    .delay(index * 40);
const HEADER_ENTER = [rise(0), rise(1), rise(2), rise(3)];

// A category change fades cards in and out while the rest close the gap.
const CARD_ENTER = FadeIn.duration(180).easing(EASE_OUT);
const CARD_EXIT = FadeOut.duration(120).easing(EASE_OUT);
const CARD_REFLOW = LinearTransition.duration(220).easing(EASE_IN_OUT);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const [category, setCategory] = useState<StayType | null>(null);
  const feed = category ? stays.filter((stay) => stay.type === category) : stays;
  const name = session?.name ?? "";

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName="px-5 pb-6"
      contentContainerStyle={{ paddingTop: insets.top + 8 }}
      keyboardShouldPersistTaps="handled"
    >
      <AnimatedView entering={HEADER_ENTER[0]}>
        <HomeHeader name={name} imageUrl={session?.imageUrl ?? null} />
      </AnimatedView>
      <AnimatedView entering={HEADER_ENTER[1]} className="mt-2">
        <HomeIntro name={name} />
      </AnimatedView>
      <AnimatedView entering={HEADER_ENTER[2]} className="mt-4">
        <SearchPill />
      </AnimatedView>
      <AnimatedView entering={HEADER_ENTER[3]} className="mt-3">
        <CategoryChips value={category} onChange={setCategory} />
      </AnimatedView>
      <View className="mt-4 gap-5">
        {feed.map((stay) => (
          <AnimatedView key={stay.id} entering={CARD_ENTER} exiting={CARD_EXIT} layout={CARD_REFLOW}>
            <StayCard stay={stay} />
          </AnimatedView>
        ))}
      </View>
    </ScrollView>
  );
}
