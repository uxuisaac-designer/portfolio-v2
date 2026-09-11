import Link from "next/link";

import type { LabEntry } from "../../lab";
import LabFrame from "../../lab-frame";

/* A specimen case, not a marketing tile: the caption sits below the frame
   on the page background rather than over the image.

   The whole card is one link and nothing in it moves. The title carries
   the house underline, so the wipe fires from anywhere on the card through
   .page a:hover — which gives an entry with no loop the same hover
   feedback as one with. */
export default function LabCard({ entry }: { entry: LabEntry }) {
  return (
    <Link className="lab-card" href={entry.href}>
      {/* The artefact is 60% of a card: at most 170px across in two
          columns, 60vw once the grid is one column. */}
      <LabFrame
        entry={entry}
        trigger="hover"
        sizes="(max-width: 30rem) 60vw, 170px"
      />
      <span className="lab-card-caption">
        <span className="lab-meta">
          <span className="lab-id">{entry.id}</span>
          <span>{entry.category}</span>
        </span>
        <span className="lab-card-title">
          <span className="link-underline">{entry.title}</span>
        </span>
        <span className="lab-card-question">{entry.question}</span>
      </span>
    </Link>
  );
}
