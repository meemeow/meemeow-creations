import Image from "next/image";
import Link from "next/link";
import ProjectRow from "@/components/projects/ProjectRow";
import { EPASIGLIB_STACK } from "@/data/about";
import { projects } from "@/data/projects";
import {
  BUTTON_ICON,
  DEGREE,
  DEGREE_TRACK,
  HIGHLIGHT,
  HIGHLIGHTS,
  INTRO_BUTTON,
  INTRO_SLOT_BUTTON,
  JOB_ROW,
  META_ITEM,
  SCHOOL,
  SCHOOL_META,
  SCHOOL_NAME,
  SUB_EYEBROW,
} from "./about-classes";
import { CalendarIcon, PinIcon } from "./icons";
import TechPanel from "./TechPanel";

const EPASIGLIB = projects.find((p) => p.title === "ePasigLib")!;
const FEATURED_SUMMARY =
  "mx-auto mt-5 max-w-[980px] text-center font-gotham font-medium leading-[1.7] text-gray-300 text-[1.125rem] " +
  "max-2xl:text-[1.0625rem] max-lg:text-[1rem] upto-639:mt-4 upto-639:text-[0.9375rem]";
const FEATURED_PREVIEW = "project-row mt-8 flex justify-center max-lg:mt-7 upto-639:mt-6";
const FEATURED_CARD = "w-full max-w-[960px]";
const ZOMBIE_ICON = "-my-1 -ml-2.5 h-[38px] w-[38px] shrink-0 max-lg:h-9 max-lg:w-9 upto-420:h-8 upto-420:w-8";
const FEATURED_ACTIONS =
  "mx-auto mt-9 grid w-fit grid-cols-2 gap-5 px-[3px] max-2xl:gap-4 max-lg:mt-8 upto-639:mt-7 upto-639:grid-cols-1 upto-639:gap-4";
const FEATURED_ROW = `${JOB_ROW} mt-12 max-2xl:mt-10 upto-639:mt-8`;

export default function FeaturedProject() {
  return (
    <div>
      <p className={FEATURED_SUMMARY}>{EPASIGLIB.desc}.</p>

      <div className={FEATURED_PREVIEW}>
        <ProjectRow p={EPASIGLIB} className={FEATURED_CARD} />
      </div>

      <div className={FEATURED_ACTIONS}>
        <a href={EPASIGLIB.url} target="_blank" rel="noopener noreferrer" className={INTRO_BUTTON}>
          <Image
            src="/assets/images/mc-zombie-chicken.webp"
            alt=""
            aria-hidden="true"
            width={72}
            height={72}
            unoptimized
            className={ZOMBIE_ICON}
          />
          Visit ePasigLib
        </a>
        <Link href="/projects" className={INTRO_SLOT_BUTTON}>
          <Image
            src="/assets/images/mc-crafting-table.png"
            alt=""
            aria-hidden="true"
            width={364}
            height={364}
            className={BUTTON_ICON}
          />
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
  );
}
