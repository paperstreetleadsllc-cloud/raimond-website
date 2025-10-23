import React from "react";

export default function HowItLearns(){
  return (
    <section className="relative section-pad">
      <div className="container">
        <div className="mb-10">
          <div className="chip mb-3"><span className="chip-dot" /> Adaptive model</div>
          <h2 className="text-3xl md:text-4xl font-semibold text-white">How RAimond learns you</h2>
          <p className="mt-3 text-slate-300 max-w-[65ch]">Every trader has a pattern. RAImond learns yours — the pace, time of day, emotional cycles, and execution habits that define your edge. It builds a personal performance profile, then delivers insight-driven prompts and structure designed to refine your process, one decision at a time.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="card">
            <h4>Edge profiling</h4>
            <p>Maps your win-rate by context (trend, volatility, session span) to surface “trade in your lane” guidance.</p>
          </div>
          <div className="card">
            <h4>Discipline engine</h4>
            <p>Daily limits, soft lockouts, and escalation rules—enforced by voice and the HUD panel.</p>
          </div>
          <div className="card">
            <h4>Reminders that land</h4>
            <p>Contextual nudges triggered by drawdown, streaks, and time decay (not just timers).</p>
          </div>
          <div className="card">
            <h4>Journal that writes itself</h4>
            <p>Auto-tagged entries with reasoning templates, quick voice notes, and end-of-day synthesis.</p>
          </div>
          <div className="card">
            <h4>Backtest + live blend</h4>
            <p>Combines historical patterns with your live execution to recommend realistic improvements.</p>
          </div>
          <div className="card">
            <h4>Broker + tools</h4>
            <p>Integrations: Topstep, Sierra Chart, Bookmap and more to sync trades and telemetry.</p>
          </div>
        </div>
      </div>
    </section>
  );
}