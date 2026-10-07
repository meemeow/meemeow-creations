import { z } from "zod";
import { projects } from "@/data/projects";
import { ROUTES } from "@/lib/site";

export const FEATURED_LINK = "ePasigLib (About)";

export const TRACKED_LINKS = [...projects.map((p) => p.title), FEATURED_LINK];

export const trackSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("click"), target: z.enum(TRACKED_LINKS as [string, ...string[]]) }),
  z.object({ type: z.literal("scroll"), page: z.enum(ROUTES) }),
]);

export type TrackEvent = z.infer<typeof trackSchema>;

export const CLICKS_KEY = "stats:clicks";
export const SCROLLS_KEY = "stats:scrolls";
