import { Router } from "express";
import nodemailer from "nodemailer";

const router = Router();

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

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

router.post("/", async (req, res) => {
  const { name, email, phone, message, company } = req.body ?? {};

  // Honeypot field — bots tend to fill every input.
  if (company) {
    return res.json({ message: "Thanks for reaching out!" });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email and message are required." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Please provide a valid email address." });
  }
  if (String(message).length > 5000) {
    return res.status(400).json({ message: "Message is too long." });
  }

  const payload = {
    name: String(name).slice(0, 200),
    email: String(email).slice(0, 200),
    phone: phone ? String(phone).slice(0, 50) : "",
    message: String(message).slice(0, 5000),
    receivedAt: new Date().toISOString(),
  };

  const mailer = getTransporter();
  const toAddress = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;

  if (mailer && toAddress) {
    try {
      await mailer.sendMail({
        from: `"Portfolio Contact Form" <${process.env.SMTP_USER}>`,
        to: toAddress,
        replyTo: payload.email,
        subject: `New portfolio message from ${payload.name}`,
        text: `Name: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone || "-"}\n\n${payload.message}`,
      });
    } catch (err) {
      console.error("Failed to send contact email:", err.message);
      return res.status(502).json({ message: "Message received but email delivery failed. Please email me directly." });
    }
  } else {
    // No SMTP configured (e.g. local dev) — log instead so nothing is silently lost.
    console.log("New contact message (SMTP not configured):", payload);
  }

  res.json({ message: "Thanks for reaching out! I'll get back to you soon." });
});

export default router;
