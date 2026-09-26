import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import AboutShowcase from "@/components/sections/AboutShowcase";
import GlowHeading from "@/components/sections/GlowHeading";
import PhotoCarousel from "@/components/sections/PhotoCarousel";
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
const CURTAIN =
  "pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-center px-6 text-center " +
  "[transition:transform_800ms_cubic-bezier(.4,0,.2,1),opacity_800ms_ease] " +
  "group-data-[state=settled]/show:[transform:translateY(-30%)] group-data-[state=settled]/show:opacity-0 " +
  "group-data-[state=done]/show:hidden";
// The first curtain sits under the navbar (116 / 99 / 81px on the 2xl / lg tiers).
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
  "mt-6 max-w-[640px] font-gotham font-medium leading-[1.7] text-gray-300 text-[1.0625rem] max-lg:text-[1rem] " +
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
  "border-t-[#3d3938] border-r-[#3d3938] border-b-[#000000] border-l-[#000000] " +
  "[box-shadow:0_6px_18px_rgba(0,0,0,0.45)] [transition:background-color_140ms_ease,color_140ms_ease,transform_100ms_ease] " +
  "hover:bg-[#3a3735] hover:text-white active:[transform:translateY(2px)] " +
  // Hover ring like the stone button's: black outline plus a soft white glow.
  "hover:[box-shadow:0_0_0_2px_#000000,0_0_0_4px_rgba(255,255,255,0.35),0_6px_18px_rgba(0,0,0,0.45)] " +
  "focus-visible:[outline:2px_solid_rgba(255,255,160,0.7)] focus-visible:[outline-offset:2px] " +
  // Compact below 2xl so both buttons (with icons) fit side by side in the narrower column.
  "max-2xl:min-w-0 max-2xl:gap-2 max-2xl:px-4 max-2xl:tracking-[0.04em] " +
  "max-lg:h-11 upto-420:min-w-0 upto-420:text-[0.6rem]";

// Plain body copy for now, taken from the resume; styling to be refined later.
const BODY = "mt-6 max-w-[900px] font-gotham font-medium text-[1.0625rem] leading-[1.6] text-gray-300 max-lg:text-[1rem] upto-639:mt-4 upto-639:text-[0.9375rem]";
const SUBHEADING = "mt-8 font-gotham text-[1.25rem] font-semibold text-white first:mt-0 upto-639:mt-6 upto-639:text-[1.125rem]";
const META = "mt-1 text-gray-400";
const LIST = "mt-3 list-disc space-y-2 pl-5";

// `aside` puts something beside the heading and copy, stacking on top of them below
// `asideFrom`: "lg" (1024px, the default) or "2xl" (1536px, for wide asides that
// would squeeze the copy).
type Section = { title: string | null; content?: ReactNode; aside?: ReactNode; asideFrom?: "lg" | "2xl" };

// Row layouts for a section with an aside (literal strings so Tailwind sees them).
const ASIDE_ROW = {
  lg: "flex items-center gap-16 max-2xl:gap-12 max-lg:flex-col-reverse max-lg:items-start max-lg:gap-8 upto-639:items-center",
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
          <Link href="/contact" className={INTRO_SLOT_BUTTON}>
            <Image src="/assets/images/mc-book-and-quill.png" alt="" aria-hidden="true" width={360} height={360} className={BUTTON_ICON} />
            Get in Touch
          </Link>
        </div>
      </div>
    ),
  },
  {
    title: "Background",
    asideFrom: "2xl",
    aside: (
      <PhotoCarousel
        photos={[
          { src: "/assets/images/feu-grad-1.png", alt: "FEU Institute of Technology 2026, 67th Commencement Exercises title screen" },
          { src: "/assets/images/feu-grad-2.png", alt: "Graduates seated at the 67th Commencement Exercises at the PICC, Pasay City" },
          { src: "/assets/images/feu-grad-3.png", alt: "FEU Institute of Technology seal on stage, framed by flowers" },
          { src: "/assets/images/feu-grad-4.png", alt: "Graduation cap resting on an FEU Institute of Technology diploma cover" },
          { src: "/assets/images/feu-grad-5.png", alt: "The ceremonial mace at the commencement exercises" },
        ]}
        width={2048}
        height={2048}
        aspect="4 / 3"
        fit="fill"
        sizes="(max-width: 639px) 320px, (max-width: 1023px) 380px, (max-width: 1535px) 440px, 480px"
        className={LANDSCAPE}
      />
    ),
    content: (
      <div className={BODY}>
        <h3 className={SUBHEADING}>FEU Institute of Technology · Manila, Philippines</h3>
        <p className="mt-2">Bachelor of Science in Information Technology, Specialization in Web and Mobile Applications</p>
        <p className={META}>August 2022 – September 2026</p>

        <h3 className={SUBHEADING}>Certifications</h3>
        <ul className={LIST}>
          <li>Information Technology Specialist – HTML &amp; CSS · JavaScript · Networking · Python (Certiport, 2024–2025)</li>
          <li>Cisco Certified Support Technician – Cybersecurity (Cisco, 2024)</li>
          <li>PMI Project Management Ready (PMI, 2025)</li>
        </ul>
      </div>
    ),
  },
  {
    title: "What I Do",
    content: (
      <div className={BODY}>
        <h3 className={SUBHEADING}>Frontend Developer Intern · Simplevia Technologies Inc.</h3>
        <p className={META}>Pasig City, Philippines · January 2026 – June 2026 · 1,040 hours</p>
        <ul className={LIST}>
          <li>
            Developed a responsive B2B school management system frontend using React, TypeScript, and Tailwind CSS,
            implementing multi-level navigation and tab-based workflows for complex application interfaces.
          </li>
          <li>
            Refactored the React component architecture across 7 feature modules, reducing component duplication and
            improving maintainability for future feature development.
          </li>
          <li>
            Translated UI/UX designs into reusable, production-ready React components using Mantine and Tailwind CSS,
            maintaining consistent responsive layouts across screen sizes.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Skills & Technologies",
    content: (
      <ul className={`${BODY} space-y-2`}>
        <li><span className="text-white">Frontend:</span> HTML5, CSS3, JavaScript, TypeScript, React, Next.js, React Native, Tailwind CSS, Mantine, Vite</li>
        <li><span className="text-white">Backend &amp; Database:</span> Firebase, Firestore</li>
        <li><span className="text-white">Tools &amp; Design:</span> Git, Figma, Wireframing, UI/UX Design</li>
        <li><span className="text-white">Additional:</span> PHP, Python, Java, Swift, MySQL</li>
      </ul>
    ),
  },
  {
    // Drawn from how the resume describes the work; reword into your own voice.
    title: "My Approach",
    content: (
      <ul className={`${BODY} list-disc space-y-2 pl-5`}>
        <li>Build reusable UI components instead of one-off screens.</li>
        <li>Keep layouts responsive and consistent across screen sizes and browsers.</li>
        <li>Translate UI/UX designs faithfully into production-ready components.</li>
        <li>Refactor component architecture to cut duplication and keep code maintainable for future features.</li>
      </ul>
    ),
  },
  {
    title: "Featured Project",
    content: (
      <div className={BODY}>
        <h3 className={SUBHEADING}>ePasigLib · Pasig Knowledge Center</h3>
        <p className={META}>Full Stack Developer · Capstone Project · December 2024 – September 2026</p>
        <ul className={LIST}>
          <li>
            Developed a full-stack digital library management system for Pasig Knowledge Center, implementing automated
            circulation, cataloging, user management, and real-time asset tracking through barcode and NFC integration.
          </li>
          <li>
            Built responsive frontend interfaces using React, TypeScript, Vite, and Tailwind CSS, developing reusable
            components and cross-browser compatible layouts.
          </li>
          <li>
            Implemented backend services with Firebase Authentication, Firestore, and Cloud Functions to support
            real-time data synchronization and application workflows.
          </li>
        </ul>
        <p className="mt-4">
          <a href="https://meemeow.github.io/ePasigLib_portfolio/" target="_blank" rel="noopener noreferrer" className="text-white underline underline-offset-4">
            Visit ePasigLib
          </a>
          {" · "}
          <Link href="/projects" className="text-white underline underline-offset-4">See all projects</Link>
        </p>
      </div>
    ),
  },
  // The resume has nothing outside work yet; hobbies and interests go here.
  { title: "Beyond Coding" },
  { title: null },
  { title: null },
];

export default function About() {
  return (
    <AboutShowcase>
      {SECTIONS.map(({ title, content, aside, asideFrom = "lg" }, i) => (
        // Titled sections open as a full-screen card with only their heading (see AboutShowcase).
        <section
          key={i}
          aria-label={title ?? undefined}
          data-showcase={title ? "" : undefined}
          data-state={title ? "intro" : undefined}
          className={`group/show relative overflow-hidden ${BACKGROUNDS[i % BACKGROUNDS.length]} ${i > 0 ? "border-t border-white/[0.08]" : ""}`}
        >
          <div className={SECTION_OUTER}>
            <div className={`${SECTION_INNER} ${SHOWCASE_INNER} min-h-[320px] max-lg:min-h-[260px] upto-639:min-h-[200px]`}>
              <div className={aside ? ASIDE_ROW[asideFrom] : ""}>
                <div className="w-full min-w-0 flex-1">
                  {title && (
                    <div data-showcase-body className={REVEAL}>
                      {/* The curtain already shows "Introduction" big, so inside it's only a small
                          label and the name below is the page heading. */}
                      {i === 0 ? <p className={EYEBROW}>{title}</p> : <h2 className={HEADING}>{title}</h2>}
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
              className={`${CURTAIN} ${BACKGROUNDS[i % BACKGROUNDS.length]} ${i === 0 ? OVERLAY_FIRST : "h-svh"}`}
            >
              <div className={OVERLAY_SCALE}>
                {/* Every curtain uses the glowing script headline, as on the Introduction. */}
                <GlowHeading as="div" text={title} />
              </div>
            </div>
          )}
        </section>
      ))}
    </AboutShowcase>
  );
}
