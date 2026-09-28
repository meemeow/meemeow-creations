"use client";

import { useEffect, useRef, type ReactNode } from "react";

// A platform of end stone blocks, seen straight on: stepped rows that narrow toward the
// bottom (like a floating End island's underside), each square one block wearing the end
// stone face. Lower rows sit a little more in shadow, and it floats gently unless reduced motion.
// Only the top two and a half rows sit above the component's bottom edge; the rest hangs below,
// so placed at the bottom of a clipped container it reads as the island carrying on out of view.
const VISIBLE_ROWS = 2.5;

// Float: how high (px) and how long one way (ms).
const BOB_PX = 8;
const BOB_MS = 3200;

// The float's ease-in-out curve (CSS cubic-bezier(.42, 0, .58, 1)) as keyframes that hold each
// whole pixel until the curve reaches the next one, for things riding on the island.
function pixelSteps(): Keyframe[] {
  const bez = (t: number, a: number, b: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  const timeAt = (progress: number) => {
    // invert the bezier's y (progress) to its x (time) by bisection
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (bez(mid, 0, 1) < progress) lo = mid;
      else hi = mid;
    }
    return bez((lo + hi) / 2, 0.42, 0.58);
  };
  const frames: Keyframe[] = [{ offset: 0, transform: "translateY(0)", easing: "step-end" }];
  for (let px = 1; px <= BOB_PX; px++) {
    // switch to this pixel halfway between the two levels, like rounding
    frames.push({ offset: timeAt((px - 0.5) / BOB_PX), transform: `translateY(${-px}px)`, easing: "step-end" });
  }
  frames.push({ offset: 1, transform: `translateY(${-BOB_PX}px)` });
  return frames;
}

// Blocks per row, top to bottom; the widest row sets the block size.
const ROWS = [17, 15, 13, 11];

// The end stone face, 16x16 texels, transcribed from the game's texture.
const PALETTE: Record<string, [number, number, number]> = {
  A: [214, 220, 152], // base
  C: [223, 230, 166], // pale
  B: [238, 246, 182], // light
  F: [246, 250, 192], // highlight
  D: [205, 200, 140], // tan
  E: [198, 190, 140], // dark tan
};
const FACE = [
  "CAACBBACBEDAABEA",
  "AACBDABBDDACACBC",
  "CBBAEDACBABBCACB",
  "EDABAEDACBDDFBBD",
  "DAAFBACABDEAAFEE",
  "ADCBFBACBDADCBDA",
  "ACBADABFBBACBBAC",
  "BBEDDDABFCBAEDBA",
  "FAAEDACAECDEAACB",
  "BBCDACBEDABADAAC",
  "AEDBCABAAACCAACB",
  "EAAABBFCCBEDCCBA",
  "AABCBADBBEDACACC",
  "BCCBFDDEACACABBB",
  "DBBFAEEAACCBBCAE",
  "ADCBAACACAEDCBED",
];

function makeFace(): HTMLCanvasElement {
  const tile = document.createElement("canvas");
  tile.width = tile.height = 16;
  const tctx = tile.getContext("2d")!;
  const img = tctx.createImageData(16, 16);
  FACE.forEach((row, y) =>
    [...row].forEach((key, x) => img.data.set([...PALETTE[key], 255], (y * 16 + x) * 4))
  );
  tctx.putImageData(img, 0, 0);
  return tile;
}

// `children` sit on top of the island (anchored to its top edge) and float with it.
export default function EndIsland({
  className = "",
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const riderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const face = makeFace();

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.parentElement?.clientWidth ?? 0;
      if (!width) return;
      const widest = Math.max(...ROWS);
      // Whole device pixels per block (not per texel, which jumps in big steps), so every
      // block is identical and crisp-edged.
      const block = Math.max(16, Math.floor((width * dpr) / widest)); // device px
      const height = block * ROWS.length;
      canvas.width = block * widest;
      canvas.height = height;
      canvas.style.width = `${canvas.width / dpr}px`;
      canvas.style.height = `${height / dpr}px`;
      canvas.style.marginBottom = `${(-(ROWS.length - VISIBLE_ROWS) * block) / dpr}px`; // lower rows out of view
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ROWS.forEach((count, row) => {
        const left = ((widest - count) / 2) * block;
        for (let i = 0; i < count; i++) ctx.drawImage(face, left + i * block, row * block, block, block);
        // Lower rows a little more in shadow, like the underside of an island.
        if (row > 0) {
          ctx.fillStyle = `rgba(0,0,0,${(row * 0.14).toFixed(2)})`;
          ctx.fillRect(left, row * block, count * block, block);
        }
      });
    };

    draw();
    const observer = new ResizeObserver(draw);
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    // Float: the island glides; whatever sits on it follows the exact same curve and timing but
    // snapped to whole pixels, so it hops in pixel steps (Minecraft style). Both start in the
    // same frame, so they share a start time and stay in sync.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timing = { duration: BOB_MS, direction: "alternate" as const, iterations: Infinity };
    const glide = reduced
      ? null
      : canvas.animate([{ transform: "translateY(0)" }, { transform: `translateY(${-BOB_PX}px)` }], {
          ...timing,
          easing: "ease-in-out",
        });
    const hop =
      reduced || !riderRef.current
        ? null
        : riderRef.current.animate(pixelSteps(), { ...timing, easing: "linear" });

    return () => {
      observer.disconnect();
      glide?.cancel();
      hop?.cancel();
    };
  }, []);

  return (
    <div className={`pointer-events-none ${className}`} style={style}>
      <div className="relative flex justify-center">
        {children && (
          // Kept above the island: once its float animation runs, the canvas paints as its own
          // layer after this one, and would cover anything reaching down over it (the hotbar).
          <div ref={riderRef} className="absolute left-0 right-0" style={{ bottom: "100%", zIndex: 1 }}>
            {children}
          </div>
        )}
        <canvas ref={canvasRef} aria-hidden="true" className="block [image-rendering:pixelated]" />
      </div>
    </div>
  );
}
