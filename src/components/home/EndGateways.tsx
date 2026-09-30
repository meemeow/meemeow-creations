"use client";

import { useEffect, useRef } from "react";

const BLOCK = 100 / 17;
const SCALE = 0.75;
const WIDTH = 3 * SCALE * BLOCK;
const SPOTS = [10.7, 13.3, 15.9].map((b) => b * BLOCK);
const LIFT = BLOCK;
export const GATEWAYS_LEFT = SPOTS[0] - WIDTH / 2;

const SHAPE = [".B.", "BBB", ".P.", "BBB", ".B."];
const T = 16;

type RGB = [number, number, number];

export const BEDROCK_PALETTE: Record<string, RGB> = {
  K: [7, 7, 7],
  D: [51, 51, 51],
  M: [87, 87, 87],
  N: [100, 100, 100],
  L: [151, 151, 151],
};
export const BEDROCK = [
  "MDDDDMLLKLMDDDDM",
  "MMLLLLLLDLLLKMMD",
  "MKDDKDDDLDMMMLMM",
  "MLMMMKMLMMDDDDDM",
  "MLLDDDDDDDLLLLLK",
  "DDMMMDDDMKMMDDKM",
  "LLMNMDLLMMMMLLLK",
  "MMMDDDDDDKDDDDMM",
  "MLLKLDMMMLLLLLLL",
  "MDDDDDDMKMMDDDLM",
  "MMLDDLLDKDLLLMMM",
  "KMMMDMMMLLMMMLLK",
  "MDDDDDDDLLDDDDDM",
  "MLDLKMMDDDKDMMLL",
  "MMMDDDDDMMLLMDDM",
  "DDDDKLLMMMMDDDMM",
];

const PORTAL_SRC = "/assets/images/gateway-portal.webp";

function tile(rows: string[], palette: Record<string, RGB>): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = T;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(T, T);
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) img.data.set([...palette[rows[y][x]], 255], (y * T + x) * 4);
  ctx.putImageData(img, 0, 0);
  return canvas;
}

const BEAM: React.CSSProperties = {
  left: "50%",
  width: `${100 / 15}%`,
  minWidth: "3px",
  transform: "translateX(-50%)",
  background: "linear-gradient(90deg, #8a2fa0, #d46ae8 45%, #e592f2 50%, #d46ae8 55%, #8a2fa0)",
  boxShadow: "0 0 10px 1px rgba(205, 90, 235, 0.55), 0 0 32px 4px rgba(170, 60, 210, 0.25)",
};

function Gateway({ centre }: { centre: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = boxRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !box || !ctx) return;

    const bedrock = tile(BEDROCK, BEDROCK_PALETTE);
    const cols = SHAPE[0].length;
    const rows = SHAPE.length;
    let block = 16;

    const each = (kind: string, fn: (x: number, y: number) => void) =>
      SHAPE.forEach((row, by) => [...row].forEach((c, bx) => c === kind && fn(bx * block, by * block)));

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      block = Math.max(4, Math.floor((box.clientWidth * dpr) / cols));
      canvas.width = cols * block;
      canvas.height = rows * block;
      canvas.style.width = `${canvas.width / dpr}px`;
      canvas.style.height = `${canvas.height / dpr}px`;
      ctx.imageSmoothingEnabled = false;
      each("B", (x, y) => ctx.drawImage(bedrock, x, y, block, block));
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={boxRef}
      className="absolute flex justify-center"
      style={{
        bottom: 0,
        marginBottom: `${LIFT}%`,
        left: `${centre}%`,
        width: `${WIDTH}%`,
        transform: "translateX(-50%)",
      }}
    >
      <div
        className="absolute"
        style={{
          inset: "-30% -60%",
          background: "radial-gradient(closest-side, rgba(180, 70, 220, 0.3), rgba(180, 70, 220, 0))",
        }}
      />
      <div className="absolute" style={{ ...BEAM, bottom: "50%", height: "200vh" }} />
      <div
        className="absolute"
        style={{ ...BEAM, top: "100%", height: 0, paddingBottom: `${(LIFT / WIDTH) * 100}%` }}
      />
      <div className="relative shrink-0">
        <canvas ref={canvasRef} className="block [image-rendering:pixelated]" />
        {/* eslint-disable-next-line @next/next/no-img-element -- an animated WebP, left as is */}
        <img
          src={PORTAL_SRC}
          data-gateway-portal=""
          alt=""
          className="absolute"
          style={{ left: "calc(100% / 3)", top: "40%", width: "calc(100% / 3)", height: "20%" }}
        />
      </div>
    </div>
  );
}

export default function EndGateways() {
  return (
    <div aria-hidden="true">
      {SPOTS.map((centre, i) => (
        <Gateway key={i} centre={centre} />
      ))}
    </div>
  );
}
