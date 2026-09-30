"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavKey = "home" | "about" | "projects" | "contact";

const NAV_ITEMS: { key: NavKey; href: string; label: string; hoverColor: string; activeColor: string }[] = [
  {
    key: "home",
    href: "/",
    label: "Home",
    hoverColor: "[&:hover]:text-[#49f9ff]",
    activeColor: "min-[1001px]:text-[#49f9ff]",
  },
  {
    key: "about",
    href: "/about",
    label: "About",
    hoverColor: "[&:hover]:text-[#32CD32]",
    activeColor: "min-[1001px]:text-[#32CD32]",
  },
  {
    key: "projects",
    href: "/projects",
    label: "Projects",
    hoverColor: "[&:hover]:text-[#FF00FF]",
    activeColor: "min-[1001px]:text-[#FF00FF]",
  },
  {
    key: "contact",
    href: "/contact",
    label: "Contact",
    hoverColor: "[&:hover]:text-[#ffff1f]",
    activeColor: "min-[1001px]:text-[#ffff1f]",
  },
];

const VIDEO_POSITION: Record<NavKey, string> = {
  home: "object-[center_13%]",
  about: "object-[center_58%]",
  projects: "object-[center_70%]",
  contact: "object-[center_25%]",
};

const ROUTE_KEYS: { prefix: string; key: NavKey }[] = [
  { prefix: "/about", key: "about" },
  { prefix: "/projects", key: "projects" },
  { prefix: "/contact", key: "contact" },
];

const keyForPath = (path: string | null): NavKey | null =>
  path === "/"
    ? "home"
    : (ROUTE_KEYS.find(({ prefix }) => path === prefix || path?.startsWith(`${prefix}/`))?.key ?? null);

const OPEN_LINK_ANIMATION = [
  "animate-[linkStagger_240ms_ease_35ms_forwards]",
  "mt-0.5 animate-[linkStagger_240ms_ease_75ms_forwards]",
  "mt-0.5 animate-[linkStagger_240ms_ease_115ms_forwards]",
  "mt-0.5 animate-[linkStagger_240ms_ease_155ms_forwards]",
];

export default function Navbar() {
  const pathname = usePathname();
  const routeKey = keyForPath(pathname);
  const currentKey: NavKey | null = routeKey;
  const [open, setOpen] = useState(false);
  const [, setLinkHover] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeHover, setActiveHover] = useState<"home" | "about" | "projects" | "contact" | null>(null);
  const [lastHover, setLastHover] = useState<"home" | "about" | "projects" | "contact" | null>(routeKey);
  const [pinned, setPinned] = useState<NavKey | null>(routeKey);
  const target = activeHover ?? pinned;
  const [active, setActive] = useState<NavKey | null>(routeKey);

  useEffect(() => {
    if (target === active) return;
    if (!target) {
      setActive(null);
      return;
    }
    const t = setTimeout(() => setActive(target), 90);
    return () => clearTimeout(t);
  }, [target, active]);
  const videoRefs = useRef<Partial<Record<NavKey, HTMLVideoElement | null>>>({});

  useEffect(() => {
    setPinned(keyForPath(pathname));
  }, [pathname]);

  useEffect(() => {
    if (active) setLastHover(active);
  }, [active]);

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
    for (const { key } of NAV_ITEMS) {
      const v = videoRefs.current[key];
      if (!v) continue;
      if (key === active) {
        if (v.currentTime > 0.05) v.currentTime = 0;
        if (v.paused) v.play().catch(() => {});
      } else if (!v.paused) {
        v.pause();
      }
    }
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const v = videoRefs.current[active];
    if (!v) return;
    const resume = () => {
      if (document.hidden) return;
      v.play().catch(() => {});
    };
    v.addEventListener("pause", resume);
    v.addEventListener("stalled", resume);
    v.addEventListener("ended", resume);
    return () => {
      v.removeEventListener("pause", resume);
      v.removeEventListener("stalled", resume);
      v.removeEventListener("ended", resume);
    };
  }, [active]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        for (const { key } of NAV_ITEMS) videoRefs.current[key]?.pause();
      } else if (active) {
        videoRefs.current[active]?.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [active]);

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
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [open]);

  return (
    <>
      <header
        className={`relative z-100 flex h-[116px] w-full shrink-0 items-center bg-[#0A0A0A] font-rubber text-white max-2xl:h-[99px] max-lg:h-[81px] ${
          open ? "overflow-visible" : "overflow-hidden"
        }`}
      >
        <div
          className={`pointer-events-none absolute inset-0 z-0 [transition:opacity_200ms_ease] ${
            active ? "opacity-100" : "opacity-0"
          }`}
        >
          {NAV_ITEMS.map(({ key }) => (
            <video
              key={key}
              ref={(el) => {
                videoRefs.current[key] = el;
              }}
              src={`/assets/others/${key}.mp4`}
              className={`absolute top-0 left-0 h-[166px] w-full origin-top object-cover [transform:scaleY(0.6988)] max-2xl:[transform:scaleY(0.5964)] max-lg:[transform:scaleY(0.488)] ${VIDEO_POSITION[key]} ${
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
          className="flex w-full items-center justify-between px-12 max-2xl:px-10 max-lg:px-8"
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
                setPinned(null);
                setActiveHover(null);
              }}
            >
              <Image
                src="/assets/images/logotext.png"
                alt="Meemeow logo"
                className="block h-16 w-[200px] max-w-[200px] flex-[0_0_200px] object-contain max-2xl:h-[54px] max-2xl:w-[170px] max-2xl:max-w-[170px] max-2xl:flex-[0_0_170px] max-lg:h-[45px] max-lg:w-[140px] max-lg:max-w-[140px] max-lg:flex-[0_0_140px] upto-420:hidden"
                width={200}
                height={64}
              />
              <Image
                src="/assets/images/logo%20medium.png"
                alt="Meemeow logo"
                className="hidden h-[45px] w-auto max-w-none shrink-0 ml-[calc((140px_-_45px*1096/366)/2_+_45px*34/366_-_45px*76/385)] upto-420:block"
                width={480}
                height={385}
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
            <span
              className={`my-1 block h-[3px] w-6 origin-center bg-white [transition:transform_300ms_cubic-bezier(.2,.9,.2,1)] ${
                open ? "[transform:translateY(7px)_rotate(45deg)]" : "[transform:none]"
              }`}
            />
            <span
              className={`my-1 block h-[3px] w-6 bg-white [transition:opacity_200ms_ease] ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`my-1 block h-[3px] w-6 origin-center bg-white [transition:transform_300ms_cubic-bezier(.2,.9,.2,1)] ${
                open ? "[transform:translateY(-7px)_rotate(-45deg)]" : "[transform:none]"
              }`}
            />
          </button>

          <nav
            className={`relative z-400 flex items-center gap-14 above-1279:upto-1535:gap-10 min-[1001px]:upto-1279:gap-7 upto-1000:z-201 upto-1000:box-border upto-1000:flex-col ${
              open
                ? "upto-1000:absolute upto-1000:top-[118px] max-lg:top-[83px]! upto-1000:right-8 upto-1000:w-[235px] upto-1000:max-w-[calc(100%-3.5rem)] upto-1000:origin-top-right upto-1000:animate-dropdown-in upto-1000:items-end upto-1000:gap-0.5 upto-1000:rounded-xl upto-1000:bg-[rgba(30,33,36,0.92)] upto-1000:px-4 upto-1000:py-[0.4rem] upto-1000:opacity-0 upto-1000:[box-shadow:0_12px_40px_rgba(8,10,12,0.6)] upto-1000:[transform:translateY(-8px)_scale(0.995)] upto-1000:backdrop-blur-[6px]"
                : "upto-1000:absolute upto-1000:top-[116px] max-lg:top-[81px]! upto-1000:right-0 upto-1000:hidden upto-1000:w-full upto-1000:bg-[#1e2124] upto-1000:p-4"
            }`}
          >
            {NAV_ITEMS.map((item, i) => (
              <Link
                key={item.key}
                href={item.href}
                aria-current={item.key === currentKey ? "page" : undefined}
                className={`relative box-border inline-block w-full origin-right rounded-[4px] py-[0.45rem] pr-[1.2rem] pl-[0.45rem] text-right text-[1.125rem] text-inherit no-underline [transition:color_180ms_ease] above-1279:upto-1535:text-[1rem] min-[1001px]:upto-1279:text-[0.9375rem] ${item.hoverColor} ${item.key === currentKey ? item.activeColor : ""} ${
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
                onClick={() => {
                  setOpen(false);
                  setPinned(item.key);
                }}
              >
                <span
                  className={`relative inline-block after:absolute after:bottom-[-6px] after:left-0 after:h-1 after:w-[0%] after:rounded-[2px] after:bg-transparent after:[transition:width_200ms_ease,background-color_200ms_ease] after:content-[''] [a:hover>&]:after:w-full [a:hover>&]:after:bg-white ${
                    item.key === currentKey ? "min-[1001px]:after:w-full min-[1001px]:after:bg-white" : ""
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
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
    </>
  );
}
