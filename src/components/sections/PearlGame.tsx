"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";
import { warpTo } from "./gatewayWarp";
import type { PovScene } from "./povScene";

// The ender pearl mini-game (an optional shortcut; the navbar still works as normal). With the
// pearl in hand (hotbar slot 5), pressing and holding on the scene turns Steve to the right,
// towards the End gateways, then the view drops into his eyes: a real 3D first-person view
// (povScene) of the gateways floating over the end stone, the pearl in hand at the bottom right
// and a label over each gateway (About, Projects, Contact, left to right). The view turns a
// little toward the pointer, and it stays there after letting go, so you can take your time: click
// a gateway to throw: the pearl arcs into it, it flares, and the loading screen takes over on the
// way to that page (gatewayWarp). A plain click (no hold), Escape, or putting the pearl away
// backs out.

const GATES = [
  { href: "/about", label: "About", line: "Initializing profile...", colour: "#32CD32" },
  { href: "/projects", label: "Projects", line: "Generating projects...", colour: "#FF00FF" },
  { href: "/contact", label: "Contact", line: "Searching contacts...", colour: "#ffff1f" },
];

const TURN_MS = 320; // Steve turning before the view moves in
const WARP_MS = 900; // into his eyes
const BACK_MS = 320; // backing out
const THROW_MS = 650; // the pearl's flight
const FLASH_MS = 320; // the gateway flaring as it lands

type Phase = "idle" | "turning" | "warping" | "aiming" | "throwing";
type OnScreen = { x: number; y: number; size: number; top: number };

const loadScene = () => import("./povScene");

export default function PearlGame({
  sceneRef,
  armed,
  onTurn,
}: {
  sceneRef: RefObject<HTMLDivElement | null>; // receives the presses; the view is placed in it
  armed: boolean; // the pearl is in hand and the intro is over
  onTurn: (toGateways: boolean) => void;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [portals, setPortals] = useState<OnScreen[]>([]);
  const [target, setTarget] = useState(1);
  const [touch, setTouch] = useState(false); // a touch screen: the hints say press and tap
  const phaseRef = useRef<Phase>("idle");
  const armedRef = useRef(armed);
  const targetRef = useRef(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const handRef = useRef<HTMLDivElement | null>(null);
  const pov = useRef<PovScene | null>(null);
  const cancelRef = useRef<() => void>(() => {});

  const go = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)");
    const update = () => setTouch(coarse.matches);
    update();
    coarse.addEventListener("change", update);
    return () => coarse.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    armedRef.current = armed;
    if (armed) {
      GATES.forEach((g) => router.prefetch(g.href)); // warm up the three pages
      void loadScene(); // and the 3D view
    }
    // Switching away from the pearl mid-aim backs out.
    if (!armed && phaseRef.current !== "idle" && phaseRef.current !== "throwing") cancelRef.current();
  }, [armed, router]);

  useEffect(() => {
    const scene = sceneRef.current;
    const canvas = canvasRef.current;
    if (!scene || !canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    let fade: Animation | null = null;
    let track = 0; // keeps the labels on the gateways as the view turns
    let pointer = { x: 0, y: 0 }; // relative to the scene
    let disposed = false;

    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const show = (on: boolean, ms: number) => {
      fade?.cancel();
      fade = canvas.animate([{ opacity: on ? 0 : 1 }, { opacity: on ? 1 : 0 }], {
        duration: reduced ? 0 : ms,
        easing: "ease-out",
        fill: "forwards",
      });
      return fade;
    };
    const aim = () => {
      const s = scene.getBoundingClientRect();
      pov.current?.setAim((pointer.x / s.width) * 2 - 1, 1 - (pointer.y / s.height) * 2);
      const on = pov.current?.portalsOnScreen() ?? [];
      let best = targetRef.current;
      let bestDist = Infinity;
      on.forEach((p, i) => {
        const d = Math.hypot(p.x - pointer.x, p.y - pointer.y);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      if (best !== targetRef.current) {
        targetRef.current = best;
        setTarget(best);
      }
      setPortals(on);
    };
    const follow = () => {
      aim();
      track = requestAnimationFrame(follow);
    };

    // Into his eyes: the 3D view fades up while the camera drops in from behind him.
    const warp = async () => {
      const { createPovScene } = await loadScene();
      if (disposed || phaseRef.current !== "turning") return;
      pov.current ??= createPovScene(canvas);
      go("warping");
      aim();
      pov.current.enter(reduced ? 0 : WARP_MS);
      show(true, WARP_MS * 0.5);
      follow();
      later(reduced ? 0 : WARP_MS, () => {
        if (phaseRef.current === "warping") go("aiming");
      });
    };

    const cancel = () => {
      timers.forEach(clearTimeout);
      timers.length = 0;
      cancelAnimationFrame(track);
      show(false, BACK_MS).onfinish = () => {
        if (phaseRef.current === "idle") pov.current?.stop();
      };
      setPortals([]);
      onTurn(false);
      go("idle");
    };
    cancelRef.current = cancel;

    // Letting go straight away (a plain click) backs out; once the view is on its way in, letting
    // go leaves you in his eyes to take your time and pick a gateway.
    const release = () => {
      if (phaseRef.current === "turning") cancel();
    };
    const throwPearl = () => {
      go("throwing");
      const gate = targetRef.current;
      pov.current?.throwTo(gate, reduced ? 1 : THROW_MS, () =>
        later(reduced ? 0 : FLASH_MS * 0.6, () => warpTo(GATES[gate].href, GATES[gate].line, router)),
      );
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || (e.target as Element).closest("button, a")) return; // not the hotbar's own slots
      const s = scene.getBoundingClientRect();
      pointer = { x: e.clientX - s.left, y: e.clientY - s.top };
      // In his eyes: a click throws at the gateway it's on (or nearest to).
      if (phaseRef.current === "aiming") {
        e.preventDefault();
        aim();
        throwPearl();
        return;
      }
      if (!armedRef.current || phaseRef.current !== "idle") return;
      e.preventDefault();
      scene.setPointerCapture(e.pointerId);
      onTurn(true);
      go("turning");
      later(reduced ? 0 : TURN_MS, () => void warp());
    };
    const onMove = (e: PointerEvent) => {
      const s = scene.getBoundingClientRect();
      pointer = { x: e.clientX - s.left, y: e.clientY - s.top };
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phaseRef.current !== "idle" && phaseRef.current !== "throwing") cancel();
    };
    const onMenu = (e: Event) => {
      if (armedRef.current) e.preventDefault(); // a long press on touch shouldn't open a menu
    };

    scene.addEventListener("pointerdown", onDown);
    scene.addEventListener("pointermove", onMove);
    scene.addEventListener("pointerup", release);
    scene.addEventListener("pointercancel", cancel);
    scene.addEventListener("contextmenu", onMenu);
    window.addEventListener("keydown", onKey);
    return () => {
      disposed = true;
      scene.removeEventListener("pointerdown", onDown);
      scene.removeEventListener("pointermove", onMove);
      scene.removeEventListener("pointerup", release);
      scene.removeEventListener("pointercancel", cancel);
      scene.removeEventListener("contextmenu", onMenu);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(track);
      timers.forEach(clearTimeout);
      fade?.cancel();
      pov.current?.destroy();
      pov.current = null;
    };
    // the refs and callbacks are stable for the page's lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The pearl in hand: sliding up into view as he takes aim.
  useEffect(() => {
    const hand = handRef.current;
    if (!hand || phase !== "warping") return;
    const a = hand.animate(
      [
        { transform: "translateY(80%) rotate(-28deg)", opacity: 0 },
        { transform: "translateY(0) rotate(-28deg)", opacity: 1 },
      ],
      { duration: WARP_MS * 0.6, delay: WARP_MS * 0.4, easing: "ease-out", fill: "backwards" },
    );
    return () => a.cancel();
  }, [phase]);

  const inView = phase === "warping" || phase === "aiming" || phase === "throwing";
  const aiming = phase === "aiming" || phase === "throwing";
  const hint =
    phase === "aiming"
      ? touch
        ? "Tap a gateway to throw"
        : "Click a gateway to throw  (Esc to cancel)"
      : armed && phase === "idle"
        ? touch
          ? "Press and hold to aim the ender pearl"
          : "Hold click to aim the ender pearl"
        : "";

  return (
    <>
      {/* The 3D view: over the scene, under the HUD (which stays, as in the game). */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full [image-rendering:pixelated]"
        style={{ zIndex: 1, opacity: 0 }}
      />
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
            const block = p.size * 2; // one block, in px, at that distance
            return (
              <div key={GATES[i].href}>
                {on && phase === "aiming" && (
                  <div
                    className="absolute"
                    style={{
                      left: p.x - block * 0.65,
                      top: p.y - block * 0.65,
                      width: block * 1.3,
                      height: block * 1.3,
                      boxShadow: `0 0 ${block * 0.5}px ${block * 0.12}px rgba(214, 106, 232, 0.75), inset 0 0 ${block * 0.3}px rgba(255, 255, 255, 0.35)`,
                    }}
                  />
                )}
                <p
                  className="font-pixel absolute text-center"
                  style={{
                    left: p.x,
                    top: p.top - 6,
                    transform: `translate(-50%, -100%) scale(${on ? 1.15 : 1})`,
                    transformOrigin: "50% 100%",
                    color: GATES[i].colour,
                    opacity: on ? 1 : 0.55,
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

        {/* The pearl in hand, first person: big in the bottom right corner, as in the game. */}
        {inView && phase !== "throwing" && (
          <div
            ref={handRef}
            className="absolute"
            style={{
              right: "-2%",
              bottom: "-6%",
              width: "clamp(96px, min(34vh, 36vw), 340px)",
              aspectRatio: "1",
              transform: "rotate(-28deg)",
            }}
          >
            <Image src="/assets/images/ender-pearl.png" alt="" width={13} height={13} unoptimized className="block h-full w-full [image-rendering:pixelated]" />
          </div>
        )}
      </div>
    </>
  );
}
