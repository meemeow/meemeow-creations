// Shared Tailwind classes for the masonry (ProjectCard) and stacked (ProjectRow) project cards.

/** Dark hand-drawn card frame. */
export const CARD_SHELL =
  "relative overflow-hidden rounded-[14px] border-4 border-[rgba(6,6,6,0.9)] " +
  "[box-shadow:0_8px_24px_rgba(0,0,0,0.55),0_0_0_4px_rgba(255,255,255,0.02)_inset] upto-467:rounded-[10px]";

/**
 * Preview screenshot fills the width (inline style sets the actual image);
 * on screens ≤940px it covers the card instead so it isn't squashed.
 */
export const cardBackground = (hasPreview: boolean, masonry: boolean) =>
  hasPreview
    ? "bg-[url('/assets/images/PKC_preview1.png')] bg-[length:100%_auto] bg-center bg-no-repeat upto-940:bg-cover"
    : `bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] backdrop-blur-[6px]${masonry ? " bg-cover bg-center" : ""}`;

/** Alternate screenshot layer; the page toggles `visible` to cross-fade it in. */
export const ALT_LAYER =
  "alt-layer pointer-events-none absolute inset-0 z-2 rounded-[inherit] bg-[length:100%_auto] bg-center bg-no-repeat " +
  "opacity-0 [transition:opacity_400ms_ease] [&.visible]:opacity-100 upto-940:bg-cover";
