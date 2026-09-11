import Image from "next/image";

import type { LabEntry } from "./lab";
import LabMedia from "./lab-media";

/* The stage every Lab entry is shown on: a 3:2 frame on the --figure mat,
   the same grey a case-study figure sits on, with the artefact centred in
   the middle 60%. One mat for every entry and no per-entry colour — the
   artefact is the only thing in the frame that is not the stage.

   Shared by the card and the entry's page, which differ only in how large
   the artefact is drawn and what starts the loop. */
export default function LabFrame({
  entry,
  sizes,
  trigger,
  preload = false,
  className,
}: {
  entry: LabEntry;
  sizes: string;
  trigger: "hover" | "view";
  preload?: boolean;
  className?: string;
}) {
  return (
    <div className={className ? `lab-frame ${className}` : "lab-frame"}>
      <div className="lab-artefact">
        {/* alt is empty: the title sits directly beside it on the card and
            directly below it on the page, and says the same thing. */}
        <Image src={entry.poster} alt="" fill sizes={sizes} preload={preload} />
        {entry.media ? <LabMedia src={entry.media} trigger={trigger} /> : null}
      </div>
    </div>
  );
}
