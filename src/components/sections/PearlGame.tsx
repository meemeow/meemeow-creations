"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";
import { warpTo } from "./gatewayWarp";

// The ender pearl mini-game (an optional shortcut; the navbar still works as normal). With the
// pearl in hand (hotbar slot 5), pressing and holding on the scene turns Steve to the right,
// towards the End gateways, then the view zooms in to his point of view: the pearl in hand at
// the bottom right, a label over each gateway (About, Projects, Contact, left to right). Aim with
// the pointer and let go to throw: the pearl flies to the gateway aimed at, it flares, and the
// screen goes black on its way to that page (gatewayWarp). Letting go early, Escape, or putting
// the pearl away backs out.

const GATES = [
  { href: "/about", label: "About", line: "Initializing profile...", colour: "#32CD32" },
  { href: "/projects", label: "Projects", line: "Generating projects...", colour: "#FF00FF" },
  { href: "/contact", label: "Contact", line: "Searching contacts...", colour: "#ffff1f" },
];

const TURN_MS = 320; // Steve turning before the view moves in
const WARP_MS = 800; // into his point of view
const BACK_MS = 320; // backing out
const THROW_MS = 560; // the pearl's flight
const FLASH_MS = 300; // the gateway flaring as it lands
const LABEL_ROOM = 76; // px kept clear at the top in his point of view, for the hint and labels

type Phase = "idle" | "turning" | "warping" | "aiming" | "throwing";
type Box = { x: number; y: number; w: number; h: number };

export default function PearlGame({
  sceneRef,
  worldRef,
  hideRefs,
  armed,
  onTurn,
}: {
  sceneRef: RefObject<HTMLDivElement | null>; // receives the presses; the UI is placed in it
  worldRef: RefObject<HTMLDivElement | null>; // what zooms (particles, island, gateways)
  hideRefs: RefObject<HTMLElement | null>[]; // faded out in his point of view (Steve, the sign)
  armed: boolean; // the pearl is in hand and the intro is over
  onTurn: (toGateways: boolean) => void;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [portals, setPortals] = useState<Box[]>([]);
  const [target, setTarget] = useState(1);
  const [shot, setShot] = useState<{ from: Box; to: Box; gate: number } | null>(null);
  const phaseRef = useRef<Phase>("idle");
  const armedRef = useRef(armed);
  const targetRef = useRef(1);
  const handRef = useRef<HTMLDivElement | null>(null);
  const pearlRef = useRef<HTMLDivElement | null>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);
  // shared with the effects below: the running animations and timers, and how to back out
  const live = useRef<{ anims: Animation[]; timers: number[]; cancel: () => void }>({
    anims: [],
    timers: [],
    cancel: () => {},
  });

  const go = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  useEffect(() => {
    armedRef.current = armed;
    // Switching away from the pearl mid-aim backs out.
    if (!armed && phaseRef.current !== "idle" && phaseRef.current !== "throwing") live.current.cancel();
  }, [armed]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = live.current;
    let track = 0; // keeps the labels on the (floating) gateways while aiming

    const later = (ms: number, fn: () => void) => state.timers.push(window.setTimeout(fn, ms));
    const portalEls = () => [...scene.querySelectorAll<HTMLElement>("[data-gateway-portal]")];
    const boxOf = (el: Element): Box => {
      const s = scene.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
    };
    const aimAt = (clientX: number, clientY: number) => {
      const s = scene.getBoundingClientRect();
      const x = clientX - s.left;
      const y = clientY - s.top;
      let best = 0;
      let bestDist = Infinity;
      portalEls().forEach((el, i) => {
        const b = boxOf(el);
        const d = Math.hypot(b.x + b.w / 2 - x, b.y + b.h / 2 - y);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      targetRef.current = best;
      setTarget(best);
    };
    const hide = (show: boolean, ms: number) =>
      hideRefs.forEach((ref) => {
        const el = ref.current;
        if (!el) return;
        state.anims.push(
          el.animate([{ opacity: show ? 0 : 1 }, { opacity: show ? 1 : 0 }], {
            duration: reduced ? 0 : ms,
            fill: "forwards",
            composite: "replace",
          }),
        );
      });
    const follow = () => {
      setPortals(portalEls().map(boxOf));
      track = requestAnimationFrame(follow);
    };

    // Into his point of view: zoom the world so the three gateways fill the middle of the view.
    const warp = () => {
      const world = worldRef.current;
      if (!world) return;
      go("warping");
      const s = scene.getBoundingClientRect();
      const ps = portalEls().map(boxOf);
      if (ps.length < 3) return;
      // Each gateway is three portal-widths across and five tall, centred on its portal. Fit
      // them (with room for their labels) between the hint at the top and the HUD below.
      const left = ps[0].x - ps[0].w;
      const right = ps[2].x + 2 * ps[2].w;
      const cx = (left + right) / 2;
      const cy = ps[1].y + ps[1].h / 2;
      const hud = scene.querySelector("img[src*='hud-bars']")?.getBoundingClientRect();
      const top = LABEL_ROOM;
      const bottom = (hud ? hud.top - s.top : s.height) - 16;
      const scale = Math.min(
        3,
        (0.62 * s.width) / (right - left),
        (bottom - top) / (5 * ps[1].h),
      );
      const tx = s.width / 2 - scale * cx;
      const ty = (top + bottom) / 2 - scale * cy;
      world.style.transformOrigin = "0 0";
      const zoom = world.animate(
        [{ transform: "none" }, { transform: `translate(${tx}px, ${ty}px) scale(${scale})` }],
        { duration: reduced ? 0 : WARP_MS, easing: "cubic-bezier(.55, 0, .2, 1)", fill: "forwards" },
      );
      state.anims.push(zoom);
      hide(false, WARP_MS * 0.45);
      zoom.onfinish = () => {
        if (phaseRef.current !== "warping") return;
        go("aiming");
        follow();
      };
    };

    state.cancel = () => {
      state.timers.forEach(clearTimeout);
      state.timers = [];
      cancelAnimationFrame(track);
      const world = worldRef.current;
      const running = state.anims;
      state.anims = [];
      // ease back out of the zoom from wherever it got to, then drop every animation
      const back = world?.animate(
        [{ transform: world ? getComputedStyle(world).transform : "none" }, { transform: "none" }],
        { duration: reduced ? 0 : BACK_MS, easing: "ease-out" },
      );
      running.forEach((a) => a.cancel());
      if (back) state.anims.push(back);
      hide(true, BACK_MS);
      setPortals([]);
      setShot(null);
      onTurn(false);
      go("idle");
    };

    const release = () => {
      if (phaseRef.current === "turning" || phaseRef.current === "warping") state.cancel();
      else if (phaseRef.current === "aiming") {
        cancelAnimationFrame(track);
        const s = scene.getBoundingClientRect();
        const hand = handRef.current?.getBoundingClientRect();
        const to = portalEls().map(boxOf)[targetRef.current];
        const from: Box = hand
          ? { x: hand.left - s.left, y: hand.top - s.top, w: hand.width, h: hand.height }
          : { x: s.width * 0.8, y: s.height * 0.8, w: 80, h: 80 };
        go("throwing");
        setShot({ from, to, gate: targetRef.current });
      }
    };

    const onDown = (e: PointerEvent) => {
      if (!armedRef.current || phaseRef.current !== "idle" || e.button !== 0) return;
      if ((e.target as Element).closest("button, a")) return; // the hotbar's own slots
      e.preventDefault();
      scene.setPointerCapture(e.pointerId);
      aimAt(e.clientX, e.clientY);
      onTurn(true);
      go("turning");
      later(reduced ? 0 : TURN_MS, warp);
    };
    const onMove = (e: PointerEvent) => {
      if (phaseRef.current === "aiming" || phaseRef.current === "warping") aimAt(e.clientX, e.clientY);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phaseRef.current !== "idle" && phaseRef.current !== "throwing") state.cancel();
    };
    const onMenu = (e: Event) => {
      if (armedRef.current) e.preventDefault(); // a long press on touch shouldn't open a menu
    };

    scene.addEventListener("pointerdown", onDown);
    scene.addEventListener("pointermove", onMove);
    scene.addEventListener("pointerup", release);
    const onCancel = () => state.cancel();
    scene.addEventListener("pointercancel", onCancel);
    scene.addEventListener("contextmenu", onMenu);
    window.addEventListener("keydown", onKey);
    return () => {
      scene.removeEventListener("pointerdown", onDown);
      scene.removeEventListener("pointermove", onMove);
      scene.removeEventListener("pointerup", release);
      scene.removeEventListener("pointercancel", onCancel);
      scene.removeEventListener("contextmenu", onMenu);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(track);
      state.timers.forEach(clearTimeout);
      state.anims.forEach((a) => a.cancel());
    };
    // the refs and callbacks are stable for the page's lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The throw: the pearl arcs from the hand to the gateway, spinning and shrinking into the
  // distance; the gateway flares, and it's off through it.
  useEffect(() => {
    const pearl = pearlRef.current;
    if (!shot || !pearl) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const { from, to, gate } = shot;
    const size = from.w;
    const sx = from.x + from.w / 2 - size / 2;
    const sy = from.y + from.h / 2 - size / 2;
    const ex = to.x + to.w / 2 - size / 2;
    const ey = to.y + to.h / 2 - size / 2;
    const end = Math.max(0.12, (to.w * 0.9) / size);
    const flight = pearl.animate(
      [
        { transform: `translate(${sx}px, ${sy}px) scale(0.8) rotate(0deg)` },
        {
          transform: `translate(${(sx + ex) / 2}px, ${Math.min(sy, ey) - 0.14 * window.innerHeight}px) scale(${(0.8 + end) / 2}) rotate(300deg)`,
          offset: 0.5,
        },
        { transform: `translate(${ex}px, ${ey}px) scale(${end}) rotate(600deg)` },
      ],
      { duration: reduced ? 0 : THROW_MS, easing: "cubic-bezier(.3, .1, .6, 1)", fill: "forwards" },
    );
    live.current.anims.push(flight);
    flight.onfinish = () => {
      pearl.style.visibility = "hidden";
      const flash = flashRef.current?.animate(
        [
          { opacity: 0, transform: "scale(0.6)" },
          { opacity: 1, transform: "scale(1.6)", offset: 0.4 },
          { opacity: 0.9, transform: "scale(2.4)" },
        ],
        { duration: reduced ? 0 : FLASH_MS, easing: "ease-out", fill: "forwards" },
      );
      if (flash) live.current.anims.push(flash);
      live.current.timers.push(
        window.setTimeout(() => warpTo(GATES[gate].href, GATES[gate].line, router), reduced ? 0 : FLASH_MS * 0.6),
      );
    };
  }, [shot, router]);

  // Warm up the three pages as soon as the pearl is in hand.
  useEffect(() => {
    if (armed) GATES.forEach((g) => router.prefetch(g.href));
  }, [armed, router]);

  // The pearl in hand, first person: bottom right, sliding up into view.
  useEffect(() => {
    const hand = handRef.current;
    if (!hand || phase !== "warping") return;
    const a = hand.animate(
      [
        { transform: "translateY(70%) rotate(-24deg)", opacity: 0 },
        { transform: "translateY(0) rotate(-24deg)", opacity: 1 },
      ],
      { duration: WARP_MS * 0.7, delay: WARP_MS * 0.3, easing: "ease-out", fill: "backwards" },
    );
    return () => a.cancel();
  }, [phase]);

  const pov = phase === "warping" || phase === "aiming" || phase === "throwing";
  const aiming = phase === "aiming" || phase === "throwing";
  const hint =
    phase === "aiming"
      ? "Aim at a gateway, let go to throw  (Esc to cancel)"
      : armed && phase === "idle"
        ? "Hold click to aim the ender pearl"
        : "";

  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 3 }}>
      {hint && (
        <p
          className="font-pixel absolute left-1/2 text-center text-white [text-shadow:2px_2px_0_#3f3f3f]"
          style={{ top: 14, transform: "translateX(-50%)", fontSize: "clamp(9px, 0.85vw, 13px)", opacity: 0.85, width: "max-content", maxWidth: "calc(100% - 32px)" }}
        >
          {hint}
        </p>
      )}

      {/* A label over each gateway; the one aimed at stands out. */}
      {aiming &&
        portals.map((p, i) => {
          const on = i === target;
          return (
            <div key={GATES[i].href}>
              {on && (
                <div
                  className="absolute"
                  style={{
                    left: p.x - p.w * 0.15,
                    top: p.y - p.h * 0.15,
                    width: p.w * 1.3,
                    height: p.h * 1.3,
                    boxShadow: `0 0 ${p.w * 0.5}px ${p.w * 0.12}px rgba(214, 106, 232, 0.75), inset 0 0 ${p.w * 0.3}px rgba(255, 255, 255, 0.35)`,
                  }}
                />
              )}
              <p
                className="font-pixel absolute text-center"
                style={{
                  left: p.x + p.w / 2,
                  top: p.y - 2 * p.h - 12,
                  transform: `translate(-50%, -100%) scale(${on ? 1.15 : 1})`,
                  transformOrigin: "50% 100%",
                  color: GATES[i].colour,
                  opacity: on ? 1 : 0.5,
                  fontSize: "clamp(11px, 1.3vw, 20px)",
                  textShadow: "0.15em 0.15em 0 #1e1e1e",
                  transition: "opacity 120ms ease, transform 120ms ease",
                  whiteSpace: "nowrap",
                }}
              >
                {on ? `> ${GATES[i].label} <` : GATES[i].label}
              </p>
            </div>
          );
        })}

      {/* The gateway flaring as the pearl lands. */}
      {shot && (
        <div
          ref={flashRef}
          className="absolute"
          style={{
            left: shot.to.x - shot.to.w,
            top: shot.to.y - shot.to.h,
            width: shot.to.w * 3,
            height: shot.to.h * 3,
            opacity: 0,
            background: "radial-gradient(closest-side, #ffffff, rgba(229, 146, 242, 0.9) 35%, rgba(170, 60, 210, 0))",
          }}
        />
      )}

      {/* The thrown pearl. */}
      {shot && (
        <div ref={pearlRef} className="absolute left-0 top-0" style={{ width: shot.from.w, height: shot.from.w }}>
          <Image src="/assets/images/ender-pearl.png" alt="" width={13} height={13} unoptimized className="block h-full w-full [image-rendering:pixelated]" />
        </div>
      )}

      {/* The pearl in hand, first person. */}
      {pov && phase !== "throwing" && (
        <div
          ref={handRef}
          className="absolute"
          style={{
            right: "7%",
            bottom: "6%",
            width: "clamp(80px, 17vh, 190px)",
            aspectRatio: "1",
            transform: "rotate(-24deg)",
          }}
        >
          <Image src="/assets/images/ender-pearl.png" alt="" width={13} height={13} unoptimized className="block h-full w-full [image-rendering:pixelated]" />
        </div>
      )}
    </div>
  );
}
