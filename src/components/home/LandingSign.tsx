import Image from "next/image";
import type { RefObject } from "react";
import {
  HEADING_END,
  SIGN_GAP,
  SIGN_LEFT,
  SIGN_LIFT,
  TWO_LINE_LIFT,
  TWO_LINE_SHIFT,
  type IslandBox,
} from "./island-layout";

type LandingSignProps = {
  island: IslandBox;
  screenEdge: number;
  headingRef: RefObject<HTMLHeadingElement | null>;
  logoRef: RefObject<HTMLDivElement | null>;
};

export default function LandingSign({ island, screenEdge, headingRef, logoRef }: LandingSignProps) {
  const { stacked, twoLine } = island;

  return (
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
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: twoLine ? "flex-end" : "center",
          }}
        >
          <h1
            ref={headingRef}
            className="font-pixel text-white [text-shadow:4px_4px_0_#3f3f3f]"
            style={
              stacked
                ? { fontSize: island.headingPx, position: "relative", lineHeight: 1, opacity: 0 }
                : {
                    fontSize: twoLine
                      ? `min(3.3cqw, calc((${HEADING_END + screenEdge}cqw - 16px) / 15.5))`
                      : `min(2.944cqw, calc((${HEADING_END + screenEdge}cqw - 16px) / 22.5))`,
                    lineHeight: twoLine ? 1.5 : 1,
                    textAlign: "left",
                    position: "relative",
                    left: twoLine
                      ? `clamp(24px - ${screenEdge}cqw, ${HEADING_END - SIGN_LEFT}cqw - 100% - ${TWO_LINE_SHIFT}cqw, 0px)`
                      : `clamp(8px - ${screenEdge}cqw, ${HEADING_END - SIGN_LEFT}cqw - 100%, 0px)`,
                    opacity: 0,
                  }
            }
          >
            {twoLine ? (
              <>
                You Have
                <br />
                <span style={{ paddingLeft: "4.5em" }}>Landed On...</span>
              </>
            ) : (
              "You Have Landed On..."
            )}
          </h1>
          <div
            ref={logoRef}
            style={
              twoLine
                ? {
                    opacity: 0,
                    position: "relative",
                    left: `clamp(8px - ${screenEdge}cqw, ${HEADING_END - SIGN_LEFT}cqw - 100%, 0px)`,
                  }
                : { opacity: 0 }
            }
          >
            <Image
              src="/assets/images/logotext.png"
              alt="Meemeow Creations"
              width={1096}
              height={366}
              priority
              className="block h-auto [box-shadow:0_8px_24px_rgba(0,0,0,0.5)]"
              style={
                stacked
                  ? { width: island.logoPx, marginTop: island.headingPx * SIGN_GAP }
                  : {
                      width: "24.03cqw",
                      marginTop: "2.1cqw",
                      position: "relative",
                      top: "1.73cqw",
                      left: "-1.73cqw",
                    }
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
