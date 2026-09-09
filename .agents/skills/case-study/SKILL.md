---
name: case-study
description: Rewrite a case study for this portfolio into polished MDX aimed at design recruiters and hiring managers, then interrogate it for the numbers that make it credible. Use this whenever the user wants to write, rewrite, polish, tighten or restructure a case study, or gives a URL or slug and asks for it to be turned into a case study page — including phrasings like "make this read better", "write up the Klekt project", "this page is weak", or "add stats to this". Also use it when replacing placeholder content in content/work/*.mdx with real writing.
---

# Writing a case study

This portfolio's case studies are read by design recruiters, design managers,
product managers and heads of design, usually in a hurry and usually alongside
twenty others. The job is to make Isaac's work and judgement legible, fast,
without ever claiming more than actually happened.

You are writing in his voice, not about him. First person, past tense.

## What you do

You write the file. This runs inside the repo, so there is no block to hand
back — you produce `content/work/<slug>.mdx`, wire it up if it needs wiring,
and report what is still missing.

## Workflow

### 1. Get the source

The user gives a URL (a live page like
`https://portfolio-v2-rho-roan.vercel.app/work/consignment-app`, or a Notion
doc, Google Doc or Behance page), a slug, or a local path. Fetch or read it.

If a fetch fails, ask them to paste the text. Never reconstruct content from
the slug and your own imagination — an invented case study is worse than none,
because it is plausible enough to ship.

### 2. Read the house voice before writing a word

Read `content/work/kick-game-buyer-experience.mdx` and
`content/work/consignment-app.mdx`. These are the two written by hand and they
are the standard. Match their rhythm, heading style and honesty. Reading them
beats any description of them, and they stay current as the writing evolves.

Also read the "Case studies" section of `CLAUDE.md` for the rules that the
build actually enforces.

### 3. Draft

Apply the voice and structure below. Do not invent a metric, percentage,
timeframe, team size or outcome that is not in the source.

### 4. Then ask for numbers — about named claims, not in general

This is the step that earns the skill its keep. Design managers and heads of
design read for evidence; a case study with no numbers reads as an assertion.

Do not ask "do you have any stats?" — that gets a shrug. Re-read your own
draft, find each claim that is currently unquantified, and ask about those
exact sentences. Three to six questions, in one batch, each naming what it
would strengthen and what a good answer looks like:

- "You write that the sell flow had the most friction. What was listing
  completion rate before and after — a percentage pair, or raw counts?"
- "You say consignors were leaving. How many, over what period? Did it change
  after launch?"
- "The component library saved time. Roughly how much faster did later
  features ship — days per feature, or a fraction?"

Asking about a specific sentence jogs a specific memory. Asking in general
produces nothing.

### 5. Fold numbers in where the claim is made

A statistic belongs in the sentence it supports, not in a summary box at the
top. "Listing completion went from 34% to 61%" inside the paragraph about the
sell flow is evidence; the same number in a stat strip is decoration.

### 6. Where there is no number, say so

Do not fabricate, do not estimate, do not reach for "significantly" or
"dramatically" to cover the gap. The existing case studies end with lines like:

> I don't have the post-launch numbers. If I ran this again I'd instrument
> listing completion rate and time-from-open-to-listed before shipping — the
> sell flow was the whole point of the project and I can't tell you by how
> much it improved.

Keep that. Naming the measurement you would have taken demonstrates exactly
the judgement the reader is assessing, and it is more convincing than a vague
claim. If the user offers a number that contradicts the source or sounds
implausible, say so rather than printing it.

### 7. Write the file, and wire it if needed

Write `content/work/<slug>.mdx`. Derive the slug in kebab-case from the title
unless the source URL already has one — changing an existing slug breaks the
live URL and the homepage link.

Then check `app/projects.ts`. If the project is already there with a matching
`href`, nothing to do. If it is not, add it to the right company group in
chronological position (the list runs most recent first) with `name`,
`description`, `thumbnail: placeholder` and `href`. A page nobody links to is
a page nobody reads.

### 8. Verify, then report what is weak

Run `npm run build`. A published case study missing `title`, `company` or
`tagline` fails the build by design, so this catches a typo in a field name —
which otherwise renders as silent nothing and looks like a styling bug.

Then tell the user, briefly: which sections still have no evidence, which
claims are still unquantified, and which single asset would most improve the
page. End on what is missing, not on a summary of what you did.

## Voice

Confident, pragmatic, clear. Storytelling with rigour under it.

- **Objective.** Constraints, research, and outcomes — not design jargon or
  self-praise. Words that do not appear here: delightful, seamless, leveraged,
  passionate, user-centric, synergy, journey of discovery, elevate, curated.
- **Honest.** Trade-offs, iterations that failed, what was learned from a
  wrong turn. A case study where everything went to plan reads as fiction, and
  the reader is specifically looking for judgement under constraint.
- **Conversational but professional.** A smart colleague walking a design
  manager through the whiteboard, not a press release.
- **Active, first person.** "I interviewed consignors from Kick Game's own
  list" — never "user interviews were conducted".
- **Show, don't tell.** Replace "improved engagement" with the change made and
  the number it moved.
- **Short paragraphs**, two to four sentences. Declarative. Few subordinate
  clauses.
- **Lead with impact.** The opening prose carries the outcome. Nobody should
  read three sections of research to learn whether the work succeeded.

## Structure

Prose, not bullets. Bullets belong on a CV; this site is a single column of
paragraphs and lists fight it.

Headings are specific to the story, never generic process labels. "Consignors
were leaving", "Sellers aren't shoppers", "A system first" — not "Research",
"Ideation", "Solution". A generic heading tells the reader nothing and makes
every case study look like every other one.

- Opening prose with **no heading**. The template renders an "Overview"
  heading itself and prepends it to the contents list; a file that writes its
  own `## Overview` produces two elements with `id="overview"` and breaks both
  the contents link and the scroll spy.
- Four to six `##` sections after it. `##` only — no `#`, no `###`. The
  contents list appears at four headings including the auto-Overview.
- Close reflectively: "What I'd do differently", or similar.

## The file

```mdx
export const meta = {
  title: "Project name",
  company: "Company",
  tagline: "One sentence saying what the work was for.",
  role: "Senior Product Designer",
  timeline: "2022–2024",
  team: "Solo design",
  software: "Figma, Notion, Maze.io",
  draft: false,
};

Opening prose, no heading above it.

## First section

Body copy.

<Figure
  src="/placeholder.png"
  caption="What the image shows."
/>
```

`meta` rules:

- `title`, `company`, `tagline` are required on a published page — the build
  throws without them.
- `tagline` is a sentence about what the work was *for*. It is not
  "Company · Year": the company already sits above the title as an eyebrow and
  the year already sits in the fact strip, so that would print both twice.
- `role`, `timeline`, `team`, `software` are optional. A missing one leaves no
  gap rather than an empty column, so omit rather than guess.
- `draft: true` keeps the page off the homepage and out of the Newer/Older
  chain in production, while leaving it reachable by URL. Use it when the
  writing is not ready to be linked. `draft: false` publishes it.
- Date ranges take an en dash: `2022–2024`, `2024–Present`.

Figures:

- Everything goes through `<Figure src caption />`. Captions are sentences
  saying what is shown, not labels like "Fig. 1".
- Motion is `.mp4` or `.webm`, never GIF. `<Figure>` renders video as a muted
  looping clip that plays only while on screen; a GIF cannot be paused at all
  and is many times larger.
- `ratio="9 / 16"` for portrait phone recordings. The frame is 16:9 and would
  otherwise crop them to a strip.
- With no asset yet, use `/placeholder.png` and leave a comment naming the
  intended file: `{/* Clip slot. Swap for /clips/sell-flow.mp4, ratio 9/16. */}`

Typography: typographic apostrophes (’), en dashes in ranges, em dashes for
asides.

## Holding the line

- Preserve every fact in the source. Rewriting is clarity and structure, not
  new claims.
- Keep first person. Do not drift to "we" unless the source says a team did
  the thing — inflating a solo project into a team one is the fastest way to
  lose credibility in an interview, where it will be probed.
- If the source is thin — no research, no constraints, no outcome — say which
  of the three is missing and ask, rather than padding to length. A short
  honest case study beats a long hollow one.
- Do not commit, push or deploy. The user decides that.
