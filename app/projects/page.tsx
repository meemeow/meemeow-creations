"use client";
import "../css/project.css";
import { useState, useRef, useEffect, type MutableRefObject } from "react";

function WaveText({ text }: { text: string }) {
  return (
    <>
      {text.split("").map((ch, i) =>
        ch === " " ? (
          <span key={i} className="glow-letter-space" aria-hidden="true">&nbsp;</span>
        ) : (
          <span key={i} className="wave-char" style={{ animationDelay: `${i * 80}ms` }}>
            {ch}
          </span>
        )
      )}
    </>
  );
}

export default function Projects() {
  const [view, setView] = useState<"masonry" | "stacked">("masonry");
  const masonryRef = useRef<HTMLElement | null>(null);
  const stackedRef = useRef<HTMLElement | null>(null);
  const [showViewToggle, setShowViewToggle] = useState(true);

  const projects = [
    {
      id: 1,
      title: "ePasigLib",
      desc: "A Web & Mobile OPAC and Library System with Record and Circulation Automation using NFC and Barcodes for Pasig City Library ",
      url: "https://epasiglibrary.com/opac/home",
    },
    { id: 2, title: "The Cat Platformer", desc: "A Platforming Game inspired by Mario and Terraria", url: "https://catplatformer.vercel.app/games" },
    { id: 3, title: "Meemeow's GitCafe", desc: "A Simple Coffee Ordering Platform", url: "https://meemeow.github.io/AWD-FINALS/" },
  ];

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
        } catch (e) {
          /* ignore */
        }
      });
    }

    const win = window as unknown as Record<string, any>;
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
      <div className="projects-container max-w-8xl px-6 py-12">
        <header className="flex items-center justify-between mb-12">
          <h2 className="rye-font text-4xl md:text-5xl font-semibold">My Projects</h2>
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
          <section ref={masonryRef} className="flex flex-col gap-30 masonry-list">
            {projects.map((p) => {
              const isEven = p.id % 2 === 0;
              return (
                <article key={p.id} className={`project-item group w-full flex items-center gap-6 ${isEven ? "md:flex-row-reverse" : ""}`}>
                  <ProjectCard p={p} isEven={isEven} />
                  <div className={`w-full md:w-2/5 project-meta ${isEven ? "md:text-left md:pr-4" : "md:text-right md:pl-4"}`}>
                    <div className="rye-font font-semibold mb-1">{p.title}</div>
                    <div className="text-gray-300 gotham-medium">{p.desc}</div>
                    <div className="mt-4">
                      <a aria-label={`Visit ${p.title}`} href={p.url ?? "#"} target="_blank" rel="noopener noreferrer" className="visit-button">
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
              <article key={p.id} className="flex items-center gap-8 project-row">
                <ProjectRow p={p} />
                <div className="w-full md:w-2/5 project-meta text-right">
                  <div className="rye-font font-semibold mb-2">{p.title}</div>
                  <div className="text-gray-300 whitespace-pre-line gotham-medium">{p.desc}</div>
                  <div className="mt-4">
                    <a aria-label={`Visit ${p.title}`} href={p.url ?? "#"} target="_blank" rel="noopener noreferrer" className="visit-button">
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

// Per-project preview and alternate images
const previewMap: Record<number, string> = {
  1: "library_preview.png",
  2: "cat_preview.png",
  3: "cafe_preview.png",
};

const altImagesMap: Record<number, string[]> = {
  1: ["/assets/images/library1.png", "/assets/images/library2.png", "/assets/images/library3.png", "/assets/images/library_preview.png"],
  2: ["/assets/images/cat1.png", "/assets/images/cat2.png", "/assets/images/cat3.png", "/assets/images/cat_preview.png"],
  3: ["/assets/images/cafe1.png", "/assets/images/cafe2.png", "/assets/images/cafe3.png", "/assets/images/cafe_preview.png"],
};

function ProjectCard({ p, isEven }: { p: { id: number; title: string; desc: string; url?: string }; isEven: boolean }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const altARef = useRef<HTMLDivElement | null>(null);
  const altBRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<"a" | "b">("a");

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (cycleRef.current) clearTimeout(cycleRef.current);
      // Ensure any visible alt layers are hidden and their backgrounds cleared
      hideLayer(altARef);
      hideLayer(altBRef);
      if (altARef.current) altARef.current.style.backgroundImage = "";
      if (altBRef.current) altBRef.current.style.backgroundImage = "";
      activeRef.current = "a";
    };
  }, []);

  const altImages = altImagesMap[p.id] ?? [];
  const previewName = previewMap[p.id];
  const hasPreview = !!previewName;

  const setLayerBg = (ref: MutableRefObject<HTMLDivElement | null>, src: string) => {
    if (ref.current) ref.current.style.backgroundImage = `url('${src}')`;
  };

  const showLayer = (ref: MutableRefObject<HTMLDivElement | null>) => {
    if (ref.current) ref.current.classList.add("visible");
  };
  const hideLayer = (ref: MutableRefObject<HTMLDivElement | null>) => {
    if (ref.current) ref.current.classList.remove("visible");
  };

  const triggerCycle = () => {
    if (!altImages.length) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (cycleRef.current) clearTimeout(cycleRef.current);
    let idx = 0;
    setLayerBg(altARef, altImages[0]);
    showLayer(altARef);
    activeRef.current = "a";
    const advance = () => {
      idx = (idx + 1) % altImages.length;
      const nextLayer = activeRef.current === "a" ? altBRef : altARef;
      const prevLayer = activeRef.current === "a" ? altARef : altBRef;
      setLayerBg(nextLayer, altImages[idx]);
      showLayer(nextLayer);
      hideLayer(prevLayer);
      activeRef.current = activeRef.current === "a" ? "b" : "a";
      cycleRef.current = setTimeout(advance, 3000);
    };
    cycleRef.current = setTimeout(advance, 3000);
  };

  const handleClear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (cycleRef.current) clearTimeout(cycleRef.current);
    hideLayer(altARef);
    hideLayer(altBRef);
  };

  return (
    <div className={`flex flex-col md:flex-row items-center gap-6 w-full ${isEven ? "md:flex-row-reverse" : ""}`}>
      <div
        className={`project-card masonry-card w-full md:w-full ${hasPreview ? "library_preview" : ""}`}
        style={hasPreview ? { backgroundImage: `url('/assets/images/${previewName}')` } : undefined}
        onMouseEnter={() => hasPreview && triggerCycle()}
        onMouseLeave={() => hasPreview && handleClear()}
        onTouchStart={() => hasPreview && triggerCycle()}
        onTouchEnd={() => hasPreview && handleClear()}
      >
        {hasPreview && (
          <>
            <div ref={altARef} className="alt-layer" />
            <div ref={altBRef} className="alt-layer" />
          </>
        )}
      </div>
    </div>
  );
}

function ProjectRow({ p }: { p: { id: number; title: string; desc: string; url?: string } }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cycleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null); // NEW: Timer for expansion delay
  const altARef = useRef<HTMLDivElement | null>(null);
  const altBRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<"a" | "b">("a");

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (cycleRef.current) clearTimeout(cycleRef.current);
      if (expandTimerRef.current) clearTimeout(expandTimerRef.current); // NEW: Clear expansion timer
      // Ensure any visible alt layers are hidden and their backgrounds cleared
      hideLayer(altARef);
      hideLayer(altBRef);
      if (altARef.current) altARef.current.style.backgroundImage = "";
      if (altBRef.current) altBRef.current.style.backgroundImage = "";
      activeRef.current = "a";
    };
  }, []);

  const altImages = altImagesMap[p.id] ?? [];
  const previewName = previewMap[p.id];
  const hasPreview = !!previewName;

  const setLayerBg = (ref: MutableRefObject<HTMLDivElement | null>, src: string) => {
    if (ref.current) ref.current.style.backgroundImage = `url('${src}')`;
  };

  const showLayer = (ref: MutableRefObject<HTMLDivElement | null>) => {
    if (ref.current) ref.current.classList.add("visible");
  };
  const hideLayer = (ref: MutableRefObject<HTMLDivElement | null>) => {
    if (ref.current) ref.current.classList.remove("visible");
  };

  const triggerCycle = () => {
    if (!altImages.length) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (cycleRef.current) clearTimeout(cycleRef.current);
    
    let idx = 0;
    setLayerBg(altARef, altImages[0]);
    showLayer(altARef);
    activeRef.current = "a";
    
    const advance = () => {
      idx = (idx + 1) % altImages.length;
      const nextLayer = activeRef.current === "a" ? altBRef : altARef;
      const prevLayer = activeRef.current === "a" ? altARef : altBRef;
      setLayerBg(nextLayer, altImages[idx]);
      showLayer(nextLayer);
      hideLayer(prevLayer);
      activeRef.current = activeRef.current === "a" ? "b" : "a";
      cycleRef.current = setTimeout(advance, 3000);
    };
    
    // Start cycling after 2 seconds (2000ms) instead of 3
    cycleRef.current = setTimeout(advance, 2000);
  };

  const handleClear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (cycleRef.current) clearTimeout(cycleRef.current);
    if (expandTimerRef.current) clearTimeout(expandTimerRef.current); // NEW: Clear expansion timer
    hideLayer(altARef);
    hideLayer(altBRef);
  };

  const handleMouseEnter = () => {
    if (!hasPreview) return;
    
    // Clear any existing timers
    if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
    if (cycleRef.current) clearTimeout(cycleRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Start the image cycle after 2 seconds delay
    expandTimerRef.current = setTimeout(() => {
      triggerCycle();
    }, 2000);
  };

  const handleTouchStart = () => {
    if (!hasPreview) return;
    
    // Clear any existing timers
    if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
    if (cycleRef.current) clearTimeout(cycleRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Start the image cycle after 2 seconds delay
    expandTimerRef.current = setTimeout(() => {
      triggerCycle();
    }, 2000);
  };

  return (
    <div className="w-full md:w-3/5">
      <div
        className={`project-card stacked-card bg-white/5 rounded-xl border-2 border-black/80 ${hasPreview ? "library_preview" : ""}`}
        style={hasPreview ? { backgroundImage: `url('/assets/images/${previewName}')` } : undefined}
        onMouseEnter={handleMouseEnter} // UPDATED: Use new handler
        onMouseLeave={handleClear}
        onTouchStart={handleTouchStart} // UPDATED: Use new handler
        onTouchEnd={handleClear}
      >
        {hasPreview && (
          <>
            <div ref={altARef} className="alt-layer" />
            <div ref={altBRef} className="alt-layer" />
          </>
        )}
      </div>
    </div>
  );
}