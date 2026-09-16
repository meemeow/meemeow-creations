"use client";

import { useEffect, useState } from "react";

// How far down the page the button appears.
const SHOW_AFTER = 320;

// Minecraft GUI button: flat stone face, hard 3px bevel (lit top/left, shaded
// bottom/right), black outline, no rounding and no blur anywhere. Hovering
// brightens the stone the way the game highlights a selected button; pressing
// flips the bevel so the face sinks in.
const MC_BUTTON =
  "relative flex h-17 w-17 cursor-pointer items-center justify-center border-0 bg-[#8b8b8b] text-white " +
  "[image-rendering:pixelated] " +
  "[box-shadow:inset_4px_4px_0_0_#c6c6c6,inset_-4px_-4px_0_0_#4f4f4f,0_0_0_4px_#000000,0_7px_0_4px_rgba(0,0,0,0.35)] " +
  "[transition:background-color_100ms_steps(2),box-shadow_100ms_steps(2),transform_100ms_steps(2)] " +
  "[&:hover]:bg-[#a4a4a4] " +
  "[&:hover]:[box-shadow:inset_4px_4px_0_0_#dcdcdc,inset_-4px_-4px_0_0_#5f5f5f,0_0_0_4px_#000000,0_0_0_6px_rgba(255,255,255,0.35),0_7px_0_4px_rgba(0,0,0,0.35)] " +
  "active:[transform:translateY(5px)] " +
  "active:[box-shadow:inset_4px_4px_0_0_#4f4f4f,inset_-4px_-4px_0_0_#c6c6c6,0_0_0_4px_#000000,0_1px_0_4px_rgba(0,0,0,0.35)] " +
  "focus-visible:[outline:none] focus-visible:[box-shadow:inset_4px_4px_0_0_#dcdcdc,inset_-4px_-4px_0_0_#5f5f5f,0_0_0_4px_#000000,0_0_0_7px_rgba(255,255,160,0.7),0_7px_0_4px_rgba(0,0,0,0.35)] " +
  "max-lg:h-15 max-lg:w-15";

// In-game item tooltip: near-black purple panel, black outer edge with a violet
// inner border, and pale yellow text with the offset dark shadow the game draws
// under its glyphs. Sits to the left of the button and snaps in, no easing.
const TOOLTIP =
  "pointer-events-none absolute top-1/2 right-full mr-4 whitespace-nowrap " +
  "bg-[#150015] px-3 py-2 font-rubber text-[0.95rem] leading-none text-white " +
  "[box-shadow:0_0_0_3px_#100010,inset_0_0_0_3px_#2b0a56] " +
  "[text-shadow:2px_2px_0_#3f3f3f] " +
  "opacity-0 [transform:translateY(-50%)_translateX(8px)] " +
  "[transition:opacity_180ms_ease-out,transform_220ms_cubic-bezier(.2,.9,.2,1)] " +
  "group-hover:opacity-100 group-hover:[transform:translateY(-50%)_translateX(0)] " +
  "group-focus-within:opacity-100 group-focus-within:[transform:translateY(-50%)_translateX(0)] " +
  "max-lg:hidden";

// Pixel arrow drawn on a 9x9 grid, one rect per row, so the edges stair-step
// like an in-game sprite instead of curving.
const ARROW_ROWS: [x: number, y: number, w: number][] = [
  [4, 0, 1],
  [3, 1, 3],
  [2, 2, 5],
  [1, 3, 7],
  [0, 4, 9],
  [3, 5, 3],
  [3, 6, 3],
  [3, 7, 3],
  [3, 8, 3],
];

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    // Honour a reduced-motion preference by jumping instead of gliding.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    // The wrapper owns the fade/slide so the button keeps its own press transform.
    <div
      className={`group fixed right-8 bottom-8 z-500 [transition:opacity_240ms_ease,transform_240ms_cubic-bezier(.2,.9,.2,1)] max-lg:right-5 max-lg:bottom-5 ${
        visible
          ? "pointer-events-auto opacity-100 [transform:translateY(0)]"
          : "pointer-events-none opacity-0 [transform:translateY(12px)]"
      }`}
    >
      <span className={TOOLTIP} aria-hidden="true">
        Back to Top
      </span>
      <button type="button" onClick={toTop} aria-label="Back to top" className={MC_BUTTON} tabIndex={visible ? 0 : -1}>
        <svg
          width="34"
          height="34"
          viewBox="0 0 9 9"
          shapeRendering="crispEdges"
          aria-hidden="true"
          className="animate-arrow-bounce will-change-transform motion-reduce:animate-none"
        >
          {/* dark drop shadow one pixel down-right, the way in-game glyphs are drawn */}
          <g fill="#3f3f3f">
            {ARROW_ROWS.map(([x, y, w]) => (
              <rect key={`s${y}`} x={x + 1} y={y + 1} width={w} height={1} />
            ))}
          </g>
          <g fill="#ffffff">
            {ARROW_ROWS.map(([x, y, w]) => (
              <rect key={y} x={x} y={y} width={w} height={1} />
            ))}
          </g>
        </svg>
      </button>
    </div>
  );
}
