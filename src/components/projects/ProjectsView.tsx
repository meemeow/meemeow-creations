"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { projects, type Project } from "@/data/projects";
import { INTRO_SLOT_BUTTON } from "@/components/about/about-classes";
import { REVEAL } from "@/lib/reveal";
import ProjectCard from "./ProjectCard";
import ProjectRow from "./ProjectRow";
import StackInfo from "./StackInfo";
import { useProjectReveal, type ProjectView } from "./use-project-reveal";
import ViewToggle from "./ViewToggle";

const META =
  "[transition:transform_220ms_cubic-bezier(.2,.9,.2,1),opacity_220ms_ease] will-change-[transform,opacity] " +
  "upto-639:text-center upto-467:px-2 upto-467:py-1 min-[1024px]:upto-1279:gap-[0.4rem]";

const TITLE_BASE = "font-rye font-semibold tracking-[0.2px] leading-[1.1] ";

const TITLE =
  TITLE_BASE +
  "text-[2.25rem] max-2xl:text-[1.875rem] max-lg:text-[1.75rem] upto-639:text-[1.625rem] upto-420:text-[1.5rem] upto-376:text-[1.375rem]";

// Titles this long wrap to two lines at the normal size in the masonry view, so they get a smaller one to stay on one line.
const LONG_TITLE_CHARS = 18;
const TITLE_LONG =
  TITLE_BASE +
  "text-[1.875rem] max-2xl:text-[1.625rem] max-lg:text-[1.5rem] upto-639:text-[1.5rem] upto-420:text-[1.375rem] upto-376:text-[1.25rem]";

const titleClass = (title: string) => (title.length >= LONG_TITLE_CHARS ? TITLE_LONG : TITLE);

const DESC =
  "font-gotham font-medium text-gray-300 text-[1.0625rem] leading-[1.5] " +
  "max-2xl:text-[1rem] max-lg:text-[0.9375rem] max-lg:leading-[1.45] " +
  "upto-639:text-[0.9rem] upto-420:text-[0.875rem] upto-376:text-[0.8125rem]";

// The About page's "Download Resume" pixel button, just shorter so it doesn't crowd the project text.
const VISIT_BASE =
  INTRO_SLOT_BUTTON.replace("h-12", "h-11").replace("max-lg:h-11", "max-lg:h-10") +
  " upto-639:mx-auto upto-639:flex upto-639:w-fit upto-467:my-2";

// Less left padding, since the round compass already leaves empty space on that side, and a touch more room before the label.
const VISIT = `${VISIT_BASE.replace(" gap-3 ", " gap-[13px] ").replace("max-2xl:gap-2 ", "max-2xl:gap-[9px] ")} pl-4 max-2xl:pl-2.5`;

// The compass sprite has more empty space around it than the About page items, so it runs a bit bigger than BUTTON_ICON.
// The all-caps pixel label sits above the button's middle, so the compass is lifted 2px to line up with it.
const VISIT_ICON =
  "mr-0.5 h-7 w-7 shrink-0 -translate-y-0.5 [image-rendering:pixelated] max-lg:h-6 max-lg:w-6 upto-420:h-[22px] upto-420:w-[22px]";

// No compass on the pending button, so it keeps the original even padding.
const PENDING = `${VISIT_BASE} pointer-events-none opacity-60`;

function VisitButton({ p, label }: { p: Project; label: string }) {
  if (p.inProgress) {
    return (
      <span aria-disabled="true" className={PENDING}>
        In Progress
      </span>
    );
  }
  return (
    <a
      aria-label={`Visit ${p.title}`}
      data-track={p.title}
      href={p.url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={VISIT}
    >
      {/* Animated GIF, so it's served as-is rather than through the image optimizer. */}
      <Image
        src="/assets/images/mc-compass.gif"
        alt=""
        aria-hidden="true"
        width={160}
        height={160}
        unoptimized
        className={VISIT_ICON}
      />
      {label}
    </a>
  );
}

export default function ProjectsView() {
  const [view, setView] = useState<ProjectView>("masonry");
  const [showViewToggle, setShowViewToggle] = useState(true);
  const masonryRef = useRef<HTMLElement | null>(null);
  const stackedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1023) {
        setView("stacked");
        setShowViewToggle(false);
      } else {
        setShowViewToggle(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useProjectReveal(view, masonryRef, stackedRef);

  return (
    <>
      <header className="mb-12 flex items-center justify-between max-2xl:mb-10 max-lg:mb-8 upto-420:mb-6 upto-376:justify-center">
        <h1 className="font-rye text-[3rem] leading-[1.1] font-semibold max-2xl:text-[2.75rem] max-lg:text-[2.5rem] upto-639:text-[2.25rem] upto-420:text-[2rem] upto-376:w-full upto-376:text-[1.75rem] upto-376:text-center">
          My Projects
        </h1>
        {showViewToggle && <ViewToggle view={view} onChange={setView} />}
      </header>

      {view === "masonry" ? (
        <section
          ref={masonryRef}
          className="flex flex-col gap-[240px] [transition:gap_260ms_ease] min-[1024px]:upto-1439:gap-[clamp(120px,calc(120px+(100vw-1024px)*0.2884615385),240px)]"
        >
          {projects.map((p, i) => {
            const isEven = i % 2 === 1;
            return (
              <article
                key={p.id}
                className={`project-item group flex w-full items-center gap-6 ${REVEAL} min-[768px]:px-[2px] min-[768px]:py-[6px] upto-940:flex-col upto-940:items-stretch upto-467:gap-4 ${isEven ? "above-940:flex-row-reverse" : ""}`}
              >
                <ProjectCard p={p} isEven={isEven} />
                <div
                  className={`${META} w-full md:w-2/5 above-639:upto-940:text-right above-940:[.project-item:hover_&]:[transform:translateY(-6px)] ${
                    isEven ? "md:pr-4 above-940:text-left" : "md:pl-4 above-940:text-right"
                  }`}
                >
                  <div className={`mb-1 ${titleClass(p.title)}`}>
                    <StackInfo stack={p.stack} period={p.period} align={isEven ? "left" : "right"}>
                      {p.title}
                    </StackInfo>
                  </div>
                  <div className={DESC}>{p.desc}</div>
                  <div className="mt-4 max-lg:mt-3">
                    <VisitButton p={p} label="Visit Page" />
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section ref={stackedRef} className="flex flex-col gap-8">
          {projects.map((p) => (
            <article
              key={p.id}
              className={`project-row flex items-center gap-8 ${REVEAL} upto-940:flex-col upto-940:items-stretch upto-467:gap-4`}
            >
              <ProjectRow p={p} />
              <div
                className={`${META} w-full text-right above-940:w-2/5 above-940:[.project-row:hover_&]:[transform:translateY(-6px)]`}
              >
                <div className={`mb-2 ${TITLE}`}>
                  <StackInfo stack={p.stack} period={p.period} align="right">
                    {p.title}
                  </StackInfo>
                </div>
                <div className={`whitespace-pre-line ${DESC}`}>{p.desc}</div>
                <div className="mt-4 max-lg:mt-3">
                  <VisitButton p={p} label="Visit page" />
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
