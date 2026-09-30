"use client";

import { useLayoutEffect, type RefObject } from "react";
import { HEADING_DROP } from "./island-layout";

export function useHeadingAlign(
  headingRef: RefObject<HTMLHeadingElement | null>,
  logoRef: RefObject<HTMLDivElement | null>,
  stacked: boolean,
  twoLine: boolean,
) {
  useLayoutEffect(() => {
    const heading = headingRef.current;
    const island = heading?.offsetParent;
    if (!heading || !island) return;
    if (stacked || twoLine) {
      heading.style.top = "0px";
      return;
    }
    const align = () => {
      const portal = island.querySelector("[data-gateway-portal]");
      if (!portal) return;
      heading.style.top = "0px";
      const box = island.getBoundingClientRect();
      const p = portal.getBoundingClientRect();
      const portalMiddle = p.top + p.height / 2 - box.top;
      const shift = portalMiddle + (HEADING_DROP * box.width) / 17 - (heading.offsetTop + heading.offsetHeight / 2);
      const logo = logoRef.current?.querySelector("img") ?? logoRef.current;
      const logoTop = (logo?.getBoundingClientRect().top ?? Infinity) - box.top;
      const room = logoTop - 8 - (heading.offsetTop + heading.offsetHeight);
      heading.style.top = `${Math.round(Math.min(shift, room))}px`;
    };
    align();
    const observer = new ResizeObserver(align);
    observer.observe(island.parentElement ?? island);
    const gateway = island.querySelector("[data-gateway-portal]")?.parentElement;
    if (gateway) observer.observe(gateway);
    let live = true;
    document.fonts?.ready.then(() => live && align());
    return () => {
      live = false;
      observer.disconnect();
    };
  }, [headingRef, logoRef, stacked, twoLine]);
}
