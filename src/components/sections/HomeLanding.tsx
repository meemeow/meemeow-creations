"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import EndGateways, { GATEWAYS_LEFT } from "./EndGateways";
import EndIsland from "./EndIsland";
import Hud, { PEARL_SLOT } from "./Hud";
import PearlGame from "./PearlGame";
import { createFireworkTrail } from "./fireworkTrail";
import PixelParticles from "./PixelParticles";
import Steve, { STEVE_VIEWBOX, type StevePose } from "./Steve";

// The home page's opening: the screen starts black and fades in on the particle field and the
// End island; Steve glides in on elytra, low and level from off the left edge, slows, pitches up
// out of the glide and lands on the left of the platform. Just after touchdown "You Have Landed
// On..." slowly fades in while his momentum skids him across to his spot, where he turns to face
// the viewer; after a pause the logo follows.
// With reduced motion it opens on the final scene.

// Sizes and positions in % of the island's width (it's 17 blocks across).
const BLOCK = 100 / 17;
const STEVE_PX = (1.8 * BLOCK) / 32; // one Steve skin pixel (he's 1.8 blocks, 32 pixels, tall)
const SPRITE_W = STEVE_VIEWBOX.w * STEVE_PX;
const LAND_AT = 0.8 * BLOCK; // where he touches down (his centre)
// Steve's stopping spot and the sign both sit SHIFT_LEFT blocks left of where they were first placed.
const SHIFT_LEFT = 0.6 * BLOCK;
const STAND_AT = 2.6 * BLOCK - SHIFT_LEFT; // where his skid stops and he turns (short of the logo)
const SIGN_LEFT = 9 - SHIFT_LEFT; // the sign's left edge, % of the island
const SIGN_LIFT = 0.9 * BLOCK; // the sign starts at his waist (half of his 1.8 blocks)
// The heading is pulled left so it ends short of the End gateways (with a small gap), but never
// past the screen's left edge, and sits level with their portals (lined up in the layout effect
// below). In cqw: 1% of the island's width.
const HEADING_END = GATEWAYS_LEFT - 0.35 * BLOCK;

// Where the island sits in the scene. The layout is designed at 1920px wide (the island 69.36% of
// the width, centred, its underside running off the bottom); every size keeps that composition,
// with the sign and Steve sized in island widths. On narrower, taller screens (tablets, phones)
// the island widens toward the full width, and where there's sky to spare it floats up off the
// bottom so the scene sits in the middle instead of a strip along the floor.
// Screens taller than they are wide (phones, upright tablets) have sky to spare, so there the sign
// is "stacked": centred up in the sky above the gateways, bigger, instead of beside Steve.
type IslandBox = {
  left: number; // % of the scene
  width: number; // % of the scene
  lift: number; // px off the bottom
  stacked: boolean;
  // Side by side, but too narrow for the one-line heading beside Steve (it would have to shrink
  // to fit): it goes on two lines instead, full size, up in the sky above Steve with the logo.
  twoLine: boolean;
  headingPx: number; // stacked sign sizes
  logoPx: number;
  signGapPx: number; // stacked: from the island's top up to the sign's bottom
};
const DESKTOP_ISLAND: IslandBox = { left: 15.32, width: 69.36, lift: 0, stacked: false, twoLine: false, headingPx: 0, logoPx: 0, signGapPx: 0 };
const STACK_BELOW = 1.3; // aspect ratio
const FILL = 0.68; // share of the height the side-by-side scene fills
const SCENE_BLOCKS = 7.25; // its height in blocks: gateway tops (4.75 up) to the 2.5 rows showing
const STACK_GAP = 1; // blocks between the gateway tops and the stacked sign, at least
const SIGN_GAP = 1.4; // stacked: space between the heading and the logo, in heading heights
const GATEWAY_TOP = 4.75; // blocks above the island (they float 1, and are 5 of 0.75 tall)
function islandFor(w: number, h: number): IslandBox {
  if (!w || !h) return DESKTOP_ISLAND;
  const aspect = w / h;
  // Side by side (landscape): size the island so the scene fills the height the way it does at
  // 1920x1080 (gateway tops to the visible underside is ~68% of it), never smaller than there,
  // and at most nearly the full width. Where it can't fill the height, lift it to centre it.
  // (it comes out at the 1920 layout's 69.36% there; short screens such as phones on their side
  // get a smaller island so the gateways stay below the header)
  const width = Math.min(96, Math.max(30, ((FILL * h * 17) / SCENE_BLOCKS / w) * 100));
  const left = (100 - width) / 2;
  const islandPx = (width / 100) * w;
  const block = islandPx / 17;
  if (aspect >= STACK_BELOW) {
    const lift = Math.max(0, Math.min(1.5 * block, (FILL * h - SCENE_BLOCKS * block) / 2));
    // the one-line heading's natural width vs the room from the screen edge to the gateways
    const screenEdge = (left / width) * 100 + SIGN_LEFT;
    const room = (islandPx * (HEADING_END + screenEdge)) / 100 - 16;
    // two lines from 866px to 1535px wide, and anywhere else the one line wouldn't fit
    const twoLine = (w >= TWO_LINE_FROM && w <= TWO_LINE_TO) || 22.5 * 0.02944 * islandPx > room;
    return { ...DESKTOP_ISLAND, left, width, lift, twoLine };
  }

  // Stacked: the island low, its top about three quarters of the way down (as far as its 2.5
  // rows allow), the gateways on it, and the heading and logo centred in the open sky above them,
  // with room to breathe (a clear margin under the header and a gap above the gateways).
  const signH = () => headingPx * (1 + SIGN_GAP) + logoPx / 3;
  const islandTop = Math.min(h * 0.74, h - 2.5 * block);
  const lift = Math.max(0, h - islandTop - 2.5 * block);
  const skyBottom = islandTop - (GATEWAY_TOP + STACK_GAP) * block; // just above the gateways
  const margin = Math.max(40, h * 0.07); // under the header
  const room = skyBottom - margin;
  // Taller phones have more sky, so the sign grows with it (up to 1.4x); the heading stays on one
  // line across the island.
  const grow = Math.min(1.4, Math.max(1, room / 300));
  let headingPx = Math.min((islandPx * 0.88 * grow) / 21, (islandPx * 0.92) / 21, 38);
  let logoPx = Math.min(islandPx * 0.42 * grow, islandPx * 0.62, 320);
  if (signH() > room * 0.8) {
    const k = Math.max(0.4, (room * 0.8) / signH()); // short screen: shrink the sign to fit
    headingPx *= k;
    logoPx *= k;
  }
  // a little below the middle of the sky (but never onto the gateways)
  const signBottom = Math.min(skyBottom, margin + room * 0.6 + signH() / 2);
  return { left, width, lift, stacked: true, twoLine: false, headingPx, logoPx, signGapPx: islandTop - signBottom };
}
// two-line heading: the sign's bottom (the logo) sits just over Steve's head, in blocks
const TWO_LINE_LIFT = 2.2 * BLOCK;
const TWO_LINE_FROM = 866; // px wide
const TWO_LINE_TO = 1535;
const HEADING_DROP = 0.125; // and then this many blocks lower than level with them

// Timeline, ms.
// Opening: hold on black, then a slow fade up on the scene. Steve sets off partway through and
// the fade keeps going while he flies, finishing exactly as his feet touch the platform.
const BLACK_HOLD_MS = 500;
const FLY_START_MS = BLACK_HOLD_MS + 3000; // later, so the (unchanged) fade still ends at touchdown
const FLY_MS = 1500; // a fast approach, which the landing slide carries on from
const FADE_MS = FLY_START_MS + FLY_MS - BLACK_HOLD_MS;
// Flight curve: a gentle start, then full speed right through touchdown (the curve ends at a
// slope of 1), so the skid can carry on at exactly the speed he lands at.
const FLY_EASING = "cubic-bezier(.25, .15, .7, .7)";
// The flight's last stretch: from 86% of the way (0.12 of the start offset left to go) to landing.
const FINAL_OFFSET = 0.86;
const FINAL_SHARE = 0.12;
// After touchdown he slides all the way to his spot, slowing at a steady rate (a quadratic ease
// out, whose starting slope is 2): its length is worked out from his landing speed so the hand-off
// is seamless, kept within these bounds.
const SKID_EASING = "cubic-bezier(.333, .667, .667, 1)";
const SKID_MIN_MS = 600;
const SKID_MAX_MS = 2200;
// Dust puffs during the skid: [share of the skid, how many motes], dying away as he slows.
const SKID_DUST: [number, number][] = [
  [0.08, 8],
  [0.18, 6],
  [0.3, 4],
  [0.45, 3],
  [0.62, 2],
];
// The sign, built for suspense: the heading starts to appear near the end of Steve's skid, as he's
// about to turn and face the viewer (at this share of it), fading in slowly (starting almost
// unseen) while drifting up into place; the logo holds back until the heading is fully in (he
// has stopped and turned by then), pauses, and only then fades in.
const HEADING_AT = 0.65;
const HEADING_MS = 1600;
const LOGO_PAUSE_MS = 400; // after the heading is fully in
const LOGO_MS = 1600;
// The firework boost: sparks shed from behind him for this share of the flight (then it burns
// out before the flare).
const BOOST_SHARE = 0.62;

// The intro plays once per browser session; after that Home opens on the finished scene (Steve
// standing, sign up). Remembered in sessionStorage, with a module flag as a fallback for when
// storage is unavailable (it also covers client-side navigation).
const PLAYED_KEY = "home-intro-played";
let playedThisLoad = false;
const introPlayed = () => {
  if (playedThisLoad) return true;
  try {
    return sessionStorage.getItem(PLAYED_KEY) === "1";
  } catch {
    return false;
  }
};
const forgetIntroPlayed = () => {
  playedThisLoad = false;
  try {
    sessionStorage.removeItem(PLAYED_KEY);
  } catch {
    // nothing stored
  }
};
const markIntroPlayed = () => {
  playedThisLoad = true;
  try {
    sessionStorage.setItem(PLAYED_KEY, "1");
  } catch {
    // private mode etc.: the module flag still covers this visit
  }
};

const leftFor = (centre: number) => `${centre - SPRITE_W / 2}%`;

// `replay`: forget that the intro has played and run it again (set on a hard reload).
export default function HomeLanding({ replay = false }: { replay?: boolean }) {
  const [pose, setPose] = useState<StevePose>("fly");
  const [ready, setReady] = useState(false); // the intro is over (he's standing, facing the viewer)
  const [slot, setSlot] = useState(0); // the hotbar's chosen slot
  const holding = ready && slot === PEARL_SLOT; // the ender pearl is in his hand
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const steveRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const sparksRef = useRef<HTMLCanvasElement | null>(null);
  const [island, setIsland] = useState<IslandBox>(DESKTOP_ISLAND);

  useLayoutEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const fit = () => {
      const next = islandFor(scene.clientWidth, scene.clientHeight);
      setIsland((prev) =>
        Math.abs(prev.width - next.width) < 0.01 &&
        Math.abs(prev.lift - next.lift) < 0.5 &&
        prev.stacked === next.stacked &&
        prev.twoLine === next.twoLine &&
        Math.abs(prev.signGapPx - next.signGapPx) < 0.5 &&
        Math.abs(prev.headingPx - next.headingPx) < 0.1
          ? prev
          : next,
      );
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(scene);
    return () => observer.disconnect();
  }, []);
  const { stacked, twoLine } = island;
  // the screen's left edge, in cqw left of the sign (for keeping the heading on screen)
  const screenEdge = (island.left / island.width) * 100 + SIGN_LEFT;
  const islandStyle = {
    bottom: island.lift,
    left: `${island.left}%`,
    width: `${island.width}%`,
  };

  // Line the heading up with the gateways' portals: its middle level with theirs. Measured in the
  // island's own layout (offsetTop ignores the reveal's slide; both float together), and again
  // whenever the scene resizes or the pixel font arrives.
  useLayoutEffect(() => {
    const heading = headingRef.current;
    const island = heading?.offsetParent;
    if (!heading || !island) return;
    if (stacked || twoLine) {
      heading.style.top = "0px"; // stacked in the sky: nothing to line up with
      return;
    }
    const align = () => {
      const portal = island.querySelector("[data-gateway-portal]");
      if (!portal) return;
      heading.style.top = "0px";
      const box = island.getBoundingClientRect();
      const p = portal.getBoundingClientRect();
      const portalMiddle = p.top + p.height / 2 - box.top;
      const shift =
        portalMiddle +
        (HEADING_DROP * box.width) / 17 -
        (heading.offsetTop + heading.offsetHeight / 2);
      // But never down onto the logo (on small screens the portals sit lower than it).
      // (the image itself: it sits well below the top of its wrapper)
      const logo = logoRef.current?.querySelector("img") ?? logoRef.current;
      const logoTop = (logo?.getBoundingClientRect().top ?? Infinity) - box.top;
      const room = logoTop - 8 - (heading.offsetTop + heading.offsetHeight);
      heading.style.top = `${Math.round(Math.min(shift, room))}px`;
    };
    align();
    const observer = new ResizeObserver(align);
    observer.observe(island.parentElement ?? island);
    // (the gateway is sized by its own effect, after this one)
    const gateway = island.querySelector("[data-gateway-portal]")?.parentElement;
    if (gateway) observer.observe(gateway);
    // (not once this layout is gone: a stacked sign mustn't be pulled back into line)
    let live = true;
    document.fonts?.ready.then(() => live && align());
    return () => {
      live = false;
      observer.disconnect();
    };
  }, [stacked, twoLine]);

  // Layout effect: decide before the first paint, so a return visit doesn't flash black.
  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const steve = steveRef.current;
    const heading = headingRef.current;
    const logo = logoRef.current;
    if (!overlay || !steve || !heading || !logo) return;

    const timers: number[] = [];
    const cleanups: (() => void)[] = [];
    const anims: Animation[] = [];
    const later = (ms: number, fn: () => void) =>
      timers.push(window.setTimeout(fn, ms));
    const run = (
      el: Element,
      frames: Keyframe[],
      opts: KeyframeAnimationOptions,
    ) => {
      const a = el.animate(frames, { fill: "forwards", ...opts });
      anims.push(a);
      return a;
    };
    const revealHeading = (instant: boolean, delay = 0) =>
      run(
        heading,
        [
          { opacity: 0, transform: "translateY(10px)" },
          { opacity: 0.12, transform: "translateY(7px)", offset: 0.35 },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: instant ? 0 : HEADING_MS,
          delay: instant ? 0 : delay,
          easing: "ease-in-out",
        },
      );
    const revealLogo = (instant: boolean) =>
      run(logo, [{ opacity: 0 }, { opacity: 1 }], {
        duration: instant ? 0 : LOGO_MS,
        delay: instant ? 0 : LOGO_PAUSE_MS,
        easing: "ease-out",
      });

    // A hard reload resets it. Seen it already this session (or reduced motion): open on the
    // finished scene.
    if (replay) forgetIntroPlayed();
    if (
      introPlayed() ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      overlay.style.display = "none";
      steve.style.left = leftFor(STAND_AT);
      steve.style.visibility = "visible";
      // Deliberately set here, before the first paint: whether the intro has played lives in
      // sessionStorage, which the server render can't see.
      setPose("front");
      setReady(true);
      revealHeading(true);
      revealLogo(true);
      return;
    }
    markIntroPlayed();

    // 1. A held beat of black, then it slowly fades away, showing the field and the island.
    run(overlay, [{ opacity: 1 }, { opacity: 0 }], {
      duration: FADE_MS,
      delay: BLACK_HOLD_MS,
      easing: "ease-in-out",
    });

    // The glide angle and limb swings (Steve.tsx reads --glide, --legs, --arms) have to be
    // registered properties to animate.
    for (const [name, initialValue] of [
      ["--glide", "90deg"],
      ["--legs", "0deg"],
      ["--arms", "0deg"],
    ]) {
      try {
        CSS.registerProperty({
          name,
          syntax: "<angle>",
          inherits: true,
          initialValue,
        });
      } catch {
        // already registered (hot reload) or unsupported: the landing then snaps instead
      }
    }

    // 2. Steve glides in straight ahead from off the left edge, a little above the platform,
    // losing height gently with a slight sway and slowing as he nears the island.
    later(FLY_START_MS, () => {
      const rect = steve.getBoundingClientRect();
      const block =
        (steve.parentElement?.getBoundingClientRect().width ?? rect.width * 7) /
        17;
      const sx = -(rect.right + 60);
      // x as a share of the start offset, y in blocks above the landing spot
      const at = (x: number, y: number) =>
        `translate(${sx * x}px, ${-block * y}px)`;
      steve.style.visibility = "visible";

      // Firework boost: the rocket rides with him, so sparks are shed from his body and left
      // hanging behind, then sink away into the void.
      const canvas = sparksRef.current;
      const trail = canvas ? createFireworkTrail(canvas) : null;
      if (canvas && trail) {
        cleanups.push(() => trail.destroy());
        const body = () => {
          const box = canvas.getBoundingClientRect();
          const svg = steve.querySelector("svg")?.getBoundingClientRect();
          if (!svg) return null;
          const unit = svg.width / STEVE_VIEWBOX.w; // px per skin pixel
          const cx = svg.left + (8 - STEVE_VIEWBOX.x) * unit;
          const cy = svg.top + (16 - STEVE_VIEWBOX.y) * unit;
          return { x: cx - box.left, y: cy - box.top };
        };
        trail.start(body);
        later(FLY_MS * BOOST_SHARE, () => trail.stop());
      }

      // Track where he actually is on screen through the flight, so the landing slide can pick up
      // at exactly the speed he arrives with.
      const track: [number, number][] = [];
      let tracking = requestAnimationFrame(function sample(now) {
        track.push([now, steve.getBoundingClientRect().left]);
        if (track.length > 12) track.shift();
        tracking = requestAnimationFrame(sample);
      });
      cleanups.push(() => cancelAnimationFrame(tracking));

      const fly = run(
        steve,
        [
          { transform: at(1, 1.1), offset: 0 },
          { transform: at(0.66, 0.8), offset: 0.3 },
          { transform: at(0.34, 0.86), offset: 0.6 },
          { transform: at(FINAL_SHARE, 0.3), offset: FINAL_OFFSET },
          { transform: at(0, 0), offset: 1 },
        ],
        { duration: FLY_MS, easing: FLY_EASING },
      );
      // Flare: a little sway in the glide, then on the final approach his body pitches up only
      // part way (to 35deg) while his legs swing down under him and his arms spread back for
      // balance, so his feet reach the platform first.
      run(
        steve,
        [
          { "--glide": "90deg", "--legs": "0deg", "--arms": "0deg", offset: 0 },
          { "--glide": "88deg", offset: 0.3 },
          { "--glide": "92deg", offset: 0.6 },
          {
            "--glide": "90deg",
            "--legs": "0deg",
            "--arms": "0deg",
            offset: 0.8,
          },
          {
            "--glide": "62deg",
            "--legs": "-18deg",
            "--arms": "18deg",
            offset: 0.92,
          },
          {
            "--glide": "35deg",
            "--legs": "-35deg",
            "--arms": "26deg",
            offset: 1,
          },
        ] as Keyframe[],
        { duration: FLY_MS, easing: FLY_EASING },
      );
      // 3. Touch down: he skids to his spot, and near the end of it the heading begins to fade in.
      fly.onfinish = () => {
        // Dust kicked up at his feet, thrown forward: a big puff at touchdown, then smaller ones
        // as he skids, dying away as he slows.
        const kickDust = (count: number) => {
          const svg = steve.querySelector("svg")?.getBoundingClientRect();
          if (!trail || !canvas || !svg) return;
          const box = canvas.getBoundingClientRect();
          const unit = svg.width / STEVE_VIEWBOX.w;
          trail.dust(
            svg.left + (8 - STEVE_VIEWBOX.x) * unit - box.left,
            svg.bottom - box.top,
            1,
            count,
          );
        };
        // His landing speed (px/ms), measured over the flight's last few frames. The slide then
        // decelerates evenly from that speed, so it lasts twice the distance over the speed.
        cancelAnimationFrame(tracking);
        const [t0, x0] = track[0] ?? [0, 0];
        const [t1, x1] = track[track.length - 1] ?? [1, 0];
        const landingSpeed = Math.max(0.01, (x1 - x0) / Math.max(1, t1 - t0));
        const slideDistance =
          ((STAND_AT - LAND_AT) / 100) *
          (steve.parentElement?.getBoundingClientRect().width ?? 0);
        const skidMs = Math.min(
          SKID_MAX_MS,
          Math.max(SKID_MIN_MS, (2 * slideDistance) / landingSpeed),
        );

        // 5. Once the heading is fully in (by then he has turned), a pause, then the logo.
        revealHeading(false, HEADING_AT * skidMs).onfinish = () => revealLogo(false);

        kickDust(14);
        for (const [share, count] of SKID_DUST)
          later(share * skidMs, () => kickDust(count));

        // No walking: his momentum carries him in one smooth slide all the way to his spot. He
        // rides it in a braced lean, legs planted under him and arms back for balance, rising
        // steadily to upright as he slows.
        const skid = run(
          steve,
          [
            {
              left: leftFor(LAND_AT),
              "--glide": "35deg",
              "--legs": "-35deg",
              "--arms": "26deg",
              offset: 0,
            },
            {
              "--glide": "18deg",
              "--legs": "-18deg",
              "--arms": "32deg",
              offset: 0.5,
            },
            {
              "--glide": "6deg",
              "--legs": "-6deg",
              "--arms": "14deg",
              offset: 0.85,
            },
            {
              left: leftFor(STAND_AT),
              "--glide": "0deg",
              "--legs": "0deg",
              "--arms": "0deg",
              offset: 1,
            },
          ] as Keyframe[],
          { duration: skidMs, easing: SKID_EASING },
        );
        // Start it at the exact moment the flight ended (not a frame later), so there's no pause
        // in between.
        if (fly.startTime !== null) skid.startTime = Number(fly.startTime) + FLY_MS;

        // 4. Stopped: he turns to face the viewer.
        skid.onfinish = () => {
          setPose("front");
          setReady(true);
        };
      };
    });

    return () => {
      timers.forEach(clearTimeout);
      anims.forEach((a) => a.cancel());
      cleanups.forEach((fn) => fn());
    };
  }, [replay]);

  return (
    // The scene takes presses for the ender pearl mini-game, whose 3D view opens over it.
    <div ref={sceneRef} className="absolute inset-0 select-none" style={{ touchAction: "none" }}>
      <div className="absolute inset-0">
        <PixelParticles />
        {/* Firework sparks from the elytra boost, behind the island so they fall past it. */}
        <canvas
          ref={sparksRef}
          aria-hidden="true"
          className="pointer-events-none"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        />
        {/* Position and sizes inline: the dev server doesn't always pick up new arbitrary classes. */}
        <EndIsland
          className="absolute"
          style={islandStyle}
        >
          {/* Everything here stands on the island, so it floats with it. */}
          {/* First, so the sign draws over their beams. */}
          <EndGateways />
          {/* Lifted so the logo's bottom edge sits at Steve's waist (half his 1.8-block height; %
              padding is relative to the island's width, like his size), level with his upper body.
              A size container outside it, so the heading can be placed in island widths (cqw). */}
          <div style={{ containerType: "inline-size" }}>
            <div
              style={
                stacked
                  ? { paddingBottom: island.signGapPx, textAlign: "center" }
                  : twoLine
                    ? { paddingLeft: `${SIGN_LEFT}%`, paddingBottom: `${TWO_LINE_LIFT}%` }
                    : { paddingLeft: `${SIGN_LEFT}%`, paddingBottom: `${SIGN_LIFT}%` }
              }
            >
              {/* Heading and logo as one column, the logo centred under the heading. */}
              <div
                style={{
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <h1
                  ref={headingRef}
                  className="font-pixel text-white [text-shadow:4px_4px_0_#3f3f3f]"
                  style={stacked ? { fontSize: island.headingPx, position: "relative", lineHeight: 1, opacity: 0 } : {
                    // 2.45rem at 1920px; smaller where it would otherwise run into the gateways (its 21
                    // letters are 1em wide each, and it has from the screen edge to HEADING_END)
                    fontSize: twoLine
                      ? `min(3.3cqw, calc((${HEADING_END + screenEdge}cqw - 16px) / 13))`
                      : `min(2.944cqw, calc((${HEADING_END + screenEdge}cqw - 16px) / 22.5))`,
                    lineHeight: twoLine ? 1.5 : 1,
                    textAlign: "left",
                    // pulled left clear of the gateways (100% is its own width, as the column is
                    // as wide as it is); its `top` is set to line it up with their portals
                    position: "relative",
                    left: `clamp(8px - ${screenEdge}cqw, ${HEADING_END - SIGN_LEFT}cqw - 100%, 0px)`,
                    opacity: 0,
                  }}
                >
                  {twoLine ? (
                    <>
                      You Have
                      <br />
                      <span style={{ paddingLeft: "2em" }}>Landed On...</span>
                    </>
                  ) : (
                    "You Have Landed On..."
                  )}
                </h1>
                <div ref={logoRef} style={{ opacity: 0 }}>
                  <Image
                    src="/assets/images/logotext.png"
                    alt="Meemeow Creations"
                    width={1096}
                    height={366}
                    priority
                    className="block h-auto [box-shadow:0_8px_24px_rgba(0,0,0,0.5)]"
                    style={stacked ? { width: island.logoPx, marginTop: island.headingPx * SIGN_GAP } : {
                      // all in island widths: 320px, 28px and 23px at 1920px
                      width: "24.03cqw",
                      marginTop: "2.1cqw",
                      // nudged down a little from the heading without moving the heading
                      position: "relative",
                      top: "1.73cqw",
                      left: "-1.73cqw", // and a little left of centre
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div
            ref={steveRef}
            className="absolute"
            style={{
              bottom: 0,
              left: leftFor(LAND_AT),
              width: `${SPRITE_W}%`,
              visibility: "hidden",
            }}
          >
            <Steve pose={pose} holding={holding} />
          </div>
        </EndIsland>
      </div>
      {/* The HUD over the island's face, in the same box as the island but not floating with it. */}
      <div
        className="pointer-events-none absolute"
        style={{ ...islandStyle, height: `calc(100% - ${island.lift}px)`, zIndex: 2 }}
      >
        <Hud selected={slot} onSelect={setSlot} />
      </div>
      <PearlGame
        sceneRef={sceneRef}
        armed={holding && (pose === "front" || pose === "side")}
        onTurn={(toGateways) => setPose(toGateways ? "side" : "front")}
      />
      {/* Starts black over the whole screen (navbar and footer too) and fades away. */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#000",
        }}
      />
    </div>
  );
}
