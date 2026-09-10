/* The one list of work. The homepage renders it grouped by employer; case
   studies read it flattened, to find their neighbours. Adding a project here
   updates both. */

const placeholder = "/placeholder.png";
const fanned = [placeholder, placeholder, placeholder] as const;

/* The three cards live together under the case study's own slug, named for
   the position they take in the fan rather than for what they show: the
   front card is the only one read whole, and the outer two are chosen for
   the strip of their outer edge that shows past it. */
const cards = (slug: string) =>
  [
    `/work/${slug}/card-1-left.png`,
    `/work/${slug}/card-2-front.png`,
    `/work/${slug}/card-3-right.png`,
  ] as const;

export type Project = {
  name: string;
  description: string;
  /* Three, fanned in the row. Exactly three: the fan's offsets and
     rotations are written per card, so a fourth would have nowhere to sit
     and two would leave a hole where the third belongs. */
  thumbnails: readonly [string, string, string];
  /* Every project has a page. Whether it is linked depends on the case
     study's own `draft` flag — see app/case-studies.ts. */
  href: string;
};

export type Group = {
  company: string;
  logo: string;
  logoDark?: string;
  period: string;
  role: string;
  context: string;
  items: Project[];
};

export const groups: Group[] = [
  {
    company: "Car & Classic",
    logo: "/logos/car-and-classic.png",
    period: "2024–Present",
    role: "Senior Product Designer",
    context: "Europe’s largest classic car marketplace.",
    items: [
      {
        name: "Car insurance",
        description: "Insurance quote flow for classic car owners",
        thumbnails: fanned,
        href: "/work/car-insurance",
      },
      {
        name: "Design system",
        description: "A system for designers, developers and agents",
        thumbnails: fanned,
        href: "/work/design-system",
      },
      {
        name: "Dealer experience",
        description: "A selling dashboard for professional dealers",
        thumbnails: fanned,
        href: "/work/dealer-experience",
      },
    ],
  },
  {
    company: "Kick Game",
    logo: "/logos/kick-game.png",
    logoDark: "/logos/kick-game-darkmode.png",
    period: "2022–2024",
    role: "Senior Product Designer",
    context: "UK & EU’s premier sneaker and streetwear store.",
    items: [
      {
        name: "Consignment app",
        description: "An app for consignors selling luxury goods",
        thumbnails: cards("consignment-app"),
        href: "/work/consignment-app",
      },
      {
        name: "Buyer experience",
        description: "Purchase flow for authenticated premium goods",
        thumbnails: cards("kick-game-buyer-experience"),
        href: "/work/kick-game-buyer-experience",
      },
    ],
  },
  {
    company: "Klekt",
    logo: "/logos/klekt.png",
    logoDark: "/logos/klekt-darkmode.png",
    period: "2021–2022",
    role: "UX/UI Designer",
    context:
      "EU’s oldest online marketplace for authentic sneakers and streetwear.",
    items: [
      {
        name: "Bidding flow",
        description: "Bidding on a sneaker and streetwear marketplace",
        thumbnails: cards("bidding-flow"),
        href: "/work/bidding-flow",
      },
      {
        name: "Marketplace improvements",
        description: "Listings, drops and search",
        thumbnails: cards("marketplace-improvements"),
        href: "/work/marketplace-improvements",
      },
    ],
  },
];

export type TimelineEntry = Project & { company: string };

/* Flattened in the order the homepage shows them: most recent first. */
export const timeline: TimelineEntry[] = groups.flatMap((group) =>
  group.items.map((item) => ({ ...item, company: group.company })),
);

/* The list runs most recent first, so the entry above is the newer work and
   the entry below the older. Named for that rather than for list direction:
   "previous" read either way, which is the ambiguity these labels exist to
   settle. Hidden entries drop out of the chain entirely rather than leaving a
   gap, so a draft in the middle joins the two either side of it. */
export function neighboursFor(
  href: string,
  hidden: ReadonlySet<string> = new Set(),
): {
  newer: TimelineEntry | null;
  older: TimelineEntry | null;
} {
  const published = timeline.filter((entry) => !hidden.has(entry.href));
  const index = published.findIndex((entry) => entry.href === href);

  if (index === -1) return { newer: null, older: null };

  return {
    newer: published[index - 1] ?? null,
    older: published[index + 1] ?? null,
  };
}
