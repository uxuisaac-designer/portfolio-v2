import { CornerUpLeft, Moon, Sun } from "lucide-react";

/* The only place lucide-react is imported. Icons are referenced by name so
   nothing else in the app touches the library, and the defaults live here
   rather than being repeated at every call site: 16px, stroke 1.5, and
   currentColor so an icon takes the colour of the text around it.

   Named icons.tsx rather than icon.tsx: app/icon.* is a reserved App Router
   metadata route, and Next builds it as one.

   Add to this registry to use a new icon. */
const ICONS = {
  return: CornerUpLeft,
  sun: Sun,
  moon: Moon,
} as const;

export type IconName = keyof typeof ICONS;

export default function Icon({
  name,
  size = 16,
  strokeWidth = 1.5,
}: {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}) {
  const Glyph = ICONS[name];

  return (
    <Glyph
      size={size}
      strokeWidth={strokeWidth}
      color="currentColor"
      aria-hidden="true"
      focusable="false"
    />
  );
}
