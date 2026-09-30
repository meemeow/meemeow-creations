"use client";

import { STONE_FACE } from "./contact-classes";

const ARROW_DOWN_ROWS: [x: number, y: number, w: number][] = [
  [4, 8, 1],
  [3, 7, 3],
  [2, 6, 5],
  [1, 5, 7],
  [0, 4, 9],
  [3, 3, 3],
  [3, 2, 3],
  [3, 1, 3],
  [3, 0, 3],
];

const scrollToForm = () => {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("email-form")?.scrollIntoView({
    behavior: reduced ? "auto" : "smooth",
    block: "center",
  });
};

export default function EmailDirectlyButton() {
  return (
    <button
      type="button"
      onClick={scrollToForm}
      className="group w-1/2 min-w-fit cursor-pointer self-center [outline:none]"
    >
      <span className={STONE_FACE}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 9 9"
          shapeRendering="crispEdges"
          aria-hidden="true"
          className="-ml-1 -translate-x-1.5 shrink-0 upto-639:ml-0 upto-639:translate-x-0 animate-arrow-bounce-down will-change-transform motion-reduce:animate-none"
        >
          <g fill="#3f3f3f">
            {ARROW_DOWN_ROWS.map(([x, y, w]) => (
              <rect key={`s${y}`} x={x + 1} y={y + 1} width={w} height={1} />
            ))}
          </g>
          <g fill="#ffffff">
            {ARROW_DOWN_ROWS.map(([x, y, w]) => (
              <rect key={y} x={x} y={y} width={w} height={1} />
            ))}
          </g>
        </svg>
        <span className="-translate-x-0.5 upto-639:translate-x-0 font-pixel text-[0.68rem] uppercase tracking-[0.08em] text-white [text-shadow:2px_2px_0_#3f3f3f] upto-420:text-[0.6rem]">
          email directly
        </span>
      </span>
    </button>
  );
}
