import { notes } from "../../notes";

export default function Notes() {
  return (
    /* No page heading. The nav sits directly above and already says Notes,
       and the Work page carries none either. */
    <ul className="list notes">
      {notes.map((note) => (
        <li key={note.title}>
          {/* A div until the note is written, carrying the markup a link
              will carry, so nothing moves when the href arrives. */}
          <div className="note-row">
            {/* Two spans, the same nesting a prose link uses. The outer one
                is the grid item and takes the whole column; the inner one
                is the inline-block the underline measures itself against,
                so the rule is the width of the words and not the row. */}
            <span className="note-title">
              <span className="link-underline">{note.title}</span>
            </span>
            <span className="note-time">{note.readTime}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
