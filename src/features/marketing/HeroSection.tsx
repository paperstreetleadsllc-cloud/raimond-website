import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { NeuralBackground } from "./NeuralBackground";
import HeroVideo from "./HeroVideo";

type HeroSectionProps = {
  onPrimaryCta?: () => void;
  onSecondaryCta?: () => void;
};

const stats = [
  { label: "Order Accuracy", value: "98.3%" },
  { label: "Execution Speed", value: "<12ms" },
  { label: "Market Monitoring", value: "24/7" }
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0 }
};

export default function HeroSection({ onPrimaryCta, onSecondaryCta }: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="hero" className="relative overflow-hidden bg-[var(--night-900)] section-padding-lg">
      <NeuralBackground intensity="subtle" parallax />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/3 h-[520px] w-[520px] rounded-full bg-[var(--cyber-teal)]/12 blur-[140px]" />
        <div className="absolute -bottom-44 right-1/4 h-[420px] w-[420px] rounded-full bg-[#4a90e2]/14 blur-[140px]" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 lg:flex-row lg:items-center">
        <motion.div
          initial={fadeUp.hidden}
          whileInView={fadeUp.show}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="flex-1 space-y-8 text-white"
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.32em] text-white/60">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--cyber-teal)] shadow-[0_0_12px_rgba(31,240,218,0.65)]" />
            Neural-Execution Trading OS
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-5xl tracking-tight sm:text-6xl lg:text-[4.5rem] lg:leading-[1.05]">
              RAimond
            </h1>
            <p className="text-xl font-display text-white/80 sm:text-2xl">Your AI Trading Co-Pilot</p>
            <p className="max-w-2xl text-base text-white/70 sm:text-lg">
              Institutional-grade neural intelligence for independent traders. Discipline, execution, and real-time edge.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={onPrimaryCta}
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--cyber-teal)] px-8 py-3 text-base font-semibold text-[var(--deep-navy)] shadow-[0_18px_45px_rgba(31,240,218,0.35)] transition hover:bg-[#59f6e4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cyber-teal)]/65"
            >
              <span>Get Early Access</span>
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--deep-navy)]/90 text-[var(--cyber-teal)] transition group-hover:translate-x-0.5">
                →
              </span>
            </button>
            <button
              type="button"
              onClick={onSecondaryCta}
              className="inline-flex items-center gap-2 rounded-full border border-white/22 px-7 py-3 text-base font-semibold text-white/80 transition hover:border-white/35 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
            >
              Learn the RAi Method
            </button>
          </div>

          <div className="grid w-full max-w-xl grid-cols-1 gap-6 border-t border-white/12 pt-8 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              >
                <div className="text-3xl font-semibold text-[var(--cyber-teal)] font-display">{stat.value}</div>
                <div className="text-xs uppercase tracking-[0.32em] text-white/45">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.94, y: 24 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.8, ease: [0.34, 0.02, 0.2, 1] }}
          className="relative flex-1"
        >
          <div className="absolute -top-8 left-1/2 h-24 w-[340px] -translate-x-1/2 rounded-full bg-[var(--cyber-teal)]/20 blur-3xl" />
          <HeroVideo />

          {!prefersReducedMotion && (
            <>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-10 top-16 hidden rounded-lg border border-white/15 bg-white/[0.08] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--cyber-teal)] shadow-[0_20px_35px_rgba(31,240,218,0.2)] md:block"
              >
                Real-time Analysis
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                className="absolute -right-8 bottom-24 hidden rounded-lg border border-white/15 bg-white/[0.08] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--cyber-teal)] shadow-[0_20px_35px_rgba(31,240,218,0.2)] md:block"
              >
                AI-Powered Insights
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
