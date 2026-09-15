"use client";

import { useEffect, useRef } from "react";

export default function ScrollMomentum({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ref to track the "intended" scroll position
  const scrollTarget = useRef(0);
  const currentScroll = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Disable on touch devices (they have native momentum)
    if ("ontouchstart" in window) return;

    // Settings
    const lerpFactor = 0.1; // Smoothness: Lower = heavier/smoother (0.05 - 0.15)
    const epsilon = 0.5;    // Threshold to stop the animation

    // Where our last scrollTo actually put the page, to notice scrolls we didn't make
    let lastY = 0;

    const animate = () => {
      // Something else moved the page mid-animation (a page change scrolling to
      // the top, the scrollbar, keyboard): stop instead of dragging it back.
      if (Math.abs(window.scrollY - lastY) > 2) {
        rafId.current = null;
        return;
      }

      // Linear Interpolation: Move a percentage of the distance to the target
      const diff = scrollTarget.current - currentScroll.current;

      if (Math.abs(diff) > epsilon) {
        currentScroll.current += diff * lerpFactor;
        window.scrollTo(0, currentScroll.current);
        lastY = window.scrollY;
        rafId.current = requestAnimationFrame(animate);
      } else {
        // Snap to target and stop loop
        currentScroll.current = scrollTarget.current;
        rafId.current = null;
      }
    };

    const onWheel = (e: WheelEvent) => {
      // Ctrl/Cmd + wheel (and trackpad pinch, which browsers send as ctrl+wheel)
      // is the browser's zoom gesture — let it through untouched.
      if (e.ctrlKey || e.metaKey) return;

      // Prevent the browser's default "stuttery" scroll
      e.preventDefault();

      // Start each new scroll from where the page really is. The remembered
      // position can be stale (e.g. from the previous page), which made the
      // first scroll after navigating jump far down.
      if (!rafId.current) {
        scrollTarget.current = window.scrollY;
        currentScroll.current = window.scrollY;
        lastY = window.scrollY;
      }

      // Accumulate the scroll delta
      scrollTarget.current += e.deltaY;

      // Clamp the target to page boundaries
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget.current = Math.max(0, Math.min(scrollTarget.current, maxScroll));

      // Start the animation loop if it's not running
      if (!rafId.current) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    // Note: { passive: false } is required to use e.preventDefault()
    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return <>{children}</>;
}