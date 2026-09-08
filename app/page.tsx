import Image from "next/image";

import Footer from "./footer";
import { londonTime } from "./london-time";

/* The footer prints the London time into the HTML, so the page is
   regenerated each minute rather than frozen at build time. Without this
   a visitor with JavaScript disabled would see whenever the site was last
   built. Must stay a literal — Next needs it statically analyzable. */
export const revalidate = 60;

const placeholder = "/placeholder.png";

const projects = [
  {
    company: "Car & Classic",
    logo: "/logos/car-and-classic.png",
    period: "2024–Present",
    role: "Senior Product Designer",
    context: "Europe’s largest classic car marketplace.",
    items: [
      {
        name: "Car insurance",
        description: "Insurance quote flow for classic car owners",
        thumbnail: placeholder,
      },
      {
        name: "Design system",
        description: "A system for designers, developers and agents",
        thumbnail: placeholder,
      },
      {
        name: "Dealer experience",
        description: "A selling dashboard for professional dealers",
        thumbnail: placeholder,
      },
    ],
  },
  {
    company: "Kick Game",
    logo: "/logos/kick-game.png",
    period: "2022–2024",
    role: "Senior Product Designer",
    context: "UK & EU’s premier sneaker and streetwear store.",
    items: [
      {
        name: "Consignment app",
        description: "An app for consignors selling luxury goods",
        thumbnail: placeholder,
      },
      {
        name: "Buyer experience",
        description: "Purchase flow for authenticated premium goods",
        thumbnail: placeholder,
      },
    ],
  },
  {
    company: "Klekt",
    logo: "/logos/klekt.png",
    period: "2021–2022",
    role: "UX/UI Designer",
    context: "EU’s oldest online marketplace for authentic sneakers and streetwear.",
    items: [
      {
        name: "Bidding flow",
        description: "Bidding on a sneaker and streetwear marketplace",
        thumbnail: placeholder,
      },
      {
        name: "Marketplace improvements",
        description: "Listings, drops and search",
        thumbnail: placeholder,
      },
    ],
  },
];

export default function Home() {
  return (
    <main className="page">
      <Image
        className="avatar"
        src="/Avatar/Avatar-isaac-1.png"
        alt=""
        width={896}
        height={2028}
        sizes="40px"
        loading="eager"
      />

      <p className="greeting">
        hello
        <span className="ellipsis" aria-hidden="true">
          <span className="ellipsis-dot">.</span>
          <span className="ellipsis-dot">.</span>
          <span className="ellipsis-dot">.</span>
        </span>
      </p>

      <p>
        I&rsquo;m Isaac, a senior product designer obsessed with detail and
        creating interfaces that ask less of the person using them.
      </p>
      <p>
        Currently at{" "}
        <a href="https://www.carandclassic.com">
          <span className="link-underline">Car &amp; Classic</span>
        </a>
        , shaping the buying and selling experience for Europe&rsquo;s largest
        classic car marketplace.
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

      {projects.map((group) => (
        <section className="group" key={group.company}>
          <Image
            className="group-logo"
            src={group.logo}
            alt=""
            width={24}
            height={24}
          />
          <div className="group-header">
            <h2 className="group-company">{group.company}</h2>
            <span className="group-period">{group.period}</span>
          </div>
          <p className="group-role">{group.role}</p>
          <p className="group-context">{group.context}</p>
          <ul className="list group-projects">
            {group.items.map((project) => (
              <li className="row" key={project.name}>
                <Image
                  className="row-thumbnail"
                  src={project.thumbnail}
                  alt=""
                  width={64}
                  height={64}
                />
                <span className="row-name">{project.name}</span>
                <span className="row-description">{project.description}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="writing">
        <h2 className="writing-heading">Writing</h2>
        <p className="writing-empty">
          Nothing published yet. Notes on interface design will land here.
        </p>
      </section>

      <Footer initial={londonTime(new Date())} />
    </main>
  );
}
