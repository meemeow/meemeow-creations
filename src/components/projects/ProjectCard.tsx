"use client";

import { previewBackground, usePreviewCycle } from "@/hooks/use-preview-cycle";
import { usePreviewTilt } from "@/hooks/use-preview-tilt";
import { altImagesMap, previewMap, type Project } from "@/data/projects";
import {
  ALT_LAYER,
  CARD_SHELL,
  PENDING_LABEL,
  SHINE,
  SPLIT_DARK,
  WIPE_LAYER,
  WIPE_MS,
  cardBackground,
} from "./project-card-classes";

export default function ProjectCard({ p, isEven }: { p: Project; isEven: boolean }) {
  const altImages = altImagesMap[p.id] ?? [];
  const preview = previewMap[p.id];
  const hasPreview = !!preview;
  const isSplit = hasPreview && typeof preview !== "string";
  const layerClass = isSplit ? WIPE_LAYER : ALT_LAYER;

  const { altARef, altBRef, start, clear } = usePreviewCycle({
    images: altImages,
    startDelay: isSplit ? 5000 : 0,
    cycleInterval: isSplit ? 5000 : 3000,
    fadeMs: isSplit ? WIPE_MS : undefined,
  });
  const tilt = usePreviewTilt(isSplit);

  return (
    <div className={`flex flex-col md:flex-row items-center gap-6 w-full ${isEven ? "md:flex-row-reverse" : ""}`}>
      <div
        className={`${CARD_SHELL} ${cardBackground(hasPreview, true)} ${isSplit ? SPLIT_DARK : ""} aspect-[16/8] h-auto w-full md:w-full [transition:transform_200ms_ease,box-shadow_200ms_ease] [.project-item:hover_&]:[transform:translateY(-4px)] [.project-item:hover_&]:[box-shadow:0_18px_36px_rgba(0,0,0,0.6)] above-467:upto-940:aspect-[4/2] above-467:upto-940:min-h-48 upto-467:aspect-[4/3] upto-467:min-h-32 upto-467:max-w-full`}
        style={hasPreview ? previewBackground(preview) : undefined}
        onMouseEnter={() => hasPreview && start()}
        onMouseLeave={() => hasPreview && clear()}
        onTouchStart={() => hasPreview && start()}
        onTouchEnd={() => hasPreview && clear()}
        {...tilt}
      >
        {hasPreview && (
          <>
            <div ref={altARef} className={layerClass} />
            <div ref={altBRef} className={layerClass} />
          </>
        )}
        {isSplit && <span className={SHINE} aria-hidden="true" />}
        {p.inProgress && <span className={PENDING_LABEL}>In Progress</span>}
      </div>
    </div>
  );
}
