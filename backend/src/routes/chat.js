import express from "express";
import { buildSystemPrompt } from "../lib/portfolioContext.js";
import { groqChat } from "../lib/groq.js";
import { addChatLog } from "../lib/chatLogStore.js";
import { cleanVisitorId } from "../lib/visitStore.js";
import { isLoopback } from "./visit.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { messages } = req.body ?? {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: "messages array required" });
  }

  const history = messages.slice(-8).map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: String(m.content ?? "").slice(0, 1500),
  }));

  let reply;
  try {
    reply = await groqChat({
      messages: [{ role: "system", content: await buildSystemPrompt() }, ...history],
      maxTokens: 900,
    });
  } catch (err) {
    return res.status(err.status || 502).json({ message: err.message || "AI service temporarily unavailable" });
  }

  res.json({ reply });

  const question = [...history].reverse().find((m) => m.role === "user")?.content;
  const ip = (req.headers["x-forwarded-for"]?.split(",")[0] || req.ip || "unknown").trim();
  if (question && (!isLoopback(ip) || process.env.TRACK_LOCALHOST === "true")) {
    addChatLog({
      visitorId: cleanVisitorId(req.body?.visitorId),
      ip,
      question,
      answer: reply,
    }).catch((err) => console.error("Failed to log chat:", err.message));
  }
});

export default router;
