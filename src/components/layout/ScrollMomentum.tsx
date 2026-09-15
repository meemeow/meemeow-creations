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

    const animate = () => {
      // Linear Interpolation: Move a percentage of the distance to the target
      const diff = scrollTarget.current - currentScroll.current;
      
      if (Math.abs(diff) > epsilon) {
        currentScroll.current += diff * lerpFactor;
        window.scrollTo(0, currentScroll.current);
        rafId.current = requestAnimationFrame(animate);
      } else {
        // Snap to target and stop loop
        currentScroll.current = scrollTarget.current;
        rafId.current = null;
      }
    };

    const onWheel = (e: WheelEvent) => {
      // Prevent the browser's default "stuttery" scroll
      e.preventDefault();

      // Initialize positions on first scroll
      if (scrollTarget.current === 0 && window.scrollY !== 0) {
        scrollTarget.current = window.scrollY;
        currentScroll.current = window.scrollY;
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