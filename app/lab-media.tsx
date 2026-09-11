"use client";

import { useEffect, useRef } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/* The moving half of a Lab artefact. The poster underneath is a server-
   rendered image; this <video> sits over it at opacity 0 and shows only
   while it is actually playing, so a slow or refused play never blanks
   the frame.

   The source is attached lazily — only once the frame is near the screen —
   and preload is none, so a grid of a hundred entries fetches nothing until
   something is played. On a card it plays on hover or keyboard focus and
   stops on leave; on an entry's page it plays while a quarter of it is on
   screen, the way <Clip> does.

   Under reduced motion the source is never attached at all. This is the
   deliberate opposite of <Clip>, which keeps playing because a case study's
   clip is its evidence. A Lab poster is already the finished picture. */
export default function LabMedia({
  src,
  trigger,
}: {
  src: string;
  trigger: "hover" | "view";
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia(REDUCED_MOTION).matches) return;

    const attach = () => {
      if (!video.getAttribute("src")) video.setAttribute("src", src);
    };

    /* Autoplay can still be refused — a data saver, a battery mode. Nothing
       to do about it, and an unhandled rejection would be noise. */
    const play = () => {
      attach();
      void video.play().catch(() => {});
    };

    /* Back to the first frame, which is the poster, so the next hover starts
       where the still left off. */
    const stop = () => {
      video.pause();
      video.currentTime = 0;
    };

    const onPlaying = () => {
      video.dataset.playing = "";
    };
    const onPause = () => {
      delete video.dataset.playing;
    };
    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (trigger === "hover") {
          if (entry.isIntersecting) attach();
          return;
        }
        if (entry.isIntersecting) play();
        else video.pause();
      },
      trigger === "hover"
        ? { rootMargin: "200px" }
        : { threshold: 0.25 },
    );
    observer.observe(video);

    /* The card is the link around the frame. Touch is left out: a tap is a
       navigation, and starting a clip under the finger as the page leaves
       would be motion nobody sees. */
    const card = trigger === "hover" ? video.closest("a") : null;
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== "touch") play();
    };
    card?.addEventListener("pointerenter", onEnter);
    card?.addEventListener("pointerleave", stop);
    card?.addEventListener("focusin", play);
    card?.addEventListener("focusout", stop);

    return () => {
      observer.disconnect();
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      card?.removeEventListener("pointerenter", onEnter);
      card?.removeEventListener("pointerleave", stop);
      card?.removeEventListener("focusin", play);
      card?.removeEventListener("focusout", stop);
    };
  }, [src, trigger]);

  /* aria-hidden: the poster below carries the same picture, and a second
     unlabelled media element would only be noise to a screen reader. */
  return (
    <video
      ref={ref}
      className="lab-video"
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    />
  );
}
