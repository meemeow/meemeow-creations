"use client";

import { useRef, useState } from "react";
import Image from "next/image";

type Photo = { src: string; alt: string };

// Every card shares the contact page's intro-card frame.
const CARD =
  "absolute inset-0 overflow-hidden rounded-lg border-2 border-white/20 [box-shadow:0_18px_40px_rgba(0,0,0,0.55)]";
// Cards ease between spots unless they're following a drag.
const SETTLE = "transform 450ms cubic-bezier(.2,.9,.2,1), opacity 450ms ease, filter 450ms ease";

// A neighbour card sits this far out (percent of the card width) and this much smaller.
const PEEK_SHIFT = 30;
const PEEK_SCALE = 0.8;
// Past the first / last card a drag only follows at this fraction (rubber band).
const EDGE_RESIST = 0.3;
// Pointer travel (px) before a press counts as a drag rather than a click.
const CLICK_SLOP = 6;

// Arrows sit under the cards, either side of the dots. At the first / last card the
// arrow stays but is disabled (dimmed, not clickable).
const ARROW =
  "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/5 text-white " +
  "[transition:background-color_150ms_ease,border-color_150ms_ease,opacity_200ms_ease] hover:border-white/40 hover:bg-white/10 " +
  "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:bg-white/5 upto-639:h-8 upto-639:w-8";

const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"}
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Photo card stack: the current photo sits in front with its neighbours
 * tucked behind on either side. Dragging slides the front card back toward its
 * neighbour's spot while the neighbour comes forward; past half way the
 * neighbour takes the front, and letting go settles on whichever card is in
 * front (short of half way everything springs back). Arrows and dots (below the
 * cards) and clicking a neighbour run the same motion. No wrap-around: the first card has nothing
 * to its left and the last nothing to its right. Photos must share one size
 * (`width` × `height`); `aspect` sets the card shape (defaults to the photos'
 * own). `fit` decides how a photo meets a differently shaped card: "cover" crops
 * to fill it, "fill" shows the whole photo squeezed to the card. `className` sets
 * the card width.
 */
export default function PhotoCarousel({
  photos,
  width,
  height,
  aspect,
  fit = "cover",
  sizes,
  priority = false,
  className = "",
}: {
  photos: Photo[];
  width: number;
  height: number;
  aspect?: string;
  fit?: "cover" | "fill";
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const n = photos.length;
  const [current, setCurrent] = useState(0);
  // How far the drag has carried the stack, in cards (+ toward the next card).
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const startX = useRef(0);
  const moved = useRef(false);

  const go = (to: number) => setCurrent(Math.min(n - 1, Math.max(0, to)));
  const hasPrev = current > 0;
  const hasNext = current < n - 1;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (n < 2 || (e.target as HTMLElement).closest("button")) return;
    startX.current = e.clientX;
    moved.current = false;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !boxRef.current) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > CLICK_SLOP) moved.current = true;
    let p = -dx / boxRef.current.offsetWidth;
    if ((p > 0 && !hasNext) || (p < 0 && !hasPrev)) p *= EDGE_RESIST;
    setProgress(Math.max(-1, Math.min(1, p)));
  };

  const endDrag = () => {
    if (!dragging) return;
    // Whichever card is in front (past the half-way swap) is the one that stays.
    if (progress > 0.5 && hasNext) go(current + 1);
    else if (progress < -0.5 && hasPrev) go(current - 1);
    setDragging(false);
    setProgress(0);
  };

  // Where a card sits: 0 = front, ±1 = tucked left/right, beyond that hidden.
  const place = (i: number): React.CSSProperties => {
    const pos = i - current - progress;
    const d = Math.min(Math.abs(pos), 2);
    const near = Math.min(d, 1);
    return {
      transform: `translateX(${pos * PEEK_SHIFT}%) scale(${1 - (1 - PEEK_SCALE) * near})`,
      // Front card fully lit; neighbours dimmed; anything further fades out.
      opacity: d <= 1 ? 1 - 0.6 * d : Math.max(0, 0.4 * (2 - d)),
      filter: `brightness(${1 - 0.25 * near})`,
      // Closest to the front stacks on top, so the swap lands at the half-way mark.
      zIndex: 100 - Math.round(d * 10),
      transition: dragging ? "none" : SETTLE,
    };
  };

  return (
    <div className="flex flex-col items-center">
      {/* pan-y keeps vertical page scrolling on touch; sideways drags move the cards */}
      <div
        ref={boxRef}
        className={`relative touch-pan-y select-none ${n > 1 ? (dragging ? "cursor-grabbing" : "cursor-grab") : ""} ${className}`}
        style={{ aspectRatio: aspect ?? `${width} / ${height}` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {photos.map((p, i) => {
          const front = i === current;
          return (
            <div
              key={p.src}
              className={CARD}
              style={place(i)}
              aria-hidden={front ? undefined : true}
              // A neighbour brings itself to the front when clicked (not at the end of a drag).
              onClick={() => {
                if (!front && !moved.current) go(i);
              }}
            >
              <Image
                src={p.src}
                alt={front ? p.alt : ""}
                width={width}
                height={height}
                sizes={sizes}
                priority={priority && i === 0}
                draggable={false}
                className={`block h-full w-full ${fit === "fill" ? "object-fill" : "object-cover"}`}
              />
            </div>
          );
        })}
      </div>

      {n > 1 && (
        <div className="mt-5 flex items-center gap-2 upto-639:mt-4">
          <button type="button" aria-label="Previous photo" disabled={!hasPrev} onClick={() => go(current - 1)} className={`${ARROW} mr-2`}>
            <Chevron dir="left" />
          </button>
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              aria-label={`Show photo ${i + 1} of ${n}`}
              aria-current={i === current ? "true" : undefined}
              onClick={() => go(i)}
              className={`h-2.5 cursor-pointer rounded-full [transition:width_200ms_ease,background-color_200ms_ease] ${
                i === current ? "w-6 bg-white" : "w-2.5 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
          <button type="button" aria-label="Next photo" disabled={!hasNext} onClick={() => go(current + 1)} className={`${ARROW} ml-2`}>
            <Chevron dir="right" />
          </button>
        </div>
      )}
    </div>
  );
}
