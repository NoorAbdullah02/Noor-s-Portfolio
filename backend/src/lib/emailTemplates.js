import { formatGeo, flagEmoji } from "./geo.js";

const BRAND = {
  primary: "#4f46e5",
  secondary: "#9333ea",
  text: "#0d0e18",
  muted: "#64687f",
  border: "#e7e8f2",
  bg: "#f4f4fb",
  font: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  mono: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
};

const OWNER = {
  name: "Sheikh Noor Abdullah",
  title: "Software Engineer · Competitive Programmer · ML Researcher",
  github: "https://github.com/NoorAbdullah02",
  linkedin: "https://www.linkedin.com/in/sheikhnoorabdullah/",
};

const siteUrl = () => (process.env.SITE_URL || "").replace(/\/+$/, "");

export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const multiline = (value) => esc(value).replace(/\r?\n/g, "<br>");

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  }) + " (BST)";
}

function button(href, label, solid = true) {
  const style = solid
    ? `background:${BRAND.primary};background-image:linear-gradient(135deg,${BRAND.primary},${BRAND.secondary});color:#ffffff;border:1px solid ${BRAND.primary};`
    : `background:#ffffff;color:${BRAND.primary};border:1px solid ${BRAND.border};`;
  return `<a href="${esc(href)}" target="_blank" style="${style}display:inline-block;padding:12px 22px;border-radius:12px;font-family:${BRAND.font};font-size:14px;font-weight:600;text-decoration:none;margin:4px 6px 4px 0;">${label}</a>`;
}

function infoRow(label, value) {
  return `<tr>
    <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};font-family:${BRAND.font};font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${BRAND.muted};width:120px;vertical-align:top;">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid ${BRAND.border};font-family:${BRAND.font};font-size:14px;color:${BRAND.text};word-break:break-word;">${value}</td>
  </tr>`;
}

function layout({ preheader, eyebrow, title, body, footerNote }) {
  const site = siteUrl();
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};-webkit-font-smoothing:antialiased;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
      <tr><td style="padding:0 4px 16px;font-family:${BRAND.mono};font-size:16px;font-weight:700;">
        <span style="color:${BRAND.primary};">&lt;Noor</span><span style="color:${BRAND.text};">.dev/&gt;</span>
      </td></tr>
      <tr><td style="background:#ffffff;border:1px solid ${BRAND.border};border-radius:20px;overflow:hidden;box-shadow:0 12px 40px -16px rgba(79,70,229,.25);">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr><td bgcolor="${BRAND.primary}" style="background:${BRAND.primary};background-image:linear-gradient(135deg,${BRAND.primary} 0%,${BRAND.secondary} 100%);padding:32px 32px 28px;">
            <div style="font-family:${BRAND.mono};font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(255,255,255,.75);">${esc(eyebrow)}</div>
            <div style="margin-top:8px;font-family:${BRAND.font};font-size:24px;line-height:1.3;font-weight:700;color:#ffffff;">${esc(title)}</div>
          </td></tr>
          <tr><td style="padding:32px;font-family:${BRAND.font};font-size:15px;line-height:1.65;color:${BRAND.text};">
            ${body}
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:20px 8px;text-align:center;font-family:${BRAND.font};font-size:12px;line-height:1.6;color:${BRAND.muted};">
        ${footerNote ? `${footerNote}<br>` : ""}
        <a href="${OWNER.github}" style="color:${BRAND.muted};text-decoration:none;">GitHub</a>
        &nbsp;·&nbsp;
        <a href="${OWNER.linkedin}" style="color:${BRAND.muted};text-decoration:none;">LinkedIn</a>
        ${site ? `&nbsp;·&nbsp;<a href="${esc(site)}" style="color:${BRAND.muted};text-decoration:none;">Portfolio</a>` : ""}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function quoteBox(content, accent = BRAND.primary) {
  return `<div style="margin:20px 0;padding:18px 20px;background:#f7f7fd;border:1px solid ${BRAND.border};border-left:4px solid ${accent};border-radius:12px;font-size:15px;line-height:1.7;color:${BRAND.text};">${content}</div>`;
}

export function contactNotificationEmail(msg) {
  const site = siteUrl();
  const subject = `New message from ${msg.name}`;
  const body = `
    <p style="margin:0 0 4px;font-size:15px;color:${BRAND.muted};">Someone reached out through your portfolio.</p>
    ${quoteBox(multiline(msg.message))}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
      ${infoRow("Name", esc(msg.name))}
      ${infoRow("Email", `<a href="mailto:${esc(msg.email)}" style="color:${BRAND.primary};text-decoration:none;">${esc(msg.email)}</a>`)}
      ${infoRow("Phone", esc(msg.phone || "—"))}
      ${infoRow("Received", esc(formatDate(msg.timestamp)))}
    </table>
    ${site ? button(`${site}/admin`, "Reply from Admin Panel") : ""}
    ${button(`mailto:${msg.email}?subject=${encodeURIComponent(`Re: Your message to ${OWNER.name}`)}`, "Reply by Email", !site)}
  `;
  const text = `New portfolio message\n\nName: ${msg.name}\nEmail: ${msg.email}\nPhone: ${msg.phone || "-"}\nReceived: ${formatDate(msg.timestamp)}\n\n${msg.message}${site ? `\n\nReply from the admin panel: ${site}/admin` : ""}`;
  return {
    subject,
    text,
    html: layout({
      preheader: `${msg.name}: ${String(msg.message).slice(0, 90)}`,
      eyebrow: "New message",
      title: `${msg.name} sent you a message`,
      body,
      footerNote: "Hit reply to answer directly — it goes to the sender.",
    }),
  };
}

function describeAgent(ua = "") {
  const browser = /Edg\//.test(ua) ? "Edge"
    : /OPR\/|Opera/.test(ua) ? "Opera"
    : /Chrome\//.test(ua) ? "Chrome"
    : /Firefox\//.test(ua) ? "Firefox"
    : /Safari\//.test(ua) ? "Safari"
    : "Unknown browser";
  const os = /Windows/.test(ua) ? "Windows"
    : /Android/.test(ua) ? "Android"
    : /iPhone|iPad|iOS/.test(ua) ? "iOS"
    : /Mac OS X/.test(ua) ? "macOS"
    : /Linux/.test(ua) ? "Linux"
    : "Unknown OS";
  const device = /Mobile|Android|iPhone/.test(ua) ? "Mobile" : "Desktop";
  return `${browser} · ${os} · ${device}`;
}

export function visitNotificationEmail(record, { known = null, visitCount = 0 } = {}) {
  const site = siteUrl();
  const returning = visitCount > 1;
  const subject = known
    ? `${known.name} is back on your portfolio`
    : returning ? "A returning visitor is on your portfolio" : "New visitor on your portfolio";
  const intro = known
    ? `<strong>${esc(known.name)}</strong> (who messaged you before) just opened your portfolio again.`
    : returning ? `Someone who has visited before is back — visit #${visitCount}.` : "Someone just opened your portfolio.";
  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:${BRAND.muted};">${intro}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${known ? infoRow("Visitor", `${esc(known.name)} · <a href="mailto:${esc(known.email)}" style="color:${BRAND.primary};text-decoration:none;">${esc(known.email)}</a>`) : ""}
      ${visitCount > 0 ? infoRow("Visit", `#${visitCount}${returning ? " (returning)" : " (first time)"}`) : ""}
      ${record.geo ? infoRow("Location", `${flagEmoji(record.geo.countryCode)} ${esc(formatGeo(record.geo))}${record.geo.isp ? `<br><span style="color:${BRAND.muted};font-size:12px;">${esc(record.geo.isp)}</span>` : ""}`) : ""}
      ${infoRow("Page", esc(record.path))}
      ${infoRow("Device", esc(describeAgent(record.userAgent)) + (record.device?.screen ? ` · ${esc(record.device.screen)}` : ""))}
      ${record.device?.language || record.device?.timezone ? infoRow("Locale", esc([record.device.language, record.device.timezone].filter(Boolean).join(" · "))) : ""}
      ${infoRow("Referrer", esc(record.referrer || "direct"))}
      ${infoRow("IP", `<span style="font-family:${BRAND.mono};font-size:13px;">${esc(record.ip)}</span>`)}
      ${infoRow("Time", esc(formatDate(record.timestamp)))}
    </table>
    ${site ? button(`${site}/admin`, "Open Visitor Log") : ""}
  `;
  const text = `${known ? `${known.name} (${known.email}) is back on your portfolio.` : returning ? `A returning visitor is back (visit #${visitCount}).` : "Someone just opened your portfolio."}\n\n${record.geo ? `Location: ${formatGeo(record.geo)}${record.geo.isp ? ` (${record.geo.isp})` : ""}\n` : ""}Page: ${record.path}\nDevice: ${describeAgent(record.userAgent)}\nReferrer: ${record.referrer}\nIP: ${record.ip}\nTime: ${formatDate(record.timestamp)}`;
  return {
    subject,
    text,
    html: layout({
      preheader: `${record.geo ? `${formatGeo(record.geo)} · ` : ""}${describeAgent(record.userAgent)} · ${record.referrer || "direct"}`,
      eyebrow: "Visitor alert",
      title: known ? `${known.name} is back` : returning ? "A returning visitor" : "You have a new visitor",
      body,
    }),
  };
}

const SECTION_LABELS = {
  home: "Home", about: "About", skills: "Skills", qualification: "Education & Achievements",
  projects: "Projects", github: "GitHub", contact: "Contact",
};

export function formatDuration(seconds = 0) {
  const s = Math.round(seconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export function visitSummaryEmail(visit, { known = null, visitCount = 0 } = {}) {
  const site = siteUrl();
  const where = formatGeo(visit.geo);
  const who = known ? known.name : "A visitor";
  const subject = `${who} spent ${formatDuration(visit.duration)} on your portfolio${where ? ` · ${where}` : ""}`;
  const sections = (visit.sections || []).map((s) => SECTION_LABELS[s] || s);
  const chips = sections.length
    ? sections.map((s) => `<span style="display:inline-block;margin:0 6px 6px 0;padding:4px 10px;border-radius:999px;background:#eef0ff;color:${BRAND.primary};font-size:12px;font-weight:600;">${esc(s)}</span>`).join("")
    : `<span style="color:${BRAND.muted};">Only the top of the page</span>`;

  const body = `
    <div style="text-align:center;margin:0 0 24px;">
      <div style="font-size:40px;font-weight:800;line-height:1;color:${BRAND.primary};">${esc(formatDuration(visit.duration))}</div>
      <div style="margin-top:6px;font-size:13px;color:${BRAND.muted};">active time on your portfolio</div>
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${known ? infoRow("Visitor", `${esc(known.name)} · <a href="mailto:${esc(known.email)}" style="color:${BRAND.primary};text-decoration:none;">${esc(known.email)}</a>`) : ""}
      ${infoRow("Sections read", chips)}
      ${visit.geo ? infoRow("Location", `${flagEmoji(visit.geo.countryCode)} ${esc(where)}${visit.geo.isp ? `<br><span style="color:${BRAND.muted};font-size:12px;">${esc(visit.geo.isp)}</span>` : ""}`) : ""}
      ${infoRow("Device", esc(describeAgent(visit.userAgent)) + (visit.device?.screen ? ` · ${esc(visit.device.screen)}` : ""))}
      ${infoRow("Source", esc(visit.referrer || "direct"))}
      ${visitCount > 0 ? infoRow("Visit", `#${visitCount}${visitCount > 1 ? " (returning)" : " (first time)"}`) : ""}
      ${infoRow("Arrived", esc(formatDate(visit.timestamp)))}
    </table>
    ${site ? button(`${site}/admin`, "Open Visitor Log") : ""}
  `;

  const text = `${who} spent ${formatDuration(visit.duration)} on your portfolio.\n\nSections read: ${sections.join(", ") || "top of page only"}\n${where ? `Location: ${where}${visit.geo?.isp ? ` (${visit.geo.isp})` : ""}\n` : ""}Device: ${describeAgent(visit.userAgent)}\nSource: ${visit.referrer || "direct"}\nArrived: ${formatDate(visit.timestamp)}`;

  return {
    subject,
    text,
    html: layout({
      preheader: `Read: ${sections.join(", ") || "top of page"}`,
      eyebrow: "Visit summary",
      title: known ? `${known.name}'s visit` : "Visit summary",
      body,
    }),
  };
}

function miniMarkdown(text) {
  const lines = esc(text).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").split(/\r?\n/);
  let html = "";
  let inList = false;
  for (const raw of lines) {
    const line = raw.trim();
    const bullet = line.match(/^[-*•]\s+(.*)/);
    if (bullet) {
      if (!inList) { html += `<ul style="margin:0 0 12px;padding-left:20px;">`; inList = true; }
      html += `<li style="margin:0 0 8px;line-height:1.6;">${bullet[1]}</li>`;
      continue;
    }
    if (inList) { html += "</ul>"; inList = false; }
    if (line) html += `<p style="margin:0 0 12px;line-height:1.6;">${line.replace(/^#+\s*/, "")}</p>`;
  }
  return inList ? `${html}</ul>` : html;
}

function statTile(value, label, color) {
  return `<td width="33%" style="padding:6px;">
    <div style="border:1px solid ${BRAND.border};border-radius:14px;padding:16px 8px;text-align:center;">
      <div style="font-size:26px;font-weight:800;color:${color};line-height:1;">${value}</div>
      <div style="margin-top:6px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${BRAND.muted};">${label}</div>
    </div>
  </td>`;
}

export function dailyBriefingEmail({ date, summary, counts }) {
  const site = siteUrl();
  const pretty = new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const subject = `Your portfolio today: ${counts.visits} visit${counts.visits === 1 ? "" : "s"}, ${counts.messages} message${counts.messages === 1 ? "" : "s"}`;
  const body = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 -6px 20px;">
      <tr>
        ${statTile(counts.visits, "Visits", BRAND.primary)}
        ${statTile(counts.messages, "Messages", BRAND.secondary)}
        ${statTile(counts.chats, "AI chats", "#0ea5e9")}
      </tr>
    </table>
    <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${BRAND.muted};margin-bottom:10px;">✨ AI briefing</div>
    <div style="font-size:15px;color:${BRAND.text};">
      ${summary ? miniMarkdown(summary) : `<p style="margin:0;color:${BRAND.muted};">The AI summary couldn't be generated this time — the numbers above are from your database.</p>`}
    </div>
    ${site ? `<div style="margin-top:24px;">${button(`${site}/admin`, "Open Admin Panel")}</div>` : ""}
  `;
  return {
    subject,
    text: `Portfolio briefing — ${pretty}\n\nVisits: ${counts.visits} · Messages: ${counts.messages} · AI chats: ${counts.chats}\n\n${summary || "AI summary unavailable."}`,
    html: layout({
      preheader: `${counts.visits} visits · ${counts.messages} messages · ${counts.chats} AI chats in the last 24 hours`,
      eyebrow: "Daily briefing",
      title: pretty,
      body,
      footerNote: "Sent every evening with the last 24 hours of real activity.",
    }),
  };
}

export function replyEmail({ msg, body }) {
  const site = siteUrl();
  const firstName = String(msg.name).split(/\s+/)[0] || msg.name;
  const subject = `Re: Your message to ${OWNER.name}`;
  const html = layout({
    preheader: String(body).slice(0, 110),
    eyebrow: "Reply",
    title: `Hi ${firstName}, thanks for reaching out`,
    body: `
      <div style="font-size:15px;line-height:1.75;color:${BRAND.text};">${multiline(body)}</div>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
        <tr>
          <td style="width:4px;background:${BRAND.primary};background-image:linear-gradient(${BRAND.primary},${BRAND.secondary});border-radius:4px;"></td>
          <td style="padding-left:14px;">
            <div style="font-weight:700;font-size:15px;color:${BRAND.text};">${OWNER.name}</div>
            <div style="font-size:13px;color:${BRAND.muted};">${OWNER.title}</div>
          </td>
        </tr>
      </table>
      ${site ? `<div style="margin-top:20px;">${button(site, "Visit my portfolio")}</div>` : ""}
      <div style="margin-top:32px;padding-top:20px;border-top:1px solid ${BRAND.border};">
        <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${BRAND.muted};">Your message · ${esc(formatDate(msg.timestamp))}</div>
        ${quoteBox(`<span style="color:${BRAND.muted};">${multiline(msg.message)}</span>`, BRAND.border)}
      </div>
    `,
    footerNote: "You can reply to this email directly.",
  });
  const text = `Hi ${firstName},\n\n${body}\n\n— ${OWNER.name}\n${OWNER.title}${site ? `\n${site}` : ""}\n\n----- Your message (${formatDate(msg.timestamp)}) -----\n${msg.message}`;
  return { subject, html, text };
}
