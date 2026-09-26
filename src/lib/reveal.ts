// Each block pops in (fade + slide up) when `in-view` is added;
// `already-seen` shows it instantly when returning within the same tab.
// Kept out of the "use client" hook module so server components can import the
// plain string (importing it from a client module hands them a client reference).
export const REVEAL =
  "opacity-0 will-change-[transform,opacity] [transform:translateY(18px)] [transition:transform_420ms_ease-out,opacity_420ms_ease] " +
  "[&.in-view]:opacity-100 [&.in-view:not(.already-seen)]:[transform:translateY(0)] " +
  "[&.already-seen]:opacity-100 [&.already-seen]:[transform:translateY(0)_scale(1)] [&.already-seen]:[transition:none]";
