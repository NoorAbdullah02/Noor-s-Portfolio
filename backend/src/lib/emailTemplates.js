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

export function visitNotificationEmail(record) {
  const site = siteUrl();
  const subject = "New visitor on your portfolio";
  const body = `
    <p style="margin:0 0 20px;font-size:15px;color:${BRAND.muted};">Someone just opened your portfolio.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${infoRow("Page", esc(record.path))}
      ${infoRow("Device", esc(describeAgent(record.userAgent)))}
      ${infoRow("Referrer", esc(record.referrer || "direct"))}
      ${infoRow("IP", `<span style="font-family:${BRAND.mono};font-size:13px;">${esc(record.ip)}</span>`)}
      ${infoRow("Time", esc(formatDate(record.timestamp)))}
    </table>
    ${site ? button(`${site}/admin`, "Open Visitor Log") : ""}
  `;
  const text = `Someone just opened your portfolio.\n\nPage: ${record.path}\nDevice: ${describeAgent(record.userAgent)}\nReferrer: ${record.referrer}\nIP: ${record.ip}\nTime: ${formatDate(record.timestamp)}`;
  return {
    subject,
    text,
    html: layout({
      preheader: `${describeAgent(record.userAgent)} · ${record.referrer || "direct"}`,
      eyebrow: "Visitor alert",
      title: "You have a new visitor",
      body,
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
