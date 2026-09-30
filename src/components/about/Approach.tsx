import { APPROACH_GROUPS } from "@/data/about";
import { HIGHLIGHT } from "./about-classes";

const APPROACH_FOCUS =
  "mt-5 font-gotham font-semibold leading-[1.3] text-white text-[1.5rem] max-2xl:text-[1.375rem] max-lg:text-[1.25rem] " +
  "upto-639:mt-4 upto-639:text-[1.125rem]";
const APPROACH_GRID =
  "mt-12 grid grid-cols-2 gap-x-16 gap-y-16 max-2xl:grid-cols-1 max-2xl:gap-y-14 max-lg:gap-y-12 upto-639:mt-9 upto-639:gap-y-10";
const APPROACH_HEADING =
  "flex items-baseline gap-3 font-gotham font-semibold text-white text-[1.25rem] max-lg:text-[1.125rem]";
const APPROACH_NUMBER = "font-pixel text-[0.7rem] text-gray-500 [text-shadow:2px_2px_0_rgba(0,0,0,0.75)]";
const APPROACH_POINTS = "mt-5 space-y-2 max-2xl:space-y-3 upto-639:space-y-3.5";
const APPROACH_LEAD = "text-gray-100";
const APPROACH_POINT = `${HIGHLIGHT} text-gray-400!`;

export default function Approach() {
  return (
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
  );
}
