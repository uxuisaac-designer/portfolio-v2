import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Image from "next/image";
import "./globals.css";

import Footer from "./footer";
import Greeting from "./greeting";
import { londonTime } from "./london-time";
import Nav from "./nav";
import ThemeProvider from "./theme-provider";
import ThemeToggle from "./theme-toggle";
import Section from "./section";

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

          <main className="page">
            <div className="intro">
              <Image
                className="avatar"
                src="/Avatar/Avatar-isaac-1.png"
                alt=""
                width={896}
                height={2028}
                sizes="36px"
                loading="eager"
              />

              <Greeting />
            </div>

            <p>
              I&rsquo;m Isaac, a senior product designer obsessed with detail and
              creating interfaces that ask less of the person using them.
            </p>
            <p>
              Currently at{" "}
              <a href="https://www.carandclassic.com">
                <span className="link-underline">Car &amp; Classic</span>
              </a>
              , shaping the buying and selling experience for Europe&rsquo;s
              largest classic car marketplace.
            </p>
            <p>
              Previously redesigning luxury ecommerce platforms at{" "}
              <a href="https://www.kickgame.co.uk">
                <span className="link-underline">Kick Game</span>
              </a>{" "}
              and{" "}
              <a href="https://www.klekt.com">
                <span className="link-underline">Klekt</span>
              </a>
              .
            </p>
            <p>
              You can reach me by{" "}
              <a href="mailto:uxuisaac@gmail.com">
                <span className="link-underline">email</span>
              </a>
              , or find me on{" "}
              <a href="https://www.linkedin.com/in/isaactaiwo">
                <span className="link-underline">LinkedIn</span>
              </a>{" "}
              and{" "}
              <a href="https://x.com/ux_uisaac">
                <span className="link-underline">X</span>
              </a>
              .
            </p>

            <Nav />

            <Section>{children}</Section>

            <Footer initial={londonTime(new Date())} />
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
