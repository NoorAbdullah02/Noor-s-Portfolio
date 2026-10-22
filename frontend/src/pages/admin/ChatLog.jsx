import { FiMessageSquare } from "react-icons/fi";
import { Avatar } from "./shared";
import { displayIp, fullDate, timeAgo } from "./format";

export default function ChatLog({ chats, onOpenVisitor }) {
  if (!chats.length) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-border bg-white/80 px-6 py-16 text-center">
        <FiMessageSquare size={30} className="mb-3 text-primary/40" />
        <p className="font-semibold text-text">No AI conversations yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted">When visitors ask your website's AI assistant something, their questions and the AI's answers appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chats.map((c) => (
        <details key={c.id} className="group rounded-2xl border border-border bg-white/80 p-4 backdrop-blur transition open:shadow-lg open:shadow-primary/5">
          <summary className="flex cursor-pointer list-none items-start gap-3">
            {c.visitor ? <Avatar name={c.visitor.name} size={34} /> : (
              <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full bg-surface text-sm">👤</div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-muted">
                <button
                  onClick={(e) => { e.preventDefault(); onOpenVisitor({ visitorId: c.visitorId, ip: c.ip }); }}
                  className="font-semibold text-primary hover:underline"
                >
                  {c.visitor?.name || `Visitor · ${displayIp(c.ip)}`}
                </button>
                <span title={fullDate(c.timestamp)}>{timeAgo(c.timestamp)}</span>
              </div>
              <p className="mt-0.5 break-words text-sm font-medium text-text">“{c.question}”</p>
            </div>
            <span className="mt-1 text-xs text-muted transition group-open:rotate-180">▾</span>
          </summary>
          <div className="mt-3 whitespace-pre-wrap break-words rounded-xl bg-surface/60 p-3 text-xs leading-relaxed text-text/75">{c.answer}</div>
        </details>
      ))}
    </div>
  );
}
