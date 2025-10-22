import React from "react";
import AnimatedBackground from "../shared/AnimatedBackground";

export default function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center bg-hero-gradient overflow-hidden">
      {/* dotted grid overlay */}
      <div className="absolute inset-0 bg-grid" />

      {/* animated “pins” wave */}
      <AnimatedBackground />

      <div className="container relative z-10 grid grid-cols-12 gap-8 md:gap-10 py-24">
        <div className="col-span-12 lg:col-span-6 xl:col-span-5">
          <h1 className="h1-hero max-w-[18ch]">
            RAimond — RAi: your AI trading partner
          </h1>
          <p className="p-hero mt-5 max-w-[60ch]">
            Institutional-grade infrastructure and an AI assistant that enforces
            discipline, logs trades, and gives real-time voice & HUD coaching —
            built for serious traders who want consistency.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a className="btn btn-amber">See RAi Features</a>
            <a className="btn btn-ghost">Join the beta</a>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 xl:col-span-7 flex lg:justify-end">
          <div className="hud-card w-full max-w-[520px] h-[360px] md:h-[420px] lg:h-[460px] shadow-glass shadow-inner-glow" />
        </div>
      </div>
    </section>
  );
}