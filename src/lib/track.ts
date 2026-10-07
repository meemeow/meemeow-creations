import { z } from "zod";
import { projects } from "@/data/projects";
import { ROUTES, SCROLL_PAGES } from "@/lib/site";

export const FEATURED_LINK = "ePasigLib (About)";

export const TRACKED_LINKS = [...projects.map((p) => p.title), FEATURED_LINK];

export const RESUME_BUTTONS = ["About (top)", "About (bottom)"] as const;

export const trackSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("view"), page: z.enum(ROUTES) }),
  z.object({ type: z.literal("click"), target: z.enum(TRACKED_LINKS as [string, ...string[]]) }),
  z.object({ type: z.literal("scroll"), page: z.enum(SCROLL_PAGES) }),
  z.object({ type: z.literal("game") }),
  z.object({ type: z.literal("resume"), source: z.enum(RESUME_BUTTONS) }),
]);

export type TrackEvent = z.infer<typeof trackSchema>;

export const VIEWS_KEY = "stats:views";
export const CLICKS_KEY = "stats:clicks";
export const SCROLLS_KEY = "stats:scrolls";
export const GAME_KEY = "stats:game";
export const RESUME_KEY = "stats:resume";
