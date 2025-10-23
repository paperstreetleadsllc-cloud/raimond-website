import React from "react";
import BetaModal from "../shared/BetaModal";

export default function Hero() {
  const [openModal, setOpenModal] = React.useState(false);

  return (
    <section className="relative min-h-[86vh] flex items-center bg-hero-gradient bg-hero-vignette">
      {/* animated background layer could be here if you use it */}
      <div className="section relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center py-24">
        <div className="lg:col-span-7 text-center lg:text-left">
          <h1 className="text-white font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-[-0.02em]">
            Meet <span className="text-teal-300">RAImond</span> — your accountability co-pilot
          </h1>
          <p className="mt-6 text-slate-300 text-lg md:text-xl max-w-2xl mx-auto lg:mx-0">
            RAI watches over your plan in real time, coaches discipline, flags over-confidence & revenge trading,
            and learns your edge to help you trade like the house.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <button
              onClick={() => setOpenModal(true)}
              className="px-5 py-3 rounded-lg font-semibold text-slate-900 bg-gradient-to-r from-teal-300 to-emerald-400 hover:from-teal-200 hover:to-emerald-300 transition-all"
            >
              Join the Beta
            </button>
            <a
              href="mailto:support@raimondai.com?subject=RAImond%20—%20Questions"
              className="px-5 py-3 rounded-lg font-semibold border border-slate-600 text-slate-200 hover:bg-slate-800/60 transition-all text-center"
            >
              Contact Us
            </a>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="hud-card w-full max-w-[520px] h-[340px] lg:h-[380px] mx-auto"></div>
        </div>
      </div>

      <BetaModal open={openModal} onClose={() => setOpenModal(false)} />
    </section>
  );
}