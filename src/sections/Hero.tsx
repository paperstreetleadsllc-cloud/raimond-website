import React from "react";`nimport useReveal from "../hooks/useReveal";
import AnimatedBackground from "../shared/AnimatedBackground";
import BetaModal from "../shared/BetaModal";

export default function Hero() {`n  useReveal();
  const [openModal, setOpenModal] = React.useState(false);

  return (
    <section className="reveal" className="relative w-full overflow-hidden">
      <div className="section section-pad grid gap-10 lg:grid-cols-12 items-center">
        <div className="lg:col-span-6 text-left">
          <span className="inline-flex items-center gap-2 text-teal-300/90 text-xs uppercase tracking-[.18em] mb-4">
            Adaptive Trading Assistant
          </span>

          <h1 className="font-display text-white tracking-[-0.03em] leading-[0.95] text-[40px] md:text-[56px] lg:text-[64px]">
            Meet <span className="text-teal-300">RAIMOND</span> â€” your
            <br className="hidden md:block" /> accountability&nbsp;co-pilot
          </h1>

          <p className="prose-intro text-slate-300 mt-5">
            RAI watches over your plan in real time, coaches discipline, flags over-confidence
            &amp; revenge trading, and learns your edge to help you trade like the house.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setOpenModal(true)}
              className="px-5 py-2.5 rounded-lg bg-teal-300 text-slate-900 font-semibold hover:bg-teal-200 transition"
            >
              Join the Beta
            </button>

            <a
              href="mailto:support@raimondai.com?subject=RAImond%20Inquiry"
              className="px-5 py-2.5 rounded-lg border border-slate-600 text-slate-100 hover:border-teal-300/60 hover:text-teal-200 transition"
            >
              Contact Us
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-[12px] text-slate-400">
            <span className="badge">Live voice nudges</span>
            <span className="badge">Daily lockouts &amp; cooldowns</span>
            <span className="badge">Journal + analytics</span>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="relative hud-card w-full max-w-[520px] h-[340px] lg:h-[380px] mx-auto">
            {/* Subtle orbital overlay */}
            <svg viewBox="0 0 520 380" className="absolute inset-0 opacity-[0.65]">
              <defs>
                <radialGradient id="orb" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="rgba(32,242,217,.35)" />
                  <stop offset="100%" stopColor="rgba(11,193,174,0)" />
                </radialGradient>
              </defs>
              <circle cx="260" cy="190" r="140" fill="url(#orb)" />
              <g fill="none" stroke="rgba(148,163,184,.25)">
                <ellipse cx="260" cy="190" rx="190" ry="110" />
                <ellipse cx="260" cy="190" rx="150" ry="86" transform="rotate(18 260 190)" />
                <ellipse cx="260" cy="190" rx="110" ry="64" transform="rotate(-12 260 190)" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* Soft dotted-grid / wave */}
      <div className="absolute inset-0 -z-10 bg-hero-gradient bg-hero-vignette" />
      <AnimatedBackground className="-z-10" />

      <BetaModal open={openModal} onClose={() => setOpenModal(false)} />
    </section>
  );
}