import path from "path";
import { fileURLToPath } from "url";
import { existsSync, readFileSync, renameSync } from "fs";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../data");

let pool = null;
let ready = null;

export const hasDatabase = () => Boolean(process.env.DATABASE_URL);

const SCHEMA = `
CREATE TABLE IF NOT EXISTS visits (
  id            TEXT PRIMARY KEY,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  visitor_id    TEXT,
  ip            TEXT,
  user_agent    TEXT,
  referrer      TEXT,
  path          TEXT,
  is_bot        BOOLEAN NOT NULL DEFAULT false,
  device        JSONB,
  geo           JSONB,
  duration      INTEGER NOT NULL DEFAULT 0,
  sections      TEXT[] NOT NULL DEFAULT '{}',
  summary_sent  BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS visits_created_idx ON visits (created_at DESC);
CREATE INDEX IF NOT EXISTS visits_visitor_idx ON visits (visitor_id);

CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT NOT NULL DEFAULT '',
  message     TEXT NOT NULL,
  ip          TEXT,
  visitor_id  TEXT,
  read        BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS messages_created_idx ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS messages_visitor_idx ON messages (visitor_id);

CREATE TABLE IF NOT EXISTS replies (
  id          UUID PRIMARY KEY,
  message_id  UUID NOT NULL REFERENCES messages (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  body        TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS replies_message_idx ON replies (message_id);

CREATE TABLE IF NOT EXISTS chat_logs (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  visitor_id  TEXT,
  ip          TEXT,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS chat_logs_created_idx ON chat_logs (created_at DESC);

CREATE TABLE IF NOT EXISTS app_settings (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL
);
`;

const isLocalIp = (ip = "") => ip === "::1" || ip.startsWith("127.") || ip.startsWith("::ffff:127.");

async function importJsonData(client) {
  const visitsFile = path.join(DATA_DIR, "visits.json");
  const messagesFile = path.join(DATA_DIR, "messages.json");

  if (existsSync(visitsFile)) {
    const visits = JSON.parse(readFileSync(visitsFile, "utf-8")).filter((v) => !isLocalIp(v.ip));
    for (const v of visits) {
      await client.query(
        `INSERT INTO visits (id, created_at, visitor_id, ip, user_agent, referrer, path, is_bot, device, geo, duration, sections, summary_sent)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true) ON CONFLICT (id) DO NOTHING`,
        [v.id, v.timestamp, v.visitorId || null, v.ip, v.userAgent, v.referrer, v.path, !!v.isBot,
          v.device || null, v.geo || null, v.duration || 0, v.sections || []]
      );
    }
    renameSync(visitsFile, `${visitsFile}.imported-${Date.now()}`);
    console.log(`Imported ${visits.length} visits from visits.json into Postgres`);
  }

  if (existsSync(messagesFile)) {
    const messages = JSON.parse(readFileSync(messagesFile, "utf-8")).filter((m) => !isLocalIp(m.ip));
    for (const m of messages) {
      await client.query(
        `INSERT INTO messages (id, created_at, name, email, phone, message, ip, visitor_id, read)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO NOTHING`,
        [m.id, m.timestamp, m.name, m.email, m.phone || "", m.message, m.ip, m.visitorId || null, !!m.read]
      );
      for (const r of m.replies || []) {
        await client.query(
          "INSERT INTO replies (id, message_id, created_at, body) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING",
          [r.id, m.id, r.timestamp, r.body]
        );
      }
    }
    renameSync(messagesFile, `${messagesFile}.imported-${Date.now()}`);
    console.log(`Imported ${messages.length} messages from messages.json into Postgres`);
  }
}

function getPool() {
  if (!pool) {
    const url = new URL(process.env.DATABASE_URL);
    url.searchParams.delete("sslmode");
    url.searchParams.delete("channel_binding");
    pool = new pg.Pool({
      connectionString: url.toString(),
      ssl: { rejectUnauthorized: true },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    pool.on("error", (err) => console.error("Postgres pool error:", err.message));
  }
  return pool;
}

export function initDatabase() {
  if (!hasDatabase()) return Promise.resolve(false);
  ready ??= (async () => {
    const client = await getPool().connect();
    try {
      await client.query(SCHEMA);
      await importJsonData(client);
    } finally {
      client.release();
    }
    console.log("Connected to Postgres");
    return true;
  })().catch((err) => {
    ready = null;
    throw err;
  });
  return ready;
}

export async function query(text, params) {
  await initDatabase();
  return getPool().query(text, params);
}

export async function getSetting(key) {
  const { rows } = await query("SELECT value FROM app_settings WHERE key = $1", [key]);
  return rows[0]?.value ?? null;
}

export async function setSetting(key, value) {
  await query(
    "INSERT INTO app_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
    [key, String(value)]
  );
}
