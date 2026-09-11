# Lab entries

One MDX file per experiment, plus a poster and, optionally, a loop.

## Adding entry 004

1. Copy `_entry.mdx` to `004-short-name.mdx`. The filename starts with the
   id, and the rest becomes the URL: `/lab/004-short-name`.
2. Fill in `meta` (fields below) and write the body underneath it.
3. Put the media in `public/lab/004/`: `poster.png`, and `demo.mp4` if it moves.
4. Run `npm run build`. A missing or malformed field fails the build with a
   message naming the file and every problem in it.

## Fields

| Field      | Required | What it does |
|------------|----------|--------------|
| `id`       | yes | Three digits, unique, and the start of the filename. Sorts the Lab, newest first. |
| `title`    | yes | Noun first, 2–3 words, sentence case. One line on a card: keep it under about 24 characters. |
| `category` | yes | `Component`, `Pattern`, `Motion` or `Concept`. Drives the filter. |
| `tags`     | no  | Lowercase words. Validated, but nothing shows them yet. |
| `question` | yes | What the experiment was built to answer. A card shows two lines, about 70 characters. |
| `date`     | yes | ISO, `2026-09-14`. Used as the entry's date in the sitemap; not shown on the page. |
| `poster`   | yes | A path from `public/`, like `/lab/004/poster.png`. |
| `media`    | no  | A path to an `.mp4` or `.webm` loop. Leave the line out for a still entry. |
| `featured` | no  | Reserved for the homepage. Nothing reads it yet. |
| `draft`    | no  | `true` hides it from `/lab`, Newer/Older and the sitemap in production. The page is still built and reachable by URL. |

## Posters and loops

The frame is 3:2 and the artefact fills its middle 60%, so **the poster is
the artefact alone**, not the frame. The mat colour comes from CSS and
changes with the theme, which is why it must not be baked into the export.

**Poster:** 1200 × 800 PNG. The largest the artefact is ever drawn is 350px
wide, on an entry's page, so 1200 covers a 3x screen with room to spare.
Transparent around the artefact if it has an irregular shape, or opaque if
it is a screen. `next/image` serves it to browsers as WebP or AVIF, so there
is nothing to gain by exporting WebP.

**Loop:** 1200 × 800 mp4 (H.264), no audio, 3–6 seconds, looping cleanly.
Its first frame must be the poster: the loop fades in over the poster and
resets to its first frame when it stops. Aim for under 1 MB.

With nothing but macOS:

```bash
# Poster: screenshot a 3:2 region with Cmd-Shift-4, then
sips -s format png -Z 1200 ~/Desktop/Screenshot.png --out public/lab/004/poster.png

# Loop: record the same region with Cmd-Shift-5, trim it in QuickTime
# (Edit → Trim), then
avconvert --preset PresetHighestQuality --source ~/Desktop/Recording.mov \
  --output public/lab/004/demo.mp4 --replace
```

`-Z 1200` scales the longest side to 1200 and keeps the ratio, so a 3:2
capture comes out at 1200 × 800. Check the loop plays in Safari and Chrome
before committing it.
