import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "../../footer";
import {
  getAdjacentEntries,
  getEntryBySlug,
  getEntrySlugs,
  type LabEntry,
} from "../../lab";
import LabFrame from "../../lab-frame";
import { londonTime } from "../../london-time";
import { pageMetadata } from "../../site";
import LabBackLink from "./lab-back-link";

/* Only the slugs below are served. Without this a URL with no file behind
   it reaches the dynamic import and fails as a 500 rather than a 404 — and
   the leading-underscore template would be a live page. */
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getEntrySlugs()).map((slug) => ({ slug }));
}

/* The same three-span item notes and case studies use. The third span holds
   the company on a case study and the read time on a note; here, the
   category. */
function LabNavLink({
  entry,
  direction,
}: {
  entry: LabEntry;
  direction: "Newer" | "Older";
}) {
  return (
    <Link
      className="case-nav-item"
      href={entry.href}
      data-direction={direction.toLowerCase()}
    >
      <span className="case-nav-direction">{direction}</span>
      <span className="case-nav-name">{entry.title}</span>
      <span className="case-nav-company">{entry.category}</span>
    </Link>
  );
}

/* The question is the description: it is what the entry is for, and it is
   written to stand on its own. */
export async function generateMetadata({
  params,
}: PageProps<"/lab/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) notFound();

  return pageMetadata({
    title: entry.title,
    description: entry.question,
    path: entry.href,
    draft: entry.draft,
    ownCard: true,
  });
}

export default async function LabEntryPage({
  params,
}: PageProps<"/lab/[slug]">) {
  const { slug } = await params;
  const entry = await getEntryBySlug(slug);
  if (!entry) notFound();

  const { newer, older } = await getAdjacentEntries(entry.id);
  const { default: Content } = await import(
    `../../../content/lab/${slug}.mdx`
  );

  return (
    <>
      {/* Back sits where a case study's Index link does: in the sidebar
          from 64rem, and at the top of the column below that, where the
          sidebar is gone. */}
      <aside className="case-sidebar">
        <LabBackLink className="case-index" />
      </aside>

      <article className="case-column">
        <LabBackLink className="case-index case-index-inline lab-index-inline" />

        {/* The specimen label first — number, category, title and the
            question — then the artefact it describes, then the writeup. The
            header and the frame are one group, 24px apart; the writeup is
            48px below, a step further, because it is about the thing rather
            than part of it. */}
        <header className="lab-header">
          <p className="lab-meta">
            <span className="lab-id">{entry.id}</span>
            <span>{entry.category}</span>
          </p>
          <h1 className="case-title">{entry.title}</h1>
          {/* The point of the entry, in the tagline's place. In --text where
              a case study's tagline is muted: the question is read, not
              skimmed. */}
          <p className="lab-question">{entry.question}</p>
        </header>

        {/* 60% of the column: 350px at full width. It is the page's largest
            image, so its poster is preloaded. */}
        <LabFrame
          entry={entry}
          trigger="view"
          sizes="(max-width: 38.5rem) 60vw, 350px"
          preload
          className="lab-detail-frame"
        />

        <div className="case-body">
          <Content />
        </div>

        {(newer || older) && (
          <nav className="case-nav" aria-label="Other experiments">
            {newer ? <LabNavLink entry={newer} direction="Newer" /> : null}
            {older ? <LabNavLink entry={older} direction="Older" /> : null}
          </nav>
        )}

        <Footer initial={londonTime(new Date())} />
      </article>
    </>
  );
}
