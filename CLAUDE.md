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
Underline (link resting): oklch(0.700 0.003 58) — the wipe line is Text.
Keep the resting line light: the gap between the two IS the animation, and
against Muted it drops to 2.3:1 and stops reading.
Palette is desaturated Tailwind stone at hue 58. Two text colours only:
--text and --muted, nothing in between.
Dark palette lives under .dark in globals.css, set outright rather than
derived from the light values so the two tune independently. It covers
--press and --underline as well as the core five; the --segmented-* tokens
point at --border, --bg and --text and follow on their own.
Body: 14px / 20px / -0.011em, Geist
Label: 12px (dates, meta). Only two sizes — headings sit at body size
and take their weight from 600, so hierarchy stays weight, not scale.
Easing: hover cubic-bezier(0.4, 0, 0.2, 1) · entrance cubic-bezier(0.23, 1, 0.32, 1)
Hover is asymmetric: 100ms in, 200ms out
Entrance 400ms, 8px Y, 40ms stagger (150ms fade only under reduced motion)
Prose links are a two-layer pseudo-element underline on an inline-block
span, not text-decoration: a resting line plus a Text line that wipes in
from the left over 300ms on cubic-bezier(0.32, 0.72, 0, 1) and exits off
the right. No skip-ink, so the offset is measured against the type scale to
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
- Projects and writing are text rows, never cards
- Hierarchy comes from weight and opacity, not size
- One typeface. The exception is the greeting: Geist has no CJK or
  Arabic glyphs, so those three fall back to system fonts

## Do not use
No gradients. No box-shadows. No component
libraries (shadcn, MUI, etc). No border-radius above 16px.
No stock illustration. No emoji, except the flag in the footer — which
is the one piece of colour on the page and a deliberate exception.

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
loads and the layout never depends on the file's own dimensions.
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
`ratio` overrides the 16:9 frame per figure, which is what portrait phone
recordings need — 16:9 with object-fit cover would crop them to a strip.

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

## Deferred
Known-open, deliberately. Each says what unblocks it, so none of these get
rediscovered or re-litigated.

- **Six of the seven project rows are still not links.** Buyer experience
  points at its case study; the rest render the same markup as a div, so
  the hover fill, name underline, press state and focus ring already read
  identically either way. Each becomes a link as its case study lands.
- **None of the five note rows are links.** No note is written yet, so each
  is a div wearing the markup a link will wear — the wipe and the press
  already read identically. This one costs more than the project rows do:
  note titles wear the prose-link underline, which is visible at rest, so a
  row reads as a link before it is one. They also have no focus ring, since
  a div is not focusable; .page a:focus-visible picks them up the moment
  they become anchors. Accepted deliberately —
  the rows are the point of the page and a page of unmarked text would read
  as a list of nothing. The read times in app/notes.ts are written by hand
  for the same reason; they become a word count once there is prose to
  count. Each row becomes a link as its note lands.
- **Nav segments are buttons, not links.** Driven by router.push, as
  specified. The cost is real now that Notes and Lab are reachable: no
  middle-click, no open-in-new-tab, nothing for a crawler to follow.
  Styled <Link>s look identical if that becomes worth it.
- **Dark-mode row thumbnails are bright.** Kick Game and Klekt carry real
  cards now; Car & Classic's three are still placeholder.png, a light block,
  so each shows three white rectangles on the dark background. Goes away as
  the last case-study images land.
- **Route change is a CSS fade, not the View Transitions API.** Reasoning
  under Tokens above. Revisit when ViewTransition ships in a stable React.
- **CJK and Arabic greetings fall back to system fonts.** Noted under Hard
  constraints. Only fixable by dropping those languages or loading Noto
  faces for three words.

## Working style
Ask before adding any dependency.
Small commits, one change at a time.
