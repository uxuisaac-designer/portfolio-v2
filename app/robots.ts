import type { MetadataRoute } from "next";

import { SITE_URL } from "./site";

/* Everything is open. Drafts are kept out by a noindex on the page itself
   rather than a disallow here: a disallowed URL can still be listed from a
   link elsewhere, and a crawler that is refused the page never sees the
   noindex that would have removed it. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
