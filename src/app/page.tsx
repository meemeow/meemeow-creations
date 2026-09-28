import { headers } from "next/headers";
import HomeLanding from "@/components/sections/HomeLanding";

// The cursor over the scene: Minecraft's crosshair, a thin white "+" (lightly outlined so it shows
// on the pale end stone too), with its hotspot in the middle.
const CROSSHAIR_SVG =
  "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'>" +
  "<path d='M11 2h2v9h9v2h-9v9h-2v-9H2v-2h9z' fill='white' stroke='rgba(0,0,0,0.55)' stroke-width='1'/></svg>";
const CROSSHAIR = `url("data:image/svg+xml,${encodeURIComponent(CROSSHAIR_SVG)}") 12 12, crosshair`;

// Home: the landing scene (particles, the End island, Steve's arrival and the "You Have Landed
// On..." sign). No set height: the layout stretches it to fill the space between the navbar
// and footer, so the page fits the screen without scrolling.
export default async function Home() {
  // A hard reload (Ctrl+Shift+R) asks for the page with "no-cache"; a normal refresh sends
  // "max-age=0". Treat the hard reload as a reset so the intro plays again. Only full page
  // loads count: client-side navigations fetch with an RSC header and are left alone.
  const h = await headers();
  const hardReload =
    !h.get("rsc") && (h.get("cache-control")?.includes("no-cache") || h.get("pragma") === "no-cache");

  return (
    <main className="relative overflow-hidden bg-[#0f0e0d]" style={{ cursor: CROSSHAIR }}>
      <HomeLanding replay={hardReload} />
    </main>
  );
}
