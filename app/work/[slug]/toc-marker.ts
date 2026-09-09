/* The contents marker's motion. Kept out of the component because it is
   arithmetic, not React: a curve solver, a path, and a loop.

   The marker travels a quadratic Bézier rather than a straight line, so it
   bows away from the text and out toward the content column on its way to
   the next section. A straight slide down a vertical list reads as a
   scrollbar; the bow reads as travel. */

export type Point = { x: number; y: number };

/* cubic-bezier(0.77, 0, 0.175, 1) — the strong ease-in-out for something
   moving between two on-screen positions. --ease-wipe is an ease-out and
   belongs to reveals: at 400ms it put 90% of the travel in the first 147ms
   and spent the last 112ms covering under 1% of the distance, which read as
   a dart and a dead stop rather than a glide.

   CSS cannot apply it here because the path is a curve rather than a value,
   so it is solved by hand. Canonical polynomial form:
   X(s) = ((Ax·s + Bx)·s + Cx)·s, and likewise for Y. Solve X(s) = elapsed
   fraction, then read Y(s) off the same s. */
const CURVE = { x1: 0.77, y1: 0, x2: 0.175, y2: 1 };

const CX = 3 * CURVE.x1;
const BX = 3 * (CURVE.x2 - CURVE.x1) - CX;
const AX = 1 - CX - BX;

const CY = 3 * CURVE.y1;
const BY = 3 * (CURVE.y2 - CURVE.y1) - CY;
const AY = 1 - CY - BY;

const axis = (s: number, a: number, b: number, c: number) =>
  ((a * s + b) * s + c) * s;

export function ease(fraction: number): number {
  if (fraction <= 0) return 0;
  if (fraction >= 1) return 1;

  /* Newton-Raphson converges in a handful of steps on a curve this shape.
     The slope guard catches the flat tail, where dividing by it would throw
     the estimate off the interval. */
  let s = fraction;
  for (let i = 0; i < 6; i += 1) {
    const error = axis(s, AX, BX, CX) - fraction;
    if (Math.abs(error) < 1e-5) break;

    const slope = (3 * AX * s + 2 * BX) * s + CX;
    if (Math.abs(slope) < 1e-6) break;

    s -= error / slope;
  }

  return axis(s, AY, BY, CY);
}

/* 12px at a one-step move, growing with the distance so a jump across the
   whole list bows wider than a hop to the neighbour, and capped so it never
   swings out into the content column. */
const BOW_MIN = 12;
const BOW_MAX = 32;
const BOW_RATE = 0.4;

/* The control point sits beside the midpoint of the straight line, pushed
   to the right — the direction of the content, never back into the text. */
export function controlFor(from: Point, to: Point, distance: number): Point {
  const bow = Math.min(BOW_MAX, Math.max(BOW_MIN, distance * BOW_RATE));

  return {
    x: (from.x + to.x) / 2 + bow,
    y: (from.y + to.y) / 2,
  };
}

export function pointOn(from: Point, control: Point, to: Point, t: number): Point {
  const u = 1 - t;
  const a = u * u;
  const b = 2 * u * t;
  const c = t * t;

  return {
    x: a * from.x + b * control.x + c * to.x,
    y: a * from.y + b * control.y + c * to.y,
  };
}
