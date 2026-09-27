import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import AboutShowcase from "@/components/sections/AboutShowcase";
import GlowHeading from "@/components/sections/GlowHeading";
import PhotoCarousel from "@/components/sections/PhotoCarousel";
import ProjectRow from "@/components/sections/ProjectRow";
import { projects } from "@/data/projects";
import { REVEAL } from "@/lib/reveal";

// Section backgrounds cycle through three warm blacks: the contact page's two
// bands plus one step lighter in the same hue (the projects page's #191b1d read
// as blue next to them).
const BACKGROUNDS = ["bg-[#0f0e0d]", "bg-[#171615]", "bg-[#1e1c1b]"];

// Side margins match the projects page content (capped at 1920px and centered,
// margins growing with the viewport); vertical rhythm steps down on the
// navbar/footer tiers (2xl, lg, then 639 / 420px).
const SECTION_OUTER = "mx-auto w-full max-w-[1920px]";
const SECTION_INNER =
  "mx-8 px-6 min-[768px]:mx-12 min-[1024px]:mx-20 min-[1280px]:mx-24 min-[1440px]:mx-28 min-[1600px]:mx-32 upto-639:mx-4 upto-467:px-[12px] " +
  "py-20 max-2xl:py-16 max-lg:py-14 upto-639:py-10 upto-420:py-8";

// "From Me to You" type (Arial, extra bold) at the "My Projects" heading sizes.
// Headings may wrap (e.g. "Skills & Technologies" on phones), so lines are balanced.
const HEADING =
  "text-[3rem] leading-[1.1] font-extrabold text-white text-balance " +
  "max-2xl:text-[2.75rem] max-lg:text-[2.5rem] upto-639:text-[2.25rem] upto-420:text-[2rem] upto-376:text-[1.75rem]";

// Showcase curtain (states set by AboutShowcase): while "intro" a solid full-screen
// curtain in the section's own color shows only the heading, big and centered, over
// the section's real content. On "settled" the curtain rises while fading out
// (800ms, AboutShowcase's LIFT_MS) as the section shrinks to fit its content, and
// the content pops in underneath while it fades. "done" skips straight to the end.
const SHOWCASE_INNER =
  "[transition:min-height_800ms_cubic-bezier(.4,0,.2,1)] group-data-[state=intro]/show:min-h-svh! " +
  "group-data-[state=done]/show:[transition:none]";
// Pressing (or tapping) the curtain lifts it too, like scrolling (see AboutShowcase).
const CURTAIN =
  "absolute inset-x-0 top-0 z-10 flex cursor-pointer flex-col items-center justify-center px-6 text-center select-none " +
  "[transition:transform_800ms_cubic-bezier(.4,0,.2,1),opacity_800ms_ease] " +
  "group-data-[state=settled]/show:pointer-events-none " +
  "group-data-[state=settled]/show:[transform:translateY(-30%)] group-data-[state=settled]/show:opacity-0 " +
  "group-data-[state=done]/show:hidden";
// Navigation hint under the curtain heading: hidden until the visitor has been idle
// for a while, then AboutShowcase blinks it slowly. Positioned below the centred heading
// (clearing its enlarged size) so it doesn't push the heading off centre.
const CURTAIN_HINT =
  "absolute inset-x-6 top-[calc(50%+76px)] font-pixel text-[0.65rem] uppercase tracking-[0.12em] text-gray-300 opacity-0 " +
  "[text-shadow:2px_2px_0_rgba(0,0,0,0.75)] max-2xl:top-[calc(50%+62px)] upto-639:top-[calc(50%+40px)] upto-420:text-[0.55rem]";
// The first curtain sits under the navbar (116 / 99 / 81px on the 2xl / lg tiers).
// On desktop (lg+) every section is at least a screen tall with its content centred
// vertically; the first allows for the navbar above it (116 / 99px on the 2xl / lg tiers).
// Smaller screens, and sections with no content yet, keep content-height sections.
const FULL_SCREEN = "flex flex-col justify-center lg:min-h-svh";
const FULL_SCREEN_FIRST = "flex flex-col justify-center lg:min-h-[calc(100svh-116px)] lg:max-2xl:min-h-[calc(100svh-99px)]";
const OVERLAY_FIRST = "h-[calc(100svh-116px)] max-2xl:h-[calc(100svh-99px)] max-lg:h-[calc(100svh-81px)]";
// Curtain heading is the section heading, enlarged (normal size on phones so it fits).
const OVERLAY_SCALE = "scale-150 max-2xl:scale-125 upto-639:scale-100";

// Introduction block: name, role and location stacked as the page's hero, then the
// summary at a readable measure and two calls to action. Steps down on the
// navbar/footer tiers (2xl, lg, then 639 / 420 / 376px).
// Small section label above the name, styled like the contact page's "Contact via":
// Minecraft pixel type with its hard shadow and an engraved rule running out to the
// summary's width.
const EYEBROW =
  "flex max-w-[640px] items-center gap-4 font-pixel text-[0.7rem] uppercase tracking-[0.12em] text-white " +
  "[text-shadow:2px_2px_0_rgba(0,0,0,0.75)] upto-420:text-[0.6rem] " +
  "after:h-px after:flex-1 after:bg-[#1c1a19] after:[box-shadow:0_1px_0_#454140] after:content-['']";
const INTRO_NAME =
  "font-extrabold leading-[1.05] text-white text-[3.5rem] max-2xl:text-[3rem] max-lg:text-[2.75rem] " +
  "upto-639:text-[2.25rem] upto-420:text-[2rem] upto-376:text-[1.75rem]";
const INTRO_ROLE =
  "mt-2 font-gotham font-semibold text-gray-200 text-[1.5rem] max-2xl:text-[1.375rem] max-lg:text-[1.25rem] " +
  "upto-639:text-[1.125rem] upto-376:text-[1.0625rem]";
const INTRO_LOCATION =
  "mt-3 flex items-center gap-1.5 font-gotham font-medium text-gray-400 text-[1rem] upto-639:mt-2 upto-639:text-[0.9375rem]";
const INTRO_SUMMARY =
  "mt-6 max-w-[640px] max-xl:max-w-none font-gotham font-medium leading-[1.7] text-gray-300 text-[1.0625rem] max-lg:text-[1rem] " +
  "upto-639:mt-5 upto-639:text-[0.9375rem] upto-639:leading-[1.65]";
// Extra gap/margin so the stone buttons' 3px black outline doesn't touch.
const INTRO_ACTIONS = "mt-9 flex flex-wrap gap-5 max-2xl:gap-4 px-[3px] max-lg:mt-8 upto-639:mt-7 upto-420:flex-col upto-420:gap-4";
// Minecraft stone button, same as the contact page's "Email directly" (STONE_FACE):
// flat grey face, hard 3px bevel (lit top/left, shaded bottom/right), black outline,
// pixel label with a hard shadow. Hover brightens it; pressing sinks it and flips
// the bevel.
const INTRO_BUTTON =
  "relative inline-flex h-12 min-w-[200px] items-center justify-center gap-3 bg-[#8b8b8b] px-6 font-pixel text-[0.68rem] uppercase " +
  "tracking-[0.08em] text-white no-underline select-none [image-rendering:pixelated] [text-shadow:2px_2px_0_#3f3f3f] " +
  "[box-shadow:inset_3px_3px_0_0_#c6c6c6,inset_-3px_-3px_0_0_#4f4f4f,0_0_0_3px_#000000,0_5px_0_3px_rgba(0,0,0,0.35)] " +
  "[transition:background-color_100ms_steps(2),box-shadow_100ms_steps(2),transform_100ms_steps(2)] " +
  "hover:bg-[#a4a4a4] " +
  "hover:[box-shadow:inset_3px_3px_0_0_#dcdcdc,inset_-3px_-3px_0_0_#5f5f5f,0_0_0_3px_#000000,0_0_0_5px_rgba(255,255,255,0.35),0_5px_0_3px_rgba(0,0,0,0.35)] " +
  "active:[transform:translateY(4px)] " +
  "active:[box-shadow:inset_3px_3px_0_0_#4f4f4f,inset_-3px_-3px_0_0_#c6c6c6,0_0_0_3px_#000000,0_1px_0_3px_rgba(0,0,0,0.35)] " +
  "focus-visible:[outline:none] " +
  "focus-visible:[box-shadow:inset_3px_3px_0_0_#dcdcdc,inset_-3px_-3px_0_0_#5f5f5f,0_0_0_3px_#000000,0_0_0_6px_rgba(255,255,160,0.7),0_5px_0_3px_rgba(0,0,0,0.35)] " +
  // Compact below 2xl so both buttons (with icons) fit side by side in the narrower column.
  "max-2xl:min-w-0 max-2xl:gap-2 max-2xl:px-4 max-2xl:tracking-[0.04em] " +
  "max-lg:h-11 upto-420:min-w-0 upto-420:text-[0.6rem]";
// Secondary action in the contact page's link-slot style (MC_SLOT): dark panel with
// a beveled edge (lit top/right, black bottom/left) and the same pixel label as the
// stone button (Press Start 2P with a hard shadow);
// lightens on hover and presses down a touch. Same height as the stone button.
// Minecraft item icon leading each button (crafting table, book and quill), kept
// crisp when scaled down.
const BUTTON_ICON = "h-[22px] w-[22px] shrink-0 [image-rendering:pixelated] upto-420:h-5 upto-420:w-5";
const INTRO_SLOT_BUTTON =
  "inline-flex h-12 min-w-[200px] items-center justify-center gap-3 border-[3px] bg-[#2f2d2c] px-6 font-pixel uppercase tracking-[0.08em] " +
  "text-[0.68rem] text-gray-200 no-underline select-none [text-shadow:2px_2px_0_rgba(0,0,0,0.75)] " +
  // Shaded bottom/left edges in a dark tone of the face (not black), so they don't merge
  // with the black outline into a thick band.
  "border-t-[#3d3938] border-r-[#3d3938] border-b-[#1a1918] border-l-[#1a1918] " +
  // 3px black outline and hard drop shadow like the stone button's, so the pair reads the
  // same size side by side; pressing sinks it the same way.
  "[box-shadow:0_0_0_3px_#000000,0_5px_0_3px_rgba(0,0,0,0.35)] [transition:background-color_140ms_ease,color_140ms_ease,transform_100ms_ease,box-shadow_100ms_ease] " +
  "hover:bg-[#3a3735] hover:text-white active:[transform:translateY(4px)] " +
  "active:[box-shadow:0_0_0_3px_#000000,0_1px_0_3px_rgba(0,0,0,0.35)] " +
  // Hover ring like the stone button's: black outline plus a soft white glow.
  "hover:[box-shadow:0_0_0_3px_#000000,0_0_0_5px_rgba(255,255,255,0.35),0_5px_0_3px_rgba(0,0,0,0.35)] " +
  "focus-visible:[outline:2px_solid_rgba(255,255,160,0.7)] focus-visible:[outline-offset:2px] " +
  // Compact below 2xl so both buttons (with icons) fit side by side in the narrower column.
  "max-2xl:min-w-0 max-2xl:gap-2 max-2xl:px-4 max-2xl:tracking-[0.04em] " +
  "max-lg:h-11 upto-420:min-w-0 upto-420:text-[0.6rem]";

// Background block, laid out like the Introduction: school seal beside the school
// name (headline), degree (role line) and place/dates (meta), then certifications as
// beveled slots like the contact page's links.
const SCHOOL = "mt-5 flex items-center gap-5 upto-639:mt-4 upto-639:gap-4";
const SCHOOL_SEAL = "h-[84px] w-auto shrink-0 max-lg:h-[72px] upto-639:h-[60px] upto-420:h-[52px]";
const SCHOOL_NAME =
  "font-extrabold leading-[1.1] text-white text-[2.5rem] max-2xl:text-[2.25rem] max-lg:text-[2rem] " +
  "upto-639:text-[1.625rem] upto-420:text-[1.375rem] upto-376:text-[1.25rem]";
const DEGREE =
  "mt-5 max-w-[640px] font-gotham font-semibold text-gray-200 text-[1.25rem] leading-[1.4] max-2xl:text-[1.125rem] " +
  "upto-639:mt-4 upto-639:text-[1.0625rem]";
const DEGREE_TRACK = "mt-1 block font-medium text-gray-300 text-[1.0625rem] max-2xl:text-[1rem] upto-639:text-[0.9375rem]";
const SCHOOL_META =
  "mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 font-gotham font-medium text-gray-400 text-[1rem] upto-639:text-[0.9375rem]";
const META_ITEM = "flex items-center gap-1.5";
const SUB_EYEBROW =
  "mt-10 flex max-w-[640px] items-center gap-4 font-pixel text-[0.62rem] uppercase tracking-[0.12em] text-gray-300 " +
  "[text-shadow:2px_2px_0_rgba(0,0,0,0.75)] upto-639:mt-8 upto-420:text-[0.56rem] " +
  "after:h-px after:flex-1 after:bg-[#1c1a19] after:[box-shadow:0_1px_0_#454140] after:content-['']";
// Credly badges in a two-column grid (one column on phones), each slot linking to
// its verification page; lightens on hover and presses down like the slot button.
// Groups sit on a two-column grid too: a group with several badges takes the full
// row (its badges two across), single-badge groups pair up side by side.
const CERT_GROUPS_GRID = "mt-4 grid max-w-[640px] grid-cols-2 gap-x-3 gap-y-5 upto-639:grid-cols-1 upto-639:gap-y-4";
const CERT_GROUP_WIDE = "col-span-full";
const CERTS = "grid grid-cols-2 gap-3 upto-639:grid-cols-1";
const CERTS_SINGLE = "grid grid-cols-1 gap-3";
// Topic label above each group of badges.
const CERT_GROUP_LABEL = "mb-2.5 font-gotham font-semibold text-gray-400 text-[0.875rem] tracking-[0.02em] upto-639:text-[0.8125rem]";
const CERT =
  "flex h-full items-center gap-3.5 border-[3px] bg-[#2f2d2c] px-3.5 py-3 font-gotham no-underline " +
  "border-t-[#3d3938] border-r-[#3d3938] border-b-[#000000] border-l-[#000000] [box-shadow:0_6px_18px_rgba(0,0,0,0.45)] " +
  "[transition:background-color_140ms_ease,transform_100ms_ease] hover:bg-[#3a3735] active:[transform:translateY(2px)] " +
  "focus-visible:[outline:2px_solid_rgba(255,255,160,0.7)] focus-visible:[outline-offset:2px]";
const CERT_BADGE = "h-14 w-14 shrink-0 object-contain max-lg:h-12 max-lg:w-12";
// Badges drawn in black on transparent (CCST) sit on a white tile so they read on the dark slot.
const CERT_TILE = "rounded-md bg-white p-1";
const CERT_NAME = "block font-semibold leading-[1.3] text-white text-[0.9375rem] upto-639:text-[0.875rem]";
const CERT_DETAIL = "mt-0.5 block font-medium text-gray-400 text-[0.8125rem]";

// Credly badges (images saved from Credly), grouped by topic, each group in the
// order they were earned.
const CERT_GROUPS = [
  {
    label: "Programming",
    items: [
      { id: "56e40311-f63a-456c-8a18-1f0178296c17", img: "it-specialist-python", name: "IT Specialist: Python", issuer: "Certiport", date: "Mar 2024" },
      { id: "946cf358-2c54-4635-abd9-c5281df2ac47", img: "it-specialist-html-and-css", name: "IT Specialist: HTML and CSS", issuer: "Certiport", date: "Nov 2024" },
      { id: "968ee7ae-4637-4b5a-8b44-429b497fbb34", img: "it-specialist-javascript", name: "IT Specialist: JavaScript", issuer: "Certiport", date: "Nov 2025" },
    ],
  },
  {
    label: "Networking",
    items: [
      { id: "0d1e16fa-b1fc-43ef-97bf-085273d6f5b7", img: "ccna-introduction-to-networks", name: "CCNA: Introduction to Networks", issuer: "Cisco", date: "Mar 2024" },
      { id: "0331903d-35e0-490f-b097-e0e214cbb270", img: "ccna-switching-routing-wireless", name: "CCNA: Switching, Routing, and Wireless Essentials", issuer: "Cisco", date: "Jul 2024" },
      { id: "b99f16a9-04a3-464a-bd0b-e6f3402d465c", img: "ccna-enterprise-networking", name: "CCNA: Enterprise Networking, Security, and Automation", issuer: "Cisco", date: "Jan 2025" },
      { id: "01d6ee35-d548-4caf-a654-da2e47ee7365", img: "it-specialist-networking", name: "IT Specialist: Networking", issuer: "Certiport", date: "Jul 2024" },
      { id: "753b7f65-da75-4ba0-abf2-1ce6ec86f531", img: "devnet-associate", name: "DevNet Associate", issuer: "Cisco", date: "Mar 2025" },
    ],
  },
  {
    label: "Cybersecurity",
    items: [
      { id: "4812b8be-2e8d-41e7-aaab-20add5794987", img: "ccst-cybersecurity", tile: true, name: "Cisco Certified Support Technician: Cybersecurity", issuer: "Cisco", date: "Nov 2025" },
    ],
  },
  {
    label: "Project Management",
    items: [
      { id: "9e363fc8-280f-45c9-a244-59b2fdf442b4", img: "pmi-project-management-ready", name: "Project Management Ready", issuer: "PMI", date: "Mar 2025" },
    ],
  },
];

// Work Experience reuses the Background layout (logo beside the company, role, meta),
// then highlights with square pixel bullets (stone-button grey with its bevel). The
// stack sits beside it as cards built like the certification slots: a logo tile in
// place of the badge, the name, and what it was used for.
const HIGHLIGHTS = "mt-4 max-w-[640px] space-y-3.5 upto-639:space-y-3";
const HIGHLIGHT =
  "relative pl-6 font-gotham font-medium leading-[1.65] text-gray-300 text-[1rem] upto-639:text-[0.9375rem] " +
  "before:absolute before:left-0 before:top-[0.55em] before:h-2 before:w-2 before:bg-[#8b8b8b] before:content-[''] " +
  "before:[box-shadow:inset_1px_1px_0_#c6c6c6,inset_-1px_-1px_0_#4f4f4f,0_0_0_1px_#000000]";
const TECH_ASIDE = "w-[520px] max-2xl:w-full max-2xl:max-w-[640px]";
const TECH_GRID = "mt-4 grid grid-cols-2 gap-3 upto-639:grid-cols-1";
// Same slot as CERT, minus the link hover / press (these aren't links).
const TECH_CARD =
  "flex h-full items-center gap-3.5 border-[3px] bg-[#2f2d2c] px-3.5 py-3 font-gotham " +
  "border-t-[#3d3938] border-r-[#3d3938] border-b-[#000000] border-l-[#000000] [box-shadow:0_6px_18px_rgba(0,0,0,0.45)]";
// Logo on a dark rounded tile the size of a certification badge.
const TECH_TILE =
  "flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-[#1c1b1a] [box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.08)] " +
  "max-lg:h-12 max-lg:w-12";
const TECH_LOGO = "h-8 w-8 max-lg:h-7 max-lg:w-7";
// An empty slot (no logo yet): dashed outline with a pixel "?".
const TECH_TILE_OPEN = "open-slot rounded-none bg-transparent [box-shadow:none] font-pixel text-[0.9rem] text-gray-400";

// Logos from Simple Icons, in each brand's colour; no logo = an open "?" slot.
type TechItem = { logo?: string; name: string; detail: string };
const SIMPLEVIA_STACK: TechItem[] = [
  { logo: "react", name: "React", detail: "Components & navigation" },
  { logo: "typescript-white", name: "TypeScript", detail: "Type-safe frontend" },
  { logo: "tailwindcss", name: "Tailwind CSS", detail: "Responsive layouts" },
  { logo: "mantine-white", name: "Mantine", detail: "UI component library" },
];
// All open "?" slots: whatever the next team uses.
const OPEN_ROLE_STACK: TechItem[] = [
  { name: "Your framework", detail: "Learned fast" },
  { name: "Your language", detail: "Picked up fast" },
  { name: "Your tooling", detail: "Set up day one" },
  { name: "Your stack", detail: "Ready when you are" },
];

// Each job is a row: the copy, with its tech panel beside it (under it below 2xl).
// Jobs are split by an engraved rule like the eyebrow rules.
const JOB_ROW = "flex items-center gap-16 max-2xl:flex-col max-2xl:items-start max-2xl:gap-10 upto-639:gap-8";
// Less margin below than above: the next job's logo row brings its own top gap (SCHOOL's
// mt-5 / mt-4), so the space either side of the rule comes out even.
const JOB_DIVIDER =
  "mt-14 mb-9 h-px border-0 bg-[#1c1a19] [box-shadow:0_1px_0_#454140] max-2xl:mt-12 max-2xl:mb-7 upto-639:mt-10 upto-639:mb-6";
// The open role's logo: an empty dashed slot the size of the company logo tiles.
const OPEN_LOGO =
  "open-slot flex h-[84px] w-[84px] shrink-0 items-center justify-center bg-white/[0.03] " +
  "font-pixel text-[1.5rem] text-gray-400 max-lg:h-[72px] max-lg:w-[72px] " +
  "upto-639:h-[60px] upto-639:w-[60px] upto-639:text-[1.2rem] upto-420:h-[52px] upto-420:w-[52px]";
// Pixel diamond after "Your Company", sized to the heading text and kept crisp.
const DIAMOND = "ml-[0.3em] inline-block h-[0.85em] w-auto align-[-0.08em] [image-rendering:pixelated]";
// The open slots' "?": stretched taller (the pixel font's glyph is squat).
const OPEN_MARK = "inline-block scale-y-[1.2]";
const OPEN_LINK = "text-white underline decoration-white/40 underline-offset-4 hover:decoration-white";

// Open slots (the "?" logo and tech tiles) wear a dashed outline that slowly marches
// clockwise, like a selection box around an empty inventory slot waiting to be filled.
// Drawn with gradients (a dashed border can't move) and stepped 2px at a time for a
// pixel feel; still for visitors who prefer reduced motion. Kept here rather than in
// globals.css (which the dev server caches).
const OPEN_SLOT_CSS = `
.open-slot {
  --ants: rgba(255, 255, 255, 0.3);
  background-image:
    linear-gradient(90deg, var(--ants) 50%, transparent 0),
    linear-gradient(90deg, var(--ants) 50%, transparent 0),
    linear-gradient(0deg, var(--ants) 50%, transparent 0),
    linear-gradient(0deg, var(--ants) 50%, transparent 0);
  background-repeat: repeat-x, repeat-x, repeat-y, repeat-y;
  background-size: 12px 2px, 12px 2px, 2px 12px, 2px 12px;
  background-position: 0 0, 0 100%, 0 0, 100% 0;
  animation: open-slot-march 1.8s steps(6) infinite;
}
@keyframes open-slot-march {
  to { background-position: 12px 0, -12px 100%, 0 -12px, 100% 12px; }
}
@media (prefers-reduced-motion: reduce) { .open-slot { animation: none; } }
`;

// Tech panel beside a job: a label and certification-style cards.
function TechPanel({ label = "Tech Used", items }: { label?: string; items: TechItem[] }) {
  return (
    <div className={TECH_ASIDE}>
      <h4 className={`${SUB_EYEBROW} mt-0!`}>{label}</h4>
      <ul className={TECH_GRID}>
        {items.map((t) => (
          <li key={t.name} className={TECH_CARD}>
            <span className={t.logo ? TECH_TILE : `${TECH_TILE} ${TECH_TILE_OPEN}`}>
              {t.logo ? (
                <Image src={`/assets/images/tech/${t.logo}.svg`} alt="" aria-hidden="true" width={24} height={24} unoptimized className={TECH_LOGO} />
              ) : (
                <span aria-hidden="true" className={OPEN_MARK}>
                  ?
                </span>
              )}
            </span>
            <span>
              <span className={CERT_NAME}>{t.name}</span>
              <span className={CERT_DETAIL}>{t.detail}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Meta-line icons for the job entries.
const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <path
        d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12zm0-9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
);
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
    <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Skills & Technologies: groups paired two across the full width, so the block sits
// evenly between the section margins (one column on smaller screens),
// each a grid of compact certification-style cards: logo tile, name, what it is.
// Logos from Simple Icons in brand colours (wireframe / UI/UX are drawn icons).
const SKILL_GROUPS_GRID = "mt-6 grid w-full grid-cols-2 items-start gap-x-10 gap-y-8 max-lg:grid-cols-1 upto-639:mt-5 upto-639:gap-y-6";
const SKILL_GRID = "grid grid-cols-2 gap-3 upto-420:grid-cols-1";
const SKILL_CARD =
  "flex h-full items-center gap-3 border-[3px] bg-[#2f2d2c] px-3 py-2.5 font-gotham " +
  "border-t-[#3d3938] border-r-[#3d3938] border-b-[#000000] border-l-[#000000] [box-shadow:0_6px_18px_rgba(0,0,0,0.45)]";
const SKILL_TILE =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#1c1b1a] [box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.08)]";
const SKILL_LOGO = "h-6 w-6";
// For logos that read small at the standard size (tall or detailed marks).
const SKILL_LOGO_LARGE = "h-8 w-8";
// For wide logos (MySQL, PHP): nearly the full tile width.
const SKILL_LOGO_WIDE = "h-8 w-10";
const SKILL_GROUPS: { label: string; items: { logo: string; name: string; detail: string; large?: boolean; wide?: boolean }[] }[] = [
  {
    label: "Frontend",
    items: [
      { logo: "html5-color", name: "HTML5", detail: "Markup" },
      { logo: "css3-color", name: "CSS3", detail: "Styling" },
      { logo: "javascript-white", name: "JavaScript", detail: "Language" },
      { logo: "typescript-white", name: "TypeScript", detail: "Typed JavaScript" },
      { logo: "react", name: "React", detail: "UI library" },
      { logo: "nextdotjs", name: "Next.js", detail: "React framework" },
      { logo: "tailwindcss", name: "Tailwind CSS", detail: "Utility-first CSS" },
      { logo: "mantine-white", name: "Mantine", detail: "Component library" },
    ],
  },
  {
    label: "Backend & Database",
    items: [
      { logo: "firebase-brand", name: "Firebase", detail: "Backend platform" },
      { logo: "firebase-brand", name: "Firestore", detail: "NoSQL database" },
      { logo: "php-color", name: "PHP", detail: "Server-side language", wide: true },
      { logo: "mysql-logo", name: "MySQL", detail: "Relational database", wide: true },
    ],
  },
  {
    label: "Tools & AI",
    items: [
      { logo: "git-full", name: "Git", detail: "Version control" },
      { logo: "vite-color", name: "Vite", detail: "Build tool" },
      { logo: "nodedotjs-color", name: "Node.js", detail: "JavaScript runtime" },
      { logo: "claude-color", name: "Claude", detail: "AI-assisted development" },
      { logo: "chatgpt-white", name: "ChatGPT", detail: "Research & general inquiries" },
      { logo: "gemini-logo", name: "Gemini", detail: "Image editing & asset generation" },
    ],
  },
  {
    label: "Other Languages",
    items: [
      { logo: "python-color", name: "Python", detail: "General purpose", large: true },
      { logo: "java-color", name: "Java", detail: "Object-oriented", large: true },
      { logo: "cplusplus-color", name: "C++", detail: "Systems programming" },
    ],
  },
  {
    label: "Design",
    items: [
      { logo: "figma-color", name: "Figma", detail: "Design & prototyping" },
      { logo: "wireframe", name: "Wireframing", detail: "Layout planning" },
      { logo: "uiux", name: "UI/UX Design", detail: "User-centred design" },
    ],
  },
  {
    label: "Mobile",
    items: [
      { logo: "react", name: "React Native", detail: "Cross-platform apps" },
      { logo: "swift-white", name: "Swift", detail: "iOS apps" },
    ],
  },
];

// My Journey: a vertical timeline on an engraved rail (like the eyebrow rules). Each
// milestone has a stone-grey pixel marker, a small pixel date, a title and one line of
// detail; the last ("Present") is marked with the diamond from "Your Company".
const JOURNEY_LIST =
  "relative mt-8 max-w-[900px] pl-10 upto-639:mt-6 upto-639:pl-8 " +
  "before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-[#1c1a19] " +
  "before:[box-shadow:1px_0_0_#454140] before:content-[''] upto-639:before:left-[7px]";
const JOURNEY_ITEM = "relative pb-10 last:pb-0 max-lg:pb-8 upto-639:pb-7";
const JOURNEY_MARKER =
  "absolute top-[3px] left-[-34px] h-3.5 w-3.5 bg-[#8b8b8b] " +
  "[box-shadow:inset_2px_2px_0_#c6c6c6,inset_-2px_-2px_0_#4f4f4f,0_0_0_2px_#000000] upto-639:left-[-30px]";
const JOURNEY_DIAMOND = "absolute top-[-4px] left-[-38px] h-6 w-auto [image-rendering:pixelated] upto-639:left-[-34px]";
const JOURNEY_DATE =
  "font-pixel text-[0.62rem] uppercase tracking-[0.12em] text-gray-400 [text-shadow:2px_2px_0_rgba(0,0,0,0.75)] upto-420:text-[0.56rem]";
const JOURNEY_TITLE = "mt-2.5 font-gotham font-semibold leading-[1.3] text-white text-[1.25rem] max-lg:text-[1.125rem] upto-639:text-[1.0625rem]";
const JOURNEY_TEXT = "mt-1.5 font-gotham font-medium leading-[1.65] text-gray-400 text-[1rem] upto-639:text-[0.9375rem]";
const JOURNEY: { date: string; title: string; text: string; now?: boolean }[] = [
  {
    date: "Aug 2022",
    title: "Started at FEU Institute of Technology",
    text: "Began a BS in Information Technology, specializing in Web and Mobile Applications.",
  },
  {
    date: "2022 – 2023",
    title: "Foundations",
    text: "Completed my general education subjects and introductory courses in programming and web development.",
  },
  {
    date: "Mar 2024",
    title: "First certifications",
    text: "Earned IT Specialist: Python and CCNA: Introduction to Networks.",
  },
  {
    date: "Jul – Nov 2024",
    title: "Networking and web foundations",
    text: "Added CCNA: Switching, Routing, and Wireless Essentials, IT Specialist: Networking, and IT Specialist: HTML and CSS.",
  },
  {
    date: "Dec 2024",
    title: "Started ePasigLib",
    text: "Began building a library management system for Pasig Knowledge Center as my capstone project.",
  },
  {
    date: "Jan – Mar 2025",
    title: "Broadening my skills",
    text: "Completed CCNA: Enterprise Networking, Security, and Automation, DevNet Associate, and PMI Project Management Ready.",
  },
  {
    date: "Nov 2025",
    title: "JavaScript and cybersecurity",
    text: "Earned IT Specialist: JavaScript and Cisco Certified Support Technician: Cybersecurity.",
  },
  {
    date: "Jan – Jun 2026",
    title: "Frontend Developer Intern at Simplevia Technologies Inc.",
    text: "Built the frontend of a B2B school management system over 1,040 hours, fully remote.",
  },
  {
    date: "Sep 2026",
    title: "Graduated",
    text: "Completed my degree at FEU Tech's 67th Commencement Exercises, with ePasigLib delivered.",
  },
  {
    date: "Present",
    title: "The next chapter",
    text: "Looking for an entry-level frontend developer role where I can keep learning and building.",
    now: true,
  },
];

// Featured Project: a centred two-line summary, the projects page's stacked preview card
// (hover lifts it and cycles the screenshots) with the buttons under it, then the details
// (Work Experience layout) beside the tech stack.
const EPASIGLIB = projects.find((p) => p.title === "ePasigLib")!;
const FEATURED_SUMMARY =
  "mx-auto mt-5 max-w-[980px] text-center font-gotham font-medium leading-[1.7] text-gray-300 text-[1.125rem] " +
  "max-2xl:text-[1.0625rem] max-lg:text-[1rem] upto-639:mt-4 upto-639:text-[0.9375rem]";
const FEATURED_PREVIEW = "project-row mt-8 flex justify-center max-lg:mt-7 upto-639:mt-6";
// Full width up to the desktop size, so it scales smoothly (the projects page's own
// sizing drops it to three fifths at 941px, beside text that isn't here).
const FEATURED_CARD = "w-full max-w-[960px]";
// Looping zombie-riding-a-chicken sprite (animated WebP, background keyed out) leading
// the Visit button; a little larger than the other button icons since it's a full scene.
// Pulled left: the sprite sits right of centre in its frame, which read as extra padding.
const ZOMBIE_ICON = "-my-1 -ml-2.5 h-[38px] w-[38px] shrink-0 max-lg:h-9 max-lg:w-9 upto-420:h-8 upto-420:w-8";
// The two buttons as equal-width grid columns (both as wide as the wider one), centred;
// stacked below 640px, still sharing one width.
const FEATURED_ACTIONS =
  "mx-auto mt-9 grid w-fit grid-cols-2 gap-5 px-[3px] max-2xl:gap-4 max-lg:mt-8 upto-639:mt-7 upto-639:grid-cols-1 upto-639:gap-4";
const FEATURED_ROW = `${JOB_ROW} mt-12 max-2xl:mt-10 upto-639:mt-8`;
const EPASIGLIB_STACK: TechItem[] = [
  { logo: "react", name: "React", detail: "Web interfaces" },
  { logo: "typescript-white", name: "TypeScript", detail: "Typed codebase" },
  { logo: "vite-color", name: "Vite", detail: "Build tool" },
  { logo: "tailwindcss", name: "Tailwind CSS", detail: "Responsive layouts" },
  { logo: "firebase-brand", name: "Firebase", detail: "Auth & Cloud Functions" },
  { logo: "firebase-brand", name: "Firestore", detail: "Real-time data" },
];

// My Approach: text only, across the full width. The focus line, then numbered groups two
// across (one below 2xl), each a heading over short points: a white lead phrase and a
// grey explanation, so the leads can be skimmed.
const APPROACH_FOCUS =
  "mt-5 font-gotham font-semibold leading-[1.3] text-white text-[1.5rem] max-2xl:text-[1.375rem] max-lg:text-[1.25rem] " +
  "upto-639:mt-4 upto-639:text-[1.125rem]";
// Two across only from 2xl, where every point fits on one line; narrower two-column
// layouts made nearly every point wrap.
const APPROACH_GRID = "mt-12 grid grid-cols-2 gap-x-16 gap-y-16 max-2xl:grid-cols-1 max-2xl:gap-y-14 max-lg:gap-y-12 upto-639:mt-9 upto-639:gap-y-10";
const APPROACH_HEADING = "flex items-baseline gap-3 font-gotham font-semibold text-white text-[1.25rem] max-lg:text-[1.125rem]";
const APPROACH_NUMBER = "font-pixel text-[0.7rem] text-gray-500 [text-shadow:2px_2px_0_rgba(0,0,0,0.75)]";
// Tight on wide screens (one-line points); more room where points start wrapping, so a
// wrapped point doesn't run into the next one.
const APPROACH_POINTS = "mt-5 space-y-2 max-2xl:space-y-3 upto-639:space-y-3.5";
// Leads are white at the body weight (not bold) so they don't compete with the group
// headings; the explanation steps down a shade so the leads still read first.
const APPROACH_LEAD = "text-gray-100";
const APPROACH_POINT = `${HIGHLIGHT} text-gray-400!`; // ! beats HIGHLIGHT's own grey
const APPROACH_GROUPS: { title: string; points: [lead: string, text: string][] }[] = [
  {
    title: "Problem Solving",
    points: [
      ["Problem first.", "Understand what users need before writing any code."],
      ["Clear scope.", "Pin down requirements and edge cases, then ship in small pieces."],
      ["Root causes.", "Fix why a bug happens, not just where it shows up."],
    ],
  },
  {
    title: "Design",
    points: [
      ["Faithful to the design.", "Turn UI/UX designs into production-ready components."],
      ["Responsive by default.", "Consistent layouts across screen sizes and browsers."],
      ["Accessible.", "Semantic HTML, keyboard support, and readable contrast."],
    ],
  },
  {
    title: "Development",
    points: [
      ["Reusable components.", "Build shared pieces instead of one-off screens."],
      ["Typed and predictable.", "TypeScript, with clear state and data flow."],
      ["Maintainable.", "Refactor to cut duplication before it slows new features down."],
    ],
  },
  {
    title: "Testing",
    points: [
      ["Every device.", "Check features across screens and browsers before they ship."],
      ["Every state.", "Loading, empty, and error states, not just the happy path."],
      ["Clean history.", "Review my own changes and keep Git easy to follow."],
    ],
  },
  {
    title: "Performance",
    points: [
      ["Fast loads.", "Optimized images, lazy loading, and lean bundles."],
      ["Smooth UI.", "Avoid unnecessary re-renders and heavy main-thread work."],
      ["Nothing wasted.", "Pause animations and media that are off screen."],
    ],
  },
  {
    title: "Collaboration",
    points: [
      ["Clean integration.", "APIs and backend services with clear loading and error handling."],
      ["Talk early.", "Stay in sync with designers and backend developers, remote or on-site."],
      ["Leave it better.", "Code and notes that make the next feature easier to build."],
    ],
  },
];

// Beyond Coding: the groups stacked, each a heading (My Approach's group heading, same
// size as the focus line), a short note, then wrapping chips built like the skill cards
// (text only, no tile).
const HOBBY_LIST = "mt-5 space-y-14 max-lg:space-y-12 upto-639:mt-4 upto-639:space-y-10";
const HOBBY_HEADING =
  "font-gotham font-semibold leading-[1.3] text-white text-[1.5rem] max-2xl:text-[1.375rem] max-lg:text-[1.25rem] upto-639:text-[1.125rem]";
const HOBBY_NOTE =
  "mt-2 max-w-[720px] font-gotham font-medium leading-[1.7] text-gray-400 text-[1rem] upto-639:text-[0.9375rem] upto-639:leading-[1.65]";
const HOBBY_CHIPS = "mt-5 flex flex-wrap gap-3 upto-639:mt-4";
const HOBBY_CHIP =
  "flex items-center gap-2.5 border-[3px] bg-[#2f2d2c] px-3.5 py-2 font-gotham font-semibold text-white text-[0.9375rem] upto-639:text-[0.875rem] " +
  "border-t-[#3d3938] border-r-[#3d3938] border-b-[#000000] border-l-[#000000] [box-shadow:0_6px_18px_rgba(0,0,0,0.45)]";
// Each game's own app icon in colour, leading its chip, slightly rounded like an app tile.
// Files are renamed whenever an image changes so the browser doesn't serve cached copies.
const HOBBY_ICON = "h-6 w-6 shrink-0 rounded-[4px] object-contain upto-639:h-5 upto-639:w-5";
// Icons with no tile of their own (a bare mark or sprite) read larger than the tiled ones
// at the same size, so they're inset a little within the same box (text stays aligned).
const HOBBY_ICON_BARE = "p-[2px] upto-639:p-[1.5px]";
const BARE_ICONS = new Set(["Valorant", "R.E.P.O.", "Stardew Valley", "Terraria"]);
// The pixel sprites (Stardew's chicken, Terraria's tree) read small at that inset, so theirs is halved.
const SPRITE_ICONS = new Set(["Stardew Valley", "Terraria"]);
const HOBBY_ICON_SPRITE = "p-[1px] upto-639:p-[0.75px]";
// Terraria's tree is tall and narrow, leaving empty space either side in its square box;
// pull the name in so the gap matches the other chips.
const TERRARIA_ICON = "-mr-[5px] upto-639:-mr-1";
const GAME_ICONS: Record<string, string> = {
  Valorant: "valorant-red",
  Minecraft: "minecraft-icon",
  "R.E.P.O.": "repo-robot",
  "Genshin Impact": "genshin-impact-icon",
  "Honkai: Star Rail": "honkai-star-rail-icon",
  "Counter-Strike 2": "counterstrike-icon",
  "Stardew Valley": "stardew-valley-icon",
  Terraria: "terraria-icon",
  "Dota 2": "dota2-cutout",
  "Mobile Legends: Bang Bang": "mobile-legends-icon",
};
const HOBBY_GROUPS: { label: string; note: string; items: string[] }[] = [
  {
    label: "Online Games",
    note:
      "My go-to stress reliever after a long day. Whether it's ranked matches with friends or a slow evening " +
      "on the farm, games are how I unwind.",
    items: [
      "Valorant",
      "Minecraft",
      "R.E.P.O.",
      "Genshin Impact",
      "Honkai: Star Rail",
      "Counter-Strike 2",
      "Stardew Valley",
      "Terraria",
      "Dota 2",
      "Mobile Legends: Bang Bang",
    ],
  },
  {
    label: "Anime",
    note:
      "My way to switch off and get lost in another world. I'll happily binge anything from a lighthearted " +
      "rom-com to an epic adventure.",
    items: ["Romance", "Comedy", "Adventure", "Action", "Shounen", "School", "Slice of Life", "Isekai"],
  },
  {
    label: "Food",
    note:
      "Good food is my favorite reward after finishing a project. Japanese food is my weakness, and there's " +
      "always room for ice cream.",
    items: ["Ice Cream", "Tempura", "Ramen", "Sushi", "Fried Chicken", "Fries", "Coffee"],
  },
];

// `aside` puts something beside the heading and copy, stacking on top of them below
// `asideFrom`: "lg" (1024px, the default), "xl" (1280px) or "2xl" (1536px, for wide asides that
// would squeeze the copy).
// `eyebrow` shows the section title as the small pixel label (like the Introduction)
// instead of the big heading, leaving the content to carry the headline.
// `eyebrowFull` runs the eyebrow's rule across the whole section (for full-width content).
type Section = {
  title: string | null;
  content?: ReactNode;
  aside?: ReactNode;
  asideFrom?: "lg" | "xl" | "2xl";
  eyebrow?: boolean;
  eyebrowFull?: boolean;
};

// Row layouts for a section with an aside (literal strings so Tailwind sees them).
// Copy column width once an "xl" row has stacked: a wider 820px centred column (the
// Introduction's summary and eyebrow widen to fill it; phones are narrower anyway).
const COPY_STACKED = { lg: "", xl: "max-xl:max-w-[820px]", "2xl": "" };
const ASIDE_ROW = {
  lg: "flex items-center gap-16 max-2xl:gap-12 max-lg:flex-col-reverse max-lg:items-start max-lg:gap-8 upto-639:items-center",
  // Stacked below xl, centred: the portrait in the middle and the copy as a centred
  // column at its 640px measure (see COPY_STACKED), so neither hugs the left edge.
  xl: "flex items-center gap-16 max-2xl:gap-12 max-xl:flex-col-reverse max-xl:items-center max-xl:gap-8",
  "2xl": "flex items-center gap-16 max-2xl:flex-col-reverse max-2xl:items-center max-2xl:gap-10 upto-639:gap-8",
};

// Portrait carousel width for the introduction: large beside the copy and never
// wider than the phone column when stacked. The side margins reserve room for the
// previous/next photos peeking out (a fifth of the width each side) so they don't
// run into the copy; on phones they just slip off the screen edges instead.
const PORTRAIT =
  "w-[449px] mx-[90px] max-2xl:w-[388px] max-2xl:mx-[78px] max-lg:w-[337px] max-lg:mx-[67px] " +
  "upto-639:mx-0 upto-639:w-[min(306px,calc(100vw-5rem))]";

// Landscape (4:3) carousel for the Background photos: same card stack as the portrait,
// wider and less tall, with the same fifth-of-the-width room reserved for the peeks.
const LANDSCAPE =
  "w-[480px] mx-[96px] max-2xl:w-[440px] max-2xl:mx-[88px] max-lg:w-[380px] max-lg:mx-[76px] " +
  "upto-639:mx-0 upto-639:w-[min(320px,calc(100vw-5rem))]";

// `title: null` marks a blank section, kept for content still to come.
const SECTIONS: Section[] = [
  {
    title: "Introduction",
    // Beside the copy only from 1280px: below that the portrait (with its peeking
    // neighbours) squeezed the name, summary and buttons into a narrow column.
    asideFrom: "xl",
    eyebrow: true,
    aside: (
      <PhotoCarousel
        priority
        photos={[
          { src: "/assets/images/emerson-portrait.png", alt: "Emerson Clamor in FEU Institute of Technology graduation attire" },
          { src: "/assets/images/emerson-portrait-2.png", alt: "Emerson Clamor in a cream barong" },
        ]}
        width={685}
        height={1024}
        sizes="(max-width: 639px) 306px, (max-width: 1023px) 337px, (max-width: 1535px) 388px, 449px"
        className={PORTRAIT}
      />
    ),
    content: (
      <div className="mt-5 upto-639:mt-4">
        <h1 className={INTRO_NAME}>Emerson Clamor</h1>
        <p className={INTRO_ROLE}>Frontend Developer</p>
        <p className={INTRO_LOCATION}>
          {/* map pin */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
            <path
              d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12zm0-9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
          Caloocan City, Philippines
        </p>
        <p className={INTRO_SUMMARY}>
          Frontend Developer with experience developing responsive web applications using React, TypeScript,
          JavaScript, Tailwind CSS, Mantine, and Firebase. Experienced in building reusable UI components, integrating
          backend services and APIs, implementing responsive interfaces, and refactoring component architectures for
          maintainability.
        </p>
        <div className={INTRO_ACTIONS}>
          <Link href="/projects" className={INTRO_BUTTON}>
            <Image src="/assets/images/mc-crafting-table.png" alt="" aria-hidden="true" width={364} height={364} className={BUTTON_ICON} />
            View Projects
          </Link>
          {/* Downloads the resume PDF (saved under a readable file name). */}
          <a href="/assets/files/Clamor_Emerson_Resume_2026.pdf" download="Clamor_Emerson_Resume_2026.pdf" className={INTRO_SLOT_BUTTON}>
            <Image src="/assets/images/mc-book-and-quill.png" alt="" aria-hidden="true" width={360} height={360} className={BUTTON_ICON} />
            Download Resume
          </a>
        </div>
      </div>
    ),
  },
  {
    title: "Background",
    asideFrom: "2xl",
    aside: (
      <PhotoCarousel
        title="Commencement 2026"
        subtitle="67th Commencement Exercises · PICC, Pasay City"
        photos={[
          { src: "/assets/images/feu-grad-1.png", alt: "FEU Institute of Technology 2026, 67th Commencement Exercises title screen" },
          { src: "/assets/images/feu-grad-2.png", alt: "Graduates seated at the 67th Commencement Exercises at the PICC, Pasay City" },
          { src: "/assets/images/feu-grad-3.png", alt: "FEU Institute of Technology seal on stage, framed by flowers" },
          { src: "/assets/images/feu-grad-4.png", alt: "Graduation cap resting on an FEU Institute of Technology diploma cover" },
          { src: "/assets/images/feu-grad-5.png", alt: "The ceremonial mace at the commencement exercises" },
        ]}
        // Hidden sixth photo, unlocked by moving past the last one (see PhotoCarousel).
        // Dancing cats sit over the photo's top-left and bottom-right corners (the photo
        // spans about 16–84% of the card's width at 90% of its height).
        secret={{
          src: "/assets/images/feu-grad-6.png",
          alt: "Emerson Clamor's selfie at the 67th Commencement Exercises",
          fit: "contain",
          stickers: [
            { src: "/assets/images/scuba-cat.webp", className: "left-[1%] top-[1%] w-[32%]" },
            { src: "/assets/images/cat-dance.webp", className: "right-[1%] -bottom-[5%] w-[35%]" },
          ],
        }}
        secretFlag="__aboutGradSecret"
        width={2048}
        height={2048}
        aspect="4 / 3"
        fit="fill"
        sizes="(max-width: 639px) 320px, (max-width: 1023px) 380px, (max-width: 1535px) 440px, 480px"
        className={LANDSCAPE}
      />
    ),
    eyebrow: true,
    content: (
      <div>
        <div className={SCHOOL}>
          <Image src="/assets/images/feu-tech-seal.png" alt="FEU Institute of Technology seal" width={286} height={349} className={SCHOOL_SEAL} />
          <h3 className={SCHOOL_NAME}>FEU Institute of Technology</h3>
        </div>
        <p className={DEGREE}>
          Bachelor of Science in Information Technology
          <span className={DEGREE_TRACK}>Specialization in Web and Mobile Applications</span>
        </p>
        <p className={SCHOOL_META}>
          <span className={META_ITEM}>
            {/* map pin */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
              <path
                d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12zm0-9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
            Manila, Philippines
          </span>
          <span className={META_ITEM}>
            {/* calendar */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
              <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            August 2022 – September 2026
          </span>
        </p>

        <h3 className={SUB_EYEBROW}>Certifications</h3>
        <div className={CERT_GROUPS_GRID}>
          {CERT_GROUPS.map((group) => (
            <div key={group.label} className={group.items.length > 1 ? CERT_GROUP_WIDE : ""}>
              <h4 className={CERT_GROUP_LABEL}>{group.label}</h4>
              <ul className={group.items.length > 1 ? CERTS : CERTS_SINGLE}>
                {group.items.map((c) => (
                  <li key={c.id}>
                    <a href={`https://www.credly.com/badges/${c.id}`} target="_blank" rel="noopener noreferrer" className={CERT}>
                      <Image src={`/assets/images/badges/${c.img}.png`} alt="" aria-hidden="true" width={112} height={112} className={`${CERT_BADGE} ${"tile" in c && c.tile ? CERT_TILE : ""}`} />
                      <span>
                        <span className={CERT_NAME}>{c.name}</span>
                        <span className={CERT_DETAIL}>
                          {c.issuer} · {c.date}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Work Experience",
    eyebrow: true,
    content: (
      <div>
        {/* Newest first: an open template for the next role, then the internship. */}
        <div className={JOB_ROW}>
          <div className="w-full min-w-0 flex-1">
            <div className={SCHOOL}>
              <span className={OPEN_LOGO} aria-hidden="true">
                <span className={OPEN_MARK}>?</span>
              </span>
              <h3 className={SCHOOL_NAME}>
                Your Company
                {/* Minecraft diamond: a small nod to the "find" this role would be. */}
                <Image src="/assets/images/mc-diamond.png" alt="" aria-hidden="true" width={120} height={130} className={DIAMOND} />
              </h3>
            </div>
            <p className={DEGREE}>
              Entry-Level Frontend Developer
              <span className={DEGREE_TRACK}>Your product, your team</span>
            </p>
            <p className={SCHOOL_META}>
              <span className={META_ITEM}>
                <PinIcon />
                Your city (or remote)
              </span>
              <span className={META_ITEM}>
                <CalendarIcon />
                Soon – Present
              </span>
              <span className={META_ITEM}>
                <ClockIcon />
                Full-time
              </span>
            </p>

            <h3 className={SUB_EYEBROW}>Highlights</h3>
            <ul className={HIGHLIGHTS}>
              <li className={HIGHLIGHT}>
                Seeking an <span className="text-white">entry-level frontend developer role</span> where I can contribute to
                production features from the start.
              </li>
              <li className={HIGHLIGHT}>
                Quick to adapt to <span className="text-white">new codebases and tools</span>, and eager to learn from the
                team.
              </li>
              <li className={HIGHLIGHT}>
                Open to full-time opportunities, hybrid or fully remote.{" "}
                <Link href="/contact" className={OPEN_LINK}>
                  Get in touch
                </Link>{" "}
                to discuss how I can support your team.
              </li>
            </ul>
          </div>
          <TechPanel label="Your Tech Stack" items={OPEN_ROLE_STACK} />
        </div>

        <hr className={JOB_DIVIDER} />

        <div className={JOB_ROW}>
          <div className="w-full min-w-0 flex-1">
            <div className={SCHOOL}>
              {/* On its own white tile, like the CCST badge. */}
              <Image src="/assets/images/simplevia-tile.png" alt="Simplevia Technologies logo" width={370} height={370} className={`${SCHOOL_SEAL} rounded-[14px] [box-shadow:0_6px_18px_rgba(0,0,0,0.45)] max-lg:rounded-xl upto-639:rounded-[10px]`} />
              <h3 className={SCHOOL_NAME}>Simplevia Technologies Inc.</h3>
            </div>
            <p className={DEGREE}>
              Frontend Developer Intern
              <span className={DEGREE_TRACK}>B2B school management system</span>
            </p>
            <p className={SCHOOL_META}>
              <span className={META_ITEM}>
                <PinIcon />
                Pasig City, Philippines
              </span>
              <span className={META_ITEM}>
                <CalendarIcon />
                January 2026 – June 2026
              </span>
              <span className={META_ITEM}>
                <ClockIcon />
                1,040 hours
              </span>
            </p>

            <h3 className={SUB_EYEBROW}>Highlights</h3>
            <ul className={HIGHLIGHTS}>
              <li className={HIGHLIGHT}>
                Developed a responsive B2B school management system frontend using React, TypeScript, and Tailwind CSS,
                implementing <span className="text-white">multi-level navigation</span> and{" "}
                <span className="text-white">tab-based workflows</span> for complex application interfaces.
              </li>
              <li className={HIGHLIGHT}>
                Refactored the React component architecture across <span className="text-white">7 feature modules</span>,
                reducing component duplication and improving maintainability for future feature development.
              </li>
              <li className={HIGHLIGHT}>
                Translated UI/UX designs into <span className="text-white">reusable, production-ready React components</span>{" "}
                using Mantine and Tailwind CSS, maintaining consistent responsive layouts across screen sizes.
              </li>
              <li className={HIGHLIGHT}>
                Worked <span className="text-white">fully remote</span>, staying in sync with the team online throughout the
                internship.
              </li>
            </ul>
          </div>
          <TechPanel items={SIMPLEVIA_STACK} />
        </div>
      </div>
    ),
  },
  {
    title: "Skills & Technologies",
    eyebrow: true,
    content: (
      <div className={SKILL_GROUPS_GRID}>
        {SKILL_GROUPS.map((group) => (
          <div key={group.label}>
            <h3 className={CERT_GROUP_LABEL}>{group.label}</h3>
            <ul className={SKILL_GRID}>
              {group.items.map((t) => (
                <li key={t.name} className={SKILL_CARD}>
                  <span className={SKILL_TILE}>
                    <Image src={`/assets/images/tech/${t.logo}.svg`} alt="" aria-hidden="true" width={24} height={24} unoptimized className={t.wide ? SKILL_LOGO_WIDE : t.large ? SKILL_LOGO_LARGE : SKILL_LOGO} />
                  </span>
                  <span>
                    <span className={CERT_NAME}>{t.name}</span>
                    <span className={CERT_DETAIL}>{t.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),
  },
  {
    // What I do (focus areas), then how I work, group by group.
    title: "My Approach",
    eyebrow: true,
    eyebrowFull: true,
    content: (
      <div>
        <p className={APPROACH_FOCUS}>Frontend • UI/UX • Backend Integration</p>
        <div className={APPROACH_GRID}>
          {APPROACH_GROUPS.map((g, k) => (
            <div key={g.title}>
              <h3 className={APPROACH_HEADING}>
                <span className={APPROACH_NUMBER}>{String(k + 1).padStart(2, "0")}</span>
                {g.title}
              </h3>
              <ul className={APPROACH_POINTS}>
                {g.points.map(([lead, text]) => (
                  <li key={lead} className={APPROACH_POINT}>
                    <span className={APPROACH_LEAD}>{lead}</span> {text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Featured Project",
    eyebrow: true,
    eyebrowFull: true,
    content: (
      <div>
        <p className={FEATURED_SUMMARY}>{EPASIGLIB.desc}.</p>

        <div className={FEATURED_PREVIEW}>
          <ProjectRow p={EPASIGLIB} className={FEATURED_CARD} />
        </div>

        <div className={FEATURED_ACTIONS}>
          <a href={EPASIGLIB.url} target="_blank" rel="noopener noreferrer" className={INTRO_BUTTON}>
            <Image src="/assets/images/mc-zombie-chicken.webp" alt="" aria-hidden="true" width={72} height={72} unoptimized className={ZOMBIE_ICON} />
            Visit ePasigLib
          </a>
          <Link href="/projects" className={INTRO_SLOT_BUTTON}>
            <Image src="/assets/images/mc-crafting-table.png" alt="" aria-hidden="true" width={364} height={364} className={BUTTON_ICON} />
            See All Projects
          </Link>
        </div>

        <div className={FEATURED_ROW}>
          <div className="w-full min-w-0 flex-1">
            <h3 className={`${SCHOOL_NAME} ${SCHOOL}`}>ePasigLib</h3>
            <p className={DEGREE}>
              Full Stack Developer
              <span className={DEGREE_TRACK}>Capstone Project · Pasig Knowledge Center</span>
            </p>
            <p className={SCHOOL_META}>
              <span className={META_ITEM}>
                <PinIcon />
                Pasig City, Philippines
              </span>
              <span className={META_ITEM}>
                <CalendarIcon />
                December 2024 – September 2026
              </span>
            </p>

            <h3 className={SUB_EYEBROW}>Highlights</h3>
            <ul className={HIGHLIGHTS}>
              <li className={HIGHLIGHT}>
                Developed a full-stack digital library management system for Pasig Knowledge Center, implementing{" "}
                <span className="text-white">automated circulation, cataloging, and user management</span>.
              </li>
              <li className={HIGHLIGHT}>
                Added <span className="text-white">real-time asset tracking</span> through barcode and NFC integration for
                borrowing and returns.
              </li>
              <li className={HIGHLIGHT}>
                Built responsive frontend interfaces using React, TypeScript, Vite, and Tailwind CSS, developing{" "}
                <span className="text-white">reusable components</span> and cross-browser compatible layouts.
              </li>
              <li className={HIGHLIGHT}>
                Implemented backend services with Firebase Authentication, Firestore, and Cloud Functions to support{" "}
                <span className="text-white">real-time data synchronization</span> and application workflows.
              </li>
            </ul>
          </div>
          <TechPanel items={EPASIGLIB_STACK} />
        </div>
      </div>
    ),
  },
  {
    title: "My Journey",
    eyebrow: true,
    content: (
      <ol className={JOURNEY_LIST}>
        {JOURNEY.map((m) => (
          <li key={m.date} className={JOURNEY_ITEM}>
            {m.now ? (
              <Image src="/assets/images/mc-diamond.png" alt="" aria-hidden="true" width={120} height={130} className={JOURNEY_DIAMOND} />
            ) : (
              <span aria-hidden="true" className={JOURNEY_MARKER} />
            )}
            <p className={JOURNEY_DATE}>{m.date}</p>
            <h3 className={JOURNEY_TITLE}>{m.title}</h3>
            <p className={JOURNEY_TEXT}>{m.text}</p>
          </li>
        ))}
      </ol>
    ),
  },
  {
    title: "Beyond Coding",
    eyebrow: true,
    eyebrowFull: true,
    content: (
      <div>
        <div className={HOBBY_LIST}>
          {HOBBY_GROUPS.map((group) => (
            <div key={group.label}>
              <h3 className={HOBBY_HEADING}>{group.label}</h3>
              <p className={HOBBY_NOTE}>{group.note}</p>
              <ul className={HOBBY_CHIPS}>
                {group.items.map((item) => (
                  <li key={item} className={HOBBY_CHIP}>
                    {GAME_ICONS[item] && (
                      <Image src={`/assets/images/games/${GAME_ICONS[item]}.png`} alt="" aria-hidden="true" width={48} height={48} className={`${HOBBY_ICON} ${SPRITE_ICONS.has(item) ? HOBBY_ICON_SPRITE : BARE_ICONS.has(item) ? HOBBY_ICON_BARE : ""} ${item === "Terraria" ? TERRARIA_ICON : ""}`} />
                    )}
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  { title: null },
];

export default function About() {
  return (
    <AboutShowcase>
      <style>{OPEN_SLOT_CSS}</style>
      {SECTIONS.map(({ title, content, aside, asideFrom = "lg", eyebrow, eyebrowFull }, i) => (
        // Titled sections open as a full-screen card with only their heading (see AboutShowcase).
        <section
          key={i}
          aria-label={title ?? undefined}
          data-showcase={title ? "" : undefined}
          data-state={title ? "intro" : undefined}
          className={`group/show relative overflow-hidden ${BACKGROUNDS[i % BACKGROUNDS.length]} ${i > 0 ? "border-t border-white/[0.08]" : ""}`}
        >
          <div className={SECTION_OUTER}>
            <div className={`${SECTION_INNER} ${SHOWCASE_INNER} ${content ? (i === 0 ? FULL_SCREEN_FIRST : FULL_SCREEN) : ""} min-h-[320px] max-lg:min-h-[260px] upto-639:min-h-[200px]`}>
              <div className={aside ? ASIDE_ROW[asideFrom] : ""}>
                <div className={`w-full min-w-0 flex-1 ${aside ? COPY_STACKED[asideFrom] : ""}`}>
                  {title && (
                    <div data-showcase-body className={REVEAL}>
                      {/* The curtain already shows "Introduction" big, so inside it's only a small
                          label and the name below is the page heading. */}
                      {/* Eyebrow sections keep their title as the small label; the Introduction's is a
                          plain label (the name is the page heading), the others stay headings. */}
                      {i === 0 ? (
                        <p className={`${EYEBROW} max-xl:max-w-none`}>{title}</p>
                      ) : eyebrow ? (
                        <h2 className={eyebrowFull ? `${EYEBROW} max-w-none` : EYEBROW}>{title}</h2>
                      ) : (
                        <h2 className={HEADING}>{title}</h2>
                      )}
                    </div>
                  )}
                  {content && <div data-showcase-body className={REVEAL}>{content}</div>}
                </div>
                {aside && <div data-showcase-body className={`${REVEAL} shrink-0`}>{aside}</div>}
              </div>
            </div>
          </div>
          {title && (
            // Decorative copy of the heading; the real one above is what screen readers get.
            <div
              aria-hidden="true"
              data-showcase-curtain
              className={`${CURTAIN} ${BACKGROUNDS[i % BACKGROUNDS.length]} ${i === 0 ? OVERLAY_FIRST : "h-svh"}`}
            >
              <div className={OVERLAY_SCALE}>
                {/* Every curtain uses the glowing script headline, as on the Introduction. */}
                {/* Wider word gap: the script's swash capitals crowd multi-word titles. */}
                <GlowHeading as="div" text={title} wordGap={0.4} />
              </div>
              <p data-showcase-hint className={CURTAIN_HINT}>
                Press or Scroll Down to navigate
              </p>
            </div>
          )}
        </section>
      ))}
    </AboutShowcase>
  );
}
