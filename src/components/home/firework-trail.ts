type Spark = { x: number; y: number; vx: number; vy: number; age: number; life: number; phase: number };
type Mote = { x: number; y: number; vx: number; vy: number; age: number; life: number; size: number; colour: string };

const PX = 3;
const GRAVITY = 240;
const RATE = 16;

const FRAMES = [
  ["..#..", ".+#+.", "##+##", ".+#+.", "..#.."],
  ["..#..", ".###.", "..#.."].map((r) => `.${r}.`),
  [".+.", "+#+", ".+."].map((r) => `.${r}.`),
  ["#"].map((r) => `..${r}..`),
];

const DUST = ["219,221,158", "205,207,144", "232,234,178", "190,192,130"];

export function createFireworkTrail(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  const sparks: Spark[] = [];
  const motes: Mote[] = [];
  let raf = 0;
  let last = 0;
  let emitter: (() => { x: number; y: number } | null) | null = null;
  let carry = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const spawn = (x: number, y: number) =>
    sparks.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12,
      age: 0,
      life: 3 + Math.random() * 1.5,
      phase: Math.random() * Math.PI * 2,
    });

  const drawSprite = (x: number, y: number, frame: string[], alpha: number) => {
    if (!ctx) return;
    const half = (frame.length * PX) / 2;
    const left = Math.round(x - half);
    const top = Math.round(y - half);
    frame.forEach((row, j) =>
      [...row].forEach((c, i) => {
        if (c === ".") return;
        ctx.fillStyle = c === "#" ? `rgba(255,255,255,${alpha})` : `rgba(205,205,215,${alpha * 0.85})`;
        ctx.fillRect(left + i * PX, top + j * PX, PX, PX);
      }),
    );
  };

  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 0);
    last = now;
    if (!ctx) return;
    const { width, height } = canvas.getBoundingClientRect();

    const at = emitter?.();
    if (at) {
      carry += RATE * dt;
      for (; carry >= 1; carry--) spawn(at.x, at.y);
    }

    ctx.clearRect(0, 0, width, height);
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.age += dt;
      s.vy += GRAVITY * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      if (s.age >= s.life || s.y > height + 10) {
        sparks.splice(i, 1);
        continue;
      }
      const t = s.age / s.life;
      const sprite = FRAMES[Math.min(FRAMES.length - 1, Math.floor(t * FRAMES.length))];
      const twinkle = 0.55 + 0.45 * Math.abs(Math.sin(s.phase + s.age * 14));
      drawSprite(s.x, s.y, sprite, +(twinkle * (1 - t * 0.5)).toFixed(3));
    }

    for (let i = motes.length - 1; i >= 0; i--) {
      const m = motes[i];
      m.age += dt;
      m.vx *= 1 - 3 * dt;
      m.vy += 420 * dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      if (m.age >= m.life) {
        motes.splice(i, 1);
        continue;
      }
      ctx.fillStyle = `rgba(${m.colour},${(1 - m.age / m.life).toFixed(3)})`;
      ctx.fillRect(Math.round(m.x), Math.round(m.y), m.size, m.size);
    }

    if (sparks.length || motes.length || emitter) raf = requestAnimationFrame(frame);
    else raf = 0;
  };

  const wake = () => {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };

  resize();
  window.addEventListener("resize", resize);

  return {
    start(source: () => { x: number; y: number } | null) {
      emitter = source;
      wake();
    },
    stop() {
      emitter = null;
    },
    dust(x: number, y: number, dir = 1, count = 14) {
      for (let i = 0; i < count; i++) {
        const forward = Math.random() < 0.7;
        motes.push({
          x: x + (Math.random() - 0.5) * 16,
          y: y - Math.random() * 3,
          vx: (forward ? dir : -dir) * (40 + Math.random() * 110),
          vy: -(40 + Math.random() * 90),
          age: 0,
          life: 0.35 + Math.random() * 0.35,
          size: Math.random() < 0.5 ? 3 : 4,
          colour: DUST[Math.floor(Math.random() * DUST.length)],
        });
      }
      wake();
    },
    destroy() {
      emitter = null;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    },
  };
}
