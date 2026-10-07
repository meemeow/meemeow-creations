import { redis } from "@/lib/redis";
import { CLICKS_KEY, GAME_KEY, RESUME_KEY, SCROLLS_KEY, VIEWS_KEY, trackSchema } from "@/lib/track";

export async function POST(req: Request) {
  try {
    const result = trackSchema.safeParse(await req.json());
    if (!result.success) return new Response(null, { status: 422 });
    if (!redis) return new Response(null, { status: 204 });

    const event = result.data;
    if (event.type === "view") await redis.hincrby(VIEWS_KEY, event.page, 1);
    else if (event.type === "click") await redis.hincrby(CLICKS_KEY, event.target, 1);
    else if (event.type === "scroll") await redis.hincrby(SCROLLS_KEY, event.page, 1);
    else if (event.type === "resume") await redis.hincrby(RESUME_KEY, event.source, 1);
    else await redis.incr(GAME_KEY);

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("Track API error:", err);
    return new Response(null, { status: 500 });
  }
}
