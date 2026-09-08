import Image from "next/image";

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

export default function Work() {
  return (
    <>
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
    </>
  );
}
