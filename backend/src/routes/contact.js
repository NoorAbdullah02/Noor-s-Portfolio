import { Router } from "express";
import { sendMail } from "../lib/mailer.js";
import { addMessage } from "../lib/messageStore.js";
import { contactNotificationEmail } from "../lib/emailTemplates.js";

const router = Router();

const isValidEmail = (email) => /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(email);

router.post("/", async (req, res) => {
  const { name, email, phone, message, company } = req.body ?? {};

  if (company) {
    return res.json({ message: "Thanks for reaching out!" });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email and message are required." });
  }
  if (!isValidEmail(String(email).trim())) {
    return res.status(400).json({ message: "Please provide a valid email address." });
  }
  if (String(message).length > 5000) {
    return res.status(400).json({ message: "Message is too long." });
  }

  const record = addMessage({
    name: String(name).trim().slice(0, 200),
    email: String(email).trim().slice(0, 200),
    phone: phone ? String(phone).trim().slice(0, 50) : "",
    message: String(message).trim().slice(0, 5000),
    ip: (req.headers["x-forwarded-for"]?.split(",")[0] || req.ip || "unknown").trim(),
  });

  try {
    const result = await sendMail({ ...contactNotificationEmail(record), replyTo: record.email });
    if (!result.sent) console.log("New contact message (email not configured):", record.id);
  } catch (err) {
    console.error("Failed to send contact notification:", err.message);
  }

  res.json({ message: "Thanks for reaching out! I'll get back to you soon." });
});

export default router;
