"use client";

import React, { useRef, useState } from "react";
import SetOutcomeModal from "@/components/ui/SetOutcomeModal";
import { REVEAL, useScrollReveal } from "@/hooks/use-scroll-reveal";
import { ZodError } from "zod";
import {
    firstNameSchema,
    lastNameSchema,
    emailSchema,
    messageSchema,
    contactSchema,
    ContactForm,
} from "@/lib/contact-validation";

/* ---------- Minecraft panel chrome ----------
   Mirrors the containers on minecraft.net: flat dark fill, a beveled 2px edge and
   square corners — no rounding, no blur, no glow. */
const MC_PANEL =
    "border-[3px] bg-[#2f2d2c] " +
    // Beveled edge, as in the game UI: lit grey on top/right, black on bottom/left.
    "border-t-[#3d3938] border-r-[#3d3938] border-b-[#000000] border-l-[#000000] " +
    "[box-shadow:0_12px_34px_rgba(0,0,0,0.55)]";

// Sunken dark field with a light edge; the edge brightens on hover and goes white on focus.
const FIELD =
    "border-2 border-[#4f4f4f] bg-[var(--mc-field)] px-3 py-[0.45rem] font-gotham font-medium text-white " +
    "placeholder:font-gotham placeholder:font-medium placeholder:text-[#6f6f6f] " +
    "[box-shadow:inset_0_2px_0_rgba(0,0,0,0.45)] [transition:border-color_120ms_ease,background-color_120ms_ease] " +
    "hover:border-[#6e6e6e] focus:border-white focus:bg-[#232323] focus:[outline:none] " +
    // Text stays at 16px on phones (smaller makes iOS zoom in on focus); only the padding tightens.
    "w-full text-[1rem] upto-639:px-2.5 upto-639:py-[0.4rem] upto-420:py-[0.35rem]";

const LABEL =
    "mb-1.5 font-gotham text-[0.875rem] font-medium tracking-wide text-white " +
    "upto-639:mb-1 upto-639:text-[0.8125rem] upto-420:text-[0.78rem]";

// Pixel type with Minecraft's hard offset drop shadow.
const MC_PIXEL = "font-pixel [text-shadow:2px_2px_0_rgba(0,0,0,0.75)]";

// Green "submit" button: lit top edge, shaded bottom edge, presses down on click.
const MC_BUTTON =
    "group inline-flex cursor-pointer items-center gap-3 border-2 border-[var(--mc-green-dark)] " +
    "bg-[linear-gradient(180deg,var(--mc-green-lit)_0%,var(--mc-green)_48%,#4a942f_100%)] px-6 py-[0.65rem] " +
    MC_PIXEL + " text-[0.72rem] uppercase text-white " +
    "[box-shadow:inset_0_2px_0_rgba(255,255,255,0.28),inset_0_-3px_0_rgba(0,0,0,0.28),0_0_0_2px_var(--mc-panel-dark)] " +
    "[transition:filter_120ms_ease,transform_80ms_ease] hover:brightness-110 active:[transform:translateY(2px)] " +
    "disabled:cursor-not-allowed disabled:[filter:grayscale(0.55)_brightness(0.8)] " +
    "max-lg:text-[0.68rem] upto-639:w-full upto-639:justify-center upto-639:px-4 upto-639:py-[0.6rem] upto-639:text-[0.62rem] " +
    "upto-420:py-[0.55rem] upto-420:text-[0.58rem]";

const ERROR_TEXT = "mt-1 font-gotham text-[0.875rem] text-[var(--mc-red)] upto-639:text-[0.78rem]";

// Stone face from the back-to-top button (ScrollToTop.tsx), widened so the label
// sits inside it next to the arrow; the button spans half the contact slots' width.
const STONE_FACE =
    "relative flex h-12 w-full shrink-0 items-center justify-center gap-4 bg-[#8b8b8b] px-4 text-white [image-rendering:pixelated] " +
    "[box-shadow:inset_3px_3px_0_0_#c6c6c6,inset_-3px_-3px_0_0_#4f4f4f,0_0_0_3px_#000000,0_5px_0_3px_rgba(0,0,0,0.35)] " +
    "[transition:background-color_100ms_steps(2),box-shadow_100ms_steps(2),transform_100ms_steps(2)] " +
    "group-hover:bg-[#a4a4a4] " +
    "group-hover:[box-shadow:inset_3px_3px_0_0_#dcdcdc,inset_-3px_-3px_0_0_#5f5f5f,0_0_0_3px_#000000,0_0_0_5px_rgba(255,255,255,0.35),0_5px_0_3px_rgba(0,0,0,0.35)] " +
    "group-active:[transform:translateY(4px)] " +
    "group-active:[box-shadow:inset_3px_3px_0_0_#4f4f4f,inset_-3px_-3px_0_0_#c6c6c6,0_0_0_3px_#000000,0_1px_0_3px_rgba(0,0,0,0.35)] " +
    "group-focus-visible:[box-shadow:inset_3px_3px_0_0_#dcdcdc,inset_-3px_-3px_0_0_#5f5f5f,0_0_0_3px_#000000,0_0_0_6px_rgba(255,255,160,0.7),0_5px_0_3px_rgba(0,0,0,0.35)] " +
    "max-lg:h-11 upto-639:gap-3 upto-639:px-5";

// The back-to-top arrow's 9x9 sprite, mirrored vertically so it points down.
const ARROW_DOWN_ROWS: [x: number, y: number, w: number][] = [
    [4, 8, 1],
    [3, 7, 3],
    [2, 6, 5],
    [1, 5, 7],
    [0, 4, 9],
    [3, 3, 3],
    [3, 2, 3],
    [3, 1, 3],
    [3, 0, 3],
];

// One contact per slot: same bevel as the form panel, lit on hover.
// Always one line: the section stacks below 2xl so the slots get the full width,
// and the text steps down on the footer's phone tiers so the longest link still fits.
const MC_SLOT =
    "flex items-center gap-4 overflow-hidden border-[3px] bg-[#2f2d2c] px-5 py-4 font-gotham font-medium text-gray-200 " +
    "border-t-[#3d3938] border-r-[#3d3938] border-b-[#000000] border-l-[#000000] " +
    "[box-shadow:0_6px_18px_rgba(0,0,0,0.45)] [transition:background-color_140ms_ease,color_140ms_ease,transform_100ms_ease] " +
    "hover:bg-[#3a3735] hover:text-white active:[transform:translateY(2px)] " +
    "text-[1.05rem] whitespace-nowrap upto-639:gap-3 upto-639:px-4 upto-639:py-3 upto-639:text-[0.9rem] " +
    "upto-420:text-[0.85rem] upto-376:px-3 upto-376:text-[clamp(0.625rem,calc(5.2vw-0.33rem),0.8rem)]";

// Link text inside a slot; ellipsis is only a last resort on unusually narrow screens.
const SLOT_TEXT = "min-w-0 truncate";

// Per-letter glow for "Email me directly" and "Send Message"; each letter's delay is set inline.
const GLOW_LETTER = "inline-block animate-contact-glow will-change-[transform,filter,opacity] [text-shadow:0_0_6px_rgba(255,200,160,0.12)]";
// Word gap in em so it scales with the headline's responsive size.
const LETTER_SPACE = "inline-block w-[0.1em]";

// Both sections' grids stop growing from 1920px and center (mx-auto), so ultra-wide
// screens get breathing space on both sides. Never narrower than the 1920px layout
// (1920 - 2 x 64px gutters = 1792px); past ~2370px the side space grows at ~25vw - 304px.
const WIDE_GRID = "min-[1920px]:mx-auto min-[1920px]:max-w-[max(1792px,calc(50vw+608px))]";

// Hero heading + line step down on the navbar/footer tiers (back to the original 5rem
// heading from 1920px, where the box is wide enough for it). The heading never wraps,
// so each step keeps it to roughly 60–70% of the box's inner width. Below 640px the box is
// about (100vw - 100px) wide inside and the heading is ~8.6em long, so it scales with the
// viewport there (~80% of the box, capped at 2.5rem) and stays on one line down to ~300px.
const HERO_TITLE =
    "mb-3 text-[4rem] leading-[1.05] font-extrabold whitespace-nowrap min-[1920px]:text-[5rem] min-[1920px]:leading-[1.02] max-2xl:text-[3.75rem] max-lg:text-[3.25rem] " +
    "upto-768:mx-auto upto-768:text-center upto-768:text-[2.75rem] upto-639:mb-2 upto-639:text-[clamp(1.2rem,calc(9.6vw-0.5rem),2.5rem)]";
const HERO_LINE =
    "text-[1.25rem] text-gray-200 max-2xl:text-[1.125rem] max-lg:text-[1.0625rem] upto-768:mx-auto upto-768:text-center " +
    "upto-639:text-[1rem] upto-639:text-balance upto-420:text-[0.9375rem] upto-376:text-[0.875rem]";

export default function Contact() {
    const [formData, setFormData] = useState<ContactForm>({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const [loading, setLoading] = useState(false);
    const [outcome, setOutcome] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const validateField = (name: string, value: string) => {
        try {
            if (name === "firstName") firstNameSchema.parse(value);
            if (name === "lastName") lastNameSchema.parse(value);
            if (name === "email") emailSchema.parse(value);
            if (name === "message") messageSchema.parse(value);
            setErrors((e) => {
                const next = { ...e };
                delete next[name];
                return next;
            });
        } catch (err) {
            const zErr = err as ZodError;
            setErrors((e) => ({ ...e, [name]: zErr.issues?.[0]?.message || "Invalid" }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((f) => ({ ...f, [name]: value }));
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        validateField(name, value);
    };

    // Same scroll pop-in as the projects page, once per tab.
    const mainRef = useRef<HTMLElement | null>(null);
    useScrollReveal(mainRef, "__contactAnimated");

    const toForm = () => {
        // Honour a reduced-motion preference by jumping instead of gliding.
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        document.getElementById("email-form")?.scrollIntoView({
            behavior: reduced ? "auto" : "smooth",
            block: "center",
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const result = contactSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            for (const issue of result.error.issues) {
                const path = issue.path[0] as string;
                fieldErrors[path] = issue.message;
            }
            setErrors(fieldErrors);
            return;
        }

        setErrors({});
        setLoading(true);
        setOutcome(null);

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result.data),
            });

            if (!res.ok) {
                const json = await res.json().catch(() => ({}));
                throw new Error(json?.error || 'Send failed');
            }

            setFormData({ firstName: '', lastName: '', email: '', message: '' });
            setOutcome({ type: 'success', message: 'Message sent — thank you!' });
        } catch (err) {
            const error = err as Error;
            console.error(error);
            setErrors((e) => {
                const next = { ...e };
                delete next._submit;
                return next;
            });
            setOutcome({ type: 'error', message: error.message || 'Send failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main ref={mainRef} className="min-h-screen bg-[#171615] text-white">
            {/* Section 1 — intro on the left, contact slots on the right */}
            <section className="bg-[#0f0e0d]">
                {/* Same gutters as section 2. Side by side only from 2xl (1536px): below
                    that the contacts column is too narrow to keep each link on one line. */}
                <div className="max-w-9xl mx-10 px-6 py-20 max-2xl:py-16 max-lg:py-14 upto-768:mx-2 upto-639:px-4 upto-639:py-10 upto-420:px-3 upto-420:py-8">
                    <div className={`grid w-full grid-cols-1 items-center gap-10 2xl:grid-cols-12 2xl:gap-20 upto-768:gap-8 ${WIDE_GRID}`}>
                        {/* Intro card over the contacts_bg clip. Stacked, it holds 500px up to 1135px, then
                            grows with the viewport to meet the 600px side-by-side height at 1536px. */}
                        <div data-reveal className={`${REVEAL} relative flex min-h-[500px] items-center overflow-hidden px-20 py-12 min-[1135px]:min-h-[clamp(500px,calc(500px+(100vw-1135px)*0.25),600px)] max-lg:min-h-[320px] upto-639:min-h-[260px] upto-420:min-h-[220px] upto-376:min-h-[200px] max-lg:p-8 2xl:order-1 2xl:col-span-8 2xl:min-h-[600px] upto-768:p-6 upto-420:p-5 rounded-lg border-2 border-white/20 bg-white/5`}>
                            <video
                                className="pointer-events-none absolute inset-0 h-full w-full object-cover motion-reduce:hidden"
                                src="/assets/others/contacts_bg.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                aria-hidden="true"
                            />
                            {/* Darkens the clip, most behind the text, so the heading stays readable. */}
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.45)_60%,rgba(0,0,0,0.3)_100%)] upto-768:bg-[rgba(0,0,0,0.55)]"
                            />
                            <div className="relative w-full text-center md:text-left">
                                <h1 className={HERO_TITLE}>
                                    From Me to You
                                </h1>
                                <p className={HERO_LINE}>
                                    Questions, projects, or just to say hi &mdash; my inbox is open.
                                </p>
                            </div>
                        </div>

                        {/* Contacts stay unboxed: right-aligned on the remaining 4 columns from 2xl,
                            centered and capped below the box when stacked */}
                        {/* Raised with `top` (not transform) so it doesn't fight the pop-in's transform; trails the box slightly. */}
                        <div data-reveal style={{ transitionDelay: "120ms" }} className={`${REVEAL} mx-auto flex w-full min-w-0 max-w-[660px] flex-col gap-4 2xl:relative 2xl:-top-6 2xl:order-2 2xl:col-span-4 2xl:mr-0 2xl:ml-auto 2xl:max-w-[540px] upto-768:gap-3`}>
                            {/* Pixel label with a rule running out to the edge */}
                            <div className="mb-1 flex items-center gap-4">
                                <span className={`${MC_PIXEL} text-[0.7rem] uppercase tracking-[0.12em] text-white upto-420:text-[0.6rem]`}>
                                    Contact via
                                </span>
                                <span aria-hidden="true" className="h-px flex-1 bg-[#1c1a19] [box-shadow:0_1px_0_#454140]" />
                            </div>

                            <a href="tel:+639152669845" className={MC_SLOT}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
                                    <path
                                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 3.09 4.18 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.72c.12.93.37 1.82.73 2.65a2 2 0 0 1-.45 2.11L9.91 9.91a16 16 0 0 0 6 6l1.33-1.33a2 2 0 0 1 2.11-.45c.83.36 1.72.61 2.65.73A2 2 0 0 1 22 16.92z"
                                        fill="currentColor"
                                    />
                                </svg>
                                <span className={SLOT_TEXT}>+63 9152669845</span>
                            </a>

                            <a href="https://www.linkedin.com/in/emerson-clamor" target="_blank" rel="noopener noreferrer" className={MC_SLOT}>
                                <img src="/assets/images/linkedin.png" alt="" aria-hidden="true" className="h-5 w-5 shrink-0 object-contain" />
                                <span className={SLOT_TEXT}>www.linkedin.com/in/emerson-clamor</span>
                            </a>

                            <a href="https://github.com/meemeow" target="_blank" rel="noopener noreferrer" className={MC_SLOT}>
                                <img src="/assets/images/github.webp" alt="" aria-hidden="true" className="h-5 w-5 shrink-0 object-contain" />
                                <span className={SLOT_TEXT}>https://github.com/meemeow</span>
                            </a>

                            {/* "OR" divider: the "Contact via" rule, run out on both sides */}
                            <div aria-hidden="true" className="my-3 flex items-center gap-4 upto-768:my-2">
                                <span className="h-px flex-1 bg-[#1c1a19] [box-shadow:0_1px_0_#454140]" />
                                <span className={`${MC_PIXEL} text-[0.7rem] uppercase tracking-[0.12em] text-gray-400 upto-420:text-[0.6rem]`}>
                                    or
                                </span>
                                <span className="h-px flex-1 bg-[#1c1a19] [box-shadow:0_1px_0_#454140]" />
                            </div>

                            {/* Same stone button as back-to-top, pointing down at the form */}
                            <button
                                type="button"
                                onClick={toForm}
                                className="group w-1/2 min-w-fit cursor-pointer self-center [outline:none]"
                            >
                                <span className={STONE_FACE}>
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 9 9"
                                        shapeRendering="crispEdges"
                                        aria-hidden="true"
                                        className="-ml-1 -translate-x-1.5 shrink-0 upto-639:ml-0 upto-639:translate-x-0 animate-arrow-bounce-down will-change-transform motion-reduce:animate-none"
                                    >
                                        {/* dark drop shadow one pixel down-right, the way in-game glyphs are drawn */}
                                        <g fill="#3f3f3f">
                                            {ARROW_DOWN_ROWS.map(([x, y, w]) => (
                                                <rect key={`s${y}`} x={x + 1} y={y + 1} width={w} height={1} />
                                            ))}
                                        </g>
                                        <g fill="#ffffff">
                                            {ARROW_DOWN_ROWS.map(([x, y, w]) => (
                                                <rect key={y} x={x} y={y} width={w} height={1} />
                                            ))}
                                        </g>
                                    </svg>
                                    {/* same one-pixel dark shadow as the arrow glyph */}
                                    <span className="-translate-x-0.5 upto-639:translate-x-0 font-pixel text-[0.68rem] uppercase tracking-[0.08em] text-white [text-shadow:2px_2px_0_#3f3f3f] upto-420:text-[0.6rem]">
                                        email directly
                                    </span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2 — email pitch + form, on the darker band */}
            <section id="email-form" className="border-t border-white/[0.08] bg-[#171615]">
                {/* Spacing steps down on the navbar/footer tiers: 2xl, lg, then 639 / 420px. */}
                <div className="max-w-9xl mx-10 px-6 py-18 max-2xl:py-16 max-lg:py-12 upto-768:mx-2 upto-639:px-4 upto-639:py-10 upto-420:px-3 upto-420:py-8">
                    {/* Contact form + callout: pop in together as one block */}
                    <div data-reveal className={`${REVEAL} grid grid-cols-1 lg:grid-cols-2 gap-8 items-center upto-639:gap-6 ${WIDE_GRID}`}>
                        {/* Wider-looking form without moving grid */}
                        <div className="flex justify-end order-2 lg:order-2">
                            {/* Minecraft-style container: flat panel, hard edges, pixel headline.
                                From 1920px it sits flush right, lining up with section 1's contacts. */}
                            <div className={`mx-auto w-full min-[1920px]:mr-0 max-w-[680px] p-8 max-2xl:p-7 max-lg:max-w-[640px] max-lg:p-6 upto-639:p-5 upto-420:p-4 upto-376:p-3.5 ${MC_PANEL}`}>
                                <h2 className={`${MC_PIXEL} mb-6 text-[1.45rem] leading-[1.35] text-white max-2xl:text-[1.3rem] max-lg:mb-5 max-lg:text-[1.15rem] upto-639:mb-4 upto-639:text-[1rem] upto-420:text-[0.875rem] upto-376:text-[0.8rem]`}>
                                    SEND A MESSAGE!
                                </h2>

                                <form className="space-y-3" onSubmit={handleSubmit} noValidate>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 upto-639:gap-3">
                                        <label className="flex flex-col">
                                            <span className={LABEL}>First Name <span className="text-[var(--mc-red)]">*</span></span>
                                            <input
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                required
                                                className={FIELD}
                                                placeholder="First name"
                                            />
                                            {errors.firstName && <p className={ERROR_TEXT}>{errors.firstName}</p>}
                                        </label>

                                        <label className="flex flex-col">
                                            <span className={LABEL}>Last Name <span className="text-[var(--mc-red)]">*</span></span>
                                            <input
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                required
                                                className={FIELD}
                                                placeholder="Last name"
                                            />
                                            {errors.lastName && <p className={ERROR_TEXT}>{errors.lastName}</p>}
                                        </label>
                                    </div>

                                    <label className="flex flex-col">
                                        <span className={LABEL}>Email <span className="text-[var(--mc-red)]">*</span></span>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            required
                                            className={FIELD}
                                            placeholder="you@example.com"
                                        />
                                        {errors.email && <p className={ERROR_TEXT}>{errors.email}</p>}
                                    </label>

                                    <label className="flex flex-col">
                                        <span className={LABEL}>Message <span className="text-[var(--mc-red)]">*</span></span>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            required
                                            rows={4}
                                            className={`${FIELD} h-[128px] min-h-[72px] resize-y max-lg:h-[112px] upto-639:h-[96px] upto-420:h-[84px]`}
                                            placeholder="Write your message..."
                                        />
                                        {errors.message && <p className={ERROR_TEXT}>{errors.message}</p>}
                                    </label>

                                    <div className="flex items-center justify-between gap-4 pt-1 upto-639:flex-col upto-639:items-stretch upto-639:gap-3">
                                        <p className={`${MC_PIXEL} text-[0.6rem] leading-[1.6] text-[var(--mc-text-dim)] upto-639:text-right upto-420:text-[0.55rem]`}>
                                            <span className="text-[var(--mc-red)]">*</span> Required Fields
                                        </p>
                                        <button type="submit" className={MC_BUTTON} disabled={loading}>
                                            <span>{loading ? "Sending…" : "Send Message"}</span>
                                            {/* nudges sideways while the button is hovered */}
                                            <span
                                                aria-hidden="true"
                                                className="inline-block will-change-transform group-hover:animate-arrow-nudge motion-reduce:animate-none"
                                            >
                                                &gt;
                                            </span>
                                        </button>
                                    </div>
                                    {outcome && (
                                        <SetOutcomeModal
                                            type={outcome.type}
                                            message={outcome.message}
                                            onClose={() => setOutcome(null)}
                                        />
                                    )}
                                </form>
                            </div>
                        </div>

                        <aside className={`flex flex-col items-center text-center order-1 lg:order-1 lg:self-center lg:px-6`}>
                            <h1 className="mb-5 font-fleur text-[4.5rem] leading-[1.1] font-semibold whitespace-nowrap max-2xl:text-[4rem] max-lg:mb-4 max-lg:text-[3.5rem] upto-639:mb-3 upto-639:text-[2.75rem] upto-420:text-[2.4rem] upto-376:text-[2.1rem]">
                                {"Email me directly".split("").map((ch, i) =>
                                    ch === " " ? (
                                        <span key={i} className={LETTER_SPACE} aria-hidden="true">&nbsp;</span>
                                    ) : (
                                        <span
                                            key={i}
                                            className={`${GLOW_LETTER} text-white`}
                                            style={{ animationDelay: `${i * 80}ms` }}
                                        >
                                            {ch}
                                        </span>
                                    )
                                )}
                            </h1>
                            <p className="font-gotham text-[1.25rem] font-medium text-gray-300 max-2xl:text-[1.125rem] max-lg:text-[1.0625rem] upto-639:text-[1rem] upto-420:text-[0.9375rem] upto-376:text-[0.875rem]">
                                You can reach me more quickly via email by filling out the form.
                            </p>
                            <p className="mt-4 flex flex-wrap items-center justify-center gap-2 font-gotham text-[1rem] font-medium text-gray-400 upto-639:mt-3 upto-639:text-[0.9rem] upto-420:gap-1.5 upto-420:text-[0.82rem] upto-376:text-[0.78rem]">
                                <img src="/assets/images/gmail.webp" alt="" aria-hidden="true" className="h-4 w-4 shrink-0 object-contain" />
                                Sent to: <span className="text-gray-200">emerson.clamor.dev@gmail.com</span>
                            </p>
                        </aside>
                    </div>
                </div>
            </section>
        </main>
    );
}
