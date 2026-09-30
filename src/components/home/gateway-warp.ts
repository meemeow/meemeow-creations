type Router = { push: (href: string) => void };

const FADE_IN_MS = 280;
const LOAD_MS = 1500;
const DONE_MS = 550;
const FADE_OUT_MS = 420;
const MAX_WAIT_MS = 10000;

const PROGRESS: [number, number][] = [
  [0.12, 0.08],
  [0.3, 0.22],
  [0.42, 0.41],
  [0.62, 0.48],
  [0.76, 0.77],
  [0.9, 0.86],
  [1, 1],
];

const GATEWAY_TILE = "/assets/images/gateway-portal.webp";

export function warpTo(href: string, line: string, router: Router) {
  const screen = document.createElement("div");
  screen.setAttribute("role", "status");
  screen.className = "font-pixel text-white";
  Object.assign(screen.style, {
    position: "fixed",
    inset: "0",
    zIndex: "10000",
    backgroundColor: "#050b14",
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${GATEWAY_TILE})`,
    backgroundSize: "auto, clamp(96px, 8vw, 144px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1.1em",
    fontSize: "clamp(12px, 1.5vw, 22px)",
    textShadow: "0.15em 0.15em 0 #3f3f3f",
    textAlign: "center",
    padding: "0 16px",
    opacity: "0",
  } satisfies Partial<CSSStyleDeclaration>);

  const label = document.createElement("p");
  label.textContent = line;
  const track = document.createElement("div");
  Object.assign(track.style, {
    width: "clamp(180px, 24vw, 400px)",
    height: "clamp(3px, 0.3vw, 5px)",
    background: "#808080",
  } satisfies Partial<CSSStyleDeclaration>);
  const fill = document.createElement("div");
  Object.assign(fill.style, {
    height: "100%",
    width: "0%",
    background: "#80ff80",
  } satisfies Partial<CSSStyleDeclaration>);
  track.append(fill);
  screen.append(label, track);
  document.body.append(screen);

  screen.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE_IN_MS, fill: "forwards" });
  fill.animate(
    [
      { width: "0%" },
      ...PROGRESS.flatMap(([at, share], i) => {
        const prev = i === 0 ? 0 : PROGRESS[i - 1][1];
        return [
          { width: `${prev * 100}%`, offset: Math.max(0, at - 0.06) },
          { width: `${share * 100}%`, offset: at },
        ];
      }),
    ],
    { duration: LOAD_MS, delay: FADE_IN_MS, fill: "forwards" },
  );

  window.setTimeout(() => {
    label.textContent = "Done!";
  }, FADE_IN_MS + LOAD_MS);
  window.setTimeout(
    () => {
      router.push(href);
      const started = performance.now();
      const wait = () => {
        if (location.pathname !== href && performance.now() - started < MAX_WAIT_MS) {
          requestAnimationFrame(wait);
          return;
        }
        window.setTimeout(() => {
          const out = screen.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: FADE_OUT_MS,
            easing: "ease-out",
            fill: "forwards",
          });
          out.onfinish = () => screen.remove();
        }, 120);
      };
      requestAnimationFrame(wait);
    },
    FADE_IN_MS + LOAD_MS + DONE_MS,
  );
}
