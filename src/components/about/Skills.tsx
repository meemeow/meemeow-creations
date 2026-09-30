import Image from "next/image";
import { SKILL_GROUPS } from "@/data/about";
import { CERT_DETAIL, CERT_GROUP_LABEL, CERT_NAME } from "./about-classes";

const SKILL_GROUPS_GRID =
  "mt-6 grid w-full grid-cols-2 items-start gap-x-10 gap-y-8 max-lg:grid-cols-1 upto-639:mt-5 upto-639:gap-y-6";
const SKILL_GRID = "grid grid-cols-2 gap-3 upto-420:grid-cols-1";
const SKILL_CARD =
  "flex h-full items-center gap-3 border-[3px] bg-[#2f2d2c] px-3 py-2.5 font-gotham " +
  "border-t-[#3d3938] border-r-[#3d3938] border-b-[#000000] border-l-[#000000] [box-shadow:0_6px_18px_rgba(0,0,0,0.45)]";
const SKILL_TILE =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#1c1b1a] [box-shadow:inset_0_0_0_1px_rgba(255,255,255,0.08)]";
const SKILL_LOGO = "h-6 w-6";
const SKILL_LOGO_LARGE = "h-8 w-8";
const SKILL_LOGO_WIDE = "h-8 w-10";

export default function Skills() {
  return (
    <div className={SKILL_GROUPS_GRID}>
      {SKILL_GROUPS.map((group) => (
        <div key={group.label}>
          <h3 className={CERT_GROUP_LABEL}>{group.label}</h3>
          <ul className={SKILL_GRID}>
            {group.items.map((t) => (
              <li key={t.name} className={SKILL_CARD}>
                <span className={SKILL_TILE}>
                  <Image
                    src={`/assets/images/tech/${t.logo}.svg`}
                    alt=""
                    aria-hidden="true"
                    width={24}
                    height={24}
                    unoptimized
                    className={t.wide ? SKILL_LOGO_WIDE : t.large ? SKILL_LOGO_LARGE : SKILL_LOGO}
                  />
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
  );
}
