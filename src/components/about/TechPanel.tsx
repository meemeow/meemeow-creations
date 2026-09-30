import Image from "next/image";
import type { TechItem } from "@/data/about";
import { CERT_DETAIL, CERT_NAME, OPEN_MARK, SUB_EYEBROW } from "./about-classes";

const TECH_ASIDE = "w-[520px] max-2xl:w-full max-2xl:max-w-[640px]";
const TECH_GRID = "mt-4 grid grid-cols-2 gap-3 upto-639:grid-cols-1";
const TECH_CARD =
  "flex h-full items-center gap-3.5 border-[3px] bg-[#2f2d2c] px-3.5 py-3 font-gotham " +
  "border-t-[#3d3938] border-r-[#3d3938] border-b-[#000000] border-l-[#000000] [box-shadow:0_6px_18px_rgba(0,0,0,0.45)]";
const TECH_TILE =
  "flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-[#1c1b1a] [box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.08)] " +
  "max-lg:h-12 max-lg:w-12";
const TECH_LOGO = "h-8 w-8 max-lg:h-7 max-lg:w-7";
const TECH_TILE_OPEN = "open-slot rounded-none bg-transparent [box-shadow:none] font-pixel text-[0.9rem] text-gray-400";

export default function TechPanel({ label = "Tech Used", items }: { label?: string; items: TechItem[] }) {
  return (
    <div className={TECH_ASIDE}>
      <h4 className={`${SUB_EYEBROW} mt-0!`}>{label}</h4>
      <ul className={TECH_GRID}>
        {items.map((t) => (
          <li key={t.name} className={TECH_CARD}>
            <span className={t.logo ? TECH_TILE : `${TECH_TILE} ${TECH_TILE_OPEN}`}>
              {t.logo ? (
                <Image
                  src={`/assets/images/tech/${t.logo}.svg`}
                  alt=""
                  aria-hidden="true"
                  width={24}
                  height={24}
                  unoptimized
                  className={TECH_LOGO}
                />
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
