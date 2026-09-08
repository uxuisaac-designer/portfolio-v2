"use client";

import { ThemeProvider as NextThemes } from "next-themes";
import type { ReactNode } from "react";

/* System preference by default, class strategy so the palette can hang off
   a .dark selector. next-themes writes the class from a blocking inline
   script before first paint, which is what keeps the wrong theme from
   flashing, and persists the choice to localStorage. */
export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemes attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemes>
  );
}
