import { contactSchema } from '@/lib/contact-validation';
import { createTransporter, mailFrom, mailTo } from '@/lib/send-mail';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = contactSchema.safeParse(body);
    if (!result.success) {
      return new Response(JSON.stringify({ error: 'validation', issues: result.error.issues }), { status: 422 });
    }

    const data = result.data;

    const transporter = createTransporter();

    await transporter.sendMail({
      from: mailFrom(),
      to: mailTo(),
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
