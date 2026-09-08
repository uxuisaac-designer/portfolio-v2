"use client";

import { useTheme } from "next-themes";

import Icon from "./icons";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  /* The label stays constant rather than naming the theme being switched
     to. The resolved theme is unknown until after mount, so a label that
     described it would differ between the server and client renders. */
  return (
    <button
      type="button"
      className="theme-toggle"
      aria-label="Toggle light or dark theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Icon name="contrast" />
    </button>
  );
}
