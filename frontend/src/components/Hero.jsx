import { lazy, useRef } from "react";
import { motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { FiArrowDown, FiGithub, FiLinkedin, FiDownload } from "react-icons/fi";
import { profile } from "../data/portfolioData";
import Safe3D from "./three/Safe3D";
import Magnetic from "./Magnetic";

const HeroScene = lazy(() => import("./three/HeroScene"));

export default function Hero() {
  const sectionRef = useRef(null);
  const heroVisible = useInView(sectionRef, { margin: "0px 0px -15% 0px" });
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
      ref={sectionRef}
      id="home"
      onMouseMove={handleMouseMove}
      className="relative flex min-h-screen items-center overflow-hidden bg-bg bg-dots pt-32 pb-20"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{ background: spotlight }}
      />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] max-w-[120vw] animate-blob rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-[450px] w-[450px] max-w-[120vw] animate-blob rounded-full bg-primary-2/10 blur-3xl [animation-delay:4s]" />
        <div className="absolute -bottom-20 left-1/3 h-80 w-80 animate-blob rounded-full bg-accent/10 blur-3xl [animation-delay:8s]" />
      </div>

      <Safe3D>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="pointer-events-none absolute inset-y-0 right-0 w-[55%]"
        >
          <HeroScene active={heroVisible} />
        </motion.div>
      </Safe3D>

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
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

          <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <Magnetic>
              <a
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-shine group relative inline-block rounded-full bg-gradient-to-r from-primary to-primary-2 px-7 py-3 text-sm font-semibold text-on-accent shadow-lg shadow-primary/25 transition-shadow hover:shadow-primary/40 hover:shadow-xl"
              >
                Let's Talk
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-block rounded-full border-2 border-border bg-white/50 px-7 py-3 text-sm font-semibold text-text backdrop-blur transition-colors hover:border-primary hover:text-primary hover:bg-primary/5"
              >
                View Projects
              </a>
            </Magnetic>
            <a
              href={profile.resumeUrl}
              download
              className="inline-flex items-center gap-2 rounded-full border-2 border-primary/30 bg-primary/5 px-6 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/10 hover:border-primary/50 hover:scale-[1.03]"
            >
              <FiDownload size={15} />
              Download CV
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

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto h-72 w-72 sm:h-80 sm:w-80"
        >
          <div className="absolute inset-[-6px] rounded-[2.8rem] animate-spin-slow"
            style={{
              background: "conic-gradient(from 0deg, var(--color-primary), var(--color-primary-2), var(--color-accent), var(--color-primary))",
              opacity: 0.25,
              filter: "blur(2px)",
            }}
          />
          <div className="absolute inset-0 animate-float rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-2 opacity-20 blur-3xl" />
          <div className="glass-solid relative h-full w-full overflow-hidden rounded-[2.5rem] border-2 border-white/60 p-2 glow-sm">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-full w-full rounded-[2rem] object-cover"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="glass-solid absolute -bottom-4 -left-3 rounded-xl px-3 py-2 font-mono text-[11px] text-primary shadow-lg shadow-primary/10 border-l-2 sm:-left-8 sm:px-4 sm:py-2.5 sm:text-xs"
            style={{ borderColor: "var(--color-primary)" }}
          >
            console.log("Hello World");
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="glass-solid absolute -top-4 -right-3 rounded-xl px-3 py-2 text-xs shadow-lg shadow-primary/10 sm:-right-6 sm:px-4 sm:py-2.5"
          >
            <span className="font-bold text-gradient">ICPC</span>
            <span className="ml-1 text-muted">Contestant</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="glass-solid absolute -right-3 bottom-10 hidden rounded-xl px-3 py-2 text-xs shadow-lg shadow-primary/10 sm:-right-10 sm:block sm:px-4 sm:py-2.5"
          >
            <span className="font-bold text-gradient">4×</span>
            <span className="ml-1 text-muted">Papers Accepted</span>
          </motion.div>
        </motion.div>
      </div>

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
