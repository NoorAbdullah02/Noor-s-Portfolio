import { Router } from "express";
import { timingSafeEqual } from "crypto";
import { getVisits, getStats } from "../lib/visitStore.js";
import {
  getMessages,
  getMessage,
  setRead,
  addReply,
  deleteMessage,
  getMessageStats,
} from "../lib/messageStore.js";
import { sendMail, ownerAddress } from "../lib/mailer.js";
import { replyEmail } from "../lib/emailTemplates.js";

const router = Router();

function matchesPassword(candidate) {
  const configured = process.env.ADMIN_PASSWORD || "";
  const a = Buffer.from(String(candidate ?? ""));
  const b = Buffer.from(configured);
  return a.length === b.length && timingSafeEqual(a, b);
}

function requireAdmin(req, res, next) {
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(503).json({ message: "Admin panel isn't configured on this server yet." });
  }
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!matchesPassword(token)) {
    return res.status(401).json({ message: "Invalid credentials." });
  }
  next();
}

router.post("/login", (req, res) => {
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(503).json({ message: "Admin panel isn't configured on this server yet." });
  }
  if (!matchesPassword(req.body?.password)) {
    return res.status(401).json({ message: "Incorrect password." });
  }
  res.json({ ok: true });
});

router.get("/visits", requireAdmin, (req, res) => {
  res.json({ stats: getStats(), visits: getVisits({ limit: 300 }) });
});

router.get("/messages", requireAdmin, (req, res) => {
  res.json({ stats: getMessageStats(), messages: getMessages() });
});

router.patch("/messages/:id", requireAdmin, (req, res) => {
  const msg = setRead(req.params.id, req.body?.read);
  if (!msg) return res.status(404).json({ message: "Message not found." });
  res.json({ message: msg });
});

router.post("/messages/:id/reply", requireAdmin, async (req, res) => {
  const msg = getMessage(req.params.id);
  if (!msg) return res.status(404).json({ message: "Message not found." });

  const body = String(req.body?.body ?? "").trim();
  if (!body) return res.status(400).json({ message: "Reply can't be empty." });
  if (body.length > 10000) return res.status(400).json({ message: "Reply is too long." });

  try {
    const result = await sendMail({
      ...replyEmail({ msg, body }),
      to: msg.email,
      toName: msg.name,
      replyTo: ownerAddress() || undefined,
    });
    if (!result.sent) {
      return res.status(503).json({ message: "Email isn't configured on the server, so the reply wasn't sent." });
    }
  } catch (err) {
    console.error("Failed to send reply:", err.message);
    return res.status(502).json({ message: "The email provider rejected the reply. Please try again." });
  }

  res.json({ message: addReply(msg.id, body) });
});

router.delete("/messages/:id", requireAdmin, (req, res) => {
  if (!deleteMessage(req.params.id)) return res.status(404).json({ message: "Message not found." });
  res.status(204).end();
});

export default router;
