import { useState } from "react";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import Section, { SectionHeading } from "./Section";
import { profile, stats } from "../data/portfolioData";
import useCountUp from "../hooks/useCountUp";

function Stat({ value, label }) {
  const [inView, setInView] = useState(false);
  const count = useCountUp(value, 1400, inView);
  return (
    <motion.div
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true }}
      className="glass rounded-2xl p-6 text-center"
    >
      <div className="text-3xl font-bold text-gradient sm:text-4xl">{count}+</div>
      <div className="mt-2 text-sm text-muted">{label}</div>
    </motion.div>
  );
}

export default function About() {
  const infoRows = [
    { icon: <FiUser />, label: "Name", value: profile.name },
    { icon: <FiMapPin />, label: "Location", value: profile.location },
    { icon: <FiPhone />, label: "Phone", value: profile.phones[0], href: `tel:${profile.phones[0]}` },
    { icon: <FiMail />, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  ];

  return (
    <Section id="about">
      <SectionHeading eyebrow="About Me" title="Who I Am" subtitle="A quick look at my background" />

      <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-2"
        >
          <div className="glass relative overflow-hidden rounded-3xl p-2">
            <img
              src={profile.aboutImage}
              alt="Profile"
              className="h-full w-full rounded-[1.4rem] object-cover"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-3"
        >
          {profile.about.map((p, i) => (
            <p key={i} className="mb-4 text-muted">
              {p}
            </p>
          ))}

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {infoRows.map((row) => (
              <div key={row.label} className="glass flex items-center gap-3 rounded-xl px-4 py-3">
                <span className="text-primary">{row.icon}</span>
                <div>
                  <div className="text-xs text-muted">{row.label}</div>
                  {row.href ? (
                    <a href={row.href} className="text-sm font-medium text-text hover:text-primary">
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

      <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Stat key={s.label} value={s.value} label={s.label} />
        ))}
      </div>
    </Section>
  );
}
