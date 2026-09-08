"use client";

/* A segmented control, hand-built — the segmented-pill package this was
   meant to use has been unpublished from npm.

   Presentational and fully controlled: it holds no state of its own, so
   whatever drives `value` is the single source of truth. Not animated;
   the pill moves the instant the value changes. */

export type Segment = {
  value: string;
  label: string;
};

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
  return (
    <nav className="segmented" aria-label={label}>
      {segments.map((segment) => {
        const active = segment.value === value;

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
