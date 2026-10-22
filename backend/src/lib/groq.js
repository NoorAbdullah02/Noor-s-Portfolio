const MODELS = ["openai/gpt-oss-20b", "openai/gpt-oss-120b"];

export class AiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export async function groqChat({ messages, maxTokens = 900, temperature = 0.5, json = false }) {
  if (!process.env.GROQ_API_KEY) throw new AiError("AI assistant not configured", 503);

  let lastStatus = 502;
  for (const model of MODELS) {
    let res;
    try {
      res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature,
          reasoning_effort: "low",
          ...(json ? { response_format: { type: "json_object" } } : {}),
        }),
        signal: AbortSignal.timeout(30000),
      });
    } catch (err) {
      console.error(`Groq request failed (${model}):`, err.message);
      lastStatus = 502;
      continue;
    }

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) return content;
      lastStatus = 502;
      continue;
    }

    lastStatus = res.status;
    const body = await res.text().catch(() => "");
    console.error(`Groq API error (${model}):`, res.status, body.slice(0, 160));
    if (res.status !== 429 && res.status < 500) break;
  }

  throw new AiError(
    lastStatus === 429 ? "The AI is busy right now. Please wait a few seconds and try again." : "AI service temporarily unavailable",
    lastStatus === 429 ? 429 : 502
  );
}
