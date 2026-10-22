import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiX, FiCopy, FiCheck, FiGlobe, FiWifi, FiMonitor, FiMaximize, FiType, FiClock, FiMapPin, FiMessageSquare, FiCpu, FiMail } from "react-icons/fi";
import { fetchVisitorProfile } from "../../lib/api";
import { Avatar } from "./shared";
import {
  describeAgent, describeSource, displayIp, flagEmoji, formatDuration, formatGeo, fullDate, timeAgo, SECTION_LABELS,
} from "./format";

function CopyIp({ ip }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(ip);
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        } catch { /* clipboard unavailable */ }
      }}
      className="inline-flex items-center gap-1.5 rounded-lg bg-surface px-2 py-1 font-mono text-xs text-text transition hover:bg-primary/10 hover:text-primary"
      title="Copy IP"
    >
      {displayIp(ip)} {copied ? <FiCheck size={11} /> : <FiCopy size={11} />}
    </button>
  );
}

function Detail({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-white p-3">
      <span className="mt-0.5 rounded-lg bg-primary/10 p-1.5 text-primary">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</div>
        <div className="mt-0.5 break-words text-sm text-text">{children || <span className="text-muted">Unknown</span>}</div>
      </div>
    </div>
  );
}

function Tile({ value, label, color }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-3 text-center">
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}

export default function VisitorDrawer({ token, target, onClose, onError }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchVisitorProfile(token, target)
      .then((p) => { if (!cancelled) setProfile(p); })
      .catch((err) => { if (!cancelled) { onError(err); onClose(); } });
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { cancelled = true; window.removeEventListener("keydown", onKey); };
  }, [token, target, onClose, onError]);

  const latest = profile?.visits[0];
  const first = profile?.visits[profile.visits.length - 1];
  const agent = latest ? describeAgent(latest.userAgent) : null;
  const sources = profile ? [...new Set(profile.visits.map((v) => describeSource(v.referrer)))] : [];

  return (
    <>
      <motion.div className="fixed inset-0 z-[70] bg-text/30 backdrop-blur-sm" onClick={onClose}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.aside
        role="dialog"
        aria-label="Visitor profile"
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 320 }}
        className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-lg flex-col bg-[#f8f8fc] shadow-2xl"
      >
        <div className="relative overflow-hidden px-5 pb-5 pt-5">
          <div className="absolute inset-0 bg-gradient-to-br from-[#4338ca] via-[#6d28d9] to-[#9333ea]" />
          <div className="absolute inset-0 bg-dots opacity-25" />
          <div className="relative flex items-center gap-3">
            {profile?.identity ? <Avatar name={profile.identity.name} size={48} /> : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-xl text-white">👤</div>
            )}
            <div className="min-w-0 flex-1 text-white">
              <div className="truncate text-lg font-bold">{profile?.identity?.name || "Anonymous visitor"}</div>
              <div className="truncate text-xs text-white/75">
                {profile?.identity?.email || (target.visitorId ? `Browser ID ${target.visitorId.slice(0, 12)}…` : `IP ${displayIp(target.ip)}`)}
              </div>
            </div>
            <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white transition hover:bg-white/25">
              <FiX />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain p-5">
          {!profile ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-surface" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-2">
                <Tile value={profile.visits.length} label="Visits" color="#4f46e5" />
                <Tile value={formatDuration(profile.totalSeconds) || "0s"} label="Time" color="#0ea5e9" />
                <Tile value={profile.messages.length} label="Messages" color="#9333ea" />
                <Tile value={profile.chats.length} label="AI asks" color="#10b981" />
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Detail icon={<FiCpu size={13} />} label="IP address">
                  <span className="flex flex-wrap gap-1.5">{profile.ips.map((ip) => <CopyIp key={ip} ip={ip} />)}</span>
                </Detail>
                <Detail icon={<FiMapPin size={13} />} label="Location">
                  {latest?.geo && <>{flagEmoji(latest.geo.countryCode)} {formatGeo(latest.geo)}</>}
                </Detail>
                <Detail icon={<FiWifi size={13} />} label="Internet provider">{latest?.geo?.isp}</Detail>
                <Detail icon={<FiMonitor size={13} />} label="Device">{agent && `${agent.label}${agent.mobile ? " · Mobile" : " · Desktop"}`}</Detail>
                <Detail icon={<FiMaximize size={13} />} label="Screen">{latest?.device?.screen}</Detail>
                <Detail icon={<FiType size={13} />} label="Language">{latest?.device?.language}</Detail>
                <Detail icon={<FiGlobe size={13} />} label="Timezone">{latest?.device?.timezone}</Detail>
                <Detail icon={<FiClock size={13} />} label="First / last seen">
                  {first && <>{fullDate(first.timestamp)}<br /><span className="text-muted">latest {timeAgo(latest.timestamp)}</span></>}
                </Detail>
              </div>

              {sources.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-muted">Came from:</span>
                  {sources.map((s) => <span key={s} className="rounded-full bg-white px-2.5 py-1 font-medium text-text shadow-sm">{s}</span>)}
                </div>
              )}

              <section>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Visit timeline</h4>
                <ol className="relative space-y-3 border-l-2 border-primary/20 pl-4">
                  {profile.visits.map((v) => (
                    <li key={v.id} className="relative">
                      <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-primary to-primary-2 ring-4 ring-[#f8f8fc]" />
                      <div className="rounded-xl border border-border/70 bg-white p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-text">{fullDate(v.timestamp)}</span>
                          <span className="text-muted">{describeSource(v.referrer)}{v.duration ? ` · ${formatDuration(v.duration)}` : ""}</span>
                        </div>
                        {v.sections?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {v.sections.map((s) => <span key={s} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{SECTION_LABELS[s] || s}</span>)}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                  {profile.visits.length === 0 && <li className="text-sm text-muted">No visits recorded.</li>}
                </ol>
              </section>

              {profile.messages.length > 0 && (
                <section>
                  <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted"><FiMail size={12} /> Messages</h4>
                  <div className="space-y-2">
                    {profile.messages.map((m) => (
                      <div key={m.id} className="rounded-xl border border-border/70 bg-white p-3 text-sm">
                        <div className="mb-1 flex justify-between gap-2 text-[11px] text-muted">
                          <span>{fullDate(m.timestamp)}</span>
                          <span className={m.replies.length ? "font-semibold text-emerald-600" : "font-semibold text-amber-600"}>{m.replies.length ? "Replied" : "Needs reply"}</span>
                        </div>
                        <p className="whitespace-pre-wrap break-words text-text/85">{m.message}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {profile.chats.length > 0 && (
                <section>
                  <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted"><FiMessageSquare size={12} /> Asked your AI</h4>
                  <div className="space-y-2">
                    {profile.chats.map((c) => (
                      <details key={c.id} className="group rounded-xl border border-border/70 bg-white p-3 text-sm">
                        <summary className="cursor-pointer list-none">
                          <div className="text-[11px] text-muted">{fullDate(c.timestamp)}</div>
                          <div className="font-medium text-text">“{c.question}”</div>
                        </summary>
                        <p className="mt-2 whitespace-pre-wrap break-words border-t border-border/60 pt-2 text-xs leading-relaxed text-muted">{c.answer}</p>
                      </details>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </motion.aside>
    </>
  );
}
