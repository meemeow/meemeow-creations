"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";

type Fit = "cover" | "fill" | "contain";
type Photo = { src: string; alt: string; fit?: Fit; stickers?: { src: string; className: string }[] };

const CARD =
  "absolute inset-0 overflow-hidden rounded-lg border-2 border-white/20 [box-shadow:0_18px_40px_rgba(0,0,0,0.55)]";
const SETTLE = "transform 450ms cubic-bezier(.2,.9,.2,1), opacity 450ms ease, filter 450ms ease";

const PEEK_SHIFT = 30;
const PEEK_SCALE = 0.8;
const EDGE_RESIST = 0.3;
const CLICK_SLOP = 6;

const UNLOCK_MS = 1000;
const CONFETTI_EVERY_MS = 5000;
const CONFETTI_REST_MS = 15000;
const CONFETTI_FADE_MS = 3000;
const CONFETTI_COUNT = 44;
const CORNER_COUNT = 16;
const FLUTTER_MS = 320;
const CONFETTI_COLORS = ["#facc15", "#22c55e", "#38bdf8", "#f472b6", "#fb923c", "#ffffff", "#a78bfa"];

type Piece = {
  land: number;
  z: number;
  sx: number;
  sy: number;
  ax: number;
  ay: number;
  r: number;
  w: number;
  h: number;
  color: string;
  delay: number;
  dur: number;
  curl: boolean;
};
type Burst = { id: number; pieces: Piece[] };

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pickColor = () => CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
const spinToRest = () =>
  (Math.random() < 0.5 ? -1 : 1) * 360 * (1 + Math.floor(Math.random() * 3)) + 90 + rand(-25, 25);

const fountainPiece = (): Piece => {
  const land = rand(3, 96);
  const sx = rand(30, 70) - land;
  return {
    land,
    z: rand(0, 10),
    sx,
    sy: -8,
    ax: sx * 0.55,
    ay: rand(-80, -35),
    r: spinToRest(),
    w: rand(5, 10),
    h: rand(8, 16),
    color: pickColor(),
    delay: rand(0, 180),
    dur: rand(1800, 2700),
    curl: false,
  };
};

const cornerPiece = (side: "left" | "right"): Piece => {
  const dir = side === "left" ? 1 : -1;
  const land = side === "left" ? rand(3, 70) : rand(26, 96);
  const sx = (side === "left" ? 0 : 100) - land;
  const curl = Math.random() < 0.6;
  return {
    land,
    z: rand(0, 10),
    sx,
    sy: -102,
    ax: sx + dir * rand(12, 40),
    ay: rand(-92, -70),
    r: spinToRest(),
    w: curl ? rand(7, 9) : rand(5, 9),
    h: curl ? rand(20, 30) : rand(8, 14),
    color: pickColor(),
    delay: rand(0, 350),
    dur: rand(2600, 3600),
    curl,
  };
};

const makeConfetti = (): Piece[] => [
  ...Array.from({ length: CONFETTI_COUNT }, fountainPiece),
  ...Array.from({ length: CORNER_COUNT }, () => cornerPiece("left")),
  ...Array.from({ length: CORNER_COUNT }, () => cornerPiece("right")),
];

const Curl = ({ color }: { color: string }) => (
  <svg viewBox="0 0 8 28" preserveAspectRatio="none" className="block h-full w-full" aria-hidden="true">
    <path d="M4 1q4 3 0 6.5t0 6.5t0 6.5t0 6.5" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const spawnBurst = (set: React.Dispatch<React.SetStateAction<Burst[]>>) => {
  const burst = { id: Date.now() + Math.random(), pieces: makeConfetti() };
  set((all) => [...all, burst]);
  setTimeout(() => set((all) => all.filter((b) => b !== burst)), CONFETTI_REST_MS + CONFETTI_FADE_MS + 500);
};

const KEYFRAMES = `
@keyframes pc-lock-shake {
  0%, 100% { transform: rotate(0); }
  15% { transform: rotate(-12deg); }
  30% { transform: rotate(10deg); }
  45% { transform: rotate(-8deg); }
  60% { transform: rotate(6deg); }
  75% { transform: rotate(0) scale(1.08); }
}
@keyframes pc-shackle-open {
  0%, 55% { transform: translateY(0) rotate(0); }
  100% { transform: translateY(-5px) rotate(-28deg); }
}
@keyframes pc-lock-pop {
  0%, 70% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.35); opacity: 0; }
}
@keyframes pc-sticker-in {
  from { transform: scale(0.4); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes pc-confetti-fly {
  0% { transform: translate(var(--sx), var(--sy)) rotate(0); animation-timing-function: cubic-bezier(.15,.7,.35,1); }
  30% { transform: translate(var(--ax), var(--ay)) rotate(calc(var(--r) * 0.35)); animation-timing-function: cubic-bezier(.5,0,.85,.45); }
  92% { transform: translate(0, 0) rotate(var(--r)); animation-timing-function: ease-out; }
  96% { transform: translate(0, -4px) rotate(var(--r)); animation-timing-function: ease-in; }
  100% { transform: translate(0, 0) rotate(var(--r)); }
}
@keyframes pc-confetti-flutter {
  from { transform: rotateY(0) skewX(0); }
  to { transform: rotateY(160deg) skewX(12deg); }
}
@keyframes pc-confetti-fade {
  to { opacity: 0; }
}
`;

const ARROW =
  "flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/5 text-white " +
  "[transition:background-color_150ms_ease,border-color_150ms_ease,opacity_200ms_ease] hover:border-white/40 hover:bg-white/10 " +
  "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:bg-white/5 upto-639:h-8 upto-639:w-8";

const Chevron = ({ dir }: { dir: "left" | "right" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"}
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Lock = ({ opening }: { opening: boolean }) => (
  <svg
    width="56"
    height="58"
    viewBox="0 0 30 30"
    fill="none"
    aria-hidden="true"
    style={opening ? { animation: "pc-lock-shake 520ms ease-in-out, pc-lock-pop 1000ms ease-in forwards" } : undefined}
  >
    <path
      d="M8.5 13V9a6.5 6.5 0 0 1 13 0v4"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      style={{
        transformOrigin: "21.5px 13px",
        animation: opening ? "pc-shackle-open 800ms cubic-bezier(.3,1.6,.5,1) forwards" : undefined,
      }}
    />
    <rect x="2.5" y="13" width="25" height="15" rx="2.5" fill="currentColor" />
    <circle cx="15" cy="20.5" r="1.8" fill="#000000" />
  </svg>
);

const FIT_CLASS: Record<Exclude<Fit, "contain">, string> = {
  cover: "object-cover",
  fill: "object-fill",
};
const PRINT =
  "h-[90%] overflow-hidden rounded-[3px] border-[7px] border-[#f5f2ea] bg-[#f5f2ea] " +
  "[box-shadow:0_10px_26px_rgba(0,0,0,0.6),0_0_0_1px_rgba(0,0,0,0.25)] max-lg:border-[6px] upto-639:border-[5px]";
const pad = (k: number) => String(k).padStart(2, "0");
const noSubscribe = () => () => {};

export default function PhotoCarousel({
  photos,
  width,
  height,
  aspect,
  fit = "cover",
  sizes,
  priority = false,
  className = "",
  title,
  subtitle,
  secret,
  secretFlag = "__photoCarouselSecret",
}: {
  photos: Photo[];
  width: number;
  height: number;
  aspect?: string;
  fit?: Fit;
  sizes: string;
  priority?: boolean;
  className?: string;
  title?: string;
  subtitle?: string;
  secret?: Photo;
  secretFlag?: string;
}) {
  const cards = secret ? [...photos, secret] : photos;
  const n = cards.length;
  const secretIndex = secret ? n - 1 : -1;
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [lock, setLock] = useState<"locked" | "unlocking" | "open">("locked");
  const [confetti, setConfetti] = useState<Burst[]>([]);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [onScreen, setOnScreen] = useState(false);
  const startX = useRef(0);
  const moved = useRef(false);

  const seen = useSyncExternalStore(
    noSubscribe,
    () => Boolean((window as unknown as Record<string, unknown>)[secretFlag]),
    () => false,
  );

  useEffect(() => {
    if (lock !== "unlocking") return;
    const t = setTimeout(() => {
      (window as unknown as Record<string, unknown>)[secretFlag] = true;
      setLock("open");
      spawnBurst(setConfetti);
    }, UNLOCK_MS);
    return () => clearTimeout(t);
  }, [lock, secretFlag]);

  const open = lock === "open" || (lock === "locked" && seen);
  const shown = secret && !open ? n - 1 : n;

  const celebrating = open && current === secretIndex && onScreen;
  const secretInFront = useRef(false);
  useEffect(() => {
    secretInFront.current = open && current === secretIndex;
  }, [open, current, secretIndex]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(entry.isIntersecting);
        if (!entry.isIntersecting) setConfetti([]);
        else if (secretInFront.current) spawnBurst(setConfetti);
      },
      { rootMargin: "100px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!celebrating) return;
    const t = setInterval(() => spawnBurst(setConfetti), CONFETTI_EVERY_MS);
    return () => clearInterval(t);
  }, [celebrating]);

  const go = (to: number) => {
    const next = Math.min(n - 1, Math.max(0, to));
    if (next === secretIndex && lock === "locked" && !seen) setLock("unlocking");
    setCurrent(next);
  };
  const hasPrev = current > 0;
  const hasNext = current < n - 1;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (n < 2 || (e.target as HTMLElement).closest("button")) return;
    startX.current = e.clientX;
    moved.current = false;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !boxRef.current) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > CLICK_SLOP) moved.current = true;
    let p = -dx / boxRef.current.offsetWidth;
    if ((p > 0 && !hasNext) || (p < 0 && !hasPrev)) p *= EDGE_RESIST;
    setProgress(Math.max(-1, Math.min(1, p)));
  };

  const endDrag = () => {
    if (!dragging) return;
    if (progress > 0.5 && hasNext) go(current + 1);
    else if (progress < -0.5 && hasPrev) go(current - 1);
    setDragging(false);
    setProgress(0);
  };

  const place = (i: number): React.CSSProperties => {
    const pos = i - current - progress;
    const d = Math.min(Math.abs(pos), 2);
    const near = Math.min(d, 1);
    return {
      transform: `translateX(${pos * PEEK_SHIFT}%) scale(${1 - (1 - PEEK_SCALE) * near})`,
      opacity: d <= 1 ? 1 - 0.6 * d : Math.max(0, 0.4 * (2 - d)),
      filter: `brightness(${1 - 0.25 * near})`,
      zIndex: 100 - Math.round(d * 10),
      transition: dragging ? "none" : SETTLE,
    };
  };

  const total = secret && !open && current >= n - 2 ? "??" : pad(shown);

  return (
    <div ref={rootRef} className="flex flex-col items-center">
      {secret && <style>{KEYFRAMES}</style>}
      {title && (
        <div className={`mb-5 flex items-end justify-between gap-4 font-gotham upto-639:mb-4 ${className}`}>
          <div className="min-w-0">
            <p className="font-semibold leading-[1.25] text-white text-[1.25rem] max-lg:text-[1.125rem] upto-639:text-[1rem]">
              {title}
            </p>
            {subtitle && (
              <p className="mt-1 font-medium text-gray-400 text-[0.875rem] upto-639:text-[0.8125rem]">{subtitle}</p>
            )}
          </div>
          {n > 1 && (
            <p className="shrink-0 font-medium tabular-nums text-gray-400 text-[0.875rem]" aria-live="polite">
              <span className="text-white">{pad(current + 1)}</span> / {total}
            </p>
          )}
        </div>
      )}

      <div
        ref={boxRef}
        className={`relative touch-pan-y select-none ${n > 1 ? (dragging ? "cursor-grabbing" : "cursor-grab") : ""} ${className}`}
        style={{ aspectRatio: aspect ?? `${width} / ${height}` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {cards.map((p, i) => {
          const front = i === current;
          const isSecret = i === secretIndex;
          const photoFit = p.fit ?? fit;
          return (
            <div
              key={p.src}
              className={CARD}
              style={place(i)}
              aria-hidden={front ? undefined : true}
              onClick={() => {
                if (!front && !moved.current) go(i);
              }}
            >
              {photoFit === "contain" ? (
                <div className="flex h-full w-full items-center justify-center bg-[#1c1b1a]">
                  <div className={PRINT} style={{ aspectRatio: `${width} / ${height}` }}>
                    <Image
                      src={p.src}
                      alt={front && (!isSecret || open) ? p.alt : ""}
                      width={width}
                      height={height}
                      sizes={sizes}
                      priority={priority && i === 0}
                      draggable={false}
                      className="block h-full w-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <Image
                  src={p.src}
                  alt={front && (!isSecret || open) ? p.alt : ""}
                  width={width}
                  height={height}
                  sizes={sizes}
                  priority={priority && i === 0}
                  draggable={false}
                  className={`block h-full w-full ${FIT_CLASS[photoFit]}`}
                />
              )}
              {(!isSecret || open) &&
                onScreen &&
                Math.abs(i - current) <= 1 &&
                p.stickers?.map((s) => (
                  <Image
                    key={s.src}
                    src={s.src}
                    alt=""
                    aria-hidden="true"
                    width={240}
                    height={240}
                    unoptimized
                    draggable={false}
                    className={`pointer-events-none absolute h-auto ${s.className}`}
                    style={{ animation: "pc-sticker-in 500ms cubic-bezier(.3,1.5,.5,1) 250ms both" }}
                  />
                ))}
              {isSecret && (
                <div
                  role={open ? undefined : "img"}
                  aria-label={open ? undefined : "Locked photo"}
                  className={`absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black text-white/80 [transition:opacity_700ms_ease] ${
                    open ? "pointer-events-none opacity-0" : "opacity-100"
                  }`}
                >
                  <Lock opening={lock !== "locked"} />
                  <span
                    className={`font-gotham font-medium text-[0.875rem] tracking-[0.04em] text-white/50 [transition:opacity_300ms_ease] ${
                      lock !== "locked" ? "opacity-0" : ""
                    }`}
                  >
                    Something hidden…
                  </span>
                </div>
              )}
              {isSecret &&
                confetti.map((b) => (
                  <div
                    key={b.id}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 [container-type:size]"
                  >
                    {b.pieces.map((c, k) => (
                      <span
                        key={k}
                        className="absolute block"
                        style={
                          {
                            left: `${c.land}%`,
                            bottom: c.z,
                            width: c.w,
                            height: c.h,
                            "--sx": `${c.sx}cqw`,
                            "--sy": `${c.sy}cqh`,
                            "--ax": `${c.ax}cqw`,
                            "--ay": `${c.ay}cqh`,
                            "--r": `${c.r}deg`,
                            animation:
                              `pc-confetti-fly ${c.dur}ms ${c.delay}ms both, ` +
                              `pc-confetti-fade ${CONFETTI_FADE_MS}ms ease ${CONFETTI_REST_MS}ms forwards`,
                          } as React.CSSProperties
                        }
                      >
                        {c.curl ? (
                          <span
                            className="block h-full w-full"
                            style={{
                              animation: `pc-confetti-flutter ${FLUTTER_MS}ms ease-in-out ${c.delay}ms ${
                                2 * Math.max(1, Math.round((c.dur * 0.9) / (2 * FLUTTER_MS)))
                              } alternate both`,
                            }}
                          >
                            <Curl color={c.color} />
                          </span>
                        ) : (
                          <span className="block h-full w-full rounded-[1px]" style={{ background: c.color }} />
                        )}
                      </span>
                    ))}
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      {n > 1 && (
        <div className="mt-5 flex items-center gap-2 upto-639:mt-4">
          <button
            type="button"
            aria-label="Previous photo"
            disabled={!hasPrev}
            onClick={() => go(current - 1)}
            className={`${ARROW} mr-2`}
          >
            <Chevron dir="left" />
          </button>
          {cards.slice(0, shown).map((p, i) => (
            <button
              key={p.src}
              type="button"
              aria-label={`Show photo ${i + 1} of ${shown}`}
              aria-current={i === current ? "true" : undefined}
              onClick={() => go(i)}
              className={`h-2.5 cursor-pointer rounded-full [transition:width_200ms_ease,background-color_200ms_ease] ${
                i === current ? "w-6 bg-white" : "w-2.5 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
          <button
            type="button"
            aria-label="Next photo"
            disabled={!hasNext}
            onClick={() => go(current + 1)}
            className={`${ARROW} ml-2`}
          >
            <Chevron dir="right" />
          </button>
        </div>
      )}
    </div>
  );
}
