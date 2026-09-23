"use client";

import React, { useState } from "react";
import SetOutcomeModal from "@/components/ui/SetOutcomeModal";
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
    "upto-768:w-full upto-768:py-[0.6rem] upto-768:text-[0.98rem]";

const LABEL = "mb-1.5 font-gotham text-sm font-medium tracking-wide text-white";

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
    "upto-768:w-full upto-768:justify-center upto-768:px-4 upto-768:py-[0.7rem] upto-768:text-[0.62rem]";

const ERROR_TEXT = "mt-1 font-gotham text-sm text-[var(--mc-red)]";

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
    "max-lg:h-11";

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
const MC_SLOT =
    "flex items-center gap-4 border-[3px] bg-[#2f2d2c] px-5 py-4 font-gotham font-medium text-gray-200 " +
    "border-t-[#3d3938] border-r-[#3d3938] border-b-[#000000] border-l-[#000000] " +
    "[box-shadow:0_6px_18px_rgba(0,0,0,0.45)] [transition:background-color_140ms_ease,color_140ms_ease,transform_100ms_ease] " +
    "hover:bg-[#3a3735] hover:text-white active:[transform:translateY(2px)] " +
    "text-[1.05rem] break-all above-992:upto-1200:text-[0.98rem] upto-768:gap-3 upto-768:px-4 upto-768:py-3 upto-768:text-[0.9rem]";

// Per-letter glow for "Email me directly" and "Send Message"; each letter's delay is set inline.
const GLOW_LETTER = "inline-block animate-contact-glow will-change-[transform,filter,opacity] [text-shadow:0_0_6px_rgba(255,200,160,0.12)]";
const LETTER_SPACE = "inline-block w-[0.42rem]";

// Hero intro + contact lines shrink to a fluid size on large (≥1200px) and small (≤992px) screens.
const HERO_INFO_SIZE = "min-[1200px]:text-[clamp(1rem,1.8vw,1.25rem)]! upto-992:text-[clamp(0.92rem,1.7vw,1.08rem)]!";

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
        <main className="min-h-screen bg-[#171615] text-white">
            {/* Section 1 — intro on the left, contact slots on the right */}
            <section className="bg-[#0f0e0d]">
                <div className="max-w-9xl mx-2 md:mx-10 px-6 py-14 md:py-20">
                    <div className="grid w-full items-center gap-10 lg:grid-cols-12 lg:gap-20 upto-768:gap-8">
                        {/* Intro, in the original translucent card */}
                        <div className={`flex min-h-[560px] items-center p-12 lg:order-2 lg:col-span-8 min-[1200px]:min-h-[760px] above-1200:px-[5rem] above-768:upto-992:p-8 upto-768:min-h-[320px] upto-768:p-6 rounded-lg border-2 border-white/20 bg-white/5`}>
                            <div className="w-full text-center md:text-right">
                                <h1 className="mb-3 text-[clamp(1.6rem,6vw,3.5rem)] leading-[1.1] font-extrabold whitespace-nowrap min-[1200px]:text-[clamp(2rem,5.6vw,5rem)] min-[1200px]:leading-[1.02] upto-992:leading-[1.05] upto-768:mx-auto upto-768:text-center above-420:upto-768:text-[clamp(1.2rem,5vw,2.2rem)] upto-420:text-[clamp(1rem,5vw,1.4rem)]">
                                    From Me to You
                                </h1>
                                <p className={`text-xl text-gray-200 ${HERO_INFO_SIZE} upto-768:mx-auto upto-768:text-center`}>
                                    Questions, projects, or just to say hi &mdash; my inbox is open.
                                </p>
                            </div>
                        </div>

                        {/* Contacts stay unboxed, on the remaining 3 columns */}
                        <div className="flex w-full flex-col gap-4 lg:order-1 lg:col-span-4 lg:mr-auto lg:max-w-[540px] lg:[transform:translateY(-1.5rem)] upto-768:gap-3">
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
                                +63 9152669845
                            </a>

                            <a href="https://www.linkedin.com/in/emerson-clamor" target="_blank" rel="noopener noreferrer" className={MC_SLOT}>
                                <img src="/assets/images/linkedin.png" alt="" aria-hidden="true" className="h-5 w-5 shrink-0 object-contain" />
                                www.linkedin.com/in/emerson-clamor
                            </a>

                            <a href="https://github.com/meemeow" target="_blank" rel="noopener noreferrer" className={MC_SLOT}>
                                <img src="/assets/images/github.webp" alt="" aria-hidden="true" className="h-5 w-5 shrink-0 object-contain" />
                                https://github.com/meemeow
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
                                        className="-ml-1 shrink-0 animate-arrow-bounce-down will-change-transform motion-reduce:animate-none"
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
                                    <span className="font-pixel text-[0.68rem] uppercase tracking-[0.08em] text-white [text-shadow:2px_2px_0_#3f3f3f] upto-420:text-[0.6rem]">
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
                <div className="max-w-9xl mx-2 md:mx-10 px-6 py-10 md:py-18">
                    {/* Contact form + callout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        {/* Wider-looking form without moving grid */}
                        <div className="flex justify-start order-2 lg:order-1">
                            {/* Minecraft-style container: flat panel, hard edges, pixel headline */}
                            <div className={`mx-auto w-full max-w-[680px] p-8 above-992:upto-1200:max-w-[720px] above-992:upto-1200:p-[1.85rem] above-768:upto-992:p-[1.5rem] upto-768:w-[calc(100%-2rem)] upto-768:max-w-none above-420:upto-768:mx-4 above-420:upto-768:px-4 above-420:upto-768:pt-5 above-420:upto-768:pb-5 upto-420:mx-[0.6rem] upto-420:px-3 upto-420:pt-4 upto-420:pb-4 ${MC_PANEL}`}>
                                <h2 className={`${MC_PIXEL} mb-6 text-[1.45rem] leading-[1.35] text-white above-768:upto-992:text-[1.2rem] upto-768:mb-5 upto-768:text-[1rem] upto-420:text-[0.85rem]`}>
                                    SEND A MESSAGE!
                                </h2>

                                <form className="space-y-3" onSubmit={handleSubmit} noValidate>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                            className={`${FIELD} min-h-[104px] resize-y above-420:upto-768:min-h-[96px] upto-420:min-h-[88px]`}
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

                        <aside className="flex flex-col items-center text-center order-1 lg:order-2 lg:self-center lg:px-6">
                            <h1 className="mb-5 font-fleur text-7xl font-semibold whitespace-nowrap upto-768:text-[clamp(2rem,10vw,4rem)] upto-768:leading-[1.02]">
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
                            <p className="font-gotham text-xl font-medium text-gray-300 upto-420:text-[clamp(0.8rem,4vw,1.05rem)]">
                                You can reach me more quickly via email by filling out the form.
                            </p>
                            <p className="mt-4 flex items-center justify-center gap-2 font-gotham text-base font-medium text-gray-400 upto-420:text-[0.85rem]">
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
