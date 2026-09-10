# Notes Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give each of the five notes a real page — an MDX file, a route at `/notes/[slug]`, a derived read time and a Newer/Older chain — and write the prose behind them.

**Architecture:** A note is an MDX file in `content/notes` carrying three meta fields. `app/notes.ts` stops being a hand-written array and reads that directory, deriving title, date and read time from the files themselves. The reading page is a plain centred column reusing the case study's `.case-column` classes with no sidebar and no contents list.

**Tech Stack:** Next 16 App Router, `@next/mdx`, React 19, plain CSS custom properties. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-10-notes-pages-design.md`

## Global Constraints

- **No new dependencies.** `CLAUDE.md` working style: "Ask before adding any dependency." This plan adds none.
- **No test runner.** Decided during brainstorming. Verification is `npm run build` (which prerenders every note and runs the asserts against real content), `npm run lint`, and the targeted checks written into each task. Where the skill's TDD cycle says "write a failing test", these tasks write a **failing verification command**, confirm it fails, implement, and confirm it passes. Evidence before assertion; the evidence is just not a test file.
- **Small commits, one change at a time.** `CLAUDE.md` working style.
- **Branch:** `notes-pages`, already created and carrying the spec commit.
- **Reading-page classes are shared, not copied.** Notes reuse `.case-column`, `.case-body`, `.case-title`, `.case-header`, `.case-index`, `.case-nav` and its children. Do **not** rename them and do **not** duplicate them under a `note-` prefix. Exactly two new classes are added: `.note-index` and `.note-date`.
- **Writing standard:** `docs/tone-of-voice.md`, including the `## Notes` section added in Task 5. Every essay task is bound by it.
- **Attribution in prose:** anonymised but real. Incidents are true and specific; no employer or colleague is named inside a note.
- **Typography in prose:** typographic apostrophes (’), en dashes in ranges, em dashes for asides. Never a straight quote.

---

### Task 1: The content directory, its template, and five meta-only files

**Files:**
- Create: `content/notes/_note.mdx`
- Create: `content/notes/everything-is-a-first-draft-now.mdx`
- Create: `content/notes/deciding-is-the-job.mdx`
- Create: `content/notes/building-this-portfolio-from-scratch.mdx`
- Create: `content/notes/consensus-is-where-good-ideas-go-to-get-safe.mdx`
- Create: `content/notes/nobody-was-hired-for-their-figma-file.mdx`

**Interfaces:**
- Consumes: nothing.
- Produces: five slugs and a `meta` shape that Task 2 reads — `{ title: string, published: string, draft: boolean }`. `published` is an ISO date string, `YYYY-MM-DD`.

All five start with `draft: true` and **no body**. That is deliberate, not a placeholder: a draft is unlinked in production and linked as normal in development, and an empty file honestly measures as `1 min read` because it contains no prose yet. Each essay task later fills one in and flips its flag.

- [ ] **Step 1: Create the authoring template**

`content/notes/_note.mdx`. The leading underscore is what keeps it out of the route generator and the note list — the same convention `content/work/_case-study.mdx` uses.

```mdx
export const meta = {
  /* Shown as the page title, and as the name in Newer/Older. */
  title: "Note title",
  /* ISO date. Sorts the list and renders as "10 September 2026". */
  published: "2026-01-01",
  /* true keeps it out of the /notes rows and the Newer/Older chain in
     production. The route is still built, so it stays reachable by URL. */
  draft: true,
};

Opening prose goes here, with no heading above it.

## A heading

Headings are h2 only. There is no contents sidebar on a note, so they are
free to run longer than a case study's — and a note that argues
continuously is welcome to use none at all.
```

- [ ] **Step 2: Create the five note files**

Each carries meta only. Dates are spaced a fortnight apart, most recent first, matching the existing order in `app/notes.ts`.

```bash
cat > content/notes/everything-is-a-first-draft-now.mdx <<'EOF'
export const meta = {
  title: "Everything is a first draft now",
  published: "2026-09-10",
  draft: true,
};
EOF

cat > content/notes/deciding-is-the-job.mdx <<'EOF'
export const meta = {
  title: "Deciding is the job",
  published: "2026-08-27",
  draft: true,
};
EOF

cat > content/notes/building-this-portfolio-from-scratch.mdx <<'EOF'
export const meta = {
  title: "Building this portfolio from scratch",
  published: "2026-08-13",
  draft: true,
};
EOF

cat > content/notes/consensus-is-where-good-ideas-go-to-get-safe.mdx <<'EOF'
export const meta = {
  title: "Consensus is where good ideas go to get safe",
  published: "2026-07-30",
  draft: true,
};
EOF

cat > content/notes/nobody-was-hired-for-their-figma-file.mdx <<'EOF'
export const meta = {
  title: "Nobody was hired for their Figma file",
  published: "2026-07-16",
  draft: true,
};
EOF
```

- [ ] **Step 3: Verify the files parse as MDX**

Run: `npm run build`
Expected: PASS. Nothing imports these yet, so the build should be unchanged — this step is confirming the files do not break MDX compilation, not that they do anything.

- [ ] **Step 4: Commit**

```bash
git add content/notes
git commit -m "$(cat <<'EOF'
Add the notes content directory and its five files

Meta only, all drafts. A draft is linked in development and not in
production, so the five sit ready to be written without appearing on the
live site. The leading underscore on the template keeps it out of the
route generator, exactly as it does for case studies.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: `app/notes.ts` reads the directory

**Files:**
- Modify: `app/notes.ts` (replace wholesale)
- Modify: `app/(site)/notes/page.tsx`

**Interfaces:**
- Consumes: the `meta` shape from Task 1.
- Produces, all consumed by Task 3:
  - `type Note = { title: string; slug: string; href: string; published: string; date: string; readTime: string; draft: boolean }`
  - `noteSlugs(): Promise<string[]>`
  - `noteFor(slug: string): Promise<Note>`
  - `notes(): Promise<Note[]>`
  - `neighboursFor(href: string): Promise<{ newer: Note | null; older: Note | null }>`

- [ ] **Step 1: Write the failing verification**

There is no test runner, so the failing check is the type error that proves the index page is still on the old array. Before touching anything:

Run: `npx tsc --noEmit`
Expected: PASS (current state is consistent). Note this — it is the baseline the next steps must return to.

- [ ] **Step 2: Replace `app/notes.ts`**

```ts
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
      if (depth === 0) return source.slice(0, start) + source.slice(i + 1);
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
```

- [ ] **Step 3: Run the type check to verify it now fails**

Run: `npx tsc --noEmit`
Expected: FAIL in `app/(site)/notes/page.tsx` — `notes` is now a function, and `.map` on it does not type-check. This is the failing check that proves the index page still holds the old assumption.

- [ ] **Step 4: Update the index page to await the list**

`app/(site)/notes/page.tsx`. Rows stay `<div>` for now — they become links in Task 4, once there is a route to point at.

```tsx
import { notes } from "../../notes";

export default async function Notes() {
  const all = await notes();

  return (
    /* No page heading. The nav sits directly above and already says Notes,
       and the Work page carries none either. */
    <ul className="list notes">
      {all.map((note) => (
        <li key={note.slug}>
          {/* A div until the route exists, carrying the markup a link will
              carry, so nothing moves when the href arrives. */}
          <div className="note-row">
            {/* Two spans, the same nesting a prose link uses. The outer one
                is the grid item and takes the whole column; the inner one
                is the inline-block the underline measures itself against,
                so the rule is the width of the words and not the row. */}
            <span className="note-title">
              <span className="link-underline">{note.title}</span>
            </span>
            <span className="note-time">{note.readTime}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 5: Run the type check and the build to verify they pass**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: all three PASS.

- [ ] **Step 6: Verify the read times are derived, not remembered**

This must run against `dev`, not `build`. All five notes are drafts, and a production build hides drafts — so `/notes` is an empty list there and would prove nothing.

```bash
npm run dev &
sleep 4
curl -s http://localhost:3000/notes | grep -o '[0-9]* min read' | sort -u
```

Expected: `1 min read`, and nothing else. Every note file is empty of prose, so every read time floors at one. If any row still reads `6 min read` or `10 min read`, the old hand-written array is still being rendered from somewhere and the task is not done. Stop the server afterwards.

- [ ] **Step 7: Commit**

```bash
git add app/notes.ts "app/(site)/notes/page.tsx"
git commit -m "$(cat <<'EOF'
Derive the note list from the content files

app/notes.ts stops being a hand-written array and reads content/notes, the
way app/case-studies.ts reads the work. Every field on it now has a file
behind it, so a second copy kept in step by hand would only be a way to
disagree with the source.

Read time becomes a word count over 200wpm, which is what the file's own
comment promised it would become once there was prose to count. Right now
every note is empty, so every one of them honestly reads 1 min read.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: The note route

**Files:**
- Create: `app/notes/[slug]/page.tsx`
- Modify: `app/globals.css` (append two rules after the `.case-end` block at the end of the file)

**Interfaces:**
- Consumes: `noteSlugs`, `noteFor`, `neighboursFor`, `type Note` from Task 2.
- Produces: live routes at `/notes/<slug>` for all five slugs, which Task 4 links to.

Note this sits at `app/notes/[slug]/`, **not** inside `app/(site)/`. `(site)` is a route group carrying the greeting, avatar and nav layout; a note page should not inherit those, exactly as `app/work/[slug]` does not. The URL is `/notes/<slug>` either way because a route group contributes no path segment.

- [ ] **Step 1: Write the failing verification**

```bash
npm run build && ls .next/server/app/notes/
```

Expected: FAIL with "No such file or directory". The `/notes` index prerenders to `.next/server/app/notes.html` — a file, not a directory — because a route group contributes no *URL* path segment. (`(site)` does appear in the build output as a compiled-module directory, `.next/server/app/(site)/notes/`; it is the prerendered HTML that lands at the URL path. Do not confuse the two.) There is no note route yet, so no `notes/` directory beside the html.

- [ ] **Step 2: Add the two CSS rules**

Append to the end of `app/globals.css`:

```css
/* Note pages.

   A plain centred column — .case-column with no sidebar beside it, which
   that class already supports: it is centred on its own and does not know
   the sidebar exists. No contents list either. A case study is scanned by
   someone looking for evidence, so it earns a jump list; a note is read
   top to bottom. Dropping it also lifts the 24-character heading limit,
   which exists only to stop the contents list rewrapping as you scroll. */

/* The case route splits the Index link in two: .case-index styles it, and
   .case-index-inline adds the bottom margin and then hides it above 64rem
   where the sidebar takes the link over. A note has no sidebar, so it
   needs the margin without the hiding. */
.note-index {
  margin-bottom: var(--space-stack);
}

/* Date and read time on one line under the title, at label size and muted
   — the same pair the row's read time takes. It is metadata about the
   title, not a second thing to read. */
.note-date {
  margin: 0;
  font-size: var(--font-size-label);
  color: var(--muted);
}
```

- [ ] **Step 3: Write the route**

`app/notes/[slug]/page.tsx`:

```tsx
import Link from "next/link";

import Footer from "../../footer";
import Icon from "../../icons";
import { londonTime } from "../../london-time";
import { neighboursFor, noteFor, noteSlugs, type Note } from "../../notes";

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
```

- [ ] **Step 4: Run the build to verify the routes exist**

```bash
npm run build && ls .next/server/app/notes/
```

Expected: PASS, listing the five `.html` files. The prerendered HTML follows the URL, so it lands at `app/notes/<slug>.html` with no `(site)` in the path — even though `(site)` does exist in the same tree as a compiled-module directory.

- [ ] **Step 5: Verify a bad slug is a 404, not a 500**

```bash
npm run build && npm run start &
sleep 4
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/notes/does-not-exist
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/notes/_note
```

Expected: `404` for both. The second matters — the template must not be a live page. Stop the server afterwards.

- [ ] **Step 6: Verify the chain and the byline in development**

```bash
npm run dev &
sleep 4
curl -s http://localhost:3000/notes/deciding-is-the-job | grep -o 'case-nav-name[^<]*<\|[0-9]* min read\|[0-9]* September 2026\|[0-9]* August 2026'
```

Expected: the byline shows a date and a read time, and the nav names the note either side — `Everything is a first draft now` as Newer, `Building this portfolio from scratch` as Older. Drafts are visible in development, which is why this check runs against `dev` and not `start`. Stop the server afterwards.

- [ ] **Step 7: Commit**

```bash
git add app/notes app/globals.css
git commit -m "$(cat <<'EOF'
Give notes a route

A plain centred column — .case-column with no sidebar and no contents
list. A case study is scanned by someone hunting for evidence, so it earns
a jump list; a note is read top to bottom. Dropping it also lifts the
24-character heading limit, which only ever existed to stop the contents
list rewrapping mid-scroll.

Two new classes, and the rest of the reading page is the case study's.
Newer/Older is its own chain: a note's neighbour is a note.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: The rows become links, and the docs catch up

**Files:**
- Modify: `app/(site)/notes/page.tsx`
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: `Note.href` from Task 2, live routes from Task 3.
- Produces: nothing consumed by later tasks.

This retires the deferred item that reads *"None of the five note rows are links."*

- [ ] **Step 1: Write the failing verification**

Against `dev`, because all five notes are still drafts and a production build would show an empty list either way — which would pass for the wrong reason.

```bash
npm run dev &
sleep 4
curl -s http://localhost:3000/notes | grep -c 'href="/notes/'
```

Expected: `0` — the rows are still divs. Stop the server afterwards.

- [ ] **Step 2: Swap the div for a Link**

`app/(site)/notes/page.tsx`:

```tsx
import Link from "next/link";

import { notes } from "../../notes";

export default async function Notes() {
  const all = await notes();

  return (
    /* No page heading. The nav sits directly above and already says Notes,
       and the Work page carries none either. */
    <ul className="list notes">
      {all.map((note) => (
        <li key={note.slug}>
          {/* .note-row is a grid; an anchor takes display: grid as happily
              as a div did, so the swap needs no CSS. The hover wipe and the
              :active line are written against .note-row .link-underline and
              never cared what element carried them. The focus ring arrives
              on its own — .page a:focus-visible was always waiting for
              these to become anchors. */}
          <Link className="note-row" href={note.href}>
            {/* Two spans, the same nesting a prose link uses. The outer one
                is the grid item and takes the whole column; the inner one
                is the inline-block the underline measures itself against,
                so the rule is the width of the words and not the row. */}
            <span className="note-title">
              <span className="link-underline">{note.title}</span>
            </span>
            <span className="note-time">{note.readTime}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 3: Verify the links and the focus ring**

```bash
npm run dev &
sleep 4
curl -s http://localhost:3000/notes | grep -c 'href="/notes/'
```

Expected: `5`. Then open `http://localhost:3000/notes` and press Tab through the list — each row should take a visible 2px outline from `.page a:focus-visible`. Stop the server afterwards.

- [ ] **Step 4: Update `CLAUDE.md`**

Two edits.

**(a)** Delete the whole deferred bullet beginning **"None of the five note rows are links."** — it describes a state that no longer exists. Do not edit it down; delete it.

**(b)** Add a `## Notes` section immediately after the `## Case studies` section:

```markdown
## Notes
Content is MDX in content/notes/*.mdx, rendered by app/notes/[slug]. Each
file exports a `meta` with title, published and draft — three fields, not
the case study's eight. A note belongs to nobody, so there is no company
eyebrow and no fact strip.

The reading page is a plain centred column: .case-column with no sidebar
beside it and no contents list. A case study is scanned by someone hunting
for evidence, so it earns a jump list; a note is read top to bottom. That
also lifts the 24-character heading limit, which exists only to stop the
contents list rewrapping as it gains weight 500 — a note's headings are
free to run long, or to be absent entirely.

The reading-page classes are shared rather than copied: .case-column,
.case-body, .case-title, .case-header, .case-index and .case-nav all carry
both routes. The case- prefix is inaccurate for half of what it now styles,
and that is preferred to renaming twenty selectors for a name nobody reads.
Two classes are the note's own — .note-index, which is .case-index-inline's
margin without its hiding, and .note-date.

app/notes.ts reads the directory rather than listing the notes by hand,
the way app/case-studies.ts reads the work. Read time is the body's word
count over 200 words a minute, floored at one so an empty file reads
1 min read rather than 0. The meta block is stripped by counting braces
rather than by regex, so a nested object cannot leave half a JavaScript
literal in the count. Dates are formatted in UTC so a build machine's zone
cannot shift one across midnight.

The date does not appear on the /notes row. That row is a 1fr auto grid
with a stacking breakpoint measured at a 343px column; a third item means
redoing that measurement for nothing. The date sits on the note's own page,
under the title, beside the read time.

Newer/Older is its own chain over notes — a note's neighbour is a note,
never a case study. .case-nav-item is a flex column of three spans, and the
third, which holds the company on a case study, holds the read time here.

Back goes to /notes, not to the index: a case study returns to the homepage
because that is where the work is listed, and a note's list is its own page.

`draft: true` behaves exactly as it does for a case study — out of the rows
and the chain in production, linked as normal in development, and the route
built either way so a draft is always reachable by URL.
```

- [ ] **Step 5: Verify the build is still clean**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: all three PASS.

- [ ] **Step 6: Commit**

```bash
git add "app/(site)/notes/page.tsx" CLAUDE.md
git commit -m "$(cat <<'EOF'
Make the note rows links

Retires the deferred item that said they were not. The swap needs no CSS:
.note-row is a grid and an anchor takes display: grid as happily as a div,
the hover wipe and the press are written against .link-underline inside it,
and .page a:focus-visible was always waiting for these to become anchors —
so the rows gain a focus ring they never had.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: The writing standard for notes

**Files:**
- Modify: `docs/tone-of-voice.md`

**Interfaces:**
- Consumes: nothing.
- Produces: the standard every essay task (6–10) is bound by.

This is a gate, not paperwork. No prose gets written before it lands, because the deltas below are what "more human, still consistent" actually means in rules rather than in vibes.

- [ ] **Step 1: Append a `## Notes` section to `docs/tone-of-voice.md`**

Add at the end of the file, after `## Typography`:

```markdown
## Notes

Everything above holds for a note unless this section overrides it. Notes are
reflective and editorial where a case study is evidential, and the difference
is smaller than it sounds — the register moves, the discipline does not.

### Carried over without change

Short declaratives. No hedging words. Active voice, first person. No sentence
opens with "And" or "But". No self-praise adjectives. No abstract endings.
Prose, not bullets. Typographic apostrophes, en dashes in ranges, em dashes for
asides.

The banned construction — "it’s not just X, it’s Y", and every paraphrase of it
— stays banned. It gets more tempting in an essay, not less.

### Five deltas

**Asides come off the bench.** The cap is one per ~500 words with a hard floor
at 300, which in practice rules them out of the rest of this site: case study
sections run 60–200 words. Notes clear the floor. The rule has not changed; the
sections finally qualify. Most of a note's extra warmth comes from here, and it
costs no consistency at all.

**A metaphor can carry an essay, not just a pattern.** In a case study the
image explains one interaction and stops. In a note it can be the spine —
introduced early, returned to once, paid off at the end. Still one per idea,
still never stacked.

**Second person is unlocked.** A case study is "I did X, it moved Y". A note
may address the reader directly. This is the largest single lever on warmth,
and it is unavailable in the case studies by nature rather than by rule.

**Reversal counts as evidence.** "I think" stays banned as hedging. "I argued
the opposite of this for two years" is not hedging — it is the strongest thing
an opinion piece has to offer. Named, dated, specific. Uncertain about the
conclusion is allowed; mushy in the sentence is not.

**Evidence changes currency, not rigour.** A case study proves a claim with a
number. A note proves it with a scene: a specific meeting, a specific file, a
specific sentence someone said. **No composite anecdotes.** No "a designer once
told me" if no designer did. That is the essay-writing equivalent of an
invented metric, and it is the likeliest way this writing goes wrong.

### Banned in notes specifically

Clichés a case study never gets near. The dictionary-definition opener. "In
today’s world", "In an age of". The rhetorical-question hook. "Here’s the
thing". LinkedIn cadence — single-sentence paragraphs stacked for drama.
Closing on a call to action.

Chief among them: **"As designers, we…"**. Every one of these topics lists
toward industry-commentary voice, and the collective first person is how a
writer asserts something without owning it. Every claim in a note is one to
stand behind personally.

### Attribution

Anonymised but real. The incidents are true and specific; no employer and no
colleague is named inside a note. "A marketplace I worked at", "the person who
owned the roadmap". The evidence stays concrete enough to carry the argument
without a searchable person reading themselves into it — and the case studies
already name the employers for anyone who wants that context.

### Headings and length

The 24-character limit lifts. It exists only to stop the case-study contents
sidebar rewrapping as a label gains weight 500, and a note has no sidebar. A
note may also run headless where the argument is continuous.

Length is not specified. Read time is computed from the finished text, so
length is a result rather than a target.
```

- [ ] **Step 2: Verify no straight quotes crept in**

```bash
grep -n "'" docs/tone-of-voice.md | grep -v "’"
```

Expected: no output. The section quotes "it’s not just X" and "Here’s the thing", and both must use the typographic apostrophe the rule itself demands.

- [ ] **Step 3: Commit**

```bash
git add docs/tone-of-voice.md
git commit -m "$(cat <<'EOF'
Add the writing standard for notes

The doc already claimed this ground — "case studies now, the notes later.
One source, so the rules cannot drift between places" — so this is a
section in it rather than a second file.

Five deltas from the case-study register, and a banned list covering the
clichés a case study never gets near. Chief among them "As designers, we",
which is how a writer asserts something without owning it.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Write "Building this portfolio from scratch"

**Files:**
- Modify: `content/notes/building-this-portfolio-from-scratch.mdx`

**Interfaces:**
- Consumes: the writing standard from Task 5, the route from Task 3.
- Produces: the first published note, which is also the register sample the remaining four are checked against.

Written first because it is the only one where the material already exists: `CLAUDE.md` documents the real decisions — the reference sites, the token rhythm, the segmented control, the greeting, the fanned thumbnails, the TOC marker spring across three plan files in `plans/`, and a Deferred section that is a written record of trade-offs knowingly accepted.

**Subject, from the source table:** *"My process, in the open. What actually happened between the reference sites I chased and the site that shipped — the parts a case study usually cuts."*

- [ ] **Step 1: Interview**

Ask these five, one message, and wait for the answers. Do not draft before they land.

1. Which decisions cost the most time relative to how little they look? The TOC marker went through three plan files and ended on a critically damped spring — is that the story, or is there a duller one that cost more?
2. What did you take from the reference sites (emilkowal.ski, jakub.kr, benji.org, shedsgns.me, mikes.cv) and then throw away?
3. The Deferred section records that you shipped the resting underline at 2.1:1, knowingly under the 3:1 floor, for how the wipe reads. Does that still sit right, and would you say so publicly in these words?
4. What is still wrong with the site that you have decided to live with?
5. How much of this did you write versus an agent, and how do you want that described? This one matters — the essay is about process in the open, and a piece about honesty that is quiet about its own authorship has a hole in it.

- [ ] **Step 2: Draft the essay into the file**

Keep the existing `meta` block, set `draft: false`, and write the body beneath it. Bound by `docs/tone-of-voice.md` including the new `## Notes` section. Headings may run long; `<Figure>` is available without importing anything and should be used only where an image is evidence rather than decoration.

- [ ] **Step 3: Verify the read time is derived and plausible**

```bash
npm run build && npm run start &
sleep 4
curl -s http://localhost:3000/notes | grep -o '[0-9]* min read' | sort -u
wc -w content/notes/building-this-portfolio-from-scratch.mdx
```

Expected: the rendered read time is roughly `wc -w` divided by 200, rounded up. `wc -w` counts the meta block and any JSX, which the stripper removes, so the rendered number should be **at or slightly below** the `wc -w` estimate. If it is above, the stripper is dropping prose and that is a bug to fix before continuing.

- [ ] **Step 4: Verify it is the only published note**

```bash
npm run build && npm run start &
sleep 4
curl -s http://localhost:3000/notes | grep -c 'href="/notes/'
```

Expected: `1`. The other four are still drafts, so production shows one row. It has no Newer and no Older, and `.case-nav` renders nothing — confirm the page does not show an empty nav. Stop the server afterwards.

- [ ] **Step 5: Read it against the standard**

Re-read the draft with `docs/tone-of-voice.md` open and check, explicitly: no "it’s not just X", no sentence opening with "And" or "But", no "As designers, we", no hedging words, no abstract closing line, no composite anecdote, typographic apostrophes throughout. Fix what fails.

- [ ] **Step 6: Commit**

```bash
git add content/notes/building-this-portfolio-from-scratch.mdx
git commit -m "$(cat <<'EOF'
Write "Building this portfolio from scratch"

The first note with prose behind it, and the first published one. Read
time stops being a placeholder and starts being a count.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Write "Everything is a first draft now"

**Files:**
- Modify: `content/notes/everything-is-a-first-draft-now.mdx`

**Interfaces:**
- Consumes: the writing standard from Task 5; the register established in Task 6.
- Produces: the second published note. Task 6's note gains an Older link and this one gains no Newer, since it is the most recent.

**Subject, from the source table:** *"AI and product design. Drafting got free, so the scarce thing moved. What’s left of the job when the artefact costs nothing."*

- [ ] **Step 1: Interview**

Ask these five, one message, and wait.

1. What do you actually use AI for in your design work, day to day — and what did you stop doing by hand as a result?
2. Drafting got free. What got scarce in its place? Naming that precisely is the essay's spine, and a vague answer here produces a vague essay.
3. Was there a moment you shipped, or nearly shipped, something because it was cheap to generate rather than because it was right?
4. This portfolio was built with an agent. Does that count as evidence for your argument or against it?
5. Do you hold a view on what this does to designers entering the field now — one you would defend to someone who disagreed?

- [ ] **Step 2: Draft the essay into the file**

Keep the `meta` block, set `draft: false`, write beneath it. Bound by `docs/tone-of-voice.md` including `## Notes`.

- [ ] **Step 3: Verify the chain now has two entries**

```bash
npm run build && npm run start &
sleep 4
curl -s http://localhost:3000/notes | grep -c 'href="/notes/'
curl -s http://localhost:3000/notes/everything-is-a-first-draft-now \
  | grep -o 'case-nav-direction[^>]*>[A-Za-z]*'
```

Expected: `2` rows. This note is the most recent, so it has an **Older** link and no Newer. Confirm `Newer` does not appear on it, and that the older note's page now shows a `Newer` pointing here.

- [ ] **Step 4: Read it against the standard**

Same explicit check as Task 6 Step 5: no "it’s not just X", no "And"/"But" openings, no "As designers, we", no hedging, no abstract ending, no composite anecdote, typographic apostrophes. Fix what fails.

- [ ] **Step 5: Commit**

```bash
git add content/notes/everything-is-a-first-draft-now.mdx
git commit -m "$(cat <<'EOF'
Write "Everything is a first draft now"

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Write "Deciding is the job"

**Files:**
- Modify: `content/notes/deciding-is-the-job.mdx`

**Interfaces:**
- Consumes: the writing standard from Task 5.
- Produces: the third published note, sitting between Tasks 7 and 6 in the chain by date.

**Subject, from the source table:** *"Decision making in design. The cost of keeping options open, and why ‘let’s explore it further’ is usually a decision wearing a disguise."*

- [ ] **Step 1: Interview**

Ask these five, one message, and wait.

1. A specific decision you deferred that cost you — how long did it stay open, and what did the delay actually cost?
2. Who said "let’s explore it further", and what were they protecting? Anonymised, but real and specific.
3. What is your rule now for when exploring stops?
4. Have you been the one hiding behind exploration? The essay is stronger if the answer is yes and it says so.
5. A decision you made fast that turned out wrong — do you still think fast was right?

- [ ] **Step 2: Draft the essay into the file**

Keep the `meta` block, set `draft: false`, write beneath it. Watch the title's own trap: an essay arguing for decisiveness cannot hedge in its own sentences, so the ban on hedging words is doing double duty here.

- [ ] **Step 3: Verify the chain**

```bash
npm run build && npm run start &
sleep 4
curl -s http://localhost:3000/notes | grep -c 'href="/notes/'
```

Expected: `3`. This note is dated between the other two, so its page shows both a Newer and an Older.

- [ ] **Step 4: Read it against the standard**

Same explicit check as Task 6 Step 5. Fix what fails.

- [ ] **Step 5: Commit**

```bash
git add content/notes/deciding-is-the-job.mdx
git commit -m "$(cat <<'EOF'
Write "Deciding is the job"

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: DROPPED — "Consensus is where good ideas go to get safe"

Cut on the author's instruction, and the file deleted rather than left as a
draft. The note needed at least one real incident behind it — a sign-off
process, an idea that got sanded down, a time the committee was right — and
none was available. A consensus essay written from position alone would have
been indistinguishable from a hundred others and would have sat next to three
notes full of measurements and named trade-offs.

`app/notes.ts` reads the content directory, so deleting the file was the entire
change: it leaves the list, the Newer/Older chain and `generateStaticParams` on
its own. The four remaining notes re-link across the gap.

Recoverable from git history if it is ever wanted back.

---

### Task 10: Write "Nobody was hired for their Figma file"

**Files:**
- Modify: `content/notes/nobody-was-hired-for-their-figma-file.mdx`

**Interfaces:**
- Consumes: the writing standard from Task 5.
- Produces: the fifth and last published note. After this, no note is a draft.

**Subject, from the source table:** *"On what hiring panels actually evaluate. The portfolio is a proxy — for what, most designers never find out."*

- [ ] **Step 1: Interview**

Ask these five, one message, and wait.

1. Have you sat on the hiring side? Roughly how many candidates, and what actually moved you towards or away from someone?
2. A portfolio is a proxy. For what, in your view — say it in one sentence, because that sentence is the essay.
3. A time your own portfolio worked, or failed. What was said to you?
4. What piece of commonly-given portfolio advice do you think is wrong?
5. Given the argument, what is *this* site for? The essay sits on the thing it is describing, and ducking that is the one move a reader will notice.

- [ ] **Step 2: Draft the essay into the file**

Keep the `meta` block, set `draft: false`, write beneath it.

- [ ] **Step 3: Verify every note is published and the chain is whole**

```bash
npm run build && npm run start &
sleep 4
curl -s http://localhost:3000/notes | grep -c 'href="/notes/'
grep -rl 'draft: true' content/notes/ | grep -v '_note.mdx'
```

Expected: `4` rows (five minus the dropped Task 9 note), and the second command returns **nothing** — no note file still carries `draft: true`, only the template does. Then confirm the ends of the chain: the newest note has no Newer, the oldest has no Older, and neither renders an empty column.

- [ ] **Step 4: Read it against the standard**

Same explicit check as Task 6 Step 5. Fix what fails.

- [ ] **Step 5: Verify the whole feature end to end**

```bash
npx tsc --noEmit && npm run lint && npm run build && npm run start &
sleep 4
for s in everything-is-a-first-draft-now deciding-is-the-job \
         building-this-portfolio-from-scratch \
         nobody-was-hired-for-their-figma-file; do
  curl -s -o /dev/null -w "$s %{http_code}\n" "http://localhost:3000/notes/$s"
done
curl -s -o /dev/null -w 'template %{http_code}\n' http://localhost:3000/notes/_note
```

Expected: `200` for all four, `404` for the template. Then check by eye at a wide viewport and at 375px, where the `.note-row` stacking breakpoint lives, in both light and dark. Stop the server afterwards.

- [ ] **Step 6: Commit**

```bash
git add content/notes/nobody-was-hired-for-their-figma-file.mdx
git commit -m "$(cat <<'EOF'
Write "Nobody was hired for their Figma file"

The last of the five. No note is a draft now.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```
