"use client";

import { useEffect, type RefObject } from "react";

/**
 * Pops in every `[data-reveal]` element inside `containerRef` as it scrolls into view.
 * `tabFlag` is a window key: once anything has animated in this tab, later visits
 * show everything immediately instead of replaying the animation.
 */
export function useScrollReveal(containerRef: RefObject<HTMLElement | null>, tabFlag: string) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const els = Array.from(container.querySelectorAll<HTMLElement>("[data-reveal]"));
    const win = window as unknown as Record<string, unknown>;

    if (win[tabFlag]) {
      els.forEach((el) => el.classList.add("in-view", "already-seen"));
      return;
    }

    const obs = new IntersectionObserver(
      (entries, obsInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            win[tabFlag] = true;
            obsInstance.unobserve(entry.target);
          }
        });
      },
      // Same trigger as the projects page: pop in as soon as a block peeks into view.
      { root: null, rootMargin: "0px 0px -48px 0px", threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [containerRef, tabFlag]);
}
