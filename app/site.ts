import type { Metadata } from "next";

/* The one place the site's address lives. Canonicals, the sitemap, robots
   and the share cards all resolve against it, so moving to a custom domain
   is this line and nothing else. */
export const SITE_URL = "https://portfolio-v2-rho-roan.vercel.app";

/* The full name, where the page itself says only Isaac: a title is read out
   of context — in a tab, a search result, a shared link — and "Isaac" alone
   is nobody in particular there. */
export const NAME = "Isaac Taiwo";

/* The intro's opening sentence without its "I'm Isaac, a": the title beside
   it already carries the name, and a description is read about the site
   rather than on it. */
export const DESCRIPTION =
  "Senior product designer obsessed with detail and creating interfaces that ask less of the person using them.";

export const X_HANDLE = "@ux_uisaac";

/* Next merges metadata shallowly: a page that sets openGraph replaces the
   root's whole object, site name and locale included, and a page that sets
   only a title leaves og:title saying the root's. So every page builds the
   full set here rather than overriding piecemeal. The template does not
   reach openGraph, which is why the name is joined on by hand. */
export function pageMetadata({
  title,
  description = DESCRIPTION,
  path,
  published,
  draft = false,
}: {
  title: string;
  description?: string;
  path: string;
  /* An ISO date. Present only on a note, which is what makes it an
     article rather than a page. */
  published?: string;
  /* A draft is built and reachable by its URL, only unlinked. Unlinked is
     not enough to keep a crawler that finds the URL from listing it. */
  draft?: boolean;
}): Metadata {
  const fullTitle = `${title} — ${NAME}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    ...(draft ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      siteName: NAME,
      locale: "en_GB",
      url: path,
      title: fullTitle,
      description,
      ...(published
        ? { type: "article", publishedTime: published, authors: [NAME] }
        : { type: "website" }),
    },
  };
}
