import { motion } from "framer-motion";
import { FiGithub, FiExternalLink, FiArrowUpRight, FiActivity, FiBarChart2, FiShield } from "react-icons/fi";
import Section, { SectionHeading } from "./Section";
import { featuredProjects, profile } from "../data/portfolioData";
import { trackSpotlight } from "../lib/spotlight";

const PROJECT_ICONS = { activity: FiActivity, chart: FiBarChart2, shield: FiShield };

function ProjectCover({ project }) {
  if (project.image) {
    return (
      <>
        <img
          src={project.image}
          alt={project.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary-2/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </>
    );
  }
  const Icon = PROJECT_ICONS[project.icon] || FiActivity;
  const [c1, c2] = project.color || ["#4f46e5", "#9333ea"];
  return (
    <div className="relative flex h-full w-full items-center justify-center" style={{ background: `linear-gradient(135deg, ${c1}22, ${c2}33)` }}>
      <div className="absolute inset-0 bg-dots opacity-40" />
      <div
        className="relative flex h-16 w-16 items-center justify-center rounded-2xl text-white transition-transform duration-500 group-hover:scale-110"
        style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: `0 12px 28px -10px ${c1}99` }}
      >
        <Icon size={26} />
      </div>
    </div>
  );
}

export default function FeaturedProjects() {
  return (
    <Section id="projects">
      <SectionHeading
        eyebrow="Portfolio"
        title="Featured Projects"
        subtitle="A few things I've built and shipped"
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {featuredProjects.map((project, i) => (
          <motion.article
            key={project.title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            onPointerMove={trackSpotlight}
            className="spotlight group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-bg transition-[box-shadow,transform,border-color] duration-300 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
          >
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-primary to-primary-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="absolute top-3 right-4 font-mono text-7xl font-black select-none leading-none text-text/[0.04] group-hover:text-text/[0.07] transition-all duration-300 pointer-events-none">
              {String(i + 1).padStart(2, "0")}
            </div>

            <div className="relative h-48 overflow-hidden">
              <ProjectCover project={project} />
            </div>

            <div className="flex flex-1 flex-col p-6">
              <h3 className="font-bold text-text text-base group-hover:text-primary transition-colors duration-200">
                {project.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted leading-relaxed">{project.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-surface/60 px-3 py-0.5 font-mono text-[10px] font-medium text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-4 pt-4 border-t border-border/50">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary transition-colors"
                  >
                    <FiGithub size={15} /> Code
                  </a>
                )}
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary transition-colors"
                  >
                    <FiExternalLink size={15} /> Live Demo
                  </a>
                )}
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <FiArrowUpRight size={18} className="text-primary" />
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-12 flex justify-center"
      >
        <a
          href={profile.social.github}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-white/80 px-6 py-3 text-sm font-semibold text-text shadow-sm transition-colors hover:border-text/30"
        >
          <FiGithub size={16} />
          Explore all projects on GitHub
          <FiArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </motion.div>
    </Section>
  );
}
