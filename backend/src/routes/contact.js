import { Router } from "express";
import { sendMail } from "../lib/mailer.js";

const router = Router();

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
  };

  try {
    const result = await sendMail({
      subject: `New portfolio message from ${payload.name}`,
      text: `Name: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone || "-"}\n\n${payload.message}`,
      replyTo: payload.email,
    });
    if (!result.sent) {
      // No SMTP configured (e.g. local dev) — log instead so nothing is silently lost.
      console.log("New contact message (SMTP not configured):", payload);
    }
  } catch (err) {
    console.error("Failed to send contact email:", err.message);
    return res.status(502).json({ message: "Message received but email delivery failed. Please email me directly." });
  }

  res.json({ message: "Thanks for reaching out! I'll get back to you soon." });
});

export default router;
