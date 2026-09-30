import Image from "next/image";
import Link from "next/link";
import {
  BUTTON_ICON,
  INTRO_ACTIONS,
  INTRO_BUTTON,
  INTRO_NAME,
  INTRO_SLOT_BUTTON,
  INTRO_SUMMARY,
} from "./about-classes";
import { EnvelopeIcon } from "./icons";

const ENDING = "mx-auto flex flex-col items-center text-center";
const ENDING_TITLE =
  `${INTRO_NAME} whitespace-nowrap min-[520px]:max-lg:text-[min(2.75rem,calc((100vw-112px)/15.2))]! ` +
  "max-[519px]:whitespace-normal max-[519px]:[text-wrap:balance]";
const ENDING_SUMMARY = `${INTRO_SUMMARY} mx-auto max-w-[640px]!`;
const ENDING_ACTIONS = `${INTRO_ACTIONS} justify-center upto-639:w-full upto-639:max-w-[320px] upto-639:flex-col upto-639:gap-4`;

export default function Ending() {
  return (
    <div className={ENDING}>
      <h2 className={ENDING_TITLE}>This is the end of the page</h2>
      <p className={ENDING_SUMMARY}>
        But not the end of something new. Take a look at what I&apos;ve built, reach out to work together, or keep a
        copy of my resume.
      </p>
      <div className={ENDING_ACTIONS}>
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
        <Link href="/contact" className={INTRO_SLOT_BUTTON}>
          <EnvelopeIcon className={BUTTON_ICON} />
          Get in Touch
        </Link>
        <a
          href="/assets/files/Clamor_Emerson_Resume_2026.pdf"
          download="Clamor_Emerson_Resume_2026.pdf"
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
