import type { Metadata } from "next";
import Link from "next/link";

import Footer from "../../footer";
import Icon from "../../icons";
import { londonTime } from "../../london-time";
import { neighboursFor, noteFor, noteSlugs, type Note } from "../../notes";
import { pageMetadata } from "../../site";

/* Only the slugs below are served. Without this a URL with no file behind
   it reaches the dynamic import and fails as a 500 rather than a 404 — and
   the leading-underscore template would be a live page. */
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await noteSlugs()).map((slug) => ({ slug }));
}

/* Newer sits left and older right on a wide column; below the breakpoint
   they stack, newer first, which is the source order.

   .case-nav-item is a flex column of three spans. The third holds the
   company on a case study; a note has no company, so it holds the read
   time — the same shape, filled honestly. */
function NoteNavLink({
  note,
  direction,
}: {
  note: Note;
  direction: "Newer" | "Older";
}) {
  return (
    <Link
      className="case-nav-item"
      href={note.href}
      data-direction={direction.toLowerCase()}
    >
      <span className="case-nav-direction">{direction}</span>
      <span className="case-nav-name">{note.title}</span>
      <span className="case-nav-company">{note.readTime}</span>
    </Link>
  );
}

/* A note is the one page that is an article, so it is the one that carries
   a published date into the share card's metadata. */
export async function generateMetadata({
  params,
}: PageProps<"/notes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const note = await noteFor(slug);

  return pageMetadata({
    title: note.title,
    description: note.description || undefined,
    path: note.href,
    published: note.published || undefined,
    draft: note.draft,
  });
}

export default async function NotePage({
  params,
}: PageProps<"/notes/[slug]">) {
  const { slug } = await params;
  const note = await noteFor(slug);
  const { newer, older } = await neighboursFor(note.href);
  const { default: Content } = await import(
    `../../../content/notes/${slug}.mdx`
  );

  /* Joined rather than interpolated: a draft may carry no date, and a bare
     "· 4 min read" reads as a missing field. */
  const byline = [note.date, note.readTime].filter(Boolean).join(" · ");

  return (
    <article className="case-column">
      {/* Back to the list rather than to the index. A case study returns to
          the homepage because that is where the work is listed; a note's
          list is /notes, so that is where "back" means. */}
      <Link className="case-index note-index" href="/notes">
        <Icon name="return" />
        Notes
      </Link>

      <header className="case-header">
        <h1 className="case-title">{note.title}</h1>
        <p className="note-date">{byline}</p>
      </header>

      <div className="case-body">
        <Content />
      </div>

      {(newer || older) && (
        <nav className="case-nav" aria-label="Other notes">
          {newer ? <NoteNavLink note={newer} direction="Newer" /> : null}
          {older ? <NoteNavLink note={older} direction="Older" /> : null}
        </nav>
      )}

      <Footer initial={londonTime(new Date())} />
    </article>
  );
}
