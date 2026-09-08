"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/* The only part of the page that changes between routes.

   Two elements on purpose. The outer one is a stable child of .page, so it
   keeps the page entrance animation and its stagger position and never
   replays them on navigation. The inner one is keyed on the route, so it
   remounts and replays the cross-fade.

   Everything above this lives in the layout and does not re-render at all,
   which is what keeps the avatar, copy and nav from shifting. */
export default function Section({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="section">
      <div className="section-content" key={pathname}>
        {children}
      </div>
    </div>
  );
}
