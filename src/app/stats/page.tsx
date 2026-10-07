import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CERT_DETAIL, CERT_GROUP_LABEL, CERT_NAME, EYEBROW } from "@/components/about/about-classes";
import { SKILL_CARD, SKILL_GRID, SKILL_GROUPS_GRID } from "@/components/about/Skills";
import { redis } from "@/lib/redis";
import { SCROLL_PAGES, SITE_URL } from "@/lib/site";
import {
  CLICKS_KEY,
  FEATURED_LINK,
  GAME_KEY,
  RESUME_BUTTONS,
  RESUME_KEY,
  SCROLLS_KEY,
  TRACKED_LINKS,
  VIEWS_KEY,
} from "@/lib/track";

export const metadata: Metadata = {
  title: "Live View Statistics",
  robots: { index: false, follow: false },
};

const PAGE_INNER =
  "mx-8 px-6 py-12 min-[768px]:mx-12 min-[1024px]:mx-20 min-[1280px]:mx-24 min-[1440px]:mx-28 min-[1600px]:mx-32 " +
  "max-lg:py-10 upto-639:mx-4 upto-639:py-8 upto-467:px-[12px]";
const COUNT = "ml-auto shrink-0 pl-2 font-pixel text-[0.875rem] tabular-nums text-white upto-639:text-[0.75rem]";

type Stat = { name: string; detail: string; count: number };

const PAGE_NAMES: Record<string, string> = { "/about": "About", "/projects": "Projects", "/contact": "Contact" };

function StatGroup({ label, stats }: { label: string; stats: Stat[] }) {
  return (
    <div>
      <h2 className={CERT_GROUP_LABEL}>{label}</h2>
      <ul className={SKILL_GRID}>
        {stats.map((s) => (
          <li key={`${s.name}-${s.detail}`} className={SKILL_CARD}>
            <span className="min-w-0">
              <span className={`${CERT_NAME} [overflow-wrap:anywhere]`}>{s.name}</span>
              <span className={CERT_DETAIL}>{s.detail}</span>
            </span>
            <span className={COUNT}>{s.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Unlisted: only renders with ?key=<STATS_KEY>, otherwise looks like a missing page.
export default async function Stats({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const { key } = await searchParams;
  const secret = process.env.STATS_KEY;
  if (!secret || key !== secret) notFound();

  const [views, clicks, scrolls, games, resumes] = redis
    ? await Promise.all([
        redis.hgetall<Record<string, number>>(VIEWS_KEY),
        redis.hgetall<Record<string, number>>(CLICKS_KEY),
        redis.hgetall<Record<string, number>>(SCROLLS_KEY),
        redis.get<number>(GAME_KEY),
        redis.hgetall<Record<string, number>>(RESUME_KEY),
      ])
    : [null, null, null, null, null];

  const pageStats = (counts: Record<string, number> | null) =>
    SCROLL_PAGES.map((page) => ({ name: page, detail: PAGE_NAMES[page], count: Number(counts?.[page] ?? 0) }));

  const groups: { label: string; stats: Stat[] }[] = [
    {
      label: "Clicked the portfolio",
      stats: [{ name: new URL(SITE_URL).href, detail: "Home page", count: Number(views?.["/"] ?? 0) }],
    },
    {
      label: "Live page clicks",
      stats: TRACKED_LINKS.map((link) => ({
        name: link,
        detail: link === FEATURED_LINK ? "Featured on About" : "Visit Page on Projects",
        count: Number(clicks?.[link] ?? 0),
      })),
    },
    { label: "Pressed or reached the page (through navbar or played the 3D game)", stats: pageStats(views) },
    { label: "Scrolled to the end", stats: pageStats(scrolls) },
    {
      label: "Played the 3D game",
      stats: [{ name: "/", detail: "Ender pearl throw", count: Number(games ?? 0) }],
    },
    {
      label: "Downloaded the resume",
      stats: RESUME_BUTTONS.map((source) => ({
        name: "Download Resume",
        detail: source,
        count: Number(resumes?.[source] ?? 0),
      })),
    },
  ];

  return (
    <main className="min-h-screen bg-[#0F0E0D] text-white">
      <div className="mx-auto w-full max-w-[1920px]">
        <div className={PAGE_INNER}>
          <h1 className={`${EYEBROW} max-w-none`}>Live View Statistics</h1>
          {!redis && <p className="mt-4 text-gray-400">Redis isn&apos;t configured, so nothing is being counted.</p>}
          <div className={SKILL_GROUPS_GRID}>
            {groups.map((g) => (
              <StatGroup key={g.label} {...g} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
