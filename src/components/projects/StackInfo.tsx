"use client";

import Image from "next/image";
import { useId, type ReactNode } from "react";
import { STACK_LOGOS } from "@/data/projects";

const ICON =
  "peer inline-flex h-[1.6rem] w-[1.6rem] shrink-0 cursor-help items-center justify-center rounded-full border-2 border-white/75 bg-white/[0.06] " +
  "text-white [box-shadow:0_0_10px_rgba(255,255,255,0.12)] " +
  "[transition:color_160ms_ease,background_160ms_ease,border-color_160ms_ease,transform_160ms_ease,box-shadow_160ms_ease] " +
  "hover:scale-110 hover:border-white hover:bg-white hover:text-black hover:[box-shadow:0_0_14px_rgba(255,255,255,0.35)] " +
  "focus:[outline:none] focus-visible:border-white focus-visible:bg-white focus-visible:text-black " +
  "max-lg:h-[1.4rem] max-lg:w-[1.4rem] upto-420:h-[1.25rem] upto-420:w-[1.25rem] upto-420:border-[1.5px]";

// Opens toward the inside of the page and lines up with the title's outer edge.
const TIP =
  "pointer-events-none absolute bottom-[calc(100%+12px)] z-20 w-max min-w-[230px] max-w-[290px] rounded-[14px] p-4 text-left font-gotham tracking-normal " +
  "border border-white/10 bg-[linear-gradient(180deg,#191919,#0b0b0b)] " +
  "[box-shadow:0_14px_34px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.07)] " +
  "opacity-0 [transform:translateY(6px)_scale(0.97)] [transition:opacity_180ms_ease,transform_220ms_cubic-bezier(.2,.9,.2,1)] " +
  "peer-hover:opacity-100 peer-hover:[transform:none] peer-focus:opacity-100 peer-focus:[transform:none] " +
  "upto-639:left-1/2 upto-639:-translate-x-1/2";

// Titles are only left-aligned in the wide masonry layout; narrower layouts right-align (or centre) them.
// The icon sits on the inner side so the title stays flush with the description below.
const SIDE = {
  left: {
    icon: "above-639:upto-940:order-first",
    tip: "above-940:left-0 above-940:origin-bottom-left above-639:upto-940:right-0 above-639:upto-940:origin-bottom-right",
  },
  right: { icon: "above-639:order-first", tip: "above-639:right-0 above-639:origin-bottom-right" },
};

const LABEL = "mb-2 block text-[0.65rem] font-medium tracking-[1.8px] text-gray-500 uppercase";

const CHIP =
  "inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] py-[3px] pr-2.5 pl-1.5 " +
  "text-[0.78rem] font-medium text-gray-200";

export default function StackInfo({
  children,
  stack,
  period,
  align,
}: {
  children: ReactNode;
  stack: string[];
  period: string;
  align: "left" | "right";
}) {
  const id = useId();
  const ongoing = period.endsWith("Present");
  return (
    <span className="relative inline-flex items-center gap-3 max-lg:gap-2.5">
      <span>{children}</span>
      <button type="button" aria-label="Project details" aria-describedby={id} className={`${ICON} ${SIDE[align].icon}`}>
        <svg viewBox="0 0 16 16" className="h-[62%] w-[62%]" fill="currentColor" aria-hidden="true">
          <rect x="6.6" y="6.6" width="2.8" height="7" rx="1.4" />
          <circle cx="8" cy="3.6" r="1.6" />
        </svg>
      </button>
      <span id={id} role="tooltip" className={`${TIP} ${SIDE[align].tip}`}>
        <span className={LABEL}>Development</span>
        <span className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-[0.88rem] font-medium text-white">
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="2" y="3" width="12" height="11" rx="2" />
              <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" strokeLinecap="round" />
            </svg>
            {period}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-[0.65rem] font-medium tracking-[1px] uppercase ${ongoing ? "text-emerald-300" : "text-gray-500"}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${ongoing ? "animate-pulse bg-emerald-400" : "bg-gray-500"}`} />
            {ongoing ? "Ongoing" : "Done"}
          </span>
        </span>

        <span className="my-3 block h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)]" />

        <span className={LABEL}>Tech Stack</span>
        <span className="flex flex-wrap gap-1.5">
          {stack.map((t) => {
            const logo = STACK_LOGOS[t];
            return (
              <span key={t} className={CHIP}>
                {logo ? (
                  <Image
                    src={`/assets/images/tech/${logo}.svg`}
                    alt=""
                    aria-hidden="true"
                    width={14}
                    height={14}
                    unoptimized
                    className="h-3.5 w-3.5 object-contain"
                  />
                ) : (
                  <span className="mx-[3px] h-2 w-2 rounded-full bg-white/40" />
                )}
                {t}
              </span>
            );
          })}
        </span>
      </span>
    </span>
  );
}
