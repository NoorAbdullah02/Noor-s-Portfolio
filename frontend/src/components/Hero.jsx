import { lazy, useRef } from "react";
import { motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { FiArrowRight, FiArrowUpRight, FiGithub, FiLinkedin, FiDownload, FiBookOpen, FiAward, FiMapPin } from "react-icons/fi";
import { profile } from "../data/portfolioData";
import Safe3D from "./three/Safe3D";
import Magnetic from "./Magnetic";

const HeroScene = lazy(() => import("./three/HeroScene"));
const EASE = [0.22, 1, 0.36, 1];

const scrollTo = (id) => (e) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

function RevealLine({ children, delay = 0, className = "" }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className={`block ${className}`}
        initial={{ y: "105%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function FloatingCard({ icon, title, subtitle, className, delay, floatDelay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease: EASE }}
      className={`absolute z-10 ${className}`}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: floatDelay }}
        className="glass-solid flex items-center gap-3 rounded-2xl px-3.5 py-2.5 shadow-xl shadow-primary/10"
      >
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-2 text-white">
          {icon}
        </span>
        <span className="leading-tight">
          <span className="block text-[13px] font-semibold text-text">{title}</span>
          <span className="block text-[11px] text-muted">{subtitle}</span>
        </span>
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  const sectionRef = useRef(null);
  const heroVisible = useInView(sectionRef, { margin: "0px 0px -15% 0px" });
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(40);
  const spotlight = useTransform(
    [mouseX, mouseY],
    ([mx, my]) =>
      `radial-gradient(600px circle at ${mx}% ${my}%, color-mix(in srgb, var(--color-primary) 7%, transparent), transparent 65%)`
  );

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width) * 100);
    mouseY.set(((e.clientY - rect.top) / rect.height) * 100);
  };

  const [firstName, ...rest] = profile.name.split(" ");
  const lastLine = rest.pop();
  const firstLine = [firstName, ...rest].join(" ");

  return (
    <section
      ref={sectionRef}
      id="home"
      onMouseMove={handleMouseMove}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-bg pb-24 pt-28 sm:pt-32"
    >
      <div className="hero-grid pointer-events-none absolute inset-0" />
      <motion.div className="pointer-events-none absolute inset-0 hidden md:block" style={{ background: spotlight }} />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[560px] w-[560px] max-w-[130vw] animate-blob rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute -right-40 top-1/4 h-[520px] w-[520px] max-w-[130vw] animate-blob rounded-full bg-primary-2/10 blur-3xl [animation-delay:5s]" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />

      <Safe3D>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.4 }}
          className="pointer-events-none absolute inset-y-0 right-0 w-[55%]"
        >
          <HeroScene active={heroVisible} />
        </motion.div>
      </Safe3D>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-14 px-5 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="mb-7 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-border bg-white/80 py-1.5 pl-2 pr-4 text-xs font-medium text-text/70 shadow-sm"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-0.5 text-emerald-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Available
            </span>
            <span className="inline-flex items-center gap-1"><FiMapPin size={11} />{profile.location}</span>
          </motion.div>

          <h1 className="text-[2.75rem] font-bold leading-[1.02] tracking-[-0.035em] text-text sm:text-6xl lg:text-7xl">
            <RevealLine delay={0.15}>{firstLine}</RevealLine>
            <RevealLine delay={0.27} className="text-gradient">{lastLine}</RevealLine>
          </h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="mt-5 flex h-8 items-center gap-3 text-lg font-medium text-text/80 sm:text-xl"
          >
            <span className="h-px w-8 bg-gradient-to-r from-primary to-primary-2" />
            <TypeAnimation sequence={profile.roles.flatMap((r) => [r, 2200])} wrapper="span" speed={50} repeat={Infinity} />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65, ease: EASE }}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
          >
            {profile.headline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.78, ease: EASE }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Magnetic>
              <a
                href="#contact"
                onClick={scrollTo("contact")}
                className="btn-shine group inline-flex items-center gap-2 rounded-full bg-text px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-text/15 transition-shadow hover:shadow-primary/30"
              >
                Let's work together
                <FiArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
            </Magnetic>
            <a
              href="#projects"
              onClick={scrollTo("projects")}
              className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-white/70 px-6 py-3.5 text-sm font-semibold text-text transition-colors hover:border-text/30"
            >
              View my work
              <FiArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <a
              href={profile.resumeUrl}
              download
              className="inline-flex items-center gap-1.5 px-3 py-3.5 text-sm font-medium text-muted underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              <FiDownload size={14} /> Résumé
            </a>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.08, delayChildren: 0.95 }}
            className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-border/80 pt-6"
          >
            {profile.highlights.map((h) => (
              <motion.div key={h.label} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <div className="text-2xl font-bold tracking-tight text-text sm:text-3xl">{h.value}</div>
                <div className="mt-1 text-[11px] leading-snug text-muted sm:text-xs">{h.label}</div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-8 flex items-center gap-3 text-xs text-muted"
          >
            <span>Find me on</span>
            {[
              { href: profile.social.github, Icon: FiGithub, label: "GitHub" },
              { href: profile.social.linkedin, Icon: FiLinkedin, label: "LinkedIn" },
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white/70 text-text/70 transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Icon size={15} />
              </a>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.25, ease: EASE }}
          className="relative mx-auto w-full max-w-[19rem] sm:max-w-[21rem]"
        >
          <div className="absolute -inset-10 rounded-full bg-gradient-to-br from-primary/25 via-primary-2/20 to-accent/20 blur-3xl" />
          <div className="relative rounded-[2.25rem] bg-gradient-to-br from-primary via-primary-2 to-accent p-[1.5px] shadow-2xl shadow-primary/20">
            <div className="rounded-[calc(2.25rem-1.5px)] bg-white p-2.5">
              <img
                src={profile.avatar}
                alt={profile.name}
                fetchPriority="high"
                className="aspect-[4/5] w-full rounded-[1.75rem] object-cover object-top"
              />
            </div>
          </div>

          <FloatingCard
            icon={<FiBookOpen size={16} />}
            title="IEEE CSDE 2026"
            subtitle="3 papers accepted"
            className="-left-2 top-8 sm:-left-14"
            delay={0.9}
          />
          <FloatingCard
            icon={<FiAward size={16} />}
            title="RoboSpark"
            subtitle="Champion"
            className="-right-2 bottom-10 sm:-right-10"
            delay={1.05}
            floatDelay={1.5}
          />
        </motion.div>
      </div>

      <motion.a
        href="#about"
        onClick={scrollTo("about")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted md:flex [@media(max-height:760px)]:hidden"
        aria-label="Scroll down"
      >
        <span className="flex h-9 w-5.5 justify-center rounded-full border-[1.5px] border-text/25 pt-1.5">
          <motion.span
            className="h-1.5 w-1 rounded-full bg-text/50"
            animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.a>
    </section>
  );
}
