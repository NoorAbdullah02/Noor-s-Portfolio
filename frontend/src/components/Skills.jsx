import { motion } from "framer-motion";
import Section, { SectionHeading } from "./Section";
import TiltCard from "./TiltCard";
import { skills, services } from "../data/portfolioData";
import { FiCode, FiSmartphone, FiShield, FiCpu } from "react-icons/fi";

const icons = { code: FiCode, app: FiSmartphone, shield: FiShield, cpu: FiCpu };

const CATEGORY_COLORS = {
  language: { bg: "bg-primary/10", text: "text-primary", label: "Language" },
  tool: { bg: "bg-primary-2/10", text: "text-primary-2", label: "Tool" },
  field: { bg: "bg-accent/10", text: "text-accent", label: "Field" },
};

function SkillBar({ name, level, category, index }) {
  const cat = CATEGORY_COLORS[category] || CATEGORY_COLORS.language;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="group"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-text text-sm">{name}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-medium ${cat.bg} ${cat.text}`}>
            {cat.label}
          </span>
        </div>
        <span className="font-mono text-xs font-medium text-primary tabular-nums">{level}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface border border-border/50">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-2 relative"
          style={{
            boxShadow: "0 0 10px -2px color-mix(in srgb, var(--color-primary) 70%, transparent)",
          }}
        >
          {/* Shimmer on bar */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
                backgroundSize: "200%",
                animation: "shimmer 2.5s linear infinite",
              }}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function Skills() {
  return (
    <Section id="skills" className="bg-surface/20">
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-0 top-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute left-0 bottom-1/4 h-72 w-72 rounded-full bg-primary-2/5 blur-3xl" />
      </div>

      <SectionHeading
        eyebrow="Skills"
        title="My Expertise Area"
        subtitle="Languages, tools and fields I work with"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {skills.map((s, i) => (
          <SkillBar key={s.name} {...s} index={i} />
        ))}
      </div>

      <div className="mt-24">
        <SectionHeading eyebrow="Services" title="What I Offer" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => {
            const Icon = icons[service.icon] ?? FiCode;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <TiltCard className="group relative overflow-hidden rounded-2xl border border-border bg-bg p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10">
                  {/* Top gradient line */}
                  <div className="absolute top-0 inset-x-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-primary to-primary-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Large faded icon background */}
                  <div className="absolute -right-4 -top-4 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity">
                    <Icon size={80} />
                  </div>

                  <div className="mb-4 inline-flex rounded-2xl bg-gradient-to-br from-primary/15 to-primary-2/15 p-3.5 text-primary group-hover:from-primary/25 group-hover:to-primary-2/25 transition-all">
                    <Icon size={22} />
                  </div>
                  <h3 className="mb-2 font-semibold text-text">{service.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{service.description}</p>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
