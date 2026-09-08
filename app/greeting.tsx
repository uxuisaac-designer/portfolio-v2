"use client";

import { useEffect, useState } from "react";

/* Native script only — the romanisations are how the languages were named
   to me, not something to put on screen.

   Array.from rather than .length so the count walks characters, not UTF-16
   code units. */
const GREETINGS = [
  { text: "Hello...", lang: "en" },
  { text: "Bonjour...", lang: "fr" },
  { text: "Hola...", lang: "es" },
  { text: "Hallo...", lang: "de" },
  { text: "你好...", lang: "zh" },
  { text: "こんにちは...", lang: "ja" },
  /* No ellipsis here: in a right-to-left run the dots would sit at the
     left, reading as though they came before the word rather than after
     it. */
  { text: "مرحبا", lang: "ar", dir: "rtl" as const },
  { text: "Olá...", lang: "pt" },
].map((greeting) => ({ ...greeting, chars: Array.from(greeting.text) }));

const TYPE = 80;
const DELETE = 40;
const HOLD_FULL = 12000;
const HOLD_EMPTY = 800;

export default function Greeting() {
  /* Starts on English, complete, because that is what the server rendered.
     The loop therefore enters at the pause before deleting. */
  const [{ index, count }, setState] = useState({
    index: 0,
    count: GREETINGS[0].chars.length,
  });

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setTimeout> | undefined;
    let at = 0;
    let shown = GREETINGS[0].chars.length;
    let deleting = true;

    const tick = () => {
      if (deleting) {
        shown -= 1;
        if (shown === 0) {
          /* Empty is where the handover happens, so the next language
             types in rather than the current one changing under itself. */
          deleting = false;
          at = (at + 1) % GREETINGS.length;
          setState({ index: at, count: 0 });
          timer = setTimeout(tick, HOLD_EMPTY);
          return;
        }
        setState({ index: at, count: shown });
        timer = setTimeout(tick, DELETE);
        return;
      }

      shown += 1;
      setState({ index: at, count: shown });

      if (shown === GREETINGS[at].chars.length) {
        deleting = true;
        timer = setTimeout(tick, HOLD_FULL);
        return;
      }
      timer = setTimeout(tick, TYPE);
    };

    const start = () => {
      timer = setTimeout(tick, HOLD_FULL);
    };

    const stop = () => {
      if (timer) clearTimeout(timer);
      timer = undefined;
      at = 0;
      shown = GREETINGS[0].chars.length;
      deleting = true;
      setState({ index: 0, count: GREETINGS[0].chars.length });
    };

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
      {/* Every language is rendered, so the box reserves the width of the
          longest and nothing reflows as they rotate. Only the current one
          is visible — and only it reaches the accessibility tree, since
          visibility:hidden takes the rest out of it. */}
      <span className="greeting-typing">
        {GREETINGS.map((greeting, i) => {
          const current = i === index;
          const typed = current ? greeting.chars.slice(0, count) : [];

          return (
            <span
              key={greeting.lang}
              className="greeting-lang"
              lang={greeting.lang}
              dir={greeting.dir}
              data-current={current ? "" : undefined}
            >
              <span className="greeting-reserve">{greeting.text}</span>
              <span className="greeting-typed" aria-hidden="true">
                {typed.join("")}
                <span
                  className="greeting-cursor"
                  data-resting={
                    count === 0 || count === greeting.chars.length
                      ? ""
                      : undefined
                  }
                />
              </span>
            </span>
          );
        })}
      </span>
    </p>
  );
}
