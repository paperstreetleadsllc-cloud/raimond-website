import React from 'react';
import { btnPrimary, btnSecondary } from '../../styles/buttons';

/**
 * Hero V2: Big discipline headline + HUD preview card
 * Feature-flagged implementation with VITE_RAIMOND_HERO_V2
 */
export default function HeroV2() {
  return (
    <section className="section relative">
      {/* Background FX: Subtle teal orbs + faint grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* Right teal orb */}
        <div className="absolute right-[-12%] top-[-10%] h-[52vh] w-[52vh] rounded-full
          bg-[radial-gradient(ellipse_at_center,rgba(31,240,218,0.22),transparent_60%)]
          blur-3xl" />
        {/* Left teal orb */}
        <div className="absolute left-[8%] top-[30%] h-[36vh] w-[36vh] rounded-full
          bg-[radial-gradient(ellipse_at_center,rgba(31,240,218,0.12),transparent_60%)]
          blur-3xl" />
        {/* Faint grid overlay */}
        <div className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.10) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.10) 1px,transparent 1px)",
            backgroundSize: "48px 48px,48px 48px",
          }} />
      </div>

      <div className="container-xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Left: Big discipline headline */}
          <div>
            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 mb-5">
              AI Copilot for Traders
            </span>

            <h1 className="text-[48px] md:text-[72px] leading-[0.92] tracking-[-0.02em] font-semibold mb-5">
              Trade with<br className="hidden md:block" />
              discipline. Keep<br className="hidden md:block" />
              emotions out of<br className="hidden md:block" />
              the driver's seat.
            </h1>

            <p className="lede mb-6" style={{ maxWidth: '640px' }}>
              RAimond watches order flow, tracks your rules, and blocks impulse decisions with
              real-time guardrails. Clarity when markets get loud.
            </p>

            <div className="flex flex-wrap gap-4 mb-6">
              <a href="/signup" className={btnPrimary}>
                Start Free Trial
              </a>
              <a href="/demo" className={btnSecondary}>
                Watch 90-sec Demo
              </a>
            </div>

            <ul className="space-y-2 text-sm text-white/65">
              <li className="flex items-center gap-2">
                <span className="text-[#1FF0DA]">✓</span> CME data compatible
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#1FF0DA]">✓</span> Broker & charting integrations
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#1FF0DA]">✓</span> No credit card required for trial
              </li>
            </ul>
          </div>

          {/* Right: HUD preview card */}
          <div className="relative">
            <div className="rounded-[28px] border border-white/12 bg-white/5 backdrop-blur p-3 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
              <div className="relative rounded-2xl border border-white/10 h-[300px] lg:h-[380px] grid place-content-center text-center px-6">
                {/* Mock HUD icon */}
                <div className="mx-auto h-16 w-16 rounded-full border-2 border-white/50 grid place-content-center">
                  <div className="h-3 w-3 rounded-full bg-[#1FF0DA] shadow-[0_0_12px_rgba(31,240,218,0.8)]" />
                </div>

                <div className="mt-4 text-xl font-semibold text-white/90">
                  RAimond HUD Preview
                </div>

                <div className="text-sm text-white/60 mt-2 max-w-[280px] mx-auto">
                  Real-time order flow, discipline guardrails, and contextual coaching
                </div>

                {/* Subtle inner glow */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
