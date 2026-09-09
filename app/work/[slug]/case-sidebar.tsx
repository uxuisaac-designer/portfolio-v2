"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import Icon from "../../icons";
import { controlFor, ease, pointOn, type Point } from "./toc-marker";

export type Heading = { id: string; text: string };

const DURATION = 400;

/* A quarter turn per move, clockwise — the same direction the path bows, so
   the square reads as being carried around the bend rather than spun in
   place. A square lands identical to how it started, so the turn is
   something you see during the travel and never at rest. */
const TURN = 90;

/* Square, so one number does for both. It sits this far past the end of the
   label text. */
const SIZE = 6;
const GAP = 8;

/* The list itself is rendered from headings extracted on the server, so it
   is in the HTML rather than assembled from the DOM after mount. Only the
   active item is client work. */
export default function CaseSidebar({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(null);

  const navRef = useRef<HTMLElement | null>(null);
  const markerRef = useRef<HTMLSpanElement | null>(null);
  const frameRef = useRef<number | null>(null);

  /* Where the marker actually is and how far it has turned, not where it
     was last asked to go. An interrupted move re-targets from here, which
     is what keeps a fast scroll from snapping or queueing, and what makes
     the rotation accumulate instead of restarting at zero. */
  const positionRef = useRef<Point | null>(null);
  const angleRef = useRef(0);

  /* Read by the resize observer, which must not be rebuilt every time the
     active section changes — re-observing fires the callback immediately,
     and that would cancel the move already in flight. */
  const activeRef = useRef<string | null>(null);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  /* A click is an instruction to go to one section. The observer would
     otherwise report every heading the smooth scroll passes on the way, and
     the marker would chase each one — a quarter turn per section crossed.
     While this holds an id, the click owns the active section. */
  const pendingRef = useRef<string | null>(null);
  const settleRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (settleRef.current !== null) window.clearTimeout(settleRef.current);
    },
    [],
  );

  /* Position and rotation go on in one write. Two transform properties, or
     two writes to the same one, and the second would drop the first. */
  const draw = useCallback((point: Point, angle: number) => {
    const marker = markerRef.current;
    if (!marker) return;

    positionRef.current = point;
    angleRef.current = angle;
    marker.style.transform = `translate(${point.x}px, ${point.y}px) rotate(${angle}deg)`;
  }, []);

  /* Measured against the label's own box, not the anchor's — the anchor
     stretches to the column so it stays an easy target, while the text is
     what the marker is pointing at. This is also what gives the path its x
     component: the labels are ragged, so every move is diagonal. */
  const positionFor = useCallback((id: string): Point | null => {
    const nav = navRef.current;
    const label = nav?.querySelector(`[data-toc-id="${id}"] .case-toc-label`);
    if (!nav || !label) return null;

    const navBox = nav.getBoundingClientRect();
    const box = label.getBoundingClientRect();

    return {
      x: box.right - navBox.left + GAP,
      y: box.top - navBox.top + box.height / 2 - SIZE / 2,
    };
  }, []);

  const stop = useCallback(() => {
    if (frameRef.current === null) return;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const nodes = headings
      .map(({ id }) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);

    const end = document.querySelector(".case-end");

    /* The bottom margin pulls the trigger line up near the top of the
       viewport, so a section becomes current as it arrives rather than when
       it happens to be centred. */
    const observer = new IntersectionObserver(
      () => {
        if (pendingRef.current) return;

        /* At the foot of the page the last section is the one being read,
           whatever the trigger line says — it cannot scroll any higher. */
        const atBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 2;

        if (atBottom) {
          setActive(nodes[nodes.length - 1].id);
          return;
        }

        const passed = nodes.filter(
          (node) => node.getBoundingClientRect().top < window.innerHeight * 0.3,
        );
        setActive((passed[passed.length - 1] ?? nodes[0]).id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: [0, 1] },
    );

    nodes.forEach((node) => observer.observe(node));
    if (end) observer.observe(end);
    return () => observer.disconnect();
  }, [headings]);

  /* Carries the marker to the active label. */
  useEffect(() => {
    if (!active) return;

    const to = positionFor(active);
    if (!to) return;

    stop();

    const marker = markerRef.current;
    const from = positionRef.current;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /* Nothing to travel from on the first placement, and nothing worth
       travelling under reduced motion — the marker still marks, it just
       stops moving and never turns. */
    if (!from || reduced) {
      draw(to, reduced ? 0 : angleRef.current);
      if (marker) marker.dataset.placed = "";
      return;
    }

    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    if (distance < 0.5) {
      draw(to, angleRef.current);
      return;
    }

    const control = controlFor(from, to, distance);

    /* Continues from wherever the last turn got to, so an interrupted move
       carries its angle forward rather than starting the quarter again. */
    const fromAngle = angleRef.current;
    const start = performance.now();

    const step = (now: number) => {
      const fraction = Math.min(1, (now - start) / DURATION);
      const t = ease(fraction);

      /* One t drives both, so the turn finishes exactly when the travel
         does. */
      draw(pointOn(from, control, to, t), fromAngle + TURN * t);

      frameRef.current = fraction < 1 ? requestAnimationFrame(step) : null;
    };

    frameRef.current = requestAnimationFrame(step);
    return stop;
  }, [active, draw, positionFor, stop]);

  /* The sidebar's width is derived from the viewport, so the label ends move
     as the window does. Built once and reading the active id from a ref:
     rebuilding it per section would fire the callback on every observe and
     cancel the move that had just started. */
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    let settled = false;

    const observer = new ResizeObserver(() => {
      /* The first delivery is the initial size, not a change. */
      if (!settled) {
        settled = true;
        return;
      }

      const id = activeRef.current;
      if (!id) return;

      const to = positionFor(id);
      if (!to) return;

      /* A resize is the same state at a new size, so it re-places rather
         than animating — and it keeps the angle it had. */
      stop();
      draw(to, angleRef.current);
    });

    observer.observe(nav);
    return () => observer.disconnect();
  }, [draw, positionFor, stop]);

  return (
    <aside className="case-sidebar">
      <Link className="case-index" href="/">
        <Icon name="return" />
        Index
      </Link>

      {headings.length > 0 ? (
        <nav className="case-toc" aria-label="On this page" ref={navRef}>
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className="case-toc-item"
              data-toc-id={heading.id}
              data-active={heading.id === active ? "" : undefined}
              aria-current={heading.id === active ? "true" : undefined}
              onClick={(event) => {
                event.preventDefault();

                pendingRef.current = heading.id;
                setActive(heading.id);

                if (settleRef.current !== null) {
                  window.clearTimeout(settleRef.current);
                }
                /* Long enough for a smooth scroll the length of a case
                   study to finish. The observer takes ownership back once
                   it elapses. */
                settleRef.current = window.setTimeout(() => {
                  pendingRef.current = null;
                  settleRef.current = null;
                }, 700);

                document
                  .getElementById(heading.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
                history.replaceState(null, "", `#${heading.id}`);
              }}
            >
              <span className="case-toc-label">{heading.text}</span>
            </a>
          ))}

          <span className="case-toc-marker" ref={markerRef} aria-hidden="true" />
        </nav>
      ) : null}
    </aside>
  );
}
