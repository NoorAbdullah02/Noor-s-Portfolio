import { randomUUID } from "crypto";
import { query } from "./db.js";

const SELECT_WITH_REPLIES = `
  SELECT m.*,
    COALESCE(
      json_agg(json_build_object('id', r.id, 'timestamp', r.created_at, 'body', r.body) ORDER BY r.created_at)
        FILTER (WHERE r.id IS NOT NULL),
      '[]'
    ) AS replies
  FROM messages m
  LEFT JOIN replies r ON r.message_id = m.id`;

const toMessage = (r) => ({
  id: r.id,
  timestamp: r.created_at.toISOString(),
  name: r.name,
  email: r.email,
  phone: r.phone,
  message: r.message,
  ip: r.ip,
  visitorId: r.visitor_id || "",
  read: r.read,
  replies: (r.replies || []).map((x) => ({ ...x, timestamp: new Date(x.timestamp).toISOString() })),
});

const isUuid = (id) => /^[0-9a-f-]{36}$/i.test(String(id));

export async function addMessage({ name, email, phone, message, ip, visitorId }) {
  const { rows } = await query(
    `INSERT INTO messages (id, name, email, phone, message, ip, visitor_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *, '[]'::json AS replies`,
    [randomUUID(), name, email, phone || "", message, ip, visitorId || null]
  );
  return toMessage(rows[0]);
}

export async function getMessages() {
  const { rows } = await query(`${SELECT_WITH_REPLIES} GROUP BY m.id ORDER BY m.created_at DESC LIMIT 2000`);
  return rows.map(toMessage);
}

export async function getMessage(id) {
  if (!isUuid(id)) return null;
  const { rows } = await query(`${SELECT_WITH_REPLIES} WHERE m.id = $1 GROUP BY m.id`, [id]);
  return rows[0] ? toMessage(rows[0]) : null;
}

export async function setRead(id, read) {
  if (!isUuid(id)) return null;
  const { rowCount } = await query("UPDATE messages SET read = $2 WHERE id = $1", [id, !!read]);
  return rowCount ? getMessage(id) : null;
}

export async function addReply(id, body) {
  if (!isUuid(id)) return null;
  await query("INSERT INTO replies (id, message_id, body) VALUES ($1,$2,$3)", [randomUUID(), id, body]);
  await query("UPDATE messages SET read = true WHERE id = $1", [id]);
  return getMessage(id);
}

export async function deleteMessage(id) {
  if (!isUuid(id)) return false;
  const { rowCount } = await query("DELETE FROM messages WHERE id = $1", [id]);
  return rowCount > 0;
}

export async function knownVisitors() {
  const { rows } = await query(
    `SELECT DISTINCT ON (visitor_id) visitor_id, name, email FROM messages
     WHERE visitor_id IS NOT NULL ORDER BY visitor_id, created_at DESC`
  );
  return new Map(rows.map((r) => [r.visitor_id, { name: r.name, email: r.email }]));
}

export async function findKnownVisitor(visitorId) {
  if (!visitorId) return null;
  const { rows } = await query(
    "SELECT name, email FROM messages WHERE visitor_id = $1 ORDER BY created_at DESC LIMIT 1",
    [visitorId]
  );
  return rows[0] || null;
}

export async function getMessageStats() {
  const { rows } = await query(`
    SELECT count(*)::int AS total,
      count(*) FILTER (WHERE NOT read)::int AS unread,
      count(*) FILTER (WHERE EXISTS (SELECT 1 FROM replies r WHERE r.message_id = messages.id))::int AS replied
    FROM messages`);
  return rows[0];
}
