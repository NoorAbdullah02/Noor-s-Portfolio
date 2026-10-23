import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiDownload, FiExternalLink, FiX } from "react-icons/fi";
import { profile } from "../data/portfolioData";
import { onCvPreviewOpen } from "../lib/cvPreview";

const PREVIEW_IMAGE = profile.resumeUrl.replace(/\.pdf$/i, ".png");

export default function CvPreview() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const closeRef = useRef(null);
  const lastFocus = useRef(null);

  useEffect(() => onCvPreviewOpen(() => {
    lastFocus.current = document.activeElement;
    setOpen(true);
  }), []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    const focusId = setTimeout(() => closeRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      clearTimeout(focusId);
      lastFocus.current?.focus?.();
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-[#0b0b1a]/70 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${profile.name} — CV preview`}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="flex h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-[#f3f3f8] shadow-2xl sm:h-[90vh] sm:rounded-3xl"
          >
            <div className="flex flex-shrink-0 items-center gap-3 border-b border-border bg-white px-4 py-3 sm:px-5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-text">Curriculum Vitae</p>
                <p className="truncate text-xs text-muted">{profile.name} · PDF, 1 page</p>
              </div>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-semibold text-text transition-colors hover:border-text/30 sm:inline-flex"
              >
                <FiExternalLink size={13} /> Open
              </a>
              <a
                href={profile.resumeUrl}
                download
                className="inline-flex items-center gap-1.5 rounded-full bg-text px-4 py-2 text-xs font-semibold text-white transition-shadow hover:shadow-lg hover:shadow-text/20"
              >
                <FiDownload size={13} /> Download
              </a>
              <button
                ref={closeRef}
                onClick={() => setOpen(false)}
                aria-label="Close preview"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-text"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6">
              {!loaded && (
                <div className="mx-auto aspect-[210/297] w-full max-w-[620px] animate-pulse rounded-lg bg-white shadow-sm" />
              )}
              <img
                src={PREVIEW_IMAGE}
                alt={`${profile.name} CV`}
                onLoad={() => setLoaded(true)}
                className={`mx-auto w-full max-w-[620px] rounded-lg bg-white shadow-xl shadow-text/10 ring-1 ring-black/5 transition-opacity duration-300 ${
                  loaded ? "opacity-100" : "absolute opacity-0"
                }`}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
