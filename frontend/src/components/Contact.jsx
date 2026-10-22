import { lazy, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle, FiAlertCircle, FiClock } from "react-icons/fi";
import Section, { SectionHeading } from "./Section";
import Safe3D from "./three/Safe3D";
import { profile } from "../data/portfolioData";
import { sendContactMessage } from "../lib/api";
import { trackSpotlight } from "../lib/spotlight";

const ContactGlobe = lazy(() => import("./three/ContactGlobe"));

const natoreTime = () =>
  new Date().toLocaleTimeString("en-US", { timeZone: "Asia/Dhaka", hour: "numeric", minute: "2-digit" });

function LocalClock() {
  const [time, setTime] = useState(natoreTime);
  useEffect(() => {
    const id = setInterval(() => setTime(natoreTime()), 20000);
    return () => clearInterval(id);
  }, []);
  return <span className="tabular-nums">{time}</span>;
}

function StaticGlobe() {
  return (
    <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-[55%] sm:h-64 sm:w-64">
      <div className="absolute -inset-6 rounded-full bg-primary-2/20 blur-2xl" />
      <div className="relative h-full w-full overflow-hidden rounded-full border border-white/70 shadow-[inset_-20px_-30px_60px_rgba(79,70,229,0.25)]"
        style={{ background: "radial-gradient(circle at 35% 30%, #ffffff, #e0e7ff 45%, #c4b5fd 100%)" }}>
        <div className="absolute inset-0 animate-[marquee_40s_linear_infinite] opacity-70"
          style={{ backgroundImage: "radial-gradient(circle, #6366f1 1.2px, transparent 1.4px)", backgroundSize: "10px 10px", width: "200%" }} />
      </div>
    </div>
  );
}

function GlobeCard() {
  const ref = useRef(null);
  const nearView = useInView(ref, { once: true, margin: "300px" });
  const inView = useInView(ref, { margin: "100px" });
  return (
    <div ref={ref} className="relative mb-2 h-80 overflow-hidden rounded-3xl border border-border bg-[radial-gradient(ellipse_at_center,_#eef0ff_0%,_#fafafa_70%)]">
      <div className="absolute inset-0 bg-dots opacity-50" />
      {nearView && (
        <Safe3D fallback={<StaticGlobe />}>
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 -top-4">
            <ContactGlobe active={inView} />
          </motion.div>
        </Safe3D>
      )}
      {!nearView && <StaticGlobe />}

      <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/80 bg-white/85 px-3 py-1 text-[11px] font-semibold text-text shadow-sm">
        <FiClock size={11} className="text-primary" /> <LocalClock /> in Natore
      </div>
      <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl border border-white/80 bg-white/85 px-4 py-2.5 shadow-sm">
        <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-text">
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          </span>
          <span className="truncate"><span className="hidden sm:inline">Based in </span>{profile.location}</span>
        </div>
        <span className="flex-shrink-0 rounded-full bg-gradient-to-r from-primary to-primary-2 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Remote · Worldwide</span>
      </div>
    </div>
  );
}

const initialForm = { name: "", email: "", phone: "", message: "" };

const INFO_ICONS = {
  Location: { bg: "from-blue-500/15 to-cyan-500/15", text: "text-blue-500" },
  Phone: { bg: "from-green-500/15 to-emerald-500/15", text: "text-green-500" },
  Email: { bg: "from-primary/15 to-primary-2/15", text: "text-primary" },
};

const inputClass =
  "w-full rounded-xl border border-border bg-surface/60 px-4 py-3 text-base text-text outline-none transition-all placeholder:text-muted/60 focus:border-primary focus:bg-bg focus:ring-4 focus:ring-primary/10 sm:text-sm";

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await sendContactMessage(form);
      setStatus("success");
      setForm(initialForm);
    } catch (err) {
      setStatus("error");
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  const infoItems = [
    { icon: <FiMapPin size={18} />, label: "Location", value: profile.location },
    { icon: <FiPhone size={18} />, label: "Phone", value: profile.phones.join(" / ") },
    { icon: <FiMail size={18} />, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  ];

  return (
    <Section id="contact">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <SectionHeading
        eyebrow="Contact"
        title="Let's Build Something Together"
        subtitle="Have a project, an idea, or just want to say hi? My inbox is open."
      />

      <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="min-w-0 space-y-4 md:col-span-2"
        >
          <GlobeCard />
          <p className="text-sm text-muted leading-relaxed mb-6">
            Whether you have a question, a project idea, or want to collaborate — don't hesitate to reach out. I reply within 24 hours.
          </p>

          {infoItems.map((item) => {
            const style = INFO_ICONS[item.label];
            return (
              <div
                key={item.label}
                onPointerMove={trackSpotlight}
                className="spotlight group flex items-center gap-4 rounded-2xl border border-border bg-bg p-5 transition-[box-shadow,border-color] duration-300 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/8"
              >
                <span className={`rounded-2xl bg-gradient-to-br ${style.bg} p-3.5 ${style.text} transition-transform group-hover:scale-110`}>
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted">{item.label}</div>
                  {item.href ? (
                    <a href={item.href} className="break-all font-medium text-text hover:text-primary transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <div className="font-medium text-text">{item.value}</div>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-w-0 overflow-hidden rounded-2xl border border-border bg-bg p-5 space-y-4 sm:p-8 md:col-span-3 md:self-start"
        >
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-primary to-primary-2" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input name="name" value={form.name} onChange={onChange} required placeholder="Your Name" className={inputClass} />
            <input type="email" name="email" value={form.email} onChange={onChange} required placeholder="Your Email" className={inputClass} />
          </div>
          <input name="phone" value={form.phone} onChange={onChange} placeholder="Phone Number (optional)" className={inputClass} />
          <textarea
            name="message" value={form.message} onChange={onChange} required rows={5}
            placeholder="Your Message"
            className={`${inputClass} resize-none`}
          />

          <button
            type="submit"
            disabled={status === "sending"}
            className="btn-shine inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-2 px-6 py-3.5 text-sm font-semibold text-on-accent shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:shadow-xl hover:scale-[1.02] disabled:opacity-60 sm:w-auto"
          >
            <FiSend size={15} />
            {status === "sending" ? "Sending…" : "Send Message"}
          </button>

          {status === "success" && (
            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm font-medium text-green-600"
            >
              <FiCheckCircle /> Thanks for reaching out! I'll get back to you soon.
            </motion.p>
          )}
          {status === "error" && (
            <motion.p
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-red-500"
            >
              <FiAlertCircle /> {error}
            </motion.p>
          )}
        </motion.form>
      </div>
    </Section>
  );
}
