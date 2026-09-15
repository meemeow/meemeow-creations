import * as z from "zod";

const nameRegex = /^[A-Za-zñÑ\s'-]+$/;

export const firstNameSchema = z
    .string()
    .min(1, "First name is required")
    .regex(nameRegex, "Only alphabetic characters allowed");

export const lastNameSchema = z
    .string()
    .min(1, "Last name is required")
    .regex(nameRegex, "Only alphabetic characters allowed");

export const emailSchema = z.string().min(1, "Email is required").email("Invalid email address");

export const messageSchema = z
    .string()
    .min(1, "Message is required")
    .refine((val) => {
        const words = val.trim().split(/\s+/).filter(Boolean).length;
        return words <= 1000;
    }, "Message must be 1000 words or fewer");

export const contactSchema = z.object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    email: emailSchema,
    message: messageSchema,
});

export type ContactForm = z.infer<typeof contactSchema>;
