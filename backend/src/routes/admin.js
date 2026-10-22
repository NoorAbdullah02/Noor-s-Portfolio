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
  knownVisitors,
} from "../lib/messageStore.js";
import { sendMail, ownerAddress } from "../lib/mailer.js";
import { replyEmail } from "../lib/emailTemplates.js";
import { groqChat } from "../lib/groq.js";
import { portfolioFacts } from "../lib/portfolioContext.js";
import { getChatLogs } from "../lib/chatLogStore.js";
import { adminAssistantPrompt, sendDailyBriefing, visitorProfile } from "../lib/insights.js";
import { cleanVisitorId } from "../lib/visitStore.js";

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

router.get("/visits", requireAdmin, async (req, res) => {
  const [known, rawVisits, stats] = await Promise.all([knownVisitors(), getVisits({ limit: 500 }), getStats()]);
  const visits = rawVisits.map((v) => ({ ...v, visitor: known.get(v.visitorId) || null }));
  res.json({ stats: { ...stats, identifiedVisitors: known.size }, visits });
});

router.get("/messages", requireAdmin, async (req, res) => {
  const [stats, messages] = await Promise.all([getMessageStats(), getMessages()]);
  res.json({ stats, messages });
});

router.get("/chats", requireAdmin, async (req, res) => {
  const [chats, known] = await Promise.all([getChatLogs({ limit: 300 }), knownVisitors()]);
  res.json({ chats: chats.map((c) => ({ ...c, visitor: known.get(c.visitorId) || null })) });
});

router.get("/visitor", requireAdmin, async (req, res) => {
  const visitorId = cleanVisitorId(req.query.visitorId);
  const ip = String(req.query.ip || "").slice(0, 60);
  if (!visitorId && !ip) return res.status(400).json({ message: "visitorId or ip required" });
  res.json(await visitorProfile({ visitorId, ip }));
});

router.patch("/messages/:id", requireAdmin, async (req, res) => {
  const msg = await setRead(req.params.id, req.body?.read);
  if (!msg) return res.status(404).json({ message: "Message not found." });
  res.json({ message: msg });
});

router.post("/messages/:id/reply", requireAdmin, async (req, res) => {
  const msg = await getMessage(req.params.id);
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

  res.json({ message: await addReply(msg.id, body) });
});

function parseSuggestions(raw) {
  const text = String(raw);
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  const parsed = JSON.parse(json);
  return (parsed.suggestions || [])
    .filter((s) => s && typeof s.body === "string" && s.body.trim())
    .slice(0, 3)
    .map((s) => ({ tone: String(s.tone || "Suggestion").slice(0, 30), body: s.body.trim().slice(0, 4000) }));
}

router.post("/messages/:id/suggest", requireAdmin, async (req, res) => {
  const msg = await getMessage(req.params.id);
  if (!msg) return res.status(404).json({ message: "Message not found." });

  const draft = String(req.body?.draft ?? "").trim().slice(0, 4000);
  const firstName = String(msg.name).split(/\s+/)[0];
  const thread = msg.replies.length
    ? `\n\nNoor's earlier replies in this conversation:\n${msg.replies.map((r) => `- ${r.body}`).join("\n")}`
    : "";

  const task = draft
    ? `Noor has written this draft reply:\n"""${draft}"""\nRewrite it in three improved versions that keep his intent and facts. Tones: "Polished", "Warmer", "Concise".`
    : `Write three different replies Noor could send. Tones: "Friendly", "Professional", "Short".`;

  const system = `You draft email replies on behalf of Sheikh Noor Abdullah, written in the first person as Noor.

Facts about Noor (use only these; never invent facts, dates, prices or commitments):
${await portfolioFacts()}

Rules:
- Reply in the same language the visitor wrote in.
- Start with "Hi ${firstName}," on its own line. Do NOT add a subject line or a signature/sign-off name — the email template adds Noor's signature automatically.
- Be genuine and specific to what the visitor asked. Short paragraphs. No placeholders like [date] or [link].
- If the visitor asks something not covered by the facts, say Noor will follow up with details rather than guessing.
- Return ONLY JSON: {"suggestions":[{"tone":"...","body":"..."},{"tone":"...","body":"..."},{"tone":"...","body":"..."}]}`;

  const user = `Visitor: ${msg.name} <${msg.email}>\nTheir message:\n"""${msg.message}"""${thread}\n\n${task}`;

  try {
    const raw = await groqChat({
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      maxTokens: 1500,
      temperature: 0.7,
      json: true,
    });
    const suggestions = parseSuggestions(raw);
    if (!suggestions.length) throw new Error("No suggestions parsed");
    res.json({ suggestions });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("Suggestion parse error:", err.message);
    res.status(502).json({ message: "The AI returned an unexpected answer. Please try again." });
  }
});

router.delete("/messages/:id", requireAdmin, async (req, res) => {
  if (!(await deleteMessage(req.params.id))) return res.status(404).json({ message: "Message not found." });
  res.status(204).end();
});

router.post("/ai", requireAdmin, async (req, res) => {
  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: "messages array required" });
  }
  const history = messages.slice(-8).map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: String(m.content ?? "").slice(0, 2000),
  }));
  try {
    const reply = await groqChat({
      messages: [
        { role: "system", content: await adminAssistantPrompt([...history].reverse().find((m) => m.role === "user")?.content) },
        ...history,
      ],
      maxTokens: 1200,
      temperature: 0.3,
    });
    res.json({ reply });
  } catch (err) {
    res.status(err.status || 502).json({ message: err.message || "AI service temporarily unavailable" });
  }
});

router.post("/briefing/send", requireAdmin, async (req, res) => {
  try {
    await sendDailyBriefing({ force: true });
    res.json({ ok: true });
  } catch (err) {
    console.error("Manual briefing failed:", err.message);
    res.status(502).json({ message: "Couldn't send the briefing right now. Please try again." });
  }
});

export default router;
