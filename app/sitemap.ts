import type { MetadataRoute } from "next";

import { hiddenHrefs } from "./case-studies";
import { getAllEntries } from "./lab";
import { notes } from "./notes";
import { timeline } from "./projects";
import { SITE_URL } from "./site";

/* Read from the same lists the pages render, so a new case study, note or
   Lab entry joins the sitemap the way it joins the rows, and a draft stays
   out of it the way it stays out of them. Notes and entries carry their own
   dates; a case study claims no lastModified, because the build time would
   be a guess dressed as a fact. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const hidden = await hiddenHrefs();

  const work = timeline.flatMap((entry) =>
    entry.href && !hidden.has(entry.href) ? [{ url: SITE_URL + entry.href }] : [],
  );

  const writing = (await notes()).map((note) => ({
    url: SITE_URL + note.href,
    lastModified: note.published,
  }));

  const lab = (await getAllEntries()).map((entry) => ({
    url: SITE_URL + entry.href,
    lastModified: entry.date,
  }));

  return [
    { url: SITE_URL },
    { url: `${SITE_URL}/notes` },
    { url: `${SITE_URL}/lab` },
    ...work,
    ...writing,
    ...lab,
  ];
}
