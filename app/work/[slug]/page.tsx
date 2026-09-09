import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import GithubSlugger from "github-slugger";
import Link from "next/link";

import Footer from "../../footer";
import Icon from "../../icons";
import { londonTime } from "../../london-time";
import { hiddenHrefs } from "../../case-studies";
import { neighboursFor, type TimelineEntry } from "../../projects";

import CaseSidebar, { type Heading } from "./case-sidebar";

const CONTENT = path.join(process.cwd(), "content", "work");

/* The strip under the title, in this order. Each is read from the file's
   `meta`, and one that is missing leaves no gap rather than an empty
   column — a case study with no team is a solo one, not a blank. */
const META_FIELDS = [
  ["Role", "role"],
  ["Timeline", "timeline"],
  ["Team", "team"],
  ["Software", "software"],
] as const;

/* Only the slugs below are served. Without this a URL with no file behind it
   reaches the dynamic import and fails as a 500 rather than a 404 — and the
   leading-underscore template would be a live page. */
export const dynamicParams = false;

export async function generateStaticParams() {
  const files = await readdir(CONTENT);
  return files
    .filter((file) => file.endsWith(".mdx") && !file.startsWith("_"))
    .map((file) => ({ slug: file.replace(/\.mdx$/, "") }));
}

/* Every case study opens with one, so the template renders the heading and
   each file starts straight into its prose. */
const OVERVIEW: Heading = { id: "overview", text: "Overview" };

/* Headings are read from the source rather than scraped from the rendered
   page, so the contents list ships in the HTML. GithubSlugger is the same
   slugger rehype-slug uses, and it runs over the file's own headings only,
   so the ids match what rehype-slug puts in the DOM exactly. */
async function outlineFor(slug: string) {
  const source = await readFile(path.join(CONTENT, `${slug}.mdx`), "utf8");
  const slugger = new GithubSlugger();

  const own = [...source.matchAll(/^##\s+(.+?)\s*$/gm)].map((match) => ({
    text: match[1],
    id: slugger.slug(match[1]),
  }));

  /* A file that writes its own Overview keeps it, and the template stands
     down — two headings carrying id="overview" would break both the
     contents link and the scroll spy. */
  const declaresOwn = own.some((heading) => heading.id === OVERVIEW.id);
  const headings = declaresOwn ? own : [OVERVIEW, ...own];

  return {
    /* A contents list is only worth the space once there is enough to
       navigate. */
    headings: headings.length >= 4 ? headings : [],
    renderOverview: !declaresOwn,
  };
}

/* Newer sits left and older right on a wide column; below the breakpoint they
   stack, newer first, which is the source order. */
function CaseNavLink({
  entry,
  direction,
}: {
  entry: TimelineEntry;
  direction: "Newer" | "Older";
}) {
  return (
    <Link
      className="case-nav-item"
      href={entry.href as string}
      data-direction={direction.toLowerCase()}
    >
      <span className="case-nav-direction">{direction}</span>
      <span className="case-nav-name">{entry.name}</span>
      <span className="case-nav-company">{entry.company}</span>
    </Link>
  );
}

/* A draft can be half-written; a published one cannot. These three make the
   header, and a missing one renders as silent nothing rather than an error,
   which reads as a styling bug rather than a data one — the usual cause is a
   typo in the field name. Every case study is prerendered, so throwing here
   fails the build rather than shipping a blank heading.

   The fact strip's fields are deliberately not required: it omits a missing
   one rather than showing an empty column. */
const REQUIRED = ["title", "company", "tagline"] as const;

function assertPublishable(slug: string, meta: Record<string, unknown>) {
  if (meta.draft) return;

  const missing = REQUIRED.filter((field) => !meta[field]);
  if (missing.length === 0) return;

  throw new Error(
    `content/work/${slug}.mdx is published but missing ${missing.join(", ")}. ` +
      `Add the field, or set draft: true while it is unfinished.`,
  );
}

export default async function CaseStudy({
  params,
}: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const { newer, older } = neighboursFor(
    `/work/${slug}`,
    await hiddenHrefs(),
  );
  const { default: Content, meta } = await import(
    `../../../content/work/${slug}.mdx`
  );
  assertPublishable(slug, meta);

  const { headings, renderOverview } = await outlineFor(slug);

  const facts = META_FIELDS.flatMap(([label, key]) => {
    const value = meta[key];
    return value ? [{ label, value: String(value) }] : [];
  });

  return (
    <div className="case">
      <CaseSidebar headings={headings} />

      <article className="case-column">
        {/* The sidebar, and the Index link inside it, are gone below 64rem.
            This puts the way back at the top of the column instead, and is
            hidden again once the sidebar returns. */}
        <Link className="case-index case-index-inline" href="/">
          <Icon name="return" />
          Index
        </Link>

        <header className="case-header">
          {meta.company ? (
            <p className="case-company">{meta.company}</p>
          ) : null}
          <h1 className="case-title">{meta.title}</h1>
          <p className="case-tagline">{meta.tagline}</p>

          {facts.length > 0 ? (
            <dl className="case-meta">
              {facts.map((fact) => (
                <div className="case-meta-item" key={fact.label}>
                  <dt className="case-meta-label">{fact.label}</dt>
                  <dd className="case-meta-value">{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </header>

        <div className="case-body">
          {renderOverview ? <h2 id={OVERVIEW.id}>{OVERVIEW.text}</h2> : null}
          <Content />
        </div>

        {/* Gives the observer something to fire on at the end of the page.
            The final heading can never scroll above the trigger line — there
            is not enough content beneath it — so without this it could never
            become the current section. */}
        <div className="case-end" aria-hidden="true" />

        {(newer || older) && (
          <nav className="case-nav" aria-label="Other case studies">
            {newer ? <CaseNavLink entry={newer} direction="Newer" /> : null}
            {older ? <CaseNavLink entry={older} direction="Older" /> : null}
          </nav>
        )}

        <Footer initial={londonTime(new Date())} />
      </article>
    </div>
  );
}
