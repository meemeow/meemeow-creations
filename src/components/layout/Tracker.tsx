"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ROUTES, SCROLL_PAGES, type ScrollPage } from "@/lib/site";
import type { RESUME_BUTTONS } from "@/lib/track";
import { track } from "@/lib/track-client";

type Route = (typeof ROUTES)[number];
type ResumeButton = (typeof RESUME_BUTTONS)[number];

const BOTTOM_SLACK = 8;

// Counts page views, clicks on links marked with data-track or data-resume, and one scroll-to-bottom per page visit.
export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest<HTMLElement>("a[data-track], a[data-resume]");
      const { track: target, resume } = link?.dataset ?? {};
      if (target) track({ type: "click", target });
      if (resume) track({ type: "resume", source: resume as ResumeButton });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (ROUTES.includes(pathname as Route)) track({ type: "view", page: pathname as Route });
  }, [pathname]);

  useEffect(() => {
    if (!SCROLL_PAGES.includes(pathname as ScrollPage)) return;
    let done = false;
    const onScroll = () => {
      if (done) return;
      const doc = document.documentElement;
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - BOTTOM_SLACK) {
        done = true;
        track({ type: "scroll", page: pathname as ScrollPage });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return null;
}
