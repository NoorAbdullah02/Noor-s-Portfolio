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

async function sendViaBrevo({ subject, text, replyTo, toAddress }) {
  const senderEmail = process.env.BREVO_SENDER_EMAIL || toAddress;
  const senderName = process.env.BREVO_SENDER_NAME || "Portfolio";

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { email: senderEmail, name: senderName },
      to: [{ email: toAddress }],
      subject,
      textContent: text,
      ...(replyTo ? { replyTo: { email: replyTo } } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Brevo API error ${res.status}: ${body.slice(0, 300)}`);
  }
}

export async function sendMail({ subject, text, replyTo }) {
  const toAddress = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;
  if (!toAddress) return { sent: false, reason: "No destination email configured" };

  if (process.env.BREVO_API_KEY) {
    await sendViaBrevo({ subject, text, replyTo, toAddress });
    return { sent: true };
  }

  const mailer = getTransporter();
  if (!mailer) return { sent: false, reason: "No email provider configured" };

  await mailer.sendMail({
    from: `"Portfolio" <${process.env.SMTP_USER}>`,
    to: toAddress,
    ...(replyTo ? { replyTo } : {}),
    subject,
    text,
  });
  return { sent: true };
}
