"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const TEX_W = 185;
const TEX_H = 41;
const SLOT_X = [6, 26, 46, 66, 86, 107, 127, 147, 167];
const SLOT_Y = 22;
const SLOT_IN = 14;
export const PEARL_SLOT = 4;

const ISLAND_BLOCKS = 17;
const VISIBLE_ROWS = 2.5;
const MAX_ROWS = 2.2;
const PHONE_SHARE = 0.92;
const PHONE_MAX_PX = 520;
const PHONE_BOTTOM_PX = 10;

const DIGITS: Record<string, string[]> = {
  "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", "#####"],
  "2": [".###.", "#...#", "....#", "..##.", ".#...", "#...#", "#####"],
  "3": [".###.", "#...#", "....#", "..##.", "....#", "#...#", ".###."],
  "4": ["...##", "..#.#", ".#..#", "#...#", "#####", "....#", "....#"],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": ["..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "#...#", "....#", "...#.", "..#..", "..#..", "..#.."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
};

function PixelText({ text, style }: { text: string; style: React.CSSProperties }) {
  const width = text.length * 6;
  const pixels = [...text].flatMap((ch, i) =>
    (DIGITS[ch] ?? []).flatMap((row, y) => [...row].flatMap((c, x) => (c === "#" ? [[i * 6 + x, y]] : []))),
  );
  return (
    <svg viewBox={`0 0 ${width} 8`} shapeRendering="crispEdges" aria-hidden="true" style={style}>
      {pixels.map(([x, y]) => (
        <rect key={`s${x},${y}`} x={x + 1} y={y + 1} width={1} height={1} fill="#3f3f3f" />
      ))}
      {pixels.map(([x, y]) => (
        <rect key={`${x},${y}`} x={x} y={y} width={1} height={1} fill="#ffffff" />
      ))}
    </svg>
  );
}

export default function Hud({
  selected,
  onSelect: setSelected,
  phone = false,
  lift = 0,
}: {
  selected: number;
  onSelect: (slot: number) => void;
  phone?: boolean;
  lift?: number;
}) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = useState<{ texel: number; left: number; bottom: number } | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

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
      if (phone) {
        const texel = Math.min(width * PHONE_SHARE, PHONE_MAX_PX) / TEX_W;
        setFit({ texel, left: snap((width - TEX_W * texel) / 2), bottom: snap(PHONE_BOTTOM_PX - lift) });
        return;
      }
      setFit({
        texel,
        left: snap((width - TEX_W * texel) / 2),
        bottom: snap((VISIBLE_ROWS * block - TEX_H * texel) / 2),
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [phone, lift]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 9) setSelected(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSelected]);

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
          <Image
            src="/assets/images/hud-bars.png"
            alt=""
            width={185}
            height={17}
            unoptimized
            draggable={false}
            className={PIXELATED}
            style={at(0, 0, 185, 17)}
          />
          <Image
            src="/assets/images/hud-hotbar.png"
            alt=""
            width={182}
            height={21}
            unoptimized
            draggable={false}
            className={PIXELATED}
            style={at(2, 18, 182, 21)}
          />

          <Image
            src="/assets/images/ender-pearl.png"
            alt=""
            width={13}
            height={13}
            unoptimized
            draggable={false}
            className={PIXELATED}
            style={at(SLOT_X[PEARL_SLOT], SLOT_Y, 13, 13)}
          />
          <PixelText text="16" style={at(SLOT_X[PEARL_SLOT] + SLOT_IN + 2 - 12, SLOT_Y + SLOT_IN - 7, 12, 8)} />

          {hovered !== null && (
            <div style={{ ...at(SLOT_X[hovered], SLOT_Y, SLOT_IN, SLOT_IN), background: "rgba(255,255,255,0.35)" }} />
          )}
          <Image
            src="/assets/images/hud-selected.png"
            alt=""
            width={24}
            height={23}
            unoptimized
            draggable={false}
            className={PIXELATED}
            style={at(SLOT_X[selected] - 5, 17, 24, 23)}
          />

          {SLOT_X.map((x, i) => (
            <button
              key={i}
              type="button"
              aria-label={i === PEARL_SLOT ? `Hotbar slot ${i + 1}: 16 ender pearls` : `Hotbar slot ${i + 1}`}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
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
