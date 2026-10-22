import { Suspense, lazy } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { FiArrowDown, FiGithub, FiLinkedin } from "react-icons/fi";
import { profile } from "../data/portfolioData";

const HeroScene = lazy(() => import("./three/HeroScene"));

export default function Hero() {
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);
  const spotlight = useTransform(
    [mouseX, mouseY],
    ([mx, my]) =>
      `radial-gradient(700px circle at ${mx}% ${my}%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 65%)`
  );

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width) * 100);
    mouseY.set(((e.clientY - rect.top) / rect.height) * 100);
  };

  return (
    <section
      id="home"
      onMouseMove={handleMouseMove}
      className="relative flex min-h-screen items-center overflow-hidden bg-bg bg-dots pt-32 pb-20"
    >
      {/* Mouse spotlight */}
      <motion.div
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{ background: spotlight }}
      />

      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] animate-blob rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-[450px] w-[450px] animate-blob rounded-full bg-primary-2/10 blur-3xl [animation-delay:4s]" />
        <div className="absolute -bottom-20 left-1/3 h-80 w-80 animate-blob rounded-full bg-accent/10 blur-3xl [animation-delay:8s]" />
      </div>

      {/* Three.js scene */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 md:block">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Available badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span className="font-mono text-xs text-primary">Available for opportunities</span>
          </motion.div>

          <p className="font-mono text-sm tracking-wider text-primary/70">Hi, my name is</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-text sm:text-5xl lg:text-6xl tracking-tight">
            <span className="text-shimmer">{profile.name}</span>
          </h1>
          <h2 className="mt-3 h-10 text-xl font-semibold text-muted sm:text-2xl">
            <TypeAnimation
              sequence={profile.roles.flatMap((r) => [r, 2000])}
              wrapper="span"
              speed={48}
              repeat={Infinity}
            />
          </h2>
          <p className="mt-6 max-w-lg text-muted leading-relaxed">{profile.summary}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-shine group relative rounded-full bg-gradient-to-r from-primary to-primary-2 px-7 py-3 text-sm font-semibold text-on-accent shadow-lg shadow-primary/25 transition-all hover:scale-[1.04] hover:shadow-primary/40 hover:shadow-xl"
            >
              Let's Talk
            </a>
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-full border-2 border-border px-7 py-3 text-sm font-semibold text-text transition-all hover:border-primary hover:text-primary hover:bg-primary/5"
            >
              View Projects
            </a>
            <div className="flex items-center gap-2.5">
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
                  className="rounded-full border-2 border-border p-2.5 text-muted transition-all hover:border-primary hover:text-primary hover:bg-primary/5 hover:scale-110"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Profile photo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto h-72 w-72 sm:h-80 sm:w-80"
        >
          {/* Rotating gradient ring */}
          <div className="absolute inset-[-6px] rounded-[2.8rem] animate-spin-slow"
            style={{
              background: "conic-gradient(from 0deg, var(--color-primary), var(--color-primary-2), var(--color-accent), var(--color-primary))",
              opacity: 0.25,
              filter: "blur(2px)",
            }}
          />
          {/* Glow blob */}
          <div className="absolute inset-0 animate-float rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-2 opacity-20 blur-3xl" />
          {/* Card */}
          <div className="glass relative h-full w-full overflow-hidden rounded-[2.5rem] border-2 border-white/60 p-2 glow-sm">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-full w-full rounded-[2rem] object-cover"
            />
          </div>
          {/* Code badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="glass absolute -bottom-4 -left-8 rounded-xl px-4 py-2.5 font-mono text-xs text-primary shadow-lg shadow-primary/10 border-l-2"
            style={{ borderColor: "var(--color-primary)" }}
          >
            console.log("Hello World");
          </motion.div>
          {/* ICPC badge */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="glass absolute -top-4 -right-6 rounded-xl px-4 py-2.5 text-xs shadow-lg shadow-primary/10"
          >
            <span className="font-bold text-gradient">ICPC</span>
            <span className="ml-1 text-muted">Contestant</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#about"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 flex flex-col items-center gap-1 text-muted"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        aria-label="Scroll down"
      >
        <span className="font-mono text-[10px] tracking-widest uppercase opacity-60">Scroll</span>
        <FiArrowDown size={18} />
      </motion.a>
    </section>
  );
}
