import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { FiArrowDown, FiGithub, FiLinkedin } from "react-icons/fi";
import { profile } from "../data/portfolioData";

const HeroScene = lazy(() => import("./three/HeroScene"));

export default function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-bg bg-grid pt-32 pb-20"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 h-96 w-96 animate-blob rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-40 -right-20 h-96 w-96 animate-blob rounded-full bg-primary-2/15 blur-3xl [animation-delay:4s]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 animate-blob rounded-full bg-accent/15 blur-3xl [animation-delay:8s]" />
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 md:block">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="font-mono text-sm text-primary">Hi, my name is</p>
          <h1 className="mt-2 text-4xl font-bold leading-tight text-text sm:text-5xl lg:text-6xl">
            <span className="text-gradient">{profile.name}</span>
          </h1>
          <h2 className="mt-3 h-10 text-xl font-semibold text-muted sm:text-2xl">
            <TypeAnimation
              sequence={profile.roles.flatMap((r) => [r, 1800])}
              wrapper="span"
              speed={45}
              repeat={Infinity}
            />
          </h2>
          <p className="mt-6 max-w-lg text-muted">{profile.summary}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-full bg-gradient-to-r from-primary to-primary-2 px-6 py-3 text-sm font-semibold text-on-accent shadow-lg shadow-primary/20 transition hover:scale-[1.03]"
            >
              Let's Talk
            </a>
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-text transition hover:border-primary hover:text-primary"
            >
              View Projects
            </a>
            <div className="flex items-center gap-3 pl-2">
              <a
                href={profile.social.github}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border p-2.5 text-muted transition hover:border-primary hover:text-primary"
              >
                <FiGithub />
              </a>
              <a
                href={profile.social.linkedin}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border p-2.5 text-muted transition hover:border-primary hover:text-primary"
              >
                <FiLinkedin />
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mx-auto h-72 w-72 sm:h-80 sm:w-80"
        >
          <div className="absolute inset-0 animate-float rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-2 opacity-30 blur-2xl" />
          <div className="glass relative h-full w-full overflow-hidden rounded-[2.5rem] border-2 border-border p-2">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="h-full w-full rounded-[2rem] object-cover"
            />
          </div>
          <div className="glass absolute -bottom-4 -left-6 rounded-xl px-4 py-2 font-mono text-xs text-primary shadow-lg">
            console.log("Hello World");
          </div>
        </motion.div>
      </div>

      <motion.a
        href="#about"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-muted"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        aria-label="Scroll down"
      >
        <FiArrowDown size={22} />
      </motion.a>
    </section>
  );
}
