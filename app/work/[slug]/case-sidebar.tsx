"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import Icon from "../../icons";

export type Heading = { id: string; text: string };

/* The list itself is rendered from headings extracted on the server, so it
   is in the HTML rather than assembled from the DOM after mount. Only the
   active item is client work. */
export default function CaseSidebar({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const nodes = headings
      .map(({ id }) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);

    const end = document.querySelector(".case-end");

    /* The bottom margin pulls the trigger line up near the top of the
       viewport, so a section becomes current as it arrives rather than when
       it happens to be centred. */
    const observer = new IntersectionObserver(
      () => {
        /* At the foot of the page the last section is the one being read,
           whatever the trigger line says — it cannot scroll any higher. */
        const atBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 2;

        if (atBottom) {
          setActive(nodes[nodes.length - 1].id);
          return;
        }

        const passed = nodes.filter(
          (node) => node.getBoundingClientRect().top < window.innerHeight * 0.3,
        );
        setActive((passed[passed.length - 1] ?? nodes[0]).id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: [0, 1] },
    );

    nodes.forEach((node) => observer.observe(node));
    if (end) observer.observe(end);
    return () => observer.disconnect();
  }, [headings]);

  return (
    <aside className="case-sidebar">
      <Link className="case-index" href="/">
        <Icon name="return" />
        Index
      </Link>

      {headings.length > 0 ? (
        <nav className="case-toc" aria-label="On this page">
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              className="case-toc-item"
              data-active={heading.id === active ? "" : undefined}
              onClick={(event) => {
                event.preventDefault();
                document
                  .getElementById(heading.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
                history.replaceState(null, "", `#${heading.id}`);
              }}
            >
              {heading.text}
            </a>
          ))}
        </nav>
      ) : null}
    </aside>
  );
}
