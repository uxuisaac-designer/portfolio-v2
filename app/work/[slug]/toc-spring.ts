/* A critically damped spring on a scalar. It holds velocity between frames, so
   re-targeting mid-flight bends the motion rather than restarting it from a
   standing start — the one thing a fixed-duration tween cannot do.

   Damping ratio is exactly 1: overshoot is ruled out, so progress approaches 1
   and never passes it. */

/* Mass 1, settling in about half a second: stiffness = (2π / 0.5)², and
   damping = 2√stiffness, which is what makes the ratio exactly 1. */
export const STIFFNESS = 157.9;
export const DAMPING = 25.13;

/* A critically damped spring only refuses to overshoot when it starts slower
   than its natural frequency. Above √stiffness the carried velocity throws it
   past the target and it eases back — visible, and not wanted here. Entry
   velocity is clamped just under it, which is the guarantee rather than a
   hope. */
export const MAX_ENTRY_VELOCITY = Math.sqrt(STIFFNESS) * 0.95;

/* Fixed substep. Integrating a spring with a raw frame delta goes unstable on
   a long frame; 240Hz substeps keep it well inside the stable region, and the
   clamp stops a backgrounded tab from integrating a whole second at once. */
const SUBSTEP = 1 / 240;
const MAX_FRAME = 0.064;

export type Spring = { value: number; velocity: number };

export function advance(
  spring: Spring,
  target: number,
  seconds: number,
): Spring {
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

/* Progress restarts at 0 on every new path, but the speed carries over. The
   old velocity was progress-per-second along the old path, so it is rescaled
   by the ratio of the two path lengths — otherwise the square would appear to
   change pace at the moment it changes direction, which is the discontinuity
   this whole mechanism exists to remove. */
export function retarget(
  spring: Spring,
  previousSpan: number,
  nextSpan: number,
): Spring {
  if (previousSpan <= 0 || nextSpan <= 0) return { value: 0, velocity: 0 };

  const scaled = spring.velocity * (previousSpan / nextSpan);

  return {
    value: 0,
    velocity: Math.max(0, Math.min(scaled, MAX_ENTRY_VELOCITY)),
  };
}

/* Inside a thousandth of the path and slower than a hundredth of it a second —
   under a pixel either way at these distances. */
export function atRest(spring: Spring, target: number): boolean {
  return (
    Math.abs(spring.value - target) < 0.001 && Math.abs(spring.velocity) < 0.01
  );
}
