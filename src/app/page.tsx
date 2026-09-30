import { headers } from "next/headers";
import HomeLanding from "@/components/home/HomeLanding";

const CROSSHAIR_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'>" +
  "<path d='M11 2h2v9h9v2h-9v9h-2v-9H2v-2h9z' fill='white' stroke='rgba(0,0,0,0.55)' stroke-width='1'/></svg>";
const CROSSHAIR = `url("data:image/svg+xml,${encodeURIComponent(CROSSHAIR_SVG)}") 12 12, crosshair`;

export default async function Home() {
  const h = await headers();
  const hardReload = !h.get("rsc") && (h.get("cache-control")?.includes("no-cache") || h.get("pragma") === "no-cache");

  return (
    <main className="relative overflow-hidden bg-[#0f0e0d]" style={{ cursor: CROSSHAIR }}>
      <HomeLanding replay={hardReload} />
    </main>
  );
}
