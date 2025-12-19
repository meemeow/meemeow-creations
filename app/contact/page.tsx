"use client";

import React, { useRef, useEffect, useState } from "react";
import { ZodError } from "zod";
import {
    firstNameSchema,
    lastNameSchema,
    emailSchema,
    messageSchema,
    contactSchema,
    ContactForm,
} from "./contact-validation";
import "../css/contact.css";

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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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

        // TODO: wire up actual submit (API / email)
        console.log("Submitting:", result.data);
        setErrors({});
        // Optionally reset form
        // setFormData({ firstName: "", lastName: "", email: "", message: "" });
    };

    return (
        <main className="min-h-screen bg-[#121214] text-white">
            <div className="max-w-9xl mx-10 px-6 py-18">
                {/* Hero card */}
                <section
                    className={`hero-card bg-white/5 border-2 border-white/20 rounded-lg px-28 py-52 mb-24 relative overflow-hidden ${hovered ? "hovered" : ""}`}
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                >
                    <video
                        ref={videoRef}
                        className="hero-video absolute inset-0 w-full h-full object-cover pointer-events-none"
                        src="/assets/others/contacts_bg.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="auto"
                        aria-hidden="true"
                    />

                    <div className="relative z-10 w-full flex flex-col items-center text-center md:items-start md:text-left">
                        <h1
                            className="font-extrabold mb-3 whitespace-nowrap"
                            style={{ fontSize: 'clamp(1.6rem, 6vw, 3.5rem)', lineHeight: 1.1 }}
                        >
                            From Memo to Memory
                        </h1>
                        <p className="text-xl text-gray-200 mb-6">
                            Ideas start with a conversation. Let's make something memorable.
                        </p>

                        <div className="space-y-2 text-gray-200 text-lg md:text-xl flex flex-col items-center md:items-start">
                            <div className="font-medium flex items-center gap-3">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <path
                                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 3.09 4.18 2 2 0 0 1 5 2h3a2 2 0 0 1 2 1.72c.12.93.37 1.82.73 2.65a2 2 0 0 1-.45 2.11L9.91 9.91a16 16 0 0 0 6 6l1.33-1.33a2 2 0 0 1 2.11-.45c.83.36 1.72.61 2.65.73A2 2 0 0 1 22 16.92z"
                                        fill="currentColor"
                                    />
                                </svg>
                                +63 9152669845
                            </div>

                            <div className="break-words flex items-center gap-3">
                                <img src="/assets/images/gmail.jpg" alt="Gmail" className="w-5 h-5 object-contain" />
                                <a href="mailto:emerson.clamor.prof@gmail.com" className="underline-offset-2 hover:underline">
                                    emerson.clamor.prof@gmail.com
                                </a>
                            </div>

                            <div className="flex items-center gap-3 text-gray-300 text-lg md:text-xl">
                                <img src="/assets/images/linkedin.jpg" alt="LinkedIn" className="w-6 h-6 md:w-7 md:h-7 object-contain" />
                                <a href="https://www.linkedin.com/in/emerson-clamor" target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    www.linkedin.com/in/emerson-clamor
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact form + callout */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Wider-looking form without moving grid */}
                    <div className="flex justify-start order-2 lg:order-1">
                        <div className="bg-white/5 border-2 border-white/20 p-10 w-full max-w-[760px] contact-card">
                            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <label className="flex flex-col">
                                        <span className="text-sm mb-2 text-gray-200 gotham-medium">First Name <span className="text-red-500">*</span></span>
                                        <input
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            required
                                            className="fancy-input"
                                            placeholder="First name"
                                        />
                                        {errors.firstName && <p className="text-sm text-red-400 mt-1">{errors.firstName}</p>}
                                    </label>

                                    <label className="flex flex-col">
                                        <span className="text-sm mb-2 text-gray-200 gotham-medium">Last Name <span className="text-red-500">*</span></span>
                                        <input
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            required
                                            className="fancy-input"
                                            placeholder="Last name"
                                        />
                                        {errors.lastName && <p className="text-sm text-red-400 mt-1">{errors.lastName}</p>}
                                    </label>
                                </div>

                                <label className="flex flex-col">
                                    <span className="text-sm mb-2 text-gray-200 gotham-medium">Email <span className="text-red-500">*</span></span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required
                                        className="fancy-input"
                                        placeholder="you@example.com"
                                    />
                                    {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email}</p>}
                                </label>

                                <label className="flex flex-col">
                                    <span className="text-sm mb-2 text-gray-200 gotham-medium">Message <span className="text-red-500">*</span></span>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        required
                                        rows={5}
                                        className="fancy-input fancy-textarea"
                                        placeholder="Write your message..."
                                    />
                                    {errors.message && <p className="text-sm text-red-400 mt-1">{errors.message}</p>}
                                </label>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 mt-6">
                                    <div />
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="fancy-submit gotham-medium"
                                            onMouseDown={e => e.currentTarget.classList.add('pressed')}
                                            onMouseUp={e => e.currentTarget.classList.remove('pressed')}
                                            onMouseLeave={e => e.currentTarget.classList.remove('pressed')}
                                        >
                                            {"Send Message".split("").map((ch, i) =>
                                                ch === " " ? (
                                                    <span key={i} className="glow-letter-space" aria-hidden="true">&nbsp;</span>
                                                ) : (
                                                    <span
                                                        key={i}
                                                        className="animate-contact-glow"
                                                        style={{ animationDelay: `${i * 80}ms`, color: '#171717' }}
                                                    >
                                                        {ch}
                                                    </span>
                                                )
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    <aside className="flex flex-col items-center text-center order-1 lg:order-2 lg:self-center lg:px-6">
                        <h1 className="text-6xl md:text-7xl font-semibold fleur-font mb-5 whitespace-nowrap">
                            {"Email me directly".split("").map((ch, i) =>
                                ch === " " ? (
                                    <span key={i} className="glow-letter-space" aria-hidden="true">&nbsp;</span>
                                ) : (
                                    <span
                                        key={i}
                                        className="animate-contact-glow"
                                        style={{ animationDelay: `${i * 80}ms` }}
                                    >
                                        {ch}
                                    </span>
                                )
                            )}
                        </h1>
                        <p className="text-xl text-gray-300 gotham-medium">
                            You can reach me more quickly via email by filling out the form.
                        </p>
                    </aside>
                </section>
            </div>
        </main>
    );
}