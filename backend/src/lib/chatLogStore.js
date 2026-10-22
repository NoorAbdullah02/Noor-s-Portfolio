import { hasDatabase, query } from "./db.js";

const memory = [];

export async function addChatLog({ visitorId, ip, question, answer }) {
  const entry = {
    visitorId: visitorId || "",
    ip,
    question: String(question).slice(0, 2000),
    answer: String(answer).slice(0, 6000),
  };
  if (!hasDatabase()) {
    memory.push({ id: memory.length + 1, timestamp: new Date().toISOString(), ...entry });
    if (memory.length > 500) memory.shift();
    return;
  }
  await query(
    "INSERT INTO chat_logs (visitor_id, ip, question, answer) VALUES ($1,$2,$3,$4)",
    [entry.visitorId || null, entry.ip, entry.question, entry.answer]
  );
}

export async function getChatLogs({ limit = 200, sinceHours } = {}) {
  if (!hasDatabase()) {
    const since = sinceHours ? Date.now() - sinceHours * 3600000 : 0;
    return memory.filter((c) => new Date(c.timestamp).getTime() >= since).slice(-limit).reverse();
  }
  const { rows } = await query(
    `SELECT * FROM chat_logs
     WHERE ($2::int IS NULL OR created_at >= now() - make_interval(hours => $2::int))
     ORDER BY created_at DESC LIMIT $1`,
    [limit, sinceHours ?? null]
  );
  return rows.map((r) => ({
    id: Number(r.id),
    timestamp: r.created_at.toISOString(),
    visitorId: r.visitor_id || "",
    ip: r.ip,
    question: r.question,
    answer: r.answer,
  }));
}
