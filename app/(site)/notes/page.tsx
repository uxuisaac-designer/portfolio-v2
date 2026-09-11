import Link from "next/link";

import { notes } from "../../notes";
import { pageMetadata } from "../../site";

export const metadata = pageMetadata({
  title: "Notes",
  description: "Writing on product design by Isaac Taiwo.",
  path: "/notes",
});

export default async function Notes() {
  const all = await notes();

  return (
    /* No page heading. The nav sits directly above and already says Notes,
       and the Work page carries none either. */
    <ul className="list notes">
      {all.map((note) => (
        <li key={note.slug}>
          {/* .note-row is a grid; an anchor takes display: grid as happily
              as a div did, so the swap needs no CSS. The hover wipe and the
              :active line are written against .note-row .link-underline and
              never cared what element carried them. The focus ring arrives
              on its own — .page a:focus-visible was always waiting for
              these to become anchors. */}
          <Link className="note-row" href={note.href}>
            {/* Two spans, the same nesting a prose link uses. The outer one
                is the grid item and takes the whole column; the inner one
                is the inline-block the underline measures itself against,
                so the rule is the width of the words and not the row. */}
            <span className="note-title">
              <span className="link-underline">{note.title}</span>
            </span>
            <span className="note-time">{note.readTime}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
