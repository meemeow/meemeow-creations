"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

interface ModalProps {
  message: string;
  onClose: () => void;
  type: "success" | "error";
}

const SHOW_MS = 5000;
const SLIDE_MS = 300;

const TOAST =
  "pointer-events-auto relative flex w-[380px] max-w-[calc(100vw-2rem)] items-center gap-4 border-[3px] bg-[#2f2d2c] py-3.5 pl-4 pr-10 " +
  "border-t-[#3d3938] border-r-[#3d3938] border-b-[#000000] border-l-[#000000] " +
  "[box-shadow:0_0_0_2px_#000000,0_12px_34px_rgba(0,0,0,0.55)] " +
  "[transition:transform_300ms_ease,opacity_300ms_ease] motion-reduce:[transition:opacity_300ms_ease]";
const SLOT =
  "flex h-11 w-11 shrink-0 items-center justify-center bg-[#1e1c1b] [box-shadow:inset_2px_2px_0_#000000,inset_-2px_-2px_0_#4a4644]";
const TITLE =
  "font-pixel text-[0.7rem] uppercase leading-[1.4] tracking-[0.04em] [text-shadow:2px_2px_0_rgba(0,0,0,0.75)]";

const subscribeNoop = () => () => {};

const SetOutcomeModal: React.FC<ModalProps> = ({ message, onClose, type }) => {
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const [visible, setVisible] = useState(false);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true));
    let closeTimer = 0;
    const hideTimer = window.setTimeout(() => {
      setVisible(false);
      closeTimer = window.setTimeout(() => onCloseRef.current(), SLIDE_MS);
    }, SHOW_MS);
    return () => {
      cancelAnimationFrame(show);
      clearTimeout(hideTimer);
      clearTimeout(closeTimer);
    };
  }, []);

  const dismiss = () => {
    setVisible(false);
    window.setTimeout(() => onCloseRef.current(), SLIDE_MS);
  };

  const success = type === "success";

  if (!mounted) return null;
  return createPortal(
    <div
      role={success ? "status" : "alert"}
      aria-live={success ? "polite" : "assertive"}
      className="pointer-events-none fixed top-4 right-4 z-[9999] upto-639:right-1/2 upto-639:translate-x-1/2"
    >
      <div
        className={`${TOAST} ${visible ? "opacity-100 [transform:translateX(0)]" : "opacity-0 [transform:translateX(calc(100%+2rem))] upto-639:[transform:translateY(-150%)]"}`}
      >
        <span className={SLOT} aria-hidden="true">
          {success ? (
            <Image
              src="/assets/images/mc-book-and-quill.png"
              alt=""
              width={360}
              height={360}
              className="h-8 w-8 [image-rendering:pixelated]"
            />
          ) : (
            <svg viewBox="0 0 8 8" shapeRendering="crispEdges" className="h-7 w-7">
              <path d="M0 0h2v1h1v1h2V1h1V0h2v2H7v1H6v2h1v1h1v2H6V7H5V6H3v1H2v1H0V6h1V5h1V3H1V2H0z" fill="#ff5555" />
            </svg>
          )}
        </span>
        <div className="min-w-0">
          <p className={`${TITLE} ${success ? "text-[#ffff55]" : "text-[#ff5555]"}`}>
            {success ? "Message Sent!" : "Message Failed"}
          </p>
          <p className="mt-1 font-gotham text-[0.9375rem] font-medium leading-[1.4] text-white">{message}</p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            dismiss();
          }}
          className="absolute top-1.5 right-2 flex h-7 w-7 cursor-pointer items-center justify-center font-pixel text-[0.7rem] text-gray-400 hover:text-white focus-visible:[outline:2px_solid_rgba(255,255,160,0.7)]"
          aria-label="Close"
        >
          X
        </button>
      </div>
    </div>,
    document.body,
  );
};

export default SetOutcomeModal;
