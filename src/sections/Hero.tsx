import React from "react";
import AnimatedBackground from "../shared/AnimatedBackground";

export default function Hero() {
  return (
    <section className="relative min-h-[72vh] flex items-center">
      <div className="absolute inset-0 bg-hero-gradient"></div>
      <AnimatedBackground />

      <div className="section relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-24">
        <div className="lg:col-span-6">
          <h1 className="text-white font-display text-4xl md:text-5xl lg:text-6xl leading-tight max-w-2xl">
            RAimond — RAi: your AI trading partner
          </h1>
          <p className="mt-6 text-slate-300 max-w-xl">
            Institutional-grade infrastructure and an AI assistant that enforces discipline,
            logs trades, and gives real-time voice & HUD coaching — built for serious traders
            who want consistency.
          </p>
          <div className="mt-6 flex gap-3">
            <a className="px-4 py-2 rounded-md bg-brand-amber text-slate-900 font-medium">See RAi Features</a>
            <a className="px-4 py-2 rounded-md border border-slate-600 text-slate-200">Join the beta</a>
          </div>
        </div>

        <div className="lg:col-span-6 lg:flex lg:justify-end">
          <div className="hud-card w-full max-w-[420px] h-[300px] lg:h-[360px]"></div>
        </div>
      </div>
    </section>
  );
}