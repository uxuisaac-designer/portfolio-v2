# 001 — Swap the contents marker to an ease-in-out movement curve

- **Status**: DONE
- **Commit**: 637b518 (the animation itself is uncommitted working-tree state at
  the time of writing; if `app/work/[slug]/toc-marker.ts` does not exist, STOP)
- **Severity**: HIGH
- **Category**: Easing & duration
- **Estimated scope**: 1 file, ~6 lines

## Problem

The case study sidebar's contents marker travels on `cubic-bezier(0.32, 0.72, 0, 1)`.
That is a strong **ease-out** — the right family for something entering or exiting,
the wrong family for something moving from one on-screen position to another.

At the marker's 400ms duration the curve front-loads almost everything:

```
 50ms  35.8% of the distance
100ms  77.9%
150ms  90.5%
200ms  95.5%
300ms  99.2%
400ms  100.0%
```

90% of the travel is done in 147ms; the last 112ms cover 0.8% of the distance.
The square darts, then appears to stop while the frame loop is still running. The
rotation rides the same `t`, so it also completes visually in the first quarter
and the remaining turn is imperceptible. This is the whole "it doesn't feel
smooth" complaint.

Current code:

```ts
/* app/work/[slug]/toc-marker.ts:18 — current */
const CURVE = { x1: 0.32, y1: 0.72, x2: 0, y2: 1 };
```

The comment above that line justifies the choice by analogy to `--ease-wipe`,
which is a *reveal* — a different motion type. That reasoning does not transfer.

## Target

Use the strong ease-in-out prescribed for on-screen movement:
`cubic-bezier(0.77, 0, 0.175, 1)`.

```ts
/* target — app/work/[slug]/toc-marker.ts */
/* cubic-bezier(0.77, 0, 0.175, 1) — the strong ease-in-out for something
   moving between two on-screen positions. --ease-wipe is an ease-out and
   belongs to reveals: at 400ms it puts 90% of the travel in the first 147ms
   and spends the last 112ms covering under 1%, which reads as a dart and a
   dead stop rather than a glide.

   Canonical polynomial form: X(s) = ((Ax·s + Bx)·s + Cx)·s, and likewise
   for Y. Solve X(s) = elapsed fraction, then read Y(s) off the same s. */
const CURVE = { x1: 0.77, y1: 0, x2: 0.175, y2: 1 };
```

That curve at the same 400ms gives 5.3% / 59.6% / 95.6% at 100 / 200 / 300ms —
motion distributed across the whole duration.

**Do not change `DURATION`.** It is 400ms in
`app/work/[slug]/case-sidebar.tsx:11` by an explicit decision of the repo owner.

## Repo conventions to follow

- Easing tokens live in `app/globals.css` under `/* Motion */` (line ~48). This
  curve is **not** added as a token: it is consumed in JS, not CSS, and no CSS
  rule needs it. The existing `--ease-wipe`, `--ease-out`, `--ease-hover`,
  `--ease-in-out` tokens stay untouched.
- Exemplar for how this repo comments a motion value with its reasoning:
  `app/globals.css:56-59` (`--ease-wipe` / `--duration-wipe`).
- The derived constants `CX/BX/AX/CY/BY/AY` below `CURVE` are computed from it
  and need no edit.

## Steps

1. In `app/work/[slug]/toc-marker.ts`, replace the `CURVE` constant on line 18
   with `const CURVE = { x1: 0.77, y1: 0, x2: 0.175, y2: 1 };`.
2. Replace the comment block directly above it (lines 11–17) with the target
   comment given above, so the file no longer claims kinship with `--ease-wipe`.
3. In `CLAUDE.md`, find the sentence in the "Case studies" section reading
   "The curve is --ease-wipe solved in JS, because the path is a curve and not a
   value; 400ms on requestAnimationFrame" and change "--ease-wipe" to
   "cubic-bezier(0.77, 0, 0.175, 1), a strong ease-in-out because this is
   movement rather than a reveal". Keep the line width at or under 75 characters
   to match the file.

## Boundaries

- Do NOT change `DURATION`, `TURN`, `SIZE`, or `GAP` in `case-sidebar.tsx`.
- Do NOT change `BOW_MIN`, `BOW_MAX`, or `BOW_RATE` in `toc-marker.ts`.
- Do NOT touch `ease()`, `controlFor()`, or `pointOn()` — only the `CURVE` values.
- Do NOT add dependencies.
- Do NOT alter any CSS easing token.
- If the code at the cited lines does not match, STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit` exits 0; `npm run lint` prints no findings.
- **Numeric**: the curve must still be a valid easing. Confirm with:
  ```bash
  node --experimental-strip-types -e '
  import("./app/work/[slug]/toc-marker.ts").then(m => {
    console.log("ease(0)=", m.ease(0), "ease(1)=", m.ease(1));
    let prev = -1, mono = true;
    for (let i = 0; i <= 100; i++) { const v = m.ease(i/100); if (v < prev - 1e-9) mono = false; prev = v; }
    console.log("monotonic:", mono);
    for (const ms of [100,200,300,400]) console.log(ms + "ms", (m.ease(ms/400)*100).toFixed(1) + "%");
  })'
  ```
  Expected: `ease(0)=0`, `ease(1)=1`, `monotonic: true`, and roughly
  `100ms 5.3%`, `200ms 59.6%`, `300ms 95.6%`, `400ms 100.0%`.
- **Feel check**: run `npm run dev`, open
  `http://localhost:3000/work/kick-game-buyer-experience` in a window wider than
  1024px (below 64rem the sidebar is hidden by design), and scroll slowly:
  - The square should now be visibly moving for most of the 400ms, rather than
    arriving almost instantly and then sitting still.
  - It should ease *in* at the start — a gentle departure, not a jump.
  - In DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`, the
    square must jump straight to the new label with no travel and no rotation.
- **Done when**: the numeric check prints the expected percentages and the
  square is perceptibly in motion through the middle of each transition.
