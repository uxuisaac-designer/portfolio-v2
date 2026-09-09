import Image from "next/image";
import Link from "next/link";

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
    logoDark: "/logos/kick-game-darkmode.png",
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
        href: "/work/kick-game-buyer-experience",
      },
    ],
  },
  {
    company: "Klekt",
    logo: "/logos/klekt.png",
    logoDark: "/logos/klekt-darkmode.png",
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

export default function Work() {
  return (
    <>
      {projects.map((group) => (
        <section className="group" key={group.company}>
          {/* Both variants are rendered and swapped in CSS rather than
              picked in JS: the theme class is on <html> before first paint,
              so this can never show the wrong one or flash. Car & Classic
              reads on either background and has no dark variant. */}
          <Image
            className={
              group.logoDark ? "group-logo group-logo-light" : "group-logo"
            }
            src={group.logo}
            alt=""
            width={24}
            height={24}
          />
          {group.logoDark && (
            <Image
              className="group-logo group-logo-dark"
              src={group.logoDark}
              alt=""
              width={24}
              height={24}
            />
          )}
          <div className="group-header">
            <h2 className="group-company">{group.company}</h2>
            <span className="group-period">{group.period}</span>
          </div>
          <p className="group-role">{group.role}</p>
          <p className="group-context">{group.context}</p>
          <ul className="list group-projects">
            {group.items.map((project) => {
              const content = (
                <>
                  <Image
                    className="row-thumbnail"
                    src={project.thumbnail}
                    alt=""
                    width={64}
                    height={64}
                  />
                  <span className="row-name">{project.name}</span>
                  <span className="row-description">{project.description}</span>
                </>
              );

              /* Only the rows with a case study behind them are links. The
                 rest carry the same markup as a plain div, so the hover and
                 press states read identically and nothing moves when the
                 remaining case studies land and each one gains an href. */
              return (
                <li key={project.name}>
                  {"href" in project && project.href ? (
                    <Link className="row" href={project.href}>
                      {content}
                    </Link>
                  ) : (
                    <div className="row">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </>
  );
}
