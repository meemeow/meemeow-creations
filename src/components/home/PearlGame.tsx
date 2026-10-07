"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";
import { track as trackEvent } from "@/lib/track-client";
import { warpTo } from "./gateway-warp";
import type { PovScene } from "./pov-scene";

const GATES = [
  { href: "/about", label: "About", line: "Initializing profile...", colour: "#32CD32" },
  { href: "/projects", label: "Projects", line: "Generating projects...", colour: "#FF00FF" },
  { href: "/contact", label: "Contact", line: "Searching contacts...", colour: "#ffff1f" },
];

const TURN_MS = 320;
const WARP_MS = 900;
const BACK_MS = 320;
const THROW_MS = 650;
const TAP_SLOP_PX = 10;
const IDLE_MS = 5000;
const HINT_BLINK_MS = 3000;
const FLASH_MS = 320;

type Phase = "idle" | "turning" | "warping" | "aiming" | "throwing";
type OnScreen = { x: number; y: number; size: number; top: number };

const loadScene = () => import("./pov-scene");

export default function PearlGame({
  sceneRef,
  ready,
  armed,
  onTurn,
}: {
  sceneRef: RefObject<HTMLDivElement | null>;
  ready: boolean;
  armed: boolean;
  onTurn: (toGateways: boolean) => void;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [portals, setPortals] = useState<OnScreen[]>([]);
  const [target, setTarget] = useState(1);
  const [idle, setIdle] = useState(false);
  const idleRef = useRef<HTMLParagraphElement | null>(null);
  const [touch, setTouch] = useState(false);
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
      GATES.forEach((g) => router.prefetch(g.href));
      void loadScene();
    }
    if (!armed && phaseRef.current !== "idle" && phaseRef.current !== "throwing") cancelRef.current();
  }, [armed, router]);

  useEffect(() => {
    const scene = sceneRef.current;
    const canvas = canvasRef.current;
    if (!scene || !canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    let fade: Animation | null = null;
    let track = 0;
    let pointer = { x: 0, y: 0 };
    let press: { x: number; y: number } | null = null;
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

    const warp = async () => {
      const { createPovScene } = await loadScene();
      if (disposed || phaseRef.current !== "turning") return;
      pov.current ??= createPovScene(canvas);
      go("warping");
      trackEvent({ type: "game" });
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

    const release = () => {
      if (phaseRef.current === "turning") cancel();
      else if (phaseRef.current === "aiming" && press) {
        const moved = Math.hypot(pointer.x - press.x, pointer.y - press.y);
        press = null;
        if (moved < TAP_SLOP_PX) {
          aim();
          throwPearl();
        }
      }
    };
    const onCancel = () => {
      if (phaseRef.current === "aiming") press = null;
      else cancel();
    };
    const throwPearl = () => {
      go("throwing");
      const gate = targetRef.current;
      pov.current?.throwTo(gate, reduced ? 1 : THROW_MS, () =>
        later(reduced ? 0 : FLASH_MS * 0.6, () => warpTo(GATES[gate].href, GATES[gate].line, router)),
      );
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || (e.target as Element).closest("button, a")) return;
      const s = scene.getBoundingClientRect();
      pointer = { x: e.clientX - s.left, y: e.clientY - s.top };
      if (phaseRef.current === "aiming") {
        e.preventDefault();
        scene.setPointerCapture(e.pointerId);
        press = { ...pointer };
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
      if (armedRef.current) e.preventDefault();
    };

    scene.addEventListener("pointerdown", onDown);
    scene.addEventListener("pointermove", onMove);
    scene.addEventListener("pointerup", release);
    scene.addEventListener("pointercancel", onCancel);
    scene.addEventListener("contextmenu", onMenu);
    window.addEventListener("keydown", onKey);
    return () => {
      disposed = true;
      scene.removeEventListener("pointerdown", onDown);
      scene.removeEventListener("pointermove", onMove);
      scene.removeEventListener("pointerup", release);
      scene.removeEventListener("pointercancel", onCancel);
      scene.removeEventListener("contextmenu", onMenu);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(track);
      timers.forEach(clearTimeout);
      fade?.cancel();
      pov.current?.destroy();
      pov.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    let timer = 0;
    let shown = false;
    const reset = () => {
      if (shown) return;
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        shown = true;
        setIdle(true);
      }, IDLE_MS);
    };
    reset();
    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [ready]);
  useEffect(() => {
    const el = idleRef.current;
    if (!el) return;
    const blink = el.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], {
      duration: HINT_BLINK_MS,
      iterations: Infinity,
      easing: "ease-in-out",
    });
    return () => blink.cancel();
  }, [idle, armed, phase]);

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
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full [image-rendering:pixelated]"
        style={{ zIndex: 1, opacity: 0 }}
      />
      {inView && phase !== "throwing" && (
        <div className="pointer-events-none absolute inset-0" style={{ zIndex: 1 }}>
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
            <Image
              src="/assets/images/ender-pearl.png"
              alt=""
              width={13}
              height={13}
              unoptimized
              className="block h-full w-full [image-rendering:pixelated]"
            />
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0" style={{ zIndex: 3 }}>
        {idle && !hint && phase === "idle" && (
          <p
            ref={idleRef}
            className="font-pixel absolute left-1/2 text-center uppercase text-gray-300 [text-shadow:2px_2px_0_rgba(0,0,0,0.75)]"
            style={{
              top: 14,
              transform: "translateX(-50%)",
              fontSize: "clamp(8px, 0.75vw, 11px)",
              letterSpacing: "0.12em",
              lineHeight: 1.7,
              opacity: 0,
              width: "max-content",
              maxWidth: "calc(100% - 32px)",
            }}
          >
            {touch ? "Tap the ender pearl in slot 5 below" : "Click the ender pearl in slot 5 below"}
          </p>
        )}
        {hint && (
          <p
            className="font-pixel absolute left-1/2 text-center text-white [text-shadow:2px_2px_0_#3f3f3f]"
            style={{
              top: 14,
              transform: "translateX(-50%)",
              fontSize: "clamp(9px, 0.85vw, 13px)",
              opacity: 0.85,
              width: "max-content",
              maxWidth: "calc(100% - 32px)",
            }}
          >
            {hint}
          </p>
        )}

        {aiming &&
          portals.map((p, i) => {
            const on = i === target;
            const block = p.size * 2;
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
      </div>
    </>
  );
}
