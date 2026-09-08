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
copy, 48px copy to the nav, 24px nav to content, 80px between
employers, 96px between sections. The nav sits closer to what it
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
Greeting cycles eight languages, English first, each trailing "..." except
Arabic: 80ms per character in,
6000ms held, 40ms per character out, 800ms empty. A 1px cursor blinks at
1.06s step-end while the text rests and stays solid while it moves. All
eight are stacked in one grid cell so the box reserves the widest and
nothing reflows; each keeps its own dir, so Arabic types right to left
from its own right edge. Under reduced motion it is a static "Hello" with
a steady cursor.
Route change: cross-fades .section-content only, 200ms on the wipe curve.
Everything above it lives in the layout and never re-renders.
This is a CSS fade by choice, not for want of the View Transitions API.
React's ViewTransition is reachable — Next vendors a canary and aliases
react to it — but only through that packaging detail and opt-in canary
types, and it would fail at runtime rather than at build if Next changed
it. Revisit when ViewTransition ships in a stable React.

## Hard constraints
- Single column, left-aligned, no hero section
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
No emoji. No stock illustration.

## Icons
Lucide is the icon library. Every icon renders through the Icon wrapper in
app/icons.tsx and is referenced by name — nothing else imports
lucide-react. Defaults are 16px, stroke 1.5, currentColor. Add to the
registry in that file to use a new one. It is icons.tsx, not icon.tsx,
because app/icon.* is a reserved App Router metadata route.

## Theme
next-themes, class strategy, system preference by default and the choice
persisted. The provider sits at the top of <body> and writes the class from
a blocking script before first paint, so nothing flashes; <html> carries
suppressHydrationWarning because of it.

## Working style
Ask before adding any dependency.
Small commits, one change at a time.
