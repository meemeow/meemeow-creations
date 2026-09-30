"use client";

import { useEffect, useRef, type RefObject } from "react";

export type ProjectView = "masonry" | "stacked";

export function useProjectReveal(
  view: ProjectView,
  masonryRef: RefObject<HTMLElement | null>,
  stackedRef: RefObject<HTMLElement | null>,
) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const staggerTimeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    staggerTimeoutsRef.current.forEach((t) => clearTimeout(t));
    staggerTimeoutsRef.current = [];

    const otherContainer = view === "masonry" ? stackedRef.current : masonryRef.current;
    if (otherContainer) {
      const layers = Array.from(otherContainer.querySelectorAll(".alt-layer")) as HTMLElement[];
      layers.forEach((l) => {
        l.classList.remove("visible");
        try {
          l.style.backgroundImage = "";
        } catch {}
      });
    }

    const win = window as unknown as Record<string, unknown>;
    const container = view === "masonry" ? masonryRef.current : stackedRef.current;
    if (!container) return;

    const selector = view === "masonry" ? ".project-item" : ".project-row";
    const els = Array.from(container.querySelectorAll(selector)) as HTMLElement[];
    if (!els.length) return;

    if (view === "masonry") {
      if (win.__projectsAnimated) {
        els.forEach((el) => el.classList.add("in-view", "already-seen"));
        return;
      }

      els.forEach((el) => el.classList.remove("in-view", "already-seen"));

      const obs = new IntersectionObserver(
        (entries, obsInstance) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              win.__projectsAnimated = true;
              obsInstance.unobserve(entry.target);
            }
          });
        },
        { root: null, rootMargin: "0px 0px -48px 0px", threshold: 0 },
      );

      els.forEach((el) => obs.observe(el));
      observerRef.current = obs;
    } else {
      els.forEach((el) => el.classList.remove("in-view", "already-seen"));

      els.forEach((el, i) => {
        const t = window.setTimeout(
          () => {
            el.classList.add("in-view");
          },
          i * 80 + 40,
        );
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
  }, [view, masonryRef, stackedRef]);
}
