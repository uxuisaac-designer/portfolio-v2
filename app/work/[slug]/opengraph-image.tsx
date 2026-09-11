import { shareCard } from "../../share-card";
import { NAME } from "../../site";

/* Drawn at build, one per case study. The page's own generateStaticParams
   is reused rather than restated, so the two cannot list different slugs.
   Left dynamic, each card would be drawn on request by a function that has
   to carry the fonts and the MDX with it. */
export const dynamicParams = false;
export { generateStaticParams } from "./page";

/* The page's own layout in miniature: the company as the eyebrow, the title,
   the tagline beneath, and the name at the foot, where the page itself
   would leave it to the index to say whose work this is. */
export const alt = `A case study by ${NAME}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { meta } = await import(`../../../content/work/${slug}.mdx`);

  return shareCard({
    eyebrow: meta.company,
    title: meta.title,
    detail: meta.tagline,
    footer: NAME,
  });
}
