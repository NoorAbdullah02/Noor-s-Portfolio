import { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import Section, { SectionHeading } from "./Section";
import { profile } from "../data/portfolioData";
import { sendContactMessage } from "../lib/api";

const initialForm = { name: "", email: "", phone: "", message: "" };

const INFO_ICONS = {
  Location: { bg: "from-blue-500/15 to-cyan-500/15", text: "text-blue-500" },
  Phone: { bg: "from-green-500/15 to-emerald-500/15", text: "text-green-500" },
  Email: { bg: "from-primary/15 to-primary-2/15", text: "text-primary" },
};

const inputClass =
  "w-full rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm text-text outline-none transition-all placeholder:text-muted/60 focus:border-primary focus:bg-bg focus:ring-3 focus:ring-primary/10";

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
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <SectionHeading
        eyebrow="Contact"
        title="Let's Build Something Together"
        subtitle="Have a project, an idea, or just want to say hi? My inbox is open."
      />

      <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
        {/* Info column */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4 md:col-span-2"
        >
          <p className="text-sm text-muted leading-relaxed mb-6">
            Whether you have a question, a project idea, or want to collaborate — don't hesitate to reach out. I reply within 24 hours.
          </p>

          {infoItems.map((item) => {
            const style = INFO_ICONS[item.label];
            return (
              <div
                key={item.label}
                className="group flex items-center gap-4 rounded-2xl border border-border bg-bg p-5 transition-all hover:border-primary/25 hover:shadow-lg hover:shadow-primary/8"
              >
                <span className={`rounded-2xl bg-gradient-to-br ${style.bg} p-3.5 ${style.text} transition-transform group-hover:scale-110`}>
                  {item.icon}
                </span>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted">{item.label}</div>
                  {item.href ? (
                    <a href={item.href} className="font-medium text-text hover:text-primary transition-colors">
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

        {/* Form */}
        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl border border-border bg-bg p-8 space-y-4 md:col-span-3"
        >
          {/* Top gradient line */}
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
