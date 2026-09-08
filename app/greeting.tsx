"use client";

import { useEffect, useState } from "react";

const TEXT = "hello...";

const TYPE = 80;
const DELETE = 40;
const HOLD_FULL = 1500;
const HOLD_EMPTY = 800;

export default function Greeting() {
  /* Starts complete, because the server rendered the whole string. Any
     other starting point would blink on hydration. The loop therefore
     enters at the pause before deleting rather than at the first
     keystroke — the same cycle, joined a beat later. */
  const [count, setCount] = useState(TEXT.length);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout> | undefined;
    let shown = TEXT.length;
    let deleting = true;

    const tick = () => {
      shown += deleting ? -1 : 1;
      setCount(shown);

      let next: number;
      if (deleting && shown === 0) {
        deleting = false;
        next = HOLD_EMPTY;
      } else if (!deleting && shown === TEXT.length) {
        deleting = true;
        next = HOLD_FULL;
      } else {
        next = deleting ? DELETE : TYPE;
      }

      timer = setTimeout(tick, next);
    };

    const start = () => {
      timer = setTimeout(tick, HOLD_FULL);
    };

    const stop = () => {
      if (timer) clearTimeout(timer);
      timer = undefined;
      shown = TEXT.length;
      deleting = true;
      setCount(TEXT.length);
    };

    /* No setState on this path — count already holds the full string, so
       honouring the preference means simply never starting. */
    if (!query.matches) start();

    const onChange = () => (query.matches ? stop() : start());
    query.addEventListener("change", onChange);

    return () => {
      if (timer) clearTimeout(timer);
      query.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <p className="greeting">
      <span className="greeting-typing">
        {/* Holds the full width so nothing reflows as characters come and
            go, and carries the text for screen readers — the visible span
            changes constantly and would only be noise to announce. */}
        <span className="greeting-reserve">{TEXT}</span>
        <span className="greeting-typed" aria-hidden="true">
          {TEXT.slice(0, count)}
        </span>
      </span>
    </p>
  );
}
