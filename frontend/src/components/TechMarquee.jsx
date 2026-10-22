import { SiC, SiCplusplus, SiPython, SiLinux, SiGit, SiArduino } from "react-icons/si";
import { FaJava, FaReact, FaGithub, FaShieldHalved, FaMicrochip } from "react-icons/fa6";

const stack = [
  { icon: SiCplusplus, label: "C++" },
  { icon: SiC, label: "C" },
  { icon: SiPython, label: "Python" },
  { icon: FaJava, label: "Java" },
  { icon: FaReact, label: "React" },
  { icon: SiLinux, label: "Linux" },
  { icon: FaShieldHalved, label: "Cyber Security" },
  { icon: FaMicrochip, label: "Embedded / IoT" },
  { icon: SiArduino, label: "Arduino" },
  { icon: SiGit, label: "Git" },
  { icon: FaGithub, label: "GitHub" },
];

function Track() {
  return (
    <div className="flex shrink-0 items-center gap-12 pr-12">
      {stack.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-2.5 text-muted">
          <Icon className="text-xl text-primary/70" />
          <span className="whitespace-nowrap font-mono text-sm">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function TechMarquee() {
  return (
    <div className="relative border-y border-border bg-surface/60 py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface to-transparent" />
      <div className="flex w-max animate-marquee">
        <Track />
        <Track />
      </div>
    </div>
  );
}
