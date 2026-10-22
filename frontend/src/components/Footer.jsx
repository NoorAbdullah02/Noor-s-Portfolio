import { motion } from "framer-motion";
import { FiGithub, FiLinkedin, FiFacebook, FiTwitter, FiArrowUp, FiHeart } from "react-icons/fi";
import { profile } from "../data/portfolioData";

const socials = [
  { icon: FiGithub, href: profile.social.github, label: "GitHub" },
  { icon: FiLinkedin, href: profile.social.linkedin, label: "LinkedIn" },
  { icon: FiFacebook, href: profile.social.facebook, label: "Facebook" },
  { icon: FiTwitter, href: profile.social.twitter, label: "X / Twitter" },
];

const navLinks = ["Home", "About", "Skills", "Projects", "GitHub", "Contact"];

export default function Footer() {
  const scrollTo = (id) => document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="relative overflow-hidden bg-surface/30 pt-20 pb-10">
      {/* Gradient separator */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-48 w-96 rounded-full bg-primary/6 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Top row */}
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="font-mono text-2xl font-bold text-shimmer mb-3">&lt;Noor.dev/&gt;</div>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              Passionate engineering student dedicated to excellence — always pushing boundaries in competitive programming, software and embedded systems.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-text text-sm mb-4 font-mono uppercase tracking-wide">Navigation</h4>
            <ul className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <li key={link}>
                  <button
                    onClick={() => scrollTo(link === "GitHub" ? "github" : link)}
                    className="text-sm text-muted hover:text-primary transition-colors"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="font-semibold text-text text-sm mb-4 font-mono uppercase tracking-wide">Connect</h4>
            <div className="flex gap-3 flex-wrap">
              {socials.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="rounded-xl border border-border bg-bg p-2.5 text-muted transition-colors hover:border-primary hover:text-primary hover:shadow-md hover:shadow-primary/10"
                >
                  <s.icon size={17} />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border/60 mb-8" />

        {/* Bottom row */}
        <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {profile.name}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            Built with <FiHeart size={11} className="text-red-400" /> and lots of C++
          </p>
        </div>
      </div>

      {/* Back to top */}
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="absolute right-6 -top-6 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary-2 text-on-accent shadow-lg shadow-primary/30 transition-shadow hover:shadow-primary/50 hover:shadow-xl"
        aria-label="Back to top"
      >
        <FiArrowUp size={18} />
      </motion.button>
    </footer>
  );
}
