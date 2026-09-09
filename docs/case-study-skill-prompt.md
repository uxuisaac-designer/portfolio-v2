Create a skill called `case-study` that rewrites case studies for my product
design portfolio.

## What it does

I give it a URL (usually one of my own case study pages, e.g.
https://portfolio-v2-rho-roan.vercel.app/work/consignment-app, but sometimes a
Notion doc, Google Doc or Behance page where a draft lives). It fetches the
page, reads what is there, and rewrites it as a polished case study aimed at
design recruiters, design managers, product managers and heads of design. The
job is to sell my value and skills as a product designer without ever
overstating what actually happened.

It accepts a local path too — `content/work/<slug>.mdx` — and behaves the same.

## Workflow, in this order

1. **Fetch and read.** Pull the URL. Extract the existing narrative, the
   section structure, and any numbers already present. If the fetch fails, ask
   me to paste the text rather than guessing at content.

2. **Rewrite a first pass.** Apply the voice and structure rules below. Do not
   invent any metric, percentage, timeframe, team size or outcome that is not
   in the source.

3. **Then ask me for numbers — specifically, not generically.** This is the
   part that matters. Do not ask "do you have any stats?". Re-read your own
   draft, find every claim that is currently unquantified, and ask about those
   exact claims by name. Ask 3–6 targeted questions in one batch, each naming
   the sentence it would strengthen. For example:

   - "You write that the sell flow had the most friction. What was listing
     completion rate before and after?"
   - "You say consignors were leaving. How many, over what period, and did that
     change after launch?"
   - "You describe a component library that saved time. Roughly how much faster
     did later features ship?"

   For each, tell me what a good answer looks like — a before/after pair, a
   percentage, an absolute count, a timeframe — so I know what you need.

4. **Incorporate, honestly.** Fold the numbers I give you into the sentences
   they belong to, at the point the claim is made, not in a summary box.

5. **Where I have no number, say so plainly and move on.** Do not fabricate,
   do not estimate, do not hedge with "significantly" or "dramatically" to
   paper over a missing figure. An honest admission reads as maturity to the
   audience — my existing case studies end with lines like "I don't have the
   post-launch numbers. If I ran this again I'd instrument listing completion
   rate and time-from-open-to-listed before shipping." Keep that. It is a
   feature, not a gap. If I supply a number that sounds implausible or that the
   source contradicts, say so rather than printing it.

6. **Output a single block I can paste into Claude Code**, which is where the
   page actually gets created. See "What you hand back" below — this is the
   deliverable, not loose MDX.

## Voice

Confident, pragmatic and clear. Storytelling balanced with rigorous
problem-solving.

- **Pragmatic and objective.** Constraints, user research, and business
  outcomes — not design jargon or self-praise. Never "delightful", "seamless",
  "leveraged", "passionate", "user-centric", "synergy", "journey of discovery".
- **Reflective and honest.** Include trade-offs, iterations that failed, and
  what I learned from mistakes. A case study with no wrong turns reads as
  fiction.
- **Conversational yet professional.** Sound like a smart colleague walking a
  design manager through the whiteboard, not like a press release.
- **Active voice, first person.** "I interviewed consignors from Kick Game's
  own list", never "user interviews were conducted".
- **Show, don't tell.** Replace "improved engagement" with the specific design
  change and the number it moved.
- **Short paragraphs**, two to four sentences. Declarative sentences. Few
  subordinate clauses.
- **Lead with impact inside the structure below.** The opening prose is where
  the outcome goes — do not make a recruiter read three sections of research to
  find out whether it worked.

## Structure

Prose, not bullet lists. My case studies are written as paragraphs; bullets are
for a CV, not for this. Headings are specific to the story, never generic
process labels — "Consignors were leaving", "Sellers aren't shoppers", "A
system first", not "Research", "Ideation", "Solution".

- Opening prose with **no heading** — the site renders an "Overview" heading
  automatically and prepends it to the contents list. A file that writes its
  own `## Overview` breaks the contents link and the scroll spy.
- Four to six `##` sections after it. `##` only — no `###`, no `#`. The
  contents list appears at four headings including the auto-Overview.
- Close with a reflective section: "What I'd do differently" or similar,
  covering what I would measure or do differently next time.

## The file format it must output

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

Rules for `meta`:

- `title`, `company` and `tagline` are **required** — the site's build fails
  without them on a published page.
- `tagline` is a sentence about what the work was for. It is **not** "Company ·
  Year" — the company already appears as an eyebrow above the title and the
  year already appears in the fact strip, so that would say both twice.
- `role`, `timeline`, `team`, `software` are optional; a missing one leaves no
  gap rather than an empty column.
- `draft: true` keeps the page off the homepage and out of the Newer/Older
  chain in production. Set `draft: false` only when it is ready to be linked.
- Date ranges use an en dash: `2022–2024`, `2024–Present`.

Rules for images:

- Every image goes through `<Figure src caption />`. Captions are sentences
  describing what is shown, not labels like "Fig. 1".
- Motion goes in as `.mp4` or `.webm`, never GIF. `<Figure>` renders video as a
  muted looping clip that only plays on screen.
- Add `ratio="9 / 16"` for portrait phone recordings; the frame is 16:9 by
  default and would otherwise crop them to a strip.
- If I have not supplied assets, use `/placeholder.png` and leave an MDX
  comment naming the intended file, e.g.
  `{/* Clip slot. Swap for /clips/sell-flow.mp4 with ratio="9 / 16". */}`

Typography in content: typographic apostrophes (’), en dashes in ranges, em
dashes for asides.

## What you hand back

The final output is one fenced block I copy whole and paste into a Claude Code
session open on the portfolio repo. It has to stand on its own — that session
has no memory of our conversation, no access to the source URL, and no idea
which project this is. Write it as an instruction to that agent, in this shape:

    Create content/work/<slug>.mdx with the content below.

    - <slug> is already in app/projects.ts with href "/work/<slug>", so no
      change is needed there. — OR — This project is not in app/projects.ts.
      Add it to the "<Company>" group's items in chronological position
      (the list runs most recent first), with name, description, thumbnail:
      placeholder and href: "/work/<slug>".
    - draft is <true|false>. <If false: it will be linked from the homepage
      and join the Newer/Older chain, and the build will require title,
      company and tagline.>
    - Figure slots still on placeholder.png: <list them, with the intended
      asset path and ratio for each, or "none">.

    ```mdx
    <the complete file, meta block and all>
    ```

Rules for that block:

- Give the **whole file**, never a diff, an excerpt, or "the rest is
  unchanged". The agent is creating the file from nothing.
- State the slug explicitly. Derive it from the title in kebab-case unless the
  source URL already has one, in which case use that — changing a slug breaks
  the live URL and the homepage link.
- Say plainly whether `app/projects.ts` needs touching. Getting this wrong
  either leaves the page unlinked or creates a duplicate row.
- Do not include shell commands, git commands, or instructions to commit,
  build or deploy. I decide that.
- Put anything I still need to do — convert a GIF, supply a screenshot, confirm
  a number — in a short list *after* the block, not inside it.

## Also

- Preserve every fact in the source. Rewriting is about clarity and structure,
  not new claims.
- Keep my first-person voice. Do not switch to "we" unless the source says a
  team did the thing.
- If the source is thin — no research, no constraints, no outcome — say which
  of those is missing and ask for it before writing, rather than padding.
- Finish by telling me what is still weak: which sections have no evidence,
  which claims are still unquantified, and what asset would most improve the
  page.
