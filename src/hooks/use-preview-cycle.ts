"use client";

import { useEffect, useRef, type RefObject } from "react";

type Timer = ReturnType<typeof setTimeout>;

type PreviewCycleOptions = {
  /** Alternate images to cross-fade through while the card is hovered. */
  images: string[];
  /** Delay before the first alternate image appears. 0 shows it immediately. */
  startDelay: number;
  /** Time each alternate image stays on screen. */
  cycleInterval: number;
};

type PreviewCycle = {
  altARef: RefObject<HTMLDivElement | null>;
  altBRef: RefObject<HTMLDivElement | null>;
  start: () => void;
  clear: () => void;
};

/**
 * Cross-fades a project card through its alternate screenshots by swapping the
 * background image of two stacked layers. Shared by the masonry and stacked
 * cards, which differ only in how long they wait and how fast they cycle.
 */
export function usePreviewCycle({ images, startDelay, cycleInterval }: PreviewCycleOptions): PreviewCycle {
  const cycleRef = useRef<Timer | null>(null);
  const startRef = useRef<Timer | null>(null);
  const altARef = useRef<HTMLDivElement | null>(null);
  const altBRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<"a" | "b">("a");

  const setLayerBg = (ref: RefObject<HTMLDivElement | null>, src: string) => {
    if (ref.current) ref.current.style.backgroundImage = `url('${src}')`;
  };

  const showLayer = (ref: RefObject<HTMLDivElement | null>) => {
    if (ref.current) ref.current.classList.add("visible");
  };

  const hideLayer = (ref: RefObject<HTMLDivElement | null>) => {
    if (ref.current) ref.current.classList.remove("visible");
  };

  const clearTimers = () => {
    if (cycleRef.current) clearTimeout(cycleRef.current);
    if (startRef.current) clearTimeout(startRef.current);
  };

  const cycle = () => {
    if (!images.length) return;
    clearTimers();

    let idx = 0;
    setLayerBg(altARef, images[0]);
    showLayer(altARef);
    activeRef.current = "a";

    const advance = () => {
      idx = (idx + 1) % images.length;
      const nextLayer = activeRef.current === "a" ? altBRef : altARef;
      const prevLayer = activeRef.current === "a" ? altARef : altBRef;
      setLayerBg(nextLayer, images[idx]);
      showLayer(nextLayer);
      hideLayer(prevLayer);
      activeRef.current = activeRef.current === "a" ? "b" : "a";
      cycleRef.current = setTimeout(advance, cycleInterval);
    };

    cycleRef.current = setTimeout(advance, cycleInterval);
  };

  const start = () => {
    clearTimers();
    if (startDelay > 0) {
      startRef.current = setTimeout(cycle, startDelay);
    } else {
      cycle();
    }
  };

  const clear = () => {
    clearTimers();
    hideLayer(altARef);
    hideLayer(altBRef);
  };

  useEffect(() => {
    return () => {
      clearTimers();
      // Ensure any visible alt layers are hidden and their backgrounds cleared
      hideLayer(altARef);
      hideLayer(altBRef);
      if (altARef.current) altARef.current.style.backgroundImage = "";
      if (altBRef.current) altBRef.current.style.backgroundImage = "";
      activeRef.current = "a";
    };
  }, []);

  return { altARef, altBRef, start, clear };
}
