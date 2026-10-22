import { motion } from "framer-motion";

export function SectionHeading({ eyebrow, title, subtitle, align = "center" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={`mb-16 ${align === "center" ? "text-center" : ""}`}
    >
      {eyebrow && (
        <div className={`mb-5 flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}>
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-primary/60" />
          <span className="font-mono text-xs tracking-[0.2em] uppercase text-primary font-medium">
            {eyebrow}
          </span>
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-primary/60" />
        </div>
      )}

      <h2 className="text-3xl font-bold text-text sm:text-4xl lg:text-5xl tracking-tight">
        {title}
      </h2>

      <div className={`mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-primary to-primary-2 ${align === "center" ? "mx-auto" : ""}`} />

      {subtitle && (
        <p className="mt-5 text-muted max-w-xl leading-relaxed" style={align === "center" ? { marginLeft: "auto", marginRight: "auto" } : {}}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

export default function Section({ id, className = "", children }) {
  return (
    <section id={id} className={`relative py-24 sm:py-32 ${className}`}>
      <div className="mx-auto max-w-6xl px-6">{children}</div>
    </section>
  );
}
