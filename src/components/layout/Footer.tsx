"use client";

import React, { useRef, useEffect } from "react";

// Copyright characters. Each one is its own span so the pointer can scale and
// recolour it, and each steps down with the navbar's tiers (2xl / lg) plus two
// more stops for small and extra-small phones.
const CHAR =
  "mb-2 inline-block origin-center text-[0.9rem] will-change-[transform,color] [transition:transform_160ms_ease,color_160ms_ease] " +
  "max-2xl:mb-1.5 max-2xl:text-[0.82rem] max-lg:mb-1 max-lg:text-[0.78rem] " +
  "upto-639:text-[0.72rem] upto-420:text-[0.66rem] upto-376:text-[0.6rem]";

const DISCLAIMER =
  "mb-[0.2rem] block w-full max-w-[1000px] text-center text-[0.75rem] leading-[1.35] text-[rgba(220,220,220,0.7)] " +
  "max-2xl:text-[0.72rem] max-lg:text-[0.7rem] " +
  "upto-639:text-[0.66rem] upto-420:text-[0.62rem] upto-376:text-[0.58rem]";

export default function Footer() {
  const disclaimer = "Minecraft is a trademark of Mojang Studios. Any other trademarks are the property of their respective holders.";
  // Copyright runs from first publication to the current year, collapsing to a
  // single year if they ever match again.
  const FIRST_YEAR = 2025;
  const currentYear = new Date().getFullYear();
  const years = currentYear > FIRST_YEAR ? `${FIRST_YEAR}–${currentYear}` : `${FIRST_YEAR}`;
  const text = `© ${years} Emerson Clamor. All rights reserved.`
  const containerRef = useRef<HTMLDivElement | null>(null);
  const spanRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    spanRefs.current = spanRefs.current.slice(0, text.length);
  }, [text.length]);

  const handleMove = (e: React.PointerEvent) => {
    const maxDist = 120; // radius for strongest effect
    const x = e.clientX;
    const y = e.clientY;

    spanRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy);
      const n = Math.max(0, 1 - dist / maxDist); // 0..1 proximity
      const scale = 1 + n * 0.45; // upsize up to ~1.45
      const hue = (i * 28 + n * 180) % 360; // per-character rainbow + proximity shift

      el.style.transform = `scale(${scale})`;
      el.style.color = `hsl(${hue}, 90%, 60%)`;
    });
  };

  const handleLeave = () => {
    spanRefs.current.forEach((el) => {
      if (!el) return;
      el.style.transform = "";
      el.style.color = "";
    });
  };

  // Words are kept whole: per-character spans would otherwise let a narrow phone
  // break the line in the middle of a word. `index` keeps one flat run of refs
  // across every character so the pointer effect still indexes them in order.
  let index = 0;

  return (
    <footer className="relative z-6 mt-auto w-full shrink-0 bg-[#0A0A0A] py-6 font-rubber text-[#dcdcdc] max-2xl:py-5 max-lg:py-4 upto-420:py-3">
      <div
        className="mx-auto flex max-w-[1200px] cursor-default flex-col items-center justify-center gap-[0.6rem] px-12 py-2 text-center select-none max-2xl:gap-[0.5rem] max-2xl:px-10 max-lg:gap-[0.4rem] max-lg:px-8 max-lg:py-1 upto-420:gap-[0.3rem] upto-420:px-4"
        ref={containerRef}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        <div className="mt-[0.35rem] inline-block max-lg:mt-[0.2rem]">
          {text.split(" ").map((word, wordIndex, words) => {
            const chars = Array.from(word).map((ch) => ({ ch, i: index++ }));
            const spaceIndex = wordIndex < words.length - 1 ? index++ : null;
            return (
              <React.Fragment key={wordIndex}>
                <span className="inline-block whitespace-nowrap">
                  {chars.map(({ ch, i }) => (
                    <span
                      key={i}
                      ref={(el) => { spanRefs.current[i] = el; }}
                      className={CHAR}
                    >
                      {ch}
                    </span>
                  ))}
                </span>
                {spaceIndex !== null && (
                  <span
                    ref={(el) => { spanRefs.current[spaceIndex] = el; }}
                    className={`${CHAR} w-2 max-lg:w-1.5`}
                  >
                    {" "}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div className={DISCLAIMER} role="note" aria-label="Legal disclaimer">{disclaimer}</div>
      </div>
    </footer>
  );
}
