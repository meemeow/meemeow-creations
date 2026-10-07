import Image from "next/image";
import Link from "next/link";
import PhotoCarousel from "@/components/about/PhotoCarousel";
import {
  BUTTON_ICON,
  INTRO_ACTIONS,
  INTRO_BUTTON,
  INTRO_NAME,
  INTRO_SLOT_BUTTON,
  INTRO_SUMMARY,
} from "./about-classes";
import { PinIcon } from "./icons";

const INTRO_ROLE =
  "mt-2 font-gotham font-semibold text-gray-200 text-[1.5rem] max-2xl:text-[1.375rem] max-lg:text-[1.25rem] " +
  "upto-639:text-[1.125rem] upto-376:text-[1.0625rem]";
const INTRO_LOCATION =
  "mt-3 flex items-center gap-1.5 font-gotham font-medium text-gray-400 text-[1rem] upto-639:mt-2 upto-639:text-[0.9375rem]";
const PORTRAIT =
  "w-[449px] mx-[90px] max-2xl:w-[388px] max-2xl:mx-[78px] max-lg:w-[337px] max-lg:mx-[67px] " +
  "upto-639:mx-0 upto-639:w-[min(306px,calc(100vw-5rem))]";

export function IntroPortrait() {
  return (
    <PhotoCarousel
      priority
      photos={[
        {
          src: "/assets/images/emerson-portrait.png",
          alt: "Emerson Clamor in FEU Institute of Technology graduation attire",
        },
        { src: "/assets/images/emerson-portrait-2.png", alt: "Emerson Clamor in a cream barong" },
      ]}
      width={685}
      height={1024}
      sizes="(max-width: 639px) 306px, (max-width: 1023px) 337px, (max-width: 1535px) 388px, 449px"
      className={PORTRAIT}
    />
  );
}

export default function Introduction() {
  return (
    <div className="mt-5 upto-639:mt-4">
      <h1 className={INTRO_NAME}>Emerson Clamor</h1>
      <p className={INTRO_ROLE}>Frontend Developer</p>
      <p className={INTRO_LOCATION}>
        <PinIcon />
        Caloocan City, Philippines
      </p>
      <p className={INTRO_SUMMARY}>
        Frontend Developer with experience developing responsive web applications using React, TypeScript, JavaScript,
        Tailwind CSS, Mantine, and Firebase. Experienced in building reusable UI components, integrating backend
        services and APIs, implementing responsive interfaces, and refactoring component architectures for
        maintainability.
      </p>
      <div className={INTRO_ACTIONS}>
        <Link href="/projects" className={INTRO_BUTTON}>
          <Image
            src="/assets/images/mc-crafting-table.png"
            alt=""
            aria-hidden="true"
            width={364}
            height={364}
            className={BUTTON_ICON}
          />
          View Projects
        </Link>
        <a
          href="/assets/files/Clamor_Emerson_Resume_2026.pdf"
          download="Clamor_Emerson_Resume_2026.pdf"
          data-resume="About (top)"
          className={INTRO_SLOT_BUTTON}
        >
          <Image
            src="/assets/images/mc-book-and-quill.png"
            alt=""
            aria-hidden="true"
            width={360}
            height={360}
            className={BUTTON_ICON}
          />
          Download Resume
        </a>
      </div>
    </div>
  );
}
