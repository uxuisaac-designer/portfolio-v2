/* The contents marker's motion. Kept out of the component because it is
   arithmetic, not React: a curve solver, a path, and a loop.

   The marker travels a quadratic Bézier rather than a straight line, so it
   bows away from the text and out toward the content column on its way to
   the next section. A straight slide down a vertical list reads as a
   scrollbar; the bow reads as travel. */

export type Point = { x: number; y: number };

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
