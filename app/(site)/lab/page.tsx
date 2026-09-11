import { Suspense } from "react";

import { getAllEntries, getCategories } from "../../lab";
import { pageMetadata } from "../../site";
import CategoryFilter, { type FilterOption } from "./category-filter";
import LabBrowser from "./lab-browser";
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

  const options: FilterOption[] = [
    { category: null, label: "All", count: entries.length },
    ...(await getCategories()).map(({ category, count }) => ({
      category,
      label: category,
      count,
    })),
  ];

  const items = entries.map((entry) => ({
    id: entry.id,
    category: entry.category,
    card: <LabCard entry={entry} />,
  }));

  return (
    /* No page heading, as on Notes: the nav directly above already says
       Lab. The intro is two sentences with no eyebrow over them.

       The fallback is what the build prerenders: the first 24 cards,
       unfiltered.
       A production build fails outright if useSearchParams is read outside
       a Suspense boundary on a static page. */
    <>
      <p className="lab-intro">
        Small interface experiments, each built to answer one question. Every
        entry says what I tried and what I found.
      </p>
      <Suspense
        fallback={
          <>
            <CategoryFilter options={options} active={null} />
            <LabGrid items={items} active={null} />
          </>
        }
      >
        <LabBrowser options={options} items={items} />
      </Suspense>
    </>
  );
}
