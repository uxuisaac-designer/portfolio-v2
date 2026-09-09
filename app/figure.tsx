import Image from "next/image";

import Clip from "./clip";

/* .mp4 and .webm render as a muted, looping clip; anything else as an image.
   One component either way, so MDX writes <Figure> and the frame, ratio and
   caption behave the same regardless of what is inside it. */
const VIDEO = /\.(mp4|webm)$/i;

/* Full width of the content column. The frame holds an aspect ratio so the
   block is the right size before the file loads and whatever is dropped in
   fills it, rather than the layout depending on each file's dimensions.

   `ratio` overrides the 16:9 default for a source that is not landscape — a
   phone screen recording in a 16:9 frame would be cropped to a strip. */
export default function Figure({
  src,
  alt = "",
  caption,
  ratio,
  poster,
}: {
  src: string;
  alt?: string;
  caption?: string;
  ratio?: string;
  poster?: string;
}) {
  return (
    <figure className="case-figure">
      <div
        className="case-figure-frame"
        style={ratio ? { aspectRatio: ratio } : undefined}
      >
        {VIDEO.test(src) ? (
          <Clip src={src} poster={poster} />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 40rem) 36rem, 100vw"
          />
        )}
      </div>
      {caption ? (
        <figcaption className="case-caption">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
