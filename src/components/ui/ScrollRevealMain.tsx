"use client";

import { useRef, type ReactNode } from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

type ScrollRevealMainProps = {
  tabFlag: string;
  className?: string;
  children: ReactNode;
};

export default function ScrollRevealMain({ tabFlag, className, children }: ScrollRevealMainProps) {
  const mainRef = useRef<HTMLElement | null>(null);
  useScrollReveal(mainRef, tabFlag);

  return (
    <main ref={mainRef} className={className}>
      {children}
    </main>
  );
}
