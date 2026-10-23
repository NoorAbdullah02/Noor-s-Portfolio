import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiDownload } from "react-icons/fi";
import { profile } from "../data/portfolioData";
import useScrollSpy from "../hooks/useScrollSpy";

const links = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "github", label: "GitHub" },
  { id: "contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeId = useScrollSpy(links.map((l) => l.id));

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleClick = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 max-w-6xl px-6">
        <motion.nav
          className="flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300"
          style={{
            background: scrolled ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.65)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.7)",
            boxShadow: scrolled
              ? "0 4px 24px -8px rgba(79,70,229,0.15), 0 1px 0 rgba(255,255,255,0.9) inset"
              : "0 1px 0 rgba(255,255,255,0.9) inset",
          }}
        >
          <button
            onClick={() => handleClick("home")}
            className="font-mono text-lg font-bold tracking-tight"
          >
            <span className="text-gradient">&lt;Noor</span>
            <span className="text-text">.dev/&gt;</span>
          </button>

          <ul className="hidden items-center gap-0.5 md:flex">
            {links.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => handleClick(link.id)}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    activeId === link.id ? "text-on-accent" : "text-muted hover:text-text"
                  }`}
                >
                  {activeId === link.id && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-text"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 md:flex">
            <a
              href={profile.resumeUrl}
              download
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted transition-all hover:border-primary hover:text-primary hover:bg-primary/5"
              title="Download CV"
            >
              <FiDownload size={14} /> CV
            </a>
            <button
              onClick={() => handleClick("contact")}
              className="btn-shine rounded-full bg-text px-5 py-2 text-sm font-semibold text-white shadow-md shadow-text/15 transition-shadow hover:shadow-primary/30"
            >
              Hire Me
            </button>
          </div>

          <button
            className="rounded-lg p-1.5 text-text md:hidden hover:bg-surface transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "x" : "menu"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {open ? <FiX size={22} /> : <FiMenu size={22} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </motion.nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mt-2 rounded-2xl border border-border bg-bg/90 p-3 backdrop-blur-xl shadow-xl shadow-black/10 md:hidden"
            >
              <ul className="flex flex-col gap-1">
                {links.map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => handleClick(link.id)}
                      className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all ${
                        activeId === link.id
                          ? "bg-text text-white"
                          : "text-muted hover:text-text hover:bg-surface"
                      }`}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
              <a
                href={profile.resumeUrl}
                download
                onClick={() => setOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text transition-colors hover:border-primary hover:text-primary"
              >
                <FiDownload size={14} /> Download CV
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
