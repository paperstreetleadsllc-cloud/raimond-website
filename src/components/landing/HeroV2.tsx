"use client";
import React from "react";
import HeroBackground from "./HeroBackground";
import { btnPrimary, btnSecondary } from "../../styles/buttons";

export function HeroV2() {
  return (
    <section className="relative py-24 md:py-28">
      <HeroBackground />
      <div className="mx-auto max-w-[1200px] px-6 md:px-8 grid md:grid-cols-[1.1fr_1fr] gap-12 items-center">
        {/* Left copy */}
        <div>
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
            AI Copilot for Traders
          </span>

          <h1 className="mt-5 text-[48px] md:text-[72px] leading-[0.92] tracking-[-0.02em] font-semibold text-white">
            Trade with
            <br className="hidden md:block" />
            discipline. Keep
            <br className="hidden md:block" />
            emotions out of
            <br className="hidden md:block" />
            the driver&apos;s seat.
          </h1>

          <p className="mt-5 max-w-[640px] text-[18px] md:text-[20px] text-white/70">
            RAimond watches order flow, tracks your rules, and blocks impulse
            decisions with real-time guardrails. Clarity when markets get loud.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
            <a
              href="/signup"
              className={btnPrimary}
              aria-label="Start Free Trial"
            >
              Start Free Trial
            </a>
            <a
              href="/demo"
              className={btnSecondary}
              aria-label="Watch 90-sec Demo"
            >
              Watch 90-sec Demo
            </a>
          </div>

          <ul className="mt-6 space-y-2 text-sm text-white/65">
            <li className="flex items-center gap-2">✓ CME data compatible</li>
            <li className="flex items-center gap-2">
              ✓ Broker & charting integrations
            </li>
            <li className="flex items-center gap-2">
              ✓ No credit card required for trial
            </li>
          </ul>
        </div>

        {/* Right HUD preview */}
        <div className="relative">
          <div className="rounded-[28px] border border-white/12 bg-white/5 backdrop-blur p-3 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
            <div className="relative rounded-2xl border border-white/10 h-[300px] md:h-[380px] flex flex-col items-center justify-center text-white/60 p-6">
              <div className="h-16 w-16 rounded-full border-2 border-white/50 flex items-center justify-center mb-4">
                <div className="h-10 w-10 rounded-full bg-brand-primary/30" />
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
    </section>
  );
}
