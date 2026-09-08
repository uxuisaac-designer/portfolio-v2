import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

/* Plugins are named as strings rather than imported: Turbopack cannot pass
   JavaScript functions across to Rust. rehype-slug gives every heading an
   id, which is what the table of contents links to. */
const withMDX = createMDX({
  options: {
    rehypePlugins: [["rehype-slug"]],
  },
});

export default withMDX(nextConfig);
