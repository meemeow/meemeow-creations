import { redis } from "@/lib/redis";
import { CLICKS_KEY, SCROLLS_KEY, trackSchema } from "@/lib/track";

export async function POST(req: Request) {
  try {
    const result = trackSchema.safeParse(await req.json());
    if (!result.success) return new Response(null, { status: 422 });
    if (!redis) return new Response(null, { status: 204 });

    const event = result.data;
    if (event.type === "click") await redis.hincrby(CLICKS_KEY, event.target, 1);
    else await redis.hincrby(SCROLLS_KEY, event.page, 1);

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("Track API error:", err);
    return new Response(null, { status: 500 });
  }
}
