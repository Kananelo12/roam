import type { Feature, Stay } from "@/data/stays";

import type { QueryChip } from "./parse-query";

export type SortKey = "best" | "price" | "rating";

export type SearchResult = {
  stay: Stay;
  /** Up to two badges: what the guest asked for first, then the stay's highlights. */
  badges: Feature[];
};

// Strips simple plurals and -ly/-y endings so "cozy" meets "coziness" and "quietly" meets "quiet".
const stem = (word: string) => word.replace(/(ness|ly|ies|es|s|y)$/, "");

/**
 * Filters on every hard constraint the guest left on, then ranks by soft words
 * (vibes count double, description once), then rating. Stands in for the
 * Sanity query: GROQ filters plus `text::semanticSimilarity()` inside `score()`.
 */
export function searchStays(
  stays: Stay[],
  chips: QueryChip[],
  { off = new Set<string>(), sort = "best" }: { off?: ReadonlySet<string>; sort?: SortKey } = {},
): SearchResult[] {
  const active = chips.filter((chip) => !off.has(chip.key)).map((chip) => chip.constraint);
  const types = active.flatMap((c) => (c.kind === "type" ? [c.value] : []));
  const places = active.flatMap((c) => (c.kind === "place" ? [c.value] : []));
  const amenities = active.flatMap((c) => (c.kind === "amenity" ? [c.value] : []));
  const soft = active.flatMap((c) => (c.kind === "soft" ? [stem(c.value)] : []));
  const maxPrice = active.find((c) => c.kind === "price")?.value;
  const guests = active.find((c) => c.kind === "guests")?.value;
  const pets = active.some((c) => c.kind === "pets");

  const matches = stays.filter(
    (stay) =>
      (types.length === 0 || types.includes(stay.type)) &&
      (places.length === 0 ||
        places.some((place) => place === stay.city || place === stay.regionName)) &&
      amenities.every((amenity) => stay.amenities.includes(amenity)) &&
      (maxPrice === undefined || stay.pricePerNight <= maxPrice) &&
      (guests === undefined || stay.maxGuests >= guests) &&
      (!pets || stay.petsAllowed),
  );

  const scored = matches.map((stay) => {
    const vibes = stay.vibes.map(stem);
    const words = stay.description.toLowerCase().split(/[^a-z-]+/).map(stem);
    const score = soft.reduce(
      (total, term) => total + (vibes.includes(term) ? 2 : 0) + (words.includes(term) ? 1 : 0),
      0,
    );
    const asked: Feature[] = [...amenities, ...(pets ? (["pets"] as const) : [])];
    const badges = [...new Set([...asked, ...stay.highlights])].slice(0, 2);
    return { stay, badges, score };
  });

  const byRating = (a: Stay, b: Stay) => b.rating - a.rating || b.reviewCount - a.reviewCount;
  scored.sort((a, b) => {
    if (sort === "price") return a.stay.pricePerNight - b.stay.pricePerNight;
    if (sort === "rating") return byRating(a.stay, b.stay);
    return b.score - a.score || byRating(a.stay, b.stay);
  });

  return scored.map(({ stay, badges }) => ({ stay, badges }));
}
