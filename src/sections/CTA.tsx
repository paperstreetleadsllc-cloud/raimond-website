import React from "react";

export default function CTA() {
  return (
    <section className="section section-pad text-center">
      <div className="card p-8 md:p-10 max-w-3xl mx-auto">
        <h3 className="text-white font-display text-3xl md:text-4xl tracking-[-0.02em]">
          Ready to trade with a calmer edge?
        </h3>
        <p className="text-slate-300 mt-3">
          Join the beta and help shape RAIMOND. We’ll reach out with next steps.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <a href="mailto:support@raimondai.com?subject=Join%20the%20RAImond%20Beta"
             className="px-5 py-2.5 rounded-lg bg-teal-300 text-slate-900 font-semibold hover:bg-teal-200 transition">
            Request access
          </a>
          <a href="mailto:support@raimondai.com"
             className="px-5 py-2.5 rounded-lg border border-slate-600 text-slate-100 hover:border-teal-300/60 hover:text-teal-200 transition">
            Talk to us
          </a>
        </div>
      </div>
    </section>
  );
}