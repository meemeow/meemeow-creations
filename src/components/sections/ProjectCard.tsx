"use client";

import { usePreviewCycle } from "@/hooks/use-preview-cycle";
import { altImagesMap, previewMap, type Project } from "@/data/projects";
import { ALT_LAYER, CARD_SHELL, cardBackground } from "./project-card-classes";

/** Masonry-view card: cycles previews immediately on hover. */
export default function ProjectCard({ p, isEven }: { p: Project; isEven: boolean }) {
  const altImages = altImagesMap[p.id] ?? [];
  const previewName = previewMap[p.id];
  const hasPreview = !!previewName;

  const { altARef, altBRef, start, clear } = usePreviewCycle({
    images: altImages,
    startDelay: 0,
    cycleInterval: 3000,
  });

  return (
    <div className={`flex flex-col md:flex-row items-center gap-6 w-full ${isEven ? "md:flex-row-reverse" : ""}`}>
      <div
        className={`${CARD_SHELL} ${cardBackground(hasPreview, true)} aspect-[16/8] h-auto w-full md:w-full [transition:transform_200ms_ease,box-shadow_200ms_ease] [.project-item:hover_&]:[transform:translateY(-4px)_rotate(-0.15deg)] [.project-item:hover_&]:[box-shadow:0_18px_36px_rgba(0,0,0,0.6)] above-467:upto-940:aspect-[4/2] above-467:upto-940:min-h-48 upto-467:aspect-[4/3] upto-467:min-h-32 upto-467:max-w-full`}
        style={hasPreview ? { backgroundImage: `url('/assets/images/${previewName}')` } : undefined}
        onMouseEnter={() => hasPreview && start()}
        onMouseLeave={() => hasPreview && clear()}
        onTouchStart={() => hasPreview && start()}
        onTouchEnd={() => hasPreview && clear()}
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
