import Image from "next/image";

import Clip from "./clip";
import FigureViewer from "./figure-viewer";

const PLACEHOLDER = "/placeholder.png";

/* .mp4 and .webm render as a muted, looping clip; anything else as an image.
   One component either way, so MDX writes <Figure> and the frame, ratio and
   caption behave the same regardless of what is inside it. */
const VIDEO = /\.(mp4|webm)$/i;

/* Full width of the content column. The frame holds an aspect ratio so the
   block is the right size before the file loads and whatever is dropped in
   fills it, rather than the layout depending on each file's dimensions. A
   source of another shape is contained, not cropped: it sits whole on the
   frame's --figure mat.

   `ratio` overrides the 16:9 default when the mat would be most of the
   frame — a portrait phone recording is better given a frame of its own
   shape than shown as a sliver between two wide bands.

   `inset` pads a contained source off the frame's edges, so it sits on the
   mat rather than touching it. Set by hand on any figure that is not the
   frame's shape. It cannot be read from the file: every page regenerates on
   Vercel, where public/ is not on disk, so a size check at render would
   pass in the build and quietly drop the inset on the first revalidation. */
export default function Figure({
  src,
  alt = "",
  caption,
  ratio,
  poster,
  inset = false,
}: {
  src: string;
  alt?: string;
  caption?: string;
  ratio?: string;
  poster?: string;
  inset?: boolean;
}) {
  const className = inset ? "case-figure-frame case-figure-inset" : "case-figure-frame";
  const style = ratio ? { aspectRatio: ratio } : undefined;

  const image = (
    <Image src={src} alt={alt} fill sizes="(min-width: 40rem) 36rem, 100vw" />
  );

  /* Images open full size in a viewer. A clip stays where it is, already
     playing, and a placeholder has nothing to enlarge. */
  let frame;
  if (VIDEO.test(src)) {
    frame = (
      <div className={className} style={style}>
        <Clip src={src} poster={poster} />
      </div>
    );
  } else if (src === PLACEHOLDER) {
    frame = (
      <div className={className} style={style}>
        {image}
      </div>
    );
  } else {
    frame = (
      <FigureViewer src={src} alt={alt} caption={caption} className={className} style={style}>
        {image}
      </FigureViewer>
    );
  }

  return (
    <figure className="case-figure">
      {frame}
      {caption ? (
        <figcaption className="case-caption">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
