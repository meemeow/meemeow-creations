"use client";

import { useState, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import type { ZodError } from "zod";
import SetOutcomeModal from "@/components/ui/SetOutcomeModal";
import {
  contactSchema,
  emailSchema,
  firstNameSchema,
  lastNameSchema,
  messageSchema,
  type ContactForm as ContactFormData,
} from "@/lib/contact-validation";
import { ERROR_TEXT, FIELD, LABEL, MC_BUTTON, MC_PIXEL } from "./contact-classes";

type FieldName = keyof ContactFormData;
type FieldElement = HTMLInputElement | HTMLTextAreaElement;

const EMPTY_FORM: ContactFormData = { firstName: "", lastName: "", email: "", message: "" };

const FIELD_SCHEMAS = {
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  email: emailSchema,
  message: messageSchema,
};

const RequiredMark = () => <span className="text-[var(--mc-red)]">*</span>;

type FieldProps = {
  label: string;
  name: FieldName;
  value: string;
  error?: string;
  placeholder: string;
  type?: string;
  multiline?: boolean;
  onChange: (e: ChangeEvent<FieldElement>) => void;
  onBlur: (e: FocusEvent<FieldElement>) => void;
};

function Field({ label, name, value, error, placeholder, type, multiline, onChange, onBlur }: FieldProps) {
  return (
    <label className="flex flex-col">
      <span className={LABEL}>
        {`${label} `}
        <RequiredMark />
      </span>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required
          rows={4}
          className={`${FIELD} h-[128px] min-h-[72px] resize-y max-lg:h-[112px] upto-639:h-[96px] upto-420:h-[84px]`}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required
          className={FIELD}
          placeholder={placeholder}
        />
      )}
      {error && <p className={ERROR_TEXT}>{error}</p>}
    </label>
  );
}

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const validateField = (name: string, value: string) => {
    try {
      FIELD_SCHEMAS[name as FieldName]?.parse(value);
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

  const handleChange = (e: ChangeEvent<FieldElement>) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleBlur = (e: FocusEvent<FieldElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    setOutcome(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || "Send failed");
      }

      setFormData(EMPTY_FORM);
      setOutcome({ type: "success", message: "Thanks for reaching out. I'll get back to you soon." });
    } catch (err) {
      const error = err as Error;
      console.error(error);
      setOutcome({ type: "error", message: error.message || "Send failed" });
    } finally {
      setLoading(false);
    }
  };

  const fieldProps = (name: FieldName) => ({
    name,
    value: formData[name],
    error: errors[name],
    onChange: handleChange,
    onBlur: handleBlur,
  });

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 upto-639:gap-3">
        <Field label="First Name" placeholder="First name" {...fieldProps("firstName")} />
        <Field label="Last Name" placeholder="Last name" {...fieldProps("lastName")} />
      </div>

      <Field label="Email" type="email" placeholder="you@example.com" {...fieldProps("email")} />
      <Field label="Message" multiline placeholder="Write your message..." {...fieldProps("message")} />

      <div className="flex items-center justify-between gap-4 pt-1 upto-639:flex-col upto-639:items-stretch upto-639:gap-3">
        <p
          className={`${MC_PIXEL} text-[0.6rem] leading-[1.6] text-[var(--mc-text-dim)] upto-639:text-right upto-420:text-[0.55rem]`}
        >
          <RequiredMark /> Required Fields
        </p>
        <button type="submit" className={MC_BUTTON} disabled={loading}>
          <span>{loading ? "Sending…" : "Send Message"}</span>
          <span
            aria-hidden="true"
            className="inline-block will-change-transform group-hover:animate-arrow-nudge motion-reduce:animate-none"
          >
            &gt;
          </span>
        </button>
      </div>
      {outcome && <SetOutcomeModal type={outcome.type} message={outcome.message} onClose={() => setOutcome(null)} />}
    </form>
  );
}
