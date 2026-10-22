import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
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
  const activeId = useScrollSpy(links.map((l) => l.id));

  const handleClick = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 max-w-6xl px-6">
        <nav className="glass flex items-center justify-between rounded-2xl px-5 py-3 shadow-lg shadow-black/20">
          <button
            onClick={() => handleClick("home")}
            className="font-mono text-lg font-semibold tracking-tight text-text"
          >
            <span className="text-gradient">&lt;Noor</span>
            <span className="text-text">.dev/&gt;</span>
          </button>

          <ul className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => handleClick(link.id)}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    activeId === link.id
                      ? "text-bg"
                      : "text-muted hover:text-text"
                  }`}
                >
                  {activeId === link.id && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-primary to-primary-2"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <button
            onClick={() => handleClick("contact")}
            className="hidden rounded-full bg-gradient-to-r from-primary to-primary-2 px-5 py-2 text-sm font-semibold text-bg transition hover:opacity-90 md:inline-flex"
          >
            Hire Me
          </button>

          <button
            className="text-text md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass mt-2 rounded-2xl p-4 md:hidden"
            >
              <ul className="flex flex-col gap-1">
                {links.map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => handleClick(link.id)}
                      className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium ${
                        activeId === link.id
                          ? "bg-gradient-to-r from-primary to-primary-2 text-bg"
                          : "text-muted"
                      }`}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
