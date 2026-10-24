import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiDownload, FiExternalLink, FiMessageCircle } from "react-icons/fi";
import { profile } from "../data/portfolioData";

const PREVIEW_IMAGE = profile.resumeUrl.replace(/\.pdf$/i, ".png");

export default function CvPage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    document.title = `${profile.name} — CV`;
  }, []);

  return (
    <div className="min-h-screen bg-bg bg-dots px-4 py-8 text-text sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-primary">
            <FiArrowLeft size={15} /> Back to portfolio
          </Link>
          <Link to="/" className="font-mono text-base font-bold">
            <span className="text-gradient">&lt;Noor</span>
            <span className="text-text">.dev/&gt;</span>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden rounded-3xl border border-border bg-white/90 shadow-xl shadow-text/5"
        >
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold text-text">Curriculum Vitae</h1>
              <p className="truncate text-xs text-muted">{profile.name} · PDF, 1 page</p>
            </div>
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-semibold text-text transition-colors hover:border-text/30"
            >
              <FiExternalLink size={13} /> Open PDF
            </a>
            <a
              href={profile.resumeUrl}
              download
              className="inline-flex items-center gap-1.5 rounded-full bg-text px-4 py-2 text-xs font-semibold text-white transition-shadow hover:shadow-lg hover:shadow-text/20"
            >
              <FiDownload size={13} /> Download
            </a>
          </div>

          <div className="relative bg-[#f3f3f8] p-3 sm:p-6">
            {!loaded && <div className="mx-auto aspect-[210/297] w-full max-w-[640px] animate-pulse rounded-lg bg-white shadow-sm" />}
            <img
              src={PREVIEW_IMAGE}
              alt={`${profile.name} CV`}
              onLoad={() => setLoaded(true)}
              className={`mx-auto w-full max-w-[640px] rounded-lg bg-white shadow-xl shadow-text/10 ring-1 ring-black/5 transition-opacity duration-300 ${
                loaded ? "opacity-100" : "absolute inset-x-0 opacity-0"
              }`}
            />
          </div>
        </motion.div>

        <div className="mt-6 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted">Want to talk? Reach out directly, or ask my site's assistant about my work.</p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 rounded-full bg-text px-5 py-2.5 text-sm font-semibold text-white transition-shadow hover:shadow-lg hover:shadow-text/20"
            >
              Email {profile.name.split(" ")[0]}
            </a>
            <Link
              to="/#contact"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-text transition-colors hover:border-text/30"
            >
              <FiMessageCircle size={15} /> Contact form
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
