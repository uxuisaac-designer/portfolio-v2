# 002 — Stop the contents marker chasing every section on a click

- **Status**: DONE
- **Commit**: 637b518 (the animation itself is uncommitted working-tree state at
  the time of writing; if `app/work/[slug]/case-sidebar.tsx` has no
  `case-toc-marker` span, STOP)
- **Severity**: MEDIUM
- **Category**: Purpose & frequency / Interruptibility
- **Estimated scope**: 1 file, ~20 lines

## Problem

Clicking an item in the contents list smooth-scrolls the page:

```tsx
/* app/work/[slug]/case-sidebar.tsx:200-208 — current */
onClick={(event) => {
  event.preventDefault();
  document
    .getElementById(heading.id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${heading.id}`);
}}
```

The active section is driven independently by an `IntersectionObserver` whose
callback sets state as each heading crosses a trigger line at 30% of the viewport
height (`app/work/[slug]/case-sidebar.tsx:95-113`). A smooth scroll passes every
intervening heading through that line, so a single click fires `setActive` once
per section in between.

Each of those re-runs the movement effect (`case-sidebar.tsx:123-172`), which
interrupts the in-flight animation and starts a new one — **and adds another 90°**,
because rotation accumulates from `angleRef` by design:

```tsx
/* app/work/[slug]/case-sidebar.tsx:156,165 — current */
const fromAngle = angleRef.current;
draw(pointOn(from, control, to, t), fromAngle + TURN * t);
```

Clicking "What I'd do differently" from "Overview" on the Kick Game case study
crosses four intermediate headings, so the square scrambles through five targets
and spins roughly 450° before settling. The click is a direct instruction to go to
one place; the marker should go there.

## Target

While a click-driven scroll is in flight, the clicked id is authoritative and
observer updates are ignored. The marker performs exactly one move, one quarter
turn, to the clicked label.

Add a ref holding the pending click target, set it on click, honour it in the
observer callback, and clear it once the scroll settles.

```tsx
/* target — new ref beside the others, near app/work/[slug]/case-sidebar.tsx:33 */
/* A click is an instruction to go to one section. The observer would otherwise
   report every heading the smooth scroll passes on the way, and the marker
   would chase each one — a quarter turn per section crossed. */
const pendingRef = useRef<string | null>(null);
const settleRef = useRef<number | null>(null);
```

```tsx
/* target — inside the IntersectionObserver callback, as its first statement,
   replacing nothing else (app/work/[slug]/case-sidebar.tsx:96) */
if (pendingRef.current) return;
```

```tsx
/* target — the onClick handler */
onClick={(event) => {
  event.preventDefault();

  pendingRef.current = heading.id;
  setActive(heading.id);

  if (settleRef.current !== null) window.clearTimeout(settleRef.current);
  /* Long enough for a smooth scroll the length of a case study to finish.
     The observer resumes ownership once it elapses. */
  settleRef.current = window.setTimeout(() => {
    pendingRef.current = null;
    settleRef.current = null;
  }, 700);

  document
    .getElementById(heading.id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${heading.id}`);
}}
```

## Repo conventions to follow

- Refs in this component are declared together near the top with a comment
  explaining what each holds — see `app/work/[slug]/case-sidebar.tsx:30-44`
  (`positionRef`, `angleRef`, `activeRef`) for the exemplar. Follow that shape.
- The file already uses a ref-read-inside-a-stable-callback pattern to avoid
  rebuilding observers; `activeRef` at `case-sidebar.tsx:40-45` is the exemplar.
- Timers must be cleared on unmount, as every other subscription here is.

## Steps

1. In `app/work/[slug]/case-sidebar.tsx`, declare `pendingRef` and `settleRef`
   alongside the existing refs, with the comment given above.
2. As the first statement inside the `IntersectionObserver` callback (currently
   line 96, immediately after `() => {`), add `if (pendingRef.current) return;`.
3. Replace the `onClick` handler with the target version above.
4. Add a cleanup effect that clears any pending timeout on unmount:
   ```tsx
   useEffect(
     () => () => {
       if (settleRef.current !== null) window.clearTimeout(settleRef.current);
     },
     [],
   );
   ```

## Boundaries

- Do NOT change the `IntersectionObserver` options (`rootMargin`, `threshold`) or
  the trigger-line arithmetic — only add the early return.
- Do NOT change the movement effect, the easing, `DURATION`, or `TURN`.
- Do NOT remove `history.replaceState` or `event.preventDefault()`.
- Do NOT introduce a scroll-end listener library or dependency; `scrollend` has
  incomplete browser support, hence the timeout.
- If the cited code does not match, STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit` exits 0; `npm run lint` prints no findings.
- **Feel check**: run `npm run dev`, open
  `http://localhost:3000/work/kick-game-buyer-experience` wider than 1024px:
  - Click "What I'd do differently" while at the top. The square must travel to
    it in **one** move with **one** quarter turn — not hop through Two kinds of
    buyer, What the business wanted, Finding things and Deciding and buying.
  - After that click, scroll manually. The observer must have resumed control:
    the square tracks sections normally again.
  - Click an item, then immediately scroll by hand before the scroll finishes.
    The page should not fight you — worst case the marker re-syncs after ~700ms.
  - Confirm scroll-driven behaviour is otherwise unchanged: the last section
    still becomes active at the foot of the page.
- **Done when**: a click from the first contents item to the last produces a
  single move and a single 90° turn.
