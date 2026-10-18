import { Stack } from "expo-router";
import ArrowRight from "lucide-react-native/icons/arrow-right";
import Bookmark from "lucide-react-native/icons/bookmark";
import Building from "lucide-react-native/icons/building";
import ChevronLeft from "lucide-react-native/icons/chevron-left";
import EyeOff from "lucide-react-native/icons/eye-off";
import Heart from "lucide-react-native/icons/heart";
import House from "lucide-react-native/icons/house";
import Lock from "lucide-react-native/icons/lock";
import Mail from "lucide-react-native/icons/mail";
import Search from "lucide-react-native/icons/search";
import Share from "lucide-react-native/icons/share";
import SlidersHorizontal from "lucide-react-native/icons/sliders-horizontal";
import Star from "lucide-react-native/icons/star";
import TreePine from "lucide-react-native/icons/tree-pine";
import User from "lucide-react-native/icons/user";
import Waves from "lucide-react-native/icons/waves-horizontal";
import { useState, type ReactNode } from "react";
import { ScrollView, View } from "react-native";

import {
  Badge,
  Button,
  Chip,
  Icon,
  IconButton,
  Text,
  TextField,
  Wordmark,
} from "@/components/ui";

const filters = ["Cabins", "Under $300", "Pet Friendly", "Quiet"];
const categories = [
  { label: "All Stays", icon: House },
  { label: "Cabins", icon: TreePine },
  { label: "Beach", icon: Waves },
  { label: "City", icon: Building },
];

/** Living reference for the Roam design system. Not linked from the product UI. */
export default function DesignSystemScreen() {
  const [filter, setFilter] = useState("Cabins");
  const [category, setCategory] = useState("All Stays");

  return (
    <>
      <Stack.Screen options={{ title: "Design system" }} />
      <ScrollView
        className="flex-1 bg-surface"
        contentContainerClassName="gap-10 px-5 py-8"
        contentInsetAdjustmentBehavior="automatic"
      >
        <Section title="Brand">
          <Wordmark size="lg" />
          <Wordmark size="sm" />
          <View className="self-start rounded-xl bg-foreground p-5 corner-squircle">
            <Wordmark size="lg" tone="inverse" />
          </View>
        </Section>

        <Section title="Typography">
          <Text variant="display">Find your next stay</Text>
          <Text variant="title">Modern Cabin with Hot Tub</Text>
          <Text variant="headline">$280 / night</Text>
          <Text variant="subhead">Ask about policies</Text>
          <Text variant="callout">Personal info</Text>
          <Text variant="body" tone="muted">
            From mountain cabins to oceanfront villas, roam helps you find unforgettable stays for
            every kind of trip.
          </Text>
          <Text variant="caption" tone="muted">
            Lake Arrowhead, CA
          </Text>
          <Text variant="label">Home</Text>
        </Section>

        <Section title="Buttons">
          <Button title="Book this stay" trailing={<Icon as={ArrowRight} />} />
          <Button title="Continue with Google" variant="secondary" />
          <View className="flex-row gap-3">
            <Button title="Book this stay" size="sm" />
            <Button title="Loading" size="sm" loading />
          </View>
          <View className="flex-row gap-3">
            <IconButton accessibilityLabel="Save" icon={<Icon as={Heart} />} />
            <IconButton accessibilityLabel="Share" icon={<Icon as={Share} />} />
            <IconButton accessibilityLabel="Search" icon={<Icon as={Search} />} />
            <IconButton accessibilityLabel="Bookmark" icon={<Icon as={Bookmark} />} />
            <IconButton accessibilityLabel="Back" variant="outline" size="sm" icon={<Icon as={ChevronLeft} />} />
          </View>
        </Section>

        <Section title="Input fields">
          <TextField
            placeholder="Cabins in California"
            leading={<Icon as={Search} />}
            trailing={<Icon as={SlidersHorizontal} />}
          />
          <TextField placeholder="Enter your name" leading={<Icon as={User} />} />
          <TextField
            placeholder="Password"
            secureTextEntry
            leading={<Icon as={Lock} />}
            trailing={<Icon as={EyeOff} />}
          />
          <TextField
            label="Email address"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            leading={<Icon as={Mail} />}
          />
          <TextField
            label="Email address"
            placeholder="you@example.com"
            defaultValue="guest@roam"
            error="Enter a valid email address."
            leading={<Icon as={Mail} />}
          />
        </Section>

        <Section title="Filter chips">
          <View className="flex-row flex-wrap gap-2">
            {filters.map((label) => (
              <Chip
                key={label}
                label={label}
                selected={filter === label}
                onPress={() => setFilter(label)}
              />
            ))}
          </View>
          <View className="flex-row flex-wrap gap-2">
            {categories.map(({ label, icon }) => {
              const selected = category === label;
              return (
                <Chip
                  key={label}
                  label={label}
                  size="sm"
                  selectedTone="primary"
                  selected={selected}
                  onPress={() => setCategory(label)}
                  icon={<Icon as={icon} size={18} filled={selected} />}
                />
              );
            })}
          </View>
        </Section>

        <Section title="Tags / badges">
          <View className="flex-row flex-wrap gap-2">
            <Badge
              label="Guest favorite"
              tone="highlight"
              icon={<Icon as={Star} size={16} tone="primary" filled />}
            />
            <Badge label="New" tone="success" />
            <Badge label="20% off" tone="danger" />
            <Badge label="Superhost" tone="info" />
            <Badge label="Hot Tub" />
          </View>
        </Section>

        <Section title="Surfaces">
          <View className="gap-1 rounded-xl bg-secondary-soft p-4 corner-squircle">
            <Text variant="subhead">Free cancellation</Text>
            <Text variant="caption" tone="muted">
              Full refund up to 7 days before check-in.
            </Text>
          </View>
          <View className="gap-1 rounded-2xl bg-surface p-4 shadow-card corner-squircle">
            <Text variant="headline">Modern Cabin with Hot Tub</Text>
            <Text variant="caption" tone="muted">
              Lake Arrowhead, CA
            </Text>
          </View>
        </Section>
      </ScrollView>
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-4">
      <Text variant="caption" tone="muted">
        {title.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}
