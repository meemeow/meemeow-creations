"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/lib/site";
import type { TrackEvent } from "@/lib/track";

type Route = (typeof ROUTES)[number];

const BOTTOM_SLACK = 8;

function send(event: TrackEvent) {
  const body = JSON.stringify(event);
  if (navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) return;
  fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(
    () => {},
  );
}

// Counts clicks on links marked with data-track, and one scroll-to-bottom per page visit.
export default function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest<HTMLElement>("a[data-track]");
      const target = link?.dataset.track;
      if (target) send({ type: "click", target });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  useEffect(() => {
    if (!ROUTES.includes(pathname as Route)) return;
    let done = false;
    const onScroll = () => {
      if (done) return;
      const doc = document.documentElement;
      if (window.scrollY + window.innerHeight >= doc.scrollHeight - BOTTOM_SLACK) {
        done = true;
        send({ type: "scroll", page: pathname as Route });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return null;
}
