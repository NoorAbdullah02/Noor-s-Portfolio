import { FiAlertCircle, FiChevronRight } from "react-icons/fi";
import { describeAgent, describeSource, displayIp, fullDate, timeAgo } from "./format";
import { Location, Engagement, VisitorBadge, VisitTag, DeviceIcon } from "./shared";

export default function VisitorTable({ visits, stats, onOpen }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-full border border-border bg-white/80 px-3 py-1.5 text-muted"><b className="text-text">{stats.visitsLast24h}</b> visits in 24h</span>
        <span className="rounded-full border border-border bg-white/80 px-3 py-1.5 text-muted"><b className="text-text">{stats.returningVisitors ?? 0}</b> returning visitors</span>
        <span className="rounded-full border border-border bg-white/80 px-3 py-1.5 text-muted"><b className="text-text">{stats.identifiedVisitors ?? 0}</b> identified by name</span>
      </div>
      <p className="flex items-start gap-2 rounded-2xl border border-primary/15 bg-primary/[0.04] px-4 py-3 text-xs leading-relaxed text-muted">
        <FiAlertCircle size={14} className="mt-0.5 flex-shrink-0 text-primary" />
        Tap any visitor to see their full profile — IP, location, device, every visit, messages and AI questions. Names appear once a visitor sends you a message.
      </p>

      <div className="space-y-2.5 md:hidden">
        {visits.map((v) => {
          const agent = describeAgent(v.userAgent);
          return (
            <button key={v.id} onClick={() => onOpen(v)} className="block w-full rounded-2xl border border-border bg-white/80 p-4 text-left transition active:scale-[0.99] hover:border-primary/30">
              <div className="flex items-start justify-between gap-3">
                <VisitorBadge v={v} />
                <span className="flex-shrink-0 text-[11px] text-muted" title={fullDate(v.timestamp)}>{timeAgo(v.timestamp)}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-text/80"><Location v={v} /></div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
                <VisitTag count={v.visitCount} />
                <Engagement v={v} />
                <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5"><DeviceIcon mobile={agent.mobile} />{agent.label}</span>
                <span className="rounded-full bg-surface px-2 py-0.5">{describeSource(v.referrer)}</span>
                <span className="rounded-full bg-surface px-2 py-0.5 font-mono">{displayIp(v.ip)}</span>
              </div>
            </button>
          );
        })}
        {visits.length === 0 && <div className="rounded-2xl border border-border bg-white/80 p-10 text-center text-sm text-muted">No visits recorded yet.</div>}
      </div>

      <div className="hidden overflow-hidden rounded-3xl border border-border bg-white/80 backdrop-blur md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface/50 text-[11px] uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Visitor</th>
                <th className="px-5 py-3.5 font-semibold">When</th>
                <th className="px-5 py-3.5 font-semibold">Location</th>
                <th className="px-5 py-3.5 font-semibold">Engagement</th>
                <th className="px-5 py-3.5 font-semibold">Visits</th>
                <th className="px-5 py-3.5 font-semibold">Source</th>
                <th className="px-5 py-3.5 font-semibold">Device</th>
                <th className="px-5 py-3.5 font-semibold">IP</th>
                <th className="w-8 px-3 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {visits.map((v) => {
                const agent = describeAgent(v.userAgent);
                return (
                  <tr key={v.id} onClick={() => onOpen(v)}
                    className={`group cursor-pointer border-b border-border/60 transition-colors last:border-0 hover:bg-primary/[0.04] ${v.visitor ? "bg-primary/[0.02]" : ""}`}>
                    <td className="max-w-[240px] px-5 py-3"><VisitorBadge v={v} /></td>
                    <td className="whitespace-nowrap px-5 py-3 text-muted" title={fullDate(v.timestamp)}>{timeAgo(v.timestamp)}</td>
                    <td className="max-w-[200px] px-5 py-3 text-text/80"><Location v={v} /></td>
                    <td className="px-5 py-3"><Engagement v={v} /></td>
                    <td className="px-5 py-3"><VisitTag count={v.visitCount} /></td>
                    <td className="max-w-[160px] truncate px-5 py-3 text-muted" title={v.referrer}>{describeSource(v.referrer)}</td>
                    <td className="whitespace-nowrap px-5 py-3 text-muted">
                      <span className="inline-flex items-center gap-1.5"><DeviceIcon mobile={agent.mobile} />{agent.label}</span>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted">{displayIp(v.ip)}</td>
                    <td className="px-3 py-3 text-muted opacity-0 transition group-hover:opacity-100"><FiChevronRight /></td>
                  </tr>
                );
              })}
              {visits.length === 0 && (
                <tr><td colSpan={9} className="px-5 py-12 text-center text-muted">No visits recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
