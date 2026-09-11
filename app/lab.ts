import { readdir } from "node:fs/promises";
import path from "node:path";

import { cache } from "react";

import { CATEGORIES, type Category } from "./lab-category";

const CONTENT = path.join(process.cwd(), "content", "lab");

export type LabEntry = {
  /* "001". A catalogue number, zero-padded, and the start of the filename. */
  id: string;
  /* "001-link-underline" — the filename without .mdx, and the URL segment. */
  slug: string;
  href: string;
  title: string;
  category: Category;
  tags: string[];
  /* The question the experiment was built to answer. The point of the entry. */
  question: string;
  /* As written in meta: an ISO date. */
  date: string;
  /* "8 September 2026". */
  dateLabel: string;
  poster: string;
  media: string | null;
  /* Reserved for surfacing an entry on the homepage. Validated, read by
     nothing yet. */
  featured: boolean;
  draft: boolean;
};

export type CategoryCount = { category: Category; count: number };

/* UTC is pinned so a build machine's zone cannot shift a date across
   midnight. Same formatter as app/notes.ts. */
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const ID = /^\d{3}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const VIDEO = /\.(mp4|webm)$/i;

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/* Every problem in a file is collected and reported in one message, so a
   new entry with three mistakes costs one failed build rather than three.
   Every entry is prerendered, so throwing here fails the build instead of
   shipping a broken card.

   Unlike notes and case studies, drafts are validated in full. A draft is
   still rendered in development, and a card with no poster or no category
   is a broken card there too.

   The poster and media paths are checked for shape, never for existence:
   pages regenerate on Vercel, where public/ is not on disk, so a file check
   would pass the build and throw on the first revalidation. */
function validate(slug: string, meta: unknown): LabEntry {
  const file = `content/lab/${slug}.mdx`;

  if (!meta || typeof meta !== "object") {
    throw new Error(
      `${file} has no meta export. Copy content/lab/_entry.mdx and fill it in.`,
    );
  }

  const m = meta as Record<string, unknown>;
  const problems: string[] = [];

  const id = text(m.id);
  if (!id) problems.push("id is missing");
  else if (!ID.test(id)) problems.push(`id "${id}" is not three digits, like "004"`);
  else if (!slug.startsWith(`${id}-`)) {
    problems.push(`id "${id}" does not match the filename, which should start "${id}-"`);
  }

  const title = text(m.title);
  if (!title) problems.push("title is missing");

  const category = CATEGORIES.find((c) => c === m.category);
  if (!category) {
    problems.push(
      m.category === undefined
        ? "category is missing"
        : `category "${String(m.category)}" is not one of ${CATEGORIES.join(", ")}`,
    );
  }

  const question = text(m.question);
  if (!question) problems.push("question is missing");

  const date = text(m.date);
  if (!date) problems.push("date is missing");
  else if (!ISO_DATE.test(date) || Number.isNaN(Date.parse(date))) {
    problems.push(`date "${date}" is not an ISO date, like 2026-09-14`);
  }

  const poster = text(m.poster);
  if (!poster) problems.push("poster is missing");
  else if (!poster.startsWith("/")) {
    problems.push(`poster "${poster}" should be a path from public/, starting with /`);
  }

  const media = m.media === undefined ? null : text(m.media);
  if (m.media !== undefined && (!media || !media.startsWith("/") || !VIDEO.test(media))) {
    problems.push(
      `media "${String(m.media)}" should be an .mp4 or .webm path from public/, or left out`,
    );
  }

  const tags = m.tags ?? [];
  if (
    !Array.isArray(tags) ||
    !tags.every((tag) => typeof tag === "string" && tag.trim() && tag === tag.toLowerCase())
  ) {
    problems.push("tags should be a list of lowercase words");
  }

  for (const flag of ["featured", "draft"] as const) {
    if (m[flag] !== undefined && typeof m[flag] !== "boolean") {
      problems.push(`${flag} should be true or false`);
    }
  }

  if (problems.length > 0) {
    throw new Error(`${file}: ${problems.join("; ")}.`);
  }

  return {
    id: id as string,
    slug,
    href: `/lab/${slug}`,
    title: title as string,
    category: category as Category,
    tags: tags as string[],
    question: question as string,
    date: date as string,
    dateLabel: dateFormat.format(new Date(date as string)),
    poster: poster as string,
    media,
    featured: m.featured === true,
    draft: m.draft === true,
  };
}

/* A leading underscore marks the authoring template, which is not an entry
   and has no route — the convention content/notes and content/work use. */
async function slugsOnDisk(): Promise<string[]> {
  const files = await readdir(CONTENT);

  return files
    .filter((file) => file.endsWith(".mdx") && !file.startsWith("_"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

/* Every entry, drafts included, validated, checked for duplicate ids and
   sorted newest first. cache() makes it one parse per render however many
   helpers a page calls — per request rather than per process, so an edited
   file is picked up in development without a restart. */
const loadAll = cache(async (): Promise<LabEntry[]> => {
  const entries = await Promise.all(
    (await slugsOnDisk()).map(async (slug) => {
      /* Read from the compiled module rather than parsed from the source,
         so the meta is the value the page itself renders with. */
      const { meta } = await import(`../content/lab/${slug}.mdx`);
      return validate(slug, meta);
    }),
  );

  const seen = new Map<string, string>();
  for (const entry of entries) {
    const other = seen.get(entry.id);
    if (other) {
      throw new Error(
        `content/lab/${other}.mdx and content/lab/${entry.slug}.mdx share id ` +
          `"${entry.id}". Each entry needs its own number.`,
      );
    }
    seen.set(entry.id, entry.slug);
  }

  /* Zero-padded, so ids sort as strings. */
  return entries.sort((a, b) => b.id.localeCompare(a.id));
});

/* Unlisted in production, listed as normal in development — which is the
   point. A draft is something being worked on. */
export async function getAllEntries(): Promise<LabEntry[]> {
  const all = await loadAll();
  return process.env.NODE_ENV === "production"
    ? all.filter((entry) => !entry.draft)
    : all;
}

/* Every slug, drafts included: the route is built either way, so a draft is
   always reachable by its own URL. Unlinked, not unreachable. */
export async function getEntrySlugs(): Promise<string[]> {
  return (await loadAll()).map((entry) => entry.slug);
}

export async function getEntryBySlug(slug: string): Promise<LabEntry | null> {
  return (await loadAll()).find((entry) => entry.slug === slug) ?? null;
}

/* All four, in a fixed order, with zeros kept: a category with nothing in
   it yet is still a place entries will go. */
export async function getCategories(): Promise<CategoryCount[]> {
  const entries = await getAllEntries();

  return CATEGORIES.map((category) => ({
    category,
    count: entries.filter((entry) => entry.category === category).length,
  }));
}

/* Newest first, so the entry above is Newer and the entry below Older —
   named for that, as in app/notes.ts, because "previous" reads either way.
   Across the whole Lab rather than within a category: an entry's
   neighbours are the entries either side of it in the catalogue. */
export async function getAdjacentEntries(id: string): Promise<{
  newer: LabEntry | null;
  older: LabEntry | null;
}> {
  const entries = await getAllEntries();
  const index = entries.findIndex((entry) => entry.id === id);

  if (index === -1) return { newer: null, older: null };

  return {
    newer: entries[index - 1] ?? null,
    older: entries[index + 1] ?? null,
  };
}
