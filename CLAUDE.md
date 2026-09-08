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
Background: oklch(0.985 0.002 58)
Text: oklch(0.216 0.004 58)
Muted: oklch(0.444 0.004 58)
Border: oklch(0.923 0.003 58)
Hover: oklch(0.960 0.003 58)
Press: oklch(0.930 0.003 58) — row fill on :active
Underline (link resting): oklch(0.700 0.003 58) — the wipe line is Text.
Keep the resting line light: the gap between the two IS the animation, and
against Muted it drops to 2.3:1 and stops reading.
Palette is desaturated Tailwind stone at hue 58. Two text colours only:
--text and --muted, nothing in between.
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
Greeting ellipsis: 2.4s linear loop, 0.2s between dots, opacity only

## Hard constraints
- Single column, left-aligned, no navigation bar, no hero section
- No accent colour anywhere
- Projects and writing are text rows, never cards
- Hierarchy comes from weight and opacity, not size
- One typeface

## Do not use
No gradients. No box-shadows. No icon libraries. No component
libraries (shadcn, MUI, etc). No border-radius above 16px.
No emoji. No stock illustration.

## Working style
Ask before adding any dependency.
Small commits, one change at a time.
