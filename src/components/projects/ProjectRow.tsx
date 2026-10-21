"use client";

import { previewBackground, usePreviewCycle } from "@/hooks/use-preview-cycle";
import { usePreviewTilt } from "@/hooks/use-preview-tilt";
import { altImagesMap, previewMap, type Project } from "@/data/projects";
import { ALT_LAYER, CARD_SHELL, SHINE, SPLIT_DARK, WIPE_LAYER, WIPE_MS, cardBackground } from "./project-card-classes";

const STACKED_CARD =
  "h-auto aspect-[16/8] [transition:transform_200ms_ease,box-shadow_200ms_ease] " +
  "[.project-row:hover_&]:[transform:translateY(-4px)] [.project-row:hover_&]:[box-shadow:0_18px_36px_rgba(0,0,0,0.6)] " +
  "upto-940:w-full upto-940:max-w-full above-467:upto-940:mx-auto above-467:upto-940:min-h-48 upto-467:min-h-32 " +
  "[&:hover]:after:absolute [&:hover]:after:right-[10px] [&:hover]:after:bottom-[10px] [&:hover]:after:z-3 [&:hover]:after:h-[12px] [&:hover]:after:w-[12px] " +
  "[&:hover]:after:rounded-[50%] [&:hover]:after:bg-[rgba(255,255,255,0.4)] [&:hover]:after:opacity-0 [&:hover]:after:animate-indicator-in [&:hover]:after:content-['']";

export default function ProjectRow({ p, className = "w-full above-940:w-3/5" }: { p: Project; className?: string }) {
  const altImages = altImagesMap[p.id] ?? [];
  const preview = previewMap[p.id];
  const hasPreview = !!preview;
  const isSplit = hasPreview && typeof preview !== "string";
  const layerClass = isSplit ? WIPE_LAYER : ALT_LAYER;

  const { altARef, altBRef, start, clear } = usePreviewCycle({
    images: altImages,
    startDelay: isSplit ? 5000 : 2000,
    cycleInterval: isSplit ? 5000 : 2000,
    fadeMs: isSplit ? WIPE_MS : undefined,
  });
  const tilt = usePreviewTilt(isSplit);

  return (
    <div className={className}>
      <div
        className={`${CARD_SHELL} ${cardBackground(hasPreview, false)} ${isSplit ? SPLIT_DARK : ""} ${STACKED_CARD}`}
        style={hasPreview ? previewBackground(preview) : undefined}
        onMouseEnter={() => hasPreview && start()}
        onMouseLeave={clear}
        onTouchStart={() => hasPreview && start()}
        onTouchEnd={clear}
        {...tilt}
      >
        {hasPreview && (
          <>
            <div ref={altARef} className={layerClass} />
            <div ref={altBRef} className={layerClass} />
          </>
        )}
        {isSplit && <span className={SHINE} aria-hidden="true" />}
      </div>
    </div>
  );
}
