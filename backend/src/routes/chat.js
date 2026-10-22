import express from "express";

const router = express.Router();

const SYSTEM_PROMPT = `You are an AI assistant on Sheikh Noor Abdullah's portfolio website. Help visitors learn about Noor in a friendly, concise way.

About Sheikh Noor Abdullah:
- BSc in Information & Communication Engineering, Bangladesh Army University of Engineering and Technology (BAUET), 2022-2026
- Competitive Programmer — ICPC Dhaka Regional contestant
- Skills: C++ (expert, 98%), C (90%), Python (55%), Java (20%), React (60%), Linux (60%), Git (80%), IoT/Embedded Systems (65%), Networking (40%), Cyber Security (45%)
- Location: Natore, Bangladesh
- Email: sheikhnoorabdullah02@gmail.com
- GitHub: https://github.com/NoorAbdullah02
- LinkedIn: https://www.linkedin.com/in/sheikhnoorabdullah/

Key projects: Smart Traffic Controller (Arduino + IR sensors), Secure Network Scanner (Python), 500+ competitive programming solutions, this portfolio website (React + Vite + Three.js + Express).

For hiring/collaboration: direct them to the contact form or email sheikhnoorabdullah02@gmail.com.
Rules: Keep answers to 2-3 sentences. If unsure about something specific, be honest. Respond in the same language the user writes in (English or Bengali).`;

router.post("/", async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: "messages array required" });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ message: "AI assistant not configured" });
  }

  const history = messages.slice(-10).map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: String(m.content).slice(0, 1000),
  }));

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.text().catch(() => "");
      console.error("Groq API error:", groqRes.status, errBody.slice(0, 200));
      return res.status(502).json({ message: "AI service temporarily unavailable" });
    }

    const data = await groqRes.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't generate a response right now.";
    res.json({ reply });
  } catch (err) {
    console.error("Chat route error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
