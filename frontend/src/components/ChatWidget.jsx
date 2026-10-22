import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sendChatMessage } from "../lib/api";

const SUGGESTIONS = [
  { icon: "⚡", text: "Top skills?" },
  { icon: "🚀", text: "Best projects?" },
  { icon: "💼", text: "Available to hire?" },
  { icon: "📄", text: "Research papers?" },
];

function BotAvatar({ size = 32 }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full animate-spin-slow opacity-60"
        style={{ background: "conic-gradient(from 0deg, var(--color-primary), var(--color-primary-2), var(--color-accent), var(--color-primary))" }} />
      <div className="absolute inset-[2px] rounded-full flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))" }}>
        <svg width={size * 0.44} height={size * 0.44} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M12 2a3 3 0 0 1 3 3v3H9V5a3 3 0 0 1 3-3z" />
          <circle cx="9" cy="16" r="1" fill="white" stroke="none" />
          <circle cx="15" cy="16" r="1" fill="white" stroke="none" />
        </svg>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span key={i}
          className="block w-2 h-2 rounded-full"
          style={{ background: "var(--color-primary)" }}
          animate={{ scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm Noor's AI assistant 👋\nAsk me anything about his skills, research, projects, or how to collaborate with him." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 320);
      setUnread(0);
    }
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const sendMessage = async (text) => {
    const content = text.trim();
    if (!content || loading) return;
    setInput("");
    setShowSuggestions(false);
    const newMessages = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const { reply } = await sendChatMessage(
        newMessages.filter((m, idx) => m.role !== "assistant" || idx > 0).slice(-10)
      );
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(input); };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))",
          boxShadow: "0 8px 32px -8px color-mix(in srgb, var(--color-primary) 55%, transparent), 0 2px 8px rgba(0,0,0,0.15)"
        }}
        whileHover={{ scale: 1.1, boxShadow: "0 12px 40px -8px color-mix(in srgb, var(--color-primary) 70%, transparent)" }}
        whileTap={{ scale: 0.93 }}
        aria-label="Open AI assistant"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={open ? "close" : "open"}
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}>
            {open ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <circle cx="9" cy="10" r="1" fill="white" stroke="none" />
                <circle cx="12" cy="10" r="1" fill="white" stroke="none" />
                <circle cx="15" cy="10" r="1" fill="white" stroke="none" />
              </svg>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Pulse rings */}
        {!open && (
          <>
            <motion.div className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: "2px solid var(--color-primary)" }}
              animate={{ scale: [1, 1.55], opacity: [0.5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} />
            <motion.div className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: "2px solid var(--color-primary)" }}
              animate={{ scale: [1, 1.55], opacity: [0.5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.6 }} />
          </>
        )}

        {/* Unread badge */}
        <AnimatePresence>
          {unread > 0 && !open && (
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center"
            >{unread}</motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] rounded-3xl overflow-hidden flex flex-col"
            style={{
              boxShadow: "0 32px 80px -16px rgba(79,70,229,0.3), 0 0 0 1px rgba(79,70,229,0.12), 0 8px 24px rgba(0,0,0,0.12)",
              maxHeight: "min(580px, 85vh)",
              background: "var(--color-bg)",
            }}
            initial={{ opacity: 0, y: 24, scale: 0.93, transformOrigin: "bottom right" }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.93 }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Header */}
            <div className="relative px-5 py-4 flex items-center gap-3 flex-shrink-0 overflow-hidden">
              {/* Mesh gradient bg */}
              <div className="absolute inset-0"
                style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-2) 60%, var(--color-accent) 100%)" }} />
              <div className="absolute inset-0 opacity-20 bg-dots" />
              {/* Glow orb */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />

              <div className="relative">
                <BotAvatar size={40} />
              </div>

              <div className="relative flex-1 min-w-0">
                <p className="font-bold text-sm text-white leading-tight">Noor's AI Assistant</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse flex-shrink-0" />
                  <p className="text-xs text-white/75 truncate">Always online · Powered by Groq</p>
                </div>
              </div>

              <button onClick={() => setOpen(false)}
                className="relative ml-auto w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all cursor-pointer flex-shrink-0"
                aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 min-h-0"
              style={{ scrollbarWidth: "thin", scrollbarColor: "var(--color-border) transparent" }}>

              {messages.map((msg, i) => (
                <motion.div key={i}
                  className={`flex gap-2.5 items-end ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}>

                  {msg.role === "assistant" && <BotAvatar size={28} />}

                  <div className={`max-w-[80%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "rounded-2xl rounded-br-sm text-white"
                      : "rounded-2xl rounded-bl-sm"
                  }`} style={msg.role === "user" ? {
                    background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))",
                    boxShadow: "0 4px 12px -4px color-mix(in srgb, var(--color-primary) 40%, transparent)"
                  } : {
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)"
                  }}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div className="flex gap-2.5 items-end"
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  <BotAvatar size={28} />
                  <div className="rounded-2xl rounded-bl-sm px-4 py-3"
                    style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                    <TypingDots />
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  className="px-4 pb-2 flex gap-2 flex-wrap"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}>
                  {SUGGESTIONS.map((s) => (
                    <motion.button key={s.text}
                      onClick={() => sendMessage(s.text)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border font-medium transition-all cursor-pointer"
                      style={{
                        borderColor: "var(--color-primary)",
                        color: "var(--color-primary)",
                        background: "color-mix(in srgb, var(--color-primary) 6%, transparent)"
                      }}>
                      <span>{s.icon}</span>{s.text}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div className="h-px mx-4 flex-shrink-0" style={{ background: "var(--color-border)" }} />

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 flex-shrink-0">
              <div className="relative flex items-center gap-2 rounded-2xl px-4 py-2.5 transition-all"
                style={{
                  background: "var(--color-surface)",
                  border: "1.5px solid var(--color-border)",
                }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about Noor…"
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "var(--color-text)" }}
                  disabled={loading}
                />
                <motion.button
                  type="submit"
                  disabled={!input.trim() || loading}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-opacity cursor-pointer disabled:opacity-35"
                  style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
