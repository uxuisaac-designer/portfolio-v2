import { notFound } from "next/navigation";

import { getEntryBySlug, getEntrySlugs } from "../../lab";
import { shareCard } from "../../share-card";
import { NAME } from "../../site";

/* Drawn at build, one per entry, the same set the page is built for. */
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getEntrySlugs()).map((slug) => ({ slug }));
}

/* The house card rather than the poster: the poster is 3:2 where an unfurl
   is 1.91:1, and a cutout on transparency lands on whatever colour the
   client paints behind it. The question goes in as the detail — it is
   written to about the length of a case-study tagline, which the card
   holds to three lines. */
export const alt = `An experiment from the Lab by ${NAME}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) notFound();

  return shareCard({
    eyebrow: `Lab ${entry.id}`,
    title: entry.title,
    detail: entry.question,
    footer: NAME,
  });
}
