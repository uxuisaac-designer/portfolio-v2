# Build prompt: Lab section

Paste into Claude Code from the root of `portfolio-v2`.

---

## Context

I'm adding a Lab section to my portfolio. It's a catalogue of 100 self-directed design experiments — small UI components, interaction patterns, motion studies, and larger concept explorations. Each entry answers a specific question I was trying to resolve.

This is a content system, not a one-off page. It needs to still look composed at entry 100, and adding an entry should take editing one MDX file and dropping in two media files. Build for that.

Stack is already in place: Next.js (App Router), TypeScript, Tailwind, deployed on Vercel. Match the existing conventions in this repo — read the homepage and any existing components first and follow the patterns already there rather than introducing new ones.

## Scope of this task

Build the architecture and the shell. Do not invent 100 entries. Create three real example entries so the grid, filtering, and detail page can all be verified, and make it obvious where entries 004–100 go.

## Content model

Entries live as MDX files in `content/lab/`, named `001-link-underline.mdx`.

Frontmatter:

```yaml
---
id: "001"                                    # string, zero-padded, unique
title: "Link underline"                      # noun-first, 2–3 words, sentence case
category: "Component"                        # Component | Pattern | Motion | Concept
tags: ["ui", "motion"]                       # free, lowercase
question: "Can an underline signal direction before the click?"
date: 2026-09-14
poster: "/lab/001/poster.webp"               # required
media: "/lab/001/demo.webm"                  # optional; static entries omit this
featured: false                              # optional, surfaces on homepage
---
```

MDX body is the writeup: what I was testing, what I tried, what I concluded. Freeform, but assume it's usually short (2–4 paragraphs) and occasionally has a code block.

Requirements:
- Type the frontmatter and validate it at build time. A missing `poster`, an unknown `category`, or a duplicate `id` should fail the build with a message naming the file. I'd rather find out at build than see a broken grid.
- Parse once, cache, sort by `id` descending (newest first).
- Export typed helpers: `getAllEntries()`, `getEntryBySlug()`, `getCategories()` (with counts), `getAdjacentEntries(id)`.
- Prefer `next-mdx-remote` or the built-in MDX setup over pulling in a heavy content framework.

## Routes

- `/lab` — index grid
- `/lab/[slug]` — detail page, slug is `001-link-underline`
- `/lab?category=component` — filtered index. Filter state lives in the URL so views are linkable and shareable, not in local state.

Static generation for all of it. `generateStaticParams` for detail pages. Per-entry metadata and OG images (use the poster as the OG image).

## The card

This is the centrepiece — get it right before anything else.

```
┌─────────────────────────────┐
│                             │
│       [ artefact ]          │   backdrop image, artefact floating centred
│                             │
└─────────────────────────────┘
  001   Component               meta line, small, muted
  Link underline                title
  Can an underline signal       question, max 2 lines, clamped
  direction before the click?
```

Structure:
- Media frame is a fixed aspect ratio (3:2), `border-radius` around 12–16px, `overflow: hidden`. The backdrop is a full-bleed static image inside it. The artefact sits centred on top with generous breathing room — the artefact should occupy roughly the middle 60% of the frame, never bleed to the edges.
- Caption sits **below** the frame, on the page background, not overlaid on the image. This is deliberate: it should read as a specimen case, not a marketing tile.
- Meta line: number and category, small and quiet, set apart by spacing rather than joined with a separator character. Do not use a middle dot to join them.
- Title carries the weight.
- Question is the third line, clamped to 2 lines.

Backdrop:
- One backdrop for every entry: the same grey already used for image backdrops elsewhere in this repo. Find the existing token or value and reuse it — do not introduce a new grey, and do not vary it by category.
- It's a flat background colour, not an image. Apply it to the media frame directly so there's nothing extra to load.
- No gradients, no mesh, no per-entry colour. The backdrop is a neutral stage; the artefact is the only thing with colour in the frame.

Hover:
- If `media` exists: poster is shown at rest, video plays on hover and on keyboard focus. Loop, muted, `playsInline`, `preload="none"`.
- Load the video lazily — only attach the source when the card enters the viewport, and only play on hover. Never autoplay a grid of videos.
- The card container itself does not move. No scale, no lift, no shadow change, no backdrop animation. Only the artefact inside the frame animates.
- `prefers-reduced-motion: reduce` — poster only, no playback.

## Index page

- Grid: 3 columns desktop, 2 tablet, 1 mobile.
- Category filter at the top: All, Component, Pattern, Motion, Concept, each with a count. Single-select. Reads from and writes to the URL query param. Keyboard accessible.
- Render 24 entries, then load more on scroll or via a button. Pick whichever fits the repo's existing patterns, but don't render 100 media frames at once.
- Empty state for a filter with no entries.
- Header: a short section intro explaining what the Lab is. Keep it to two sentences, no eyebrow label above it.

## Detail page

- Large media at the top: poster, with the loop playing on view (respecting reduced motion) or a play control.
- Below: number, title, category, tags, date.
- The question, given real prominence — it's the point of the entry.
- MDX writeup.
- Previous / next navigation using `getAdjacentEntries`.
- Back to `/lab`, preserving the category filter the user came in with if there was one.

## Constraints

- Server components by default. Only the filter control and the card's hover behaviour need to be client components. Keep the client boundary as small as possible.
- `next/image` for posters with explicit dimensions. No layout shift on load.
- Lighthouse performance on `/lab` should stay above 90 with 24 entries rendered.
- Keyboard: every card is a single focusable link with a visible focus ring. Tab order follows visual order.
- The entry number is not decorative sequencing — it's a catalogue ID. Present it as a label, not as a large display numeral.

## Explicitly avoid

- Cards that lift, scale, or shadow-shift on hover.
- Fade-and-slide-up entrance animations on the grid.
- All-caps tracked-out labels.
- Category badges in saturated colours or pill chips. Category is plain text in the meta line, nothing more.
- Any new dependency that isn't clearly justified. Tell me what you're adding and why before you add it.

## Deliverables

1. Content pipeline with build-time validation.
2. `LabCard`, `LabGrid`, `CategoryFilter` components.
3. `/lab` and `/lab/[slug]` routes.
4. Three example entries covering three different categories, one of them static (no `media`) so that path is exercised.
5. A note on the exact dimensions and format I should export posters and loops at, given the 3:2 frame and the 60% artefact rule.
6. A short `content/lab/README.md`: how to add entry 004, what each frontmatter field does, what dimensions posters and loops should be.

## How to work

Plan first. Show me the file structure, the type definitions, and the card component's markup before you write the full implementation, and wait for my go-ahead. Then build the card and the grid, and let me review that on screen before you move to the detail page.
