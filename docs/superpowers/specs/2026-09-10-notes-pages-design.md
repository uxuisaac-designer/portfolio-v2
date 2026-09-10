# Notes pages — design

Five notes exist as titles in `app/notes.ts` and as rows on `/notes`. None has
a page behind it. This gives each one a route, a file and prose, and retires
the two deferred items that were waiting on exactly that.

## What this unblocks

Two entries under **Deferred** in `CLAUDE.md` close as a direct consequence,
and the spec is written to close them rather than leave them restated:

- *"None of the five note rows are links."* Each row becomes a `<Link>`, which
  also gives them a focus ring — `.page a:focus-visible` picks them up the
  moment they are anchors.
- *"The read times in `app/notes.ts` are written by hand… they become a word
  count once there is prose to count."* They become a word count.

Nothing here touches the third note-adjacent deferred item (the resting
underline contrast), which stays open on its own terms.

## Routes

`app/notes/[slug]/page.tsx`, a sibling of `app/work/[slug]` and outside the
`(site)` group, so a note does not inherit the greeting, avatar and nav. The
`/notes` index stays at `app/(site)/notes/page.tsx`; `(site)` is a route group,
so the URLs line up without either file moving.

`dynamicParams = false`, and `generateStaticParams` reads `content/notes`,
filtering to `.mdx` files that do not start with an underscore. Same reasoning
as the case route: a URL with no file behind it is a 404 rather than a 500 out
of the dynamic import, and the authoring template never becomes a live page.

## Page shape

A plain centred column. `.case-column` with no `.case` wrapper and no sidebar —
that class is already centred on its own and does not depend on the sidebar
existing, so the layout costs nothing new.

No contents list. A case study is scanned by a recruiter looking for evidence,
so it earns a jump list; an essay is read top to bottom. Dropping the sidebar
also lifts the 24-character heading limit, which exists only because the
contents list sets its active label in weight 500 and a longer heading rewraps
as you scroll past it. Notes are free to carry longer headings, or none.

Order down the column:

1. The Index link, always present. The case route splits this in two —
   `.case-index` styles it and `.case-index-inline` adds the bottom margin
   and then hides it above 64rem, because the sidebar takes the link over.
   Notes have no sidebar, so they need the margin without the hiding:
   `.case-index` plus a new `.note-index` carrying `margin-bottom:
   var(--space-stack)`.
2. `<header className="case-header">` — `.case-title`, then a `.note-date`
   line reading `10 September 2026 · 6 min read` at label size in `--muted`.
3. `.case-body` — the MDX.
4. `.case-nav` — Newer/Older.
5. `Footer`, with `.case-column .footer` already taking the full 96px step.

### Class naming

Notes reuse `.case-column`, `.case-body`, `.case-title`, `.case-header`,
`.case-index`, `.case-nav` and its children. The `case-` prefix becomes
slightly inaccurate once two routes share them. Renaming roughly twenty
selectors across `globals.css`, both route files and `CLAUDE.md` is churn with
no reader-facing payoff, so the names stay and `CLAUDE.md` documents them as
the reading-page classes both routes share.

Two new classes only: `.note-index` and `.note-date`.

## Content

`content/notes/*.mdx`, with `content/notes/_note.mdx` as the blank to copy —
the same leading-underscore convention `_case-study.mdx` uses.

```js
export const meta = {
  title: "Everything is a first draft now",
  published: "2026-09-10",
  draft: false,
};
```

Three fields. No tagline, no fact strip: a note is a title, a date and prose.
The case study's eyebrow exists because a case study belongs to an employer;
a note belongs to nobody.

### Slugs

Kebab-case, derived from the title by hand at authoring time and fixed
thereafter — the filename is the URL, so it cannot be regenerated from a title
that later gets edited. The five:

| Title | Slug |
| --- | --- |
| Everything is a first draft now | `everything-is-a-first-draft-now` |
| Deciding is the job | `deciding-is-the-job` |
| Building this portfolio from scratch | `building-this-portfolio-from-scratch` |
| Consensus is where good ideas go to get safe | `consensus-is-where-good-ideas-go-to-get-safe` |
| Nobody was hired for their Figma file | `nobody-was-hired-for-their-figma-file` |

### Required fields

`title` and `published` are required; `draft: true` exempts a file, exactly as
it does for a case study. The page throws at build when one is missing, and
every note is prerendered, so the build fails rather than shipping a blank
heading. `published` is additionally asserted to parse as a date — an
unparseable one sorts unpredictably and renders as `Invalid Date`, which reads
as a styling bug rather than a data one. That is the same failure the case
route's `assertPublishable` exists to catch.

### Drafts

Identical semantics to case studies: kept out of the `/notes` rows and the
Newer/Older chain in production, linked as normal in development, and the route
is built either way so a draft is always reachable by its own URL. A hidden
entry drops out of the chain rather than leaving a gap, so a draft in the
middle joins the two either side of it.

## `app/notes.ts`

It stops being a hand-written array and starts reading the content directory,
the way `app/case-studies.ts` does. Every field on it now has a file behind it,
so a second copy kept in step by hand would only be a way to disagree with the
source.

```ts
export type Note = {
  title: string;
  slug: string;
  href: string;      // `/notes/${slug}`
  published: string; // ISO, as written in meta
  date: string;      // "10 September 2026"
  readTime: string;  // "6 min read"
};

export async function notes(): Promise<Note[]>;
export async function neighboursFor(href: string): Promise<{
  newer: Note | null;
  older: Note | null;
}>;
```

`notes()` reads the directory, imports each module for its `meta`, reads each
source file for its word count, drops drafts in production, and sorts by
`published` descending. The `/notes` page becomes `async` to await it, which it
can — it is already a server component.

Reading a note means touching its file twice — the compiled module for `meta`,
the raw source for the word count. That split already exists on the case route,
where `outlineFor` reads the source with `readFile` while the page
dynamic-imports the module.

The `[slug]` page needs the same date and read time the list does, so both go
through one helper rather than each deriving it:

```ts
export async function noteFor(slug: string): Promise<Note>;
```

`notes()` maps it over the directory; the page calls it once for its own slug.
A note page therefore never reads the other four files.

`neighboursFor` shares its name with the export in `app/projects.ts`
deliberately. They live in different modules and are never imported together,
and the parallel name is the signal that the two chains behave identically.

### Read time

Word count over 200 words per minute, `Math.max(1, Math.ceil(words / 200))`,
rendered as `${minutes} min read`. 200wpm is the conventional figure for prose
and is stated in a comment so the number is not mistaken for a measurement.

Counting runs on the raw MDX with the following removed, in order: the
`export const meta` block (found by scanning braces from `export const meta = {`
rather than by regex, so a nested object cannot truncate the strip); fenced code
blocks; self-closing JSX components such as `<Figure … />`; remaining tags;
heading markers, emphasis characters and link URLs, keeping link text. What
survives is split on whitespace and counted.

This is deliberately approximate. A read time is a courtesy, not a claim, and
the honest failure mode is a minute either way rather than a number typed from
nothing.

### Date rendering

`Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric",
timeZone: "UTC" })` → `10 September 2026`. UTC is pinned so a build machine's
zone cannot shift a date across midnight. `app/london-time.ts` already
establishes `Intl` with an explicit zone as the house pattern.

## The index row

The date does **not** go on the `/notes` row. That row is a `1fr auto` grid
with a stacking breakpoint at 30rem derived from a measurement at a 343px
column, documented at length in `globals.css`; a third item means redoing that
calculation for no gain. The row keeps title and read time. The date appears on
the note's own page, where a dated opinion is the honest kind.

The five `<div className="note-row">` elements become `<Link href={note.href}>`.
No CSS changes: the hover wipe and the `:active` line are already written
against `.note-row .link-underline` and do not care what element carries them.

## Newer / Older

Its own chain over notes — a note's neighbour is a note, never a case study.
Same shape as `neighboursFor` in `app/projects.ts`: most recent first, so the
entry above is Newer and the entry below Older, Newer sits left and Older
right, neither end wraps, and a lone Older keeps its column rather than sliding
into the empty half.

`.case-nav-item` is a flex column of three spans. The third currently holds the
company; for a note it holds the read time. Three lines either way, so no CSS
changes.

## Writing standard

The deltas below are added to `docs/tone-of-voice.md` as a `## Notes` section
rather than written to a second file. That doc already claims the ground —
*"the writing standard for everything on this portfolio — case studies now, the
notes later. One source, so the rules cannot drift between places."*

### Carried over unchanged

Short declaratives. No hedging words. Active voice, first person. No sentence
opens with "And" or "But". No self-praise adjectives. No abstract endings.
Prose, not bullets. Typographic apostrophes, en dashes in ranges, em dashes for
asides. The banned construction — *"it's not just X, it's Y"* and every
paraphrase of it — stays banned, and gets more tempting in an essay rather than
less.

### Five deltas

1. **Asides come off the bench.** The existing cap is one per ~500 words, with
   a hard floor at 300 — which in practice rules them out of this site, since
   case-study sections run 60–200 words. Notes clear the floor. The rule does
   not change; the sections finally qualify. Most of the extra warmth comes
   from here, at no cost to consistency.
2. **A metaphor can carry an essay, not just a pattern.** In a case study the
   image explains one interaction and stops. In a note it can be the spine:
   introduced early, returned to once, paid off at the end. Still one per idea,
   still never stacked.
3. **Second person is unlocked.** Case studies are "I did X, it moved Y". An
   essay may address the reader directly. This is the largest single lever on
   warmth and it is unavailable in the case studies by nature rather than rule.
4. **Reversal counts as evidence.** "I think" stays banned as hedging. "I
   argued the opposite of this for two years" is not hedging, it is the
   strongest thing an opinion piece can offer. Named, dated, specific. Uncertain
   about the conclusion is allowed; mushy in the sentence is not.
5. **Evidence changes currency, not rigour.** A case study proves a claim with
   a number. An essay proves it with a scene — a specific meeting, a specific
   file, a specific sentence someone said. **No composite anecdotes.** No "a
   designer once told me" if no designer did. That is the essay-writing
   equivalent of an invented metric and it is the likeliest failure mode here.

### Banned in notes specifically

Clichés a case study never gets near: the dictionary-definition opener; "In
today's world" and "In an age of"; the rhetorical-question hook; "Here's the
thing"; LinkedIn cadence, meaning single-sentence paragraphs stacked for drama;
closing on a call to action.

Chief among them: **"As designers, we…"**. All five topics list toward
industry-commentary voice, and the collective first person is how a writer
asserts something without owning it. Every claim in these essays is one to
stand behind personally.

### Headings

The 24-character limit lifts — it exists only to stop the contents sidebar
rewrapping, and notes have no sidebar. A note may also run headless where the
argument is continuous.

### Length

Not specified. Read time is computed from the finished text, so length is a
result rather than a target. The current 5–10 minute figures in `app/notes.ts`
are placeholders that the file's own comment already admits to, and they are
replaced by whatever the prose actually measures.

## Sourcing

Each essay is preceded by a short interview — three to five questions covering
the specific incident behind it, the position actually held, and the thing
changed one's mind. Drafting follows the answers. Four of the five describe
experiences not present anywhere in this repository, and drafting them cold
would mean writing plausible design-industry opinions in a borrowed sentence
rhythm, which is the worst available outcome for a portfolio.

### Attribution

Anonymised but real. Incidents are true and specific; no employer or colleague
is named inside a note. "A marketplace I worked at", "the person who owned the
roadmap". The evidence stays concrete enough to carry the argument without a
searchable person reading themselves into it, and the case studies already name
the employers for anyone who wants that context.

## Errors

- **Missing `title` or `published` on a published note** — throws at build,
  naming the file and the field. Drafts exempt.
- **Unparseable `published`** — throws at build, same message shape.
- **A slug with no file** — 404 via `dynamicParams = false`, never a 500.
- **A note whose body is empty** — read time floors at `1 min read` rather than
  rendering `0 min read`.

## Verification

There is no test runner in this project and adding one is a dependency
decision, which the working style reserves for the user. Verification is
therefore:

- `npm run build` — prerenders every note, so the required-field and
  date-parsing asserts run against real content, and a failure is a failed
  build rather than a bad page.
- `npm run lint`.
- The computed read time of one note checked by hand against a word count of
  its source, to confirm the stripping is not counting JSX or dropping prose.
- `/notes` and one note page checked in the browser at a wide viewport and at
  375px, where the row stacking breakpoint lives.

If a test runner is wanted, the word-count and date helpers are the pure
functions worth covering and the question should be raised before implementation
rather than during it.

## Documentation

`CLAUDE.md` gains a `## Notes` section covering the route, the three meta
fields, the computed read time, the shared reading-page classes and the absent
contents list. The two deferred entries named at the top of this spec are
deleted rather than edited — they describe a state that will no longer exist.
