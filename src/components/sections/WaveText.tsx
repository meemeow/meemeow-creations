// Per-letter glowing wave used inside the project "Visit Page" buttons.
export default function WaveText({ text }: { text: string }) {
  return (
    <>
      {text.split("").map((ch, i) =>
        ch === " " ? (
          <span key={i} className="inline-block w-[0.42rem]" aria-hidden="true">&nbsp;</span>
        ) : (
          <span
            key={i}
            className="inline-block animate-visit-glow text-inherit will-change-[transform,filter,opacity] [text-shadow:0_0_10px_rgba(255,255,255,0.9),0_0_20px_rgba(255,255,255,0.08)]"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {ch}
          </span>
        )
      )}
    </>
  );
}
