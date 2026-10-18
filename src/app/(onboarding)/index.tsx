import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import ArrowRight from "lucide-react-native/icons/arrow-right";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OnboardingSlide } from "@/components/onboarding/onboarding-slide";
import { slides, type Slide } from "@/components/onboarding/slides";
import { Button, GoogleLogo, Icon, Text, Wordmark } from "@/components/ui";

const AUTO_ADVANCE_MS = 5000;

const goToAuth = () => router.push("/sign-up");

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const listRef = useRef<FlatList<Slide>>(null);

  const [index, setIndex] = useState(0);
  const [pagerHeight, setPagerHeight] = useState(0);
  const [userSwiped, setUserSwiped] = useState(false);
  const [focused, setFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  // Auto-advance until the guest takes over, wrapping after the last slide.
  useEffect(() => {
    if (userSwiped || reduceMotion || !focused || pagerHeight === 0) return;
    const timer = setTimeout(() => {
      listRef.current?.scrollToIndex({ index: (index + 1) % slides.length, animated: true });
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [index, userSwiped, reduceMotion, focused, pagerHeight]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next !== index && next >= 0 && next < slides.length) setIndex(next);
  };

  return (
    <View className="flex-1 bg-surface">
      <StatusBar style="dark" />

      <View className="flex-1" onLayout={(e) => setPagerHeight(e.nativeEvent.layout.height)}>
        {pagerHeight > 0 ? (
          <FlatList
            ref={listRef}
            data={slides}
            keyExtractor={(slide) => slide.id}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={onScroll}
            onScrollBeginDrag={() => setUserSwiped(true)}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            renderItem={({ item, index: i }) => (
              <OnboardingSlide slide={item} index={i} count={slides.length} width={width} height={pagerHeight} />
            )}
          />
        ) : null}
      </View>

      <View className="gap-3 bg-surface px-6 pt-5" style={{ paddingBottom: insets.bottom + 16 }}>
        <Button title="Get started" trailing={<Icon as={ArrowRight} />} onPress={goToAuth} />
        <Button title="Continue with Google" variant="secondary" leading={<GoogleLogo />} onPress={goToAuth} />
      </View>

      <View
        pointerEvents="box-none"
        className="absolute inset-x-0 flex-row items-center justify-between px-6"
        style={{ top: insets.top + 12 }}
      >
        <Wordmark size="lg" />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Skip"
          hitSlop={8}
          onPress={goToAuth}
          className="h-11 justify-center rounded-full bg-glass px-5 active:opacity-80"
        >
          <Text variant="callout">Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}
