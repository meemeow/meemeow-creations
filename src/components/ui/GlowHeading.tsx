const GLOW_HEADING =
  "font-fleur font-semibold leading-[1.1] whitespace-nowrap text-white text-[4.5rem] " +
  "max-2xl:text-[4rem] max-lg:text-[3.5rem] upto-639:text-[2.75rem] upto-420:text-[2.4rem] upto-376:text-[2.1rem]";

const GLOW_LETTER =
  "inline-block animate-contact-glow will-change-[transform,filter,opacity] [text-shadow:0_0_6px_rgba(255,200,160,0.12)]";
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
    <Tag className={`${GLOW_HEADING} ${className}`} aria-label={text}>
      {text.split("").map((ch, i) =>
        ch === " " ? (
          <span key={i} className={LETTER_SPACE} style={{ width: `${wordGap}em` }} aria-hidden="true">
            &nbsp;
          </span>
        ) : (
          <span key={i} className={GLOW_LETTER} style={{ animationDelay: `${i * 80}ms` }} aria-hidden="true">
            {ch}
          </span>
        ),
      )}
    </Tag>
  );
}
