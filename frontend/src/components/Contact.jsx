import { lazy, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle, FiAlertCircle, FiClock } from "react-icons/fi";
import Section, { SectionHeading } from "./Section";
import Safe3D from "./three/Safe3D";
import { profile } from "../data/portfolioData";
import { sendContactMessage } from "../lib/api";

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

const inputClass =
  "mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-text outline-none transition-all placeholder:text-muted/50 focus:border-primary focus:ring-4 focus:ring-primary/10 sm:text-sm";
const labelClass = "text-[11px] font-semibold uppercase tracking-[0.12em] text-text/70";

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
    { icon: <FiMail size={17} />, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
    { icon: <FiPhone size={17} />, label: "Phone", value: profile.phones.join(" / "), href: `tel:${profile.phones[0]}` },
    { icon: <FiMapPin size={17} />, label: "Location", value: profile.location },
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
          <p className="mb-2 text-sm leading-relaxed text-muted">
            Whether you have a question, a project idea, or want to collaborate — don't hesitate to reach out. I reply within 24 hours.
          </p>

          <ul className="overflow-hidden rounded-3xl border border-border bg-white/80 shadow-sm">
            {infoItems.map((item) => (
              <li key={item.label} className="border-b border-border/70 last:border-0">
                {(() => {
                  const inner = (
                    <>
                      <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-surface text-text/70 transition-colors group-hover:bg-text group-hover:text-white">
                        {item.icon}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">{item.label}</span>
                        <span className="block font-medium text-text [overflow-wrap:anywhere]">{item.value}</span>
                      </span>
                    </>
                  );
                  return item.href ? (
                    <a href={item.href} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-primary/[0.03]">{inner}</a>
                  ) : (
                    <div className="group flex items-center gap-4 px-5 py-4">{inner}</div>
                  );
                })()}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-w-0 space-y-5 rounded-3xl border border-border bg-white/80 p-5 shadow-sm sm:p-8 md:col-span-3 md:self-start"
        >
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-text">Send a message</h3>
            <p className="mt-1 text-left text-sm text-muted">It goes straight to my inbox — I usually reply within a day.</p>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Name</span>
              <input name="name" value={form.name} onChange={onChange} required autoComplete="name" placeholder="Your full name" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>Email</span>
              <input type="email" name="email" value={form.email} onChange={onChange} required autoComplete="email" placeholder="you@example.com" className={inputClass} />
            </label>
          </div>
          <label className="block">
            <span className={labelClass}>Phone <span className="font-normal normal-case tracking-normal text-muted/70">(optional)</span></span>
            <input name="phone" value={form.phone} onChange={onChange} autoComplete="tel" placeholder="+880 …" className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>Message</span>
            <textarea
              name="message" value={form.message} onChange={onChange} required rows={5}
              placeholder="Tell me about your project, idea or question…"
              className={`${inputClass} resize-none`}
            />
          </label>

          <button
            type="submit"
            disabled={status === "sending"}
            className="btn-shine group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-text px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-text/15 transition-shadow hover:shadow-primary/30 disabled:opacity-60 sm:w-auto"
          >
            {status === "sending" ? "Sending…" : "Send message"}
            <FiSend size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
