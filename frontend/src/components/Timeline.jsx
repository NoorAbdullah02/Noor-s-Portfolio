import { motion } from "framer-motion";
import { FiBookOpen, FiBriefcase, FiClock } from "react-icons/fi";
import Section, { SectionHeading } from "./Section";
import { education, experience, achievements } from "../data/portfolioData";

function TimelineColumn({ icon, title, items }) {
  return (
    <div>
      <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-text">
        <span className="text-primary">{icon}</span>
        {title}
      </h3>
      <div className="relative space-y-8 border-l border-border pl-6">
        {items.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative"
          >
            <span className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-gradient-to-r from-primary to-primary-2 ring-4 ring-bg" />
            <h4 className="font-semibold text-text">{item.title}</h4>
            <p className="text-sm text-muted">{item.place}</p>
            <span className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-primary">
              <FiClock size={12} /> {item.time}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function Timeline() {
  return (
    <Section id="qualification" className="bg-surface/30">
      <SectionHeading
        eyebrow="Qualification"
        title="Education & Experience"
        subtitle="The path that shaped my skills"
      />

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <TimelineColumn icon={<FiBookOpen size={20} />} title="Education" items={education} />
        <TimelineColumn icon={<FiBriefcase size={20} />} title="Experience" items={experience} />
      </div>

      {achievements.length > 0 && (
        <div className="mt-20">
          <SectionHeading eyebrow="Achievements" title="Milestones" align="left" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((a) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5 }}
                className="glass overflow-hidden rounded-2xl"
              >
                <img src={a.image} alt={a.title} className="h-48 w-full object-cover" />
                <div className="p-5">
                  <h4 className="font-semibold text-text">{a.title}</h4>
                  <p className="mt-2 text-sm text-muted">{a.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}
