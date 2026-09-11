import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

/* The size every link preview is drawn for; anything else is scaled or
   cropped by whoever unfurls it. Each opengraph-image repeats it as its
   own `size` export, because Next reads that export statically and would
   not follow a re-export here. */
const SIZE = { width: 1200, height: 630 };

/* The light palette as hex. Satori, which draws these, does not read
   oklch. There is one card per page and no dark variant: an unfurl sits
   inside someone else's interface, which has its own theme and does not
   tell the image what it is. */
const BG = "#fbfaf9";
const TEXT = "#1b1918";
const MUTED = "#555351";

/* One size for every line, as on the site: the title separates on weight
   and colour, never scale. 48px keeps the longest tagline, 99 characters,
   to three lines across the 1040px measure. */
const TYPE = 48;

/* Vendored as TTF rather than read from next/font: Satori takes TTF, OTF
   or WOFF but not WOFF2, and cannot synthesise a bold, so the SemiBold
   face has to be real. Both are Geist from Google Fonts, under the OFL. */
const fonts = Promise.all(
  ["Geist-Regular.ttf", "Geist-SemiBold.ttf"].map((file) =>
    readFile(path.join(process.cwd(), "assets", "fonts", file)),
  ),
);

export async function shareCard({
  eyebrow,
  title,
  detail,
  footer,
}: {
  eyebrow?: string;
  title: string;
  detail?: string;
  footer?: string;
}) {
  const [regular, semibold] = await fonts;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: BG,
          color: MUTED,
          fontFamily: "Geist",
          fontSize: TYPE,
          lineHeight: 1.3,
          letterSpacing: "-0.02em",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          {eyebrow ? <div>{eyebrow}</div> : null}
          <div style={{ color: TEXT, fontWeight: 600 }}>{title}</div>
          {detail ? (
            <div style={{ marginTop: 24, maxWidth: 1040 }}>{detail}</div>
          ) : null}
        </div>

        {footer ? <div style={{ color: TEXT, fontWeight: 600 }}>{footer}</div> : null}
      </div>
    ),
    {
      ...SIZE,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
