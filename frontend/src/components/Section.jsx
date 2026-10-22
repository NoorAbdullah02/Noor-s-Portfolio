import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

function RevealTitle({ text }) {
  const words = String(text).split(" ");
  return (
    <motion.h2
      className="text-3xl font-bold tracking-tight text-text sm:text-4xl lg:text-5xl"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.6 }}
      transition={{ staggerChildren: 0.07 }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.12em] align-bottom">
          <motion.span
            className="inline-block"
            variants={{ hidden: { y: "110%", rotate: 4 }, show: { y: "0%", rotate: 0 } }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.h2>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, align = "center" }) {
  const centered = align === "center";
  return (
    <div className={`mb-16 ${centered ? "text-center" : ""}`}>
      {eyebrow && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: EASE }}
          className={`mb-5 flex items-center gap-3 ${centered ? "justify-center" : ""}`}
        >
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="h-px w-10 origin-right bg-gradient-to-r from-transparent to-primary/60"
          />
          <span className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">{eyebrow}</span>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="h-px w-10 origin-left bg-gradient-to-l from-transparent to-primary/60"
          />
        </motion.div>
      )}

      <RevealTitle text={title} />

      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
        className={`mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-primary to-primary-2 ${centered ? "mx-auto origin-center" : "origin-left"}`}
      />

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
          className={`mt-5 max-w-xl leading-relaxed text-muted ${centered ? "mx-auto" : ""}`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

export default function Section({ id, className = "", children }) {
  return (
    <section id={id} className={`relative overflow-x-clip py-24 sm:py-32 ${className}`}>
      <div className="mx-auto max-w-6xl px-5 sm:px-6">{children}</div>
    </section>
  );
}
