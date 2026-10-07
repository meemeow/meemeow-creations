"use client";

import { useEffect, useRef, useState } from "react";
import WaveText from "@/components/ui/WaveText";
import { projects } from "@/data/projects";
import { REVEAL } from "@/lib/reveal";
import ProjectCard from "./ProjectCard";
import ProjectRow from "./ProjectRow";
import { useProjectReveal, type ProjectView } from "./use-project-reveal";
import ViewToggle from "./ViewToggle";

const META =
  "[transition:transform_220ms_cubic-bezier(.2,.9,.2,1),opacity_220ms_ease] will-change-[transform,opacity] " +
  "upto-639:text-center upto-467:px-2 upto-467:py-1 min-[1024px]:upto-1279:gap-[0.4rem]";

const TITLE =
  "font-rye font-semibold tracking-[0.2px] leading-[1.1] text-[2.25rem] " +
  "max-2xl:text-[1.875rem] max-lg:text-[1.75rem] upto-639:text-[1.625rem] upto-420:text-[1.5rem] upto-376:text-[1.375rem]";

const DESC =
  "font-gotham font-medium text-gray-300 text-[1.0625rem] leading-[1.5] " +
  "max-2xl:text-[1rem] max-lg:text-[0.9375rem] max-lg:leading-[1.45] " +
  "upto-639:text-[0.9rem] upto-420:text-[0.875rem] upto-376:text-[0.8125rem]";

const VISIT =
  "inline-flex cursor-pointer items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-black px-6 py-[0.64rem] font-gotham font-medium text-[1rem] text-white no-underline " +
  "[box-shadow:0_6px_22px_rgba(0,0,0,0.6),0_0_10px_rgba(255,255,255,0.04)_inset] " +
  "[transition:transform_160ms_cubic-bezier(.2,.9,.2,1),box-shadow_160ms_ease,background_160ms_ease,border-color_160ms_ease,color_160ms_ease] " +
  "focus:[outline:none] focus:[box-shadow:0_0_0_3px_rgba(255,230,216,0.12)] active:[transform:scale(0.96)_translateY(2px)] [&:active:not(:focus)]:[box-shadow:0_2px_8px_rgba(0,0,0,0.6)] " +
  "max-2xl:px-5 max-2xl:py-[0.55rem] max-2xl:text-[0.9375rem] max-lg:rounded-lg max-lg:px-4 max-lg:py-2 max-lg:text-[0.9rem] " +
  "upto-639:text-[0.875rem] upto-420:text-[0.85rem] upto-376:text-[0.8rem] " +
  "max-md:min-w-[140px] md:max-[941px]:min-w-[170px] min-[941px]:max-xl:min-w-[150px] xl:min-w-[170px] 2xl:min-w-[180px] " +
  "upto-940:px-7 upto-639:mx-auto upto-639:flex upto-639:w-fit upto-467:my-2 upto-467:py-[0.5rem]";

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
          {projects.map((p) => {
            const isEven = p.id % 2 === 0;
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
                  <div className={`mb-1 ${TITLE}`}>{p.title}</div>
                  <div className={DESC}>{p.desc}</div>
                  <div className="mt-4 max-lg:mt-3">
                    <a
                      aria-label={`Visit ${p.title}`}
                      data-track={p.title}
                      href={p.url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={VISIT}
                    >
                      <WaveText text="Visit Page" />
                    </a>
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
                <div className={`mb-2 ${TITLE}`}>{p.title}</div>
                <div className={`whitespace-pre-line ${DESC}`}>{p.desc}</div>
                <div className="mt-4 max-lg:mt-3">
                  <a
                    aria-label={`Visit ${p.title}`}
                    data-track={p.title}
                    href={p.url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={VISIT}
                  >
                    <WaveText text="Visit page" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
