import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiLock, FiLogOut, FiRefreshCw, FiUsers, FiEye, FiClock, FiInbox, FiMail, FiPhone,
  FiSend, FiTrash2, FiArrowLeft, FiSearch, FiCheck, FiCheckCircle, FiAlertCircle,
  FiExternalLink, FiCornerUpLeft, FiEyeOff, FiMessageSquare, FiX, FiBarChart2, FiEdit3,
} from "react-icons/fi";
import {
  adminLogin, fetchVisits, fetchMessages, fetchChats, markMessageRead, replyToMessage, deleteMessage, suggestReplies,
} from "../lib/api";
import { Avatar } from "./admin/shared";
import { timeAgo, fullDate } from "./admin/format";
import VisitorTable from "./admin/VisitorTable";
import VisitorDrawer from "./admin/VisitorDrawer";
import ChatLog from "./admin/ChatLog";
import AdminAi from "./admin/AdminAi";

const TOKEN_KEY = "portfolio-admin-token";
const POLL_MS = 30000;

const QUICK_REPLIES = [
  "Thank you so much for reaching out! ",
  "I'd be happy to discuss this further. Could you share a few more details about ",
  "Thanks for your interest! I'm currently available — let's set up a quick call. ",
];

function StatCard({ icon, label, value, accent, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-white/80 p-3.5 backdrop-blur last:col-span-2 sm:p-5 lg:last:col-span-1"
    >
      <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: `linear-gradient(90deg, ${accent[0]}, ${accent[1]})` }} />
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-25"
        style={{ background: accent[0] }} />
      <div className="relative flex items-center gap-3 sm:gap-4">
        <span className="flex-shrink-0 rounded-xl p-2.5 text-white sm:p-3" style={{ background: `linear-gradient(135deg, ${accent[0]}, ${accent[1]})` }}>
          {icon}
        </span>
        <div className="min-w-0">
          <div className="text-xl font-bold tabular-nums text-text sm:text-2xl">{value}</div>
          <div className="text-[11px] leading-tight text-muted sm:text-xs">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}

function Toast({ toast }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          className={`fixed bottom-6 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-medium text-white shadow-2xl ${
            toast.type === "error" ? "bg-red-500" : "bg-text"
          }`}
        >
          {toast.type === "error" ? <FiAlertCircle /> : <FiCheckCircle className="text-green-400" />}
          {toast.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LoginForm({ onSubmit, error, loading }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg bg-dots px-6">
      <div className="pointer-events-none absolute -left-32 -top-32 h-[28rem] w-[28rem] animate-blob rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[28rem] w-[28rem] animate-blob rounded-full bg-primary-2/15 blur-3xl [animation-delay:5s]" />

      <motion.form
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onSubmit={(e) => { e.preventDefault(); onSubmit(password); }}
        className="glass relative w-full max-w-sm overflow-hidden rounded-3xl p-8"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary-2 to-accent" />
        <div className="mb-8 flex flex-col items-center text-center">
          <motion.span
            initial={{ rotate: -12, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.15 }}
            className="mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary-2 p-4 text-white glow-md"
          >
            <FiLock size={22} />
          </motion.span>
          <div className="font-mono text-lg font-bold">
            <span className="text-gradient">&lt;Noor</span><span className="text-text">.dev/&gt;</span>
          </div>
          <p className="mt-1 text-sm text-muted">Admin dashboard</p>
        </div>

        <div className="relative">
          <input
            type={show ? "text" : "password"}
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full rounded-xl border border-border bg-white/70 px-4 py-3 pr-11 text-base text-text outline-none sm:text-sm transition focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
          <button type="button" onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
            aria-label={show ? "Hide password" : "Show password"}>
            {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex items-center gap-1.5 text-sm text-red-500">
              <FiAlertCircle size={14} /> {error}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={loading || !password}
          className="btn-shine mt-5 w-full rounded-xl bg-gradient-to-r from-primary to-primary-2 px-6 py-3 text-sm font-semibold text-on-accent shadow-lg shadow-primary/25 transition hover:shadow-primary/40 disabled:opacity-60"
        >
          {loading ? "Checking…" : "Sign In"}
        </button>
        <Link to="/" className="mt-5 block text-center text-xs text-muted hover:text-primary">
          ← Back to portfolio
        </Link>
      </motion.form>
    </div>
  );
}

function MessageList({ messages, selectedId, onSelect, query, setQuery, filter, setFilter }) {
  const filters = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "replied", label: "Replied" },
  ];
  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-border p-4">
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email or text…"
            className="w-full rounded-xl border border-border bg-surface/60 py-2.5 pl-10 pr-3 text-base outline-none sm:text-sm transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
          />
        </div>
        <div className="flex gap-1.5">
          {filters.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={`relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                filter === f.id ? "text-white" : "text-muted hover:text-text"
              }`}>
              {filter === f.id && (
                <motion.span layoutId="filter-pill" className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-primary to-primary-2"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.45 }} />
              )}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center text-muted">
            <FiInbox size={32} className="mb-3 opacity-40" />
            <p className="text-sm">No messages here.</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.button
              layout
              key={m.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              onClick={() => onSelect(m.id)}
              className={`relative flex w-full gap-3 border-b border-border/60 px-4 py-4 text-left transition-colors ${
                selectedId === m.id ? "bg-primary/[0.06]" : "hover:bg-surface/60"
              }`}
            >
              {selectedId === m.id && (
                <motion.span layoutId="msg-active" className="absolute inset-y-0 left-0 w-1 rounded-r bg-gradient-to-b from-primary to-primary-2" />
              )}
              <Avatar name={m.name} size={38} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={`truncate text-sm ${m.read ? "font-medium text-text/80" : "font-bold text-text"}`}>{m.name}</span>
                  {m.replies.length > 0 && <FiCornerUpLeft size={12} className="flex-shrink-0 text-green-500" title="Replied" />}
                  <span className="ml-auto flex-shrink-0 text-[11px] text-muted">{timeAgo(m.timestamp)}</span>
                </div>
                <div className="truncate text-xs text-muted">{m.email}</div>
                <p className={`mt-1 line-clamp-2 text-xs leading-relaxed ${m.read ? "text-muted" : "text-text/80"}`}>{m.message}</p>
              </div>
              {!m.read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary shadow-[0_0_8px] shadow-primary" />}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

const TONE_COLORS = {
  Friendly: ["#10b981", "#0ea5e9"],
  Professional: ["#4f46e5", "#9333ea"],
  Short: ["#f59e0b", "#ef4444"],
  Polished: ["#4f46e5", "#9333ea"],
  Warmer: ["#ec4899", "#f59e0b"],
  Concise: ["#0ea5e9", "#14b8a6"],
};

function AiSuggestions({ state, onUse, onRegenerate, onClose }) {
  if (state.status === "idle") return null;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mb-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.05] to-primary-2/[0.06] p-3">
        <div className="mb-2.5 flex items-center gap-2">
          <span className="text-xs font-semibold text-text">
            {state.status === "loading" ? "Writing suggestions…" : state.forDraft ? "Improved versions of your draft" : "Suggested replies"}
          </span>
          <div className="ml-auto flex items-center gap-1">
            {state.status === "ready" && (
              <button onClick={onRegenerate} className="rounded-lg p-1.5 text-muted transition hover:bg-white hover:text-primary" title="Regenerate">
                <FiRefreshCw size={12} />
              </button>
            )}
            <button onClick={onClose} className="rounded-lg p-1.5 text-muted transition hover:bg-white hover:text-text" title="Close">
              <FiX size={13} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {state.status === "loading" && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 rounded-xl border border-border bg-white p-3">
              <div className="h-4 w-16 animate-pulse rounded-full bg-primary/15" />
              <div className="h-2.5 w-full animate-pulse rounded bg-surface" />
              <div className="h-2.5 w-11/12 animate-pulse rounded bg-surface" />
              <div className="h-2.5 w-3/4 animate-pulse rounded bg-surface" />
            </div>
          ))}
          {state.status === "ready" && state.items.map((s, i) => {
            const [c1, c2] = TONE_COLORS[s.tone] || ["#4f46e5", "#9333ea"];
            return (
              <motion.button
                key={`${s.tone}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => onUse(s.body)}
                className="group flex flex-col rounded-xl border border-border bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10"
              >
                <span className="mb-1.5 inline-flex self-start rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
                  style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                  {s.tone}
                </span>
                <span className="line-clamp-5 whitespace-pre-line text-xs leading-relaxed text-text/80">{s.body}</span>
                <span className="mt-2 text-[11px] font-semibold text-primary opacity-70 transition group-hover:opacity-100">Use this reply →</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function MessageDetail({ message, onBack, onReply, onToggleRead, onDelete, onSuggest }) {
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [ai, setAi] = useState({ status: "idle", items: [], forDraft: false });
  const textareaRef = useRef(null);
  const threadEndRef = useRef(null);

  const askAi = async (forDraft = !!draft.trim()) => {
    setAi({ status: "loading", items: [], forDraft });
    const items = await onSuggest(message.id, forDraft ? draft.trim() : "");
    setAi(items ? { status: "ready", items, forDraft } : { status: "idle", items: [], forDraft });
  };

  const useSuggestion = (body) => {
    setDraft(body);
    setAi({ status: "idle", items: [], forDraft: false });
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(body.length, body.length);
    });
  };

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [message.replies.length]);

  const send = async () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    const ok = await onReply(message.id, draft.trim());
    setSending(false);
    if (ok) setDraft("");
  };

  return (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex h-full flex-col"
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4 sm:p-5">
        <button onClick={onBack} className="rounded-lg p-2 text-muted hover:bg-surface hover:text-text lg:hidden" aria-label="Back">
          <FiArrowLeft />
        </button>
        <Avatar name={message.name} size={46} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold text-text">{message.name}</h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <a href={`mailto:${message.email}`} className="inline-flex min-w-0 items-center gap-1 break-all hover:text-primary"><FiMail size={12} className="flex-shrink-0" />{message.email}</a>
            {message.phone && <a href={`tel:${message.phone}`} className="inline-flex items-center gap-1 hover:text-primary"><FiPhone size={12} />{message.phone}</a>}
            <span className="inline-flex items-center gap-1"><FiClock size={12} />{fullDate(message.timestamp)}</span>
          </div>
        </div>
        <div className="flex w-full items-center justify-end gap-1.5 sm:w-auto">
          <button onClick={() => onToggleRead(message.id, !message.read)}
            className="rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted transition hover:border-primary hover:text-primary"
            title={message.read ? "Mark as unread" : "Mark as read"}>
            {message.read ? <span className="inline-flex items-center gap-1.5"><FiEyeOff size={13} />Unread</span> : <span className="inline-flex items-center gap-1.5"><FiCheck size={13} />Read</span>}
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1.5">
              <button onClick={() => onDelete(message.id)} className="rounded-xl bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600">Delete</button>
              <button onClick={() => setConfirmDelete(false)} className="rounded-xl border border-border px-3 py-2 text-xs text-muted hover:text-text">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)}
              className="rounded-xl border border-border p-2 text-muted transition hover:border-red-300 hover:text-red-500" title="Delete">
              <FiTrash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
        <div className="flex gap-3">
          <Avatar name={message.name} size={32} />
          <div className="max-w-[85%]">
            <div className="rounded-2xl rounded-tl-sm border border-border bg-white px-5 py-4 text-sm leading-relaxed text-text shadow-sm whitespace-pre-wrap break-words">
              {message.message}
            </div>
            <div className="mt-1.5 pl-1 text-[11px] text-muted">{fullDate(message.timestamp)}</div>
          </div>
        </div>

        {message.replies.map((r) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-row-reverse gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-2 text-xs font-bold text-white">N</div>
            <div className="flex max-w-[85%] flex-col items-end">
              <div className="rounded-2xl rounded-tr-sm bg-gradient-to-br from-primary to-primary-2 px-5 py-4 text-sm leading-relaxed text-white shadow-lg shadow-primary/20 whitespace-pre-wrap break-words">
                {r.body}
              </div>
              <div className="mt-1.5 inline-flex items-center gap-1 pr-1 text-[11px] text-muted">
                <FiCheckCircle size={11} className="text-green-500" /> Emailed · {fullDate(r.timestamp)}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={threadEndRef} />
      </div>

      <div className="max-h-[75%] overflow-y-auto border-t border-border bg-white/60 p-4 sm:p-5">
        <AnimatePresence>
          {ai.status !== "idle" && (
            <AiSuggestions key="ai" state={ai} onUse={useSuggestion} onRegenerate={() => askAi(ai.forDraft)}
              onClose={() => setAi({ status: "idle", items: [], forDraft: false })} />
          )}
        </AnimatePresence>
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => askAi()}
            disabled={ai.status === "loading"}
            className="btn-shine inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-primary-2 px-3.5 py-1.5 text-[11px] font-semibold text-white shadow-md shadow-primary/25 transition hover:shadow-primary/40 disabled:opacity-60"
          >
            {ai.status === "loading" ? <FiRefreshCw size={11} className="animate-spin" /> : <FiEdit3 size={11} />}
            {draft.trim() ? "Polish my draft" : "Suggest replies"}
          </button>
          {QUICK_REPLIES.map((q) => (
            <button key={q} onClick={() => { setDraft((d) => d + q); textareaRef.current?.focus(); }}
              className="max-w-full truncate rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary transition hover:bg-primary/10">
              {q.trim()}
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-border bg-white transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send(); }}
            rows={4}
            placeholder={`Write your reply to ${message.name.split(" ")[0]}…`}
            className="block w-full resize-none rounded-2xl bg-transparent px-4 pt-3.5 text-base text-text outline-none sm:text-sm"
          />
          <div className="flex items-center justify-between gap-3 px-3 pb-3">
            <span className="hidden text-[11px] text-muted sm:block">
              Sent to <span className="font-medium text-text">{message.email}</span> · Ctrl+Enter to send
            </span>
            <button onClick={send} disabled={!draft.trim() || sending}
              className="btn-shine ml-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-2 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:shadow-primary/40 disabled:opacity-50">
              {sending ? <FiRefreshCw className="animate-spin" size={14} /> : <FiSend size={14} />}
              {sending ? "Sending…" : "Send Reply"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Admin() {
  const [token, setToken] = useState(() => {
    try { return sessionStorage.getItem(TOKEN_KEY) || ""; } catch { return ""; }
  });
  const [visitData, setVisitData] = useState(null);
  const [inbox, setInbox] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("inbox");
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState(null);
  const [chats, setChats] = useState([]);
  const [aiMessages, setAiMessages] = useState([]);
  const [drawer, setDrawer] = useState(null);
  const closeDrawer = useCallback(() => setDrawer(null), []);

  const showToast = useCallback((text, type = "success") => {
    const id = Date.now();
    setToast({ id, text, type });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 3200);
  }, []);

  const signOut = useCallback((message = "") => {
    try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
    setToken("");
    setVisitData(null);
    setInbox(null);
    setError(message);
  }, []);

  const handleError = useCallback((err, fallback) => {
    if (err?.response?.status === 401) signOut("Session expired. Please sign in again.");
    else showToast(err?.response?.data?.message || fallback, "error");
  }, [signOut, showToast]);

  const drawerError = useCallback((err) => handleError(err, "Couldn't load this visitor."), [handleError]);

  const load = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    try {
      const [v, m, c] = await Promise.all([fetchVisits(token), fetchMessages(token), fetchChats(token)]);
      setVisitData(v);
      setInbox(m);
      setChats(c);
    } catch (err) {
      if (!silent) handleError(err, "Couldn't load dashboard data.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token, handleError]);

  useEffect(() => {
    load();
    const id = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  const handleLogin = async (password) => {
    setLoading(true);
    setError("");
    try {
      await adminLogin(password);
      try { sessionStorage.setItem(TOKEN_KEY, password); } catch { /* storage unavailable */ }
      setToken(password);
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't sign in.");
    } finally {
      setLoading(false);
    }
  };

  const updateMessage = (updated) =>
    setInbox((prev) => {
      if (!prev) return prev;
      const messages = prev.messages.map((m) => (m.id === updated.id ? updated : m));
      return {
        messages,
        stats: {
          total: messages.length,
          unread: messages.filter((m) => !m.read).length,
          replied: messages.filter((m) => m.replies.length > 0).length,
        },
      };
    });

  const handleSelect = async (id) => {
    setSelectedId(id);
    const msg = inbox?.messages.find((m) => m.id === id);
    if (msg && !msg.read) {
      updateMessage({ ...msg, read: true });
      try { await markMessageRead(token, id, true); } catch (err) { handleError(err, "Couldn't mark as read."); }
    }
  };

  const handleToggleRead = async (id, read) => {
    try {
      updateMessage(await markMessageRead(token, id, read));
    } catch (err) {
      handleError(err, "Couldn't update message.");
    }
  };

  const handleReply = async (id, body) => {
    try {
      updateMessage(await replyToMessage(token, id, body));
      showToast("Reply sent by email");
      return true;
    } catch (err) {
      handleError(err, "Couldn't send reply.");
      return false;
    }
  };

  const handleSuggest = async (id, draft) => {
    try {
      return await suggestReplies(token, id, draft);
    } catch (err) {
      handleError(err, "Couldn't get AI suggestions.");
      return null;
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteMessage(token, id);
      setInbox((prev) => {
        const messages = prev.messages.filter((m) => m.id !== id);
        return {
          messages,
          stats: {
            total: messages.length,
            unread: messages.filter((m) => !m.read).length,
            replied: messages.filter((m) => m.replies.length > 0).length,
          },
        };
      });
      setSelectedId(null);
      showToast("Message deleted");
    } catch (err) {
      handleError(err, "Couldn't delete message.");
    }
  };

  const filtered = useMemo(() => {
    const list = inbox?.messages ?? [];
    const q = query.trim().toLowerCase();
    return list.filter((m) => {
      if (filter === "unread" && m.read) return false;
      if (filter === "replied" && m.replies.length === 0) return false;
      if (!q) return true;
      return [m.name, m.email, m.message].some((f) => f?.toLowerCase().includes(q));
    });
  }, [inbox, query, filter]);

  const selected = inbox?.messages.find((m) => m.id === selectedId) || null;

  if (!token) return <LoginForm onSubmit={handleLogin} error={error} loading={loading} />;

  const ready = visitData && inbox;
  const stats = ready ? [
    { icon: <FiInbox size={18} />, label: "Unread messages", value: inbox.stats.unread, accent: ["#4f46e5", "#9333ea"] },
    { icon: <FiMessageSquare size={18} />, label: "Total messages", value: inbox.stats.total, accent: ["#9333ea", "#ec4899"] },
    { icon: <FiCornerUpLeft size={18} />, label: "Replied", value: inbox.stats.replied, accent: ["#10b981", "#0ea5e9"] },
    { icon: <FiEye size={18} />, label: "Total visits", value: visitData.stats.totalVisits, accent: ["#0ea5e9", "#4f46e5"] },
    { icon: <FiUsers size={18} />, label: "Unique visitors", value: visitData.stats.uniqueVisitors, accent: ["#f59e0b", "#ef4444"] },
  ] : [];

  return (
    <div className="relative min-h-screen bg-bg bg-dots text-text">
      <div className="pointer-events-none fixed -left-40 top-0 h-[30rem] w-[30rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none fixed -right-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-primary-2/10 blur-3xl" />

      <header className="sticky top-0 z-40 border-b border-border/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="font-mono text-base font-bold">
            <span className="text-gradient">&lt;Noor</span><span className="text-text">.dev/&gt;</span>
          </Link>
          <span className="rounded-full bg-gradient-to-r from-primary to-primary-2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">Admin</span>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => load()} className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm text-text transition hover:border-primary hover:text-primary" title="Refresh">
              <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} /><span className="hidden sm:inline">Refresh</span>
            </button>
            <Link to="/" className="hidden items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm text-text transition hover:border-primary hover:text-primary sm:inline-flex">
              <FiExternalLink size={14} />View site
            </Link>
            <button onClick={() => signOut()} className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm text-text transition hover:border-red-300 hover:text-red-500" title="Logout">
              <FiLogOut size={14} /><span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, <span className="text-shimmer">Noor</span></h1>
          <p className="mt-1 text-sm text-muted">Messages from your portfolio and who's been visiting.</p>
        </motion.div>

        {!ready ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-[86px] animate-pulse rounded-2xl bg-surface" />
            ))}
          </div>
        ) : (
          <>
            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
              {stats.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
            </div>

            <div className="mb-5 flex max-w-full overflow-x-auto rounded-2xl border border-border bg-white/80 p-1 backdrop-blur sm:inline-flex" style={{ scrollbarWidth: "none" }}>
              {[
                { id: "inbox", label: "Inbox", icon: <FiInbox size={15} />, badge: inbox.stats.unread },
                { id: "visitors", label: "Visitors", icon: <FiUsers size={15} />, badge: visitData.stats.visitsLast24h },
                { id: "chats", label: "Chat Log", icon: <FiMessageSquare size={15} />, badge: chats.length },
                { id: "ai", label: "Insights", icon: <FiBarChart2 size={15} />, badge: 0 },
              ].map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`relative inline-flex flex-shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors ${tab === t.id ? "text-white" : "text-muted hover:text-text"}`}>
                  {tab === t.id && (
                    <motion.span layoutId="admin-tab" className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-primary to-primary-2 shadow-md shadow-primary/25"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.45 }} />
                  )}
                  {t.icon}{t.label}
                  {t.badge > 0 && (
                    <span className={`rounded-full px-1.5 text-[10px] font-bold ${tab === t.id ? "bg-white/25" : "bg-primary/10 text-primary"}`}>{t.badge}</span>
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === "inbox" ? (
                <motion.div key="inbox" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="grid h-[calc(100dvh-300px)] min-h-[560px] grid-cols-1 overflow-hidden rounded-3xl border border-border bg-white/80 shadow-xl shadow-primary/5 backdrop-blur lg:grid-cols-[380px_minmax(0,1fr)]">
                  <div className={`min-h-0 border-border lg:block lg:border-r ${selected ? "hidden" : "block"}`}>
                    <MessageList messages={filtered} selectedId={selectedId} onSelect={handleSelect}
                      query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} />
                  </div>
                  <div className={`min-h-0 lg:block ${selected ? "block" : "hidden"}`}>
                    {selected ? (
                      <MessageDetail key={selected.id} message={selected} onBack={() => setSelectedId(null)} onReply={handleReply}
                        onToggleRead={handleToggleRead} onDelete={handleDelete} onSuggest={handleSuggest} />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center p-10 text-center">
                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="mb-5 rounded-3xl bg-gradient-to-br from-primary/15 to-primary-2/15 p-6 text-primary">
                          <FiMail size={36} />
                        </motion.div>
                        <h3 className="font-semibold text-text">Select a message</h3>
                        <p className="mt-1 max-w-xs text-sm text-muted">Pick a conversation from the list to read it and send a reply straight to the sender's inbox.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : tab === "visitors" ? (
                <motion.div key="visitors" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <VisitorTable visits={visitData.visits} stats={visitData.stats}
                    onOpen={(v) => setDrawer(v.visitorId ? { visitorId: v.visitorId } : { ip: v.ip })} />
                </motion.div>
              ) : tab === "chats" ? (
                <motion.div key="chats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <ChatLog chats={chats} onOpenVisitor={(t) => setDrawer(t.visitorId ? { visitorId: t.visitorId } : { ip: t.ip })} />
                </motion.div>
              ) : (
                <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <AdminAi token={token} messages={aiMessages} setMessages={setAiMessages} onError={handleError} showToast={showToast} />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </main>

      <AnimatePresence>
        {drawer && (
          <VisitorDrawer key={drawer.visitorId || drawer.ip} token={token} target={drawer} onClose={closeDrawer} onError={drawerError} />
        )}
      </AnimatePresence>

      <Toast toast={toast} />
    </div>
  );
}
