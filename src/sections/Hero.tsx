import React from "react";
import AnimatedBackground from "../shared/AnimatedBackground";

export default function Hero() {
  return (
    <section className="relative min-h-[86vh] flex items-center bg-hero-gradient bg-hero-vignette">
      <AnimatedBackground />

      {/* Container */}
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center py-20 md:py-28">
          {/* Left copy */}
          <div className="lg:col-span-6">
            <h1 className="text-white font-display text-[44px] leading-[1.0] md:text-6xl lg:text-7xl max-w-[18ch] tracking-[-0.02em]">
              Meet <span className="text-teal-300">RAImond</span> &mdash; your accountability co-pilot
            </h1>
            <p className="mt-6 text-slate-300/90 max-w-xl leading-relaxed">RAImond quietly observes your trading sessions — learning your unique habits, helping you recognize emotional shifts, and reinforcing consistency when it matters most. It identifies inefficiencies, highlights opportunities for discipline, and offers subtle, real-time guidance so you can trade with focus, composure, and control.</p>
            <div className="mt-7 flex gap-3">
              <a className="px-4 py-2 rounded-md bg-brand-amber text-slate-900 font-medium hover:brightness-110">See capabilities</a>
              <a className="px-4 py-2 rounded-md border border-slate-600/60 text-slate-200 hover:bg-white/5">Join the beta</a>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-white/5 text-slate-300/90 text-sm">Live voice nudges</span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-slate-300/90 text-sm">Daily lockouts & cooldowns</span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-slate-300/90 text-sm">Journal + analytics</span>
            </div>
          </div>

          {/* Right HUD preview */}
          <div className="lg:col-span-6 lg:flex lg:justify-end">
            <div className="hud-card w-full max-w-[520px] h-[340px] md:h-[400px] lg:h-[440px] rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}