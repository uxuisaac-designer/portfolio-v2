import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

import ThemeProvider from "./theme-provider";
import ThemeToggle from "./theme-toggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Isaac",
  description: "Personal portfolio of Isaac.",
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
