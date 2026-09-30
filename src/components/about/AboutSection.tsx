import type { ReactNode } from "react";
import GlowHeading from "@/components/ui/GlowHeading";
import { REVEAL } from "@/lib/reveal";
import { EYEBROW } from "./about-classes";

export type Section = {
  title: string | null;
  content?: ReactNode;
  aside?: ReactNode;
  asideFrom?: "lg" | "xl" | "2xl";
  eyebrow?: boolean;
  eyebrowFull?: boolean;
  video?: string;
};

const BACKGROUNDS = ["bg-[#0f0e0d]", "bg-[#171615]", "bg-[#1e1c1b]"];
const BG_HEX = ["#0f0e0d", "#171615", "#1e1c1b"];
const fadeFrom = (hex: string) => `linear-gradient(to bottom, ${hex} 0%, ${hex}cc 30%, ${hex}55 65%, transparent 100%)`;

const SECTION_OUTER = "mx-auto w-full max-w-[1920px]";
const SECTION_INNER =
  "mx-8 px-6 min-[768px]:mx-12 min-[1024px]:mx-20 min-[1280px]:mx-24 min-[1440px]:mx-28 min-[1600px]:mx-32 upto-639:mx-4 upto-467:px-[12px] " +
  "py-20 max-2xl:py-16 max-lg:py-14 upto-639:py-10 upto-420:py-8";

const HEADING =
  "text-[3rem] leading-[1.1] font-extrabold text-white text-balance " +
  "max-2xl:text-[2.75rem] max-lg:text-[2.5rem] upto-639:text-[2.25rem] upto-420:text-[2rem] upto-376:text-[1.75rem]";

const SHOWCASE_INNER =
  "[transition:min-height_800ms_cubic-bezier(.4,0,.2,1)] group-data-[state=intro]/show:min-h-svh! " +
  "group-data-[state=done]/show:[transition:none]";
const CURTAIN =
  "absolute inset-x-0 top-0 z-10 flex cursor-pointer flex-col items-center justify-center px-6 text-center select-none " +
  "[transition:transform_800ms_cubic-bezier(.4,0,.2,1),opacity_800ms_ease] " +
  "group-data-[state=settled]/show:pointer-events-none " +
  "group-data-[state=settled]/show:[transform:translateY(-30%)] group-data-[state=settled]/show:opacity-0 " +
  "group-data-[state=done]/show:hidden";
const CURTAIN_HINT =
  "absolute inset-x-6 top-[calc(50%+76px)] font-pixel text-[0.65rem] uppercase tracking-[0.12em] text-gray-300 opacity-0 " +
  "[text-shadow:2px_2px_0_rgba(0,0,0,0.75)] max-2xl:top-[calc(50%+62px)] upto-639:top-[calc(50%+40px)] upto-420:text-[0.55rem]";
const FULL_SCREEN = "flex flex-col justify-center lg:min-h-svh";
const FULL_SCREEN_FIRST =
  "flex flex-col justify-center lg:min-h-[calc(100svh-116px)] lg:max-2xl:min-h-[calc(100svh-99px)]";
const OVERLAY_FIRST = "h-[calc(100svh-116px)] max-2xl:h-[calc(100svh-99px)] max-lg:h-[calc(100svh-81px)]";
const OVERLAY_SCALE = "scale-150 max-2xl:scale-125 upto-639:scale-100";

const COPY_STACKED = { lg: "", xl: "max-xl:max-w-[820px]", "2xl": "" };
const ASIDE_ROW = {
  lg: "flex items-center gap-16 max-2xl:gap-12 max-lg:flex-col-reverse max-lg:items-start max-lg:gap-8 upto-639:items-center",
  xl: "flex items-center gap-16 max-2xl:gap-12 max-xl:flex-col-reverse max-xl:items-center max-xl:gap-8",
  "2xl": "flex items-center gap-16 max-2xl:flex-col-reverse max-2xl:items-center max-2xl:gap-10 upto-639:gap-8",
};

const VIDEO_SHADE =
  "pointer-events-none absolute inset-0 " +
  "bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.45)_60%,rgba(0,0,0,0.3)_100%)] upto-768:bg-[rgba(0,0,0,0.55)]";
const ENDING_SCREEN =
  "flex flex-col justify-center min-h-[min(56.25vw,85svh)]! upto-639:min-h-[560px]! upto-420:min-h-[520px]!";

export default function AboutSection({
  section: { title, content, aside, asideFrom = "lg", eyebrow, eyebrowFull, video },
  index: i,
}: {
  section: Section;
  index: number;
}) {
  return (
    <section
      aria-label={title ?? undefined}
      data-showcase={title ? "" : undefined}
      data-state={title ? "intro" : undefined}
      className={`group/show relative overflow-hidden ${BACKGROUNDS[i % BACKGROUNDS.length]} ${i > 0 && !video ? "border-t border-white/[0.08]" : ""}`}
    >
      {video && (
        <>
          <video
            className="pointer-events-none absolute inset-0 h-full w-full object-fill motion-reduce:hidden upto-639:object-cover"
            src={video}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          />
          <div aria-hidden="true" className={VIDEO_SHADE} />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[45%] upto-639:h-[22%]"
            style={{
              background: fadeFrom(BG_HEX[(i - 1 + BG_HEX.length) % BG_HEX.length]),
            }}
          />
        </>
      )}
      <div className={`${SECTION_OUTER} ${video ? "relative" : ""}`}>
        <div
          className={`${SECTION_INNER} ${SHOWCASE_INNER} ${content ? (i === 0 ? FULL_SCREEN_FIRST : title ? FULL_SCREEN : ENDING_SCREEN) : ""} min-h-[320px] max-lg:min-h-[260px] upto-639:min-h-[200px]`}
        >
          <div className={aside ? ASIDE_ROW[asideFrom] : ""}>
            <div className={`w-full min-w-0 flex-1 ${aside ? COPY_STACKED[asideFrom] : ""}`}>
              {title && (
                <div data-showcase-body className={REVEAL}>
                  {i === 0 ? (
                    <p className={`${EYEBROW} max-xl:max-w-none`}>{title}</p>
                  ) : eyebrow ? (
                    <h2 className={eyebrowFull ? `${EYEBROW} max-w-none` : EYEBROW}>{title}</h2>
                  ) : (
                    <h2 className={HEADING}>{title}</h2>
                  )}
                </div>
              )}
              {content && (
                <div data-showcase-body className={title ? REVEAL : ""}>
                  {content}
                </div>
              )}
            </div>
            {aside && (
              <div data-showcase-body className={`${REVEAL} shrink-0`}>
                {aside}
              </div>
            )}
          </div>
        </div>
      </div>
      {title && (
        <div
          aria-hidden="true"
          data-showcase-curtain
          className={`${CURTAIN} ${BACKGROUNDS[i % BACKGROUNDS.length]} ${i === 0 ? OVERLAY_FIRST : "h-svh"}`}
        >
          <div className={OVERLAY_SCALE}>
            <GlowHeading as="div" text={title} wordGap={0.4} />
          </div>
          <p data-showcase-hint className={CURTAIN_HINT}>
            Press or Scroll Down to navigate
          </p>
        </div>
      )}
    </section>
  );
}
