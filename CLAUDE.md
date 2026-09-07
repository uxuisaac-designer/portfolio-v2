@AGENTS.md

# Portfolio — Isaac

Personal portfolio. Single-page index plus MDX case studies.

## Reference sites
emilkowal.ski, jakub.kr, benji.org, shedsgns.me, mikes.cv
Taking from these: single-column text layout, monochrome palette,
list-based project rows, micro-motion, no navigation.

## Tokens
Max width: 40rem
Background: #FCFCFC
Text: rgba(0,0,0,0.92)
Muted: rgba(0,0,0,0.56)
Border: rgba(0,0,0,0.08)
Surface hover: rgba(0,0,0,0.04)
Body: 16px / 1.6 / -0.011em
Easing: cubic-bezier(0.32, 0.72, 0, 1)
Hover 150ms · entrance 400ms, 8px Y, 40ms stagger

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
