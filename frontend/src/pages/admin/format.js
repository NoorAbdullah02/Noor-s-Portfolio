const AVATAR_GRADIENTS = [
  ["#4f46e5", "#9333ea"], ["#0ea5e9", "#4f46e5"], ["#10b981", "#0ea5e9"],
  ["#f59e0b", "#ef4444"], ["#ec4899", "#9333ea"], ["#14b8a6", "#22c55e"],
];

export function gradientFor(name = "") {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

export function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const fullDate = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function describeAgent(ua = "") {
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\/|Opera/.test(ua) ? "Opera" : /SamsungBrowser/.test(ua) ? "Samsung Internet"
    : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad|iOS/.test(ua) ? "iOS"
    : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Unknown OS";
  const mobile = /Mobile|Android|iPhone|iPad/.test(ua);
  return { label: `${browser} · ${os}`, mobile };
}

export function describeSource(referrer) {
  if (!referrer || referrer === "direct") return "Direct";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host === window.location.hostname) return "Internal";
    if (/google\./.test(host)) return "Google";
    if (/linkedin\./.test(host)) return "LinkedIn";
    if (/facebook\.|fb\./.test(host)) return "Facebook";
    if (/github\./.test(host)) return "GitHub";
    if (/t\.co$|twitter\.|x\.com/.test(host)) return "X / Twitter";
    return host;
  } catch {
    return referrer;
  }
}

export const SECTION_LABELS = {
  home: "Home", about: "About", skills: "Skills", qualification: "Education",
  projects: "Projects", github: "GitHub", contact: "Contact",
};

export const flagEmoji = (code) =>
  /^[A-Z]{2}$/i.test(code || "") ? String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : "";

export const formatGeo = (geo) =>
  geo ? [geo.city, geo.region !== geo.city ? geo.region : "", geo.country].filter(Boolean).join(", ") : "";

export function formatDuration(seconds) {
  const s = Math.round(seconds || 0);
  if (!s) return "";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}m ${s % 60}s` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

export const displayIp = (ip) => (ip === "::1" || ip === "127.0.0.1" || ip === "::ffff:127.0.0.1" ? "localhost" : ip);
