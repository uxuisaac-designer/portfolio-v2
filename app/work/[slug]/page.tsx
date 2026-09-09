import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import GithubSlugger from "github-slugger";

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

export async function generateStaticParams() {
  const files = await readdir(CONTENT);
  return files
    .filter((file) => file.endsWith(".mdx"))
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

export default async function CaseStudy({
  params,
}: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const { default: Content, meta } = await import(
    `../../../content/work/${slug}.mdx`
  );
  const { headings, renderOverview } = await outlineFor(slug);

  const facts = META_FIELDS.flatMap(([label, key]) => {
    const value = meta[key];
    return value ? [{ label, value: String(value) }] : [];
  });

  return (
    <div className="case">
      <CaseSidebar headings={headings} />

      <article className="case-column">
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
      </article>
    </div>
  );
}
