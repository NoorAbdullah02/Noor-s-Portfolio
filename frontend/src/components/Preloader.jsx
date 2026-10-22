import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SESSION_KEY = "portfolio-preloaded";
const DURATION = 1100;

export default function Preloader() {
  const [visible, setVisible] = useState(() => {
    try {
      return !sessionStorage.getItem(SESSION_KEY);
    } catch {
      return true;
    }
  });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) return;
    document.documentElement.style.overflow = "hidden";
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATION);
      setProgress(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setVisible(false);
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch { /* storage unavailable */ }
      }
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.style.overflow = "";
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#0b0b1a]"
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] max-w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 blur-3xl" />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.45 }}
            className="relative flex flex-col items-center gap-6"
          >
            <span className="font-mono text-3xl font-bold sm:text-4xl">
              <span className="text-gradient">&lt;Noor</span>
              <span className="text-white">.dev/&gt;</span>
            </span>
            <div className="flex w-56 items-center gap-4">
              <span className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-primary-2 to-accent"
                  style={{ width: `${progress}%` }}
                />
              </span>
              <span className="w-10 text-right font-mono text-xs tabular-nums text-white/60">{progress}%</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
