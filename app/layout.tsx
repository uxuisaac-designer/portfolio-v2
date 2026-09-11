import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

import { DESCRIPTION, NAME, SITE_URL, X_HANDLE } from "./site";
import ThemeProvider from "./theme-provider";
import ThemeToggle from "./theme-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/* Pages below override title, description, canonical and, for articles,
   the Open Graph type. Everything else here is inherited. The share image
   is the opengraph-image beside each page, which Next links on its own. */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: NAME, template: `%s — ${NAME}` },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: NAME,
    title: NAME,
    description: DESCRIPTION,
    locale: "en_GB",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    creator: X_HANDLE,
  },
};

/* The footer prints the London time into the HTML, so the page is
   regenerated each minute rather than frozen at build time. Must stay a
   literal — Next needs it statically analyzable. */
export const revalidate = 60;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    /* suppressHydrationWarning because next-themes writes the theme class
       onto <html> before React hydrates, so the attribute it sees will not
       match the server's. */
    <html lang="en" className={geistSans.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ThemeToggle />

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
