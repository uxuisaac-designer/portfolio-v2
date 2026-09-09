/* The one list of work. The homepage renders it grouped by employer; case
   studies read it flattened, to find their neighbours. Adding a project here
   updates both. */

const placeholder = "/placeholder.png";

export type Project = {
  name: string;
  description: string;
  thumbnail: string;
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
        thumbnail: placeholder,
        href: "/work/car-insurance",
      },
      {
        name: "Design system",
        description: "A system for designers, developers and agents",
        thumbnail: placeholder,
        href: "/work/design-system",
      },
      {
        name: "Dealer experience",
        description: "A selling dashboard for professional dealers",
        thumbnail: placeholder,
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
        thumbnail: placeholder,
        href: "/work/consignment-app",
      },
      {
        name: "Buyer experience",
        description: "Purchase flow for authenticated premium goods",
        thumbnail: placeholder,
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
        thumbnail: placeholder,
        href: "/work/bidding-flow",
      },
      {
        name: "Marketplace improvements",
        description: "Listings, drops and search",
        thumbnail: placeholder,
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

/* Neighbours are list positions, not dates: previous is the entry above on
   the homepage, so it is the more recent piece of work. Hidden entries drop
   out of the chain entirely rather than leaving a gap, so a draft in the
   middle joins the two either side of it. */
export function neighboursFor(
  href: string,
  hidden: ReadonlySet<string> = new Set(),
): {
  previous: TimelineEntry | null;
  next: TimelineEntry | null;
} {
  const published = timeline.filter((entry) => !hidden.has(entry.href));
  const index = published.findIndex((entry) => entry.href === href);

  if (index === -1) return { previous: null, next: null };

  return {
    previous: published[index - 1] ?? null,
    next: published[index + 1] ?? null,
  };
}
