export const CARD_SHELL =
  "relative overflow-hidden rounded-[14px] border-4 border-[rgba(6,6,6,0.9)] " +
  "[box-shadow:0_8px_24px_rgba(0,0,0,0.55),0_0_0_4px_rgba(255,255,255,0.02)_inset] upto-467:rounded-[10px]";

export const cardBackground = (hasPreview: boolean, masonry: boolean) =>
  hasPreview
    ? "bg-[url('/assets/images/PKC_preview1.png')] bg-[length:100%_auto] bg-center bg-no-repeat upto-940:bg-cover"
    : `bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] backdrop-blur-[6px]${masonry ? " bg-cover bg-center" : ""}`;

export const ALT_LAYER =
  "alt-layer pointer-events-none absolute inset-0 z-2 rounded-[inherit] bg-[length:100%_auto] bg-center bg-no-repeat " +
  "opacity-0 [transition:opacity_400ms_ease] [&.visible]:opacity-100 upto-940:bg-cover";

// Split previews: the light screenshot is the element's background and the dark one
// (from --dark-src) covers the left side, cut along a slanted diagonal centred on --split.
export const SPLIT_DARK =
  "before:pointer-events-none before:absolute before:inset-0 before:z-1 before:rounded-[inherit] before:content-[''] " +
  "before:bg-(image:--dark-src) before:bg-[length:100%_auto] before:bg-center before:bg-no-repeat " +
  "before:[clip-path:polygon(0_0,calc(var(--split,50%)_+_8%)_0,calc(var(--split,50%)_-_8%)_100%,0_100%)] " +
  "before:[transition:clip-path_var(--split-ms,500ms)_ease-out] upto-940:before:bg-cover";

// Holographic streak that slides across as the card tilts.
export const SHINE =
  "pointer-events-none absolute inset-0 z-4 mix-blend-screen bg-[length:250%_100%] " +
  "bg-[linear-gradient(115deg,transparent_32%,rgb(255_150_200/0.12)_42%,rgb(160_200_255/0.12)_50%,rgb(255_236_160/0.1)_58%,transparent_68%)] " +
  "[background-position:calc(50%_-_var(--tx,0)_*_120%)_0] [transition:background-position_var(--split-ms,500ms)_ease-out]";

// Wipes the next slide in along the same slant as the split instead of fading it.
export const WIPE_MS = 700;
export const WIPE_LAYER =
  `alt-layer pointer-events-none absolute inset-0 z-2 bg-[length:100%_auto] bg-center bg-no-repeat ${SPLIT_DARK} ` +
  "[clip-path:polygon(0_0,0_0,-16%_100%,-16%_100%)] [transition:clip-path_700ms_cubic-bezier(.65,0,.35,1)] " +
  "[&.visible]:[clip-path:polygon(0_0,116%_0,100%_100%,-16%_100%)] upto-940:bg-cover";
