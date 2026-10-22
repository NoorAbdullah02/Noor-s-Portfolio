import { query } from "./db.js";

const SECTION_IDS = ["home", "about", "skills", "qualification", "projects", "github", "contact"];

const toVisit = (r) => ({
  id: r.id,
  timestamp: r.created_at.toISOString(),
  visitorId: r.visitor_id || "",
  ip: r.ip,
  userAgent: r.user_agent,
  referrer: r.referrer,
  path: r.path,
  isBot: r.is_bot,
  device: r.device || null,
  geo: r.geo || null,
  duration: r.duration,
  sections: r.sections || [],
  summarySent: r.summary_sent,
  ...(r.visit_count !== undefined ? { visitCount: Number(r.visit_count) } : {}),
});

export async function addVisit({ ip, userAgent, referrer, path, isBot, visitorId, device }) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const { rows } = await query(
    `INSERT INTO visits (id, visitor_id, ip, user_agent, referrer, path, is_bot, device)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [id, visitorId || null, ip, userAgent, referrer, path, !!isBot, device || null]
  );
  return toVisit(rows[0]);
}

export async function getVisit(id) {
  const { rows } = await query("SELECT * FROM visits WHERE id = $1", [id]);
  return rows[0] ? toVisit(rows[0]) : null;
}

export async function updateVisit(id, { geo, addSeconds, sections, summarySent } = {}) {
  const seconds = Number.isFinite(addSeconds) && addSeconds > 0 ? Math.round(Math.min(addSeconds, 14400)) : 0;
  const cleanSections = Array.isArray(sections) ? sections.filter((s) => SECTION_IDS.includes(s)) : [];
  const { rows } = await query(
    `UPDATE visits SET
       geo = COALESCE($2, geo),
       duration = LEAST(14400, duration + $3),
       sections = ARRAY(SELECT DISTINCT unnest(sections || $4::text[])),
       summary_sent = summary_sent OR $5
     WHERE id = $1 RETURNING *`,
    [id, geo || null, seconds, cleanSections, !!summarySent]
  );
  return rows[0] ? toVisit(rows[0]) : null;
}

export async function countVisits(visitorId) {
  if (!visitorId) return 0;
  const { rows } = await query("SELECT count(*)::int AS n FROM visits WHERE visitor_id = $1", [visitorId]);
  return rows[0].n;
}

export async function getVisits({ limit = 200 } = {}) {
  const { rows } = await query(
    `SELECT * FROM (
       SELECT v.*, count(*) OVER (PARTITION BY COALESCE(v.visitor_id, 'ip:' || v.ip)) AS visit_count
       FROM visits v
     ) t ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return rows.map(toVisit);
}

export async function getStats() {
  const { rows } = await query(`
    WITH keyed AS (SELECT COALESCE(visitor_id, 'ip:' || ip) AS k, created_at FROM visits),
         per AS (SELECT k, count(*) AS n FROM keyed GROUP BY k)
    SELECT
      (SELECT count(*) FROM visits)::int AS total_visits,
      (SELECT count(*) FROM per)::int AS unique_visitors,
      (SELECT count(*) FROM per WHERE n > 1)::int AS returning_visitors,
      (SELECT count(*) FROM visits WHERE created_at >= now() - interval '24 hours')::int AS visits_24h
  `);
  const r = rows[0];
  return {
    totalVisits: r.total_visits,
    uniqueVisitors: r.unique_visitors,
    returningVisitors: r.returning_visitors,
    visitsLast24h: r.visits_24h,
  };
}
