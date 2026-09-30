"use client";

import { useCallback, useRef, useState } from "react";
import EndGateways from "./EndGateways";
import EndIsland from "./EndIsland";
import Hud, { PEARL_SLOT } from "./Hud";
import { LAND_AT, leftFor, SIGN_LEFT, SPRITE_W } from "./island-layout";
import LandingSign from "./LandingSign";
import PearlGame from "./PearlGame";
import PixelParticles from "./PixelParticles";
import Steve, { type StevePose } from "./Steve";
import { useHeadingAlign } from "./use-heading-align";
import { useIntroAnimation } from "./use-intro-animation";
import { useIslandLayout } from "./use-island-layout";

export default function HomeLanding({ replay = false }: { replay?: boolean }) {
  const [pose, setPose] = useState<StevePose>("fly");
  const [ready, setReady] = useState(false);
  const [slot, setSlot] = useState(0);
  const holding = ready && slot === PEARL_SLOT;
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const steveRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const sparksRef = useRef<HTMLCanvasElement | null>(null);

  const island = useIslandLayout(sceneRef);
  const { stacked, twoLine } = island;
  const screenEdge = (island.left / island.width) * 100 + SIGN_LEFT;
  const islandStyle = {
    bottom: island.lift,
    left: `${island.left}%`,
    width: `${island.width}%`,
  };

  useHeadingAlign(headingRef, logoRef, stacked, twoLine);

  const onLanded = useCallback(() => {
    setPose("front");
    setReady(true);
  }, []);
  useIntroAnimation({ overlayRef, steveRef, headingRef, logoRef, sparksRef }, replay, onLanded);

  return (
    <div ref={sceneRef} className="absolute inset-0 select-none" style={{ touchAction: "none" }}>
      <div className="absolute inset-0">
        <PixelParticles />
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
        <EndIsland className="absolute" style={islandStyle}>
          <EndGateways />
          <LandingSign island={island} screenEdge={screenEdge} headingRef={headingRef} logoRef={logoRef} />
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
      <div
        className="pointer-events-none absolute"
        style={{ ...islandStyle, height: `calc(100% - ${island.lift}px)`, zIndex: 2 }}
      >
        <Hud selected={slot} onSelect={setSlot} phone={stacked} lift={island.lift} />
      </div>
      <PearlGame
        sceneRef={sceneRef}
        ready={ready}
        armed={holding && (pose === "front" || pose === "side")}
        onTurn={(toGateways) => setPose(toGateways ? "side" : "front")}
      />
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
