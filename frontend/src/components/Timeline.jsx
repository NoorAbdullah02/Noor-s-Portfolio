import { motion } from "framer-motion";
import { FiBookOpen, FiBriefcase, FiCpu, FiCode, FiAward, FiFileText, FiCompass } from "react-icons/fi";
import Section, { SectionHeading } from "./Section";
import { education, experience, achievements } from "../data/portfolioData";
import { trackSpotlight } from "../lib/spotlight";

const EASE = [0.22, 1, 0.36, 1];
const ACHIEVEMENT_ICONS = { paper: FiFileText, robot: FiCpu, code: FiCode, quiz: FiAward, leader: FiCompass };

function TimelineList({ icon: Icon, title, items, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, delay, ease: EASE }}
      className="rounded-3xl border border-border bg-white/80 p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-text text-white">
          <Icon size={17} />
        </span>
        <h3 className="text-lg font-semibold text-text">{title}</h3>
      </div>

      <ol className="relative">
        {items.map((item, i) => (
          <motion.li
            key={item.title}
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: delay + 0.1 + i * 0.08, ease: EASE }}
            className="group relative grid grid-cols-[18px_1fr] gap-4 pb-6 last:pb-0"
          >
            {i < items.length - 1 && <span className="absolute left-[8px] top-5 bottom-0 w-px bg-border" />}
            <span className="relative mt-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-primary/30 bg-white transition-colors group-hover:border-primary">
              <span className={`h-2 w-2 rounded-full ${i === 0 ? "bg-gradient-to-br from-primary to-primary-2" : "bg-primary/40"}`} />
            </span>
            <div className="min-w-0">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-primary">{item.time}</span>
              <h4 className="mt-0.5 font-semibold leading-snug text-text">{item.title}</h4>
              <p className="mt-0.5 text-sm text-muted">{item.place}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </motion.div>
  );
}

function FeaturedAchievement({ a }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="group relative min-h-[320px] overflow-hidden rounded-3xl bg-text sm:col-span-2 lg:row-span-2"
    >
      <img
        src={a.image}
        alt={a.title}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b1a] via-[#0b0b1a]/50 to-transparent" />
      <div className="relative flex h-full flex-col justify-end p-7 sm:p-8">
        <span className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur">
          <FiAward size={11} /> Featured
        </span>
        <h3 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{a.title}</h3>
        <p className="mt-2 max-w-lg text-left text-sm leading-relaxed text-white/75">{a.description}</p>
      </div>
    </motion.article>
  );
}

function AchievementCard({ a, index }) {
  const Icon = ACHIEVEMENT_ICONS[a.icon] || FiAward;
  const [c1, c2] = a.color || ["#4f46e5", "#9333ea"];
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay: index * 0.07, ease: EASE }}
      onPointerMove={trackSpotlight}
      className="spotlight group flex flex-col rounded-3xl border border-border bg-white/80 p-6 shadow-sm transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
    >
      <span
        className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl text-white"
        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: `0 10px 24px -10px ${c1}` }}
      >
        <Icon size={19} />
      </span>
      <h3 className="font-semibold leading-snug text-text">{a.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{a.description}</p>
    </motion.article>
  );
}

export default function Timeline() {
  const featured = achievements.find((a) => a.image);
  const rest = achievements.filter((a) => a !== featured);
  const hasExperience = experience.length > 0;

  return (
    <Section id="qualification">
      <SectionHeading
        eyebrow="Qualification"
        title={hasExperience ? "Education & Experience" : "Education"}
        subtitle="The path that shaped my skills"
      />

      <div className={`grid grid-cols-1 gap-5 ${hasExperience ? "md:grid-cols-2" : "mx-auto max-w-xl"}`}>
        <TimelineList icon={FiBookOpen} title="Education" items={education} />
        {hasExperience && <TimelineList icon={FiBriefcase} title="Experience" items={experience} delay={0.1} />}
      </div>

      {achievements.length > 0 && (
        <div className="mt-28">
          <SectionHeading eyebrow="Achievements" title="Milestones" subtitle="Competitions, research and recognition" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured && <FeaturedAchievement a={featured} />}
            {rest.map((a, i) => <AchievementCard key={a.title} a={a} index={i} />)}
          </div>
        </div>
      )}
    </Section>
  );
}
