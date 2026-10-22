import { motion } from "framer-motion";
import { FiGithub, FiExternalLink, FiArrowUpRight } from "react-icons/fi";
import Section, { SectionHeading } from "./Section";
import { featuredProjects } from "../data/portfolioData";

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
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-bg transition-all duration-300 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1"
          >
            {/* Top gradient line that appears on hover */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-primary to-primary-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Large background number */}
            <div className="absolute top-3 right-4 font-mono text-7xl font-black select-none leading-none text-text/[0.04] group-hover:text-text/[0.07] transition-all duration-300 pointer-events-none">
              {String(i + 1).padStart(2, "0")}
            </div>

            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={project.image}
                alt={project.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary-2/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-6">
              <h3 className="font-bold text-text text-base group-hover:text-primary transition-colors duration-200">
                {project.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted leading-relaxed">{project.description}</p>

              {/* Tags */}
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

              {/* Links */}
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
    </Section>
  );
}
