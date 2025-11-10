import React from "react";

export function HeroCurrent() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8 text-center">
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
          AI Copilot for Traders
        </span>

        <h1 className="mt-6 text-4xl md:text-6xl font-bold text-white max-w-4xl mx-auto">
          Your AI trading copilot for discipline and clarity
        </h1>

        <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
          RAimond helps you follow your trading plan, enforce risk rules,
          and make better decisions with real-time insights.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/signup"
            className="rounded-xl px-8 py-4 font-semibold text-white bg-brand-primary hover:bg-brand-primary/90 transition-colors"
          >
            Start Free Trial
          </a>
          <a
            href="/demo"
            className="rounded-xl px-8 py-4 text-white/90 border border-white/15 bg-white/5 backdrop-blur hover:bg-white/10 transition-colors"
          >
            Watch Demo
          </a>
        </div>

        <ul className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-white/65">
          <li className="flex items-center gap-2">✓ No credit card required</li>
          <li className="flex items-center gap-2">✓ CME data compatible</li>
          <li className="flex items-center gap-2">✓ Full broker integrations</li>
        </ul>
      </div>
    </section>
  );
}
