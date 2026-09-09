import Image from "next/image";
import Link from "next/link";

import { hiddenHrefs } from "../case-studies";
import { groups } from "../projects";

export default async function Work() {
  const hidden = await hiddenHrefs();

  return (
    <>
      {groups.map((group) => (
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

              /* A draft case study is not linked from here in production. The
                 row then carries the same markup as a plain div, so the hover
                 and press states read identically and nothing moves when the
                 draft flag flips. */
              return (
                <li key={project.name}>
                  {hidden.has(project.href) ? (
                    <div className="row">{content}</div>
                  ) : (
                    <Link className="row" href={project.href}>
                      {content}
                    </Link>
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
