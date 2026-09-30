// Script headline whose letters glow in one after another ("Email me directly" on
// the contact page, "Introduction" on the about page). Sizes step down on the
// navbar/footer tiers (2xl, lg, then 639 / 420 / 376px).
const GLOW_HEADING =
  "font-fleur font-semibold leading-[1.1] whitespace-nowrap text-white text-[4.5rem] " +
  "max-2xl:text-[4rem] max-lg:text-[3.5rem] upto-639:text-[2.75rem] upto-420:text-[2.4rem] upto-376:text-[2.1rem]";

// Per-letter glow; each letter's delay is set inline.
const GLOW_LETTER = "inline-block animate-contact-glow will-change-[transform,filter,opacity] [text-shadow:0_0_6px_rgba(255,200,160,0.12)]";
// Word gap in em so it scales with the headline's responsive size. `wordGap` widens it
// for titles whose swash capitals (W, E, T...) reach back into the gap.
const LETTER_SPACE = "inline-block";

export default function GlowHeading({
  text,
  as: Tag = "h2",
  className = "",
  wordGap = 0.1,
}: {
  text: string;
  as?: "h1" | "h2" | "div";
  className?: string;
  wordGap?: number;
}) {
  return (
    // The letters are split into spans for the animation, so the heading carries
    // the text as its label and screen readers don't spell it out.
    <Tag className={`${GLOW_HEADING} ${className}`} aria-label={text}>
      {text.split("").map((ch, i) =>
        ch === " " ? (
          <span key={i} className={LETTER_SPACE} style={{ width: `${wordGap}em` }} aria-hidden="true">&nbsp;</span>
        ) : (
          <span key={i} className={GLOW_LETTER} style={{ animationDelay: `${i * 80}ms` }} aria-hidden="true">
            {ch}
          </span>
        )
      )}
    </Tag>
  );
}
