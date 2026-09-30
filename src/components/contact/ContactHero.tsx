import Image from "next/image";
import { REVEAL } from "@/lib/reveal";
import { HERO_LINE, HERO_TITLE, MC_PIXEL, MC_SLOT, SLOT_TEXT, WIDE_GRID } from "./contact-classes";
import EmailDirectlyButton from "./EmailDirectlyButton";

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
    <path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 3.09 4.18 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.72c.12.93.37 1.82.73 2.65a2 2 0 0 1-.45 2.11L9.91 9.91a16 16 0 0 0 6 6l1.33-1.33a2 2 0 0 1 2.11-.45c.83.36 1.72.61 2.65.73A2 2 0 0 1 22 16.92z"
      fill="currentColor"
    />
  </svg>
);

const RULE = "h-px flex-1 bg-[#1c1a19] [box-shadow:0_1px_0_#454140]";

export default function ContactHero() {
  return (
    <section className="bg-[#0f0e0d]">
      <div className="max-w-9xl mx-10 px-6 py-20 max-2xl:py-16 max-lg:py-14 upto-768:mx-2 upto-639:px-4 upto-639:py-10 upto-420:px-3 upto-420:py-8">
        <div
          className={`grid w-full grid-cols-1 items-center gap-10 2xl:grid-cols-12 2xl:gap-20 upto-768:gap-8 ${WIDE_GRID}`}
        >
          <div
            data-reveal
            className={`${REVEAL} relative flex min-h-[500px] items-center overflow-hidden px-20 py-12 min-[1135px]:min-h-[clamp(500px,calc(500px+(100vw-1135px)*0.25),600px)] max-lg:min-h-[320px] upto-639:min-h-[260px] upto-420:min-h-[220px] upto-376:min-h-[200px] max-lg:p-8 2xl:order-1 2xl:col-span-8 2xl:min-h-[600px] upto-768:p-6 upto-420:p-5 rounded-lg border-2 border-white/20 bg-white/5`}
          >
            <video
              className="pointer-events-none absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
              src="/assets/others/contacts_bg.mp4"
              autoPlay
              loop
              muted
              playsInline
              aria-hidden="true"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.45)_60%,rgba(0,0,0,0.3)_100%)] upto-768:bg-[rgba(0,0,0,0.55)]"
            />
            <div className="relative w-full text-center md:text-left">
              <h1 className={HERO_TITLE}>From Me to You</h1>
              <p className={HERO_LINE}>Questions, projects, or just to say hi &mdash; my inbox is open.</p>
            </div>
          </div>

          <div
            data-reveal
            style={{ transitionDelay: "120ms" }}
            className={`${REVEAL} mx-auto flex w-full min-w-0 max-w-[660px] flex-col gap-4 2xl:relative 2xl:-top-6 2xl:order-2 2xl:col-span-4 2xl:mr-0 2xl:ml-auto 2xl:max-w-[540px] upto-768:gap-3`}
          >
            <div className="mb-1 flex items-center gap-4">
              <span
                className={`${MC_PIXEL} text-[0.7rem] uppercase tracking-[0.12em] text-white upto-420:text-[0.6rem]`}
              >
                Contact via
              </span>
              <span aria-hidden="true" className={RULE} />
            </div>

            <a href="tel:+639152669845" className={MC_SLOT}>
              <PhoneIcon />
              <span className={SLOT_TEXT}>+63 915-266-9845</span>
            </a>

            <a
              href="https://www.linkedin.com/in/emerson-clamor"
              target="_blank"
              rel="noopener noreferrer"
              className={MC_SLOT}
            >
              <Image
                src="/assets/images/linkedin.png"
                alt=""
                aria-hidden="true"
                width={20}
                height={20}
                className="h-5 w-5 shrink-0 object-contain"
              />
              <span className={SLOT_TEXT}>www.linkedin.com/in/emerson-clamor</span>
            </a>

            <a href="https://github.com/meemeow" target="_blank" rel="noopener noreferrer" className={MC_SLOT}>
              <Image
                src="/assets/images/github.webp"
                alt=""
                aria-hidden="true"
                width={20}
                height={20}
                className="h-5 w-5 shrink-0 rounded-[3px] bg-white p-[2px] object-contain"
              />
              <span className={SLOT_TEXT}>https://github.com/meemeow</span>
            </a>

            <div aria-hidden="true" className="my-3 flex items-center gap-4 upto-768:my-2">
              <span className={RULE} />
              <span
                className={`${MC_PIXEL} text-[0.7rem] uppercase tracking-[0.12em] text-gray-400 upto-420:text-[0.6rem]`}
              >
                or
              </span>
              <span className={RULE} />
            </div>

            <EmailDirectlyButton />
          </div>
        </div>
      </div>
    </section>
  );
}
