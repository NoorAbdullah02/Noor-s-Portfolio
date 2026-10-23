import { motion } from "framer-motion";
import { FiCode, FiSmartphone, FiShield, FiCpu, FiTerminal, FiTool, FiLayers, FiArrowUpRight } from "react-icons/fi";
import Section, { SectionHeading } from "./Section";
import { skills, services } from "../data/portfolioData";
import { trackSpotlight } from "../lib/spotlight";

const EASE = [0.22, 1, 0.36, 1];
const serviceIcons = { code: FiCode, app: FiSmartphone, shield: FiShield, cpu: FiCpu };
const TOOLS = new Set(["React", "Linux", "Git & GitHub"]);

const GROUPS = [
  { id: "language", title: "Languages", icon: FiTerminal, match: (s) => s.category === "language" && !TOOLS.has(s.name) },
  { id: "tool", title: "Tools & Frameworks", icon: FiTool, match: (s) => s.category === "tool" || TOOLS.has(s.name) },
  { id: "field", title: "Fields", icon: FiLayers, match: (s) => s.category === "field" },
];

function levelOf(value) {
  if (value >= 85) return "Expert";
  if (value >= 65) return "Advanced";
  if (value >= 45) return "Proficient";
  if (value >= 30) return "Intermediate";
  return "Familiar";
}

function Dots({ value }) {
  const filled = Math.max(1, Math.round(value / 20));
  return (
    <span className="flex gap-1" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-4 rounded-full ${i < filled ? "bg-gradient-to-r from-primary to-primary-2" : "bg-border"}`}
        />
      ))}
    </span>
  );
}

function SkillGroup({ group, index }) {
  const items = skills.filter(group.match).sort((a, b) => b.level - a.level);
  const Icon = group.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: EASE }}
      onPointerMove={trackSpotlight}
      className="spotlight flex flex-col rounded-3xl border border-border bg-white/80 p-6 shadow-sm sm:p-7"
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-text text-white">
          <Icon size={17} />
        </span>
        <div>
          <h3 className="font-semibold text-text">{group.title}</h3>
          <p className="text-xs text-muted">{items.length} skills</p>
        </div>
      </div>
      <ul className="space-y-4">
        {items.map((s) => (
          <li key={s.name} className="flex items-center justify-between gap-3">
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-text">{s.name}</span>
              <span className="text-[11px] text-muted">{levelOf(s.level)}</span>
            </span>
            <Dots value={s.level} />
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function Skills() {
  return (
    <Section id="skills" className="bg-surface/30">
      <SectionHeading eyebrow="Skills" title="My Expertise Area" subtitle="Languages, tools and fields I work with" />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {GROUPS.map((g, i) => <SkillGroup key={g.id} group={g} index={i} />)}
      </div>

      <div className="mt-28">
        <SectionHeading eyebrow="Services" title="What I Offer" />
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => {
            const Icon = serviceIcons[service.icon] ?? FiCode;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
                className="group relative flex flex-col bg-bg p-7 transition-colors hover:bg-white"
              >
                <div className="mb-10 flex items-start justify-between">
                  <span className="font-mono text-xs font-semibold text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <FiArrowUpRight className="text-muted opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100" />
                </div>
                <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary-2/10 text-primary transition-colors group-hover:from-primary group-hover:to-primary-2 group-hover:text-white">
                  <Icon size={19} />
                </span>
                <h3 className="text-base font-semibold text-text">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{service.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
