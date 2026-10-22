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
    if (!existsSync(DATA_FILE)) return;
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

const SECTION_IDS = new Set(["home", "about", "skills", "qualification", "projects", "github", "contact"]);

export function updateVisit(id, { geo, addSeconds, sections, summarySent } = {}) {
  const visit = visits.find((v) => v.id === id);
  if (!visit) return null;
  if (geo) visit.geo = geo;
  if (summarySent) visit.summarySent = true;
  if (Number.isFinite(addSeconds) && addSeconds > 0) {
    visit.duration = Math.min(4 * 3600, (visit.duration || 0) + Math.round(Math.min(addSeconds, 4 * 3600)));
  }
  if (Array.isArray(sections)) {
    const merged = new Set(visit.sections || []);
    sections.forEach((s) => SECTION_IDS.has(s) && merged.add(s));
    visit.sections = [...merged];
  }
  persist();
  return visit;
}

export const cleanVisitorId = (value) => {
  const id = String(value ?? "");
  return /^[a-z0-9-]{8,64}$/i.test(id) ? id : "";
};

const visitorKey = (v) => v.visitorId || `ip:${v.ip}`;

export function getVisit(id) {
  return visits.find((v) => v.id === id) || null;
}

export function countVisits(visitorId) {
  return visitorId ? visits.filter((v) => v.visitorId === visitorId).length : 0;
}

export function getVisits({ limit = 200 } = {}) {
  const counts = new Map();
  for (const v of visits) counts.set(visitorKey(v), (counts.get(visitorKey(v)) || 0) + 1);
  return visits
    .slice(-limit)
    .reverse()
    .map((v) => ({ ...v, visitCount: counts.get(visitorKey(v)) || 1 }));
}

export function getStats() {
  const counts = new Map();
  for (const v of visits) counts.set(visitorKey(v), (counts.get(visitorKey(v)) || 0) + 1);
  const since24h = Date.now() - 24 * 60 * 60 * 1000;
  const last24h = visits.filter((v) => new Date(v.timestamp).getTime() >= since24h);
  return {
    totalVisits: visits.length,
    uniqueVisitors: counts.size,
    returningVisitors: [...counts.values()].filter((n) => n > 1).length,
    visitsLast24h: last24h.length,
  };
}
