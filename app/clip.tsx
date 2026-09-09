"use client";

import { useEffect, useRef } from "react";

/* An autoplaying clip, muted and looping, that only runs while it is on
   screen. A case study with several of them would otherwise decode every one
   at once and keep them all playing behind the reader.

   preload is none, so nothing is fetched until the observer says the clip is
   close — the lazy half of the same requirement. */
export default function Clip({ src, poster }: { src: string; poster?: string }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          /* Autoplay can still be refused — a data saver, a battery mode, a
             browser that wants a gesture. Nothing to do about it, and an
             unhandled rejection here would be noise. */
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      /* A quarter visible is enough to be worth playing, and means a clip
         half off the bottom of the screen is not running unseen. */
      { threshold: 0.25 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" />
  );
}
