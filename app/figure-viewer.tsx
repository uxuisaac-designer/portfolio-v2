"use client";

import { getImageProps } from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import Icon from "./icons";

/* The entrance curve and duration, as the page's own entrances use them.
   WAAPI takes the values rather than the custom properties. */
const EASE = "cubic-bezier(0.23, 1, 0.32, 1)";
const GROW = 400;
const FADE = 150; /* reduced motion: no travel, only this */

type Phase = "closed" | "opening" | "open" | "closing";

/* The rectangle the picture actually occupies inside the in-page frame. The
   img fills the frame, but its content box is shrunk by the inset's padding
   and the source is contained within that, so for anything not 16:9 the
   visible picture is smaller than the element. Growing from the element
   would make an inset screenshot jump in size as it lifted. */
function pictureRect(img: HTMLImageElement): DOMRect {
  const box = img.getBoundingClientRect();
  const style = getComputedStyle(img);
  const left = box.left + parseFloat(style.paddingLeft);
  const top = box.top + parseFloat(style.paddingTop);
  const width = box.width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const height = box.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);

  const aspect = img.naturalWidth / img.naturalHeight;
  const fitWidth = Math.min(width, height * aspect);
  const fitHeight = fitWidth / aspect;

  return new DOMRect(
    left + (width - fitWidth) / 2,
    top + (height - fitHeight) / 2,
    fitWidth,
    fitHeight,
  );
}

/* The page stays put while the viewer is open, so the picture can shrink back
   to exactly where it came from. Removing the scrollbar would widen the page
   and shift the centred column under it, so its width is paid back as
   padding for as long as the lock holds. */
function lockScroll() {
  const root = document.documentElement;
  const gutter = window.innerWidth - root.clientWidth;
  root.style.overflow = "hidden";
  if (gutter > 0) root.style.paddingRight = `${gutter}px`;
}

function unlockScroll() {
  const root = document.documentElement;
  root.style.overflow = "";
  root.style.paddingRight = "";
}

/* A case-study image as a button that opens it full size. The frame itself is
   the button, so the whole figure is the target, and the viewer is a native
   modal dialog: the browser moves focus into it, makes the page behind inert,
   closes it on Escape and hands focus back to the frame afterwards.

   The picture grows out of its place in the column and shrinks back into it.
   Its own spot is emptied while it is away — the mat stays — so it reads as
   one picture lifted off the page rather than a copy laid over it. */
export default function FigureViewer({
  src,
  alt,
  caption,
  className,
  style,
  children,
}: {
  src: string;
  alt: string;
  caption?: string;
  className: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pictureRef = useRef<HTMLDivElement>(null);
  const lowRef = useRef<HTMLImageElement>(null);

  const phase = useRef<Phase>("closed");
  const running = useRef<Animation[]>([]);

  /* The full-size file is only asked for once somebody opens the viewer. */
  const [requested, setRequested] = useState(false);
  const [sharp, setSharp] = useState(false);
  const [lifted, setLifted] = useState(false);

  const { props: full } = getImageProps({ src, alt, fill: true, sizes: "100vw" });

  const finishClose = useCallback(() => {
    for (const animation of running.current) animation.cancel();
    running.current = [];
    phase.current = "closed";
    if (dialogRef.current?.open) dialogRef.current.close();
    unlockScroll();
    setLifted(false);
    /* The dialog hands focus back to whatever had it before, and Safari
       never focuses a button on click, so that can be the body. Put it back
       on the frame outright, so keyboard users land where they left. */
    triggerRef.current?.focus({ preventScroll: true });
  }, []);

  /* The transform that puts the viewer's picture over the in-page one. */
  const fromFrame = useCallback(() => {
    const img = triggerRef.current?.querySelector("img");
    const picture = pictureRef.current;
    if (!img || !picture) return null;

    const from = pictureRect(img);
    const to = picture.getBoundingClientRect();
    const scale = from.width / to.width;
    return `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${scale})`;
  }, []);

  /* Plays one move — opening or closing — as a set of animations that finish
     together. */
  const play = useCallback((opening: boolean) => {
    const dialog = dialogRef.current;
    const picture = pictureRef.current;
    if (!dialog || !picture) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timing = { duration: reduced ? FADE : GROW, easing: EASE, fill: "both" as const };
    const fades = dialog.querySelectorAll(".viewer-scrim, .viewer-chrome");

    for (const animation of running.current) animation.cancel();
    const animations: Animation[] = [];
    const shown = [{ opacity: 0 }, { opacity: 1 }];
    const fadeFrames = opening ? shown : [...shown].reverse();

    for (const element of fades) {
      animations.push(element.animate(fadeFrames, timing));
    }

    const from = reduced ? null : fromFrame();
    if (from) {
      const travel = [{ transform: from }, { transform: "none" }];
      animations.push(picture.animate(opening ? travel : [...travel].reverse(), timing));
    } else {
      animations.push(picture.animate(fadeFrames, timing));
    }

    running.current = animations;
    return Promise.all(animations.map((animation) => animation.finished));
  }, [fromFrame]);

  /* A move cut short is reversed from wherever it has got to, so a close
     during the opening shrinks straight back rather than finishing the grow
     first or snapping. */
  const reverse = useCallback((next: Phase) => {
    phase.current = next;
    for (const animation of running.current) animation.reverse();
    return Promise.all(running.current.map((animation) => animation.finished));
  }, []);

  const settle = useCallback(
    (moving: Promise<unknown> | undefined, expected: Phase) => {
      moving
        ?.then(() => {
          if (phase.current !== expected) return;
          if (expected === "opening") {
            phase.current = "open";
          } else {
            finishClose();
          }
        })
        .catch(() => {
          /* A cancelled animation rejects; the move that cancelled it owns
             what happens next. */
        });
    },
    [finishClose],
  );

  const open = useCallback(async () => {
    if (phase.current === "closing") {
      settle(reverse("opening"), "opening");
      return;
    }
    if (phase.current !== "closed") return;

    const dialog = dialogRef.current;
    const img = triggerRef.current?.querySelector("img");
    if (!dialog || !img) return;

    phase.current = "opening";
    /* Clicked before the lazy image arrived: its size is what the viewer is
       laid out from, so wait for it. */
    if (!img.naturalWidth) await img.decode().catch(() => {});
    if (!img.naturalWidth) {
      phase.current = "closed";
      return;
    }

    /* The copy already on the page is shown first, so the grow never runs on
       an empty frame; the full-size file fades in over it when it lands. */
    if (lowRef.current) lowRef.current.src = img.currentSrc;
    dialog.style.setProperty("--viewer-aspect", String(img.naturalWidth / img.naturalHeight));
    setRequested(true);

    lockScroll();
    dialog.showModal();
    setLifted(true);
    settle(play(true), "opening");
  }, [play, reverse, settle]);

  const close = useCallback(() => {
    if (phase.current === "opening") {
      settle(reverse("closing"), "closing");
      return;
    }
    if (phase.current !== "open") return;
    phase.current = "closing";
    settle(play(false), "closing");
  }, [play, reverse, settle]);

  /* Escape arrives as a cancel. Taking it over lets it animate like every
     other close. The browser may still force the dialog shut — Chrome does on
     a second Escape — so a close that arrives by any route cleans up. */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onCancel = (event: Event) => {
      event.preventDefault();
      close();
    };
    const onClose = () => {
      if (phase.current !== "closed") finishClose();
    };

    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("close", onClose);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onClose);
    };
  }, [close, finishClose]);

  /* Navigating away with the viewer open must not leave the page locked. */
  useEffect(() => () => unlockScroll(), []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={lifted ? `${className} is-lifted` : className}
        style={style}
        onClick={open}
        aria-haspopup="dialog"
        aria-label={`Enlarge image: ${alt || caption || "figure"}`}
      >
        {children}
      </button>

      {/* Any click closes it — the picture, the scrim, the button. The button
          is there for keyboards and for anyone who looks for one. */}
      <dialog
        ref={dialogRef}
        className="viewer"
        aria-label={caption || alt || "Image"}
        onClick={close}
      >
        <div className="viewer-scrim" />
        <div className={caption ? "viewer-stage has-caption" : "viewer-stage"}>
          <figure className="viewer-figure">
            {/* Plain img on purpose. The first reuses the file the page
                already loaded, by its currentSrc; the second is the
                optimised srcset from getImageProps. next/image would own the
                src of one and the load timing of the other. */}
            <div ref={pictureRef} className="viewer-picture">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img ref={lowRef} alt="" aria-hidden="true" />
              {requested ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={alt}
                  src={full.src}
                  srcSet={full.srcSet}
                  sizes={full.sizes}
                  decoding="async"
                  className={sharp ? "is-sharp" : undefined}
                  onLoad={() => setSharp(true)}
                />
              ) : null}
            </div>
            {caption ? (
              <figcaption className="viewer-caption viewer-chrome">{caption}</figcaption>
            ) : null}
          </figure>
        </div>
        <button type="button" className="viewer-close viewer-chrome" aria-label="Close">
          <Icon name="close" />
        </button>
      </dialog>
    </>
  );
}
