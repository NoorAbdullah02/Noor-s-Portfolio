import path from "path";
import { fileURLToPath } from "url";
import { mkdirSync, existsSync, readFileSync, writeFileSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../../data");
const DATA_FILE = path.join(DATA_DIR, "visits.json");
const MAX_ENTRIES = 1000;

let visits = [];

function ensureStore() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) {
    writeFileSync(DATA_FILE, "[]", "utf-8");
  }
}

function load() {
  try {
    ensureStore();
    const raw = readFileSync(DATA_FILE, "utf-8");
    visits = JSON.parse(raw);
  } catch {
    visits = [];
  }
}

function persist() {
  try {
    ensureStore();
    writeFileSync(DATA_FILE, JSON.stringify(visits.slice(-MAX_ENTRIES), null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to persist visit log:", err.message);
  }
}

load();

export function addVisit(entry) {
  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  visits.push(record);
  if (visits.length > MAX_ENTRIES) visits = visits.slice(-MAX_ENTRIES);
  persist();
  return record;
}

export function getVisits({ limit = 200 } = {}) {
  return visits.slice(-limit).reverse();
}

export function getStats() {
  const uniqueIps = new Set(visits.map((v) => v.ip));
  const since24h = Date.now() - 24 * 60 * 60 * 1000;
  const last24h = visits.filter((v) => new Date(v.timestamp).getTime() >= since24h);
  return {
    totalVisits: visits.length,
    uniqueVisitors: uniqueIps.size,
    visitsLast24h: last24h.length,
  };
}
