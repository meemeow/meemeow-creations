"use client";
import { useState, useRef, useEffect } from "react";
import ProjectCard from "@/components/sections/ProjectCard";
import ProjectRow from "@/components/sections/ProjectRow";
import WaveText from "@/components/sections/WaveText";
import { projects } from "@/data/projects";
import { REVEAL } from "@/hooks/use-scroll-reveal";

// Title / description / button block beside each card. Lifts slightly when the project is hovered (>940px).
const META =
  "[transition:transform_220ms_cubic-bezier(.2,.9,.2,1),opacity_220ms_ease] will-change-[transform,opacity] " +
  "upto-639:text-center upto-467:px-2 upto-467:py-1 min-[1024px]:upto-1279:gap-[0.4rem]";

// Type steps down on the same tiers as the navbar and footer: 2xl (1536px),
// lg (1024px), then the footer's small-phone stops at 639 / 420 / 376px.
const TITLE =
  "font-rye font-semibold tracking-[0.2px] leading-[1.1] text-[2.25rem] " +
  "max-2xl:text-[1.875rem] max-lg:text-[1.75rem] upto-639:text-[1.625rem] upto-420:text-[1.5rem] upto-376:text-[1.375rem]";

const DESC =
  "font-gotham font-medium text-gray-300 text-[1.0625rem] leading-[1.5] " +
  "max-2xl:text-[1rem] max-lg:text-[0.9375rem] max-lg:leading-[1.45] " +
  "upto-639:text-[0.9rem] upto-420:text-[0.875rem] upto-376:text-[0.8125rem]";

// Black "Visit Page" pill (same visual language as the contact submit button).
// Sized on the navbar tiers; 70% wide and centered on small screens, full-width block ≤467px.
const VISIT =
  "inline-flex cursor-pointer items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-black px-6 py-[0.64rem] font-gotham font-medium text-[1rem] text-white no-underline " +
  "[box-shadow:0_6px_22px_rgba(0,0,0,0.6),0_0_10px_rgba(255,255,255,0.04)_inset] " +
  "[transition:transform_160ms_cubic-bezier(.2,.9,.2,1),box-shadow_160ms_ease,background_160ms_ease,border-color_160ms_ease,color_160ms_ease] " +
  "focus:[outline:none] focus:[box-shadow:0_0_0_3px_rgba(255,230,216,0.12)] active:[transform:scale(0.96)_translateY(2px)] [&:active:not(:focus)]:[box-shadow:0_2px_8px_rgba(0,0,0,0.6)] " +
  "max-2xl:px-5 max-2xl:py-[0.55rem] max-2xl:text-[0.9375rem] max-lg:rounded-lg max-lg:px-4 max-lg:py-2 max-lg:text-[0.9rem] " +
  "upto-639:text-[0.875rem] upto-420:text-[0.85rem] upto-376:text-[0.8rem] " +
  "upto-940:min-w-[120px] upto-940:max-w-[220px] above-467:upto-940:w-[70%] " +
  "above-467:upto-639:mx-auto above-467:upto-639:flex " +
  "upto-467:mx-auto upto-467:my-2 upto-467:block upto-467:w-[90%] upto-467:py-[0.48rem]";

export default function Projects() {
  const [view, setView] = useState<"masonry" | "stacked">("masonry");
  const masonryRef = useRef<HTMLElement | null>(null);
  const stackedRef = useRef<HTMLElement | null>(null);
  const [showViewToggle, setShowViewToggle] = useState(true);

  // Refs for cleanup/timeouts/observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const staggerTimeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    // enforce stacked view and hide toggles on narrow screens
    const handleResize = () => {
      const w = typeof window !== 'undefined' ? window.innerWidth : 0;
      if (w <= 1023) {
        setView('stacked');
        setShowViewToggle(false);
      } else {
        setShowViewToggle(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    // cleanup listener when component unmounts
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Clear previous observer / timeouts whenever view changes
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    staggerTimeoutsRef.current.forEach((t) => clearTimeout(t));
    staggerTimeoutsRef.current = [];

    // Ensure the non-active container has no visible alt layers or background images
    const otherContainer = view === "masonry" ? stackedRef.current : masonryRef.current;
    if (otherContainer) {
      const layers = Array.from(otherContainer.querySelectorAll('.alt-layer')) as HTMLElement[];
      layers.forEach((l) => {
        l.classList.remove('visible');
        try {
          l.style.backgroundImage = '';
        } catch {
          /* ignore */
        }
      });
    }

    const win = window as unknown as Record<string, unknown>;
    const container = view === "masonry" ? masonryRef.current : stackedRef.current;
    if (!container) return;

    const selector = view === "masonry" ? ".project-item" : ".project-row";
    const els = Array.from(container.querySelectorAll(selector)) as HTMLElement[];
    if (!els.length) return;

    if (view === "masonry") {
      // Masonry: animate on scroll. Keep a per-tab flag so we don't repeat on page navigation
      if (win.__projectsAnimated) {
        // Already animated in this tab: mark visible immediately
        els.forEach((el) => el.classList.add("in-view", "already-seen"));
        return;
      }

      // Ensure stale classes are removed so observer can animate properly
      els.forEach((el) => el.classList.remove("in-view", "already-seen"));

      const obs = new IntersectionObserver(
        (entries, obsInstance) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              // mark that we've animated at least once in this tab
              win.__projectsAnimated = true;
              obsInstance.unobserve(entry.target);
            }
          });
        },
        // Pop in as soon as a project peeks into view. A percentage margin hid
        // projects already sitting in the empty space at the bottom of shorter
        // viewports, so nothing hinted there was more to scroll to.
        { root: null, rootMargin: "0px 0px -48px 0px", threshold: 0 }
      );

      els.forEach((el) => obs.observe(el));
      observerRef.current = obs;
    } else {
      // Stacked: always run a "pop-in" animation when switching to stacked view.
      // Stagger the pop for each row. We add the class 'in-view' with a small delay per item.
      els.forEach((el) => el.classList.remove("in-view", "already-seen"));

      els.forEach((el, i) => {
        const t = window.setTimeout(() => {
          el.classList.add("in-view");
        }, i * 80 + 40); // small stagger + slight delay
        staggerTimeoutsRef.current.push(t);
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      staggerTimeoutsRef.current.forEach((t) => clearTimeout(t));
      staggerTimeoutsRef.current = [];
    };
  }, [view]);

  return (
    <main className="min-h-screen bg-[#191b1dff] text-white">
      {/* Content stops growing past 1920px, so zoomed-out (and ultra-wide)
          viewports keep the 1920px layout centered instead of stretching. */}
      <div className="mx-auto w-full max-w-[1920px]">
      <div className="mx-8 px-6 py-12 max-2xl:py-10 max-lg:py-8 upto-420:py-6 [transition:margin-inline_220ms_ease,padding_220ms_ease] upto-639:mx-4 min-[768px]:mx-12 min-[1024px]:mx-20 min-[1280px]:mx-24 min-[1440px]:mx-28 min-[1600px]:mx-32 upto-467:px-[12px]">
        <header className="mb-12 flex items-center justify-between max-2xl:mb-10 max-lg:mb-8 upto-420:mb-6 upto-376:justify-center">
          <h2 className="font-rye text-[3rem] leading-[1.1] font-semibold max-2xl:text-[2.75rem] max-lg:text-[2.5rem] upto-639:text-[2.25rem] upto-420:text-[2rem] upto-376:w-full upto-376:text-[1.75rem] upto-376:text-center">
            My Projects
          </h2>
          {showViewToggle && (
            <div className="flex items-center gap-3">
            <button
              aria-pressed={view === "masonry"}
              onClick={() => setView("masonry")}
              className={`p-2 rounded-lg border-2 ${view === "masonry" ? "bg-white/10 border-white" : "border-white/20"}`}
              title="Masonry view"
            >
              {/* masonry icon: tall left tile + stacked right tiles */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white h-8 w-8 max-2xl:h-7 max-2xl:w-7" aria-hidden="true">
                <rect x="2" y="4" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="16" y="4" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="2" y="10" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="10" y="10" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="2" y="16" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="16" y="16" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>

            <button
              aria-pressed={view === "stacked"}
              onClick={() => setView("stacked")}
              className={`p-2 rounded-lg border-2 ${view === "stacked" ? "bg-white/10 border-white" : "border-white/20"}`}
              title="Stacked list view"
            >
              {/* list icon */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white h-8 w-8 max-2xl:h-7 max-2xl:w-7">
                <rect x="3" y="4" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="17" y="4" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="3" y="10" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="17" y="10" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="3" y="16" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="17" y="16" width="4" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            </div>
          )}
        </header>

        {/* Content */}
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
                      <a aria-label={`Visit ${p.title}`} href={p.url ?? "#"} target="_blank" rel="noopener noreferrer" className={VISIT}>
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
                <div className={`${META} w-full text-right above-940:w-2/5 above-940:[.project-row:hover_&]:[transform:translateY(-6px)]`}>
                  <div className={`mb-2 ${TITLE}`}>{p.title}</div>
                  <div className={`whitespace-pre-line ${DESC}`}>{p.desc}</div>
                  <div className="mt-4 max-lg:mt-3">
                    <a aria-label={`Visit ${p.title}`} href={p.url ?? "#"} target="_blank" rel="noopener noreferrer" className={`${VISIT}`}>
                      <WaveText text="Visit page" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
      </div>
    </main>
  );
}
