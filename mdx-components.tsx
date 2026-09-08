import type { MDXComponents } from "mdx/types";

import Figure from "./app/figure";

/* Required by @next/mdx in the App Router. Figure is exposed here so case
   study content can use it without importing anything. */
const components: MDXComponents = {
  Figure,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
