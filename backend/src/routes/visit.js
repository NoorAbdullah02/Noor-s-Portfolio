import { Router } from "express";
import { sendMail } from "../lib/mailer.js";
import { addVisit, getVisit, cleanVisitorId, countVisits, updateVisit } from "../lib/visitStore.js";
import { findKnownVisitor } from "../lib/messageStore.js";
import { visitNotificationEmail, visitSummaryEmail } from "../lib/emailTemplates.js";
import { lookupIp } from "../lib/geo.js";

const router = Router();

const BOT_PATTERN = /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|discordbot|uptime|curl|wget|python-requests|monitor/i;
const notificationsOn = () => process.env.ENABLE_VISIT_NOTIFICATIONS !== "false";
export const isLoopback = (ip = "") => ip === "::1" || ip.startsWith("127.") || ip.startsWith("::ffff:127.");

const short = (value, max) => String(value ?? "").replace(/[^\w\s/:+.,()-]/g, "").slice(0, max);

function deviceInfo(body = {}) {
  return {
    screen: /^\d{2,5}x\d{2,5}$/.test(body.screen) ? body.screen : "",
    viewport: /^\d{2,5}x\d{2,5}$/.test(body.viewport) ? body.viewport : "",
    language: short(body.language, 20),
    timezone: short(body.timezone, 50),
  };
}

router.post("/", async (req, res) => {
  const ip = (req.headers["x-forwarded-for"]?.split(",")[0] || req.ip || "unknown").trim();
  const userAgent = String(req.get("user-agent") || "unknown").slice(0, 300);
  const referrer = String(req.body?.referrer || req.get("referer") || "direct").slice(0, 300);
  const path = String(req.body?.path || "/").slice(0, 200);
  const visitorId = cleanVisitorId(req.body?.visitorId);
  const isBot = BOT_PATTERN.test(userAgent);

  if (isLoopback(ip) && process.env.TRACK_LOCALHOST !== "true") return res.status(204).end();

  let record;
  try {
    record = await addVisit({ ip, userAgent, referrer, path, isBot, visitorId, device: deviceInfo(req.body) });
  } catch (err) {
    console.error("Failed to record visit:", err.message);
    return res.status(204).end();
  }
  res.status(201).json({ id: record.id });

  try {
    const geo = await lookupIp(ip);
    if (geo) await updateVisit(record.id, { geo });

    if (notificationsOn() && !isBot) {
      const [known, visitCount] = await Promise.all([findKnownVisitor(visitorId), countVisits(visitorId)]);
      const result = await sendMail(visitNotificationEmail({ ...record, geo }, { known, visitCount }));
      if (!result.sent) console.log("New visit (email not configured):", record.id);
    }
  } catch (err) {
    console.error("Visit follow-up failed:", err.message);
  }
});

const SUMMARY_DELAY_MS = 2 * 60 * 1000;
const MIN_SUMMARY_SECONDS = 15;
const summaryTimers = new Map();

function scheduleSummary(visitId) {
  clearTimeout(summaryTimers.get(visitId));
  const timer = setTimeout(async () => {
    summaryTimers.delete(visitId);
    try {
      const visit = await getVisit(visitId);
      if (!visit || visit.isBot || visit.summarySent || (visit.duration || 0) < MIN_SUMMARY_SECONDS) return;
      await updateVisit(visitId, { summarySent: true });
      const [known, visitCount] = await Promise.all([findKnownVisitor(visit.visitorId), countVisits(visit.visitorId)]);
      await sendMail(visitSummaryEmail(visit, { known, visitCount }));
    } catch (err) {
      console.error("Failed to send visit summary email:", err.message);
    }
  }, SUMMARY_DELAY_MS);
  timer.unref?.();
  summaryTimers.set(visitId, timer);
}

router.post("/:id/activity", async (req, res) => {
  const seconds = Number(req.body?.seconds);
  const sections = Array.isArray(req.body?.sections) ? req.body.sections.slice(0, 20).map(String) : [];
  try {
    const visit = await updateVisit(String(req.params.id).slice(0, 80), { addSeconds: seconds, sections });
    if (visit && notificationsOn() && !visit.isBot && !visit.summarySent) scheduleSummary(visit.id);
  } catch (err) {
    console.error("Failed to record visit activity:", err.message);
  }
  res.status(204).end();
});

export default router;
