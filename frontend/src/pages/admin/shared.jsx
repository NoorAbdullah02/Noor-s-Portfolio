import { FiClock, FiUsers, FiSmartphone, FiMonitor } from "react-icons/fi";
import { gradientFor, flagEmoji, formatGeo, formatDuration, displayIp, SECTION_LABELS } from "./format";

export function Avatar({ name, size = 40 }) {
  const [c1, c2] = gradientFor(name);
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size, height: size, fontSize: size * 0.4,
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        boxShadow: `0 6px 16px -6px ${c1}99`,
      }}
    >
      {(name || "?").trim().charAt(0).toUpperCase()}
    </div>
  );
}

export function Location({ v }) {
  if (v.geo) {
    return (
      <span className="inline-flex min-w-0 items-center gap-1.5" title={v.geo.isp || ""}>
        <span className="text-base leading-none">{flagEmoji(v.geo.countryCode)}</span>
        <span className="truncate">{formatGeo(v.geo)}</span>
      </span>
    );
  }
  return <span className="text-muted/70">{displayIp(v.ip) === "localhost" ? "Local test" : "Unknown"}</span>;
}

export function Engagement({ v }) {
  const time = formatDuration(v.duration);
  const sections = (v.sections || []).map((s) => SECTION_LABELS[s] || s);
  if (!time && !sections.length) return <span className="text-muted/70">—</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-1" title={sections.join(", ")}>
      {time && <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent"><FiClock size={10} />{time}</span>}
      {sections.length > 0 && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">{sections.length} section{sections.length > 1 ? "s" : ""}</span>}
    </span>
  );
}

export function VisitorBadge({ v }) {
  if (v.visitor) {
    return (
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar name={v.visitor.name} size={32} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-text">{v.visitor.name}</div>
          <div className="truncate text-[11px] text-muted">{v.visitor.email}</div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-surface text-muted">
        {v.isBot ? "🤖" : <FiUsers size={14} />}
      </div>
      <div>
        <div className="text-sm font-medium text-text/80">{v.isBot ? "Bot / crawler" : "Anonymous"}</div>
        <div className="text-[11px] text-muted">{v.visitorId ? `ID ${v.visitorId.slice(0, 6)}` : "No ID"}</div>
      </div>
    </div>
  );
}

export function VisitTag({ count }) {
  return count > 1 ? (
    <span className="inline-flex items-center rounded-full bg-primary-2/10 px-2 py-0.5 text-[10px] font-bold text-primary-2">Returning ×{count}</span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">New</span>
  );
}

export function DeviceIcon({ mobile }) {
  return mobile ? <FiSmartphone size={13} /> : <FiMonitor size={13} />;
}
