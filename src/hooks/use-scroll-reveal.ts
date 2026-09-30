"use client";

import { useEffect, type RefObject } from "react";

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
      { root: null, rootMargin: "0px 0px -48px 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [containerRef, tabFlag]);
}
