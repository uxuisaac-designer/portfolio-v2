"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { categoryFromValue, rememberCategory } from "../../lab-category";
import CategoryFilter, { type FilterOption } from "./category-filter";
import LabGrid, { type LabGridItem } from "./lab-grid";

/* The only component that reads the query string. It sits inside a
   Suspense boundary on the page, whose fallback is the same pair unfiltered,
   so /lab still prerenders, with the first 24 cards in its HTML.

   The grid is keyed on the category so switching filters starts the count
   of shown cards again from 24. */
export default function LabBrowser({
  options,
  items,
}: {
  options: FilterOption[];
  items: LabGridItem[];
}) {
  const active = categoryFromValue(useSearchParams().get("category"));

  useEffect(() => {
    rememberCategory(active);
  }, [active]);

  return (
    <>
      <CategoryFilter options={options} active={active} />
      <LabGrid key={active ?? "all"} items={items} active={active} />
    </>
  );
}
