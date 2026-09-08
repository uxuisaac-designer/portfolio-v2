import type { ReactNode } from "react";

import Image from "next/image";

import Footer from "./footer";
import Greeting from "./greeting";
import { londonTime } from "./london-time";
import Nav from "./nav";
import Section from "./section";

/* The intro, nav and footer wrap the site's own routes. Case studies live
   outside this group and get only the root layout. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
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
  );
}
