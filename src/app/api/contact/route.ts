import nodemailer from 'nodemailer';
import { contactSchema } from '../../contact/contact-validation';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return new Response(JSON.stringify({ error: 'validation', issues: result.error.issues }), { status: 422 });
    }

    const data = result.data;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: (process.env.SMTP_SECURE === 'true') || false,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });

    const from = process.env.FROM_EMAIL || 'no-reply@example.com';
    const to = process.env.TO_EMAIL || 'emerson.clamor.prof@gmail.com';

    await transporter.sendMail({
      from,
      to,
      subject: `Portfolio contact: ${data.firstName} ${data.lastName}`,
      text: `${data.message}\n\nReply to: ${data.email}`,
      replyTo: data.email,
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('Contact API error:', err);
    return new Response(JSON.stringify({ error: 'server_error' }), { status: 500 });
  }
}
