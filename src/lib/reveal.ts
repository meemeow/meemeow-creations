export const REVEAL =
  "opacity-0 will-change-[transform,opacity] [transform:translateY(18px)] [transition:transform_420ms_ease-out,opacity_420ms_ease] " +
  "[&.in-view]:opacity-100 [&.in-view:not(.already-seen)]:[transform:translateY(0)] " +
  "[&.already-seen]:opacity-100 [&.already-seen]:[transform:translateY(0)_scale(1)] [&.already-seen]:[transition:none]";
