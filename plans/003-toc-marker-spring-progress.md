# 003 — Carry velocity through interruptions with a spring-driven progress

- **Status**: TODO
- **Commit**: 637b518 (the animation itself is uncommitted working-tree state at
  the time of writing)
- **Severity**: MEDIUM
- **Category**: Interruptibility
- **Estimated scope**: 2 files, ~70 lines
- **Supersedes**: plan 001. This replaces the fixed-duration tween entirely, so
  the easing curve 001 tunes stops being used. **Do 001 first, live with it, and
  only start this one if the interruption behaviour still bothers you.** See
  "Relationship to plan 001" below before touching anything.

## Problem

Every move is a fixed 400ms tween from a standing start:

```tsx
/* app/work/[slug]/case-sidebar.tsx:157-170 — current */
const start = performance.now();

const step = (now: number) => {
  const fraction = Math.min(1, (now - start) / DURATION);
  const t = ease(fraction);
  draw(pointOn(from, control, to, t), fromAngle + TURN * t);
  frameRef.current = fraction < 1 ? requestAnimationFrame(step) : null;
};

frameRef.current = requestAnimationFrame(step);
```

When the active section changes mid-flight the effect re-runs, `stop()` cancels
the frame, and a brand new 400ms tween begins — from the correct position, but at
**zero velocity**. The square is moving quickly, then instantly is not, then
accelerates again. During a continuous scroll through several sections that is a
sequence of stop-starts rather than one continuous path.

A spring stores velocity as state, so a change of target bends the motion instead
of restarting it. That is the one thing a duration-based tween structurally
cannot do.

## Relationship to plan 001

Plan 001 changes `CURVE` in `app/work/[slug]/toc-marker.ts`. This plan removes
the caller of `ease()` altogether, so after this lands that curve is dead code
and this plan deletes it. The two are not additive:

- Doing **001 only** — a better-shaped tween; still restarts at zero velocity.
- Doing **001 then 003** — 001's benefit is discarded when 003 lands. Harmless,
  and the recommended order, because 001 is a two-line change that tells you
  whether the feel problem is the curve or the interruptions.
- Doing **003 only** — valid; skip 001 entirely.

## Target

Spring a scalar progress value from 0 to 1 and feed it to the existing path and
rotation functions. This keeps the Bézier bow and the quarter turn exactly as
they are — only the thing driving `t` changes.

**Critically damped, no overshoot.** The repo owner specified no overshoot, so
`bounce` is 0 and `t` never exceeds 1. The benefit here is velocity continuity,
not bounce.

Spring constants, mass 1, target settle ≈0.5s, damping ratio 1.0:

- `stiffness = (2π / 0.5)² = 157.9`
- `damping = 4π × 1.0 / 0.5 = 25.13` (equals `2√stiffness`, i.e. critical)

New module, `app/work/[slug]/toc-spring.ts`:

```ts
/* A critically damped spring on a scalar. It holds velocity between frames, so
   re-targeting mid-flight bends the motion rather than restarting it from a
   standing start — the one thing a fixed-duration tween cannot do.

   Damping ratio is exactly 1: the repo owner ruled out overshoot, so progress
   approaches 1 and never passes it. */
export const STIFFNESS = 157.9;
export const DAMPING = 25.13;

/* Fixed substep. Integrating a spring with a raw frame delta goes unstable on a
   long frame; 240Hz substeps keep it well inside the stable region. */
const SUBSTEP = 1 / 240;
const MAX_FRAME = 0.064;

export type Spring = { value: number; velocity: number };

export function advance(spring: Spring, target: number, seconds: number): Spring {
  let { value, velocity } = spring;
  let remaining = Math.min(seconds, MAX_FRAME);

  while (remaining > 0) {
    const h = Math.min(SUBSTEP, remaining);
    const force = -STIFFNESS * (value - target) - DAMPING * velocity;
    velocity += force * h;
    value += velocity * h;
    remaining -= h;
  }

  return { value, velocity };
}

/* Below this the square is inside a tenth of a pixel of its label and slower
   than a pixel a second — done, in every sense a viewer can see. */
export function atRest(spring: Spring, target: number): boolean {
  return Math.abs(spring.value - target) < 0.001 && Math.abs(spring.velocity) < 0.01;
}
```

Movement effect, replacing `case-sidebar.tsx:157-171`:

```tsx
/* Progress springs from 0 to 1. On an interrupt the path is re-anchored to
   where the square currently is and progress restarts at 0, but the spring
   keeps its velocity, so the square carries its speed around the new bend. */
const fromAngle = angleRef.current;
springRef.current = { value: 0, velocity: springRef.current.velocity };

let last = performance.now();

const step = (now: number) => {
  const seconds = (now - last) / 1000;
  last = now;

  springRef.current = advance(springRef.current, 1, seconds);
  const t = springRef.current.value;

  draw(pointOn(from, control, to, t), fromAngle + TURN * t);

  if (atRest(springRef.current, 1)) {
    draw(to, fromAngle + TURN);
    frameRef.current = null;
    return;
  }

  frameRef.current = requestAnimationFrame(step);
};

frameRef.current = requestAnimationFrame(step);
return stop;
```

Plus, beside the other refs:

```tsx
/* Progress and its velocity, carried across interruptions. */
const springRef = useRef<Spring>({ value: 1, velocity: 0 });
```

## Repo conventions to follow

- Pure motion arithmetic lives in its own module beside the component, not in
  it — `app/work/[slug]/toc-marker.ts` is the exemplar. Follow its shape: named
  exports, constants at the top with a comment saying *why* the value is what it
  is, no React imports.
- Constants get a comment explaining the reasoning, not just the number. See
  `app/work/[slug]/toc-marker.ts:53-56` (`BOW_MIN` / `BOW_MAX` / `BOW_RATE`).
- Refs are declared together near the top of the component with a comment each —
  `app/work/[slug]/case-sidebar.tsx:30-44`.

## Steps

1. Create `app/work/[slug]/toc-spring.ts` with the module given above.
2. In `app/work/[slug]/case-sidebar.tsx`, import `advance`, `atRest` and the
   `Spring` type from `./toc-spring`.
3. Declare `springRef` alongside the existing refs, initialised to
   `{ value: 1, velocity: 0 }` (at rest, nothing pending).
4. Replace lines 157–171 of the movement effect with the target code above.
5. Remove `ease` from the `./toc-marker` import on line 7; keep `controlFor`,
   `pointOn` and `Point`.
6. In `app/work/[slug]/toc-marker.ts`, delete the now-unused `CURVE`, `CX`, `BX`,
   `AX`, `CY`, `BY`, `AY`, `axis` and `ease` — everything from the curve comment
   block down to the end of `ease()`. Keep `Point`, `BOW_*`, `controlFor` and
   `pointOn`.
7. Delete the `DURATION` constant at `case-sidebar.tsx:11`; nothing references it
   after step 4.
8. In `CLAUDE.md`, replace the sentence describing the curve and 400ms with:
   "Progress is driven by a critically damped spring (stiffness 157.9, damping
   25.13, settling in about half a second) rather than a fixed duration, so an
   interruption bends the motion instead of restarting it; no overshoot, by
   choice." Keep lines at or under 75 characters.

## Boundaries

- Do NOT change `controlFor`, `pointOn`, `BOW_MIN`, `BOW_MAX`, `BOW_RATE`,
  `TURN`, `SIZE` or `GAP`. The path shape and the quarter turn are unchanged.
- Do NOT give the spring any bounce. Damping ratio stays at 1.0.
- Do NOT add a dependency. This repo requires asking before adding one, and the
  integrator above is why none is needed.
- Do NOT change the reduced-motion branch (`case-sidebar.tsx:140-144`) — it must
  keep drawing instantly with no rotation. It never enters the loop.
- Do NOT change the `IntersectionObserver` or the resize observer.
- If the cited code does not match, STOP and report.

## Verification

- **Mechanical**: `npx tsc --noEmit` exits 0; `npm run lint` prints no findings.
  Confirm no dangling references: `grep -rn "ease\|DURATION" "app/work/[slug]/"`
  should return nothing from `toc-marker.ts` or the movement effect.
- **Numeric**: the spring must reach the target without passing it.
  ```bash
  node --experimental-strip-types -e '
  import("./app/work/[slug]/toc-spring.ts").then(m => {
    let s = { value: 0, velocity: 0 }, over = 0, frames = 0;
    for (let i = 0; i < 120; i++) {
      s = m.advance(s, 1, 1/60); frames++;
      if (s.value > 1.0000001) over++;
      if (m.atRest(s, 1)) break;
    }
    console.log("frames to rest:", frames, "(~" + (frames/60*1000).toFixed(0) + "ms)");
    console.log("overshoot frames:", over, "final:", s.value.toFixed(6));
  })'
  ```
  Expected: rest in roughly 40–60 frames (≈650–1000ms to the rest threshold,
  with the bulk of visible travel inside ~500ms), **overshoot frames: 0**, final
  value ≈1.000000.
- **Feel check**: run `npm run dev`, open
  `http://localhost:3000/work/kick-game-buyer-experience` wider than 1024px:
  - Scroll quickly through three or four sections. The square should describe one
    continuous path that bends between targets — no visible stop between hops.
  - The square must never pass a label and come back. Any overshoot is a failure.
  - In DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`, the
    square must still jump instantly with no travel and no rotation.
  - Throttle CPU to 4× in DevTools Performance and scroll: confirm the spring
    still settles rather than crawling or going unstable (this is what the fixed
    substep and `MAX_FRAME` clamp protect).
- **Done when**: the numeric check reports zero overshoot frames, and a fast
  multi-section scroll shows continuous motion with no standing starts.
