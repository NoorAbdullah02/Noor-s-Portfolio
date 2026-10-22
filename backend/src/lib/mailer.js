import nodemailer from "nodemailer";

let transporter = null;

export function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

export async function sendMail({ subject, text, replyTo }) {
  const mailer = getTransporter();
  const toAddress = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;
  if (!mailer || !toAddress) return { sent: false, reason: "SMTP not configured" };

  await mailer.sendMail({
    from: `"Portfolio" <${process.env.SMTP_USER}>`,
    to: toAddress,
    ...(replyTo ? { replyTo } : {}),
    subject,
    text,
  });
  return { sent: true };
}
