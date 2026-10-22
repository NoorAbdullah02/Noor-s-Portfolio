import { getVisits, getStats } from "./visitStore.js";
import { getMessages, getMessageStats, knownVisitors } from "./messageStore.js";
import { getChatLogs } from "./chatLogStore.js";
import { hasDatabase, getSetting, setSetting } from "./db.js";
import { groqChat } from "./groq.js";
import { sendMail } from "./mailer.js";
import { formatGeo } from "./geo.js";
import { dailyBriefingEmail, formatDuration } from "./emailTemplates.js";

const TZ = "Asia/Dhaka";
const BRIEFING_HOUR = Number(process.env.BRIEFING_HOUR ?? 21);

const dhakaTime = (iso) =>
  new Date(iso).toLocaleString("en-GB", { timeZone: TZ, day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const dhakaDate = (d = new Date()) => d.toLocaleDateString("en-CA", { timeZone: TZ });

function source(referrer) {
  if (!referrer || referrer === "direct") return "direct";
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer.slice(0, 40);
  }
}

function device(ua = "") {
  const os = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Windows/.test(ua) ? "Windows"
    : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "other";
  return `${os}${/Mobile|Android|iPhone/.test(ua) ? " mobile" : ""}`;
}

const tally = (items) =>
  Object.entries(items.reduce((acc, k) => ((acc[k] = (acc[k] || 0) + 1), acc), {}))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([k, n]) => `${k} ${n}`)
    .join(", ");

export async function dataSnapshot({ sinceHours } = {}) {
  const [allVisits, visitStats, messages, messageStats, chats, known] = await Promise.all([
    getVisits({ limit: 500 }),
    getStats(),
    getMessages(),
    getMessageStats(),
    getChatLogs({ limit: 40, sinceHours }),
    knownVisitors(),
  ]);

  const since = sinceHours ? Date.now() - sinceHours * 3600000 : 0;
  const humans = allVisits.filter((v) => !v.isBot && new Date(v.timestamp).getTime() >= since);
  const recentMessages = messages.filter((m) => new Date(m.timestamp).getTime() >= since);

  const byDay = tally(humans.map((v) => dhakaDate(new Date(v.timestamp))));
  const visitLines = humans.slice(0, 40).map((v) => {
    const who = known.get(v.visitorId)?.name;
    return [
      dhakaTime(v.timestamp),
      who ? `NAME=${who}` : "anonymous",
      `IP ${v.ip}`,
      formatGeo(v.geo) || "location unknown",
      device(v.userAgent),
      `from ${source(v.referrer)}`,
      v.duration ? `stayed ${formatDuration(v.duration)}` : "",
      v.sections?.length ? `read ${v.sections.join("/")}` : "",
      v.visitCount > 1 ? `visit #${v.visitCount}` : "first visit",
    ].filter(Boolean).join(" | ");
  });

  const messageLines = recentMessages.slice(0, 20).map((m) =>
    `${dhakaTime(m.timestamp)} | ${m.name} <${m.email}>${m.phone ? ` ${m.phone}` : ""} | ${m.replies.length ? "REPLIED" : m.read ? "read, NOT replied" : "UNREAD"} | "${m.message.replace(/\s+/g, " ").slice(0, 160)}"`);

  const chatLines = chats.slice(0, 20).map((c) =>
    `${dhakaTime(c.timestamp)} | ${known.get(c.visitorId)?.name || `IP ${c.ip}`} | "${c.question.replace(/\s+/g, " ").slice(0, 110)}"`);

  const avgDuration = humans.filter((v) => v.duration).reduce((s, v, _, arr) => s + v.duration / arr.length, 0);

  return {
    counts: { visits: humans.length, messages: recentMessages.length, chats: chats.length },
    text: [
      `ALL-TIME TOTALS: ${visitStats.totalVisits} visits, ${visitStats.uniqueVisitors} unique visitors, ${visitStats.returningVisitors} returning, ${messageStats.total} messages (${messageStats.unread} unread, ${messageStats.replied} replied), ${known.size} visitors identified by name.`,
      `PERIOD: ${sinceHours ? `last ${sinceHours} hours` : "all recorded data"} — ${humans.length} human visits${avgDuration ? `, average active time ${formatDuration(avgDuration)}` : ""}.`,
      humans.length ? `Visits per day: ${byDay}` : "",
      humans.length ? `Countries/cities: ${tally(humans.map((v) => formatGeo(v.geo) || "unknown"))}` : "",
      humans.length ? `Sources: ${tally(humans.map((v) => source(v.referrer)))}` : "",
      humans.length ? `Devices: ${tally(humans.map((v) => device(v.userAgent)))}` : "",
      humans.length ? `Most-read sections: ${tally(humans.flatMap((v) => v.sections || []))}` : "",
      `\nRECENT VISITS (newest first, Dhaka time):\n${visitLines.join("\n") || "none"}`,
      `\nMESSAGES (newest first):\n${messageLines.join("\n") || "none"}`,
      `\nQUESTIONS VISITORS ASKED THE WEBSITE AI (newest first):\n${chatLines.join("\n") || "none"}`,
    ].filter(Boolean).join("\n"),
  };
}

export async function visitorProfile({ visitorId = "", ip = "" }) {
  const [visits, messages, chats, known] = await Promise.all([
    getVisits({ limit: 2000 }),
    getMessages(),
    getChatLogs({ limit: 2000 }),
    knownVisitors(),
  ]);
  const matchesVisit = (v) => (visitorId ? v.visitorId === visitorId : !v.visitorId && v.ip === ip);
  const theirVisits = visits.filter(matchesVisit);
  const ips = [...new Set(theirVisits.map((v) => v.ip).concat(ip ? [ip] : []))];
  return {
    visitorId,
    identity: visitorId ? known.get(visitorId) || null : null,
    ips,
    visits: theirVisits,
    messages: messages.filter((m) => (visitorId ? m.visitorId === visitorId : ips.includes(m.ip))),
    chats: chats.filter((c) => (visitorId ? c.visitorId === visitorId : ips.includes(c.ip))),
    totalSeconds: theirVisits.reduce((s, v) => s + (v.duration || 0), 0),
  };
}

function describeProfile(p) {
  const first = p.visits[p.visits.length - 1];
  const latest = p.visits[0];
  return [
    `PROFILE ${p.identity ? `${p.identity.name} <${p.identity.email}>` : "anonymous visitor"}${p.visitorId ? ` (browser ID ${p.visitorId.slice(0, 8)})` : ""}`,
    `IPs: ${p.ips.join(", ") || "none"}`,
    latest?.geo ? `Location: ${formatGeo(latest.geo)} · ISP ${latest.geo.isp || "unknown"}` : "",
    latest ? `Device: ${device(latest.userAgent)} · screen ${latest.device?.screen || "?"} · language ${latest.device?.language || "?"} · timezone ${latest.device?.timezone || "?"}` : "",
    `Visits: ${p.visits.length}${first ? ` (first ${dhakaTime(first.timestamp)}, latest ${dhakaTime(latest.timestamp)})` : ""} · total active time ${formatDuration(p.totalSeconds)}`,
    ...p.visits.slice(0, 15).map((v) => `  - ${dhakaTime(v.timestamp)} from ${source(v.referrer)}${v.duration ? `, ${formatDuration(v.duration)}` : ""}${v.sections?.length ? `, read ${v.sections.join("/")}` : ""}`),
    ...p.messages.slice(0, 10).map((m) => `  MESSAGE ${dhakaTime(m.timestamp)}: "${m.message.replace(/\s+/g, " ").slice(0, 300)}" (${m.replies.length ? "replied" : "not replied"})`),
    ...p.chats.slice(0, 10).map((c) => `  ASKED THE WEBSITE AI ${dhakaTime(c.timestamp)}: "${c.question.replace(/\s+/g, " ").slice(0, 150)}" → the AI answered: "${c.answer.replace(/\s+/g, " ").slice(0, 120)}"`),
  ].filter(Boolean).join("\n");
}

async function focusedProfiles(question = "") {
  const q = String(question).toLowerCase();
  const ips = q.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b|\b[0-9a-f]{0,4}(?::[0-9a-f]{0,4}){2,7}\b/gi) || [];
  const [messages, visits] = await Promise.all([getMessages(), getVisits({ limit: 2000 })]);

  const targets = new Map();
  for (const m of messages) {
    const first = m.name.toLowerCase().split(/\s+/)[0];
    if ((first.length > 2 && q.includes(first)) || q.includes(m.email.toLowerCase())) {
      targets.set(m.visitorId || `ip:${m.ip}`, { visitorId: m.visitorId, ip: m.ip });
    }
  }
  for (const ip of ips) {
    const v = visits.find((x) => x.ip === ip);
    if (v) targets.set(v.visitorId || `ip:${ip}`, { visitorId: v.visitorId, ip });
  }
  if (!targets.size) return "";
  const profiles = await Promise.all([...targets.values()].slice(0, 3).map(visitorProfile));
  return `\n\nDETAILED RECORDS FOR THE VISITOR(S) NOOR IS ASKING ABOUT:\n${profiles.map(describeProfile).join("\n\n")}`;
}

export async function adminAssistantPrompt(latestQuestion = "") {
  const [snapshot, focus] = await Promise.all([dataSnapshot(), focusedProfiles(latestQuestion)]);
  return `You are the private analytics assistant inside Sheikh Noor Abdullah's portfolio admin panel. You talk to Noor himself (address him as "you").
Current time in Dhaka: ${new Date().toLocaleString("en-GB", { timeZone: TZ, dateStyle: "full", timeStyle: "short" })}.

Below is REAL data from the website's database. Answer only from it.

${snapshot.text}${focus}

Rules:
- Be accurate. Never invent visitors, names, numbers, locations or messages. If the data doesn't contain the answer, say so plainly.
- Visitors are anonymous unless marked NAME=. Locations are approximate (IP-based, city level).
- Be concise and useful: lead with the answer, then a short bullet list if helpful. Point out messages that still need a reply when relevant.
- Use **bold** and "- " bullets. No tables.
- Reply in the language Noor writes in (English, Bengali or Banglish).`;
}

export async function sendDailyBriefing({ force = false } = {}) {
  const today = dhakaDate();
  if (!force) {
    const last = hasDatabase() ? await getSetting("last_briefing_date") : sendDailyBriefing.lastDate;
    if (last === today) return false;
  }

  const snapshot = await dataSnapshot({ sinceHours: 24 });
  let summary = "";
  try {
    summary = await groqChat({
      messages: [
        {
          role: "system",
          content: `You write Noor's short daily portfolio briefing email from REAL website data. Never invent anything. 4–8 short bullet points ("- "), most important first: visitor count and where they came from, notable/returning/named visitors, engagement, messages needing a reply, interesting questions visitors asked the AI. If there was no activity, say so in one friendly sentence. English.`,
        },
        { role: "user", content: snapshot.text },
      ],
      maxTokens: 700,
      temperature: 0.3,
    });
  } catch (err) {
    console.error("Briefing AI summary failed:", err.message);
  }

  await sendMail(dailyBriefingEmail({ date: today, summary, counts: snapshot.counts, data: snapshot.text }));
  if (hasDatabase()) await setSetting("last_briefing_date", today);
  else sendDailyBriefing.lastDate = today;
  return true;
}

export function startBriefingScheduler() {
  if (process.env.ENABLE_DAILY_BRIEFING === "false") return;
  const tick = async () => {
    const hour = Number(new Date().toLocaleString("en-GB", { timeZone: TZ, hour: "2-digit", hour12: false }));
    if (hour < BRIEFING_HOUR) return;
    try {
      await sendDailyBriefing();
    } catch (err) {
      console.error("Daily briefing failed:", err.message);
    }
  };
  setInterval(tick, 10 * 60 * 1000).unref?.();
  setTimeout(tick, 60 * 1000).unref?.();
}
