import { FiGithub, FiLinkedin, FiFacebook, FiTwitter, FiArrowUp } from "react-icons/fi";
import { profile } from "../data/portfolioData";

const socials = [
  { icon: FiGithub, href: profile.social.github },
  { icon: FiLinkedin, href: profile.social.linkedin },
  { icon: FiFacebook, href: profile.social.facebook },
  { icon: FiTwitter, href: profile.social.twitter },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-surface/40 pb-10 pt-16">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <div className="font-mono text-xl font-semibold text-gradient">&lt;Noor.dev/&gt;</div>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted">
          I am {profile.name}, a passionate engineering student dedicated to excellence —
          always pushing boundaries in competitive programming, software and embedded systems.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          {socials.map((s, i) => (
            <a
              key={i}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-border p-3 text-muted transition hover:border-primary hover:text-primary"
            >
              <s.icon />
            </a>
          ))}
        </div>

        <p className="mt-8 text-xs text-muted">
          © {new Date().getFullYear()} {profile.name}. All rights reserved.
        </p>
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="absolute right-6 -top-6 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary-2 text-bg shadow-lg transition hover:scale-110"
        aria-label="Back to top"
      >
        <FiArrowUp />
      </button>
    </footer>
  );
}
