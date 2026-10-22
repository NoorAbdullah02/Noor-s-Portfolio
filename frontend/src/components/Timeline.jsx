import { motion } from "framer-motion";
import { FiBookOpen, FiBriefcase, FiCalendar } from "react-icons/fi";
import Section, { SectionHeading } from "./Section";
import { education, experience, achievements } from "../data/portfolioData";

function TimelineItem({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className="relative pl-6"
    >
      {/* Glowing dot */}
      <div className="absolute -left-[7px] top-2.5 flex h-3.5 w-3.5 items-center justify-center">
        <div className="absolute h-3.5 w-3.5 rounded-full bg-gradient-to-r from-primary to-primary-2 glow-sm" />
        <div className="absolute h-5 w-5 rounded-full bg-primary/20 animate-ping [animation-duration:2s]"
          style={{ animationDelay: `${index * 0.3}s` }} />
      </div>

      <div className="group rounded-xl border border-border bg-bg p-4 transition-all hover:border-primary/25 hover:shadow-lg hover:shadow-primary/8 hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-semibold text-text text-sm leading-snug">{item.title}</h4>
        </div>
        <p className="mt-1 text-xs text-muted">{item.place}</p>
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5">
          <FiCalendar size={10} className="text-primary" />
          <span className="font-mono text-[10px] text-primary">{item.time}</span>
        </div>
      </div>
    </motion.div>
  );
}

function TimelineColumn({ icon, title, items, color }) {
  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div
          className="rounded-xl p-2.5"
          style={{ background: `linear-gradient(135deg, var(--color-primary)/15, var(--color-primary-2)/15)` }}
        >
          <span className="text-primary">{icon}</span>
        </div>
        <h3 className="text-lg font-bold text-text">{title}</h3>
      </div>
      <div className="relative space-y-5 border-l-2 border-border/70 pl-2"
        style={{ borderImage: "linear-gradient(to bottom, var(--color-primary), var(--color-primary-2)) 1" }}>
        {items.map((item, i) => (
          <TimelineItem key={item.title} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function Timeline() {
  return (
    <Section id="qualification" className="bg-surface/20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <SectionHeading
        eyebrow="Qualification"
        title="Education & Experience"
        subtitle="The path that shaped my skills"
      />

      <div className="grid grid-cols-1 gap-14 md:grid-cols-2">
        <TimelineColumn icon={<FiBookOpen size={18} />} title="Education" items={education} />
        <TimelineColumn icon={<FiBriefcase size={18} />} title="Experience" items={experience} />
      </div>

      {achievements.length > 0 && (
        <div className="mt-24">
          <SectionHeading eyebrow="Achievements" title="Milestones" align="left" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((a, i) => {
              const [c1, c2] = a.color || ["#4f46e5", "#9333ea"];
              return (
                <motion.div
                  key={a.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group overflow-hidden rounded-2xl border border-border bg-bg transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1"
                >
                  <div className="relative overflow-hidden h-40">
                    {a.image ? (
                      <>
                        <img src={a.image} alt={a.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
                      </>
                    ) : (
                      <div
                        className="h-full w-full flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${c1}22, ${c2}33)` }}
                      >
                        <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-3xl"
                          style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: `0 8px 24px -8px ${c1}80` }}>
                          {a.icon === "paper" ? "📄" : a.icon === "robot" ? "🤖" : "💻"}
                        </div>
                        <div className="absolute inset-0 bg-dots opacity-30" />
                      </div>
                    )}
                    <div className="absolute top-0 inset-x-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }} />
                  </div>
                  <div className="p-5">
                    <h4 className="font-semibold text-text text-sm">{a.title}</h4>
                    <p className="mt-2 text-xs text-muted leading-relaxed">{a.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </Section>
  );
}
