// Everything is sized in vw so the composition keeps the same framing at any zoom level.
// Shared look of each caution tape strip; ≤420px the tape gets thicker with wider stripes.
const TAPE =
  "pointer-events-none absolute z-5 h-[2.95vw] rounded-[0.32vw] opacity-[0.98] " +
  "[background:repeating-linear-gradient(45deg,#ffde59_0_0.95vw,rgba(0,0,0,0)_0.95vw_1.9vw)] " +
  "[box-shadow:0_0.32vw_0.95vw_rgba(0,0,0,0.45)] " +
  "upto-420:h-[8vw] upto-420:w-[120vw] upto-420:right-[-10vw] " +
  "upto-420:[background:repeating-linear-gradient(45deg,#ffde59_0_2.6vw,rgba(0,0,0,0)_2.6vw_5.2vw)]";

export default function UnderConstruction() {
  return (
    <main className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-gradient-to-b from-[#0f1112] to-[#191b1d] px-4 text-white">
      <div className="absolute inset-0 flex items-center justify-center px-[0.85vw] py-[2.1vw]">
        <div
          className={`${TAPE} top-[-2.3vw] right-[-17vw] w-[60vw] [transform:rotate(-127deg)] upto-420:top-[-30vw] upto-420:left-[-20vw] upto-420:[transform:rotate(-30deg)]`}
          aria-hidden="true"
        ></div>
        <div
          className={`${TAPE} top-[1.9vw] right-[-6vw] w-[60vw] [transform:rotate(24deg)] upto-420:left-[-10vw]`}
          aria-hidden="true"
        ></div>
        <div
          className={`${TAPE} bottom-[4.4vw] left-[-22vw] w-[60vw] [transform:rotate(58deg)] upto-420:left-[-10vw] upto-420:[transform:rotate(148deg)]`}
          aria-hidden="true"
        ></div>
        <div
          className={`${TAPE} bottom-[1vw] left-[-6vw] w-[60vw] [transform:rotate(19deg)] upto-420:left-[-10vw]`}
          aria-hidden="true"
        ></div>
        <div className="relative z-20 mx-auto flex max-w-3xl flex-col items-center justify-center gap-[max(0.5rem,0.42vw)] sm:flex-row upto-420:gap-2">
          <img
            src="/assets/images/cat_construction.png"
            alt="Construction cat"
            className="h-[max(4.5rem,5.9vw)] w-[max(4.5rem,5.9vw)] animate-pulse-float object-contain drop-shadow-lg [text-shadow:0_6px_18px_rgba(255,206,0,0.12),0_0_10px_rgba(255,206,0,0.06)] upto-420:h-[72px] upto-420:w-[72px]"
          />

          <div className="ml-2 flex flex-col items-center justify-center text-center">
            <p className="animate-pulse-float font-rye text-[max(1.15rem,1.26vw)] leading-[1.3] whitespace-nowrap [text-shadow:0_6px_18px_rgba(255,206,0,0.12),0_0_10px_rgba(255,206,0,0.06)] upto-420:text-[1rem] upto-420:leading-[1.1] upto-420:whitespace-normal">
              Page under construction...
            </p>
            <p className="animate-pulse-float font-rye text-[max(1rem,1.05vw)] leading-[1.3] whitespace-nowrap [text-shadow:0_6px_18px_rgba(255,206,0,0.12),0_0_10px_rgba(255,206,0,0.06)] upto-420:text-[1rem] upto-420:leading-[1.1] upto-420:whitespace-normal">
              Try another page for now!
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
