import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import GithubSlugger from "github-slugger";

import CaseSidebar, { type Heading } from "./case-sidebar";

const CONTENT = path.join(process.cwd(), "content", "work");

export async function generateStaticParams() {
  const files = await readdir(CONTENT);
  return files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => ({ slug: file.replace(/\.mdx$/, "") }));
}

/* Headings are read from the source rather than scraped from the rendered
   page, so the contents list ships in the HTML. GithubSlugger is the same
   slugger rehype-slug uses, so the ids match exactly. */
async function headingsFor(slug: string): Promise<Heading[]> {
  const source = await readFile(path.join(CONTENT, `${slug}.mdx`), "utf8");
  const slugger = new GithubSlugger();

  const found = [...source.matchAll(/^##\s+(.+?)\s*$/gm)].map((match) => ({
    text: match[1],
    id: slugger.slug(match[1]),
  }));

  /* A contents list is only worth the space once there is enough to
     navigate. */
  return found.length >= 4 ? found : [];
}

export default async function CaseStudy({
  params,
}: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const { default: Content, meta } = await import(
    `../../../content/work/${slug}.mdx`
  );
  const headings = await headingsFor(slug);

  return (
    <div className="case">
      <CaseSidebar headings={headings} />

      <article className="case-column">
        <h1 className="case-title">{meta.title}</h1>
        <p className="case-date">{meta.date}</p>

        <div className="case-body">
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
