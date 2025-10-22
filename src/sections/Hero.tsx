import React, { useState } from "react";
import AnimatedBackground from "../shared/AnimatedBackground";
import BetaModal from "../shared/BetaModal";

export default function Hero() {
  const [open, setOpen] = useState(false);

  return (
    <section className="relative min-h-[82vh] flex items-center bg-hero-gradient overflow-hidden">
      <div className="absolute inset-0 bg-grid" />
      <AnimatedBackground />

      <div className="container relative z-10 grid grid-cols-12 gap-8 md:gap-10 py-24">
        <div className="col-span-12 lg:col-span-6 xl:col-span-5">
          <div className="eyebrow mb-4">Trading Infrastructure & AI</div>
          <h1 className="h1-hero max-w-[16ch]">
            RAimond — RAi: your AI trading partner
          </h1>
          <p className="p-hero mt-6">
            Institutional-grade infrastructure and an AI assistant that enforces
            discipline, logs trades, and gives real-time voice & HUD coaching — built
            for serious traders who want consistency.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a className="btn btn-lg btn-amber">See RAi Features</a>
            <button className="btn btn-lg btn-ghost" onClick={()=>setOpen(true)}>
              Join the beta
            </button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-6 xl:col-span-7 flex lg:justify-end">
          <div className="hud-card w-full max-w-[560px] h-[420px] md:h-[480px] lg:h-[520px]" />
        </div>
      </div>

      <BetaModal open={open} onClose={()=>setOpen(false)} />
    </section>
  );
}