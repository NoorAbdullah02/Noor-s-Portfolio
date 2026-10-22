import { motion } from "framer-motion";
import Section, { SectionHeading } from "./Section";
import { skills, services } from "../data/portfolioData";
import { FiCode, FiSmartphone, FiShield, FiCpu } from "react-icons/fi";

const icons = { code: FiCode, app: FiSmartphone, shield: FiShield, cpu: FiCpu };

function SkillBar({ name, level, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-text">{name}</span>
        <span className="font-mono text-xs text-primary">{level}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut", delay: index * 0.05 }}
          className="h-full rounded-full bg-gradient-to-r from-primary to-primary-2"
        />
      </div>
    </motion.div>
  );
}

export default function Skills() {
  return (
    <Section id="skills" className="bg-surface/30">
      <SectionHeading
        eyebrow="Skills"
        title="My Expertise Area"
        subtitle="Languages, tools and fields I work with"
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {skills.map((s, i) => (
          <SkillBar key={s.name} {...s} index={i} />
        ))}
      </div>

      <div className="mt-20">
        <SectionHeading eyebrow="Services" title="What I Offer" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => {
            const Icon = icons[service.icon] ?? FiCode;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="glass group rounded-2xl p-6 transition hover:-translate-y-1 hover:border-primary/60"
              >
                <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-primary/20 to-primary-2/20 p-3 text-primary">
                  <Icon size={22} />
                </div>
                <h3 className="mb-2 font-semibold text-text">{service.title}</h3>
                <p className="text-sm text-muted">{service.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
