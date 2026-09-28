"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

// Minecraft's HUD, laid over the End island's face: health, hunger, the XP bar and the hotbar,
// with a stack of 16 ender pearls in slot 5. The slots can be picked like in the game, by
// clicking them or pressing 1-9; the white frame moves to the chosen one.
// It stays still while the island floats, and is sized and placed to sit wholly inside the
// island's visible face (below its top edge, clear of its sides).
// Everything is drawn from the game's own pixel sizes ("texels"), scaled by a whole number of
// device pixels so it stays crisp.

const TEX_W = 185; // the whole HUD, in texels
const TEX_H = 41;
// Where each slot's inside starts (x) in the hotbar; they're 14 texels square, from y 22.
const SLOT_X = [6, 26, 46, 66, 86, 107, 127, 147, 167];
const SLOT_Y = 22;
const SLOT_IN = 14;
const PEARL_SLOT = 4; // slot 5

// The island, as EndIsland draws it: 17 blocks across, 2.5 rows of it showing.
const ISLAND_BLOCKS = 17;
const VISIBLE_ROWS = 2.5;
const MAX_ROWS = 2.2; // the HUD's height at most, in rows, leaving a margin above and below

export default function Hud() {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = useState<{ texel: number; left: number; bottom: number } | null>(null);
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  // Size it from the island's block size (the same whole device pixels EndIsland uses).
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = box.clientWidth;
      const blockDev = Math.max(16, Math.floor((width * dpr) / ISLAND_BLOCKS));
      const exact = (MAX_ROWS * blockDev) / TEX_H;
      const texel = (exact >= 1 ? Math.floor(exact) : exact) / dpr;
      const block = blockDev / dpr;
      const snap = (v: number) => Math.round(v * dpr) / dpr;
      setFit({
        texel,
        left: snap((width - TEX_W * texel) / 2),
        bottom: snap((VISIBLE_ROWS * block - TEX_H * texel) / 2), // centred in the visible face
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // Number keys pick a slot, as in the game.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 9) setSelected(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const t = (texels: number) => (fit ? texels * fit.texel : 0);
  const at = (x: number, y: number, w: number, h: number): React.CSSProperties => ({
    position: "absolute",
    left: t(x),
    top: t(y),
    width: t(w),
    height: t(h),
  });
  const PIXELATED = "block [image-rendering:pixelated]";

  return (
    <div ref={boxRef} className="pointer-events-none absolute inset-0">
      {fit && (
        <div
          style={{
            position: "absolute",
            left: fit.left,
            bottom: fit.bottom,
            width: t(TEX_W),
            height: t(TEX_H),
          }}
        >
          <Image src="/assets/images/hud-bars.png" alt="" width={185} height={17} unoptimized draggable={false} className={PIXELATED} style={at(0, 0, 185, 17)} />
          <Image src="/assets/images/hud-hotbar.png" alt="" width={182} height={21} unoptimized draggable={false} className={PIXELATED} style={at(2, 18, 182, 21)} />

          {/* The ender pearls, with the stack size bottom right of the slot like the game. */}
          <Image src="/assets/images/ender-pearl.png" alt="" width={13} height={13} unoptimized draggable={false} className={PIXELATED} style={at(SLOT_X[PEARL_SLOT], SLOT_Y, 13, 13)} />
          <span
            className="font-pixel text-white"
            style={{
              position: "absolute",
              left: t(SLOT_X[PEARL_SLOT] + SLOT_IN + 1),
              top: t(SLOT_Y + SLOT_IN - 7),
              transform: "translateX(-100%)",
              fontSize: t(7),
              lineHeight: 1,
              textShadow: `${t(1)}px ${t(1)}px 0 #3f3f3f`,
            }}
          >
            16
          </span>

          {/* Hover: the slot's inside lightens, as in the game's inventory. */}
          {hovered !== null && (
            <div style={{ ...at(SLOT_X[hovered], SLOT_Y, SLOT_IN, SLOT_IN), background: "rgba(255,255,255,0.35)" }} />
          )}
          <Image src="/assets/images/hud-selected.png" alt="" width={24} height={23} unoptimized draggable={false} className={PIXELATED} style={at(SLOT_X[selected] - 5, 17, 24, 23)} />

          {/* The slots themselves, clickable. */}
          {SLOT_X.map((x, i) => (
            <button
              key={i}
              type="button"
              aria-label={i === PEARL_SLOT ? `Hotbar slot ${i + 1}: 16 ender pearls` : `Hotbar slot ${i + 1}`}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
              // a mouse click shouldn't leave a focus ring on the slot (keyboard focus still shows)
              onMouseUp={(e) => e.currentTarget.blur()}
              onPointerEnter={() => setHovered(i)}
              onPointerLeave={() => setHovered((h) => (h === i ? null : h))}
              className="pointer-events-auto"
              style={{ ...at(x - 3, 18, 20, 21), cursor: "inherit", background: "transparent" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
