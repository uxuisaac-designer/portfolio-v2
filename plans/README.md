# Animation plans

Produced by `improve-animations` against the case study sidebar's contents
marker. Each plan is self-contained: exact files, exact values, exact checks.

Written at commit `637b518`. **The animation these plans describe was
uncommitted working-tree state at the time of writing** — if
`app/work/[slug]/toc-marker.ts` is missing, the code has moved on and the plans
need `improve-animations reconcile` before use.

| # | Title | Severity | Category | Status |
| --- | --- | --- | --- | --- |
| [001](001-toc-marker-movement-easing.md) | Swap the contents marker to an ease-in-out movement curve | HIGH | Easing & duration | DONE |
| [002](002-toc-marker-click-chase.md) | Stop the contents marker chasing every section on a click | MEDIUM | Purpose / Interruptibility | DONE |
| [003](003-toc-marker-spring-progress.md) | Carry velocity through interruptions with a spring-driven progress | MEDIUM | Interruptibility | DONE |

## Recommended order

**001 → 002 → (feel-check) → 003**

1. **001 first.** It is a two-line change and it settles the main question:
   whether the animation feels wrong because of the curve's shape or because of
   how interruptions behave. At 400ms the current ease-out puts 90% of the travel
   in the first 147ms and spends the last 112ms covering under 1% of the
   distance, so this alone may be the whole fix.
2. **002 next.** Independent of the other two — it touches the observer and the
   click handler, not the motion loop. Safe to land in any order, but it fixes a
   visible glitch, so sooner is better.
3. **003 last, and only if you still want it.** Live with 001 and 002 for a
   while first.

## Dependencies

- **001 and 002 are independent.** No shared lines; either can land alone.
- **003 supersedes 001.** It removes the caller of `ease()` and deletes the curve
  that 001 tunes. Doing 001 first is not wasted work — it is the cheap experiment
  that tells you whether 003 is worth doing — but be aware that landing 003
  discards 001's change rather than building on it.
- **003 assumes 002 has landed or is not wanted.** They do not conflict, but a
  spring makes the click-chase more noticeable, not less: continuous motion
  through five re-targets reads as one long unexplained swerve.

## Deliberately not planned

- **The 400ms duration.** It exceeds the 300ms budget for UI motion, and it is
  why finding 001 bites. It was set to 400ms by an explicit decision after the
  shorter value was argued for and declined, so it is treated as settled.
- **Squash-and-stretch on the square.** `app/globals.css:306` rejects scale on
  the segmented pill because "a stretch would distort the label"; the same
  reasoning applies to a 6px square, and the site's personality is restrained
  monochrome rather than playful.
- **Two LOW findings** were raised in the audit and not selected for plans: no
  `will-change: transform` on `.case-toc-marker` (`app/globals.css:759`), and
  `150ms` hand-typed four times in `app/globals.css` (lines 673, 729, 770, 781)
  where seven duration tokens already exist.
