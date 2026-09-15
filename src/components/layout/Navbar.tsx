"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [linkHover, setLinkHover] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeHover, setActiveHover] = useState<
    "home" | "about" | "projects" | "contact" | null
  >(null);
  const [lastHover, setLastHover] = useState<
    "home" | "about" | "projects" | "contact" | null
  >(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
    const v = videoRef.current;
    if (!v) return;
    if (activeHover) {
      const src = `/assets/others/${activeHover}_hover.mp4`;
      // set source and play
      try {
        v.pause();
      } catch {}
      if (v.getAttribute("src") !== src) v.setAttribute("src", src);
      try {
        v.currentTime = 0;
      } catch {}
      v.load();
      v.play().catch(() => {});
    } else {
      v.pause();
      try {
        v.currentTime = 0;
      } catch {}
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
      <header className={`navbar ${linkHover ? "expanded" : ""} ${open ? "menu-open" : ""}`}>
      <video
        ref={videoRef}
        className={`hover-video ${activeHover ? "visible " : ""}${lastHover ? "hover-" + lastHover : ""}`}
        loop
        muted
        playsInline
        preload="auto"
      />
      <div
        className="navbar-inner"
        onMouseLeave={() => {
          scheduleCollapse();
        }}
      >
        <div className="brand">
          <Link
            href="/"
            className="brand-link"
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
              className="brand-logo"
              width={200}
              height={64}
            />
          </Link>
        </div>

        <button
          className="navbar-burger"
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
            <span className="burger-close" aria-hidden>
              ×
            </span>
          ) : (
            <>
              <span className="burger-line" />
              <span className="burger-line" />
              <span className="burger-line" />
            </>
          )}
        </button>

        <nav className={`navbar-links ${open ? "open" : ""}`}>
          <Link
            href="/"
            className="nav-link home"
            onMouseEnter={() => {
              clearLeaveTimer();
              clearHoverLeaveTimer();
              if (!open) setLinkHover(true);
              setActiveHover("home");
            }}
            onMouseLeave={() => {
              scheduleHoverCollapse();
              if (!open) scheduleCollapse();
            }}
            onClick={() => setOpen(false)}
          >
            <span className="link-text">Home</span>
          </Link>
          <Link
            href="/about"
            className="nav-link about"
            onMouseEnter={() => {
              clearLeaveTimer();
              clearHoverLeaveTimer();
              if (!open) setLinkHover(true);
              setActiveHover("about");
            }}
            onMouseLeave={() => {
              scheduleHoverCollapse();
              if (!open) scheduleCollapse();
            }}
            onClick={() => setOpen(false)}
          >
            <span className="link-text">About</span>
          </Link>
          <Link
            href="/projects"
            className="nav-link projects"
            onMouseEnter={() => {
              clearLeaveTimer();
              clearHoverLeaveTimer();
              if (!open) setLinkHover(true);
              setActiveHover("projects");
            }}
            onMouseLeave={() => {
              scheduleHoverCollapse();
              if (!open) scheduleCollapse();
            }}
            onClick={() => setOpen(false)}
          >
            <span className="link-text">Projects</span>
          </Link>
          <Link
            href="/contact"
            className="nav-link contact"
            onMouseEnter={() => {
              clearLeaveTimer();
              clearHoverLeaveTimer();
              if (!open) setLinkHover(true);
              setActiveHover("contact");
            }}
            onMouseLeave={() => {
              scheduleHoverCollapse();
              if (!open) scheduleCollapse();
            }}
            onClick={() => setOpen(false)}
          >
            <span className="link-text">Contact</span>
          </Link>
        </nav>
        {/* modal overlay behind the dropdown on small screens */}
        {open && (
          <div
            className="nav-overlay"
            onClick={() => {
              setOpen(false);
            }}
          />
        )}
      </div>
    </header>
      {/* spacer keeps page content from being overlapped by fixed navbar and animates with it */}
      <div className={`navbar-spacer ${linkHover ? "expanded" : ""}`} />
    </>
  );
}
