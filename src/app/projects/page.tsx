"use client";
import { useState, useRef, useEffect } from "react";
import ProjectCard from "@/components/sections/ProjectCard";
import ProjectRow from "@/components/sections/ProjectRow";
import WaveText from "@/components/sections/WaveText";
import { projects } from "@/data/projects";

// Each project pops in (fade + slide up) when the page adds `in-view`;
// `already-seen` shows it instantly when returning within the same tab.
const REVEAL =
  "opacity-0 will-change-[transform,opacity] [transform:translateY(18px)] [transition:transform_420ms_ease-out,opacity_420ms_ease] " +
  "[&.in-view]:opacity-100 [&.in-view:not(.already-seen)]:[transform:translateY(0)] " +
  "[&.already-seen]:opacity-100 [&.already-seen]:[transform:translateY(0)_scale(1)] [&.already-seen]:[transition:none]";

// Title / description / button block beside each card. Lifts slightly when the project is hovered (>940px).
const META =
  "[transition:transform_220ms_cubic-bezier(.2,.9,.2,1),opacity_220ms_ease] will-change-[transform,opacity] " +
  "upto-639:text-center upto-467:px-2 upto-467:py-1 min-[1024px]:upto-1279:gap-[0.4rem]";

// Project title and description scale down fluidly on mid-size and small screens.
const TITLE =
  "font-rye font-semibold text-[2.2rem] tracking-[0.2px] " +
  "upto-940:text-[clamp(2.1rem,2.4vw+1rem,2.4rem)] upto-940:leading-[1.05] " +
  "min-[1024px]:upto-1279:text-[clamp(1.4rem,1vw+0.9rem,1.9rem)] above-1279:upto-1439:text-[clamp(1.6rem,1.2vw+1rem,2rem)]";
const TITLE_STACKED = "min-[941px]:upto-1023:text-[clamp(1.3rem,2.1rem+0.85rem,1.54rem)]";

const DESC =
  "font-gotham font-medium text-gray-300 text-[1.0625rem] leading-[1.5] " +
  "upto-940:text-[clamp(0.88rem,0.6vw+0.56rem,1rem)] upto-940:leading-[1.45] " +
  "min-[1024px]:upto-1279:text-[clamp(0.8rem,0.6vw+0.55rem,0.95rem)] min-[1024px]:upto-1279:leading-[1.4] " +
  "above-1279:upto-1439:text-[clamp(0.875rem,0.8vw+0.6rem,1rem)] above-1279:upto-1439:leading-[1.45]";
const DESC_STACKED = "min-[941px]:upto-1023:text-[clamp(0.78rem,0.5vw+0.56rem,0.92rem)] min-[941px]:upto-1023:leading-[1.42]";

// Black "Visit Page" pill (same visual language as the contact submit button).
// Compact at 1024–1279px, 70% wide and centered on small screens, full-width block ≤467px.
const VISIT =
  "inline-flex cursor-pointer items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.08)] bg-black px-6 py-[0.64rem] font-gotham font-medium text-white no-underline " +
  "[box-shadow:0_6px_22px_rgba(0,0,0,0.6),0_0_10px_rgba(255,255,255,0.04)_inset] " +
  "[transition:transform_160ms_cubic-bezier(.2,.9,.2,1),box-shadow_160ms_ease,background_160ms_ease,border-color_160ms_ease,color_160ms_ease] " +
  "focus:[outline:none] focus:[box-shadow:0_0_0_3px_rgba(255,230,216,0.12)] active:[transform:scale(0.96)_translateY(2px)] [&:active:not(:focus)]:[box-shadow:0_2px_8px_rgba(0,0,0,0.6)] " +
  "min-[1024px]:upto-1279:rounded-lg min-[1024px]:upto-1279:px-4 min-[1024px]:upto-1279:py-2 min-[1024px]:upto-1279:text-[clamp(0.85rem,0.4vw+0.7rem,0.95rem)] " +
  "upto-940:min-w-[120px] upto-940:max-w-[220px] above-467:upto-940:w-[70%] above-467:upto-940:px-[0.9rem] above-467:upto-940:py-[0.65rem] above-467:upto-940:text-[0.95rem] " +
  "above-467:upto-639:mx-auto above-467:upto-639:flex " +
  "upto-467:mx-auto upto-467:my-2 upto-467:block upto-467:w-[90%] upto-467:px-[0.7rem] upto-467:py-[0.48rem] upto-467:text-[0.85rem]";
const VISIT_STACKED =
  "min-[941px]:upto-1023:rounded-lg min-[941px]:upto-1023:px-[0.9rem] min-[941px]:upto-1023:py-[0.45rem] min-[941px]:upto-1023:text-[clamp(0.8rem,0.36vw+0.68rem,0.95rem)]";

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
        { root: null, rootMargin: "0px 0px -25% 0px", threshold: 0 }
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
      <div className="max-w-8xl mx-8 px-6 py-12 [transition:margin-inline_220ms_ease,padding_220ms_ease] upto-639:mx-4 min-[768px]:mx-12 min-[1024px]:mx-20 min-[1280px]:mx-24 min-[1440px]:mx-28 min-[1600px]:mx-32 min-[1920px]:mx-36 min-[2560px]:mx-42 min-[3200px]:mx-48 upto-467:px-[12px]">
        <header className="mb-12 flex items-center justify-between upto-467:mb-[0.9rem] upto-376:justify-center">
          <h2 className="font-rye text-4xl font-semibold md:text-5xl min-[941px]:upto-1023:text-[clamp(2.5rem,2.4vw+1rem,3rem)]! min-[941px]:upto-1023:leading-[1.08]! min-[1024px]:upto-1279:text-[clamp(2.6rem,2.4vw+1rem,3rem)]! min-[1024px]:upto-1279:leading-[1.06]! upto-467:mb-[24px] upto-376:w-full upto-376:text-center">
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
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white w-7 h-7 md:w-8 md:h-8" aria-hidden="true">
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
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white w-7 h-7 md:w-8 md:h-8">
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
                    <div className="mt-4">
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
                  <div className={`mb-2 ${TITLE} ${TITLE_STACKED}`}>{p.title}</div>
                  <div className={`whitespace-pre-line ${DESC} ${DESC_STACKED}`}>{p.desc}</div>
                  <div className="mt-4">
                    <a aria-label={`Visit ${p.title}`} href={p.url ?? "#"} target="_blank" rel="noopener noreferrer" className={`${VISIT} ${VISIT_STACKED}`}>
                      <WaveText text="Visit page" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
