"use client";

import { useRouter, useSelectedLayoutSegment } from "next/navigation";

import SegmentedPill, { type Segment } from "./segmented-pill";

/* Keyed off the layout segment rather than the pathname. The segment comes
   from the router tree and maps totally — null is the index route, not a
   failure to match — so there is no string comparison to come out empty.
   A prerender that produced no match left the control with nothing
   selected on the deployed site. */
const SEGMENTS: (Segment & { segment: string | null })[] = [
  { value: "/", label: "Work", segment: null },
  { value: "/writing", label: "Writing", segment: "writing" },
  { value: "/lab", label: "Lab", segment: "lab" },
];

export default function Nav() {
  const router = useRouter();
  const current = useSelectedLayoutSegment();
  const active = SEGMENTS.find((s) => s.segment === current) ?? SEGMENTS[0];

  return (
    <SegmentedPill
      label="Sections"
      segments={SEGMENTS}
      value={active.value}
      onValueChange={(value) => router.push(value)}
    />
  );
}
