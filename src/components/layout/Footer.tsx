"use client";

import React, { useRef, useEffect } from "react";

export default function Footer() {
  const disclaimer = "Minecraft is a trademark of Mojang Studios. Any other trademarks are the property of their respective holders.";
  const text = "© 2025 Emerson Clamor. All rights reserved."
  const containerRef = useRef<HTMLDivElement | null>(null);
  const spanRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    spanRefs.current = spanRefs.current.slice(0, text.length);
  }, [text.length]);

  const handleMove = (e: React.PointerEvent) => {
    const maxDist = 120; // radius for strongest effect
    const x = e.clientX;
    const y = e.clientY;

    spanRefs.current.forEach((el, i) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy);
      const n = Math.max(0, 1 - dist / maxDist); // 0..1 proximity
      const scale = 1 + n * 0.45; // upsize up to ~1.45
      const hue = (i * 28 + n * 180) % 360; // per-character rainbow + proximity shift

      el.style.transform = `scale(${scale})`;
      el.style.color = `hsl(${hue}, 90%, 60%)`;
    });
  };

  const handleLeave = () => {
    spanRefs.current.forEach((el) => {
      if (!el) return;
      el.style.transform = "";
      el.style.color = "";
    });
  };

  return (
    <footer className="site-footer">
      <div
        className="site-footer-inner"
        ref={containerRef}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        <div className="footer-main">
          {Array.from(text).map((ch, i) => (
            <span
              key={i}
              ref={(el) => { spanRefs.current[i] = el; }}
              className={ch === " " ? "footer-char footer-space" : "footer-char"}
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </div>
        <div className="footer-disclaimer" role="note" aria-label="Legal disclaimer">{disclaimer}</div>
      </div>
    </footer>
  );
}
