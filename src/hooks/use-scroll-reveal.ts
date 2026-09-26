"use client";

import { useEffect, type RefObject } from "react";

// Each block pops in (fade + slide up) when `in-view` is added;
// `already-seen` shows it instantly when returning within the same tab.
export const REVEAL =
  "opacity-0 will-change-[transform,opacity] [transform:translateY(18px)] [transition:transform_420ms_ease-out,opacity_420ms_ease] " +
  "[&.in-view]:opacity-100 [&.in-view:not(.already-seen)]:[transform:translateY(0)] " +
  "[&.already-seen]:opacity-100 [&.already-seen]:[transform:translateY(0)_scale(1)] [&.already-seen]:[transition:none]";

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
