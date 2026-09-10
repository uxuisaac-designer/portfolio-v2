"use client";

import { useTheme } from "next-themes";

import Icon from "./icons";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  /* The label stays constant rather than naming the theme being switched
     to. The resolved theme is unknown until after mount, so a label that
     described it would differ between the server and client renders.

     Both glyphs render and CSS picks one off the .dark class, for the same
     reason: the class is on <html> before first paint, so the right icon is
     there from the start without waiting on resolvedTheme. */
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Toggle light or dark theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <span className="theme-toggle-icon">
        <span className="theme-toggle-sun">
          <Icon name="sun" />
        </span>
        <span className="theme-toggle-moon">
          <Icon name="moon" />
        </span>
      </span>
    </button>
  );
}
