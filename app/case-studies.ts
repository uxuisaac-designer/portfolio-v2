import { readdir } from "node:fs/promises";
import path from "node:path";

const CONTENT = path.join(process.cwd(), "content", "work");

/* `draft: true` in a case study's meta keeps it out of the homepage rows and
   the previous/next chain in production, so unfinished work is not linked from
   anywhere. In development it is linked as normal, which is the point — a
   draft is something being worked on.

   The route is built either way, so a draft is always reachable by its own
   URL. Unlinked, not unreachable. */
export async function hiddenHrefs(): Promise<ReadonlySet<string>> {
  if (process.env.NODE_ENV !== "production") return new Set();

  const files = await readdir(CONTENT);
  const hidden = new Set<string>();

  for (const file of files) {
    if (!file.endsWith(".mdx")) continue;

    const slug = file.replace(/\.mdx$/, "");
    /* The flag is read from the module rather than matched in the source, so
       it is the value the page itself renders with. */
    const { meta } = await import(`../content/work/${slug}.mdx`);

    if (meta?.draft) hidden.add(`/work/${slug}`);
  }

  return hidden;
}
