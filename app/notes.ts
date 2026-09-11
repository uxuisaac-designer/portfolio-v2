import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const CONTENT = path.join(process.cwd(), "content", "notes");

export type Note = {
  title: string;
  slug: string;
  href: string;
  /* As written in meta, so it sorts as a string without parsing. */
  published: string;
  /* "10 September 2026". */
  date: string;
  readTime: string;
  /* The meta's own if it has one, otherwise the opening paragraph. */
  description: string;
  draft: boolean;
};

/* The conventional figure for prose. A read time is a courtesy rather than
   a measurement, which is why nothing below tries to be clever about it —
   the honest failure is a minute either way, not a number typed from
   nothing, which is what these were before there was prose to count. */
const WORDS_PER_MINUTE = 200;

/* UTC is pinned so a build machine's zone cannot shift a date across
   midnight and publish a note a day early. */
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/* Found by counting braces rather than matched with a regex: a nested
   object inside meta would end a lazy match early and leave half a
   JavaScript literal sitting in the word count. */
function stripMeta(source: string): string {
  const start = source.indexOf("export const meta");
  if (start === -1) return source;

  const open = source.indexOf("{", start);
  if (open === -1) return source;

  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}") {
      depth--;
      /* The statement's semicolon goes with it, or it is left behind as a
         paragraph of its own. */
      if (depth === 0) {
        const end = source[i + 1] === ";" ? i + 2 : i + 1;
        return source.slice(0, start) + source.slice(end);
      }
    }
  }

  return source.slice(0, start);
}

function wordCount(source: string): number {
  const prose = stripMeta(source)
    /* Code is not prose and nobody reads it at 200 words a minute. */
    .replace(/```[\s\S]*?```/g, " ")
    /* <Figure … />, attributes and all, then any remaining tag. */
    .replace(/<[A-Za-z][^>]*\/>/g, " ")
    .replace(/<\/?[A-Za-z][^>]*>/g, " ")
    /* Keep the text of a link, drop the URL — the reader reads one. */
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, " ")
    .replace(/[*_`>]/g, " ");

  return prose.split(/\s+/).filter(Boolean).length;
}

/* Search results cut a description at about 160 characters. Trimming it
   here, at a word, means the ellipsis lands where it was put rather than
   wherever the engine's cut falls. */
const DESCRIPTION_LIMIT = 160;

/* The fallback for a note whose meta carries no description: the first
   block of prose, which is where a note opens with no heading above it.
   Headings, components, imports and code are skipped rather than
   described. */
function excerptFor(source: string): string {
  const paragraph = stripMeta(source)
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .find((block) => block && !/^(#|<|import |export |```|>|[-*] )/.test(block));

  if (!paragraph) return "";

  const text = paragraph
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ");

  if (text.length <= DESCRIPTION_LIMIT) return text;

  const cut = text.slice(0, DESCRIPTION_LIMIT - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.—–-]+$/, "")}…`;
}

export function readTimeFor(source: string): string {
  /* Floors at one, so an unwritten note reads "1 min read" rather than
     "0 min read" — which looks like a bug rather than an empty file. */
  const minutes = Math.max(1, Math.ceil(wordCount(source) / WORDS_PER_MINUTE));
  return `${minutes} min read`;
}

/* A published note must carry both fields. Every note is prerendered, so
   throwing here fails the build rather than shipping a blank heading. The
   failure this really catches is a typo in a field name, which renders as
   silent nothing and reads as a styling bug. Drafts are exempt, so an
   unfinished note can be half-written. */
function assertPublishable(slug: string, meta: Record<string, unknown>) {
  if (meta.draft) return;

  const missing = (["title", "published"] as const).filter(
    (field) => !meta[field],
  );

  if (missing.length > 0) {
    throw new Error(
      `content/notes/${slug}.mdx is published but missing ${missing.join(", ")}. ` +
        `Add the field, or set draft: true while it is unfinished.`,
    );
  }

  /* An unreadable date sorts unpredictably and renders as "Invalid Date",
     which reads as a styling bug rather than a data one. */
  if (Number.isNaN(Date.parse(String(meta.published)))) {
    throw new Error(
      `content/notes/${slug}.mdx has an unreadable published date ` +
        `(${String(meta.published)}). Use an ISO date, like 2026-09-10.`,
    );
  }
}

/* Shared by the note list and the route's generateStaticParams, so the two
   can never disagree about which files are notes. */
export async function noteSlugs(): Promise<string[]> {
  const files = await readdir(CONTENT);

  return files
    .filter((file) => file.endsWith(".mdx") && !file.startsWith("_"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

/* Each file is touched twice: the compiled module for its meta, the raw
   source for its word count. The case route already splits this way —
   outlineFor reads the source while the page imports the module. */
export async function noteFor(slug: string): Promise<Note> {
  const { meta } = await import(`../content/notes/${slug}.mdx`);
  assertPublishable(slug, meta);

  const source = await readFile(path.join(CONTENT, `${slug}.mdx`), "utf8");
  const published = String(meta.published ?? "");

  return {
    title: String(meta.title ?? ""),
    slug,
    href: `/notes/${slug}`,
    published,
    /* A draft is allowed no date, so this can be empty; the page joins the
       parts it has rather than rendering a leading separator. */
    date: published ? dateFormat.format(new Date(published)) : "",
    readTime: readTimeFor(source),
    description: meta.description
      ? String(meta.description)
      : excerptFor(source),
    draft: Boolean(meta.draft),
  };
}

export async function notes(): Promise<Note[]> {
  const all = await Promise.all((await noteSlugs()).map(noteFor));

  /* Unlinked in production, linked as normal in development — which is the
     point. A draft is something being worked on. */
  const visible =
    process.env.NODE_ENV === "production"
      ? all.filter((note) => !note.draft)
      : all;

  /* Most recent first, like the work. ISO dates sort as strings, so this
     needs no Date construction. */
  return visible.sort((a, b) => b.published.localeCompare(a.published));
}

/* The list runs most recent first, so the entry above is the newer note and
   the entry below the older. Named for that rather than for list direction:
   "previous" reads either way, which is the ambiguity these labels exist to
   settle. Drafts are already gone from the list in production, so a hidden
   note joins the two either side of it rather than leaving a gap.

   Shares its name with the export in app/projects.ts deliberately. They
   live in different modules and are never imported together, and the
   matching name is the signal that the two chains behave identically. */
export async function neighboursFor(href: string): Promise<{
  newer: Note | null;
  older: Note | null;
}> {
  const published = await notes();
  const index = published.findIndex((note) => note.href === href);

  if (index === -1) return { newer: null, older: null };

  return {
    newer: published[index - 1] ?? null,
    older: published[index + 1] ?? null,
  };
}
