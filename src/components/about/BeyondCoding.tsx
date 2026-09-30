import Image from "next/image";
import { HOBBY_GROUPS, HOBBY_ICONS } from "@/data/about";

const HOBBY_LIST = "mt-5 space-y-14 max-lg:space-y-12 upto-639:mt-4 upto-639:space-y-10";
const HOBBY_HEADING =
  "font-gotham font-semibold leading-[1.3] text-white text-[1.5rem] max-2xl:text-[1.375rem] max-lg:text-[1.25rem] upto-639:text-[1.125rem]";
const HOBBY_NOTE =
  "mt-2 font-gotham font-medium leading-[1.7] text-gray-400 text-[1rem] upto-639:text-[0.9375rem] upto-639:leading-[1.65]";
const HOBBY_CHIPS = "mt-5 flex flex-wrap gap-4 upto-639:mt-4 upto-639:gap-3";
const HOBBY_CHIP =
  "flex items-center gap-3 border-[3px] bg-[#2f2d2c] min-h-[62px] px-5 py-3 font-gotham font-semibold text-white text-[1.0625rem] upto-639:gap-2.5 upto-639:min-h-[50px] upto-639:px-4 upto-639:py-2.5 upto-639:text-[0.9375rem] " +
  "border-t-[#3d3938] border-r-[#3d3938] border-b-[#000000] border-l-[#000000] [box-shadow:0_6px_18px_rgba(0,0,0,0.45)] " +
  "group select-none [transition:background-color_140ms_ease,transform_120ms_ease,box-shadow_120ms_ease] " +
  "hover:bg-[#3a3735] hover:[transform:translateY(-3px)] " +
  "hover:[box-shadow:0_0_0_2px_rgba(255,255,255,0.35),0_10px_22px_rgba(0,0,0,0.55)] " +
  "active:[transform:translateY(2px)] active:[box-shadow:0_0_0_2px_rgba(255,255,255,0.2),0_2px_6px_rgba(0,0,0,0.5)] " +
  "motion-reduce:hover:[transform:none] motion-reduce:active:[transform:none]";
const HOBBY_ICON =
  "h-8 w-8 shrink-0 rounded-[5px] object-contain upto-639:h-6 upto-639:w-6 " +
  "[transition:transform_160ms_ease] group-hover:[transform:scale(1.12)_rotate(-4deg)] motion-reduce:group-hover:[transform:none]";
const HOBBY_ICON_BARE = "p-[3px] upto-639:p-[2px]";
const BARE_ICONS = new Set(["Valorant", "R.E.P.O.", "Stardew Valley", "Terraria"]);
const SPRITE_ICONS = new Set(["Stardew Valley", "Terraria"]);
const HOBBY_ICON_SPRITE = "p-[1.5px] upto-639:p-[1px]";
const TERRARIA_ICON = "-mr-[7px] upto-639:-mr-[5px]";
const FACE_ICON = "h-10! w-10! -my-1 upto-639:h-8! upto-639:w-8!";

export default function BeyondCoding() {
  return (
    <div>
      <div className={HOBBY_LIST}>
        {HOBBY_GROUPS.map((group) => (
          <div key={group.label}>
            <h3 className={HOBBY_HEADING}>{group.label}</h3>
            <p className={HOBBY_NOTE}>{group.note}</p>
            <ul className={HOBBY_CHIPS}>
              {group.items.map((item) => (
                <li key={item} className={HOBBY_CHIP}>
                  {HOBBY_ICONS[item] && (
                    <Image
                      src={`/assets/images/${HOBBY_ICONS[item]}.png`}
                      alt=""
                      aria-hidden="true"
                      width={80}
                      height={80}
                      className={`${HOBBY_ICON} ${SPRITE_ICONS.has(item) ? HOBBY_ICON_SPRITE : BARE_ICONS.has(item) ? HOBBY_ICON_BARE : ""} ${item === "Terraria" ? TERRARIA_ICON : ""} ${HOBBY_ICONS[item].startsWith("anime/") ? FACE_ICON : ""}`}
                    />
                  )}
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
