import Image from "next/image";
import { JOURNEY } from "@/data/about";

const JOURNEY_LIST =
  "relative mt-8 max-w-[900px] pl-10 upto-639:mt-6 upto-639:pl-8 " +
  "before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-[#1c1a19] " +
  "before:[box-shadow:1px_0_0_#454140] before:content-[''] upto-639:before:left-[7px]";
const JOURNEY_ITEM = "relative pb-10 last:pb-0 max-lg:pb-8 upto-639:pb-7";
const JOURNEY_MARKER =
  "absolute top-[3px] left-[-34px] h-3.5 w-3.5 bg-[#8b8b8b] " +
  "[box-shadow:inset_2px_2px_0_#c6c6c6,inset_-2px_-2px_0_#4f4f4f,0_0_0_2px_#000000] upto-639:left-[-30px]";
const JOURNEY_DIAMOND = "absolute top-[-4px] left-[-38px] h-6 w-auto [image-rendering:pixelated] upto-639:left-[-34px]";
const JOURNEY_DATE =
  "font-pixel text-[0.62rem] uppercase tracking-[0.12em] text-gray-400 [text-shadow:2px_2px_0_rgba(0,0,0,0.75)] upto-420:text-[0.56rem]";
const JOURNEY_TITLE =
  "mt-2.5 font-gotham font-semibold leading-[1.3] text-white text-[1.25rem] max-lg:text-[1.125rem] upto-639:text-[1.0625rem]";
const JOURNEY_TEXT =
  "mt-1.5 font-gotham font-medium leading-[1.65] text-gray-400 text-[1rem] upto-639:text-[0.9375rem]";

export default function Journey() {
  return (
    <ol className={JOURNEY_LIST}>
      {JOURNEY.map((m) => (
        <li key={m.date} className={JOURNEY_ITEM}>
          {m.now ? (
            <Image
              src="/assets/images/mc-diamond.png"
              alt=""
              aria-hidden="true"
              width={120}
              height={130}
              className={JOURNEY_DIAMOND}
            />
          ) : (
            <span aria-hidden="true" className={JOURNEY_MARKER} />
          )}
          <p className={JOURNEY_DATE}>{m.date}</p>
          <h3 className={JOURNEY_TITLE}>{m.title}</h3>
          <p className={JOURNEY_TEXT}>{m.text}</p>
        </li>
      ))}
    </ol>
  );
}
