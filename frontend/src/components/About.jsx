import { useState } from "react";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import Section, { SectionHeading } from "./Section";
import { profile, stats } from "../data/portfolioData";
import useCountUp from "../hooks/useCountUp";
import { trackSpotlight } from "../lib/spotlight";

const STAT_COLORS = [
  { from: "#4f46e5", to: "#9333ea" },
  { from: "#9333ea", to: "#ec4899" },
  { from: "#0ea5e9", to: "#4f46e5" },
  { from: "#10b981", to: "#0ea5e9" },
];

function Stat({ value, label, index }) {
  const [inView, setInView] = useState(false);
  const count = useCountUp(value, 1400, inView);
  const color = STAT_COLORS[index % STAT_COLORS.length];
  return (
    <motion.div
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onPointerMove={trackSpotlight}
      className="spotlight group relative overflow-hidden rounded-2xl border border-border bg-bg p-6 text-center transition-[box-shadow,transform] duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5"
    >
      {/* Gradient top border */}
      <div
        className="absolute top-0 inset-x-0 h-0.5 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${color.from}, ${color.to})` }}
      />
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{
          background: `radial-gradient(circle at center, color-mix(in srgb, ${color.from} 6%, transparent), transparent 70%)`,
        }}
      />
      <div
        className="relative text-4xl font-black sm:text-5xl tabular-nums"
        style={{
          backgroundImage: `linear-gradient(90deg, ${color.from}, ${color.to})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {count}+
      </div>
      <div className="relative mt-2 text-xs font-medium text-muted uppercase tracking-wide">{label}</div>
    </motion.div>
  );
}

export default function About() {
  const infoRows = [
    { icon: <FiUser size={15} />, label: "Name", value: profile.name },
    { icon: <FiMapPin size={15} />, label: "Location", value: profile.location },
    { icon: <FiPhone size={15} />, label: "Phone", value: profile.phones[0], href: `tel:${profile.phones[0]}` },
    { icon: <FiMail size={15} />, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  ];

  return (
    <Section id="about">
      <SectionHeading eyebrow="About Me" title="Who I Am" subtitle="A quick look at my background" />

      <div className="grid grid-cols-1 items-start gap-14 md:grid-cols-5">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-2"
        >
          <div className="relative">
            {/* Decorative border */}
            <div className="absolute inset-[-3px] rounded-3xl"
              style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-2), var(--color-accent))", opacity: 0.3 }} />
            <div className="relative glass rounded-3xl p-2 overflow-hidden">
              <img
                src={profile.aboutImage}
                alt="Profile"
                loading="lazy"
                decoding="async"
                className="h-full w-full rounded-[1.4rem] object-cover"
              />
            </div>
            {/* Decorative dot */}
            <div className="absolute -bottom-3 -right-3 h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-2 glow-sm" />
            <div className="absolute -top-3 -left-3 h-6 w-6 rounded-full border-2 border-primary/40" />
          </div>
        </motion.div>

        {/* Text + info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="md:col-span-3"
        >
          {profile.about.map((p, i) => (
            <p key={i} className="mb-4 text-muted leading-relaxed">
              {p}
            </p>
          ))}

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {infoRows.map((row) => (
              <div
                key={row.label}
                className="group flex items-center gap-3 rounded-xl border border-border bg-bg px-4 py-3 transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/8"
              >
                <span className="rounded-lg bg-primary/10 p-2 text-primary group-hover:bg-primary/15 transition-colors">
                  {row.icon}
                </span>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-muted">{row.label}</div>
                  {row.href ? (
                    <a href={row.href} className="text-sm font-medium text-text hover:text-primary transition-colors">
                      {row.value}
                    </a>
                  ) : (
                    <div className="text-sm font-medium text-text">{row.value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="mt-20 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s, i) => (
          <Stat key={s.label} value={s.value} label={s.label} index={i} />
        ))}
      </div>
    </Section>
  );
}
