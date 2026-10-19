/**
 * Local stays, shaped like the future Sanity `property` document. The Sanity
 * plan replaces this file; screens read stays only through `stays` and
 * `searchStays()`, so they don't change.
 */

export type StayType = "cabin" | "beach" | "city" | "villa";

export type Amenity =
  | "hot-tub"
  | "pool"
  | "fireplace"
  | "wifi"
  | "ocean-view"
  | "kitchen"
  | "parking"
  | "ski-in"
  | "air-conditioning";

/** Anything a stay can show as a badge: an amenity, or that pets are welcome. */
export type Feature = Amenity | "pets";

export type Stay = {
  id: string;
  title: string;
  type: StayType;
  city: string;
  /** State code, e.g. "CA". */
  region: string;
  regionName: string;
  pricePerNight: number;
  rating: number;
  reviewCount: number;
  maxGuests: number;
  petsAllowed: boolean;
  amenities: Amenity[];
  /** The two badges shown when a search didn't ask for anything specific. */
  highlights: [Feature, Feature];
  /** Soft words this stay is known for; search ranks on them (embeddings later). */
  vibes: string[];
  description: string;
  /** Unsplash photo id; sized with `photoUrl`. */
  photoId: string;
};

/** A cropped Unsplash URL at the given width in device pixels. */
export const photoUrl = (stay: Stay, width: number) =>
  `https://images.unsplash.com/photo-${stay.photoId}?w=${Math.round(width)}&q=75&auto=format&fit=crop`;

export const stays: Stay[] = [
  {
    id: "modern-cabin-lake-arrowhead",
    title: "Modern Cabin with Hot Tub",
    type: "cabin",
    city: "Lake Arrowhead",
    region: "CA",
    regionName: "California",
    pricePerNight: 289,
    rating: 4.9,
    reviewCount: 342,
    maxGuests: 4,
    petsAllowed: true,
    amenities: ["hot-tub", "fireplace", "wifi", "kitchen", "parking"],
    highlights: ["hot-tub", "pets"],
    vibes: ["quiet", "cozy", "romantic", "lakeside", "snowy"],
    description:
      "A glass-fronted cabin among snowy pines a short walk from the lake. Soak in the cedar hot tub, then warm up by the wood stove.",
    photoId: "1510798831971-661eb04b3739",
  },
  {
    id: "oceanview-villa-malibu",
    title: "Oceanview Villa with Private Pool",
    type: "villa",
    city: "Malibu",
    region: "CA",
    regionName: "California",
    pricePerNight: 412,
    rating: 4.8,
    reviewCount: 128,
    maxGuests: 8,
    petsAllowed: false,
    amenities: ["pool", "ocean-view", "wifi", "kitchen", "air-conditioning", "parking"],
    highlights: ["pool", "ocean-view"],
    vibes: ["luxurious", "romantic", "sunset", "private", "views"],
    description:
      "An infinity pool that runs into the Pacific, cabanas for long afternoons, and sunsets from every bedroom.",
    photoId: "1571003123894-1f0594d2b5d9",
  },
  {
    id: "a-frame-monte-rio",
    title: "A-Frame in the Redwoods",
    type: "cabin",
    city: "Monte Rio",
    region: "CA",
    regionName: "California",
    pricePerNight: 236,
    rating: 4.9,
    reviewCount: 96,
    maxGuests: 4,
    petsAllowed: true,
    amenities: ["fireplace", "wifi", "kitchen", "parking"],
    highlights: ["fireplace", "pets"],
    vibes: ["secluded", "quiet", "forest", "cozy", "rustic"],
    description:
      "A tall A-frame tucked under old-growth redwoods by the Russian River. No neighbors in sight, just the fire and the trees.",
    photoId: "1595521624992-48a59aef95e3",
  },
  {
    id: "beachfront-bungalow-kaanapali",
    title: "Beachfront Bungalow on the Sand",
    type: "beach",
    city: "Kaanapali",
    region: "HI",
    regionName: "Hawaii",
    pricePerNight: 398,
    rating: 4.8,
    reviewCount: 187,
    maxGuests: 4,
    petsAllowed: false,
    amenities: ["ocean-view", "wifi", "kitchen", "air-conditioning"],
    highlights: ["ocean-view", "air-conditioning"],
    vibes: ["beachfront", "tropical", "romantic", "relaxing", "sunny"],
    description:
      "A thatched bungalow with steps straight onto the sand. Snorkel off the reef in the morning and watch the sunset from the deck.",
    photoId: "1499793983690-e29da59ef1c2",
  },
  {
    id: "designer-home-healdsburg",
    title: "Designer Home in Wine Country",
    type: "villa",
    city: "Healdsburg",
    region: "CA",
    regionName: "California",
    pricePerNight: 520,
    rating: 4.7,
    reviewCount: 201,
    maxGuests: 6,
    petsAllowed: false,
    amenities: ["hot-tub", "fireplace", "wifi", "kitchen", "parking", "air-conditioning"],
    highlights: ["hot-tub", "fireplace"],
    vibes: ["elegant", "quiet", "vineyards", "modern", "peaceful"],
    description:
      "A modern glass home under a giant oak, minutes from tasting rooms. Cook in the chef's kitchen, then end the night in the hot tub.",
    photoId: "1600585154340-be6161a56a0c",
  },
  {
    id: "log-cabin-big-bear",
    title: "Log Cabin in the Pines",
    type: "cabin",
    city: "Big Bear Lake",
    region: "CA",
    regionName: "California",
    pricePerNight: 189,
    rating: 4.7,
    reviewCount: 158,
    maxGuests: 6,
    petsAllowed: false,
    amenities: ["hot-tub", "fireplace", "kitchen", "parking", "ski-in", "wifi"],
    highlights: ["ski-in", "hot-tub"],
    vibes: ["cozy", "rustic", "family", "snowy", "forest"],
    description:
      "A classic log cabin five minutes from the slopes, with bunk beds for the kids, a stone fireplace and a hot tub on the back deck.",
    photoId: "1587061949409-02df41d5e562",
  },
  {
    id: "coastal-house-santa-barbara",
    title: "Coastal House with Pool",
    type: "beach",
    city: "Santa Barbara",
    region: "CA",
    regionName: "California",
    pricePerNight: 365,
    rating: 4.7,
    reviewCount: 129,
    maxGuests: 8,
    petsAllowed: true,
    amenities: ["pool", "wifi", "kitchen", "parking", "air-conditioning"],
    highlights: ["pool", "pets"],
    vibes: ["family", "sunny", "breezy", "spacious", "palm"],
    description:
      "A bright two-story house with a big pool under the palms, a few blocks from the beach. Room for the whole family and the dog.",
    photoId: "1564013799919-ab600027ffc6",
  },
  {
    id: "mission-loft-san-francisco",
    title: "Sunny Loft in the Mission",
    type: "city",
    city: "San Francisco",
    region: "CA",
    regionName: "California",
    pricePerNight: 175,
    rating: 4.8,
    reviewCount: 264,
    maxGuests: 2,
    petsAllowed: false,
    amenities: ["wifi", "kitchen", "air-conditioning"],
    highlights: ["wifi", "kitchen"],
    vibes: ["bright", "walkable", "cozy", "plants", "artsy"],
    description:
      "A plant-filled loft above a quiet courtyard, steps from taquerias, coffee and Dolores Park. Fast wifi and a desk for remote work.",
    photoId: "1502672260266-1c1ef2d93688",
  },
  {
    id: "hilltop-cabin-asheville",
    title: "Hilltop Cabin at Sunset",
    type: "cabin",
    city: "Asheville",
    region: "NC",
    regionName: "North Carolina",
    pricePerNight: 168,
    rating: 4.8,
    reviewCount: 143,
    maxGuests: 3,
    petsAllowed: true,
    amenities: ["hot-tub", "wifi", "kitchen", "parking"],
    highlights: ["hot-tub", "pets"],
    vibes: ["quiet", "secluded", "views", "mountains", "peaceful"],
    description:
      "A small cabin on its own ridge in the Blue Ridge Mountains. Watch the sun go down over the valley from the hot tub.",
    photoId: "1542718610-a1d656d1884c",
  },
  {
    id: "beach-house-encinitas",
    title: "Modern Beach House near the Surf",
    type: "beach",
    city: "Encinitas",
    region: "CA",
    regionName: "California",
    pricePerNight: 310,
    rating: 4.6,
    reviewCount: 88,
    maxGuests: 6,
    petsAllowed: true,
    amenities: ["pool", "wifi", "kitchen", "parking"],
    highlights: ["pool", "pets"],
    vibes: ["surf", "laid-back", "sunny", "modern", "family"],
    description:
      "A white modern house with a plunge pool, a short walk to the surf breaks. Boards and wetsuits are in the garage.",
    photoId: "1602343168117-bb8ffe3e2e9f",
  },
  {
    id: "designer-flat-seattle",
    title: "Designer Flat near Pike Place",
    type: "city",
    city: "Seattle",
    region: "WA",
    regionName: "Washington",
    pricePerNight: 149,
    rating: 4.6,
    reviewCount: 301,
    maxGuests: 3,
    petsAllowed: true,
    amenities: ["wifi", "kitchen", "parking", "air-conditioning"],
    highlights: ["wifi", "pets"],
    vibes: ["walkable", "modern", "lively", "bright", "minimal"],
    description:
      "A clean, minimal flat with big windows, two blocks from Pike Place Market and the waterfront. Parking included.",
    photoId: "1493809842364-78817add7ffb",
  },
  {
    id: "modern-villa-palm-springs",
    title: "Palm Springs Modern Villa",
    type: "villa",
    city: "Palm Springs",
    region: "CA",
    regionName: "California",
    pricePerNight: 650,
    rating: 4.9,
    reviewCount: 77,
    maxGuests: 10,
    petsAllowed: true,
    amenities: ["pool", "hot-tub", "air-conditioning", "wifi", "kitchen", "parking"],
    highlights: ["pool", "hot-tub"],
    vibes: ["luxurious", "desert", "lively", "modern", "sunny"],
    description:
      "A white modernist villa with a long saltwater pool, a spa and mountain views. Made for big groups and long, warm evenings.",
    photoId: "1613490493576-7fde63acd811",
  },
];
