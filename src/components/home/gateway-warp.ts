// The end of the ender pearl mini-game: through the gateway. The screen fades to Minecraft's
// loading screen (over a wall of End gateway blocks) with a label ("Initializing profile...") over a
// loading bar that fills in uneven jumps, as the game's does; once it's full the label turns to
// "Done!", the site moves to that page, and the screen quickly fades away to reveal it.
// Built outside React on purpose: the home page (and everything it rendered) goes away mid-way,
// while this has to stay up until the new page is in.

type Router = { push: (href: string) => void };

const FADE_IN_MS = 280; // to the loading screen
const LOAD_MS = 1500; // the bar filling
const DONE_MS = 550; // "Done!" before moving on
const FADE_OUT_MS = 420; // the screen away, over the new page
const MAX_WAIT_MS = 10000; // give up waiting for the new page after this

// How the bar fills: [share of the time, share filled], in jumps with pauses between.
const PROGRESS: [number, number][] = [
  [0.12, 0.08],
  [0.3, 0.22],
  [0.42, 0.41],
  [0.62, 0.48],
  [0.76, 0.77],
  [0.9, 0.86],
  [1, 1],
];

// The background: a wall of End gateway blocks (the gateways' own animated portal face, tiled
// like the game tiles its menu background), dimmed a little so the text reads.
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
  // The bar: grey track, green fill, thin like the game's.
  const track = document.createElement("div");
  Object.assign(track.style, {
    width: "clamp(180px, 24vw, 400px)",
    height: "clamp(3px, 0.3vw, 5px)",
    background: "#808080",
  } satisfies Partial<CSSStyleDeclaration>);
  const fill = document.createElement("div");
  Object.assign(fill.style, { height: "100%", width: "0%", background: "#80ff80" } satisfies Partial<CSSStyleDeclaration>);
  track.append(fill);
  screen.append(label, track);
  document.body.append(screen);

  screen.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE_IN_MS, fill: "forwards" });
  // each jump happens quickly, then it holds
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
  window.setTimeout(() => {
    router.push(href);
    // Once the address has changed the new page is in; let it paint, then fade the screen away.
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
  }, FADE_IN_MS + LOAD_MS + DONE_MS);
}
