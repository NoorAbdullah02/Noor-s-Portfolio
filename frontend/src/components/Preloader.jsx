import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SESSION_KEY = "portfolio-preloaded";

export default function Preloader() {
  const [visible, setVisible] = useState(() => {
    try {
      return !sessionStorage.getItem(SESSION_KEY);
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
    }, 900);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-bg"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-4"
          >
            <span className="font-mono text-2xl font-semibold">
              <span className="text-gradient">&lt;Noor</span>
              <span className="text-text">.dev/&gt;</span>
            </span>
            <span className="h-[3px] w-28 overflow-hidden rounded-full bg-border">
              <motion.span
                className="block h-full w-1/2 rounded-full bg-gradient-to-r from-primary to-primary-2"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
