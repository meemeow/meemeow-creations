import type { TrackEvent } from "@/lib/track";

export function track(event: TrackEvent) {
  const body = JSON.stringify(event);
  if (navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) return;
  fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(
    () => {},
  );
}
