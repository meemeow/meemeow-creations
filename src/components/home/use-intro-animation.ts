"use client";

import { useLayoutEffect, type RefObject } from "react";
import { createFireworkTrail } from "./firework-trail";
import { forgetIntroPlayed, introPlayed, markIntroPlayed } from "./intro-storage";
import { LAND_AT, leftFor, STAND_AT } from "./island-layout";
import { STEVE_VIEWBOX } from "./Steve";

const BLACK_HOLD_MS = 500;
const FLY_START_MS = BLACK_HOLD_MS + 3000;
const FLY_MS = 1500;
const FADE_MS = FLY_START_MS + FLY_MS - BLACK_HOLD_MS;
const FLY_EASING = "cubic-bezier(.25, .15, .7, .7)";
const FINAL_OFFSET = 0.86;
const FINAL_SHARE = 0.12;
const SKID_EASING = "cubic-bezier(.333, .667, .667, 1)";
const SKID_MIN_MS = 600;
const SKID_MAX_MS = 2200;
const SKID_DUST: [number, number][] = [
  [0.08, 8],
  [0.18, 6],
  [0.3, 4],
  [0.45, 3],
  [0.62, 2],
];
const HEADING_AT = 0.65;
const HEADING_MS = 1600;
const LOGO_PAUSE_MS = 400;
const LOGO_MS = 1600;
const BOOST_SHARE = 0.62;

type IntroRefs = {
  overlayRef: RefObject<HTMLDivElement | null>;
  steveRef: RefObject<HTMLDivElement | null>;
  headingRef: RefObject<HTMLHeadingElement | null>;
  logoRef: RefObject<HTMLDivElement | null>;
  sparksRef: RefObject<HTMLCanvasElement | null>;
};

export function useIntroAnimation(
  { overlayRef, steveRef, headingRef, logoRef, sparksRef }: IntroRefs,
  replay: boolean,
  onLanded: () => void,
) {
  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const steve = steveRef.current;
    const heading = headingRef.current;
    const logo = logoRef.current;
    if (!overlay || !steve || !heading || !logo) return;

    const timers: number[] = [];
    const cleanups: (() => void)[] = [];
    const anims: Animation[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const run = (el: Element, frames: Keyframe[], opts: KeyframeAnimationOptions) => {
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

    if (replay) forgetIntroPlayed();
    if (introPlayed() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      overlay.style.display = "none";
      steve.style.left = leftFor(STAND_AT);
      steve.style.visibility = "visible";
      onLanded();
      revealHeading(true);
      revealLogo(true);
      return;
    }
    markIntroPlayed();

    run(overlay, [{ opacity: 1 }, { opacity: 0 }], {
      duration: FADE_MS,
      delay: BLACK_HOLD_MS,
      easing: "ease-in-out",
    });

    for (const [name, initialValue] of [
      ["--glide", "90deg"],
      ["--legs", "0deg"],
      ["--arms", "0deg"],
    ]) {
      try {
        CSS.registerProperty({ name, syntax: "<angle>", inherits: true, initialValue });
      } catch {}
    }

    later(FLY_START_MS, () => {
      const rect = steve.getBoundingClientRect();
      const block = (steve.parentElement?.getBoundingClientRect().width ?? rect.width * 7) / 17;
      const sx = -(rect.right + 60);
      const at = (x: number, y: number) => `translate(${sx * x}px, ${-block * y}px)`;
      steve.style.visibility = "visible";

      const canvas = sparksRef.current;
      const trail = canvas ? createFireworkTrail(canvas) : null;
      if (canvas && trail) {
        cleanups.push(() => trail.destroy());
        const body = () => {
          const box = canvas.getBoundingClientRect();
          const svg = steve.querySelector("svg")?.getBoundingClientRect();
          if (!svg) return null;
          const unit = svg.width / STEVE_VIEWBOX.w;
          const cx = svg.left + (8 - STEVE_VIEWBOX.x) * unit;
          const cy = svg.top + (16 - STEVE_VIEWBOX.y) * unit;
          return { x: cx - box.left, y: cy - box.top };
        };
        trail.start(body);
        later(FLY_MS * BOOST_SHARE, () => trail.stop());
      }

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
      run(
        steve,
        [
          { "--glide": "90deg", "--legs": "0deg", "--arms": "0deg", offset: 0 },
          { "--glide": "88deg", offset: 0.3 },
          { "--glide": "92deg", offset: 0.6 },
          { "--glide": "90deg", "--legs": "0deg", "--arms": "0deg", offset: 0.8 },
          { "--glide": "62deg", "--legs": "-18deg", "--arms": "18deg", offset: 0.92 },
          { "--glide": "35deg", "--legs": "-35deg", "--arms": "26deg", offset: 1 },
        ] as Keyframe[],
        { duration: FLY_MS, easing: FLY_EASING },
      );
      fly.onfinish = () => {
        const kickDust = (count: number) => {
          const svg = steve.querySelector("svg")?.getBoundingClientRect();
          if (!trail || !canvas || !svg) return;
          const box = canvas.getBoundingClientRect();
          const unit = svg.width / STEVE_VIEWBOX.w;
          trail.dust(svg.left + (8 - STEVE_VIEWBOX.x) * unit - box.left, svg.bottom - box.top, 1, count);
        };
        cancelAnimationFrame(tracking);
        const [t0, x0] = track[0] ?? [0, 0];
        const [t1, x1] = track[track.length - 1] ?? [1, 0];
        const landingSpeed = Math.max(0.01, (x1 - x0) / Math.max(1, t1 - t0));
        const slideDistance = ((STAND_AT - LAND_AT) / 100) * (steve.parentElement?.getBoundingClientRect().width ?? 0);
        const skidMs = Math.min(SKID_MAX_MS, Math.max(SKID_MIN_MS, (2 * slideDistance) / landingSpeed));

        revealHeading(false, HEADING_AT * skidMs).onfinish = () => revealLogo(false);

        kickDust(14);
        for (const [share, count] of SKID_DUST) later(share * skidMs, () => kickDust(count));

        const skid = run(
          steve,
          [
            { left: leftFor(LAND_AT), "--glide": "35deg", "--legs": "-35deg", "--arms": "26deg", offset: 0 },
            { "--glide": "18deg", "--legs": "-18deg", "--arms": "32deg", offset: 0.5 },
            { "--glide": "6deg", "--legs": "-6deg", "--arms": "14deg", offset: 0.85 },
            { left: leftFor(STAND_AT), "--glide": "0deg", "--legs": "0deg", "--arms": "0deg", offset: 1 },
          ] as Keyframe[],
          { duration: skidMs, easing: SKID_EASING },
        );
        if (fly.startTime !== null) skid.startTime = Number(fly.startTime) + FLY_MS;

        skid.onfinish = onLanded;
      };
    });

    return () => {
      timers.forEach(clearTimeout);
      anims.forEach((a) => a.cancel());
      cleanups.forEach((fn) => fn());
    };
  }, [overlayRef, steveRef, headingRef, logoRef, sparksRef, replay, onLanded]);
}
