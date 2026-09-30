"use client";

import { useEffect, useRef, type RefObject } from "react";

type Timer = ReturnType<typeof setTimeout>;

const FADE_MS = 400;

type PreviewCycleOptions = {
  images: string[];
  startDelay: number;
  cycleInterval: number;
};

type PreviewCycle = {
  altARef: RefObject<HTMLDivElement | null>;
  altBRef: RefObject<HTMLDivElement | null>;
  start: () => void;
  clear: () => void;
};

export function usePreviewCycle({ images, startDelay, cycleInterval }: PreviewCycleOptions): PreviewCycle {
  const cycleRef = useRef<Timer | null>(null);
  const startRef = useRef<Timer | null>(null);
  const fadeRef = useRef<Timer | null>(null);
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

  const setLayerDepth = (ref: RefObject<HTMLDivElement | null>, z: number) => {
    if (ref.current) ref.current.style.zIndex = String(z);
  };

  const clearTimers = () => {
    if (cycleRef.current) clearTimeout(cycleRef.current);
    if (startRef.current) clearTimeout(startRef.current);
    if (fadeRef.current) clearTimeout(fadeRef.current);
  };

  const cycle = () => {
    if (!images.length) return;
    clearTimers();

    let idx = 0;
    setLayerBg(altARef, images[0]);
    setLayerDepth(altARef, 3);
    setLayerDepth(altBRef, 2);
    showLayer(altARef);
    activeRef.current = "a";

    const advance = () => {
      idx = (idx + 1) % images.length;
      const nextLayer = activeRef.current === "a" ? altBRef : altARef;
      const prevLayer = activeRef.current === "a" ? altARef : altBRef;

      setLayerBg(nextLayer, images[idx]);
      setLayerDepth(nextLayer, 3);
      setLayerDepth(prevLayer, 2);
      showLayer(nextLayer);
      fadeRef.current = setTimeout(() => hideLayer(prevLayer), FADE_MS);

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
    const layerA = altARef.current;
    const layerB = altBRef.current;
    return () => {
      clearTimers();
      for (const layer of [layerA, layerB]) {
        if (!layer) continue;
        layer.classList.remove("visible");
        layer.style.backgroundImage = "";
      }
      activeRef.current = "a";
    };
  }, []);

  return { altARef, altBRef, start, clear };
}
