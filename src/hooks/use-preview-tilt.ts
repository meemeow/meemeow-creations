"use client";

import type { PointerEvent } from "react";

const TILT_DEG = 6;
const PERSPECTIVE = "1200px";
const FOLLOW_MS = 80;
const SETTLE_MS = 500;
// The split's slant reaches 8% either side of its centre, so the centre has to run
// from -8% to 108% for the dark half to fully disappear and fully cover the card.
const SPLIT_OVERSHOOT = 8;

// Tilts the card toward the mouse and, on split previews, moves the dark/light split to follow it.
// Mouse only, so touch keeps the card flat and the split centred.
export function usePreviewTilt(split: boolean) {
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;

    el.style.setProperty("--tx", String(x - 0.5));
    if (split) el.style.setProperty("--split", `${x * (100 + SPLIT_OVERSHOOT * 2) - SPLIT_OVERSHOOT}%`);
    el.style.setProperty("--split-ms", `${FOLLOW_MS}ms`);
    el.style.transform =
      `perspective(${PERSPECTIVE}) translateY(-4px) ` +
      `rotateY(${(x - 0.5) * TILT_DEG}deg) rotateX(${(y - 0.5) * -TILT_DEG}deg)`;
    el.style.transition = `transform ${FOLLOW_MS}ms linear, box-shadow 200ms ease`;
  };

  const onPointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.removeProperty("--tx");
    el.style.removeProperty("--split");
    el.style.setProperty("--split-ms", `${SETTLE_MS}ms`);
    el.style.transform = "";
    el.style.transition = `transform ${SETTLE_MS}ms ease, box-shadow 200ms ease`;
  };

  return { onPointerMove, onPointerLeave };
}
