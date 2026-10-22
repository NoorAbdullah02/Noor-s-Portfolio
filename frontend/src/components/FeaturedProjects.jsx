import { motion } from "framer-motion";
import { FiGithub, FiExternalLink } from "react-icons/fi";
import Section, { SectionHeading } from "./Section";
import TiltCard from "./TiltCard";
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
          <motion.div
            key={project.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <TiltCard className="glass group flex flex-col overflow-hidden rounded-2xl transition-shadow hover:shadow-xl hover:shadow-primary/10">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-semibold text-text">{project.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted">{project.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border px-3 py-1 font-mono text-xs text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-4">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-text hover:text-primary"
                    >
                      <FiGithub /> Code
                    </a>
                  )}
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-text hover:text-primary"
                    >
                      <FiExternalLink /> Live Demo
                    </a>
                  )}
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
