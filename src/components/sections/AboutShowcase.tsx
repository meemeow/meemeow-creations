"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

// Once any section has played, the showcase stays done until a full reload
// (module state survives client-side navigation, not a refresh).
let played = false;

const LIFT_MS = 800; // curtain rise + fade; keep in sync with CURTAIN in about/page.tsx
const BODY_DELAY_MS = 400; // content starts popping in halfway through the curtain fade
const BODY_STAGGER_MS = 90;
const HINT_IDLE_MS = 10000; // no scrolling, pressing or keys for this long shows the hint
const HINT_BLINK_MS = 3000; // one slow fade in and out

const SCROLL_KEYS = new Set(["ArrowDown", "PageDown", "End", " "]);

/**
 * About page section showcase. Each `[data-showcase]` section opens behind a
 * full-screen curtain showing only its heading. Scrolling it into place (the
 * first section: the first scroll down; the rest: when their top reaches the
 * top of the screen) or pressing the curtain (`[data-showcase-curtain]`, so phones
 * can tap it) lifts it as it fades while the `[data-showcase-body]` blocks beneath
 * pop in (same animation as the projects page). After a while without input, each
 * waiting curtain's `[data-showcase-hint]` blinks slowly until the next input.
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

    // Idle hint: every input hides it and restarts the countdown.
    let hintTimer = 0;
    const blinks: Animation[] = [];
    const hideHints = () => blinks.splice(0).forEach((a) => a.cancel());
    const showHints = () => {
      pending.forEach((s) => {
        const hint = s.querySelector<HTMLElement>("[data-showcase-hint]");
        if (hint) {
          blinks.push(
            hint.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], {
              duration: HINT_BLINK_MS,
              iterations: Infinity,
              easing: "ease-in-out",
            })
          );
        }
      });
    };
    const resetIdle = () => {
      hideHints();
      clearTimeout(hintTimer);
      if (pending.length) hintTimer = window.setTimeout(showHints, HINT_IDLE_MS);
    };

    const settle = (s: HTMLElement, snap: boolean) => {
      pending.splice(pending.indexOf(s), 1);
      resetIdle();
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

    // Pressing a curtain lifts it like scrolling would; later sections also snap
    // into place, as when their top reaches the top of the screen.
    const presses = sections.map((s) => {
      const onPress = () => {
        if (!locked() && pending.includes(s)) settle(s, s !== first);
      };
      s.querySelector("[data-showcase-curtain]")?.addEventListener("click", onPress);
      return () => s.querySelector("[data-showcase-curtain]")?.removeEventListener("click", onPress);
    });

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
    const IDLE_EVENTS = ["wheel", "touchstart", "pointerdown", "keydown", "scroll"] as const;
    IDLE_EVENTS.forEach((type) => window.addEventListener(type, resetIdle, { passive: true }));
    resetIdle();

    return () => {
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      IDLE_EVENTS.forEach((type) => window.removeEventListener(type, resetIdle));
      presses.forEach((off) => off());
      clearTimeout(hintTimer);
      hideHints();
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
