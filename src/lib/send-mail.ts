import nodemailer from 'nodemailer';

export function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: (process.env.SMTP_SECURE === 'true') || false,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

export const mailFrom = () => process.env.FROM_EMAIL || 'no-reply@example.com';
export const mailTo = () => process.env.TO_EMAIL || 'emerson.clamor.dev@gmail.com';
