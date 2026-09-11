import { shareCard } from "./share-card";
import { DESCRIPTION, NAME } from "./site";

/* The card for the index, Notes and Lab, and the fallback for anything
   below that does not draw its own. */
export const alt = `${NAME}, senior product designer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return shareCard({ title: NAME, detail: DESCRIPTION });
}
