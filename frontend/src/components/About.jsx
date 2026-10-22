import { useState } from "react";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiMapPin, FiBookOpen, FiArrowUpRight } from "react-icons/fi";
import Section, { SectionHeading } from "./Section";
import { profile, stats, education } from "../data/portfolioData";
import useCountUp from "../hooks/useCountUp";
import { trackSpotlight } from "../lib/spotlight";

const EASE = [0.22, 1, 0.36, 1];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.7, delay, ease: EASE },
});

function Lead() {
  const [before, after] = profile.aboutLead.split(profile.aboutHighlight);
  return (
    <motion.p
      {...fadeUp(0)}
      className="text-left text-2xl font-semibold leading-snug tracking-tight text-text sm:text-[1.9rem]"
    >
      {before}
      <span className="text-gradient">{profile.aboutHighlight}</span>
      {after}
    </motion.p>
  );
}

function Portrait() {
  const current = education[0];
  return (
    <motion.div {...fadeUp(0)} className="relative mx-auto w-full max-w-sm pb-8 lg:max-w-none">
      <div className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-primary/20 via-primary-2/15 to-accent/15 blur-2xl" />
      <div className="relative rounded-[2rem] bg-gradient-to-br from-primary via-primary-2 to-accent p-[1.5px] shadow-2xl shadow-primary/15">
        <div className="overflow-hidden rounded-[calc(2rem-1.5px)] bg-white p-2.5">
          <img
            src={profile.aboutImage}
            alt={profile.name}
            loading="lazy"
            decoding="async"
            className="aspect-[4/5] w-full rounded-[1.6rem] object-cover object-top"
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
        className="glass-solid absolute inset-x-5 bottom-0 flex items-center gap-3 rounded-2xl p-3.5 shadow-xl shadow-primary/10 sm:inset-x-8"
      >
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-2 text-white">
          <FiBookOpen size={17} />
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Currently studying</span>
          <span className="mt-0.5 block truncate text-sm font-semibold text-text">B.Sc. in ICE · BAUET</span>
          <span className="block text-[11px] text-muted">{current.time}</span>
        </span>
      </motion.div>
    </motion.div>
  );
}

function Stat({ value, label, index }) {
  const [inView, setInView] = useState(false);
  const count = useCountUp(value, 1400, inView);
  return (
    <motion.div
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true }}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: EASE }}
      className="bg-bg px-5 py-7 sm:px-7"
    >
      <div className="text-4xl font-bold tracking-tight text-text tabular-nums sm:text-5xl">
        {count}
        <span className="text-gradient">+</span>
      </div>
      <div className="mt-2 text-xs font-medium leading-snug text-muted sm:text-sm">{label}</div>
    </motion.div>
  );
}

export default function About() {
  const infoRows = [
    { icon: FiUser, label: "Name", value: profile.name },
    { icon: FiMapPin, label: "Location", value: profile.location },
    { icon: FiPhone, label: "Phone", value: profile.phones[0], href: `tel:${profile.phones[0]}` },
    { icon: FiMail, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  ];

  return (
    <Section id="about">
      <SectionHeading eyebrow="About Me" title="Who I Am" subtitle="A quick look at my background" />

      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Portrait />

        <div className="min-w-0">
          <Lead />

          <motion.div {...fadeUp(0.1)} className="mt-6 space-y-4">
            {profile.about.map((p, i) => (
              <p key={i} className="leading-relaxed text-muted">{p}</p>
            ))}
          </motion.div>

          <motion.ul {...fadeUp(0.18)} className="mt-7 flex flex-wrap gap-2">
            {profile.focus.map((f) => (
              <li key={f} className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3.5 py-1.5 text-xs font-medium text-text/80">
                <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-primary to-primary-2" />
                {f}
              </li>
            ))}
          </motion.ul>

          <motion.ul
            {...fadeUp(0.26)}
            className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2"
          >
            {infoRows.map(({ icon: Icon, label, value, href }) => {
              const content = (
                <>
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                    <Icon size={11} className="text-primary" /> {label}
                  </span>
                  <span className={`mt-1 block font-medium text-text [overflow-wrap:anywhere] ${value.length > 24 ? "text-[13px]" : "text-sm"}`}>
                    {value}
                  </span>
                </>
              );
              return (
                <li key={label} className="min-w-0 bg-bg">
                  {href ? (
                    <a href={href} title={value} className="group relative block px-5 py-4 transition-colors hover:bg-primary/[0.03]">
                      {content}
                      <FiArrowUpRight size={14} className="absolute right-4 top-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  ) : (
                    <div className="px-5 py-4">{content}</div>
                  )}
                </li>
              );
            })}
          </motion.ul>
        </div>
      </div>

      <motion.div
        {...fadeUp(0)}
        onPointerMove={trackSpotlight}
        className="spotlight mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border shadow-sm sm:grid-cols-4"
      >
        {stats.map((s, i) => (
          <Stat key={s.label} value={s.value} label={s.label} index={i} />
        ))}
      </motion.div>
    </Section>
  );
}
