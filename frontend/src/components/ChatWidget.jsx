import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sendChatMessage } from "../lib/api";

const BOT_AVATAR = (
  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
    style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))" }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
      <path d="M9 14v1M15 14v1M8 21h8M12 17v4"/>
    </svg>
  </div>
);

const TypingDots = () => (
  <div className="flex gap-1 py-1">
    {[0, 1, 2].map((i) => (
      <motion.div key={i} className="w-2 h-2 rounded-full"
        style={{ background: "var(--color-primary)" }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
      />
    ))}
  </div>
);

const SUGGESTIONS = [
  "What are Noor's top skills?",
  "Tell me about his projects",
  "How can I hire him?",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm Noor's AI assistant. Ask me anything about his skills, projects, or how to work with him! 👋" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
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
      const { reply } = await sendChatMessage(newMessages.filter(m => m.role !== "assistant" || newMessages.indexOf(m) > 0).slice(-10));
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting. Please try again in a moment." }]);
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
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer"
        style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))" }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI chat assistant"
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.25 }}>
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <circle cx="9" cy="10" r="1" fill="white"/><circle cx="12" cy="10" r="1" fill="white"/><circle cx="15" cy="10" r="1" fill="white"/>
            </svg>
          )}
        </motion.div>
        {/* Pulse ring */}
        {!open && (
          <motion.div className="absolute inset-0 rounded-full"
            style={{ border: "2px solid var(--color-primary)" }}
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              boxShadow: "0 25px 60px -10px rgba(79,70,229,0.25), 0 0 0 1px rgba(79,70,229,0.08)"
            }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-3"
              style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))" }}>
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/>
                  <path d="M9 14v1M15 14v1M8 21h8M12 17v4"/>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm text-white leading-tight">Noor's AI Assistant</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse"/>
                  <p className="text-xs text-white/80">Powered by Groq · Llama 3</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="ml-auto text-white/70 hover:text-white transition-colors cursor-pointer" aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto px-4 py-3 flex flex-col gap-3"
              style={{ scrollbarWidth: "thin", scrollbarColor: "var(--color-border) transparent" }}>
              {messages.map((msg, i) => (
                <motion.div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                  {msg.role === "assistant" && BOT_AVATAR}
                  <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-tr-sm text-white"
                      : "rounded-tl-sm"
                  }`} style={msg.role === "user"
                    ? { background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))", color: "white" }
                    : { background: "var(--color-bg)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div className="flex gap-2 flex-row"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {BOT_AVATAR}
                  <div className="rounded-2xl rounded-tl-sm px-3 py-2"
                    style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                    <TypingDots />
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div className="px-4 pb-2 flex gap-2 flex-wrap"
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}>
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => sendMessage(s)}
                      className="text-xs rounded-full px-3 py-1 border transition-all cursor-pointer hover:scale-[1.02]"
                      style={{ borderColor: "var(--color-primary)", color: "var(--color-primary)", background: "transparent" }}>
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <form onSubmit={handleSubmit} className="px-3 pb-3">
              <div className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: "var(--color-bg)", border: "1.5px solid var(--color-border)" }}>
                <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about Noor..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
                  style={{ color: "var(--color-text)" }}
                  disabled={loading} />
                <button type="submit" disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2))" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
