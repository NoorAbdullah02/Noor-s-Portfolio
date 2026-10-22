const cache = new Map();
const TTL_MS = 24 * 60 * 60 * 1000;

const isPrivate = (ip) =>
  !ip || ip === "unknown" || ip === "::1" || ip.startsWith("127.") || ip.startsWith("::ffff:127.") ||
  ip.startsWith("10.") || ip.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
  ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80");

export async function lookupIp(rawIp) {
  const ip = String(rawIp || "").replace(/^::ffff:/, "");
  if (isPrivate(ip)) return null;

  const cached = cache.get(ip);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.geo;

  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=success,country,country_code,region,city,connection`, {
      signal: AbortSignal.timeout(3500),
    });
    const data = await res.json();
    if (!data.success) return null;
    const geo = {
      country: data.country || "",
      countryCode: data.country_code || "",
      region: data.region || "",
      city: data.city || "",
      isp: data.connection?.isp || data.connection?.org || "",
    };
    cache.set(ip, { geo, at: Date.now() });
    if (cache.size > 5000) cache.delete(cache.keys().next().value);
    return geo;
  } catch {
    return null;
  }
}

export function formatGeo(geo) {
  if (!geo) return "";
  return [geo.city, geo.region !== geo.city ? geo.region : "", geo.country].filter(Boolean).join(", ");
}

export function flagEmoji(code) {
  if (!/^[A-Z]{2}$/i.test(code || "")) return "";
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}
