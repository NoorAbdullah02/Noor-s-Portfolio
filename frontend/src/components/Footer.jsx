import { motion } from "framer-motion";
import { FiGithub, FiLinkedin, FiFacebook, FiTwitter, FiArrowUp, FiArrowRight, FiMail, FiFileText } from "react-icons/fi";
import { profile } from "../data/portfolioData";
import { openCvPreview } from "../lib/cvPreview";

const socials = [
  { icon: FiGithub, href: profile.social.github, label: "GitHub" },
  { icon: FiLinkedin, href: profile.social.linkedin, label: "LinkedIn" },
  { icon: FiFacebook, href: profile.social.facebook, label: "Facebook" },
  { icon: FiTwitter, href: profile.social.twitter, label: "X / Twitter" },
];

const navLinks = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "qualification", label: "Education" },
  { id: "projects", label: "Projects" },
  { id: "github", label: "GitHub" },
  { id: "contact", label: "Contact" },
];

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#0b0b1a] text-white">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[46rem] max-w-[140vw] -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_30%,transparent_75%)]" />

      <div className="relative mx-auto max-w-6xl px-5 pt-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start gap-8 border-b border-white/10 pb-16 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-white/50">Open to opportunities</p>
            <h2 className="max-w-2xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              Have an idea? <span className="bg-gradient-to-r from-[#a5b4fc] to-[#f0abfc] bg-clip-text text-transparent">Let's build it together.</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => scrollTo("contact")}
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#0b0b1a] transition-transform hover:scale-[1.03]"
            >
              Start a conversation
              <FiArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={openCvPreview}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/50"
            >
              <FiFileText size={14} /> View CV
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="font-mono text-xl font-bold">
              <span className="text-[#a5b4fc]">&lt;Noor</span>.dev/&gt;
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
              Competitive programmer, machine-learning researcher and engineering student from Natore, Bangladesh.
            </p>
            <a href={`mailto:${profile.email}`} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white">
              <FiMail size={14} /> {profile.email}
            </a>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Navigate</h4>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {navLinks.map((l) => (
                <li key={l.id}>
                  <button onClick={() => scrollTo(l.id)} className="text-sm text-white/65 transition-colors hover:text-white">{l.label}</button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Connect</h4>
            <div className="flex flex-wrap gap-2.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/50 hover:bg-white/5 hover:text-white"
                >
                  <s.icon size={17} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-8 text-xs text-white/45 sm:flex-row">
          <span>© {year} {profile.name}. All rights reserved.</span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white"
            aria-label="Back to top"
          >
            Back to top
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 transition-colors group-hover:border-white/50">
              <FiArrowUp size={14} />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
