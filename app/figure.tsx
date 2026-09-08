import Image from "next/image";

/* Full width of the content column. The frame holds an aspect ratio so the
   block is the right size before the image loads and whatever is dropped in
   fills it, rather than the layout depending on each file's dimensions. */
export default function Figure({
  src,
  alt = "",
  caption,
}: {
  src: string;
  alt?: string;
  caption?: string;
}) {
  return (
    <figure className="case-figure">
      <div className="case-figure-frame">
        <Image src={src} alt={alt} fill sizes="(min-width: 40rem) 36rem, 100vw" />
      </div>
      {caption ? (
        <figcaption className="case-caption">{caption}</figcaption>
      ) : null}
    </figure>
  );
}
