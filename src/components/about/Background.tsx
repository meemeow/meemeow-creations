import Image from "next/image";
import PhotoCarousel from "@/components/about/PhotoCarousel";
import { CERT_GROUPS } from "@/data/about";
import {
  CERT_DETAIL,
  CERT_GROUP_LABEL,
  CERT_NAME,
  DEGREE,
  DEGREE_TRACK,
  META_ITEM,
  SCHOOL,
  SCHOOL_META,
  SCHOOL_NAME,
  SCHOOL_SEAL,
  SUB_EYEBROW,
} from "./about-classes";
import { CalendarIcon, PinIcon } from "./icons";

const CERT_GROUPS_GRID = "mt-4 grid max-w-[640px] grid-cols-2 gap-x-3 gap-y-5 upto-639:grid-cols-1 upto-639:gap-y-4";
const CERT_GROUP_WIDE = "col-span-full";
const CERTS = "grid grid-cols-2 gap-3 upto-639:grid-cols-1";
const CERTS_SINGLE = "grid grid-cols-1 gap-3";
const CERT =
  "flex h-full items-center gap-3.5 border-[3px] bg-[#2f2d2c] px-3.5 py-3 font-gotham no-underline " +
  "border-t-[#3d3938] border-r-[#3d3938] border-b-[#000000] border-l-[#000000] [box-shadow:0_6px_18px_rgba(0,0,0,0.45)] " +
  "[transition:background-color_140ms_ease,transform_100ms_ease] hover:bg-[#3a3735] active:[transform:translateY(2px)] " +
  "focus-visible:[outline:2px_solid_rgba(255,255,160,0.7)] focus-visible:[outline-offset:2px]";
const CERT_BADGE = "h-14 w-14 shrink-0 object-contain max-lg:h-12 max-lg:w-12";
const CERT_TILE = "rounded-md bg-white p-1";
const LANDSCAPE =
  "w-[480px] mx-[96px] max-2xl:w-[440px] max-2xl:mx-[88px] max-lg:w-[380px] max-lg:mx-[76px] " +
  "upto-639:mx-0 upto-639:w-[min(320px,calc(100vw-5rem))]";

export function GraduationCarousel() {
  return (
    <PhotoCarousel
      title="Commencement 2026"
      subtitle="67th Commencement Exercises · PICC, Pasay City"
      photos={[
        {
          src: "/assets/images/feu-grad-1.png",
          alt: "FEU Institute of Technology 2026, 67th Commencement Exercises title screen",
        },
        {
          src: "/assets/images/feu-grad-2.png",
          alt: "Graduates seated at the 67th Commencement Exercises at the PICC, Pasay City",
        },
        { src: "/assets/images/feu-grad-3.png", alt: "FEU Institute of Technology seal on stage, framed by flowers" },
        {
          src: "/assets/images/feu-grad-4.png",
          alt: "Graduation cap resting on an FEU Institute of Technology diploma cover",
        },
        { src: "/assets/images/feu-grad-5.png", alt: "The ceremonial mace at the commencement exercises" },
      ]}
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
  );
}

export default function Background() {
  return (
    <div>
      <div className={SCHOOL}>
        <Image
          src="/assets/images/feu-tech-seal.png"
          alt="FEU Institute of Technology seal"
          width={286}
          height={349}
          className={SCHOOL_SEAL}
        />
        <h3 className={SCHOOL_NAME}>FEU Institute of Technology</h3>
      </div>
      <p className={DEGREE}>
        Bachelor of Science in Information Technology
        <span className={DEGREE_TRACK}>Specialization in Web and Mobile Applications</span>
      </p>
      <p className={SCHOOL_META}>
        <span className={META_ITEM}>
          <PinIcon />
          Manila, Philippines
        </span>
        <span className={META_ITEM}>
          <CalendarIcon />
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
                  <a
                    href={`https://www.credly.com/badges/${c.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={CERT}
                  >
                    <Image
                      src={`/assets/images/badges/${c.img}.png`}
                      alt=""
                      aria-hidden="true"
                      width={112}
                      height={112}
                      className={`${CERT_BADGE} ${c.tile ? CERT_TILE : ""}`}
                    />
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
  );
}
