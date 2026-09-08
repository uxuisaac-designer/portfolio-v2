"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* Writing and Lab are built and routable; they stay out of the nav until
   each has something worth visiting. */
const ROUTES = [
  { href: "/", label: "Work" },
  // { href: "/writing", label: "Writing" },
  // { href: "/lab", label: "Lab" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="nav">
      {ROUTES.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          aria-current={pathname === route.href ? "page" : undefined}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
