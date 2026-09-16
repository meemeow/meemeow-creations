"use client";

import React, { useRef, useEffect, useState } from "react";
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

// Frosted white input/textarea that lifts slightly on focus.
const FIELD =
    "rounded-lg border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.82)] px-3 py-2 font-gotham font-medium text-[#171717] " +
    "placeholder:w-full placeholder:font-gotham placeholder:font-medium placeholder:text-[#515151] placeholder:[transition:border-color_160ms_ease,box-shadow_160ms_ease,transform_120ms_ease] " +
    "focus:border-[rgba(255,255,255,0.72)] focus:[outline:none] focus:[box-shadow:0_0_0_3px_rgba(255,230,216,0.12)] focus:[transform:translateY(-1px)] " +
    "upto-768:w-full upto-768:py-[0.6rem] upto-768:text-[0.98rem]";

const LABEL = "mb-2 font-gotham text-sm font-medium text-gray-200";

// Per-letter glow for "Email me directly" and "Send Message"; each letter's delay is set inline.
const GLOW_LETTER = "inline-block animate-contact-glow will-change-[transform,filter,opacity] [text-shadow:0_0_6px_rgba(255,200,160,0.12)]";
const LETTER_SPACE = "inline-block w-[0.42rem]";

// Hero intro + contact lines shrink to a fluid size on large (≥1200px) and small (≤992px) screens.
const HERO_INFO_SIZE = "min-[1200px]:text-[clamp(1rem,1.8vw,1.25rem)]! upto-992:text-[clamp(0.92rem,1.7vw,1.08rem)]!";

export default function Contact() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        v.play().catch(() => {});
    }, []);

    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;
        if (hovered) {
            v.play().catch(() => {});
        }
    }, [hovered]);

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
        <main className="min-h-screen bg-[#121214] text-white">
            <div className="max-w-9xl mx-2 md:mx-10 px-6 py-10 md:py-18">
                {/* Hero card */}
                <section
                    className="relative mb-16 flex min-h-[390px] items-center overflow-hidden rounded-lg border-2 border-white/20 bg-white/5 [transition:min-height_220ms_ease,padding_220ms_ease] md:mb-24 min-[1200px]:min-h-[760px] above-1200:px-[7rem] above-1200:py-[6.5rem] above-992:upto-1200:p-[3.5rem] upto-992:justify-center above-768:upto-992:px-8 above-768:upto-992:py-16 upto-768:min-h-[340px] upto-768:px-4 upto-768:pt-[2.75rem] upto-768:pb-[1.75rem]"
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    <video
                        ref={videoRef}
                        className={`pointer-events-none absolute inset-0 h-full w-full object-cover [transition:opacity_260ms_ease,transform_420ms_cubic-bezier(.2,.9,.2,1)] ${
                            hovered
                                ? "opacity-[0.85] [transform:scale(1.03)]"
                                : "opacity-[0.56] [transform:scale(1)] [section:hover>&]:opacity-[0.85] [section:hover>&]:[transform:scale(1.03)]"
                        }`}
                        src="/assets/others/contacts_bg.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        aria-hidden="true"
                    />

                    <div className="relative z-11 flex w-full flex-col items-center text-center md:items-start md:text-left">
                        <h1 className="mb-3 text-[clamp(1.6rem,6vw,3.5rem)] leading-[1.1] font-extrabold whitespace-nowrap min-[1200px]:text-[clamp(2rem,5.6vw,5rem)] min-[1200px]:leading-[1.02] upto-992:leading-[1.05] upto-768:mx-auto upto-768:text-center above-420:upto-768:text-[clamp(1.2rem,5vw,2.2rem)] upto-420:text-[clamp(1rem,5vw,1.4rem)]">
                            From Memo to Memory
                        </h1>
                        <p className={`mb-6 text-xl text-gray-200 ${HERO_INFO_SIZE} upto-768:mx-auto upto-768:text-center`}>
                            Ideas start with a conversation. Let's make something memorable.
                        </p>

                        <div className={`flex flex-col items-center space-y-2 text-lg text-gray-200 md:items-start md:text-xl ${HERO_INFO_SIZE} upto-768:text-center`}>
                            <div className="flex items-center gap-3 font-medium upto-768:justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path
                                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 3.09 4.18 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.72c.12.93.37 1.82.73 2.65a2 2 0 0 1-.45 2.11L9.91 9.91a16 16 0 0 0 6 6l1.33-1.33a2 2 0 0 1 2.11-.45c.83.36 1.72.61 2.65.73A2 2 0 0 1 22 16.92z"
                                        fill="currentColor"
                                    />
                                </svg>
                                +63 9152669845
                            </div>

                            <div className="flex items-center gap-3 break-words upto-768:justify-center">
                                <img src="/assets/images/gmail.jpg" alt="Gmail" className="w-5 h-5 object-contain" />
                                <a href="mailto:emerson.clamor.dev@gmail.com" className="underline-offset-2 hover:underline">
                                    emerson.clamor.dev@gmail.com
                                </a>
                            </div>

                            <div className={`flex items-center gap-3 text-lg text-gray-300 md:text-xl ${HERO_INFO_SIZE} upto-768:justify-center`}>
                                <img src="/assets/images/linkedin.jpg" alt="LinkedIn" className="w-5 h-5 object-contain" />
                                <a href="https://www.linkedin.com/in/emerson-clamor" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    www.linkedin.com/in/emerson-clamor
                                </a>
                            </div>

                            <div className={`flex items-center gap-3 text-lg text-gray-300 md:text-xl ${HERO_INFO_SIZE} upto-768:justify-center`}>
                                <img src="/assets/images/github.png" alt="GitHub" className="w-5 h-5 object-contain" />
                                <a href="https://github.com/meemeow" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    https://github.com/meemeow
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact form + callout */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Wider-looking form without moving grid */}
                    <div className="flex justify-start order-2 lg:order-1">
                        {/* glassmorphism card with a peach glow */}
                        <div className="mx-auto w-full max-w-[680px] border-2 border-[color:rgba(var(--peach-r),var(--peach-g),var(--peach-b),0.7)] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))] p-10 backdrop-blur-[8px] [box-shadow:0_0_38px_0_rgba(var(--peach-r),var(--peach-g),var(--peach-b),0.22),0_0_8px_0_rgba(var(--peach-r),var(--peach-g),var(--peach-b),0.12),0_10px_36px_rgba(2,6,23,0.7)] [transition:box-shadow_220ms_ease,border-color_220ms_ease,transform_160ms_ease] above-992:upto-1200:max-w-[720px] above-992:upto-1200:p-[2.25rem] above-768:upto-992:p-[1.75rem] upto-768:w-[calc(100%-2rem)] upto-768:max-w-none upto-768:rounded-[10px] above-420:upto-768:mx-4 above-420:upto-768:px-4 above-420:upto-768:pt-4 above-420:upto-768:pb-5 upto-420:mx-[0.6rem] upto-420:px-3 upto-420:pt-3 upto-420:pb-4">
                            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label className="flex flex-col">
                                        <span className={LABEL}>First Name <span className="text-red-500">*</span></span>
                                        <input
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            required
                                            className={FIELD}
                                            placeholder="First name"
                                        />
                                        {errors.firstName && <p className="text-sm text-red-400 mt-1">{errors.firstName}</p>}
                                    </label>

                                    <label className="flex flex-col">
                                        <span className={LABEL}>Last Name <span className="text-red-500">*</span></span>
                                        <input
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            required
                                            className={FIELD}
                                            placeholder="Last name"
                                        />
                                        {errors.lastName && <p className="text-sm text-red-400 mt-1">{errors.lastName}</p>}
                                    </label>
                                </div>

                                <label className="flex flex-col">
                                    <span className={LABEL}>Email <span className="text-red-500">*</span></span>
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
                                    {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email}</p>}
                                </label>

                                <label className="flex flex-col">
                                    <span className={LABEL}>Message <span className="text-red-500">*</span></span>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required
                                        rows={5}
                                        className={`${FIELD} min-h-[140px] resize-y above-420:upto-768:min-h-[120px] upto-420:min-h-[100px]`}
                                        placeholder="Write your message..."
                                    />
                                    {errors.message && <p className="text-sm text-red-400 mt-1">{errors.message}</p>}
                                </label>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 mt-6">
                                    <div />
                                    <div className="flex justify-end">
                                        {/* whitish-pink gradient button with a peach glow; presses down on click */}
                                        <button
                                            type="submit"
                                            className="inline-block cursor-pointer rounded-[10px] border border-[rgba(255,230,216,0.9)] bg-[linear-gradient(90deg,#ffe6f0_0%,#fff0f5_100%)] px-4 py-[0.6rem] font-gotham font-medium text-[#171717] [box-shadow:0_0_8px_1px_rgba(255,230,216,0.65)] [transition:transform_160ms_cubic-bezier(.2,.9,.2,1),box-shadow_160ms_ease,background_160ms_ease,border-color_160ms_ease,color_160ms_ease] focus:[box-shadow:0_0_0_3px_rgba(255,230,216,0.12)] active:[transform:scale(0.96)_translateY(2px)] [&:active:not(:focus)]:[box-shadow:0_2px_8px_rgba(2,6,23,0.18)] upto-768:w-[70%] upto-768:min-w-[120px] upto-768:max-w-[220px] upto-768:justify-center upto-768:px-3 upto-768:py-[0.55rem] upto-768:text-[0.95rem] above-639:upto-768:inline-flex upto-639:mx-auto upto-639:flex"
                                            disabled={loading}
                                            onMouseDown={e => e.currentTarget.classList.add('pressed')}
                                            onMouseUp={e => e.currentTarget.classList.remove('pressed')}
                                            onMouseLeave={e => e.currentTarget.classList.remove('pressed')}
                                        >
                                            {loading ? (
                                                <span className="text-sm text-gray-700">Sending…</span>
                                            ) : (
                                                "Send Message".split("").map((ch, i) =>
                                                    ch === " " ? (
                                                        <span key={i} className={LETTER_SPACE} aria-hidden="true">&nbsp;</span>
                                                    ) : (
                                                        <span
                                                            key={i}
                                                            className={`${GLOW_LETTER} text-[#171717]`}
                                                            style={{ animationDelay: `${i * 80}ms` }}
                                                        >
                                                            {ch}
                                                        </span>
                                                    )
                                                )
                                            )}
                                        </button>
                                    </div>
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
                    </aside>
                </section>
            </div>
        </main>
    );
}
