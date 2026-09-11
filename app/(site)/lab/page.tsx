import { getAllEntries } from "../../lab";
import { pageMetadata } from "../../site";
import LabCard from "./lab-card";
import LabGrid from "./lab-grid";

export const metadata = pageMetadata({
  title: "Lab",
  description: "Experiments and fun ideas by Isaac Taiwo.",
  path: "/lab",
});

export default async function Lab() {
  const entries = await getAllEntries();

  if (entries.length === 0) {
    return (
      <p className="section-empty">
        Nothing here yet. Experiments and half-finished ideas will land here.
      </p>
    );
  }

  const items = entries.map((entry) => ({
    id: entry.id,
    category: entry.category,
    card: <LabCard entry={entry} />,
  }));

  return (
    /* No page heading, as on Notes: the nav directly above already says
       Lab. The intro is two sentences with no eyebrow over them. */
    <>
      <p className="lab-intro">
        Small interface experiments, each built to answer one question. Every
        entry says what I tried and what I found.
      </p>
      <LabGrid items={items} active={null} />
    </>
  );
}
