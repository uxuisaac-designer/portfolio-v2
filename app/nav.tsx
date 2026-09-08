"use client";

import { usePathname, useRouter } from "next/navigation";

import SegmentedPill, { type Segment } from "./segmented-pill";

/* Writing and Lab are built and routable; they stay out of the nav until
   each has something worth visiting. */
const SEGMENTS: Segment[] = [
  { value: "/", label: "Work" },
  // { value: "/writing", label: "Writing" },
  // { value: "/lab", label: "Lab" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  /* The router is the state. Nothing here remembers which segment is
     active — the current path decides, so a back button or a direct load
     lands on the right segment with nothing to keep in sync. */
  return (
    <SegmentedPill
      label="Sections"
      segments={SEGMENTS}
      value={pathname}
      onValueChange={(value) => router.push(value)}
    />
  );
}
