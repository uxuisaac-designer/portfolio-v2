import Link from "next/link";

import { labHref, type Category } from "../../lab-category";

export type FilterOption = {
  category: Category | null;
  label: string;
  count: number;
};

/* Plain text, not a second segmented control: a pill under the Sections
   pill would read as a nav nested in a nav. Colour alone marks the active
   one — a weight change would widen the label and shove its neighbours
   along the line every time the filter moved.

   Links, not buttons, so a filtered view can be opened in a new tab, and
   the state lives in the URL where it can be shared. scroll={false}:
   changing the filter is not a new page, so the reader stays where they
   are. */
export default function CategoryFilter({
  options,
  active,
}: {
  options: FilterOption[];
  active: Category | null;
}) {
  return (
    <nav className="lab-filter-nav" aria-label="Lab categories">
      <ul className="list lab-filter">
        {options.map((option) => (
          <li key={option.label}>
            <Link
              className="lab-filter-item"
              href={labHref(option.category)}
              scroll={false}
              aria-current={option.category === active ? "true" : undefined}
            >
              {option.label}
              <span className="lab-filter-count">{option.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
