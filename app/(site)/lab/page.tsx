import { pageMetadata } from "../../site";

export const metadata = pageMetadata({
  title: "Lab",
  description: "Experiments and fun ideas by Isaac Taiwo.",
  path: "/lab",
});

export default function Lab() {
  return (
    <section>
      <h2 className="section-heading">Lab</h2>
      <p className="section-empty">
        Nothing here yet. Experiments and half-finished ideas will land here.
      </p>
    </section>
  );
}
