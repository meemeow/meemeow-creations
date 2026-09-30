import Image from "next/image";
import Link from "next/link";
import { OPEN_ROLE_STACK, SIMPLEVIA_STACK } from "@/data/about";
import {
  DEGREE,
  DEGREE_TRACK,
  HIGHLIGHT,
  HIGHLIGHTS,
  JOB_ROW,
  META_ITEM,
  OPEN_MARK,
  SCHOOL,
  SCHOOL_META,
  SCHOOL_NAME,
  SCHOOL_SEAL,
  SUB_EYEBROW,
} from "./about-classes";
import { CalendarIcon, ClockIcon, PinIcon } from "./icons";
import TechPanel from "./TechPanel";

const JOB_DIVIDER =
  "mt-14 mb-9 h-px border-0 bg-[#1c1a19] [box-shadow:0_1px_0_#454140] max-2xl:mt-12 max-2xl:mb-7 upto-639:mt-10 upto-639:mb-6";
const OPEN_LOGO =
  "open-slot flex h-[84px] w-[84px] shrink-0 items-center justify-center bg-white/[0.03] " +
  "font-pixel text-[1.5rem] text-gray-400 max-lg:h-[72px] max-lg:w-[72px] " +
  "upto-639:h-[60px] upto-639:w-[60px] upto-639:text-[1.2rem] upto-420:h-[52px] upto-420:w-[52px]";
const DIAMOND = "ml-[0.3em] inline-block h-[0.85em] w-auto align-[-0.08em] [image-rendering:pixelated]";
const OPEN_LINK = "text-white underline decoration-white/40 underline-offset-4 hover:decoration-white";

export default function WorkExperience() {
  return (
    <div>
      <div className={JOB_ROW}>
        <div className="w-full min-w-0 flex-1">
          <div className={SCHOOL}>
            <span className={OPEN_LOGO} aria-hidden="true">
              <span className={OPEN_MARK}>?</span>
            </span>
            <h3 className={SCHOOL_NAME}>
              Your Company
              <Image
                src="/assets/images/mc-diamond.png"
                alt=""
                aria-hidden="true"
                width={120}
                height={130}
                className={DIAMOND}
              />
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
              Seeking an <span className="text-white">entry-level frontend developer role</span> where I can contribute
              to production features from the start.
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
            <Image
              src="/assets/images/simplevia-tile.png"
              alt="Simplevia Technologies logo"
              width={370}
              height={370}
              className={`${SCHOOL_SEAL} rounded-[14px] [box-shadow:0_6px_18px_rgba(0,0,0,0.45)] max-lg:rounded-xl upto-639:rounded-[10px]`}
            />
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
              Translated UI/UX designs into{" "}
              <span className="text-white">reusable, production-ready React components</span> using Mantine and Tailwind
              CSS, maintaining consistent responsive layouts across screen sizes.
            </li>
            <li className={HIGHLIGHT}>
              Worked <span className="text-white">fully remote</span>, staying in sync with the team online throughout
              the internship.
            </li>
          </ul>
        </div>
        <TechPanel items={SIMPLEVIA_STACK} />
      </div>
    </div>
  );
}
