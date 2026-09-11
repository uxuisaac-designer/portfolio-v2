import { getAllEntries } from "../../lab";
import { pageMetadata } from "../../site";

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

  return (
    <ul className="list">
      {entries.map((entry) => (
        <li key={entry.id}>{`${entry.id} ${entry.title}`}</li>
      ))}
    </ul>
  );
}
