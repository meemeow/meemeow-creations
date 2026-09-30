"use client";

import { useEffect, useRef } from "react";

// Cursor-following particle ring, ported from the Antigravity pricing page's WebGL
// particles (same field, ring maths and constants) to a 2D canvas, in shades of white and
// drawn as blocky Minecraft-style pixels. An evenly spread field of particles sits at
// speck size; a ring that eases toward the cursor swells the particles on its edge into
// short dashes pointing away from its centre (and nudges them outward), leaving medium
// dots inside it. Noise keeps everything wobbling and breathing.
//
// Positions are worked out in the original's "local" units: the ring sits at ~87.5% of
// the cursor's offset from the centre, with a radius of 0.175 local units.

// Local units → CSS px, calibrated against the live page so the ring is the same size on
// screen (about a third of the field's height across its radius).
const LOCAL_PER_HEIGHT = 1.35;
const SPACING = 0.0187; // particle spacing in local units (its Poisson min distance at density 200)
const RING_WIDTH = 0.15;
const RING_WIDTH2 = 0.05;
const RING_DISPLACEMENT = 0.15;
const PARTICLE_SCALE = 1.2; // the original's 0.75, scaled up to match its on-screen dash size
// The ring, and it following the cursor: both switched off for now, leaving the plain field of
// pixel specks (true brings them back). With only FOLLOW_CURSOR off, the ring drifts on its own.
const SHOW_RING = false;
const FOLLOW_CURSOR = false;
// Shades from the brightest to the darkest, picked by a slow colour noise.
const SHADES: [number, number, number][] = [
  [255, 255, 255],
  [196, 196, 196],
  [58, 58, 58],
];

// x/y: home position; px/py: last drawn position, fed back each frame as in the original
// shader (which settles everything at 1.25x its home, so the ring lands on the cursor).
type Particle = { x: number; y: number; scale: number; velocity: number; px: number; py: number };

// --- 3D simplex noise (Stefan Gustavson's), the same noise family as the original's snoise ---
const GRAD3 = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1],
  [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
];
const PERM = (() => {
  const p = Array.from({ length: 256 }, (_, i) => i);
  let seed = 1337;
  for (let i = 255; i > 0; i--) {
    seed = (seed * 16807) % 2147483647;
    const j = seed % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  return Uint8Array.from({ length: 512 }, (_, i) => p[i & 255]);
})();
const F3 = 1 / 3;
const G3 = 1 / 6;
function snoise(x: number, y: number, z: number) {
  const s = (x + y + z) * F3;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);
  const k = Math.floor(z + s);
  const t = (i + j + k) * G3;
  const x0 = x - (i - t);
  const y0 = y - (j - t);
  const z0 = z - (k - t);
  let i1, j1, k1, i2, j2, k2;
  if (x0 >= y0) {
    if (y0 >= z0) [i1, j1, k1, i2, j2, k2] = [1, 0, 0, 1, 1, 0];
    else if (x0 >= z0) [i1, j1, k1, i2, j2, k2] = [1, 0, 0, 1, 0, 1];
    else [i1, j1, k1, i2, j2, k2] = [0, 0, 1, 1, 0, 1];
  } else if (y0 < z0) [i1, j1, k1, i2, j2, k2] = [0, 0, 1, 0, 1, 1];
  else if (x0 < z0) [i1, j1, k1, i2, j2, k2] = [0, 1, 0, 0, 1, 1];
  else [i1, j1, k1, i2, j2, k2] = [0, 1, 0, 1, 1, 0];
  const corners = [
    [x0, y0, z0, 0, 0, 0],
    [x0 - i1 + G3, y0 - j1 + G3, z0 - k1 + G3, i1, j1, k1],
    [x0 - i2 + 2 * G3, y0 - j2 + 2 * G3, z0 - k2 + 2 * G3, i2, j2, k2],
    [x0 - 1 + 3 * G3, y0 - 1 + 3 * G3, z0 - 1 + 3 * G3, 1, 1, 1],
  ];
  const ii = i & 255;
  const jj = j & 255;
  const kk = k & 255;
  let n = 0;
  for (const [cx, cy, cz, di, dj, dk] of corners) {
    let tt = 0.6 - cx * cx - cy * cy - cz * cz;
    if (tt < 0) continue;
    const g = GRAD3[PERM[ii + di + PERM[jj + dj + PERM[kk + dk]]] % 12];
    tt *= tt;
    n += tt * tt * (g[0] * cx + g[1] * cy + g[2] * cz);
  }
  return 32 * n;
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export default function PixelParticles({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let unit = 1; // CSS px per local unit
    let particles: Particle[] = [];

    // Evenly spread field (a jittered grid standing in for the original's Poisson disk),
    // over the middle 80% (it spreads to 1.25x once drawn) plus a margin for the wobble.
    const setup = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      unit = h * LOCAL_PER_HEIGHT;
      const step = SPACING * unit;
      particles = [];
      for (let y = h * 0.1 - step * 2; y < h * 0.9 + step * 2; y += step) {
        for (let x = w * 0.1 - step * 2; x < w * 0.9 + step * 2; x += step) {
          const px = (x + (Math.random() - 0.5) * step * 0.8 - w / 2) / unit;
          const py = (y + (Math.random() - 0.5) * step * 0.8 - h / 2) / unit;
          particles.push({ x: px, y: py, scale: 0, velocity: 0, px: px * 1.25, py: py * 1.25 });
        }
      }
    };

    const ring = { x: 0, y: 0 };
    const mouse = { x: 0, y: 0, over: false };
    const start = performance.now();
    let last = start;

    // `settle`: jump every particle straight to the size (and speed) it eases toward, instead of
    // easing there over many frames; used once at the start.
    const frame = (now: number, settle = false) => {
      const elapsed = (now - start) / 1000;
      // The original steps once per frame at 60fps; scale its easing to the real frame time.
      const steps = Math.min(4, Math.max(0.25, ((now - last) / 1000) * 60));
      last = now;
      const ease = (k: number) => 1 - Math.pow(1 - k, steps);

      // Ring centre: wanders on its own, and eases toward the cursor while it's over the field.
      const wx = snoise(elapsed * 0.66 + 94.234, 0, 0);
      const wy = snoise(elapsed * 0.75 + 21.028, 7.1, 0);
      const tx = mouse.over ? mouse.x * 0.875 + wx * 0.1 : wx * 0.2;
      const ty = mouse.over ? mouse.y * 0.875 + wy * 0.1 : wy * 0.1;
      const k = ease(mouse.over ? 0.02 : 0.01);
      ring.x += (tx - ring.x) * k;
      ring.y += (ty - ring.y) * k;
      const radius = 0.175 + Math.sin(elapsed) * 0.03 + Math.cos(elapsed * 3) * 0.02;

      const time = elapsed * 0.5;
      const scaleK = settle ? 1 : ease(0.2);
      const sizePerScale = 3.5 * PARTICLE_SCALE * (w / 2000);
      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        const dx = p.x - ring.x;
        const dy = p.y - ring.y;
        const dist = Math.hypot(dx, dy);
        const n0 = snoise(p.x * 0.2 + 18.4924, p.y * 0.2 + 72.9744, time * 0.5);
        const dist1 = Math.hypot(dx + n0 * 0.005, dy + n0 * 0.005);

        // Band around the ring's edge (hollow inside), a sharper inner band, and the disc.
        // (all nothing with the ring hidden, leaving just the field's specks)
        let t = SHOW_RING ? smoothstep(radius - RING_WIDTH * 2, radius, dist) - smoothstep(radius, radius + RING_WIDTH, dist1) : 0;
        let t2 = SHOW_RING ? smoothstep(radius - RING_WIDTH2 * 2, radius, dist) - smoothstep(radius, radius + RING_WIDTH2, dist1) : 0;
        const t3 = SHOW_RING ? smoothstep(radius + RING_WIDTH2, radius, dist) : 0;
        t = t * t;
        t2 = Math.max(0, t2) ** 3;
        t += t2 * 3 + t3 * 0.4;
        t += snoise(p.x * 30 + 11.4924, p.y * 30 + 12.9744, time * 0.5) * t3 * 0.5;
        const nS = snoise(p.x * 2 + 18.4924, p.y * 2 + 72.9744, time * 0.5);
        t += ((nS + 1.5) * 0.5) ** 2 * 0.6;

        // Wobble: mid and close scale noise, plus a gentle wave that grows away from the ring.
        let ddx = snoise(p.x * 4 + 88.494, p.y * 4 + 32.4397, time * 0.35) * 0.03;
        let ddy = snoise(p.x * 4 + 50.904, p.y * 4 + 120.947, time * 0.35) * 0.03;
        ddx += snoise(p.x * 20 + 18.4924, p.y * 20 + 72.9744, time * 0.5) * 0.005;
        ddy += snoise(p.x * 20 + 50.904, p.y * 20 + 120.947, time * 0.5) * 0.005;
        const falloff = Math.min(1, dist);
        ddx += Math.sin(p.x * 20 + time * 4) * 0.02 * falloff;
        ddy += Math.cos(p.y * 20 + time * 3) * 0.02 * falloff;

        // Last position fed back (and the ring's particles pushed outward), as in the shader.
        const push = t2 ** 0.75 * RING_DISPLACEMENT;
        const ox = p.px * 0.8 - (ring.x - (p.x + ddx)) * push;
        const oy = p.py * 0.8 - (ring.y - (p.y + ddy)) * push;
        p.scale += (t - p.scale) * scaleK;
        p.velocity = settle ? p.scale * 0.5 : p.velocity * 0.5 + p.scale * 0.25; // (its steady value)

        const fx = p.x + ddx + ox * 0.25;
        const fy = p.y + ddy + oy * 0.25;
        p.px = fx;
        p.py = fy;
        const alpha = smoothstep(0.1, 0.2, p.scale);
        if (alpha < 0.01) continue;
        const sx = w / 2 + fx * unit;
        const sy = h / 2 + fy * unit;
        if (sx < -10 || sy < -10 || sx > w + 10 || sy > h + 10) continue;

        // Shade: the original's three-stop gradient on a slow colour noise, with small
        // particles dimmed by their velocity so the specks recede.
        const nc = (snoise(fx * 2 + 74.664, fy * 2 + 91.556, elapsed * 0.5) + 1) * 0.5;
        const progress = smoothstep(0, 0.75, nc * nc);
        const [a, b] = progress < 0.8 ? [SHADES[0], SHADES[1]] : [SHADES[1], SHADES[2]];
        const m = progress < 0.8 ? progress / 0.8 : (progress - 0.8) / 0.2;
        const dim = 0.35 + 0.65 * Math.min(1, p.velocity);
        const r = Math.round((a[0] + (b[0] - a[0]) * m) * dim);
        const g = Math.round((a[1] + (b[1] - a[1]) * m) * dim);
        const bl = Math.round((a[2] + (b[2] - a[2]) * m) * dim);
        ctx.fillStyle = `rgba(${r},${g},${bl},${alpha.toFixed(3)})`;

        // A dash pointing away from the ring's centre (length = the particle's size, 0.4x as
        // thick), drawn as a run of square pixels snapped to its own grid, Minecraft style.
        const size = p.scale * sizePerScale;
        const block = Math.max(1, Math.round(size * 0.4));
        const count = Math.max(1, Math.round(size / block));
        const angle = Math.atan2(fy - ring.y, fx - ring.x) + snoise(fx * 10 + 18.4924, fy * 10 + 72.9744, elapsed * 0.85) * 0.5;
        const ux = Math.cos(angle) * block;
        const uy = Math.sin(angle) * block;
        for (let q = 0; q < count; q++) {
          const off = q - (count - 1) / 2;
          const bx = Math.round((sx + ux * off) / block) * block;
          const by = Math.round((sy + uy * off) / block) * block;
          ctx.fillRect(bx - block / 2, by - block / 2, block, block);
        }
      }
    };

    let raf = 0;
    let running = false;
    let visible = true;
    const loop = (now: number) => {
      frame(now);
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (running || reduced || document.hidden || !visible) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    setup();
    // Settle the sizes before the first paint (and for reduced motion, the still frame), in one
    // pass: easing them in over 40 frames up front held up every visit to Home by most of a second.
    frame(start, true);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouse.over = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      mouse.x = (x - w / 2) / unit;
      mouse.y = (y - h / 2) / unit;
    };
    const onLeave = () => {
      mouse.over = false;
    };
    const onResize = () => {
      setup();
      if (!running) frame(performance.now());
    };
    const onVisibility = () => (document.hidden ? pause() : play());
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else pause();
    });
    observer.observe(canvas);

    if (FOLLOW_CURSOR && !reduced) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      pause();
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
