"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type NavKey = "home" | "about" | "projects" | "contact";

// Hover text color per link, each picked from its own hover video.
const NAV_ITEMS: { key: NavKey; href: string; label: string; hoverColor: string }[] = [
  { key: "home", href: "/", label: "Home", hoverColor: "[&:hover]:text-[#49f9ff]" },
  { key: "about", href: "/about", label: "About", hoverColor: "[&:hover]:text-[#32CD32]" },
  { key: "projects", href: "/projects", label: "Projects", hoverColor: "[&:hover]:text-[#FF00FF]" },
  { key: "contact", href: "/contact", label: "Contact", hoverColor: "[&:hover]:text-[#ffff1f]" },
];

// Vertical framing of each hover video inside the header.
const VIDEO_POSITION: Record<NavKey, string> = {
  home: "object-[center_13%]",
  about: "object-[center_58%]",
  projects: "object-[center_70%]",
  contact: "object-[center_25%]",
};

// Mobile dropdown: links drop in one after another.
const OPEN_LINK_ANIMATION = [
  "animate-[linkStagger_240ms_ease_35ms_forwards]",
  "mt-0.5 animate-[linkStagger_240ms_ease_75ms_forwards]",
  "mt-0.5 animate-[linkStagger_240ms_ease_115ms_forwards]",
  "mt-0.5 animate-[linkStagger_240ms_ease_155ms_forwards]",
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [, setLinkHover] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeHover, setActiveHover] = useState<
    "home" | "about" | "projects" | "contact" | null
  >(null);
  const [lastHover, setLastHover] = useState<
    "home" | "about" | "projects" | "contact" | null
  >(null);
  // One <video> per link, so hovering just rewinds/plays an already-loaded clip
  // instead of swapping `src` + load(), which re-downloaded a ~70MB file and
  // rebuilt the decoder on every hover and could freeze the page.
  const videoRefs = useRef<Partial<Record<NavKey, HTMLVideoElement | null>>>({});

  useEffect(() => {
    if (activeHover) setLastHover(activeHover);
  }, [activeHover]);

  const clearLeaveTimer = () => {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current as unknown as number);
      leaveTimer.current = null;
    }
  };

  const scheduleCollapse = () => {
    clearLeaveTimer();
    leaveTimer.current = setTimeout(() => setLinkHover(false), 140);
  };

  const clearHoverLeaveTimer = () => {
    if (hoverLeaveTimer.current) {
      clearTimeout(hoverLeaveTimer.current as unknown as number);
      hoverLeaveTimer.current = null;
    }
  };

  const scheduleHoverCollapse = () => {
    clearHoverLeaveTimer();
    hoverLeaveTimer.current = setTimeout(() => setActiveHover(null), 140);
  };

  useEffect(() => {
    // play the hovered link's clip from the start and pause the others. They're
    // rewound when hovered next, not here, so fast hovering doesn't seek twice.
    for (const { key } of NAV_ITEMS) {
      const v = videoRefs.current[key];
      if (!v) continue;
      if (key === activeHover) {
        if (v.currentTime !== 0) v.currentTime = 0;
        v.play().catch(() => {});
      } else if (!v.paused) {
        v.pause();
      }
    }
  }, [activeHover]);

  // Close mobile menu automatically when resizing past the mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (open && typeof window !== "undefined" && window.innerWidth > 1100) {
        clearLeaveTimer();
        clearHoverLeaveTimer();
        setOpen(false);
        setLinkHover(false);
        setActiveHover(null);
      }
    };

    window.addEventListener("resize", handleResize);
    // sync state on mount in case initial width is large
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [open]);

  return (
    <>
      <header
        className={`fixed top-0 right-0 left-0 z-100 flex h-[116px] items-center bg-[#0A0A0A] font-rubber text-white ${
          open ? "overflow-visible" : "overflow-hidden"
        }`}
      >
      {/* hover videos: the layer fades in/out; switching links swaps clips instantly.
          Each keeps its 166px framing, squished to fit the 116px header (116 / 166). */}
      <div
        className={`pointer-events-none absolute inset-0 z-0 [transition:opacity_200ms_ease] ${
          activeHover ? "opacity-100" : "opacity-0"
        }`}
      >
        {NAV_ITEMS.map(({ key }) => (
          <video
            key={key}
            ref={(el) => {
              videoRefs.current[key] = el;
            }}
            src={`/assets/others/${key}_hover.mp4`}
            className={`absolute top-0 left-0 h-[166px] w-full origin-top object-cover [transform:scaleY(0.6988)] ${VIDEO_POSITION[key]} ${
              key === lastHover ? "block" : "hidden"
            }`}
            loop
            muted
            playsInline
            preload="none"
          />
        ))}
      </div>
      <div
        className="flex w-full items-center justify-between px-12"
        onMouseLeave={() => {
          scheduleCollapse();
        }}
      >
        <div className="relative z-400 flex flex-[0_0_auto] items-center gap-3">
          <Link
            href="/"
            className="flex flex-[0_0_auto] items-center"
            onMouseEnter={(e) => {
              e.stopPropagation();
              clearLeaveTimer();
              setLinkHover(false);
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
            }}
            onClick={() => {
              setLinkHover(false);
              setOpen(false);
            }}
          >
            <Image
              src="/assets/images/logotext.png"
              alt="Meemeow logo"
              className="block h-16 w-[200px] max-w-[200px] flex-[0_0_200px] object-contain upto-420:hidden"
              width={200}
              height={64}
            />
            {/* icon-only logo for narrow screens (≤420px). The file is the left
                386px of logotext.png, so it's drawn at the same 64px height and
                shifted by the same centering gap the full logo gets inside its
                200px box — the icon doesn't move or resize when they swap. */}
            <Image
              src="/assets/images/logo%20small.png"
              alt="Meemeow logo"
              className="hidden h-16 w-auto ml-[calc((200px_-_64px*1096/366)/2)] upto-420:block"
              width={386}
              height={366}
            />
          </Link>
        </div>

        <button
          className="relative z-401 hidden cursor-pointer border-none bg-none p-1 upto-1000:block"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => {
            setOpen((v) => {
              const newOpen = !v;
              if (newOpen) {
                clearLeaveTimer();
                clearHoverLeaveTimer();
                setLinkHover(false);
                setActiveHover(null);
              }
              return newOpen;
            });
          }}
          onMouseEnter={(e) => {
            e.stopPropagation();
            clearLeaveTimer();
            clearHoverLeaveTimer();
            setLinkHover(false);
          }}
          onMouseLeave={(e) => {
            e.stopPropagation();
          }}
        >
          {open ? (
            <span
              className="z-401 inline-block cursor-pointer text-[1.6rem] leading-none font-bold text-white select-none [transform:translateY(-1px)]"
              aria-hidden
            >
              ×
            </span>
          ) : (
            <>
              <span className="my-1 block h-[3px] w-6 bg-white" />
              <span className="my-1 block h-[3px] w-6 bg-white" />
              <span className="my-1 block h-[3px] w-6 bg-white" />
            </>
          )}
        </button>

        <nav
          className={`relative z-400 flex items-center gap-14 above-1279:upto-1535:gap-10 min-[1001px]:upto-1279:gap-7 upto-1000:z-201 upto-1000:box-border upto-1000:flex-col ${
            open
              ? // mobile dropdown panel
                "upto-1000:fixed upto-1000:top-[118px] upto-1000:right-8 upto-1000:w-[235px] upto-1000:max-w-[calc(100%-3.5rem)] upto-1000:origin-top-right upto-1000:animate-dropdown-in upto-1000:items-end upto-1000:gap-0.5 upto-1000:rounded-xl upto-1000:bg-[rgba(30,33,36,0.92)] upto-1000:px-4 upto-1000:py-[0.4rem] upto-1000:opacity-0 upto-1000:[box-shadow:0_12px_40px_rgba(8,10,12,0.6)] upto-1000:[transform:translateY(-8px)_scale(0.995)] upto-1000:backdrop-blur-[6px]"
              : "upto-1000:absolute upto-1000:top-[116px] upto-1000:right-0 upto-1000:hidden upto-1000:w-full upto-1000:bg-[#1e2124] upto-1000:p-4"
          }`}
        >
          {NAV_ITEMS.map((item, i) => (
            <Link
              key={item.key}
              href={item.href}
              className={`relative box-border inline-block w-full origin-right rounded-[4px] py-[0.45rem] pr-[1.2rem] pl-[0.45rem] text-right text-[1.125rem] text-inherit no-underline [transition:color_180ms_ease] above-1279:upto-1535:text-[1rem] min-[1001px]:upto-1279:text-[0.9375rem] ${item.hoverColor} ${
                open ? `opacity-0 [transform:translateY(-6px)_scale(0.995)] ${OPEN_LINK_ANIMATION[i]}` : ""
              }`}
              onMouseEnter={() => {
                clearLeaveTimer();
                clearHoverLeaveTimer();
                if (!open) setLinkHover(true);
                setActiveHover(item.key);
              }}
              onMouseLeave={() => {
                scheduleHoverCollapse();
                if (!open) scheduleCollapse();
              }}
              onClick={() => setOpen(false)}
            >
              {/* white underline grows in under the text on hover */}
              <span className="relative inline-block after:absolute after:bottom-[-6px] after:left-0 after:h-1 after:w-[0%] after:rounded-[2px] after:bg-transparent after:[transition:width_200ms_ease,background-color_200ms_ease] after:content-[''] [a:hover>&]:after:w-full [a:hover>&]:after:bg-white">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
        {/* modal overlay behind the dropdown on small screens */}
        {open && (
          <div
            className="pointer-events-auto fixed inset-0 z-200 bg-transparent"
            onClick={() => {
              setOpen(false);
            }}
          />
        )}
      </div>
    </header>
      {/* spacer keeps page content from being overlapped by the fixed navbar */}
      <div className="block h-[116px] w-full shrink-0" />
    </>
  );
}
