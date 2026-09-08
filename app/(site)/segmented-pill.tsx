"use client";

import { useLayoutEffect, useRef, useState } from "react";

/* A segmented control, hand-built — the segmented-pill package this was
   meant to use has been unpublished from npm.

   Presentational and fully controlled: it holds no state beyond where the
   pill sits, so whatever drives `value` remains the source of truth.

   The pill is one absolutely positioned element that moves, rather than a
   background on each segment, because only a single element can slide
   between two places. Its geometry has to be measured from the rendered
   labels, so until that happens the active segment paints its own
   background — the server render and the no-JS case both stay correct,
   and the swap is invisible because it is the same shape in the same
   place. */

export type Segment = {
  value: string;
  label: string;
};

/* `sliding` is false for the very first placement and true after, so the
   pill lands silently on load and animates only on a real change. */
type Geometry = { left: number; width: number; sliding: boolean };

export default function SegmentedPill({
  segments,
  value,
  onValueChange,
  label,
}: {
  segments: Segment[];
  value: string;
  onValueChange: (value: string) => void;
  label: string;
}) {
  /* A segmented control always has exactly one selection — zero is not a
     state it can be in. If `value` matches nothing, the first segment
     stands in rather than leaving the control blank. */
  const matched = segments.findIndex((segment) => segment.value === value);
  const activeIndex = matched === -1 ? 0 : matched;

  const listRef = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<Geometry | null>(null);
  const placed = useRef(false);

  /* Layout effect so the first position is set before paint — otherwise
     the pill would visibly slide in from the left on load. */
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const measure = () => {
      const active = list.querySelector<HTMLElement>('[aria-current="page"]');
      if (!active) return;

      setPill({
        left: active.offsetLeft,
        width: active.offsetWidth,
        sliding: placed.current,
      });
      placed.current = true;
    };

    measure();

    /* Labels reflow when the font loads or the column narrows. */
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [value, segments]);

  return (
    <nav
      className="segmented"
      aria-label={label}
      ref={listRef}
      data-measured={pill ? "" : undefined}
    >
      {pill && (
        <span
          className="segmented-pill"
          aria-hidden="true"
          data-sliding={pill.sliding ? "" : undefined}
          style={{
            transform: `translateX(${pill.left}px)`,
            width: `${pill.width}px`,
          }}
        />
      )}

      {segments.map((segment, i) => {
        const active = i === activeIndex;

        return (
          <button
            key={segment.value}
            type="button"
            className="segmented-item"
            aria-current={active ? "page" : undefined}
            onClick={() => onValueChange(segment.value)}
          >
            {segment.label}
          </button>
        );
      })}
    </nav>
  );
}
