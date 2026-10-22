import { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import Section, { SectionHeading } from "./Section";
import { profile } from "../data/portfolioData";
import { sendContactMessage } from "../lib/api";

const initialForm = { name: "", email: "", phone: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
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
    { icon: <FiMapPin />, label: "Location", value: profile.location },
    { icon: <FiPhone />, label: "Phone", value: profile.phones.join(" / ") },
    { icon: <FiMail />, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  ];

  return (
    <Section id="contact">
      <SectionHeading
        eyebrow="Contact"
        title="Let's Build Something Together"
        subtitle="Have a project, an idea, or just want to say hi? My inbox is open."
      />

      <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="space-y-4 md:col-span-2"
        >
          {infoItems.map((item) => (
            <div key={item.label} className="glass flex items-center gap-4 rounded-2xl p-5">
              <span className="rounded-xl bg-gradient-to-br from-primary/20 to-primary-2/20 p-3 text-primary">
                {item.icon}
              </span>
              <div>
                <div className="text-xs text-muted">{item.label}</div>
                {item.href ? (
                  <a href={item.href} className="font-medium text-text hover:text-primary">
                    {item.value}
                  </a>
                ) : (
                  <div className="font-medium text-text">{item.value}</div>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="glass space-y-4 rounded-2xl p-6 md:col-span-3"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              required
              placeholder="Your Name"
              className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
              placeholder="Your Email"
              className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
            />
          </div>
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            placeholder="Phone Number (optional)"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
          />
          <textarea
            name="message"
            value={form.message}
            onChange={onChange}
            required
            rows={5}
            placeholder="Your Message"
            className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
          />

          <button
            type="submit"
            disabled={status === "sending"}
            className="btn-shine inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-2 px-6 py-3 text-sm font-semibold text-on-accent transition hover:opacity-90 disabled:opacity-60 sm:w-auto"
          >
            <FiSend />
            {status === "sending" ? "Sending..." : "Send Message"}
          </button>

          {status === "success" && (
            <p className="flex items-center gap-2 text-sm text-primary">
              <FiCheckCircle /> Thanks for reaching out! I'll get back to you soon.
            </p>
          )}
          {status === "error" && (
            <p className="flex items-center gap-2 text-sm text-red-400">
              <FiAlertCircle /> {error}
            </p>
          )}
        </motion.form>
      </div>
    </Section>
  );
}
