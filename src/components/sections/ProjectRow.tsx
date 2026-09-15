"use client";

import { usePreviewCycle } from "@/hooks/use-preview-cycle";
import { altImagesMap, previewMap, type Project } from "@/data/projects";
import { ALT_LAYER, CARD_SHELL, cardBackground } from "./project-card-classes";

// Stacked card sizing:
//  - ≤1620px: always shown at the full 16:8 preview size, no animation
//  - >1620px: collapsed to a 12rem strip, expanding to 16:8 while hovered
// Hovering the row lifts the card; hovering the card itself shows a small
// "images will cycle" dot after 1.5s.
const STACKED_CARD =
  "[.project-row:hover_&]:[transform:translateY(-4px)_rotate(-0.15deg)] [.project-row:hover_&]:[box-shadow:0_18px_36px_rgba(0,0,0,0.6)] " +
  "upto-1620:h-auto upto-1620:aspect-[16/8] upto-1620:overflow-visible upto-1620:[transition:none] " +
  "above-1620:[&:not(:hover)]:h-48 above-1620:[&:not(:hover)]:aspect-auto above-1620:[&:not(:hover)]:[transition:height_320ms_cubic-bezier(.2,.9,.2,1),transform_200ms_ease,box-shadow_200ms_ease] " +
  "above-1620:[&:hover]:h-auto above-1620:[&:hover]:aspect-[16/8] above-1620:[&:hover]:[transition:height_360ms_cubic-bezier(.2,.9,.2,1),aspect-ratio_360ms_ease] " +
  "upto-940:w-full upto-940:max-w-full above-467:upto-940:mx-auto above-467:upto-940:min-h-48 upto-467:min-h-32 " +
  "[&:hover]:after:absolute [&:hover]:after:right-[10px] [&:hover]:after:bottom-[10px] [&:hover]:after:z-3 [&:hover]:after:h-[12px] [&:hover]:after:w-[12px] " +
  "[&:hover]:after:rounded-[50%] [&:hover]:after:bg-[rgba(255,255,255,0.4)] [&:hover]:after:opacity-0 [&:hover]:after:animate-indicator-in [&:hover]:after:content-['']";

/** Stacked-view row: waits 2s on hover before cycling previews. */
export default function ProjectRow({ p }: { p: Project }) {
  const altImages = altImagesMap[p.id] ?? [];
  const previewName = previewMap[p.id];
  const hasPreview = !!previewName;

  const { altARef, altBRef, start, clear } = usePreviewCycle({
    images: altImages,
    startDelay: 2000,
    cycleInterval: 2000,
  });

  return (
    <div className="w-full above-940:w-3/5">
      <div
        className={`${CARD_SHELL} ${cardBackground(hasPreview, false)} ${STACKED_CARD}`}
        style={hasPreview ? { backgroundImage: `url('/assets/images/${previewName}')` } : undefined}
        onMouseEnter={() => hasPreview && start()}
        onMouseLeave={clear}
        onTouchStart={() => hasPreview && start()}
        onTouchEnd={clear}
      >
        {hasPreview && (
          <>
            <div ref={altARef} className={ALT_LAYER} />
            <div ref={altBRef} className={ALT_LAYER} />
          </>
        )}
      </div>
    </div>
  );
}
