"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import EndGateways, { GATEWAYS_LEFT } from "./EndGateways";
import EndIsland from "./EndIsland";
import Hud from "./Hud";
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
// below). In cqw: 1% of the island's width. The island sits 15.32% in from the scene's left and
// is 69.36% of it wide, so the screen edge is this far left of the sign.
const HEADING_END = GATEWAYS_LEFT - 0.35 * BLOCK;
const SCREEN_EDGE = 15.32 / 0.6936 + SIGN_LEFT;
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
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const steveRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const sparksRef = useRef<HTMLCanvasElement | null>(null);

  // Line the heading up with the gateways' portals: its middle level with theirs. Measured in the
  // island's own layout (offsetTop ignores the reveal's slide; both float together), and again
  // whenever the scene resizes or the pixel font arrives.
  useLayoutEffect(() => {
    const heading = headingRef.current;
    const island = heading?.offsetParent;
    if (!heading || !island) return;
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
    document.fonts?.ready.then(align);
    return () => observer.disconnect();
  }, []);

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
        skid.onfinish = () => setPose("front");
      };
    });

    return () => {
      timers.forEach(clearTimeout);
      anims.forEach((a) => a.cancel());
      cleanups.forEach((fn) => fn());
    };
  }, [replay]);

  return (
    <>
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
        style={{ bottom: 0, left: "15.32%", width: "69.36%" }}
      >
        {/* Everything here stands on the island, so it floats with it. */}
        {/* First, so the sign draws over their beams. */}
        <EndGateways />
        {/* Lifted so the logo's bottom edge sits at Steve's waist (half his 1.8-block height; %
            padding is relative to the island's width, like his size), level with his upper body.
            A size container outside it, so the heading can be placed in island widths (cqw). */}
        <div style={{ containerType: "inline-size" }}>
          <div
            style={{
              paddingLeft: `${SIGN_LEFT}%`,
              paddingBottom: `${SIGN_LIFT}%`,
            }}
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
                style={{
                  fontSize: "clamp(1rem, 2.55vw, 2.45rem)",
                  // pulled left clear of the gateways (100% is its own width, as the column is
                  // as wide as it is); its `top` is set to line it up with their portals
                  position: "relative",
                  left: `clamp(8px - ${SCREEN_EDGE}cqw, ${HEADING_END - SIGN_LEFT}cqw - 100%, 0px)`,
                  lineHeight: 1,
                  opacity: 0,
                }}
              >
                You Have Landed On...
              </h1>
              <div ref={logoRef} style={{ opacity: 0 }}>
                <Image
                  src="/assets/images/logotext.png"
                  alt="Meemeow Creations"
                  width={1096}
                  height={366}
                  priority
                  className="block h-auto [box-shadow:0_8px_24px_rgba(0,0,0,0.5)]"
                  style={{
                    width: "clamp(145px, 19vw, 320px)",
                    marginTop: "clamp(12px, 2vw, 28px)",
                    // nudged down a little from the heading without moving the heading
                    position: "relative",
                    top: "clamp(9px, 1.6vw, 23px)",
                    left: "calc(-1 * clamp(8px, 1.6vw, 23px))", // and a little left of centre
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
          <Steve pose={pose} />
        </div>
      </EndIsland>
      {/* The HUD over the island's face, in the same box as the island but not floating with it. */}
      <div
        className="pointer-events-none absolute"
        style={{ bottom: 0, left: "15.32%", width: "69.36%", height: "100%", zIndex: 2 }}
      >
        <Hud />
      </div>
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
    </>
  );
}
