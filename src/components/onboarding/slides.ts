export type Slide = {
  id: string;
  photo: string;
  location: string;
  title: string;
  body: string;
};

const unsplash = (id: string) => `https://images.unsplash.com/${id}?w=1200&q=80&fm=jpg&fit=crop`;

/** Placeholder photos from Unsplash until stays come from Sanity. */
export const slides: Slide[] = [
  {
    id: "story",
    photo: unsplash("photo-1510798831971-661eb04b3739"),
    location: "Whistler, BC",
    title: "Find a stay that fits your story",
    body: "From mountain cabins to oceanfront villas, roam helps you find unforgettable stays for every kind of trip.",
  },
  {
    id: "describe",
    photo: unsplash("photo-1564013799919-ab600027ffc6"),
    location: "Malibu, CA",
    title: "Say it the way you'd say it",
    body: "Describe your trip in one sentence, like “quiet pet friendly cabin with a hot tub under $300 a night”, and roam ranks the stays that fit.",
  },
  {
    id: "answers",
    photo: unsplash("photo-1542718610-a1d656d1884c"),
    location: "Lake Tahoe, CA",
    title: "Answers straight from the source",
    body: "Ask about pets, check-in or cancellations and see the stay’s own policy, word for word.",
  },
];
