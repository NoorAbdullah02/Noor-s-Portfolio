import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../data");
const DATA_FILE = path.join(DATA_DIR, "messages.json");
const MAX_ENTRIES = 2000;

let messages = [];

function load() {
  try {
    if (!existsSync(DATA_FILE)) return;
    messages = JSON.parse(readFileSync(DATA_FILE, "utf-8"));
  } catch {
    messages = [];
  }
}

function persist() {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DATA_FILE, JSON.stringify(messages.slice(-MAX_ENTRIES), null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist messages:", err.message);
  }
}

load();

export function addMessage({ name, email, phone, message, ip, visitorId }) {
  const record = {
    id: randomUUID(),
    timestamp: new Date().toISOString(),
    name,
    email,
    phone,
    message,
    ip,
    visitorId: visitorId || "",
    read: false,
    replies: [],
  };
  messages.push(record);
  if (messages.length > MAX_ENTRIES) messages = messages.slice(-MAX_ENTRIES);
  persist();
  return record;
}

export function getMessages() {
  return [...messages].reverse();
}

export function getMessage(id) {
  return messages.find((m) => m.id === id) || null;
}

export function setRead(id, read) {
  const msg = getMessage(id);
  if (!msg) return null;
  msg.read = Boolean(read);
  persist();
  return msg;
}

export function addReply(id, body) {
  const msg = getMessage(id);
  if (!msg) return null;
  msg.replies.push({ id: randomUUID(), timestamp: new Date().toISOString(), body });
  msg.read = true;
  persist();
  return msg;
}

export function deleteMessage(id) {
  const before = messages.length;
  messages = messages.filter((m) => m.id !== id);
  if (messages.length === before) return false;
  persist();
  return true;
}

export function knownVisitors() {
  const map = new Map();
  for (const m of messages) {
    if (m.visitorId) map.set(m.visitorId, { name: m.name, email: m.email });
  }
  return map;
}

export function findKnownVisitor(visitorId) {
  if (!visitorId) return null;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].visitorId === visitorId) return { name: messages[i].name, email: messages[i].email };
  }
  return null;
}

export function getMessageStats() {
  return {
    total: messages.length,
    unread: messages.filter((m) => !m.read).length,
    replied: messages.filter((m) => m.replies.length > 0).length,
  };
}
