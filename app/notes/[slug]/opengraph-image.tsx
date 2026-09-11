import { noteFor, noteSlugs } from "../../notes";
import { shareCard } from "../../share-card";
import { NAME } from "../../site";

/* Drawn at build, one per note, the same set the page is built for. Left
   dynamic, each card would be drawn on request by a function that has to
   carry the fonts and the MDX with it. */
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await noteSlugs()).map((slug) => ({ slug }));
}

/* The byline as the eyebrow and no description: a note's title is the
   thing that makes someone click, and the unfurl prints the description
   beside the image anyway. At the card's single size, a 160-character
   description would run to five lines. */
export const alt = `A note by ${NAME}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = await noteFor(slug);

  return shareCard({
    eyebrow: [note.date, note.readTime].filter(Boolean).join(" · "),
    title: note.title,
    footer: NAME,
  });
}
