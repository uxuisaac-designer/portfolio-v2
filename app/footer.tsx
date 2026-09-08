"use client";

import { useEffect, useState } from "react";

import { londonTime, type LondonTime } from "./london-time";

/* Plain characters, no images. The z's are markup rather than part of the
   string so they can sit above the face. */
const FACES: Record<LondonTime["mood"], string> = {
  asleep: "(-_-)",
  awake: "(o_o)",
  resting: "(^_^)",
};

const MINUTE = 60_000;

export default function Footer({ initial }: { initial: LondonTime }) {
  const [time, setTime] = useState(initial);

  useEffect(() => {
    const tick = () => setTime(londonTime(new Date()));

    /* The page revalidates every 60s, so `initial` is at most a minute
       stale. Correct it as soon as we are on the client. */
    tick();

    /* Line the interval up with the wall clock, otherwise the display can
       sit up to 59s behind the minute it is meant to be showing. */
    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, MINUTE);
    }, MINUTE - (Date.now() % MINUTE));

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <footer className="footer">
      {time.clock} in London, England{" "}
      <span className="footer-face" aria-hidden="true">
        {FACES[time.mood]}
        {time.mood === "asleep" && <span className="footer-zzz">zzz</span>}
      </span>
    </footer>
  );
}
