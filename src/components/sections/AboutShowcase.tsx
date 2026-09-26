"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

// Once any section has played, the showcase stays done until a full reload
// (module state survives client-side navigation, not a refresh).
let played = false;

const LIFT_MS = 800; // curtain rise + fade; keep in sync with CURTAIN in about/page.tsx
const BODY_DELAY_MS = 400; // content starts popping in halfway through the curtain fade
const BODY_STAGGER_MS = 90;

const SCROLL_KEYS = new Set(["ArrowDown", "PageDown", "End", " "]);

/**
 * About page section showcase. Each `[data-showcase]` section opens behind a
 * full-screen curtain showing only its heading. Scrolling it into place (the
 * first section: the first scroll down; the rest: when their top reaches the
 * top of the screen) lifts the curtain as it fades while the `[data-showcase-body]`
 * blocks beneath pop in (same animation as the projects page).
 *
 * States on the section's `data-state`: "intro" (server render: curtain down),
 * "settled" (curtain lifting), "done" (no curtain, no animation). The page's
 * classes key off these.
 */
export default function AboutShowcase({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-showcase]"));
    const bodies = (s: HTMLElement) => Array.from(s.querySelectorAll<HTMLElement>("[data-showcase-body]"));

    const showInstantly = (s: HTMLElement) => {
      s.dataset.state = "done";
      bodies(s).forEach((b) => b.classList.add("in-view", "already-seen"));
    };

    // Already played this load, or reduced motion. (Scroll position is checked a
    // frame later: arriving from a scrolled page, Next only resets it to the top
    // after this effect runs.)
    if (played || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sections.forEach(showInstantly);
      played = true;
      return;
    }

    const pending: HTMLElement[] = [...sections];
    const timers: number[] = [];
    let lockedUntil = 0;
    const locked = () => performance.now() < lockedUntil;

    const settle = (s: HTMLElement, snap: boolean) => {
      pending.splice(pending.indexOf(s), 1);
      played = true;
      // Hold scrolling while the curtain lifts so the reveal plays in full view.
      lockedUntil = performance.now() + LIFT_MS;
      if (snap) window.scrollTo(0, s.getBoundingClientRect().top + window.scrollY);
      s.dataset.state = "settled";
      bodies(s).forEach((b, k) => {
        timers.push(window.setTimeout(() => b.classList.add("in-view"), BODY_DELAY_MS + k * BODY_STAGGER_MS));
      });
    };

    const first = sections[0];
    const firstWaiting = () => pending.includes(first) && window.scrollY <= 1;

    // Capture phase so this runs before ScrollMomentum's wheel handler.
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      if (locked()) {
        e.preventDefault();
        e.stopImmediatePropagation();
      } else if (e.deltaY > 0 && firstWaiting()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        settle(first, false);
      }
    };

    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (locked()) {
        e.preventDefault();
      } else if (touchY - e.touches[0].clientY > 10 && firstWaiting()) {
        e.preventDefault();
        settle(first, false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (!SCROLL_KEYS.has(e.key)) return;
      if (locked()) {
        e.preventDefault();
      } else if (firstWaiting()) {
        e.preventDefault();
        settle(first, false);
      }
    };

    // Catches scrollbar drags for the first section, and every later section as
    // its top reaches the top of the screen (topmost first).
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (pending.includes(first) && window.scrollY > 1) {
          settle(first, false);
          return;
        }
        const next = pending.find((s) => s !== first && s.getBoundingClientRect().top <= 0);
        if (next) settle(next, true);
      });
    };

    // Still scrolled down once navigation has settled: the browser restored a
    // mid-page position (e.g. a refresh), so skip the showcase.
    const restoreCheck = requestAnimationFrame(() => {
      if (window.scrollY > 10) {
        pending.splice(0).forEach(showInstantly);
        played = true;
      }
    });

    window.addEventListener("wheel", onWheel, { capture: true, passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      cancelAnimationFrame(restoreCheck);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <main ref={rootRef} className="text-white">
      {children}
    </main>
  );
}
