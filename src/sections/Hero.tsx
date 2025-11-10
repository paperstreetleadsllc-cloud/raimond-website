import React from "react";
import AnimatedBackground from "../shared/AnimatedBackground";
import BetaModal from "../shared/BetaModal";
import useReveal from "../hooks/useReveal";
import { btnPrimary, btnSecondary } from "../styles/buttons";

export default function Hero() {
  useReveal();
  const [openModal, setOpenModal] = React.useState(false);

  return (
    <section className="relative w-full overflow-hidden reveal">
      <div className="section section-pad grid gap-10 lg:grid-cols-12 items-center">
        <div className="lg:col-span-6 text-left">
          <span className="inline-flex items-center gap-2 text-teal-300/90 text-xs uppercase tracking-[.18em] mb-4">
            AI Copilot for Traders
          </span>

          <h1 className="font-display text-white tracking-[-0.02em] leading-[0.92] text-[48px] md:text-[56px] lg:text-[72px]">
            Trade with
            <br className="hidden md:block" />
            discipline. Keep
            <br className="hidden md:block" />
            emotions out of
            <br className="hidden md:block" />
            the driver&apos;s seat.
          </h1>

          <p className="prose-intro text-slate-300 mt-5 max-w-[640px]">
            RAimond watches order flow, tracks your rules, and blocks impulse
            decisions with real-time guardrails. Clarity when markets get loud.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setOpenModal(true)}
              className={btnPrimary}
            >
              Start Free Trial
            </button>

            <a
              href="/demo"
              className={btnSecondary}
            >
              Watch 90-sec Demo
            </a>
          </div>

          <ul className="mt-6 space-y-2 text-sm text-slate-400">
            <li className="flex items-center gap-2">✓ CME data compatible</li>
            <li className="flex items-center gap-2">✓ Broker & charting integrations</li>
            <li className="flex items-center gap-2">✓ No credit card required for trial</li>
          </ul>
        </div>

        {/* HUD preview card */}
        <div className="lg:col-span-6">
          <div className="relative">
            <div className="rounded-[28px] border border-white/12 bg-white/5 backdrop-blur p-3 shadow-[0_20px_60px_rgba(0,0,0,0.55)] mx-auto max-w-[520px]">
              <div className="relative rounded-2xl border border-white/10 h-[300px] lg:h-[380px] flex flex-col items-center justify-center text-white/60 p-6">
                <div className="h-16 w-16 rounded-full border-2 border-white/50 flex items-center justify-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-teal-300/30" />
                </div>
                <div className="text-xl font-semibold text-white/90">
                  RAimond HUD Preview
                </div>
                <div className="text-sm text-white/60 mt-2 text-center max-w-xs">
                  Real-time order flow, discipline guardrails, and contextual
                  coaching
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5" />
              </div>
            </div>
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
