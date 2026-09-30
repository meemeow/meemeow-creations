"use client";

import { useEffect, useRef } from "react";

export default function ScrollMomentum({ children }: { children: React.ReactNode }) {
  const scrollTarget = useRef(0);
  const currentScroll = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if ("ontouchstart" in window) return;

    const lerpFactor = 0.1;
    const epsilon = 0.5;

    let lastY = 0;

    const animate = () => {
      if (Math.abs(window.scrollY - lastY) > 2) {
        rafId.current = null;
        return;
      }

      const diff = scrollTarget.current - currentScroll.current;

      if (Math.abs(diff) > epsilon) {
        currentScroll.current += diff * lerpFactor;
        window.scrollTo(0, currentScroll.current);
        lastY = window.scrollY;
        rafId.current = requestAnimationFrame(animate);
      } else {
        currentScroll.current = scrollTarget.current;
        rafId.current = null;
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;

      e.preventDefault();

      if (!rafId.current) {
        scrollTarget.current = window.scrollY;
        currentScroll.current = window.scrollY;
        lastY = window.scrollY;
      }

      scrollTarget.current += e.deltaY;

      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget.current = Math.max(0, Math.min(scrollTarget.current, maxScroll));

      if (!rafId.current) {
        rafId.current = requestAnimationFrame(animate);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return <>{children}</>;
}
