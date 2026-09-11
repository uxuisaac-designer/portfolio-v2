"use client";

import { useState, type ReactNode } from "react";

import type { Category } from "../../lab-category";

/* The card arrives already rendered by the server. Only the choosing of
   which cards to show happens here: no card is rendered in the browser.
   Every card's markup is still in the RSC payload, serialised once, so the
   slice below limits the DOM and the image requests, not the payload. */
export type LabGridItem = { id: string; category: Category; card: ReactNode };

/* Enough to fill several screens at two columns. Rendering all hundred at
   once is a hundred frames and a hundred image requests for a page most
   people will read the top of. */
const STEP = 24;

export default function LabGrid({
  items,
  active,
}: {
  items: LabGridItem[];
  active: Category | null;
}) {
  const [shown, setShown] = useState(STEP);

  const matching = active ? items.filter((item) => item.category === active) : items;

  if (matching.length === 0) {
    return (
      <p className="section-empty">
        Nothing filed under {active ?? "the Lab"} yet.
      </p>
    );
  }

  const remaining = matching.length - shown;

  return (
    <>
      <ul className="list lab-grid">
        {matching.slice(0, shown).map((item) => (
          <li key={item.id}>{item.card}</li>
        ))}
      </ul>

      {remaining > 0 ? (
        <button
          type="button"
          className="lab-more"
          onClick={() => setShown((count) => count + STEP)}
        >
          Show {Math.min(STEP, remaining)} more
        </button>
      ) : null}
    </>
  );
}
