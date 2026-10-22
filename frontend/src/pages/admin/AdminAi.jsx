import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FiArrowUp, FiRotateCcw, FiSend, FiRefreshCw } from "react-icons/fi";
import RichText from "../../components/RichText";
import { askAdminAi, sendBriefingNow } from "../../lib/api";

const PROMPTS = [
  { emoji: "📊", text: "Give me a briefing of today's activity" },
  { emoji: "🔁", text: "Who are my returning visitors?" },
  { emoji: "📬", text: "Which messages still need a reply?" },
  { emoji: "🌍", text: "Where are my visitors coming from?" },
  { emoji: "💬", text: "What did visitors ask the website AI?" },
  { emoji: "⏱️", text: "Which visitors spent the most time and what did they read?" },
];

export default function AdminAi({ token, messages, setMessages, onError, showToast }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingBriefing, setSendingBriefing] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const ask = async (text) => {
    const content = text.trim();
    if (!content || loading) return;
    setInput("");
    const next = [...messages, { role: "user", content }];
    setMessages(next);
    setLoading(true);
    try {
      const reply = await askAdminAi(token, next.filter((m) => !m.error));
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", error: true, content: err?.response?.data?.message || "The AI couldn't answer right now. Please try again." }]);
      if (err?.response?.status === 401) onError(err);
    } finally {
      setLoading(false);
    }
  };

  const emailBriefing = async () => {
    setSendingBriefing(true);
    try {
      await sendBriefingNow(token);
      showToast("Briefing sent to your email");
    } catch (err) {
      onError(err, "Couldn't send the briefing.");
    } finally {
      setSendingBriefing(false);
    }
  };

  return (
    <div className="flex h-[calc(100dvh-300px)] min-h-[560px] flex-col overflow-hidden rounded-3xl border border-border bg-white/80 shadow-xl shadow-primary/5 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-2 text-lg text-white shadow-md shadow-primary/30">✨</div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-text">Ask AI about your website</div>
          <div className="text-xs text-muted">Answers from your real database — visitors, IPs, messages and chats</div>
        </div>
        <div className="flex gap-2">
          {messages.length > 0 && (
            <button onClick={() => setMessages([])} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-white px-3 py-2 text-xs text-muted transition hover:text-text" title="New conversation">
              <FiRotateCcw size={12} /> New
            </button>
          )}
          <button onClick={emailBriefing} disabled={sendingBriefing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10 disabled:opacity-60">
            {sendingBriefing ? <FiRefreshCw size={12} className="animate-spin" /> : <FiSend size={12} />} Email me today's briefing
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col justify-center">
            <p className="mb-4 text-center text-sm text-muted">Ask anything about your visitors and messages — in English or Bangla.</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PROMPTS.map((p, i) => (
                <motion.button key={p.text} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => ask(p.text)}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-white p-3.5 text-left text-sm font-medium text-text transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
                  <span className="text-lg">{p.emoji}</span>{p.text}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={m.role === "user" ? "flex justify-end" : "flex gap-3"}>
                {m.role !== "user" && <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-2 text-sm text-white">✨</div>}
                <div className={m.role === "user"
                  ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-gradient-to-br from-primary to-primary-2 px-4 py-2.5 text-sm text-white shadow-lg shadow-primary/20"
                  : `min-w-0 max-w-[90%] rounded-2xl rounded-tl-md border px-4 py-3 text-sm leading-relaxed ${m.error ? "border-red-200 bg-red-50 text-red-600" : "border-border bg-white text-text/85"}`}>
                  {m.role === "user" ? m.content : <RichText text={m.content} />}
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-2 text-sm text-white">✨</div>
                <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-white px-4 py-3">
                  {[0, 1, 2].map((d) => (
                    <motion.span key={d} className="h-2 w-2 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }} />
                  ))}
                  <span className="ml-1 text-xs text-muted">Reading your database…</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); ask(input); }} className="border-t border-border bg-white/70 p-3 sm:p-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-border bg-white p-1.5 pl-4 transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
            placeholder="e.g. Who visited from Dhaka today? Tell me about IP 103.x.x.x"
            className="max-h-32 min-w-0 flex-1 resize-none bg-transparent py-2 text-base leading-6 outline-none placeholder:text-muted/70 sm:text-sm"
          />
          <button type="submit" disabled={!input.trim() || loading} aria-label="Ask"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-2 text-white shadow-md shadow-primary/30 disabled:opacity-35">
            <FiArrowUp size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
