@AGENTS.md

# Portfolio — Isaac

Personal portfolio. Single-page index plus MDX case studies.

## Reference sites
emilkowal.ski, jakub.kr, benji.org, shedsgns.me, mikes.cv
Taking from these: single-column text layout, monochrome palette,
list-based project rows, micro-motion, no navigation.

## Tokens
Max width: 36.375rem
Page padding: 5rem 1rem 2.5rem, margin 0 auto
Stack rhythm: 12px image-to-text, 24px between blocks, 32px intro to
copy, 48px copy to the nav, 24px nav to content, 48px between
employers, 96px between sections. Each level doubles the one below it —
24, 48, 96 — so the three read as three. The nav sits closer to what it
switches than to what precedes it.
Background: oklch(0.985 0.002 58)
Text: oklch(0.216 0.004 58)
Muted: oklch(0.444 0.004 58)
Border: oklch(0.923 0.003 58)
Hover: oklch(0.960 0.003 58)
Press: oklch(0.930 0.003 58) — row fill on :active
Segmented nav is driven by useSelectedLayoutSegment, not usePathname: the
segment maps totally (null is the index route), and the control falls back
to its first item, so exactly one is always selected.
Segmented nav: --segmented-track (= Border), --segmented-pill (= Background),
--segmented-focus (= Text), --segmented-radius 8px, inner radius 6px
The track has to be Border, not Hover: against Hover the pill sits at
1.08:1 and disappears on a phone.
Pill slides 250ms on cubic-bezier(0.32, 0.72, 0, 1) — transform and width
only, never scale, and off entirely under reduced motion.
Underline (link resting): oklch(0.750 0.003 58) — the wipe line is Text.
Keep the resting line light: the gap between the two IS the animation, and
against Muted it drops to 2.3:1 and stops reading. The floor is the other
way: the line is the only thing marking a link, and at 0.750 it sits at
2.1:1 against Background, under the 3:1 non-text minimum. Softening it that
far was a deliberate call — see Deferred.
Palette is desaturated Tailwind stone at hue 58. Two text colours only:
--text and --muted, nothing in between.
Dark palette lives under .dark in globals.css, set outright rather than
derived from the light values so the two tune independently. It covers
--press, --underline and --figure as well as the core five; the --segmented-* tokens
point at --border, --bg and --text and follow on their own.
Body: 14px / 20px / -0.011em, Geist
Label: 12px (dates, meta). Only two sizes — headings sit at body size
and take their weight from 600, so hierarchy stays weight, not scale.
Easing: hover cubic-bezier(0.4, 0, 0.2, 1) · entrance cubic-bezier(0.23, 1, 0.32, 1)
Hover is asymmetric: 100ms in, 200ms out
Entrance 400ms, 8px Y, 40ms stagger (150ms fade only under reduced motion)
Prose links are a two-layer pseudo-element underline on an inline-block
span, not text-decoration: a resting line plus a Text line that wipes in
from the left over 400ms on cubic-bezier(0.32, 0.72, 0, 1) and exits off
the right. The curve is front-loaded enough that 90% of the travel lands in
the first 146ms — the duration sets the tail, the curve sets the stroke. No skip-ink, so the offset is measured against the type scale to
clear descenders — re-measure it if that scale moves.
Note titles are prose links, not project rows: body size, body weight, that
same underline, and the wipe firing from the title. A note row is therefore
not built on .row at all — a project row's hover state is its fill, which
needs the whole band, and a note's is the underline, which belongs to the
title. Sharing .row would mean inheriting a fill and a press only to
override both. The row keeps the geometry, drops the --row-bleed with the
fill, and sits flush with the paragraph above it.
Greeting cycles eight languages, English first, each trailing "..." except
Arabic: 80ms per character in,
6000ms held, 40ms per character out, 800ms empty. A 1px cursor blinks at
1.06s step-end while the text rests and stays solid while it moves. All
eight are stacked in one grid cell so the box reserves the widest and
nothing reflows; each keeps its own dir, so Arabic types right to left
from its own right edge. Under reduced motion it is a static "Hello" with
a steady cursor.
Project row thumbnails are three 3:4 cards fanned in the 64px column, the
way a hand of cards sits before it is dealt — 24x32, 33x44 and 30x40, each
absolutely centred on the box and placed by its own --x, --y and --r, drawn
in one transform. The box stays the 64px the single thumbnail held, so
nothing else in the row moves. On hover the outer two spread and turn
further out while the middle card, which is the one on top, does not travel
at all: it lifts 3px and grows 3%, so the fan opens around something rather
than sliding sideways as a unit. 380ms on the entrance curve, the same in
both directions — deliberately unlike the 100/200 house hover, because this
is travel rather than a colour, and a fan that snapped shut on exit would
read as a collapse. The row's fill still snaps in at 100ms and the cards
drift behind it. Cards carry the same --border hairline as the logos, doing
the separating a drop shadow would do elsewhere — checked by eye on the
Klekt pair, whose fans are white screens overlapping white screens, which
is the hardest case the hairline has to carry. At rest the fan is wholly
inside the box; at hover it reaches 1.2px left and 1.8px right, into the
row's 12px bleed and the 16px gap to the text, so nothing clips it. Under
reduced motion the fan comes off entirely rather than arriving instantly —
the resting fan is already the finished picture, so with the movement gone
there is nothing left to show, and the fill is still the signal.

Route change: cross-fades .section-content only, 200ms on the wipe curve.
Everything above it lives in the layout and never re-renders.
This is a CSS fade by choice, not for want of the View Transitions API.
React's ViewTransition is reachable — Next vendors a canary and aliases
react to it — but only through that packaging detail and opt-in canary
types, and it would fail at runtime rather than at build if Next changed
it. Revisit when ViewTransition ships in a stable React.

## Hard constraints
- Single column, left-aligned, no hero section. Case studies at
  /work/[slug] are the exception: a centred content column with a
  sidebar fixed to the viewport's left edge, which disappears below
  64rem. The sidebar is fixed rather than a grid column so the content
  stays centred and never shifts as the viewport widens. The homepage
  rule is unchanged.
- Route nav is a hand-built segmented control, left-aligned, shrunk to its
  labels, in the flow. Track one step off --bg, active pill --bg so the
  selection reads as cut out — no shadow. Never full width, never chrome
- No accent colour anywhere
- Projects and writing are text rows, never cards. Lab entries are the
  exception: cards in a two-column grid inside the column, because an
  experiment is looked at before it is read about
- Hierarchy comes from weight and opacity, not size
- One typeface. The exception is the greeting: Geist has no CJK or
  Arabic glyphs, so those three fall back to system fonts

## Do not use
No gradients in the site UI. No box-shadows. No component
libraries (shadcn, MUI, etc). No border-radius above 16px.
No stock illustration. No emoji, except the flag in the footer — which
is the one piece of colour on the page and a deliberate exception.

The favicon is the explicit exception to the gradient rule: a two-colour
orb, diagonal from top-left to bottom-right, pale lilac oklch(0.88 0.06
315) to mauve oklch(0.62 0.09 320). It lives in the browser chrome, not on
the page, so it does not break the monochrome page or count against the
flag being its one colour. The mauve is darker than the source swatch on
purpose — the gap is widened so the gradient still reads at 16px. The
stops are written as hex (#e7ccf3, #9e74a8) because favicon renderers do
not all parse oklch; both are inside sRGB, so nothing is lost.
app/icon.svg is the orb at 32 with 1px padding on a transparent ground.
app/apple-icon.png is the same gradient full-bleed at 180, with no orb
edge, because iOS applies its own mask and paints any transparency black.
app/favicon.ico carries the orb at 16, 32 and 48 for browsers that
still ask for it, Safari among them — regenerate it if the orb changes.

## Case studies
Content is MDX in content/work/*.mdx, rendered by app/work/[slug]. Each
file exports a `meta` with title, company and tagline, plus optional role,
timeline, team and software — these render as the fact strip under the
title. Label and value both sit at label size; the pair separates on colour
and the --hover pill at 6px, not on scale. A field left out leaves no gap
rather than an empty column. Headings are extracted from the source on the
server with the same slugger rehype-slug uses, so the contents list ships
in the HTML and its links match the heading ids; only the active item is
client work. The list appears at four headings or more.
Images go through <Figure>, which is exposed to MDX via mdx-components.tsx.
The frame holds a 16:9 ratio, so a block is the right size before the image
loads and the layout never depends on the file's own dimensions. A source
of another shape is contained rather than cropped, sitting whole on a
--figure mat: oklch(0.940 0.003 58), the lightness of the #ebebeb
placeholder it replaces, so a figure reads the same before and after its
image lands. In dark it is --hover's value. `inset` pads such a source 4%
of the frame's width off every edge so it sits on the mat rather than
touching it. It is set by hand, not read from the file: pages regenerate on
Vercel, where public/ is not on disk, so a size check at render would work
in the build and drop the inset on the first revalidation.
The company sits above the title as an eyebrow at label size in --muted, so
the title stays the first thing read. The tagline below is a sentence saying
what the work was for, not a subtitle naming the employer and year — the
eyebrow and the fact strip already carry those.
Title, tagline and strip sit in one <header>, so the 96px section gap
falls below the group rather than inside it.

<Figure> takes .mp4 or .webm as well as an image and renders a muted,
looping clip: preload is none and an IntersectionObserver plays it only
while a quarter of it is on screen, so nothing is fetched before it is near
and nothing runs behind the reader. It does not stand down under reduced
motion — a deliberate exception, since the motion is the evidence rather
than decoration. GIFs are converted rather than embedded; a screen
recording is many times smaller as video and a GIF cannot be paused at all.
An image's frame is a button that opens it in a viewer, app/figure-viewer.tsx
— a native <dialog> via showModal(), so focus, the inert page and Escape come
from the browser. The picture grows out of its place in the column into the
largest box the viewport allows, 400ms on the entrance curve, and shrinks
back into it; its own spot is emptied while it is away, so it reads as one
picture lifted off the page. It grows from the visible picture, not the
frame, so an inset source does not jump. A close mid-grow reverses from where
it has got to. The scrim is --bg over a 12px blur, so the viewer follows the
theme rather than flipping a light page to black. It shows the page's
already-loaded copy first and fades the full-size file in over it, so the
grow never runs on an empty frame. Any click closes it; the round close button
is 32px at radius 16px, the ceiling exactly. The page scroll is locked, with
the scrollbar's width paid back as padding so the column does not shift.
Under reduced motion it fades. Clips and the placeholder are not openable.

`ratio` overrides the 16:9 frame per figure, for when the mat would be
most of it — a portrait phone recording is better in a frame of its own
shape than as a sliver between two wide bands.

The contents list carries a 6px square at the active label, --text and
square-cornered, beside a label that takes weight 500 when active. That
weight sets a constraint on the writing: a heavier weight is wider, so a
heading close to the column width rewraps as it becomes active and the list
jumps while you scroll past it. Headings stay under about 24 characters so
they sit on one line. The list also reserves 14px at its end — the 8px gap
plus the square — because the sidebar scrolls, so overflow-x computes to
auto and a label filling the column would push the square out of sight. It
travels a quadratic Bézier whose
control point sits
beside the midpoint of the straight line, pushed right by 12px at a
one-step move and further with distance, capped at 32px — so it bows toward
the content column rather than back through the text. The path is diagonal
because the labels are ragged and the square sits after the text, so x and
y both interpolate. It also turns a quarter clockwise on the same t,
matching the bow, so the turn lands exactly when the travel does; a square
looks the same at both ends of a quarter, so the turn is something seen in
flight and never at rest. The angle accumulates and always lands on the
next multiple of 90 — adding 90 to an interrupted angle instead would knock
it off the grid for good, and one move cut short at 45° would leave it
resting as a diamond from then on. Progress is driven by a critically
damped spring (stiffness 157.9, damping 25.13) rather than a fixed
duration, so an interruption bends the motion instead of restarting it from
a standing start; carried velocity is rescaled by the ratio of the old path
to the new and clamped below √stiffness, which is what guarantees no
overshoot rather than merely making it unlikely. Half the path is covered
in 133ms and 90% by 317ms; the rest is a sub-pixel settle. transform only,
one combined translate() rotate() per frame. Clicking an item suspends the
observer for 700ms and the click owns the active section, so a smooth
scroll past four headings is one move rather than five. Under reduced
motion it moves instantly, does not turn, and only the opacity fade
remains.

The work itself lives in app/projects.ts, one list read two ways: the
homepage renders it grouped by employer, case studies read it flattened to
find their neighbours, so adding a project updates both. Only projects with
an href join the chain — walking the full list would point at pages that do
not exist, and navigation that 404s is worse than navigation that is not
there. The list runs most recent first, so the entry above is Newer and the
entry below Older, and they are named that in the code as well as the UI:
"previous" read either way, which is the ambiguity the labels exist to
settle. Newer sits left, Older right. Neither end wraps, and a missing side
leaves no empty slot — a lone Older keeps its column and stays right. Below
64rem the sidebar is gone, so the Index link is repeated at the top of the
content column and hidden again once the sidebar returns. The footer is the
homepage's, shared from app/ — .page is a flex column whose 24px gap
.footer's margin is measured against, and the case column is a plain block,
so it takes the whole 96px step there instead.

content/work/_case-study.mdx is the blank to copy. A leading underscore
means the route generator and the draft scan both skip it, and
dynamicParams is false so only generated slugs are served — a URL with no
file behind it is a 404 rather than a 500 from the dynamic import. Copying
the template is not enforced, but a published case study must carry a
title, company and tagline: the page throws at build if one is missing, and
every case study is prerendered, so the build fails rather than shipping a
blank heading. Drafts are exempt, so unfinished work can be half-written.
The fact strip's fields stay optional — it omits a missing one rather than
showing an empty column. The failure this really catches is a typo in a
field name, which renders as silent nothing and reads as a styling bug.

`draft: true` in a case study's meta keeps it out of the homepage rows and
the previous/next chain in production; in development it is linked as
normal, which is the point — a draft is something being worked on. The
route is built either way, so a draft is always reachable by its own URL:
unlinked, not unreachable. A hidden entry drops out of the chain rather
than leaving a gap, so a draft in the middle joins the two either side of
it. The flag is read from the module in app/case-studies.ts, so it is the
value the page itself renders with rather than a second copy kept in step
by hand.

Every case study opens with an Overview. The template renders that heading
and prepends it to the contents list, so a file starts straight into its
prose and cannot forget one. A file that writes its own `## Overview` keeps
it and the template stands down — two headings at id="overview" would break
both the contents link and the scroll spy.
The writing standard for case studies and anything else on the site is
docs/tone-of-voice.md — metaphor, sentence rhythm, the banned
constructions, how to handle evidence, and why headings stay under about 24
characters. It is the source; the case-study skill points at it rather than
restating it, so the two cannot drift.

## Notes
Content is MDX in content/notes/*.mdx, rendered by app/notes/[slug]. Each
file exports a `meta` with title, published and draft — three fields, not
the case study's eight. A note belongs to nobody, so there is no company
eyebrow and no fact strip.

The reading page is a centred .case-column with a sidebar that holds only
the way back, and no contents list. Back sits where a case study's Index
link does — in .case-sidebar from 64rem, and at the top of the column as
.case-index-inline below that, where the sidebar is gone — so the way out
of a reading page is in the same place whichever kind it is. A case study
is scanned by someone hunting for evidence, so it earns a jump list; a
note is read top to bottom. That
also lifts the 24-character heading limit, which exists only to stop the
contents list rewrapping as it gains weight 500 — a note's headings are
free to run long, or to be absent entirely.

The reading-page classes are shared rather than copied: .case-column,
.case-body, .case-title, .case-header, .case-sidebar, .case-index and
.case-nav all carry both routes. The case- prefix is inaccurate for half of
what it now styles, and that is preferred to renaming twenty selectors for
a name nobody reads. One class is the note's own: .note-date.

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

## Lab
Content is MDX in content/lab/*.mdx, rendered by app/(site)/lab and
app/lab/[slug]. Each file exports a `meta` with id, title, category, tags,
question, date, poster and optional media, featured and draft;
content/lab/README.md is the authoring guide and _entry.mdx the blank.
app/lab.ts reads the directory and validates every field, reporting every
problem in a file in one message naming it, and a duplicate id names both
files. Unlike notes and case studies, drafts are validated in full — a
draft still renders as a card in development. Paths are checked for shape,
never existence: public/ is not on disk when Vercel regenerates a page.
app/lab-category.ts holds the half the client needs, because app/lab.ts
imports node:fs.

Cards are two columns inside the 36.375rem column, one below 30rem. The
frame is 3:2 at radius 12px on --figure, the case-study mat, so the Lab
adds no grey; the artefact sits in the middle 60% (inset: 20%). Rows are
48px apart (--space-group) against a 16px column gap: a caption sits 12px
under its own frame, and at 24px the next frame pulled the question towards
it. The caption sits below the frame on the page: id and category at label
size apart by a 0.75rem gap and no separator, the title at 500 carrying the
house underline so the wipe fires from anywhere on the card, the question
muted and clamped to two lines. Titles stay on one line, cut with an
ellipsis, because a wrapped inline-block draws one rule the width of the
box. The card never moves. A loop plays on hover and on keyboard focus,
never on touch, with its source attached only within 200px of the viewport;
on an entry's page it plays while a quarter is on screen. Under reduced
motion no source is ever attached — the deliberate opposite of <Clip>,
whose motion is a case study's evidence. A Lab poster is already the
finished picture.

The filter is plain text links, colour marking the active one, because a
weight change would shove its neighbours along. State is ?category= in the
URL, read by lab-browser.tsx inside a Suspense boundary whose fallback is
the unfiltered grid, so /lab prerenders with the first 24 cards in its
HTML. 24 cards render, then Show more. Every card's markup still travels
in the RSC payload, serialised once — about 700 bytes a card, so the slice
limits the DOM and the image requests, not the payload. An entry's Back
link restores the filter from sessionStorage rather than a query on the
entry URL, so an entry has one address and the filter survives
Newer/Older. Newer/Older runs across the whole catalogue, not within a
category. Share cards are the house card with the question as the detail,
not the poster.

An entry's page is laid out like a note's, with Back in the sidebar from
64rem and at the top of the column below it. Then the header — number and
category, the title, and the question directly under it in --text where
a case study's tagline is muted — then the frame 24px below,
then the writeup 48px below the frame, a step further because it is about
the artefact rather than part of it. The header is .lab-header, not
.case-header, whose 96px would split the question from its image. No date
or tags render; date feeds the sitemap and tags are validated but unread.

## Icons
Lucide is the icon library. Every icon renders through the Icon wrapper in
app/icons.tsx and is referenced by name — nothing else imports
lucide-react. Defaults are 16px, stroke 1.5, currentColor. Add to the
registry in that file to use a new one. It is icons.tsx, not icon.tsx,
because app/icon.* is a reserved App Router metadata route.

## Theme
Brand logos with a dark variant ship both files and swap in CSS
(.group-logo-light / .group-logo-dark), never in JS — the theme class is on
<html> before first paint, so the right one is there from the start. A logo
that reads on either background needs no variant.

next-themes, class strategy, system preference by default and the choice
persisted. The provider sits at the top of <body> and writes the class from
a blocking script before first paint, so nothing flashes; <html> carries
suppressHydrationWarning because of it.

The toggle shows the theme you are in — sun in light, moon in dark — and
swaps the same way the logos do: both glyphs are rendered, stacked in one
grid cell, and .dark picks which is up. The outgoing one turns a quarter
clockwise, shrinks to half and fades while the incoming one turns in from a
quarter behind, 300ms on the entrance curve, so the pair reads as one dial
turning; going back it turns the other way. A transition rather than
keyframes, so a double-click reverses from mid-swap. Under reduced motion
only the cross-fade is left. This relies on the provider not setting
disableTransitionOnChange, which would kill the swap along with everything
else.

## Metadata
app/site.ts holds the address, the name and the default description, and
pageMetadata() builds every page's set from them. The address is the
vercel.app one until there is a custom domain; changing SITE_URL moves the
canonicals, the sitemap, robots and the share-card URLs together.

Titles carry the full name, Isaac Taiwo, where the page says only Isaac: a
title is read out of context, in a tab or a result or a shared link. The
template is "%s — Isaac Taiwo" and the index takes the bare name. A case
study's title is "Buyer experience at Kick Game" — out of the page, the
title has lost the company eyebrow that told you whose buyers — and its
description is the tagline. A note's description is the optional
`description` in its meta, falling back to the opening paragraph trimmed
at a word under 160 characters.

Every page builds its full metadata through pageMetadata() rather than
overriding the root's piecemeal. Next merges shallowly: a page's openGraph
replaces the root's whole object, and a page that sets only a title leaves
og:title saying the root's. The title template does not reach openGraph
either, so the name is joined on there by hand. A note is og:type article
with its published date; everything else is website.

Setting openGraph also cuts a page off from the root's opengraph-image, so
pageMetadata() names that card outright. Config outranks a route's own
opengraph-image file in this version rather than the other way round, so a
route that draws its own card passes ownCard: true to leave it alone — a
new one that forgets goes out with the index card, not with none.

A draft carries noindex, nofollow and is left out of the sitemap. It is
not disallowed in robots.txt: a disallowed URL can still be listed from a
link elsewhere, and a crawler refused the page never sees the noindex. The
sitemap reads the same lists the pages render, so it follows new work,
notes and Lab entries on its own. Notes and Lab entries claim a
lastModified from their own dates; a case study claims none — build time
would be a guess.

Share cards are next/og, drawn at build: app/opengraph-image.tsx for the
index, Notes and Lab, and one per case study, per note and per Lab entry,
each exporting generateStaticParams so none is drawn on request.
app/share-card.tsx is the one layout. Every line sits at one size, 48px,
separating on weight and colour as the site does; the longest tagline, 99
characters, fits three lines at that size, so a much longer one would
crowd the card. A note's card has no description — the title is what earns
the click, and the unfurl prints the description beside it. Light palette
only, as hex, since Satori reads neither oklch nor the viewer's theme. The
Geist faces are vendored in assets/fonts as TTF, because Satori takes no
WOFF2 and cannot synthesise the 600.

No theme-color. It can only follow the system preference, not the
toggle, so it would disagree with the page whenever someone had chosen the
other theme.

## Deferred
Known-open, deliberately. Each says what unblocks it, so none of these get
rediscovered or re-litigated.

- **Nav segments are buttons, not links.** Driven by router.push, as
  specified. The cost is real now that Notes and Lab are reachable: no
  middle-click, no open-in-new-tab, nothing for a crawler to follow. The
  sitemap now hands crawlers /notes and /lab directly, so what is left is
  the people. Styled <Link>s look identical if that becomes worth it.
- **Dark-mode row thumbnails are bright.** Kick Game and Klekt carry real
  cards now; Car & Classic's three are still placeholder.png, a light block,
  so each shows three white rectangles on the dark background. Goes away as
  the last case-study images land.
- **The resting underline is under the 3:1 non-text contrast floor.**
  oklch(0.750 0.003 58) sits at 2.1:1 against Background in light and 2.3:1
  in dark. Because .page a inherits the body colour, that line is the only
  thing distinguishing a link from prose, so the shortfall is real rather
  than decorative. Chosen for how the wipe reads — the resting line has to
  be faint for the Text line to register as movement. Unblocked by giving
  links a second non-colour affordance, at which point the line is free to
  be as light as it likes; oklch(0.640) is where it clears 3:1 unaided.
- **Share-card word spacing is uneven.** Satori lays out each word
  separately to wrap them, so some gaps render wider than Geist sets them
  in a browser, and it ignores word-spacing. Slight at the size an unfurl
  shows. Unblocked by a Satori release that shapes whole runs.
- **Route change is a CSS fade, not the View Transitions API.** Reasoning
  under Tokens above. Revisit when ViewTransition ships in a stable React.
- **CJK and Arabic greetings fall back to system fonts.** Noted under Hard
  constraints. Only fixable by dropping those languages or loading Noto
  faces for three words.
- **A filtered Lab link paints All before it filters.** /lab is
  prerendered with the unfiltered grid as the Suspense fallback, so
  opening /lab?category=motion directly shows every card until hydration.
  Chosen to keep the page static. Unblocked by rendering /lab dynamically,
  or by a proxy rewrite of ?category= to prerendered per-category pages, if
  the flash is ever visible on a real connection.
- **Show more resets on Back.** /lab/[slug] lives outside the (site)
  group, so opening an entry unmounts the grid and its shown count; Back
  lands on the first 24 with the scroll position past their end. Invisible
  until there are 25 entries. Unblocked by keeping the count in
  sessionStorage per category, beside the remembered filter.

## Working style
Ask before adding any dependency.
Small commits, one change at a time.
