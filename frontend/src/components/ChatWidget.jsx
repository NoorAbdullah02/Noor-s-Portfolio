import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCopy, FiCheck, FiRotateCcw, FiX, FiArrowUp, FiCpu, FiCode, FiBriefcase, FiBookOpen, FiMessageCircle } from "react-icons/fi";
import { sendChatMessage } from "../lib/api";
import useMediaQuery from "../hooks/useMediaQuery";
import RichText from "./RichText";

const TIP_KEY = "chat-tip-seen";
const MAX_LEN = 1000;

const SUGGESTIONS = [
  { icon: FiCpu, title: "Top skills", prompt: "What are Noor's strongest skills?", color: ["#4f46e5", "#9333ea"] },
  { icon: FiBookOpen, title: "Research", prompt: "Tell me about Noor's research papers.", color: ["#0ea5e9", "#4f46e5"] },
  { icon: FiCode, title: "Projects", prompt: "What projects has Noor built?", color: ["#10b981", "#0ea5e9"] },
  { icon: FiBriefcase, title: "Hire Noor", prompt: "How can I hire or collaborate with Noor?", color: ["#f59e0b", "#ef4444"] },
];

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const timeLabel = (ts) => new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });


function Typewriter({ text, onDone, onTick }) {
  const [count, setCount] = useState(0);
  const callbacks = useRef({ onDone, onTick });

  useEffect(() => {
    callbacks.current = { onDone, onTick };
  }, [onDone, onTick]);

  useEffect(() => {
    const step = Math.max(2, Math.ceil(text.length / 90));
    let shown = 0;
    const id = setInterval(() => {
      shown = Math.min(text.length, shown + step);
      setCount(shown);
      callbacks.current.onTick?.();
      if (shown >= text.length) {
        clearInterval(id);
        callbacks.current.onDone?.();
      }
    }, 18);
    return () => clearInterval(id);
  }, [text]);

  return <RichText text={text.slice(0, count)} />;
}

function BotAvatar({ size = 32 }) {
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-2 font-mono font-bold text-white ring-2 ring-white"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      N
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <BotAvatar size={28} />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-border bg-white px-4 py-3.5 shadow-sm">
        {[0, 1, 2].map((i) => (
          <motion.span key={i} className="block h-2 w-2 rounded-full bg-gradient-to-br from-primary to-primary-2"
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }} />
        ))}
      </div>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };
  return (
    <button onClick={copy} className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted transition hover:bg-surface hover:text-primary" aria-label="Copy reply">
      {copied ? <FiCheck size={11} /> : <FiCopy size={11} />}{copied ? "Copied" : "Copy"}
    </button>
  );
}

function Message({ msg, onTyped, onTick, reducedMotion }) {
  const isUser = msg.role === "user";
  if (isUser) {
    return (
      <motion.div initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.22 }}
        className="flex flex-col items-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-gradient-to-br from-primary to-primary-2 px-4 py-2.5 text-[14px] leading-relaxed text-white shadow-lg shadow-primary/20">
          {msg.content}
        </div>
        <span className="mt-1 pr-1 text-[10px] text-muted">{timeLabel(msg.ts)}</span>
      </motion.div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}
      className="group flex items-end gap-2.5">
      <BotAvatar size={28} />
      <div className="min-w-0 max-w-[85%]">
        <div className={`break-words rounded-2xl rounded-bl-md border px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
          msg.error ? "border-red-200 bg-red-50 text-red-600" : "border-border bg-white text-text/85"
        }`}>
          {msg.typing && !reducedMotion
            ? <Typewriter text={msg.content} onDone={() => onTyped(msg.id)} onTick={onTick} />
            : <RichText text={msg.content} />}
        </div>
        <div className="mt-1 flex items-center gap-1 pl-1 text-[10px] text-muted">
          {timeLabel(msg.ts)}
          {!msg.error && !msg.typing && <span className="opacity-0 transition-opacity group-hover:opacity-100 max-sm:opacity-100"><CopyButton text={msg.content} /></span>}
        </div>
      </div>
    </motion.div>
  );
}

const greeting = () => ({
  id: newId(),
  role: "assistant",
  ts: Date.now(),
  content: "Hi! I'm Noor's assistant. Ask me about his skills, research, projects — or how to work with him.",
});

export default function ChatWidget() {
  const isMobile = useMediaQuery("(max-width: 639px)");
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => [greeting()]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const started = messages.some((m) => m.role === "user");

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  useEffect(() => {
    let seen = false;
    try { seen = !!sessionStorage.getItem(TIP_KEY); } catch { /* storage unavailable */ }
    if (seen) return;
    const show = setTimeout(() => setShowTip(true), 5000);
    const hide = setTimeout(() => setShowTip(false), 14000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => { if (!isMobile) inputRef.current?.focus(); }, 320);
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(id); window.removeEventListener("keydown", onKey); };
  }, [open, isMobile]);

  useEffect(() => {
    if (!open || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open, isMobile]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input, open]);

  const toggleOpen = () => {
    setOpen((v) => !v);
    setShowTip(false);
    try { sessionStorage.setItem(TIP_KEY, "1"); } catch { /* storage unavailable */ }
  };

  const markTyped = useCallback((id) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, typing: false } : m)));
  }, []);

  const send = async (text) => {
    const content = text.trim().slice(0, MAX_LEN);
    if (!content || loading) return;
    setInput("");
    const userMsg = { id: newId(), role: "user", content, ts: Date.now() };
    const history = [...messages.filter((m) => !m.error), userMsg];
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const { reply } = await sendChatMessage(
        history.slice(1).slice(-10).map(({ role, content: c }) => ({ role, content: c }))
      );
      setMessages((prev) => [...prev, { id: newId(), role: "assistant", content: reply, ts: Date.now(), typing: true }]);
    } catch (err) {
      const status = err?.response?.status;
      setMessages((prev) => [...prev, {
        id: newId(), role: "assistant", ts: Date.now(), error: true,
        content: status === 429 ? "You're sending messages a bit fast — please wait a moment and try again." : "I couldn't reach the server just now. Please try again in a moment.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([greeting()]);
    setInput("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input);
    }
  };

  const panelMotion = isMobile
    ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" }, transition: { type: "spring", damping: 30, stiffness: 300 } }
    : { initial: { opacity: 0, y: 24, scale: 0.94 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 24, scale: 0.94 }, transition: { duration: 0.28, ease: [0.23, 1, 0.32, 1] } };

  return (
    <>
      <AnimatePresence>
        {showTip && !open && (
          <motion.button
            onClick={toggleOpen}
            initial={{ opacity: 0, x: 12, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 12, scale: 0.9 }}
            className="fixed bottom-7 right-[5.5rem] z-50 hidden items-center gap-2 rounded-2xl rounded-br-sm border border-border bg-white px-4 py-2.5 text-sm font-medium text-text shadow-xl shadow-primary/10 sm:bottom-9 sm:right-[6.5rem] sm:flex"
          >
            Questions? Ask me about Noor
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!(open && isMobile) && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={toggleOpen}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full sm:bottom-6 sm:right-6"
            style={{
              background: "linear-gradient(135deg, #4f46e5, #9333ea)",
              boxShadow: "0 10px 30px -8px rgba(79,70,229,0.6), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
            aria-label={open ? "Close assistant" : "Open assistant"}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={open ? "x" : "chat"} className="relative"
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}>
                {open ? <FiX size={22} color="white" /> : <FiMessageCircle size={23} color="white" strokeWidth={2.2} />}
              </motion.span>
            </AnimatePresence>
            {!open && (
              <motion.span className="pointer-events-none absolute inset-0 rounded-full border-2 border-primary"
                animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            {...panelMotion}
            role="dialog"
            aria-label="Ask about Noor"
            className={`fixed z-[60] flex flex-col overflow-hidden bg-[#fbfbfe] ${
              isMobile ? "inset-0" : "bottom-24 right-6 w-[400px] rounded-[28px]"
            }`}
            style={isMobile ? { height: "100dvh" } : {
              height: "min(620px, calc(100vh - 130px))",
              transformOrigin: "bottom right",
              boxShadow: "0 40px 100px -20px rgba(79,70,229,0.35), 0 0 0 1px rgba(79,70,229,0.10), 0 10px 30px -10px rgba(0,0,0,0.15)",
            }}
          >
            <div className="relative flex-shrink-0 overflow-hidden px-5 pb-5 pt-4" style={{ paddingTop: isMobile ? "max(1rem, env(safe-area-inset-top))" : undefined }}>
              <div className="absolute inset-0 bg-gradient-to-br from-[#4338ca] via-[#6d28d9] to-[#9333ea]" />
              <motion.div className="absolute -left-10 -top-16 h-44 w-44 rounded-full bg-[#38bdf8] opacity-40 blur-3xl"
                animate={{ x: [0, 40, 0], y: [0, 20, 0] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
              <motion.div className="absolute -bottom-20 right-0 h-44 w-44 rounded-full bg-[#ec4899] opacity-35 blur-3xl"
                animate={{ x: [0, -40, 0], y: [0, -10, 0] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }} />
              <div className="absolute inset-0 bg-dots opacity-25" />

              <div className="relative flex items-center gap-3">
                <BotAvatar size={42} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold leading-tight text-white">Ask about Noor</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/75">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                    </span>
                    Online · replies instantly
                  </p>
                </div>
                {started && (
                  <button onClick={reset} title="New chat" aria-label="Start a new chat"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur transition hover:bg-white/25">
                    <FiRotateCcw size={15} />
                  </button>
                )}
                <button onClick={() => setOpen(false)} aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur transition hover:bg-white/25">
                  <FiX size={17} />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5"
              style={{ scrollbarWidth: "thin", scrollbarColor: "#d9dbea transparent" }}>
              {!started ? (
                <motion.div initial="hidden" animate="show" transition={{ staggerChildren: 0.07, delayChildren: 0.1 }}
                  className="flex min-h-full flex-col">
                  <motion.div variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                    className="mb-5 flex flex-col items-center pt-2 text-center">
                    <BotAvatar size={56} />
                    <h3 className="mt-4 text-lg font-bold text-text">Hi there</h3>
                    <p className="mt-1 max-w-[270px] text-sm leading-relaxed text-muted">{messages[0].content.replace(/^Hi! /, "")}</p>
                  </motion.div>
                  <div className="mt-auto grid grid-cols-2 gap-2.5">
                    {SUGGESTIONS.map((s) => (
                      <motion.button key={s.title}
                        variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => send(s.prompt)}
                        className="group rounded-2xl border border-border bg-white p-3.5 text-left shadow-sm transition-shadow hover:shadow-lg hover:shadow-primary/10"
                      >
                        <span className="mb-2.5 inline-flex rounded-xl p-2 text-white" style={{ background: `linear-gradient(135deg, ${s.color[0]}, ${s.color[1]})` }}>
                          <s.icon size={14} />
                        </span>
                        <span className="block text-[13px] font-semibold text-text">{s.title}</span>
                        <span className="mt-0.5 block text-[11px] leading-snug text-muted line-clamp-2">{s.prompt}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-4">
                  {messages.map((m) => (
                    <Message key={m.id} msg={m} onTyped={markTyped} onTick={scrollToBottom} reducedMotion={reducedMotion} />
                  ))}
                  {loading && <TypingIndicator />}
                </div>
              )}
            </div>

            <div className="flex-shrink-0 border-t border-border/70 bg-white/80 px-3 pt-3 backdrop-blur"
              style={{ paddingBottom: isMobile ? "max(0.75rem, env(safe-area-inset-bottom))" : "0.75rem" }}>
              <form onSubmit={(e) => { e.preventDefault(); send(input); }}
                className="flex items-end gap-2 rounded-2xl border border-border bg-white p-1.5 pl-4 shadow-sm transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  maxLength={MAX_LEN}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Ask anything about Noor…"
                  aria-label="Message"
                  className="max-h-[120px] min-w-0 flex-1 resize-none bg-transparent py-2 text-base leading-6 text-text outline-none placeholder:text-muted/70 sm:text-sm"
                />
                <motion.button type="submit" disabled={!input.trim() || loading}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-2 text-white shadow-md shadow-primary/30 transition-opacity disabled:opacity-35 disabled:shadow-none"
                  aria-label="Send">
                  <FiArrowUp size={18} strokeWidth={2.5} />
                </motion.button>
              </form>
              <p className="mt-2 text-center text-[10px] text-muted">Answers can be imperfect — for anything important, use the contact form.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
