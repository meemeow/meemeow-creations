import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { redis } from "@/lib/redis";
import { ROUTES } from "@/lib/site";
import { CLICKS_KEY, SCROLLS_KEY, TRACKED_LINKS } from "@/lib/track";

export const metadata: Metadata = {
  title: "Stats",
  robots: { index: false, follow: false },
};

const TABLE = "w-full border-[3px] border-[#3d3938] bg-[#2f2d2c] font-gotham";
const ROW = "border-t border-[#3d3938] first:border-t-0";
const CELL = "px-4 py-2.5";

function StatTable({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 font-pixel text-[0.875rem] text-gray-300">{title}</h2>
      <table className={TABLE}>
        <tbody>
          {rows.map(([name, count]) => (
            <tr key={name} className={ROW}>
              <td className={CELL}>{name}</td>
              <td className={`${CELL} text-right tabular-nums`}>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

// Unlisted: only renders with ?key=<STATS_KEY>, otherwise looks like a missing page.
export default async function Stats({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const { key } = await searchParams;
  const secret = process.env.STATS_KEY;
  if (!secret || key !== secret) notFound();

  const [clicks, scrolls] = redis
    ? await Promise.all([
        redis.hgetall<Record<string, number>>(CLICKS_KEY),
        redis.hgetall<Record<string, number>>(SCROLLS_KEY),
      ])
    : [null, null];

  return (
    <main className="min-h-screen bg-[#191b1dff] text-white">
      <div className="mx-auto w-full max-w-[720px] px-6 py-12 upto-639:px-4">
        <h1 className="font-pixel text-[1.25rem]">Stats</h1>
        {!redis && <p className="mt-4 text-gray-400">Redis isn&apos;t configured, so nothing is being counted.</p>}
        <StatTable title="Live page clicks" rows={TRACKED_LINKS.map((name) => [name, Number(clicks?.[name] ?? 0)])} />
        <StatTable title="Scrolled to the end" rows={ROUTES.map((page) => [page, Number(scrolls?.[page] ?? 0)])} />
      </div>
    </main>
  );
}
