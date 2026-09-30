"use client";

import { useLayoutEffect, useState, type RefObject } from "react";
import { DESKTOP_ISLAND, islandFor, sameIsland, type IslandBox } from "./island-layout";

export function useIslandLayout(sceneRef: RefObject<HTMLDivElement | null>) {
  const [island, setIsland] = useState<IslandBox>(DESKTOP_ISLAND);

  useLayoutEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const fit = () => {
      const next = islandFor(scene.clientWidth, scene.clientHeight);
      setIsland((prev) => (sameIsland(prev, next) ? prev : next));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(scene);
    return () => observer.disconnect();
  }, [sceneRef]);

  return island;
}
