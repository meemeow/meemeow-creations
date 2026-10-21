"use client";

import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import type { PreviewImage } from "@/data/projects";

type Timer = ReturnType<typeof setTimeout>;

type PreviewCycleOptions = {
  images: PreviewImage[];
  startDelay: number;
  cycleInterval: number;
  fadeMs?: number;
};

export function previewBackground(img: PreviewImage): CSSProperties {
  if (typeof img === "string") return { backgroundImage: `url('${img}')` };
  return { backgroundImage: `url('${img.light}')`, "--dark-src": `url('${img.dark}')` } as CSSProperties;
}

type PreviewCycle = {
  altARef: RefObject<HTMLDivElement | null>;
  altBRef: RefObject<HTMLDivElement | null>;
  start: () => void;
  clear: () => void;
};

export function usePreviewCycle({
  images,
  startDelay,
  cycleInterval,
  fadeMs = 400,
}: PreviewCycleOptions): PreviewCycle {
  const cycleRef = useRef<Timer | null>(null);
  const startRef = useRef<Timer | null>(null);
  const fadeRef = useRef<Timer | null>(null);
  const altARef = useRef<HTMLDivElement | null>(null);
  const altBRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<"a" | "b">("a");

  const setLayerBg = (ref: RefObject<HTMLDivElement | null>, img: PreviewImage) => {
    const layer = ref.current;
    if (!layer) return;
    if (typeof img === "string") {
      layer.style.backgroundImage = `url('${img}')`;
      layer.style.removeProperty("--dark-src");
    } else {
      layer.style.backgroundImage = `url('${img.light}')`;
      layer.style.setProperty("--dark-src", `url('${img.dark}')`);
    }
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
      fadeRef.current = setTimeout(() => hideLayer(prevLayer), fadeMs);

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
        layer.style.removeProperty("--dark-src");
      }
      activeRef.current = "a";
    };
  }, []);

  return { altARef, altBRef, start, clear };
}
