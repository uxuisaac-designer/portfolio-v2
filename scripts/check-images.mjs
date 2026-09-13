/* Warns about case study and Lab images that are see-through past their
   corners. Figures sit on the --figure mat, which is light in light mode and
   dark in dark mode, so anything drawn straight onto a transparent ground —
   dark text especially — disappears in one of the two. Rounded corners measure
   0–2% of an image; the limit sits well above that and well below a
   screenshot exported without its background.

   Warn-only by design: it runs before every build, Vercel's included, and a
   judgement call about an image should never block a deploy. */

import { readdir } from "node:fs/promises";
import path from "node:path";

const ROOTS = ["public/work", "public/lab"];
const LIMIT = 5; // percent of pixels
const OPAQUE = 250; // alpha at or above this counts as solid

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? files(full) : [full];
    }),
  );
  return nested.flat();
}

let sharp;
try {
  ({ default: sharp } = await import("sharp"));
} catch {
  console.warn("check-images: sharp is unavailable, skipping.");
  process.exit(0);
}

const images = (await Promise.all(ROOTS.map(files)))
  .flat()
  .filter((file) => /\.(png|webp|avif)$/i.test(file));

const flagged = [];

for (const file of images) {
  try {
    const { data, info } = await sharp(file)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let clear = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] < OPAQUE) clear++;
    const share = (100 * clear) / (info.width * info.height);
    if (share > LIMIT) flagged.push([share, file]);
  } catch (error) {
    console.warn(`check-images: could not read ${file} (${error.message})`);
  }
}

if (flagged.length) {
  console.warn(
    `check-images: ${flagged.length} image(s) more than ${LIMIT}% transparent.` +
      " Check them in dark mode, or export with a solid background:",
  );
  for (const [share, file] of flagged.sort((a, b) => b[0] - a[0])) {
    console.warn(`  ${share.toFixed(1).padStart(5)}%  ${file}`);
  }
} else {
  console.log(`check-images: ${images.length} images, none past the corners.`);
}
