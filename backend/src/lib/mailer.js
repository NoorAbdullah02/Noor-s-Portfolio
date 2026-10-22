import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
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

export const ownerAddress = () => process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER || "";

async function sendViaBrevo({ to, toName, subject, text, html, replyTo }) {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL || ownerAddress(),
        name: process.env.BREVO_SENDER_NAME || "Portfolio",
      },
      to: [{ email: to, ...(toName ? { name: toName } : {}) }],
      subject,
      textContent: text,
      ...(html ? { htmlContent: html } : {}),
      ...(replyTo ? { replyTo: { email: replyTo } } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brevo API error ${res.status}: ${body.slice(0, 300)}`);
  }
}

export async function sendMail({ to, toName, subject, text, html, replyTo }) {
  const recipient = to || ownerAddress();
  if (!recipient) return { sent: false, reason: "No destination email configured" };

  if (process.env.BREVO_API_KEY) {
    await sendViaBrevo({ to: recipient, toName, subject, text, html, replyTo });
    return { sent: true };
  }

  const mailer = getTransporter();
  if (!mailer) return { sent: false, reason: "No email provider configured" };

  await mailer.sendMail({
    from: `"${process.env.BREVO_SENDER_NAME || "Portfolio"}" <${process.env.SMTP_USER}>`,
    to: toName ? `"${toName.replace(/"/g, "")}" <${recipient}>` : recipient,
    ...(replyTo ? { replyTo } : {}),
    subject,
    text,
    ...(html ? { html } : {}),
  });
  return { sent: true };
}
