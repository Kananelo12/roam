import { stays, type Amenity, type StayType } from "@/data/stays";

/**
 * Reads a guest's sentence into hard constraints (filtered on) and soft words
 * (ranked on), the same split the Sanity search will use: GROQ filters for the
 * constraints, embeddings for the rest. Values are always parsed here, in code.
 */

export type Constraint =
  | { kind: "type"; value: StayType }
  | { kind: "price"; value: number }
  | { kind: "guests"; value: number }
  | { kind: "pets" }
  | { kind: "amenity"; value: Amenity }
  | { kind: "place"; value: string }
  | { kind: "soft"; value: string };

/** One parsed piece of the query, shown as a chip the guest can turn off. */
export type QueryChip = { key: string; label: string; constraint: Constraint };

const typeWords: [RegExp, StayType][] = [
  [/\b(cabins?|a-?frames?|lodges?|chalets?)\b/g, "cabin"],
  [/\b(beach ?(houses?|homes?)?|beachfront|bungalows?|seaside|coastal)\b/g, "beach"],
  [/\b(city|apartments?|apts?|lofts?|flats?|condos?|downtown)\b/g, "city"],
  [/\b(villas?|mansions?)\b/g, "villa"],
];

const amenityWords: [RegExp, Amenity][] = [
  [/\b(hot ?tubs?|jacuzzis?|spas?)\b/g, "hot-tub"],
  [/\b((swimming )?pools?)\b/g, "pool"],
  [/\b(fire ?places?|wood ?stoves?)\b/g, "fireplace"],
  [/\b(wi-?fi|internet)\b/g, "wifi"],
  [/\b(ocean ?views?|sea ?views?|oceanfront|ocean)\b/g, "ocean-view"],
  [/\b(kitchens?)\b/g, "kitchen"],
  [/\b(parking|garage)\b/g, "parking"],
  [/\b(ski(-in)?|skiing|slopes)\b/g, "ski-in"],
  [/\b(ac|a\/c|air ?con(ditioning)?)\b/g, "air-conditioning"],
];

const petWords = /\b(pets? ?-?friendly|pets?|dogs?|cats?|puppy)\b/g;

const numberWords: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};
const count = "(\\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten)";
const toCount = (raw: string) => numberWords[raw] ?? Number(raw);

const pricePatterns = [
  /\b(?:under|below|less than|max(?:imum)?|up to|no more than|cheaper than)\s*\$?\s*(\d{2,5})\b/,
  /\$\s*(\d{2,5})\b/,
  /\b(\d{2,5})\s*(?:dollars|bucks|usd)\b/,
];
const guestPatterns = [
  new RegExp(`\\b${count}\\s*(?:guests?|people|persons|adults|of us)\\b`),
  new RegExp(`\\b(?:for|sleeps)\\s+${count}\\b`),
];

// Words that carry no intent on their own, so they never become soft terms.
const stopWords = new Set(
  (
    "a an the and or with without in near by for to of on at from is are it its that this " +
    "i me my we us our want need looking find show something somewhere some any place places " +
    "stay stays rental rentals home homes house houses getaway trip weekend night nights per " +
    "a-night nightly under below less than max up more no cheap than dollars bucks usd " +
    "guests guest people persons adults sleeps friendly very really nice good great " +
    "has have having where which"
  ).split(" "),
);

const typeLabels: Record<StayType, string> = {
  cabin: "Cabins",
  beach: "Beach",
  city: "City",
  villa: "Villas",
};

export const amenityLabels: Record<Amenity, string> = {
  "hot-tub": "Hot Tub",
  pool: "Pool",
  fireplace: "Fireplace",
  wifi: "Wifi",
  "ocean-view": "Ocean View",
  kitchen: "Kitchen",
  parking: "Parking",
  "ski-in": "Ski-in",
  "air-conditioning": "AC",
};

// Canonical place names come from the data: cities and state names match in any case,
// state codes ("CA") only when typed in capitals, so "hi" never means Hawaii.
const places = new Map<string, string>();
for (const stay of stays) {
  places.set(stay.city.toLowerCase(), stay.city);
  places.set(stay.regionName.toLowerCase(), stay.regionName);
}
const regionCodes = new Map(stays.map((stay) => [stay.region, stay.regionName]));

const capitalize = (word: string) => word[0].toUpperCase() + word.slice(1);

export function parseQuery(query: string): QueryChip[] {
  let text = ` ${query.toLowerCase().replace(/[’']/g, "")} `;
  const chips: QueryChip[] = [];
  const add = (constraint: Constraint, label: string) => {
    const key = "value" in constraint ? `${constraint.kind}:${constraint.value}` : constraint.kind;
    if (!chips.some((chip) => chip.key === key)) chips.push({ key, label, constraint });
  };
  // Each recognized phrase is blanked out so what's left over becomes soft terms.
  const take = (pattern: RegExp) => {
    const match = pattern.exec(text);
    if (match) text = text.replace(match[0], " ");
    return match;
  };

  for (const pattern of pricePatterns) {
    const match = take(pattern);
    if (match) {
      const value = Number(match[1]);
      add({ kind: "price", value }, `Under $${value}`);
      break;
    }
  }
  for (const pattern of guestPatterns) {
    const match = take(pattern);
    if (match) {
      const value = toCount(match[1]);
      if (value > 0) add({ kind: "guests", value }, `${value} ${value === 1 ? "guest" : "guests"}`);
      break;
    }
  }

  // Multi-word phrases go before single words, so "beach house" isn't read as two terms.
  for (const [pattern, value] of amenityWords) {
    if (text.match(pattern)) add({ kind: "amenity", value }, amenityLabels[value]);
    text = text.replace(pattern, " ");
  }
  for (const [pattern, value] of typeWords) {
    if (text.match(pattern)) add({ kind: "type", value }, typeLabels[value]);
    text = text.replace(pattern, " ");
  }
  if (text.match(petWords)) add({ kind: "pets" }, "Pet Friendly");
  text = text.replace(petWords, " ");

  for (const [name, canonical] of [...places].sort((a, b) => b[0].length - a[0].length)) {
    const pattern = new RegExp(`\\b${name}\\b`, "g");
    if (text.match(pattern)) add({ kind: "place", value: canonical }, canonical);
    text = text.replace(pattern, " ");
  }
  for (const code of query.match(/\b[A-Z]{2}\b/g) ?? []) {
    const name = regionCodes.get(code);
    if (name) {
      add({ kind: "place", value: name }, name);
      text = text.replace(new RegExp(`\\b${code.toLowerCase()}\\b`, "g"), " ");
    }
  }

  for (const word of text.split(/[^a-z-]+/)) {
    const term = word.replace(/^-+|-+$/g, "");
    if (term.length > 2 && !stopWords.has(term)) {
      add({ kind: "soft", value: term }, capitalize(term));
    }
  }

  // Chips read type first, then the numbers, then features, as in the design.
  return chips.sort((a, b) => chipOrder.indexOf(a.constraint.kind) - chipOrder.indexOf(b.constraint.kind));
}

const chipOrder: Constraint["kind"][] = ["type", "place", "price", "guests", "pets", "amenity", "soft"];
